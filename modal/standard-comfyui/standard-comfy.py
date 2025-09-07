import os
os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "1"
os.environ['DISABLE_TELEMETRY'] = 'YES'

import sys
import modal
import json
import uuid
import time
import logging
import requests
import asyncio
import io
import random
from PIL import Image, ImageDraw, ImageFont
from typing import Dict, Any, Callable
from fastapi import HTTPException, Request
from pydantic import BaseModel, Field
import sentry_sdk
from sentry_sdk.integrations.logging import LoggingIntegration
import boto3
from supabase import create_client, Client
from botocore.exceptions import ClientError, BotoCoreError
from functools import wraps
from requests.exceptions import ChunkedEncodingError, ConnectionError, Timeout, RequestException
import subprocess
from pathlib import Path

# Create persistent volume for model cache
vol = modal.Volume.from_name("comfyui-cache", create_if_missing=True)

# Pre-cache models during image build
def hf_download():
    from huggingface_hub import hf_hub_download, login
    import os

    # Authenticate with Hugging Face using token from environment
    hf_token = os.environ.get("HF_TOKEN")
    if hf_token:
        login(token=hf_token)
        print("Successfully authenticated with Hugging Face")
    else:
        print("Warning: No HF_TOKEN found. Some models may not be accessible.")

    # Create necessary directories
    os.makedirs("/root/comfy/ComfyUI/models/unet", exist_ok=True)
    os.makedirs("/root/comfy/ComfyUI/models/vae", exist_ok=True)
    os.makedirs("/root/comfy/ComfyUI/models/clip", exist_ok=True)
    os.makedirs("/root/comfy/ComfyUI/models/checkpoints", exist_ok=True)
    
    # Download and cache FLUX model
    try:
        flux_model = hf_hub_download(
            repo_id="black-forest-labs/FLUX.1-dev",
            filename="flux1-dev.safetensors",
            cache_dir="/cache",
        )
        # Symlink to ComfyUI directory
        subprocess.run(
            f"ln -sf {flux_model} /root/comfy/ComfyUI/models/checkpoints/flux1-dev.safetensors",
            shell=True,
            check=True,
        )
        print("FLUX model cached successfully")
    except Exception as e:
        print(f"Failed to cache FLUX model: {e}")

image = (  # build up a Modal Image to run ComfyUI, step by step
    modal.Image.debian_slim(  # start from basic Linux with Python
        python_version="3.11"
    )
    .apt_install("git", "libgl1", "libglib2.0-0", "unzip", "wget", "curl")  # install dependencies
    .pip_install("fastapi[standard]==0.115.4")  # install web dependencies
    .pip_install("comfy-cli==1.4.1")  # install comfy-cli
    .pip_install("pillow>=10.0.0")  # for image processing
    .pip_install("requests>=2.31.0")  # for HTTP requests
    .pip_install("boto3>=1.34.0")  # for Cloudflare R2 integration
    .pip_install("supabase>=2.0.0")  # for Supabase database integration
    .pip_install("sentry-sdk>=1.32.0")  # for error monitoring
    .pip_install("huggingface_hub[hf_transfer]==0.34.4")  # HF with transfer acceleration
    .env({
        "HF_HUB_ENABLE_HF_TRANSFER": "1",
        "HF_HOME": "/cache",
        "TRANSFORMERS_CACHE": "/cache",
        "NO_ALBUMENTATIONS_UPDATE": "1"
    })
    .run_commands(  # use comfy-cli to install ComfyUI and its dependencies
        "comfy --skip-prompt install --fast-deps --nvidia --version 0.3.41"
    )
    .run_function(
        hf_download,
        volumes={"/cache": vol},  # persist the HF cache
        secrets=[modal.Secret.from_name("huggingface-token")],  # pass HF token secret
    )
)


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


def hf_download():
    from huggingface_hub import hf_hub_download, login
    import os

    # Authenticate with Hugging Face using token from environment
    hf_token = os.environ.get("HF_TOKEN")
    if hf_token:
        login(token=hf_token)
        print("Successfully authenticated with Hugging Face")
    else:
        print("Warning: No HF_TOKEN found. Some models may not be accessible.")

    # Create necessary directories
    os.makedirs("/root/comfy/ComfyUI/models/unet", exist_ok=True)
    os.makedirs("/root/comfy/ComfyUI/models/vae", exist_ok=True)
    os.makedirs("/root/comfy/ComfyUI/models/clip", exist_ok=True)

    # Download FLUX.1-dev model (UNet) - using unet folder as requested
    flux_dev_model = hf_hub_download(
        repo_id="black-forest-labs/FLUX.1-dev",
        filename="flux1-dev.safetensors",
        cache_dir="/cache",
        token=hf_token,
    )
    
    # Download VAE model from FLUX.1-schnell
    vae_model = hf_hub_download(
        repo_id="black-forest-labs/FLUX.1-schnell",
        filename="ae.safetensors",
        cache_dir="/cache",
        token=hf_token,
    )
    
    # Download text encoders
    t5_model = hf_hub_download(
        repo_id="comfyanonymous/flux_text_encoders",
        filename="t5xxl_fp16.safetensors",
        cache_dir="/cache",
        token=hf_token,
    )
    
    clip_model = hf_hub_download(
        repo_id="comfyanonymous/flux_text_encoders",
        filename="clip_l.safetensors",
        cache_dir="/cache",
        token=hf_token,
    )
   

    

    # Symlink models to ComfyUI directories
    subprocess.run(
        f"ln -sf {flux_dev_model} /root/comfy/ComfyUI/models/unet/flux1-dev.safetensors",
        shell=True,
        check=True,
    )
    
    subprocess.run(
        f"ln -sf {vae_model} /root/comfy/ComfyUI/models/vae/ae.safetensors",
        shell=True,
        check=True,
    )
    
    subprocess.run(
        f"ln -sf {t5_model} /root/comfy/ComfyUI/models/clip/t5xxl_fp16.safetensors",
        shell=True,
        check=True,
    )
    
    subprocess.run(
        f"ln -sf {clip_model} /root/comfy/ComfyUI/models/clip/clip_l.safetensors",
        shell=True,
        check=True,
    )


vol = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)

image = (
    # install huggingface_hub with hf_transfer support to speed up downloads
    image.pip_install("huggingface_hub[hf_transfer]>=0.34.0,<1.0")
    .env({"HF_HUB_ENABLE_HF_TRANSFER": "1"})
    .run_function(
        hf_download,
        # persist the HF cache to a Modal Volume so future runs don't re-download models
        volumes={"/cache": vol},
        secrets=[modal.Secret.from_name("huggingface-token")],
    )    
)

# Lastly, copy the ComfyUI workflow JSON to the container.
image = image.add_local_file(
    Path(__file__).parent / "workflow_api.json", "/root/workflow_api.json"
)



# ## Running ComfyUI interactively

# Spin up an interactive ComfyUI server by wrapping the `comfy launch` command in a Modal Function
# and serving it as a [web server](https://modal.com/docs/guide/webhooks#non-asgi-web-servers).

app = modal.App(name="example-comfyapp", image=image)


@app.cls(
    scaledown_window=60,  # 1 minute container keep alive after it processes an input
    gpu="H100",
    max_containers=1,
    volumes={"/cache": vol},
    secrets=[
        modal.Secret.from_name("supabase-credentials"),
        modal.Secret.from_name("sentry-credentials"),
        modal.Secret.from_name("zeptomail-credentials"),
        modal.Secret.from_name("cloudflare-r2-credentials"),
    ],
)
@modal.concurrent(max_inputs=10)
class ComfyUI:
    port: int = 8000

    @modal.enter()
    def launch_comfy_background(self):
        # launch the ComfyUI server exactly once when the container starts with metadata disabled
        cmd = f"comfy launch --background -- --port {self.port} --disable-metadata"
        subprocess.run(cmd, shell=True, check=True)

    @modal.method()
    def infer(self, workflow_path: str = "/root/workflow_api.json"):
        # sometimes the ComfyUI server stops responding (we think because of memory leaks), so this makes sure it's still up
        self.poll_server_health()

        # runs the comfy run --workflow command as a subprocess
        cmd = f"comfy run --workflow {workflow_path} --wait --timeout 1200 --verbose"
        subprocess.run(cmd, shell=True, check=True)

        # completed workflows write output images to this directory
        output_dir = "/root/comfy/ComfyUI/output"

        # looks up the name of the output image file based on the workflow
        workflow = json.loads(Path(workflow_path).read_text())
        file_prefix = [
            node.get("inputs")
            for node in workflow.values()
            if node.get("class_type") == "SaveImage"
        ][0]["filename_prefix"]

        # returns the image as bytes
        for f in Path(output_dir).iterdir():
            if f.name.startswith(file_prefix):
                return f.read_bytes()

    @modal.fastapi_endpoint(method="POST")
    def api(self, item: Dict):
        from fastapi import Response

        workflow_data = json.loads(
            (Path(__file__).parent / "workflow_api.json").read_text()
        )

        # insert the prompt
        workflow_data["6"]["inputs"]["text"] = item["prompt"]

        # give the output image a unique id per client request
        client_id = uuid.uuid4().hex
        workflow_data["9"]["inputs"]["filename_prefix"] = client_id
        
        # Randomize seed for different images each time
        import random
        random_seed = random.randint(1, 2**63 - 1)  # Generate large random seed
        workflow_data["25"]["inputs"]["noise_seed"] = random_seed

        # save this updated workflow to a new file
        new_workflow_file = f"{client_id}.json"
        json.dump(workflow_data, Path(new_workflow_file).open("w"))

        # run inference on the currently running container
        img_bytes = self.infer.local(new_workflow_file)

        return Response(img_bytes, media_type="image/jpeg")

    def poll_server_health(self) -> Dict:
        import socket
        import urllib

        try:
            # check if the server is up (response should be immediate)
            req = urllib.request.Request(f"http://127.0.0.1:{self.port}/system_stats")
            urllib.request.urlopen(req, timeout=5)
            print("ComfyUI server is healthy")
        except (socket.timeout, urllib.error.URLError) as e:
            # if no response in 5 seconds, stop the container
            print(f"Server health check failed: {str(e)}")
            modal.experimental.stop_fetching_inputs()

            # all queued inputs will be marked "Failed", so you need to catch these errors in your client and then retry
            raise Exception("ComfyUI server is not healthy, stopping container")

    def generate_headshots(self, studio_id: str, weights_url: str, user_id: str, prompt: str, sendemail: bool, user_email: str):
        """Generate 4 headshot images using LoRA weights and handle all processing."""
        init_sentry()
        logging.basicConfig(level=logging.INFO)
        logger = logging.getLogger(__name__)
        
        try:
            # Initialize Supabase client for database operations
            from supabase import create_client
            supabase_url = os.environ.get("SUPABASE_URL")
            supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
            
            if not supabase_url or not supabase_key:
                raise Exception("Supabase credentials not found in environment variables")
            
            supabase = create_client(supabase_url, supabase_key)
            
            logger.info(f"Starting headshot generation for studio_id: {studio_id}")
            print(f"Starting headshot generation for studio_id: {studio_id}")
            
            # Step 1: Download LoRA weights from Cloudflare R2 (with caching)
            try:
                logger.info("Step 1: Downloading LoRA weights...")
                print("Step 1: Downloading LoRA weights...")
                cached_lora_path = self.download_lora_weights(weights_url, studio_id, logger)
                logger.info("Step 1: LoRA weights ready (downloaded or cached)")
                print("Step 1: LoRA weights ready (downloaded or cached)")
            except Exception as e:
                logger.error(f"Step 1 FAILED: {str(e)}")
                print(f"Step 1 FAILED: {str(e)}")
                raise Exception(f"Failed to download LoRA weights: {str(e)}")
            
            # Step 2: Generate 4 images using ComfyUI
            try:
                logger.info("Step 2: Generating images with ComfyUI...")
                print("Step 2: Generating images with ComfyUI...")
                image_paths = self.generate_images_with_lora(prompt, studio_id, logger)
                logger.info(f"Step 2: Generated {len(image_paths)} images successfully")
                print(f"Step 2: Generated {len(image_paths)} images successfully")
            except Exception as e:
                logger.error(f"Step 2 FAILED: {str(e)}")
                print(f"Step 2 FAILED: {str(e)}")
                raise Exception(f"Failed to generate images: {str(e)}")
            
            # Step 3: Process and upload images to Cloudflare R2 (original + watermarked)
            try:
                logger.info("Step 3: Processing and uploading images...")
                print("Step 3: Processing and uploading images...")
                image_urls = self.process_and_upload_images(image_paths, studio_id, logger)
                logger.info(f"Step 3: Processed and uploaded {len(image_urls['original'])} original and {len(image_urls['watermarked'])} watermarked images")
                print(f"Step 3: Processed and uploaded {len(image_urls['original'])} original and {len(image_urls['watermarked'])} watermarked images")
            except Exception as e:
                logger.error(f"Step 3 FAILED: {str(e)}")
                print(f"Step 3 FAILED: {str(e)}")
                raise Exception(f"Failed to process and upload images: {str(e)}")
            
            # Step 4: Insert headshots into database
            try:
                logger.info("Step 4: Inserting headshots into database...")
                print("Step 4: Inserting headshots into database...")
                self.insert_headshots_to_database(studio_id, prompt, image_urls, supabase, logger)
                logger.info("Step 4: Database updated successfully")
                print("Step 4: Database updated successfully")
            except Exception as e:
                logger.error(f"Step 4 FAILED: {str(e)}")
                print(f"Step 4 FAILED: {str(e)}")
                raise Exception(f"Failed to update database: {str(e)}")
            
            # Step 5: Update studio status to COMPLETED if this is the final prompt (sendemail=true)
            if sendemail:
                try:
                    logger.info("Step 5a: Updating studio status to COMPLETED...")
                    print("Step 5a: Updating studio status to COMPLETED...")
                    self.update_studio_status_to_completed(studio_id, supabase, logger)
                    logger.info("Step 5a: Studio status updated to COMPLETED")
                    print("Step 5a: Studio status updated to COMPLETED")
                except Exception as e:
                    logger.error(f"Step 5a FAILED: {str(e)}")
                    print(f"Step 5a FAILED: {str(e)}")
                    # Don't fail the entire process for status update error
            
            # Step 6: Send email notification if requested
            if sendemail and user_email:
                logger.info("Step 6: Sending email notification...")
                print("Step 6: Sending email notification...")
                self.send_completion_email(user_email, studio_id, logger)
                logger.info("Step 6: Email sent successfully")
                print("Step 6: Email sent successfully")
            else:
                logger.info("Step 6: Email notification skipped (not requested or no email provided)")
                print("Step 6: Email notification skipped (not requested or no email provided)")
            
            logger.info(f"Successfully completed headshot generation for studio_id: {studio_id}")
            print(f"Successfully completed headshot generation for studio_id: {studio_id}")
            return {"success": True, "studio_id": studio_id, "images_generated": len(image_urls["original"])}
            
        except Exception as e:
            logger.error(f"Error in headshot generation: {str(e)}")
            sentry_sdk.capture_exception(e)
            raise e

    @retry_with_backoff(
        max_retries=5,
        base_delay=2.0,
        max_delay=120.0,
        exceptions=(ClientError, BotoCoreError, ConnectionError, Timeout, RequestException, Exception)
    )
    def download_lora_weights(self, weights_url: str, studio_id: str, logger):
        """Download LoRA weights from Cloudflare R2 with smart caching using studio_id."""
        try:
            # Create LoRA models directory
            lora_dir = "/root/comfy/ComfyUI/models/loras"
            os.makedirs(lora_dir, exist_ok=True)
            
            # Use studio_id as cache key for the LoRA file
            cached_lora_path = os.path.join(lora_dir, f"{studio_id}.safetensors")
            
            # Check if LoRA is already cached
            if os.path.exists(cached_lora_path):
                # Verify cached file is valid (not corrupted)
                file_size = os.path.getsize(cached_lora_path)
                if file_size > 0:
                    logger.info(f"LoRA already cached for studio_id: {studio_id} ({file_size / 1024 / 1024:.1f}MB)")
                    logger.info(f"Using cached LoRA from: {cached_lora_path}")
                    return cached_lora_path
                else:
                    logger.warning(f"Cached LoRA file is corrupted (0 bytes), re-downloading...")
                    os.remove(cached_lora_path)
            
            logger.info(f"LoRA not cached for studio_id: {studio_id}, downloading...")
            
            # Initialize Cloudflare R2 client with correct endpoint
            r2_account_id = os.environ.get('R2_ACCOUNT_ID')
            if not r2_account_id:
                raise Exception("R2_ACCOUNT_ID environment variable is required")
            
            r2_endpoint = f"https://{r2_account_id}.r2.cloudflarestorage.com"
            
            r2_client = boto3.client(
                's3',
                endpoint_url=r2_endpoint,
                aws_access_key_id=os.environ.get('R2_ACCESS_KEY_ID'),
                aws_secret_access_key=os.environ.get('R2_SECRET_ACCESS_KEY'),
                region_name='auto'
            )
            
            # Expected path: studio_id/lora.safetensors
            object_key = f"{studio_id}/lora.safetensors"
            
            # Generate pre-signed URL for download
            download_url = r2_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': 'weights', 'Key': object_key},
                ExpiresIn=3600  # 1 hour
            )
            
            # Download the file with robust error handling
            logger.info(f"Downloading LoRA from R2: {object_key}")
            
            # Use session with retry strategy for better reliability
            session = requests.Session()
            session.mount('https://', requests.adapters.HTTPAdapter(max_retries=3))
            
            try:
                response = session.get(
                    download_url, 
                    timeout=(30, 300),  # (connect_timeout, read_timeout)
                    stream=True  # Stream for large files
                )
                response.raise_for_status()
                
                # Validate content length if available
                expected_size = response.headers.get('content-length')
                if expected_size:
                    expected_size = int(expected_size)
                    logger.info(f"Expected download size: {expected_size / 1024 / 1024:.1f}MB")
                
                # Save to ComfyUI LoRA directory with studio_id as filename
                downloaded_size = 0
                with open(cached_lora_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)
                            downloaded_size += len(chunk)
                
                # Verify download completed successfully
                actual_size = os.path.getsize(cached_lora_path)
                if expected_size and actual_size != expected_size:
                    os.remove(cached_lora_path)
                    raise Exception(f"Download size mismatch: expected {expected_size}, got {actual_size}")
                
                if actual_size == 0:
                    os.remove(cached_lora_path)
                    raise Exception("Downloaded file is empty")
                
                logger.info(f"Successfully downloaded and cached LoRA weights to {cached_lora_path} ({actual_size / 1024 / 1024:.1f}MB)")
                return cached_lora_path
                
            except (ChunkedEncodingError, ConnectionError, Timeout) as e:
                logger.error(f"Network error downloading LoRA weights: {str(e)}")
                if os.path.exists(cached_lora_path):
                    os.remove(cached_lora_path)
                raise
            except requests.exceptions.RequestException as e:
                logger.error(f"Request error downloading LoRA weights: {str(e)}")
                if os.path.exists(cached_lora_path):
                    os.remove(cached_lora_path)
                raise
            
        except Exception as e:
            logger.error(f"Failed to download LoRA weights: {str(e)}")
            raise e

    def generate_images_with_lora(self, prompt: str, studio_id: str, logger):
        """Generate 4 images using ComfyUI with LoRA weights."""
        try:
            # Ensure LoRA directory exists
            lora_dir = "/root/comfy/ComfyUI/models/loras"
            os.makedirs(lora_dir, exist_ok=True)
            
            # Load workflow template
            workflow_data = json.loads(Path("/root/workflow_api.json").read_text())
            
            # Update workflow with prompt
            workflow_data["6"]["inputs"]["text"] = prompt
            
            # Set batch size to 4 for generating 4 images
            workflow_data["5"]["inputs"]["batch_size"] = 4
            
            # Set unique filename prefix
            client_id = f"{studio_id}_{uuid.uuid4().hex}"
            workflow_data["9"]["inputs"]["filename_prefix"] = client_id
            
            # Randomize seed for different images each time
            import random
            random_seed = random.randint(1, 2**63 - 1)  # Generate large random seed
            workflow_data["25"]["inputs"]["noise_seed"] = random_seed
            logger.info(f"Using random seed: {random_seed}")
            
            # Use cached LoRA filename based on studio_id
            lora_filename = f"{studio_id}.safetensors"
            if "27" in workflow_data and workflow_data["27"]["class_type"] == "LoraLoaderModelOnly":
                workflow_data["27"]["inputs"]["lora_name"] = lora_filename
                logger.info(f"Using cached LoRA file: {lora_filename}")
            
            # Save updated workflow
            workflow_file = f"/tmp/{client_id}.json"
            with open(workflow_file, 'w') as f:
                json.dump(workflow_data, f)
            
            logger.info(f"Generated workflow file: {workflow_file}")
            
            # Run inference
            self.poll_server_health()
            cmd = f"comfy run --workflow {workflow_file} --wait --timeout 1200 --verbose"
            logger.info(f"Running ComfyUI command: {cmd}")
            print(f"Running ComfyUI command: {cmd}")
            
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            
            if result.returncode != 0:
                logger.error(f"ComfyUI command failed with return code {result.returncode}")
                logger.error(f"STDOUT: {result.stdout}")
                logger.error(f"STDERR: {result.stderr}")
                print(f"ComfyUI command failed with return code {result.returncode}")
                print(f"STDOUT: {result.stdout}")
                print(f"STDERR: {result.stderr}")
                raise subprocess.CalledProcessError(result.returncode, cmd, result.stdout, result.stderr)
            
            logger.info(f"ComfyUI inference completed: {result.stdout}")
            print(f"ComfyUI inference completed: {result.stdout}")
            
            # Find generated images
            output_dir = "/root/comfy/ComfyUI/output"
            image_paths = []
            
            for f in Path(output_dir).iterdir():
                if f.name.startswith(client_id) and f.suffix.lower() in ['.png', '.jpg', '.jpeg']:
                    image_paths.append(str(f))
            
            if not image_paths:
                raise Exception("No images were generated by ComfyUI")
            
            logger.info(f"Generated {len(image_paths)} images: {image_paths}")
            return image_paths
            
        except Exception as e:
            logger.error(f"Failed to generate images: {str(e)}")
            raise e

    def process_and_upload_images(self, image_paths: list, studio_id: str, logger):
        """Process images (original + watermarked) and upload to Cloudflare R2."""
        try:
            original_urls = []
            watermarked_urls = []
            
            logger.info(f"Starting to process {len(image_paths)} generated images for studio_id: {studio_id}")
            print(f"🖼️ Processing {len(image_paths)} generated images for upload to R2")
            
            for i, image_path in enumerate(image_paths, 1):
                logger.info(f"Processing image {i}/{len(image_paths)}: {image_path}")
                print(f"📸 Processing image {i}/{len(image_paths)}: {image_path}")
                
                # Process original image
                with open(image_path, 'rb') as f:
                    original_buffer = f.read()
                
                logger.info(f"Uploading original image {i} to R2...")
                print(f"⬆️ Uploading original image {i} to R2...")
                
                # Upload original image
                original_url = self.upload_to_r2(original_buffer, studio_id, "original", logger)
                original_urls.append(original_url)
                
                logger.info(f"Original image {i} uploaded successfully: {original_url}")
                print(f"✅ Original image {i} uploaded: {original_url}")
                
                # Create watermarked version with text overlay
                watermarked_buffer = self.apply_watermark(original_buffer, logger)
                
                logger.info(f"Uploading watermarked image {i} to R2...")
                print(f"⬆️ Uploading watermarked image {i} to R2...")
                
                # Upload watermarked image
                watermarked_url = self.upload_to_r2(watermarked_buffer, studio_id, "watermarked", logger)
                watermarked_urls.append(watermarked_url)
                
                logger.info(f"Watermarked image {i} uploaded successfully: {watermarked_url}")
                print(f"✅ Watermarked image {i} uploaded: {watermarked_url}")
            
            logger.info(f"UPLOAD SUMMARY: Processed and uploaded {len(original_urls)} original and {len(watermarked_urls)} watermarked images")
            print(f"📊 UPLOAD SUMMARY: {len(original_urls)} original + {len(watermarked_urls)} watermarked = {len(original_urls) + len(watermarked_urls)} total images uploaded")
            
            return {
                "original": original_urls,
                "watermarked": watermarked_urls
            }
            
        except Exception as e:
            logger.error(f"Failed to process and upload images: {str(e)}")
            raise e

    def apply_watermark(self, image_buffer: bytes, logger):
        """Apply text watermark to image using PIL."""
        try:
            from PIL import ImageDraw, ImageFont
            
            # Open the original image
            original_image = Image.open(io.BytesIO(image_buffer))
            
            # Convert to RGB if necessary
            if original_image.mode != 'RGB':
                original_image = original_image.convert('RGB')
            
            # Create a copy to work with
            watermarked_image = original_image.copy()
            
            # Create drawing context
            draw = ImageDraw.Draw(watermarked_image)
            
            # Watermark text
            watermark_text = "WWW.PROSHOOT.CO"
            
            # Calculate font size based on image dimensions (2% of image width)
            font_size = max(20, int(original_image.width * 0.02))
            
            try:
                # Try to use a built-in font
                font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
            except:
                try:
                    # Fallback to default font
                    font = ImageFont.load_default()
                except:
                    # If all else fails, use basic font
                    font = None
            
            # Get text dimensions
            if font:
                bbox = draw.textbbox((0, 0), watermark_text, font=font)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
            else:
                text_width = len(watermark_text) * 10
                text_height = 15
            
            # Create tiled watermark pattern
            spacing_x = text_width + 100
            spacing_y = text_height + 80
            
            # Tile the text across the image with rotation
            for x in range(-spacing_x, original_image.width + spacing_x, spacing_x):
                for y in range(-spacing_y, original_image.height + spacing_y, spacing_y):
                    # Create a temporary image for rotated text
                    txt_img = Image.new('RGBA', (text_width + 50, text_height + 50), (255, 255, 255, 0))
                    txt_draw = ImageDraw.Draw(txt_img)
                    
                    # Draw text with semi-transparent white color (opacity ~30%)
                    txt_draw.text((25, 25), watermark_text, font=font, fill=(255, 255, 255, 80))
                    
                    # Rotate the text
                    rotated_txt = txt_img.rotate(45, expand=1)
                    
                    # Paste the rotated text onto the main image
                    watermarked_image.paste(rotated_txt, (x, y), rotated_txt)
            
            # Convert back to RGB for JPEG output
            watermarked_rgb = watermarked_image.convert('RGB')
        
            # Save to buffer with lower quality for preview watermarked images
            output_buffer = io.BytesIO()
            watermarked_rgb.save(output_buffer, format='JPEG', quality=75)  # Lower quality for previews
            output_buffer.seek(0)
            
            return output_buffer.getvalue()
            
        except Exception as e:
            logger.error(f"Failed to apply watermark: {str(e)}")
            raise e

    @retry_with_backoff(
        max_retries=5,
        base_delay=2.0,
        max_delay=120.0,
        exceptions=(ClientError, BotoCoreError, Exception)
    )
    def upload_to_r2(self, image_buffer: bytes, studio_id: str, image_type: str, logger):
        """Upload image to Cloudflare R2 and return object key with retry logic."""
        try:
            # Validate inputs
            if not image_buffer or len(image_buffer) == 0:
                raise ValueError("Image buffer is empty")
            
            if not studio_id or not image_type:
                raise ValueError("studio_id and image_type are required")
            
            # Initialize Cloudflare R2 client with correct endpoint
            r2_account_id = os.environ.get('R2_ACCOUNT_ID')
            if not r2_account_id:
                raise Exception("R2_ACCOUNT_ID environment variable is required")
            
            r2_endpoint = f"https://{r2_account_id}.r2.cloudflarestorage.com"
            
            # Validate R2 credentials
            access_key = os.environ.get('R2_ACCESS_KEY_ID')
            secret_key = os.environ.get('R2_SECRET_ACCESS_KEY')
            if not access_key or not secret_key:
                raise Exception("R2 credentials (R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY) are required")
            
            r2_client = boto3.client(
                's3',
                endpoint_url=r2_endpoint,
                aws_access_key_id=access_key,
                aws_secret_access_key=secret_key,
                region_name='auto'
            )
            
            # Generate unique filename: studio_id/uuid.png
            filename = f"{uuid.uuid4()}.png"
            object_key = f"{studio_id}/{filename}"
            
            # Log upload attempt with size info
            image_size_kb = len(image_buffer) / 1024
            logger.info(f"Attempting to upload {image_type} image to R2 bucket 'images'")
            logger.info(f"Upload details - Key: {object_key}, Size: {image_size_kb:.2f} KB")
            print(f"📤 Uploading {image_type} image: {object_key} ({image_size_kb:.2f} KB)")
            
            # Upload to R2 with error handling
            try:
                r2_client.put_object(
                    Bucket='images',
                    Key=object_key,
                    Body=image_buffer,
                    ContentType='image/png',
                    Metadata={
                        'studio_id': studio_id,
                        'image_type': image_type,
                        'upload_timestamp': str(int(time.time()))
                    }
                )
                
                # Verify upload by checking if object exists
                try:
                    r2_client.head_object(Bucket='images', Key=object_key)
                    logger.info(f"✅ Successfully uploaded and verified {image_type} image to R2: {object_key}")
                    print(f"✅ Upload complete: {object_key}")
                except ClientError:
                    raise Exception(f"Upload verification failed for {object_key}")
                
                return object_key
                
            except ClientError as e:
                error_code = e.response['Error']['Code']
                if error_code == 'AccessDenied':
                    raise Exception(f"Access denied uploading to R2 bucket 'images': {error_code}")
                elif error_code == 'NoSuchBucket':
                    raise Exception(f"R2 bucket 'images' does not exist: {error_code}")
                elif error_code == 'InvalidRequest':
                    raise Exception(f"Invalid request to R2: {error_code}")
                else:
                    raise Exception(f"R2 client error: {error_code}")
            except BotoCoreError as e:
                raise Exception(f"R2 connection error: {str(e)}")
            
        except (ValueError, Exception) as e:
            logger.error(f"Failed to upload {image_type} image to R2: {str(e)}")
            sentry_sdk.capture_exception(e)
            raise

    @retry_with_backoff(
        max_retries=5,
        base_delay=1.0,
        max_delay=30.0,
        exceptions=(Exception,)
    )
    def insert_headshots_to_database(self, studio_id: str, prompt: str, image_urls: dict, supabase, logger):
        """Insert headshots directly into the headshots table with retry logic."""
        try:
            logger.info(f"Inserting headshots for studio_id: {studio_id}")
            
            # Validate inputs
            if not studio_id or not prompt:
                raise ValueError("studio_id and prompt are required")
            
            if not image_urls or not isinstance(image_urls, dict):
                raise ValueError("image_urls must be a non-empty dictionary")
            
            # Prepare headshots data for batch insert
            headshots_data = []
            original_urls = image_urls.get("original", [])
            watermarked_urls = image_urls.get("watermarked", [])
            
            # Validate URL lists
            if not original_urls and not watermarked_urls:
                raise ValueError("No image URLs provided")
            
            # Ensure we have the same number of original and watermarked URLs
            if len(original_urls) != len(watermarked_urls):
                logger.warning(f"Mismatch in URL counts: {len(original_urls)} original vs {len(watermarked_urls)} watermarked")
            
            # Create headshot records
            max_count = max(len(original_urls), len(watermarked_urls))
            for i in range(max_count):
                headshot_data = {
                    "studio_id": studio_id,
                    "prompt": prompt,
                    "preview": watermarked_urls[i] if i < len(watermarked_urls) else None,
                    "result": original_urls[i] if i < len(original_urls) else None
                }
                
                # Validate that at least one URL exists
                if headshot_data["preview"] or headshot_data["result"]:
                    headshots_data.append(headshot_data)
                else:
                    logger.warning(f"Skipping headshot record {i} - no URLs provided")
            
            # Batch insert headshots with error handling
            if headshots_data:
                logger.info(f"Attempting to insert {len(headshots_data)} headshot records")
                
                try:
                    result = supabase.table('headshots').insert(headshots_data).execute()
                    
                    # Validate result
                    if not result:
                        raise Exception("Supabase returned None result")
                    
                    if hasattr(result, 'data') and result.data:
                        inserted_count = len(result.data)
                        logger.info(f"Successfully inserted {inserted_count} headshots for studio_id: {studio_id}")
                        
                        # Verify all records were inserted
                        if inserted_count != len(headshots_data):
                            logger.warning(f"Expected to insert {len(headshots_data)} records, but only {inserted_count} were inserted")
                        
                        return inserted_count
                    else:
                        # Check for error in result
                        error_msg = "Unknown database error"
                        if hasattr(result, 'error') and result.error:
                            error_msg = str(result.error)
                        elif hasattr(result, 'data') and not result.data:
                            error_msg = "No data returned from insert operation"
                        
                        logger.error(f"Database insert failed: {error_msg}")
                        raise Exception(f"Failed to insert headshots: {error_msg}")
                        
                except Exception as db_error:
                    logger.error(f"Database operation failed: {str(db_error)}")
                    
                    # Check for specific database errors
                    error_str = str(db_error).lower()
                    if "connection" in error_str or "timeout" in error_str:
                        raise ConnectionError(f"Database connection error: {str(db_error)}")
                    elif "constraint" in error_str or "duplicate" in error_str:
                        raise ValueError(f"Database constraint error: {str(db_error)}")
                    else:
                        raise Exception(f"Database error: {str(db_error)}")
            else:
                logger.warning("No valid headshot data to insert")
                return 0
                
        except (ValueError, ConnectionError) as e:
            logger.error(f"Database operation error: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Failed to insert headshots to database: {str(e)}")
            sentry_sdk.capture_exception(e)
            raise

    def update_studio_status_to_completed(self, studio_id: str, supabase, logger):
        """Update studio status to COMPLETED in database."""
        try:
            logger.info(f"Updating studio status to COMPLETED for studio_id: {studio_id}")
            print(f"Updating studio status to COMPLETED for studio_id: {studio_id}")
            
            # Update studio status
            result = supabase.table('studios').update({'status': 'COMPLETED'}).eq('id', studio_id).execute()
            
            # Check if update was successful
            if hasattr(result, 'error') and result.error:
                logger.error(f"Database status update error: {result.error}")
                print(f"Database status update error: {result.error}")
                raise Exception(f"Failed to update studio status: {result.error}")
            
            logger.info(f"Successfully updated studio status to COMPLETED")
            print(f"Successfully updated studio status to COMPLETED")
            
        except Exception as e:
            logger.error(f"Failed to update studio status: {str(e)}")
            print(f"Failed to update studio status: {str(e)}")
            import traceback
            logger.error(f"Status update traceback: {traceback.format_exc()}")
            print(f"Status update traceback: {traceback.format_exc()}")
            raise e

    def send_completion_email(self, user_email: str, studio_id: str, logger):
        """Send completion email to user using ZeptoMail API."""
        try:
            # Get ZeptoMail credentials
            domain = os.environ.get("ZOHO_ZEPTOMAIL_URL")
            token = os.environ.get("ZOHO_ZEPTOMAIL_TOKEN")
            
            if not domain or not token:
                logger.warning("ZeptoMail credentials not found, skipping email")
                return
            
            # Prepare email content
            subject = "Your Headshots are Ready! 📸"
            dashboard_url = f"https://studio.proshoot.co/studio/{studio_id}"
            
            html_content = f"""
            <html>
            <body>
                <h2>Great news! Your headshots are ready! 🎉</h2>
                <p>Your professional headshots have been generated and are now available for download.</p>
                <p><a href="{dashboard_url}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Your Headshots</a></p>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p>{dashboard_url}</p>
                <br>
                <p>Warm regards,<br>Proshoot Team</p>
            </body>
            </html>
            """
            
            # Prepare API request
            url = "https://api.zeptomail.in/v1.1/email"
            
            payload = {
                "from": {"address": "support@proshoot.co"},
                "to": [{"email_address": {"address": user_email, "name": "User"}}],
                "subject": subject,
                "htmlbody": html_content
            }
            
            headers = {
                'accept': "application/json",
                'content-type': "application/json",
                'authorization': token,
            }
            
            # Send email via API with robust error handling
            session = requests.Session()
            session.mount('https://', requests.adapters.HTTPAdapter(max_retries=3))
            
            try:
                response = session.post(
                    url, 
                    json=payload, 
                    headers=headers,
                    timeout=(10, 30)  # (connect_timeout, read_timeout)
                )
                response.raise_for_status()
                
                logger.info(f"Email sent successfully to {user_email}")
                
            except (ChunkedEncodingError, ConnectionError, Timeout) as e:
                logger.error(f"Network error sending email: {str(e)}")
                raise ConnectionError(f"Failed to send email due to network error: {str(e)}")
            except requests.exceptions.HTTPError as e:
                logger.error(f"HTTP error sending email: {e.response.status_code} - {e.response.text}")
                raise Exception(f"Email API returned error {e.response.status_code}: {e.response.text}")
            except requests.exceptions.RequestException as e:
                logger.error(f"Request error sending email: {str(e)}")
                raise Exception(f"Failed to send email: {str(e)}")
            
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            # Don't raise exception for email failures
            sentry_sdk.capture_exception(e)

    @modal.fastapi_endpoint(method="POST", label="headshot-generator-2", requires_proxy_auth=True)
    def generate_headshots_api(self, request_data: Dict):
        """API endpoint for generating headshots with LoRA weights - returns immediately."""
        from fastapi import HTTPException
        
        try:
            # Validate required parameters
            required_fields = ["studio_id", "weights_url", "user_id", "prompt"]
            for field in required_fields:
                if field not in request_data:
                    raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
            
            # Extract parameters
            studio_id = request_data["studio_id"]
            weights_url = request_data["weights_url"]
            user_id = request_data["user_id"]
            prompt = request_data["prompt"]
            sendemail = request_data.get("sendemail", False)
            user_email = request_data.get("user_email", "")
            
            # Validate email if sendemail is True
            if sendemail and not user_email:
                raise HTTPException(status_code=400, detail="user_email is required when sendemail is True")
            
            # Start background processing (returns immediately)
            logging.info(f"Starting background headshot generation for studio_id: {studio_id}")
            self.generate_headshots_background.spawn(
                studio_id=studio_id,
                weights_url=weights_url,
                user_id=user_id,
                prompt=prompt,
                sendemail=sendemail,
                user_email=user_email
            )
            
            # Return immediately
            return {
                "studio_id": studio_id,
                "status": "started",
                "user_id": user_id,
                "message": "Headshot generation started in background"
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logging.error(f"API error: {str(e)}")
            sentry_sdk.capture_exception(e)
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

    @modal.method()
    def generate_headshots_background(self, studio_id: str, weights_url: str, user_id: str, prompt: str, sendemail: bool, user_email: str):
        """Background method that does the actual headshot generation."""
        try:
            # Call the existing generation method
            result = self.generate_headshots(
                studio_id=studio_id,
                weights_url=weights_url,
                user_id=user_id,
                prompt=prompt,
                sendemail=sendemail,
                user_email=user_email
            )
            logging.info(f"Background headshot generation completed for studio_id: {studio_id}")
            return result
            
        except Exception as e:
            logging.error(f"Background headshot generation failed for studio_id: {studio_id}: {str(e)}")
            sentry_sdk.capture_exception(e)
            raise e