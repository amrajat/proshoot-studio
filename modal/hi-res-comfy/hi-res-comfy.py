import json
import subprocess
import uuid
from pathlib import Path
from typing import Dict

import modal
import modal.experimental

image = (  # build up a Modal Image to run ComfyUI, step by step
    modal.Image.debian_slim(  # start from basic Linux with Python
        python_version="3.11"
    )
    .apt_install("git")  # install git to clone ComfyUI
    .pip_install("fastapi[standard]==0.115.4")  # install web dependencies
    .pip_install("comfy-cli==1.4.1")  # install comfy-cli
    .pip_install("boto3==1.35.0")  # install boto3 for R2 uploads
    .pip_install("requests==2.31.0")  # install requests for webhooks
    .pip_install("Pillow==10.4.0")  # install PIL for image watermarking
    .pip_install("supabase==2.8.0")  # install Supabase client for database operations
    .run_commands(  # use comfy-cli to install ComfyUI and its dependencies
        "comfy --skip-prompt install --fast-deps --nvidia --version 0.3.41"
    )
)

image = (
    image.
    run_commands(  # download a custom node
        "comfy node install --fast-deps rgthree-comfy"
    )
    .run_commands(  # download a custom node
        "comfy node install --fast-deps comfyui-easy-use"
    )
    .run_commands(  # download a custom node
        "comfy node install --fast-deps comfyui-florence2"
    )
    .run_commands(  # download a custom node
        "comfy node install --fast-deps comfyui_ttp_toolset"
    )
    .run_commands(  # download a custom node
        "git clone https://github.com/shiimizu/ComfyUI-TiledDiffusion /root/comfy/ComfyUI/custom_nodes/ComfyUI-TiledDiffusion"
    )
    .run_commands(  # download a custom node
        "git clone https://github.com/pythongosssss/ComfyUI-Custom-Scripts.git /root/comfy/ComfyUI/custom_nodes/ComfyUI-Custom-Scripts"
    )
    .run_commands(  # download a custom node
        "git clone https://github.com/Suzie1/ComfyUI_Comfyroll_CustomNodes.git /root/comfy/ComfyUI/custom_nodes/ComfyUI_Comfyroll_CustomNodes"
    )
    .run_commands(  # download a custom node
        "comfy node install --fast-deps comfyui_essentials_mb"
    )
    .run_commands(  # download a custom node
        "comfy node install --fast-deps comfyui-inspire-pack"
    )
    .run_commands(  # download a custom node
        "comfy node install --fast-deps comfyui-impact-pack"
    )
    .run_commands("git clone https://github.com/miaoshouai/ComfyUI-Miaoshouai-Tagger.git /root/comfy/ComfyUI/custom_nodes/ComfyUI-Miaoshouai-Tagger")
    .run_commands("git clone https://github.com/ltdrdata/was-node-suite-comfyui.git /root/comfy/ComfyUI/custom_nodes/was-node-suite-comfyui")
    .run_commands("pip install -r /root/comfy/ComfyUI/custom_nodes/ComfyUI-Miaoshouai-Tagger/requirements.txt")
    .run_commands("pip install -r /root/comfy/ComfyUI/custom_nodes/was-node-suite-comfyui/requirements.txt")
)


def hf_download():
    from huggingface_hub import hf_hub_download, login, snapshot_download
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
    os.makedirs("/root/comfy/ComfyUI/models/upscale_models", exist_ok=True)
    os.makedirs("/root/comfy/ComfyUI/models/LLM/microsoft-Florence-2-large", exist_ok=True)

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
    nmkd_model = hf_hub_download(
        repo_id="gemasai/4x_NMKD-Siax_200k",
        filename="4x_NMKD-Siax_200k.pth",
        cache_dir="/cache",
        token=hf_token,
    )

    
    snapshot_download(repo_id="microsoft/Florence-2-large", local_dir="/root/comfy/ComfyUI/models/LLM/microsoft-Florence-2-large")

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

    subprocess.run(
        f"ln -sf {nmkd_model} /root/comfy/ComfyUI/models/upscale_models/4x_NMKD-Siax_200k.pth",
        shell=True,
        check=True,
    )



vol = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)



image = (
    # install huggingface_hub with hf_transfer support to speed up downloads
    image.pip_install("huggingface_hub[hf_transfer]==0.30.0")
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
    Path(__file__).parent / "hi-res-comfy.json", "/root/hi-res-comfy.json"
)


# ## Running ComfyUI interactively

# Spin up an interactive ComfyUI server by wrapping the `comfy launch` command in a Modal Function
# and serving it as a [web server](https://modal.com/docs/guide/webhooks#non-asgi-web-servers).

app = modal.App(name="example-comfyapp", image=image)


# @app.function(
#     max_containers=1,  # limit interactive session to 1 container
#     gpu="L40S",  # good starter GPU for inference
#     volumes={"/cache": vol},  # mounts our cached models
# )
# @modal.concurrent(
#     max_inputs=10
# )  # required for UI startup process which runs several API calls concurrently
# @modal.web_server(8000, startup_timeout=60)
# def ui():
#     subprocess.Popen("comfy launch -- --listen 0.0.0.0 --port 8000", shell=True)


# At this point you can run `modal serve 06_gpu_and_ml/comfyui/comfyapp.py` and open the UI in your browser for the classic ComfyUI experience.

# Remember to **close your UI tab** when you are done developing.
# This will close the connection with the container serving ComfyUI and you will stop being charged.

# ## Running ComfyUI as an API

# To run a workflow as an API:

# 1. Stand up a "headless" ComfyUI server in the background when the app starts.

# 2. Define an `infer` method that takes in a workflow path and runs the workflow on the ComfyUI server.

# 3. Create a web handler `api` as a web endpoint, so that we can run our workflow as a service and accept inputs from clients.

# We group all these steps into a single Modal `cls` object, which we'll call `ComfyUI`.


@app.cls(
    scaledown_window=30,  # 30 seconds container keep alive after it processes an input
    timeout=600, # 10 minutes timeout
    gpu="H100",
    max_containers=1
    enable_memory_snapshot=True,
    experimental_options={"enable_gpu_snapshot": True},
    volumes={"/cache": vol},
    secrets=[
        modal.Secret.from_name("cloudflare-r2-credentials"),  # Cloudflare R2 credentials
        modal.Secret.from_name("huggingface-token"),          # Hugging Face token
        modal.Secret.from_name("supabase-credentials")        # Supabase credentials
    ]
)
@modal.concurrent(max_inputs=2)  # run 2 inputs per container
class ComfyUI:
    port: int = 8000

    @modal.enter()
    def launch_comfy_background(self):
        # launch the ComfyUI server exactly once when the container starts
        cmd = f"comfy launch --background -- --port {self.port}"
        subprocess.run(cmd, shell=True, check=True)

    @modal.method()
    def infer(self, workflow_path: str = "/root/hi-res-comfy.json"):
        # sometimes the ComfyUI server stops responding (we think because of memory leaks), so this makes sure it's still up
        self.poll_server_health()

        # runs the comfy run --workflow command as a subprocess
        cmd = f"comfy run --workflow {workflow_path} --wait --timeout 1200 --verbose"
        subprocess.run(cmd, shell=True, check=True)

        # completed workflows write output images to this directory
        output_dir = "/root/comfy/ComfyUI/output"

        # Extract request_id from workflow filename to find all related images
        workflow_filename = Path(workflow_path).stem  # Gets filename without extension
        request_id_prefix = workflow_filename  # This should be our request_id
        
        print(f"Looking for images with prefix: {request_id_prefix}")
        
        generated_images = []
        for f in Path(output_dir).iterdir():
            if f.name.startswith(request_id_prefix) and f.is_file():
                print(f"Found generated image: {f.name}")
                generated_images.append((f.name, f.read_bytes()))

        return generated_images

    def upload_to_r2(self, image_bytes: bytes, s3_path: str, filename: str):
        """Upload image to Cloudflare R2 storage"""
        import os
        import boto3
        from botocore.exceptions import ClientError
        import mimetypes

        # Get Cloudflare R2 credentials from Modal secrets
        r2_account_id = os.environ.get("R2_ACCOUNT_ID")
        r2_access_key_id = os.environ.get("R2_ACCESS_KEY_ID")
        r2_secret_access_key = os.environ.get("R2_SECRET_ACCESS_KEY")
        r2_bucket = os.environ.get("R2_BUCKET_NAME")
        
        if not all([r2_account_id, r2_access_key_id, r2_secret_access_key, r2_bucket]):
            raise ValueError("Missing Cloudflare R2 credentials in secrets. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME")

        # Construct Cloudflare R2 S3-compatible endpoint
        s3_endpoint = f"https://{r2_account_id}.r2.cloudflarestorage.com"

        # Create S3 client for Cloudflare R2
        s3_client = boto3.client(
            's3',
            endpoint_url=s3_endpoint,
            aws_access_key_id=r2_access_key_id,
            aws_secret_access_key=r2_secret_access_key,
            region_name='auto'  # R2 uses 'auto' for region
        )

        # Construct full S3 key
        s3_key = f"{s3_path.strip('/')}/{filename}"

        # Determine content type from filename
        content_type, _ = mimetypes.guess_type(filename)
        if content_type is None:
            content_type = 'application/octet-stream' # Fallback

        try:
            # Upload image to Cloudflare R2
            s3_client.put_object(
                Bucket=r2_bucket,
                Key=s3_key,
                Body=image_bytes,
                ContentType=content_type
            )
            
            
            # Default R2 public URL format
            public_url = f"https://pub-{r2_account_id}.r2.dev/{s3_key}"
            
            return public_url
        except ClientError as e:
            raise Exception(f"Failed to upload to Cloudflare R2: {str(e)}")

    def download_lora_from_datasets_bucket(self, lora_s3_key: str) -> str:
        """Download LoRA file from datasets R2 bucket and cache it locally."""
        import boto3
        import hashlib
        import os
        from pathlib import Path
        from botocore.exceptions import ClientError

        # Create loras directory if it doesn't exist
        loras_dir = Path("/root/comfy/ComfyUI/models/loras")
        loras_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate filename from S3 key hash to avoid conflicts and enable caching
        key_hash = hashlib.md5(lora_s3_key.encode()).hexdigest()[:12]
        lora_filename = f"lora_{key_hash}.safetensors"
        lora_path = loras_dir / lora_filename
        
        # Check if file already exists (cached)
        if lora_path.exists():
            print(f"LoRA already cached: {lora_filename}")
            # Update access time to mark as recently used
            os.utime(lora_path, None)
            return lora_filename
        
        print(f"Downloading LoRA from datasets bucket: {lora_s3_key}")
        
        try:
            # Get R2 credentials from Modal secrets
            r2_account_id = os.environ.get("R2_ACCOUNT_ID")
            r2_access_key_id = os.environ.get("R2_ACCESS_KEY_ID")
            r2_secret_access_key = os.environ.get("R2_SECRET_ACCESS_KEY")
            weights_bucket = "weights"  # Fixed bucket name for weights
            
            if not all([r2_account_id, r2_access_key_id, r2_secret_access_key]):
                raise ValueError("Missing Cloudflare R2 credentials in secrets")

            # Construct Cloudflare R2 S3-compatible endpoint
            s3_endpoint = f"https://{r2_account_id}.r2.cloudflarestorage.com"

            # Create S3 client for Cloudflare R2
            s3_client = boto3.client(
                's3',
                endpoint_url=s3_endpoint,
                aws_access_key_id=r2_access_key_id,
                aws_secret_access_key=r2_secret_access_key,
                region_name='auto'
            )

            # Download the LoRA file directly
            s3_client.download_file(weights_bucket, lora_s3_key, str(lora_path))
            
            print(f"LoRA downloaded and cached as: {lora_filename} ({lora_path.stat().st_size/1024/1024:.1f}MB)")
            return lora_filename
                
        except ClientError as e:
            print(f"Failed to download LoRA from datasets bucket: {str(e)}")
            raise Exception(f"LoRA download failed: {str(e)}")
        except Exception as e:
            print(f"Failed to process LoRA from {lora_s3_key}: {str(e)}")
            raise Exception(f"LoRA processing failed: {str(e)}")
    
    def send_webhook(self, webhook_url: str, payload: Dict):
        """Send webhook callback with generation results"""
        import requests
        
        try:
            response = requests.post(
                webhook_url,
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            print(f"Webhook sent to {webhook_url}, status: {response.status_code}")
            return True
        except Exception as e:
            print(f"Failed to send webhook to {webhook_url}: {str(e)}")
            return False

    def create_watermark_image(self, image_bytes: bytes) -> bytes:
        """Create a watermarked version of the image using PIL"""
        from PIL import Image, ImageDraw, ImageFont
        import io
        import math
        
        # Open the image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Create a copy for watermarking
        watermarked = image.copy()
        
        # Create watermark overlay
        overlay = Image.new('RGBA', watermarked.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        
        # Watermark text
        watermark_text = "HEADSSHOT.COM"
        
        # Calculate font size based on image dimensions
        font_size = max(20, min(watermarked.width, watermarked.height) // 25)
        
        try:
            # Try to use a built-in font
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        except:
            # Fallback to default font
            font = ImageFont.load_default()
        
        # Get text dimensions
        bbox = draw.textbbox((0, 0), watermark_text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Calculate spacing for tiled watermark
        spacing_x = text_width + 50
        spacing_y = text_height + 50
        
        # Create tiled watermark pattern
        for y in range(-spacing_y, watermarked.height + spacing_y, spacing_y):
            for x in range(-spacing_x, watermarked.width + spacing_x, spacing_x):
                # Add some offset for alternating rows
                offset_x = (spacing_x // 2) if (y // spacing_y) % 2 else 0
                draw.text((x + offset_x, y), watermark_text, font=font, fill=(255, 255, 255, 80))
        
        # Apply watermark overlay
        watermarked = Image.alpha_composite(watermarked.convert('RGBA'), overlay)
        watermarked = watermarked.convert('RGB')
        
        # Save to bytes
        output = io.BytesIO()
        watermarked.save(output, format='PNG', quality=95)
        return output.getvalue()
    
    def insert_headshot_record(self, user_id: str, studio_id: str, prompt: str, preview_key: str, result_key: str, hd_key: str):
        """Insert headshot record into Supabase database with retry logic"""
        import os
        import time
        from supabase import create_client, Client
        
        # Get Supabase credentials from Modal secrets
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        
        if not all([supabase_url, supabase_service_key]):
            raise ValueError("Missing Supabase credentials in secrets")
        
        print(f"Connecting to Supabase: {supabase_url[:50]}...")
        print(f"Using service key: {supabase_service_key[:20]}...")
        
        # Retry logic for database insertion
        max_retries = 3
        for attempt in range(max_retries):
            try:
                print(f"Creating Supabase client (attempt {attempt + 1})...")
                # Create Supabase client with service role key
                supabase: Client = create_client(supabase_url, supabase_service_key)
                print("Supabase client created successfully")
                
                # Prepare insert data
                insert_data = {
                    'studio_id': studio_id,
                    'preview': preview_key,
                    'result': result_key,
                    'hd': hd_key,
                    'prompt': prompt
                }
                print(f"Inserting data: {insert_data}")
                
                # Insert headshot record
                result = supabase.table('headshots').insert(insert_data).execute()
                print(f"Insert result type: {type(result)}")
                print(f"Insert result: {result}")
                
                if result.data and len(result.data) > 0:
                    print(f"Headshot record inserted successfully: {result.data[0]['id']}")
                    return result.data[0]['id']
                else:
                    raise Exception("No data returned from insert operation")
                    
            except Exception as e:
                print(f"Database insertion attempt {attempt + 1} failed: {str(e)}")
                if attempt < max_retries - 1:
                    print(f"Retrying in {2 ** attempt} seconds...")
                    time.sleep(2 ** attempt)  # Exponential backoff
                else:
                    print(f"All {max_retries} attempts failed")
                    raise Exception(f"Database insertion failed after {max_retries} attempts: {str(e)}")
    
    @modal.method()
    def run_generation(self, item: Dict, request_id: str):
        import time
        import uuid
        from pathlib import Path
        import json

        try:
            # Load and prepare workflow
            workflow_data = json.loads(
                (Path(__file__).parent / "hi-res-comfy.json").read_text()
            )

            # Insert the prompt into the CR Prompt Text node (25)
            workflow_data["25"]["inputs"]["prompt"] = item["prompt"]

            # Handle LoRA object key if provided
            if "lora_object_key" in item:
                try:
                    lora_filename = self.download_lora_from_datasets_bucket(item["lora_object_key"])
                    print(f"Using LoRA: {lora_filename}")
                    
                    # Update LoRA loader node (162) with the new LoRA file
                    workflow_data["162"]["inputs"]["lora_name"] = lora_filename
                    workflow_data["162"]["inputs"]["strength_model"] = item.get("lora_strength", 1.0)
                    workflow_data["162"]["inputs"]["strength_clip"] = item.get("lora_strength", 1.0)
                    
                except Exception as e:
                    print(f"LoRA processing failed: {str(e)}")
                    # Keep default LoRA if download fails
                    print("Continuing with default LoRA")

            # Generate random seeds for unique images every time
            import random
            seed1 = random.randint(0, 2**32 - 1)
            seed2 = random.randint(0, 2**32 - 1)
            print(f"Using random seeds: {seed1}, {seed2}")
            
            # Update RandomNoise nodes with unique seeds
            for node_id, node in workflow_data.items():
                if node.get("class_type") == "RandomNoise":
                    if node_id == "65":  # First RandomNoise node
                        node["inputs"]["noise_seed"] = seed1
                        print(f"Set noise_seed {seed1} for RandomNoise node {node_id}")
                    elif node_id == "70":  # Second RandomNoise node  
                        node["inputs"]["noise_seed"] = seed2
                        print(f"Set noise_seed {seed2} for RandomNoise node {node_id}")
            
            # Set filename_prefix for specific SaveImage nodes
            target_prefixes = ["standard", "8m"]  # Updated to match actual workflow
            for node in workflow_data.values():
                if node.get("class_type") == "SaveImage":
                    original_prefix = node.get("inputs", {}).get("filename_prefix")
                    if original_prefix in target_prefixes:
                        node["inputs"]["filename_prefix"] = f"{request_id}_{original_prefix}"

            # Save updated workflow
            new_workflow_file = f"{request_id}.json"
            json.dump(workflow_data, Path(new_workflow_file).open("w"))

            # Run inference
            generated_images = self.infer.local(new_workflow_file)
        
        except Exception as e:
            print(f"Error in workflow preparation: {str(e)}")
            # Send error webhook if configured
            webhook_url = item.get("webhook_url")
            if webhook_url:
                response_data = {
                    "request_id": request_id,
                    "success": False,
                    "error": f"Workflow preparation failed: {str(e)}",
                    "timestamp": int(time.time())
                }
                self.send_webhook(webhook_url, response_data)
            return
        
        if not generated_images:
            print("No images generated")
            # Send webhook if configured
            webhook_url = item.get("webhook_url")
            if webhook_url:
                response_data = {
                    "request_id": request_id,
                    "success": False,
                    "error": "No images generated",
                    "timestamp": int(time.time())
                }
                self.send_webhook(webhook_url, response_data)
            return
        
        print(f"Generated {len(generated_images)} images")
        
        # Debug: Print all generated filenames
        for filename, _ in generated_images:
            print(f"Generated file: {filename}")
        
        # Separate standard and 8m images
        standard_image = None
        hd_image = None
        
        for filename, img_bytes in generated_images:
            print(f"Processing file: {filename}")
            if "standard" in filename:
                standard_image = (filename, img_bytes)
                print(f"Found standard image: {filename}")
            elif "8m" in filename:
                hd_image = (filename, img_bytes)
                print(f"Found HD (8m) image: {filename}")
        
        if not standard_image:
            print("No standard image found")
            # Send error webhook if configured
            webhook_url = item.get("webhook_url")
            if webhook_url:
                response_data = {
                    "request_id": request_id,
                    "success": False,
                    "error": "No standard image generated",
                    "timestamp": int(time.time())
                }
                self.send_webhook(webhook_url, response_data)
            return
        
        if not hd_image:
            print("Warning: No HD (8m) image found - will proceed without it")
        
        try:
            user_id = item["user_id"]
            studio_id = item["studio_id"]
            prompt = item["prompt"]
            
            # Generate unique image UUIDs
            preview_uuid = str(uuid.uuid4())
            result_uuid = str(uuid.uuid4())
            hd_uuid = str(uuid.uuid4())
            
            # Create watermarked version of standard image
            print("Creating watermarked preview image...")
            watermarked_bytes = self.create_watermark_image(standard_image[1])
            
            # Upload images to R2 with proper naming
            # Format: user_id/studio_id/request_id/image_prefix_uuid.png
            base_path = f"{user_id}/{studio_id}/{request_id}"
            
            # Upload preview (watermarked)
            preview_filename = f"preview_{preview_uuid}.png"
            preview_key = f"{base_path}/{preview_filename}"
            preview_url = self.upload_to_r2(watermarked_bytes, base_path, preview_filename)
            print(f"Uploaded preview image: {preview_url}")
            
            # Upload result (standard)
            result_filename = f"standard_{result_uuid}.png"
            result_key = f"{base_path}/{result_filename}"
            result_url = self.upload_to_r2(standard_image[1], base_path, result_filename)
            print(f"Uploaded result image: {result_url}")
            
            # Upload HD image if available
            hd_url = None
            hd_key = None
            if hd_image:
                hd_filename = f"hd_{hd_uuid}.png"
                hd_key = f"{base_path}/{hd_filename}"
                hd_url = self.upload_to_r2(hd_image[1], base_path, hd_filename)
                print(f"Uploaded HD image: {hd_url}")
            
            # Insert record into Supabase
            print("Inserting headshot record into database...")
            headshot_id = self.insert_headshot_record(
                user_id=user_id,
                studio_id=studio_id,
                prompt=prompt,
                preview_key=preview_key,
                result_key=result_key,
                hd_key=hd_key
            )
            
            # Send webhook if configured
            webhook_url = item.get("webhook_url")
            if webhook_url:
                response_data = {
                    "request_id": request_id,
                    "success": True,
                    "headshot_id": headshot_id,
                    "preview_url": preview_url,
                    "result_url": result_url,
                    "hd_url": hd_url,
                    "prompt": prompt,
                    "timestamp": int(time.time())
                }
                print(f"Sending webhook for request {request_id} to {webhook_url}")
                self.send_webhook(webhook_url, response_data)
            
            print(f"Generation completed successfully for request {request_id}")
            
        except Exception as e:
            print(f"Error processing generation: {str(e)}")
            # Send error webhook if configured
            webhook_url = item.get("webhook_url")
            if webhook_url:
                response_data = {
                    "request_id": request_id,
                    "success": False,
                    "error": str(e),
                    "timestamp": int(time.time())
                }
                self.send_webhook(webhook_url, response_data)



    @modal.fastapi_endpoint(method="POST")
    def api(self, item: Dict):
        from fastapi import Response
        import time

        # Validate required fields
        required_fields = ["prompt", "user_id", "studio_id"]
        for field in required_fields:
            if field not in item:
                return {"error": f"Missing required field: {field}"}, 400

        # Generate unique request ID immediately
        request_id = uuid.uuid4().hex
        
        # Spawn the generation task to run in the background with all processing
        self.run_generation.spawn(item, request_id)

        # Immediately return a response to the client
        return {
            "status": "success",
            "message": "Request accepted and is being processed.",
            "request_id": request_id
        }

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




# ## More resources
# - Use [memory snapshots](https://modal.com/docs/guide/memory-snapshot) to speed up cold starts (check out the `memory_snapshot` directory on [Github](https://github.com/modal-labs/modal-examples/tree/main/06_gpu_and_ml/comfyui))
# - Run a ComfyUI workflow as a [Python script](https://modal.com/blog/comfyui-prototype-to-production)


# - Understand tradeoffs of parallel processing strategies when
# [scaling ComfyUI](https://modal.com/blog/scaling-comfyui)