import os
os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "1"
os.environ['DISABLE_TELEMETRY'] = 'YES'

import sys
import modal
import json
import yaml
import boto3
import io
import time
import logging
import asyncio
import random
from PIL import Image
from typing import Dict, Any, Callable, Optional
from fastapi import HTTPException, Request
from pydantic import BaseModel, Field
import sentry_sdk
from sentry_sdk.integrations.logging import LoggingIntegration
import httpx
import hmac
import hashlib
from functools import wraps
from botocore.exceptions import ClientError, BotoCoreError
from supabase import create_client, Client

# Add ai-toolkit to path
sys.path.insert(0, "/root/ai-toolkit")

# =============================================================================
# Model Caching Setup (ComfyUI Pattern)
# =============================================================================
CACHE_DIR = "/cache"

# Create persistent volume for HuggingFace model cache
model_cache_volume = modal.Volume.from_name("lora-trainer-2", create_if_missing=True)

def get_cache_size(cache_dir):
    """Get cache directory size in GB."""
    import os
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(cache_dir):
        for filename in filenames:
            filepath = os.path.join(dirpath, filename)
            if os.path.isfile(filepath):
                total_size += os.path.getsize(filepath)
    return total_size / (1024**3)

# Function will be defined after app creation

# Optimized image with model pre-caching
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("git", "libgl1", "libglib2.0-0", "unzip", "wget", "curl")
    .pip_install("torch", "torchvision", "torchaudio", extra_options="--index-url https://download.pytorch.org/whl/cu121")
    .pip_install("fastapi[standard]", "boto3", "requests", "httpx")
    .pip_install("sentry-sdk[fastapi]")
    .env({
        "HF_HUB_ENABLE_HF_TRANSFER": "1",
        "HF_HOME": "/cache",
        "TRANSFORMERS_CACHE": "/cache",
        "NO_ALBUMENTATIONS_UPDATE": "1"  # Disable update checks
    })
    .run_commands(
        "cd /root && git clone https://github.com/ostris/ai-toolkit.git",
        "cd /root/ai-toolkit && pip install -r requirements.txt"
    )
)

# Initialize Sentry for error monitoring
def init_sentry():
    """Initialize Sentry SDK for error monitoring."""
    sentry_dsn = os.environ.get('SENTRY_DSN')
    if sentry_dsn:
        sentry_logging = LoggingIntegration(
            level=logging.INFO,
            event_level=logging.ERROR
        )
        
        sentry_sdk.init(
            dsn=sentry_dsn,
            integrations=[sentry_logging],
            traces_sample_rate=0.1,
            environment=os.environ.get('ENVIRONMENT', 'production'),
            release=os.environ.get('RELEASE', 'unknown')
        )
        logging.info("Sentry initialized for error monitoring")
    else:
        logging.warning("SENTRY_DSN not found, skipping Sentry initialization")

# Create the Modal app with model cache
app = modal.App(name="lora-trainer-2", image=image)

# Request/Response models
class TrainingRequest(BaseModel):
    object_key: str = Field(..., description="R2 object key containing images and focus_data.json")
    gender: str = Field(..., description="Gender for caption generation (man/woman)")
    user_id: str = Field(..., description="User identifier")
    plan: str = Field(..., description="User plan")
    studio_id: str = Field(..., description="Studio identifier")
    steps: int = Field(default=3000, description="Number of training steps")
    trigger_word: str = Field(default="ohwx", description="Trigger word for training")
    webhook_url: str = Field(default="", description="Webhook URL to call when training completes")

# Retry decorator with exponential backoff
def retry_with_backoff(
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    exponential_base: float = 2.0,
    jitter: bool = True,
    exceptions: tuple = (Exception,)
):
    """Decorator for retrying functions with exponential backoff."""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            logger = logging.getLogger(__name__)
            
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    if attempt == max_retries:
                        logger.error(f"Function {func.__name__} failed after {max_retries + 1} attempts: {str(e)}")
                        sentry_sdk.capture_exception(e)
                        raise
                    
                    # Calculate delay with exponential backoff
                    delay = min(base_delay * (exponential_base ** attempt), max_delay)
                    if jitter:
                        delay *= (0.5 + random.random() * 0.5)  # Add jitter
                    
                    logger.warning(f"Function {func.__name__} failed (attempt {attempt + 1}/{max_retries + 1}), retrying in {delay:.2f}s: {str(e)}")
                    time.sleep(delay)
            
            return None
        return wrapper
    return decorator

# Async retry decorator
def async_retry_with_backoff(
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    exponential_base: float = 2.0,
    jitter: bool = True,
    exceptions: tuple = (Exception,)
):
    """Async decorator for retrying functions with exponential backoff."""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            logger = logging.getLogger(__name__)
            
            for attempt in range(max_retries + 1):
                try:
                    return await func(*args, **kwargs)
                except exceptions as e:
                    if attempt == max_retries:
                        logger.error(f"Async function {func.__name__} failed after {max_retries + 1} attempts: {str(e)}")
                        sentry_sdk.capture_exception(e)
                        raise
                    
                    # Calculate delay with exponential backoff
                    delay = min(base_delay * (exponential_base ** attempt), max_delay)
                    if jitter:
                        delay *= (0.5 + random.random() * 0.5)  # Add jitter
                    
                    logger.warning(f"Async function {func.__name__} failed (attempt {attempt + 1}/{max_retries + 1}), retrying in {delay:.2f}s: {str(e)}")
                    await asyncio.sleep(delay)
            
            return None
        return wrapper
    return decorator

@retry_with_backoff(
    max_retries=3,
    base_delay=1.0,
    exceptions=(ClientError, BotoCoreError, Exception)
)
def get_s3_client():
    """Initialize S3 client for R2 storage with retry logic."""
    account_id = os.environ.get('R2_ACCOUNT_ID')
    if not account_id:
        raise ValueError("R2_ACCOUNT_ID environment variable is required")
    
    endpoint_url = f'https://{account_id}.r2.cloudflarestorage.com'
    
    # Validate required credentials
    access_key = os.environ.get('R2_ACCESS_KEY_ID')
    secret_key = os.environ.get('R2_SECRET_ACCESS_KEY')
    
    if not access_key or not secret_key:
        raise ValueError("R2 credentials (R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY) are required")
    
    return boto3.client(
        's3',
        endpoint_url=endpoint_url,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name='auto'
    )

def calculate_crop_box(crop_info: Dict[str, Any], image_size: tuple) -> tuple:
    """Calculate crop box coordinates from focus_data.json format."""
    width, height = image_size
    
    x_percent = crop_info.get('x', 0)
    y_percent = crop_info.get('y', 0)
    width_percent = crop_info.get('width', 100)
    height_percent = crop_info.get('height', 100)
    
    left = int((x_percent / 100) * width)
    top = int((y_percent / 100) * height)
    right = int(((x_percent + width_percent) / 100) * width)
    bottom = int(((y_percent + height_percent) / 100) * height)
    
    return (left, top, right, bottom)

@retry_with_backoff(
    max_retries=5,
    base_delay=2.0,
    exceptions=(ClientError, BotoCoreError, json.JSONDecodeError, Exception)
)
def download_focus_data(s3_client, datasets_bucket: str, crop_data_key: str) -> dict:
    """Download and parse focus_data.json with retry logic."""
    logger = logging.getLogger(__name__)
    
    try:
        logger.info(f"Downloading focus_data.json from {crop_data_key}")
        crop_data_response = s3_client.get_object(Bucket=datasets_bucket, Key=crop_data_key)
        crop_data = json.loads(crop_data_response['Body'].read().decode('utf-8'))
        logger.info(f"Successfully parsed focus_data.json with {len(crop_data)} images")
        return crop_data
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'NoSuchKey':
            raise HTTPException(status_code=404, detail=f"focus_data.json not found at {crop_data_key}")
        elif error_code == 'AccessDenied':
            raise HTTPException(status_code=403, detail="Access denied to focus_data.json")
        else:
            raise HTTPException(status_code=500, detail=f"S3 error downloading focus_data.json: {error_code}")
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON in focus_data.json: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download focus_data.json: {str(e)}")

@retry_with_backoff(
    max_retries=3,
    base_delay=1.0,
    exceptions=(ClientError, BotoCoreError, Exception)
)
def download_image_with_retry(s3_client, datasets_bucket: str, image_key: str) -> bytes:
    """Download image from S3 with retry logic."""
    logger = logging.getLogger(__name__)
    
    try:
        logger.debug(f"Downloading image: {image_key}")
        image_response = s3_client.get_object(Bucket=datasets_bucket, Key=image_key)
        return image_response['Body'].read()
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'NoSuchKey':
            logger.error(f"Image not found: {image_key}")
            raise FileNotFoundError(f"Image not found: {image_key}")
        elif error_code == 'AccessDenied':
            logger.error(f"Access denied to image: {image_key}")
            raise PermissionError(f"Access denied to image: {image_key}")
        else:
            logger.error(f"S3 error downloading image {image_key}: {error_code}")
            raise Exception(f"S3 error downloading image: {error_code}")
    except Exception as e:
        logger.error(f"Failed to download image {image_key}: {str(e)}")
        raise

def process_dataset(s3_client, training_request: TrainingRequest, dataset_path: str) -> int:
    """Download and process dataset from R2 with robust error handling."""
    logger = logging.getLogger(__name__)
    datasets_bucket = 'datasets'
    object_key = training_request.object_key.rstrip('/')
    crop_data_key = f"{object_key}/focus_data.json"
    
    logger.info(f"Processing dataset with object_key: {object_key}")
    
    # Download focus_data.json with retry
    crop_data = download_focus_data(s3_client, datasets_bucket, crop_data_key)
    
    # Create dataset directory
    os.makedirs(dataset_path, exist_ok=True)
    
    processed_count = 0
    # Validate gender - use 'person' as default for non-standard values
    gender_lower = training_request.gender.lower()
    caption_gender = gender_lower if gender_lower in ['man', 'woman'] else 'person'
    
    # Process each image with robust error handling
    failed_images = []
    for filename, crop_info in crop_data.items():
        try:
            # Download image - filename already contains the second UUID path
            # object_key = "f283b073-c23c-437b-aed1-b559f3c78be8/865f8221-141e-49ef-8fba-575b6d0241d8"
            # filename = "865f8221-141e-49ef-8fba-575b6d0241d8/GyI68OyXEAAnlnF.jpeg"
            # We need: "f283b073-c23c-437b-aed1-b559f3c78be8/865f8221-141e-49ef-8fba-575b6d0241d8/GyI68OyXEAAnlnF.jpeg"
            base_path = object_key.split('/')[0]  # Get first UUID only
            image_key = f"{base_path}/{filename}"
            
            # Download image with retry logic
            image_data = download_image_with_retry(s3_client, datasets_bucket, image_key)
            
            # Process image with error handling
            with Image.open(io.BytesIO(image_data)) as img:
                # Preserve original format and quality
                original_format = img.format or 'JPEG'
                file_ext = '.png' if original_format.upper() == 'PNG' else '.jpg'
                
                # Only convert to RGB if necessary for JPEG
                if original_format.upper() != 'PNG' and img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Crop image using focus_data.json coordinates
                crop_box = calculate_crop_box(crop_info, img.size)
                cropped_img = img.crop(crop_box)
                
                # Ensure 1:1 aspect ratio by cropping to square
                width, height = cropped_img.size
                min_dimension = min(width, height)
                
                # Calculate center crop for square
                left = (width - min_dimension) // 2
                top = (height - min_dimension) // 2
                right = left + min_dimension
                bottom = top + min_dimension
                
                square_img = cropped_img.crop((left, top, right, bottom))
                
                # Resize to exactly 1024x1024 using high-quality resampling
                final_img = square_img.resize((1024, 1024), Image.Resampling.LANCZOS)
                
                # Save processed image with original format (no compression for PNG)
                processed_filename = f"image_{processed_count + 1:03d}{file_ext}"
                image_path = os.path.join(dataset_path, processed_filename)
                
                if original_format.upper() == 'PNG':
                    # PNG: Lossless compression
                    final_img.save(image_path, format='PNG', optimize=False)
                else:
                    # JPEG: Maximum quality, no optimization
                    final_img.save(image_path, format='JPEG', quality=100, optimize=False, subsampling=0)
                
                # Create caption file
                caption_filename = f"image_{processed_count + 1:03d}.txt"
                caption_path = os.path.join(dataset_path, caption_filename)
                caption_content = f'{training_request.trigger_word} {caption_gender}'
                
                with open(caption_path, 'w') as f:
                    f.write(caption_content)

                processed_count += 1
                logger.info(f"Processed {processed_filename} -> {caption_content}")
                
        except (FileNotFoundError, PermissionError) as e:
            logger.warning(f"Skipping {filename}: {str(e)}")
            failed_images.append(filename)
            continue
        except Exception as e:
            logger.error(f"Failed to process {filename}: {str(e)}")
            failed_images.append(filename)
            continue
    
    # Log failed images summary
    if failed_images:
        logger.warning(f"Failed to process {len(failed_images)} images: {failed_images[:5]}{'...' if len(failed_images) > 5 else ''}")
    
    logger.info(f"Successfully processed {processed_count} images with gender: {caption_gender}")
    return processed_count

def create_optimized_config(training_request: TrainingRequest, dataset_path: str, output_path: str) -> str:
    """Create optimized ai-toolkit config using cached models."""
    logger = logging.getLogger(__name__)
    logger.info("Creating optimized ai-toolkit config...")
    
    config = {
        "job": "extension",
        "config": {
            "name": f"flux_lora_{training_request.user_id}_{training_request.studio_id}",
            "process": [{
                "type": "sd_trainer",
                "training_folder": output_path,
                "device": "cuda:0",
                "trigger_word": training_request.trigger_word,
                "network": {
                    "type": "lora",
                    "linear": 32,
                    "linear_alpha": 32,
                },
                "save": {
                    "dtype": "float16",
                    "save_every": 3001,  # Only save at end
                    "max_step_saves_to_keep": 1,  # Keep only final model
                },
                "skip_first_sample": True,  # Like working 4090 config
                "disable_sampling": True,  # Like working 4090 config
                "datasets": [{
                    "folder_path": dataset_path,
                    "caption_ext": "txt",
                    "caption_dropout_rate": 0.05,
                    "shuffle_tokens": False,
                    "cache_latents_to_disk": False,
                    "cache_latents": True,  # Enable for performance like config.yaml
                    "resolution": [512, 768, 1024],  # Multi-resolution like run_modal.py
                }],
                "train": {
                    "batch_size": 1,
                    "steps": training_request.steps,
                    "gradient_accumulation_steps": 1,
                    "train_unet": True,
                    "train_text_encoder": False,
                    "content_or_style": "balanced",  # CRITICAL: Learn both content AND style for faces
                    "gradient_checkpointing": False,  # Disable for 3x speed improvement
                    "noise_scheduler": "flowmatch",
                    "optimizer": "adamw",  # Use regular optimizer like working 4090 config
                    "lr": 0.0001,
                    "ema_config": {
                        "use_ema": True,  # Enable for stability
                        "ema_decay": 0.99,
                    },
                    "dtype": "bf16",
                },
                "model": {
                    "name_or_path": "black-forest-labs/FLUX.1-dev",  # Use HF model ID - will use cached version
                    "is_flux": True,
                    "quantize": False,
                    "cache_dir": "/cache",  # Use cached model from pre-download
                    "local_files_only": False,  # Allow fallback to download if cache miss
                }
            }],
        }
    }
    
    # Write config file
    import tempfile
    config_path = f"/tmp/config_{training_request.studio_id}.yaml"
    with open(config_path, 'w') as f:
        yaml.dump(config, f, default_flow_style=False)
    
    logger.info("AI-toolkit config created successfully")
    return config_path

@retry_with_backoff(
    max_retries=5,
    base_delay=2.0,
    max_delay=120.0,
    exceptions=(ClientError, BotoCoreError, FileNotFoundError, Exception)
)
def upload_weights(s3_client, lora_file_path: str, studio_id: str) -> str:
    """Upload trained weights to R2 with robust retry logic."""
    logger = logging.getLogger(__name__)
    weights_bucket = 'weights'
    weights_filename = f"{studio_id}/lora.safetensors"
    
    # Validate file exists and is readable
    if not os.path.exists(lora_file_path):
        raise FileNotFoundError(f"LoRA weights file not found: {lora_file_path}")
    
    file_size = os.path.getsize(lora_file_path)
    if file_size == 0:
        raise ValueError(f"LoRA weights file is empty: {lora_file_path}")
    
    logger.info(f"Uploading weights file: {lora_file_path} ({file_size / 1024 / 1024:.1f}MB) -> {weights_filename}")
    
    try:
        # Upload with progress tracking for large files
        s3_client.upload_file(
            lora_file_path, 
            weights_bucket, 
            weights_filename,
            ExtraArgs={
                'ContentType': 'application/octet-stream',
                'Metadata': {
                    'studio_id': studio_id,
                    'upload_timestamp': str(int(time.time()))
                }
            }
        )
        
        # Verify upload by checking if object exists
        try:
            s3_client.head_object(Bucket=weights_bucket, Key=weights_filename)
            logger.info(f"✅ Successfully uploaded and verified weights: {weights_filename}")
        except ClientError:
            raise Exception(f"Upload verification failed for {weights_filename}")
        
        return weights_filename
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'AccessDenied':
            raise PermissionError(f"Access denied uploading to weights bucket: {error_code}")
        elif error_code == 'NoSuchBucket':
            raise ValueError(f"Weights bucket does not exist: {weights_bucket}")
        else:
            raise Exception(f"S3 error uploading weights: {error_code}")
    except Exception as e:
        logger.error(f"Failed to upload weights {lora_file_path}: {str(e)}")
        raise

# Webhook implementation with retry logic and HMAC signature
async def send_webhook_callback(webhook_url: str, payload: dict, logger: logging.Logger, max_retries: int = 3):
    """Send webhook callback with training results, HMAC signature, and retry logic."""
    import asyncio
    
    for attempt in range(max_retries):
        try:
            logger.info(f"Sending webhook (attempt {attempt + 1}/{max_retries}) to: {webhook_url}")
            
            # Get webhook secret for signature
            webhook_secret = os.environ.get('WEBHOOK_SECRET')
            if not webhook_secret:
                logger.warning("WEBHOOK_SECRET not found, sending webhook without signature")
            
            # Convert payload to JSON string for signature
            payload_json = json.dumps(payload, sort_keys=True)
            
            # Generate HMAC signature
            headers = {"Content-Type": "application/json"}
            if webhook_secret:
                signature = hmac.new(
                    webhook_secret.encode('utf-8'),
                    payload_json.encode('utf-8'),
                    hashlib.sha256
                ).hexdigest()
                headers["X-Webhook-Signature"] = f"sha256={signature}"
                print(f"🔍 Modal Debug Info:")
                print(f"- Payload JSON: {payload_json}")
                print(f"- Generated signature: {signature}")
                print(f"- Full header: sha256={signature}")
                logger.debug("Added webhook signature for security")
            
            # Increase timeout for production reliability
            timeout = httpx.Timeout(60.0, connect=10.0)  # 60s total, 10s connect
            
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(
                    webhook_url,
                    content=payload_json,
                    headers=headers
                )
                
                logger.info(f"Webhook response: {response.status_code}")
                
                if response.status_code >= 500:
                    # Server error - retry
                    raise httpx.HTTPStatusError(f"Server error: {response.status_code}", request=response.request, response=response)
                
                response.raise_for_status()
                logger.info(f"✅ Webhook sent successfully to {webhook_url}")
                return  # Success - exit retry loop
                
        except httpx.TimeoutException as e:
            logger.warning(f"⏰ Webhook timeout (attempt {attempt + 1}/{max_retries}): {webhook_url}")
            if attempt == max_retries - 1:
                logger.error(f"❌ Webhook failed after {max_retries} timeout attempts")
                sentry_sdk.capture_exception(e)
                return
        except httpx.HTTPStatusError as e:
            if e.response.status_code >= 500 and attempt < max_retries - 1:
                # Server error - retry with exponential backoff
                wait_time = 2 ** attempt  # 1s, 2s, 4s
                logger.warning(f"Server error {e.response.status_code}, retrying in {wait_time}s...")
                await asyncio.sleep(wait_time)
                continue
            else:
                # Client error or final attempt - don't retry
                logger.error(f"❌ Webhook HTTP error {e.response.status_code}: {e.response.text}")
                sentry_sdk.capture_exception(e)
                return
        except Exception as e:
            logger.error(f"💥 Webhook error (attempt {attempt + 1}/{max_retries}): {str(e)}")
            if attempt == max_retries - 1:
                logger.error(f"❌ Webhook failed after {max_retries} attempts")
                sentry_sdk.capture_exception(e)
                return
            
            # Wait before retry
            wait_time = 2 ** attempt
            await asyncio.sleep(wait_time)

@retry_with_backoff(
    max_retries=3,
    base_delay=1.0,
    exceptions=(Exception,)
)
def update_studio_status_to_completed(studio_id: str, logger: logging.Logger):
    """Update studio status to COMPLETED in Supabase database."""
    try:
        logger.info(f"Updating studio status to COMPLETED for studio_id: {studio_id}")
        
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            raise Exception("Supabase credentials not found in environment variables")
        
        supabase = create_client(supabase_url, supabase_key)
        
        # Update studio status
        result = supabase.table('studios').update({'status': 'COMPLETED'}).eq('id', studio_id).execute()
        
        # Check if update was successful
        if hasattr(result, 'error') and result.error:
            logger.error(f"Database status update error: {result.error}")
            raise Exception(f"Failed to update studio status: {result.error}")
        
        logger.info(f"Successfully updated studio status to COMPLETED for studio_id: {studio_id}")
        
    except Exception as e:
        logger.error(f"Failed to update studio status: {str(e)}")
        raise e

@app.function(
    gpu="H200",
    timeout=7200,
    volumes={"/cache": model_cache_volume},
    secrets=[
        modal.Secret.from_name("cloudflare-r2-credentials"),
        modal.Secret.from_name("huggingface-token"),
        modal.Secret.from_name("sentry-credentials"),
        modal.Secret.from_name("webhook-credentials"),
        modal.Secret.from_name("supabase-credentials"),
    ],
    cpu=10.0,
    memory=32768,
    max_containers=10,
    max_inputs=1,
    enable_memory_snapshot=True,
    experimental_options={"enable_gpu_snapshot": True},
    
)
async def run_training_background(training_request_dict: dict):
    """Background training function that runs asynchronously."""
    # Initialize Sentry and logging
    init_sentry()
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    overall_start = time.time()
    training_request = TrainingRequest(**training_request_dict)
    studio_id = training_request.studio_id
    
    try:
        logger.info(f"🚀 Training started - User: {training_request.user_id}, Studio: {training_request.studio_id}")
        
        # Set up HuggingFace cache environment
        logger.info("Setting up HuggingFace cache...")
        os.environ["HF_HOME"] = "/cache"
        os.environ["TRANSFORMERS_CACHE"] = "/cache"
        os.environ["HF_HUB_CACHE"] = "/cache"
        os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "1"  # Enable fast downloads
        # DO NOT set offline mode yet - need to download model first
        
        # Check cache and download model if needed
        cache_exists = os.path.exists("/cache") and os.listdir("/cache")
        if cache_exists:
            cache_size = get_cache_size("/cache")
            logger.info(f"✅ Found HuggingFace cache: {cache_size:.1f}GB")
        else:
            logger.warning("⚠️ No cached models found - will download during training")
        
        logger.info("🔄 AI-toolkit will handle FLUX model loading")
        
        # Set up paths
        dataset_path = f"/tmp/dataset_{studio_id}"
        output_path = f"/tmp/output_{studio_id}"
        os.makedirs(output_path, exist_ok=True)
        
        # Initialize S3 client with retry logic
        try:
            s3_client = get_s3_client()
            logger.info("✅ S3 client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize S3 client: {str(e)}")
            raise Exception(f"S3 initialization failed: {str(e)}")
        
        # Process dataset
        logger.info("📁 Processing dataset...")
        processed_count = process_dataset(s3_client, training_request, dataset_path)
        
        if processed_count == 0:
            raise ValueError("No images were successfully processed from the dataset")
        
        # Create config
        logger.info("⚙️ Creating training config...")
        config_path = create_optimized_config(training_request, dataset_path, output_path)
        
        # Run training with proper error handling
        logger.info(f"🎯 Starting training with {processed_count} images for {training_request.steps} steps")
        
        try:
            from toolkit.job import get_job
            job = get_job(config_path)
            job.run()
            job.cleanup()
            logger.info("✅ Training completed successfully")
        except ImportError as e:
            if "ViTHybridImageProcessor" in str(e):
                logger.error("❌ Transformers version compatibility issue detected")
                raise ValueError("Model loading failed due to transformers version incompatibility. Please check ai-toolkit compatibility.")
            else:
                raise
        except Exception as e:
            logger.error(f"❌ Training failed: {str(e)}")
            raise
        
        
        # Find and upload weights with robust error handling
        logger.info("📤 Finding and uploading trained weights...")
        
        # Find the trained LoRA weights file with retry logic
        lora_file = None
        max_search_attempts = 3
        
        for search_attempt in range(max_search_attempts):
            try:
                for root, dirs, files in os.walk(output_path):
                    for file in files:
                        if file.endswith('.safetensors'):
                            potential_file = os.path.join(root, file)
                            # Verify file is complete and not corrupted
                            if os.path.getsize(potential_file) > 0:
                                lora_file = potential_file
                                logger.info(f"Found LoRA weights: {file} ({os.path.getsize(lora_file) / 1024 / 1024:.1f}MB)")
                                break
                    if lora_file:
                        break
                
                if lora_file:
                    break
                    
                if search_attempt < max_search_attempts - 1:
                    logger.warning(f"No weights found on attempt {search_attempt + 1}, waiting 5s before retry...")
                    time.sleep(5)
                    
            except Exception as e:
                logger.warning(f"Error searching for weights (attempt {search_attempt + 1}): {str(e)}")
                if search_attempt < max_search_attempts - 1:
                    time.sleep(5)
        
        if not lora_file:
            # List all files for debugging
            all_files = []
            try:
                for root, dirs, files in os.walk(output_path):
                    for file in files:
                        file_path = os.path.join(root, file)
                        file_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0
                        all_files.append(f"{file_path} ({file_size} bytes)")
            except Exception as e:
                logger.error(f"Error listing files: {str(e)}")
            
            logger.error(f"No .safetensors file found after {max_search_attempts} attempts. Available files: {all_files}")
            raise Exception("No LoRA weights (.safetensors file) found after training")
        
        # Upload weights with retry logic
        weights_url = upload_weights(s3_client, lora_file, studio_id)
        
        # Update studio status to COMPLETED immediately after successful upload
        try:
            logger.info("🎯 Updating studio status to COMPLETED...")
            update_studio_status_to_completed(studio_id, logger)
            logger.info("✅ Studio status updated to COMPLETED")
        except Exception as status_error:
            logger.error(f"Failed to update studio status: {status_error}")
            # Don't fail the entire process for status update error, but log it
            sentry_sdk.capture_exception(status_error)
        
        # Clean up local safetensors file after successful upload
        try:
            os.remove(lora_file)
            logger.info(f"🧹 Cleaned up local weights file")
        except Exception as cleanup_error:
            logger.warning(f"Failed to cleanup local file: {cleanup_error}")
        
        total_time = time.time() - overall_start
        
        # Prepare success payload
        success_payload = {
            "id": studio_id,
            "studio_id": studio_id,
            "status": "completed",
            "weights_url": weights_url,
            "user_id": training_request.user_id,
        }
        
        logger.info(f"🎉 Training completed successfully in {total_time:.1f}s")
        
        # Send success webhook
        if training_request.webhook_url:
            await send_webhook_callback(training_request.webhook_url, success_payload, logger)
            
            logger.info("✅ Webhook callback completed")
        else:
            logger.info("No webhook URL provided, skipping callback")
        
    except Exception as e:
        total_time = time.time() - overall_start
        logger.error(f"Training failed after {total_time:.1f}s: {str(e)}")
        print(f"Training failed after {total_time:.1f}s: {str(e)}")
        sentry_sdk.capture_exception(e)
        
        # Prepare error payload
        error_payload = {
            "id": studio_id,
            "studio_id": studio_id,
            "status": "failed",
            "user_id": training_request.user_id,
            "error": str(e),
        }
        
        # Send error webhook
        if training_request.webhook_url:
            await send_webhook_callback(training_request.webhook_url, error_payload, logger)
        else:
            logger.info("No webhook URL provided, skipping error callback")

        
@app.function(
    cpu=1,
    timeout=600,
    secrets=[modal.Secret.from_name("sentry-credentials"),modal.Secret.from_name("webhook-credentials")]
)
@modal.fastapi_endpoint(method="POST", label="lora-trainer-2", requires_proxy_auth=True)
async def train_lora_optimized(request: Request):
    """Asynchronous LoRA training endpoint - starts training and returns immediately."""
    # Initialize Sentry and logging
    init_sentry()
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    try:
        # Parse request
        body_data = json.loads(await request.body())
        training_request = TrainingRequest(**body_data)
        studio_id = training_request.studio_id
        
        logger.info(f"📥 Training request - User: {training_request.user_id}, Studio: {training_request.studio_id}, Steps: {training_request.steps}")
        print(f"🔍 Raw request body: {body_data}")
        print(f"🔍 Parsed steps value: {training_request.steps} (type: {type(training_request.steps)})")
        
        # Start background training
        logger.info(f"🚀 Starting background training: {studio_id}")
        run_training_background.spawn(training_request.model_dump())
        
        # Return immediately with studio ID
        return {
            "studio_id": studio_id,
            "status": "PROCESSING",
            "user_id": training_request.user_id,
            "webhook_url": training_request.webhook_url
        }
        
    except Exception as e:
        logger.error(f"Failed to start training: {str(e)}")
        sentry_sdk.capture_exception(e)
        raise HTTPException(status_code=500, detail=f"Failed to start training: {str(e)}")

if __name__ == "__main__":
    print("Simple LoRA Training Endpoint")