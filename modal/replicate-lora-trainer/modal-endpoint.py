import os
os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "1"
os.environ['DISABLE_TELEMETRY'] = 'YES'

import sys
import modal
import json
import uuid
import yaml
import boto3
import io
import time
import logging
from PIL import Image
from datetime import datetime
from typing import Dict, Any
from fastapi import HTTPException, Request
from pydantic import BaseModel, Field
import sentry_sdk
from sentry_sdk.integrations.logging import LoggingIntegration
import httpx
import hmac
import hashlib

# Add ai-toolkit to path
sys.path.insert(0, "/root/ai-toolkit")

# =============================================================================
# Model Caching Setup (ComfyUI Pattern)
# =============================================================================

# Create persistent volume for HuggingFace model cache
model_cache_volume = modal.Volume.from_name("lora-trainer", create_if_missing=True)

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
    .apt_install("git", "libgl1", "libglib2.0-0")
    .pip_install("torch", "torchvision")
    .pip_install("transformers", "diffusers[torch]", "accelerate")
    .pip_install("safetensors", "huggingface_hub[hf_transfer]", "peft")
    .pip_install("fastapi[standard]", "boto3", "requests", "pydantic", "httpx")
    .pip_install("oyaml", "pyyaml", "python-dotenv")
    .pip_install("sentry-sdk[fastapi]")
    .env({"HF_HUB_ENABLE_HF_TRANSFER": "1"})
    .run_commands(
        "cd /root && git clone https://github.com/ostris/ai-toolkit.git",
        "cd /root/ai-toolkit && pip install -r requirements.txt"
    )
)

# Initialize Sentry for error monitoring
def init_sentry():
    """Initialize Sentry SDK for error monitoring."""
    # sentry_dsn = os.environ.get('SENTRY_DSN')
    sentry_dsn = os.environ.get('SENTRY_DSNNNN') # for development only
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
app = modal.App(name="lora-trainer", image=image)

@app.function(
    volumes={"/cache": model_cache_volume},
    secrets=[modal.Secret.from_name("huggingface-token")],
    timeout=600,
)
def warmup_cache():
    """Pre-warm the model cache for faster training startup."""
    # Set up environment for training
    os.environ["CUDA_VISIBLE_DEVICES"] = "0"
    os.environ["PYTHONPATH"] = "/root/ai-toolkit"
    
    # Set up HuggingFace cache environment and force offline mode
    os.environ["HF_HOME"] = "/cache"
    os.environ["TRANSFORMERS_CACHE"] = "/cache"
    os.environ["HF_HUB_CACHE"] = "/cache"
    os.environ["HF_HUB_OFFLINE"] = "1"  # Force offline mode
    os.environ["TRANSFORMERS_OFFLINE"] = "1"  # Force transformers offline
    os.environ["HF_DATASETS_OFFLINE"] = "1"  # Force datasets offline
    
    try:
        # Check cache status
        cache_exists = os.path.exists("/cache") and os.listdir("/cache")
        if cache_exists:
            cache_size = get_cache_size("/cache")
            print(f"Cache warmed up! Available models: {cache_size:.1f}GB")
            return {"status": "success", "cache_size_gb": cache_size}
        else:
            print("No cache found - run download_flux_models first")
            return {"status": "no_cache", "message": "Run download_flux_models first"}
            
    except Exception as e:
        print(f"Cache warmup failed: {e}")
        return {"status": "error", "error": str(e)}

# Request/Response models
class TrainingRequest(BaseModel):
    object_key: str = Field(..., description="R2 object key containing images and crop_data.json")
    gender: str = Field(..., description="Gender for caption generation (man/woman)")
    user_id: str = Field(..., description="User identifier")
    studio_id: str = Field(..., description="Studio identifier")
    steps: int = Field(default=1000, description="Number of training steps")
    trigger_word: str = Field(default="ohwx", description="Trigger word for training")
    webhook_url: str = Field(..., description="Webhook URL to call when training completes")

def get_s3_client():
    """Initialize S3 client for R2 storage."""
    account_id = os.environ.get('R2_ACCOUNT_ID')
    endpoint_url = f'https://{account_id}.r2.cloudflarestorage.com' if account_id else None
    
    return boto3.client(
        's3',
        endpoint_url=endpoint_url,
        aws_access_key_id=os.environ.get('R2_ACCESS_KEY_ID'),
        aws_secret_access_key=os.environ.get('R2_SECRET_ACCESS_KEY'),
        region_name='auto'
    )

def calculate_crop_box(crop_info: Dict[str, Any], image_size: tuple) -> tuple:
    """Calculate crop box coordinates from crop_data.json format."""
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

def process_dataset(s3_client, training_request: TrainingRequest, dataset_path: str) -> int:
    """Download and process dataset from R2."""
    logger = logging.getLogger(__name__)
    datasets_bucket = 'datasets'
    object_key = training_request.object_key.rstrip('/')
    crop_data_key = f"{object_key}/crop_data.json"
    
    logger.info(f"Downloading crop_data.json from: {crop_data_key}")
    
    # Download crop_data.json
    try:
        crop_data_response = s3_client.get_object(Bucket=datasets_bucket, Key=crop_data_key)
        crop_data = json.loads(crop_data_response['Body'].read().decode('utf-8'))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to download crop_data.json: {str(e)}")
    
    # Create dataset directory
    os.makedirs(dataset_path, exist_ok=True)
    
    processed_count = 0
    caption_gender = training_request.gender.lower()
    
    # Process each image
    for filename, crop_info in crop_data.items():
        try:
            # Download image
            image_key = f"{object_key}/{filename}"
            image_response = s3_client.get_object(Bucket=datasets_bucket, Key=image_key)
            
            # Process image
            with Image.open(io.BytesIO(image_response['Body'].read())) as img:
                # Preserve original format and quality
                original_format = img.format or 'JPEG'
                file_ext = '.png' if original_format.upper() == 'PNG' else '.jpg'
                
                # Only convert to RGB if necessary for JPEG
                if original_format.upper() != 'PNG' and img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Crop image using crop_data.json coordinates
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
                
                # Upload processed image to R2 for testing
                try:
                    with open(image_path, 'rb') as img_file:
                        upload_key = f"{object_key}/datasets/{processed_filename}"
                        s3_client.put_object(
                            Bucket=datasets_bucket,
                            Key=upload_key,
                            Body=img_file.read(),
                            ContentType=f'image/{"png" if file_ext == ".png" else "jpeg"}'
                        )
                    logger.info(f"Uploaded processed image to R2: {upload_key}")
                except Exception as upload_error:
                    logger.warning(f"Failed to upload {processed_filename} to R2: {upload_error}")
                # Upload processed image to R2 for testing
                # Create caption file
                caption_filename = f"image_{processed_count + 1:03d}.txt"
                caption_path = os.path.join(dataset_path, caption_filename)
                caption_content = f'{training_request.trigger_word} {caption_gender}'
                
                with open(caption_path, 'w') as f:
                    f.write(caption_content)
                
                # Upload caption file to R2 for testing
                try:
                    caption_upload_key = f"{object_key}/datasets/{caption_filename}"
                    s3_client.put_object(
                        Bucket=datasets_bucket,
                        Key=caption_upload_key,
                        Body=caption_content.encode('utf-8'),
                        ContentType='text/plain'
                    )
                    logger.info(f"Uploaded caption to R2: {caption_upload_key}")
                except Exception as caption_upload_error:
                    logger.warning(f"Failed to upload {caption_filename} to R2: {caption_upload_error}")
                # Upload caption file to R2 for testing

                processed_count += 1
                logger.info(f"Processed {processed_filename} (1024x1024)")
                
        except Exception as e:
            logger.error(f"Failed to process {filename}: {e}")
            continue
    
    logger.info(f"Successfully processed {processed_count} images")
    return processed_count

def create_optimized_config(training_request: TrainingRequest, dataset_path: str, output_path: str) -> str:
    """Create optimized ai-toolkit config using cached models."""
    logger = logging.getLogger(__name__)
    logger.info("Creating optimized config with cached model paths...")
    
    config = {
        "job": "extension",
        "config": {
            "name": f"flux_lora_{training_request.user_id}_{training_request.studio_id}",
            "process": [{
                "type": "sd_trainer",
                "training_folder": output_path,
                "device": "cuda:0",
                "trigger_word": "ohwx",
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
                    "cache_latents": True,  # Enable for performance like confg.yaml
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
                    "cache_dir": "/cache",  # Use cached model from FluxPipeline download
                    "local_files_only": True,  # Force local files only after download
                }
            }],
        }
    }
    
    # Write config file
    config_path = f"/tmp/config_{uuid.uuid4()}.yaml"
    with open(config_path, 'w') as f:
        yaml.dump(config, f, default_flow_style=False)
    
    logger.info("Speed-optimized config created: disabled gradient_checkpointing, quantization, disk caching")
    return config_path

def upload_weights(s3_client, lora_file_path: str, training_id: str) -> str:
    """Upload trained weights to R2."""
    weights_bucket = 'weights'
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    weights_filename = f"lora_{training_id}_{timestamp}.safetensors"
    
    s3_client.upload_file(lora_file_path, weights_bucket, weights_filename)
    
    account_id = os.environ.get('R2_ACCOUNT_ID')
    weights_url = f"https://{weights_bucket}.{account_id}.r2.cloudflarestorage.com/{weights_filename}"
    
    return weights_url

async def send_webhook_callback(webhook_url: str, payload: dict, logger: logging.Logger):
    """Send webhook callback with training results and HMAC signature."""
    try:
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
            logger.info("Added webhook signature for security")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                webhook_url,
                json=payload,
                headers=headers
            )
            response.raise_for_status()
            logger.info(f"Webhook callback sent successfully to {webhook_url}")
    except Exception as e:
        logger.error(f"Failed to send webhook callback to {webhook_url}: {str(e)}")
        sentry_sdk.capture_exception(e)

@app.function(
    gpu="H200",
    timeout=7200,
    volumes={"/cache": model_cache_volume},
    secrets=[
        modal.Secret.from_name("cloudflare-r2-credentials"),
        modal.Secret.from_name("huggingface-token"),
        modal.Secret.from_name("sentry-credentials"),
        modal.Secret.from_name("webhook-credentials"),
    ],
    cpu=10.0,
    memory=32768,
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
    training_id = str(uuid.uuid4())
    
    try:
        logger.info(f"Background training started - User: {training_request.user_id}, Studio: {training_request.studio_id}")
        
        # Set up HuggingFace cache environment (NO offline mode yet)
        logger.info("Setting up HuggingFace cache...")
        model_check_start = time.time()
        
        os.environ["HF_HOME"] = "/cache"
        os.environ["TRANSFORMERS_CACHE"] = "/cache"
        os.environ["HF_HUB_CACHE"] = "/cache"
        os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "1"  # Enable fast downloads
        # DO NOT set offline mode yet - need to download model first
        
        # Check cache and download model if needed
        cache_exists = os.path.exists("/cache") and os.listdir("/cache")
        if cache_exists:
            cache_size = get_cache_size("/cache")
            logger.info(f"Found HuggingFace cache: {cache_size:.1f}GB")
            print(f"Found HuggingFace cache: {cache_size:.1f}GB")
        else:
            logger.warning("No cached models found - will download during training")
            print("No cached models found - will download during training")
        
        # Skip pre-download - ai-toolkit will handle model loading directly
        logger.info("Skipping FluxPipeline pre-download - ai-toolkit handles model loading")
        print("ai-toolkit will load FLUX model directly during training")
        
        # Set offline mode for training to use any cached models
        os.environ["HF_HUB_OFFLINE"] = "1"
        os.environ["TRANSFORMERS_OFFLINE"] = "1" 
        os.environ["HF_DATASETS_OFFLINE"] = "1"
        logger.info("Set offline mode - training will use cached models when available")
        
        model_check_time = time.time() - model_check_start
        
        # Set up paths
        dataset_path = f"/tmp/dataset_{training_id}"
        output_path = f"/tmp/output_{training_id}"
        os.makedirs(output_path, exist_ok=True)
        
        # Initialize S3 client
        s3_client = get_s3_client()
        
        # Process dataset
        logger.info("Processing dataset...")
        dataset_start = time.time()
        processed_count = process_dataset(s3_client, training_request, dataset_path)
        dataset_time = time.time() - dataset_start
        
        # Create config
        logger.info("Creating training config...")
        config_start = time.time()
        config_path = create_optimized_config(training_request, dataset_path, output_path)
        config_time = time.time() - config_start
        
        # Run training
        logger.info(f"Starting training with {processed_count} images for {training_request.steps} steps")
        training_start = time.time()
        
        from toolkit.job import get_job
        job = get_job(config_path)
        job.run()
        job.cleanup()
        
        training_time = time.time() - training_start
        
        # Find and upload weights
        logger.info("Uploading weights...")
        upload_start = time.time()
        
        # Find any .safetensors file (not just ones with 'lora' in name)
        lora_file = None
        for root, dirs, files in os.walk(output_path):
            for file in files:
                if file.endswith('.safetensors'):
                    lora_file = os.path.join(root, file)
                    logger.info(f"Found safetensors file: {file}")
                    break
            if lora_file:
                break
        
        if not lora_file:
            # List all files for debugging
            all_files = []
            for root, dirs, files in os.walk(output_path):
                for file in files:
                    all_files.append(os.path.join(root, file))
            logger.error(f"No .safetensors file found. Available files: {all_files}")
            raise Exception("No LoRA weights (.safetensors file) found after training")
        
        weights_url = upload_weights(s3_client, lora_file, training_id)
        upload_time = time.time() - upload_start
        
        # Clean up local safetensors file after successful upload
        try:
            os.remove(lora_file)
            logger.info(f"Cleaned up local safetensors file: {lora_file}")
        except Exception as cleanup_error:
            logger.warning(f"Failed to cleanup local file {lora_file}: {cleanup_error}")
        
        total_time = time.time() - overall_start
        
        # Prepare success payload
        success_payload = {
            "training_id": training_id,
            "status": "completed",
            "weights_url": weights_url,
            "user_id": training_request.user_id,
            "studio_id": training_request.studio_id,
            "message": f"Training completed with {processed_count} images in {total_time:.1f}s",
            "training_time": total_time,
            "performance_metrics": {
                "model_verification_time": model_check_time,
                "dataset_processing_time": dataset_time,
                "config_creation_time": config_time,
                "training_time": training_time,
                "upload_time": upload_time,
                "total_time": total_time,
                "steps_per_second": training_request.steps / training_time,
                "estimated_cost_usd": (total_time / 3600) * 3.95
            }
        }
        
        logger.info(f"Training completed successfully in {total_time:.1f}s")
        
        # Send success webhook
        await send_webhook_callback(training_request.webhook_url, success_payload, logger)
        
    except Exception as e:
        total_time = time.time() - overall_start
        logger.error(f"Training failed after {total_time:.1f}s: {str(e)}")
        sentry_sdk.capture_exception(e)
        
        # Prepare error payload
        error_payload = {
            "training_id": training_id,
            "status": "failed",
            "user_id": training_request.user_id,
            "studio_id": training_request.studio_id,
            "error": str(e),
            "training_time": total_time
        }
        
        # Send error webhook
        await send_webhook_callback(training_request.webhook_url, error_payload, logger)

        
@app.function(
    cpu=1,
    timeout=600,
    secrets=[modal.Secret.from_name("sentry-credentials")]
)

@modal.fastapi_endpoint(method="POST", label="lora-trainer", requires_proxy_auth=True)
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
        training_id = str(uuid.uuid4())
        
        logger.info(f"Training request received - User: {training_request.user_id}, Studio: {training_request.studio_id}, Steps: {training_request.steps}")
        
        # Validate request
        if not training_request.webhook_url:
            raise HTTPException(status_code=400, detail="webhook_url is required")
        
        # Start background training
        logger.info(f"Starting background training with ID: {training_id}")
        run_training_background.spawn(training_request.dict())
        
        # Return immediately with training ID
        return {
            "training_id": training_id,
            "status": "started",
            "message": "Training started in background. You will receive a webhook callback when complete.",
            "user_id": training_request.user_id,
            "studio_id": training_request.studio_id,
            "webhook_url": training_request.webhook_url
        }
        
    except Exception as e:
        logger.error(f"Failed to start training: {str(e)}")
        sentry_sdk.capture_exception(e)
        raise HTTPException(status_code=500, detail=f"Failed to start training: {str(e)}")

if __name__ == "__main__":
    print("Simple LoRA Training Endpoint")