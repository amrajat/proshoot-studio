import io
import os
import zipfile
import json
import tarfile
import tempfile
import requests
from typing import Dict, Any, Optional

import modal
import boto3
from fastapi import HTTPException, Request
from pydantic import BaseModel
from supabase import create_client, Client

# Define the Modal image, installing necessary packages
image = modal.Image.debian_slim().pip_install(
    "requests", "boto3", "replicate", "Pillow", "fastapi[standard]", "supabase"
)

# Define the Modal app and secrets
app = modal.App(
    "replicate-lora-trainer",
    image=image,
    secrets=[
        modal.Secret.from_name("cloudflare-r2-credentials"),
        modal.Secret.from_name("replicate-api-token"),
        modal.Secret.from_name("webhook-credentials"),
        modal.Secret.from_name("supabase-credentials"),
        modal.Secret.from_name("general-variables"),
    ],
)

# Pydantic models
class TrainingRequest(BaseModel):
    object_key: str
    gender: str
    user_id: str
    plan: str
    studio_id: str

class WebhookPayload(BaseModel):
    id: str
    status: str
    output: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

# Utility functions for request type detection
def is_training_request(body: Dict[str, Any]) -> bool:
    """Check if request body is a training request"""
    training_fields = {"object_key", "gender", "user_id", "plan", "studio_id"}
    return training_fields.issubset(set(body.keys()))

def is_webhook_payload(body: Dict[str, Any]) -> bool:
    """Check if request body is a Replicate webhook payload"""
    webhook_fields = {"id", "status"}
    return webhook_fields.issubset(set(body.keys()))

# Main endpoint with intelligent request routing
@app.function(cpu=1, timeout=600, scaledown_window=2)
@modal.fastapi_endpoint(method="POST", label="replicate-lora-trainer")
async def handle_request(request: Request):
    """Main endpoint that routes requests based on body structure"""
    try:
        # Parse request body
        body = await request.body()
        body_data = json.loads(body.decode('utf-8'))
        
        print(f"📥 Received request with keys: {list(body_data.keys())}")
        
        # Route based on request structure
        if is_training_request(body_data):
            print("🚀 Routing to training handler")
            training_req = TrainingRequest(**body_data)
            return await handle_training_request(training_req)
            
        elif is_webhook_payload(body_data):
            print("🔔 Routing to webhook handler")
            return await handle_webhook_payload(request, body_data)
            
        else:
            raise HTTPException(
                status_code=400, 
                detail=f"Unknown request type. Keys found: {list(body_data.keys())}"
            )
            
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    except Exception as e:
        print(f"❌ Error handling request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Webhook payload handler
async def handle_webhook_payload(request: Request, webhook_data: Dict[str, Any]):
    """Handle Replicate webhook payload for training completion"""
    try:
        # Extract query parameters for webhook context
        query_params = dict(request.query_params)
        user_id = query_params.get('user_id')
        studio_id = query_params.get('studio_id')
        secret = query_params.get('secret')
        
        print(f"🔔 Processing webhook for user_id: {user_id}, studio_id: {studio_id}")
        
        # Validate required parameters
        if not all([user_id, studio_id]):
            raise HTTPException(status_code=400, detail="Missing user_id or studio_id in query params")
        
        # Validate webhook secret
        expected_secret = os.environ.get('WEBHOOK_SECRET')
        if expected_secret and secret != expected_secret:
            raise HTTPException(status_code=401, detail="Invalid webhook secret")
        
        # Validate webhook payload structure
        webhook_payload = WebhookPayload(**webhook_data)
        
        # Check if training completed successfully
        if webhook_payload.status != 'succeeded':
            print(f"⚠️ Training not successful: {webhook_payload.status}")
            return {"status": "ignored", "reason": f"Training status: {webhook_payload.status}"}
        
        # Process the successful training completion
        return await process_training_completion(webhook_payload, user_id, studio_id)
        
    except Exception as e:
        print(f"❌ Error processing webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Webhook processing failed: {str(e)}")

# Process training completion
async def process_training_completion(webhook_payload: WebhookPayload, user_id: str, studio_id: str):
    """Process successful training completion"""
    try:
        # Find the trained model URL
        trained_model_url = find_trained_model_url(webhook_payload.output)
        if not trained_model_url:
            raise HTTPException(status_code=400, detail="No trained model (.tar) found in output")
        
        print(f"📦 Found trained model: {trained_model_url}")
        
        # Download and extract the model
        lora_weights = await download_and_extract_model(trained_model_url)
        
        # Upload to R2 storage
        weights_url = await upload_to_r2_storage(lora_weights, user_id, studio_id)
        
        # Update database
        await update_studio_record(user_id, studio_id, webhook_payload.id, weights_url)
        
        # Notify Next.js app
        await notify_nextjs_completion(user_id, studio_id)
        
        return {
            "status": "success",
            "provider_id": webhook_payload.id,
            "message": "Training completion processed successfully",
            "weights": weights_url
        }
        
    except Exception as e:
        print(f"❌ Error processing training completion: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Training completion processing failed: {str(e)}")

# Helper functions
def find_trained_model_url(output: Optional[Dict[str, Any]]) -> Optional[str]:
    """Find the trained model URL from webhook output"""
    if not output:
        return None
    
    for key, value in output.items():
        if isinstance(value, str) and value.endswith('.tar'):
            return value
    return None

async def download_and_extract_model(trained_model_url: str) -> bytes:
    """Download and extract LoRA weights from trained model"""
    print(f"📦 Downloading trained model from: {trained_model_url}")
    
    temp_tar_path = None
    try:
        # Download the .tar file
        response = requests.get(trained_model_url, stream=True, timeout=300)
        response.raise_for_status()
        
        # Create temporary file for the tar
        with tempfile.NamedTemporaryFile(delete=False, suffix='.tar') as temp_tar:
            for chunk in response.iter_content(chunk_size=8192):
                temp_tar.write(chunk)
            temp_tar_path = temp_tar.name
        
        print(f"✅ Downloaded tar file to: {temp_tar_path}")
        
        # Extract lora.safetensors from the tar
        with tarfile.open(temp_tar_path, 'r') as tar:
            tar_members = tar.getnames()
            print(f"📁 Files in tar: {tar_members}")
            
            # Find lora.safetensors file
            lora_file = next((member for member in tar_members if member.endswith('lora.safetensors')), None)
            
            if not lora_file:
                raise ValueError("lora.safetensors not found in tar file")
            
            # Extract the content
            lora_member = tar.extractfile(lora_file)
            if not lora_member:
                raise ValueError("Failed to extract lora.safetensors")
            
            lora_content = lora_member.read()
            print(f"✅ Extracted lora.safetensors ({len(lora_content)} bytes)")
            
            return lora_content
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download/extract model: {str(e)}")
    finally:
        # Clean up temporary file
        if temp_tar_path and os.path.exists(temp_tar_path):
            os.unlink(temp_tar_path)

async def upload_to_r2_storage(lora_weights: bytes, user_id: str, studio_id: str) -> str:
    """Upload LoRA weights to R2 storage"""
    try:
        r2_account_id = os.environ["R2_ACCOUNT_ID"]
        r2_access_key_id = os.environ["R2_ACCESS_KEY_ID"]
        r2_secret_access_key = os.environ["R2_SECRET_ACCESS_KEY"]
        weights_bucket = "weights"  # Hardcoded bucket name for weights
        
        s3_client = boto3.client(
            service_name="s3",
            endpoint_url=f"https://{r2_account_id}.r2.cloudflarestorage.com",
            aws_access_key_id=r2_access_key_id,
            aws_secret_access_key=r2_secret_access_key,
            region_name="auto",
        )
        print("✅ R2 client initialized")
        
        upload_key = f"{user_id}/{studio_id}/lora.safetensors"
        print(f"☁️ Uploading lora.safetensors to: {upload_key}")
        
        s3_client.put_object(
            Bucket=weights_bucket,
            Key=upload_key,
            Body=lora_weights,
            ContentType='application/octet-stream'
        )
        
        print("✅ lora.safetensors uploaded to R2")
        
        # return f"https://{weights_bucket}.{r2_account_id}.r2.cloudflarestorage.com/{upload_key}"
        return upload_key
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload to R2: {str(e)}")

async def update_studio_record(user_id: str, studio_id: str, training_id: str, weights_url: str):
    """Update studio record in Supabase"""
    try:
        supabase_url = os.environ.get('SUPABASE_URL')
        supabase_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
        
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase credentials not configured")
        
        supabase: Client = create_client(supabase_url, supabase_key)
        
        print(f"🗄️ Updating studio record: {studio_id}")
        
        result = supabase.table('studios').update({'weights': weights_url, 'provider_id': training_id}).eq('id', studio_id).execute()
        
        if not result.data:
            print(f"⚠️ No studio record found with id: {studio_id}")
        else:
            print(f"✅ Studio record updated successfully")
            
    except Exception as e:
        print(f"❌ Failed to update Supabase record: {str(e)}")
        # Don't raise exception as the main process succeeded

async def notify_nextjs_completion(user_id: str, studio_id: str):
    """Notify Next.js app of training completion"""
    try:
        # nextjs_webhook_url = os.environ.get('WEBHOOK_SECRET')
        nextjs_webhook_url = "https://abb4205ce6f0.ngrok-free.app/api/webhooks/comfyui"
        if not nextjs_webhook_url:
            print("ℹ️ No Next.js webhook URL configured")
            return
        
        # Get Supabase client
        supabase_url = os.environ.get('SUPABASE_URL')
        supabase_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # Get updated studio data (excluding metadata)
        studio_data = supabase.table('studios').select('*').eq('id', studio_id).execute()
        
        if not studio_data.data:
            print(f"⚠️ Could not fetch studio data for webhook")
            return
        
        studio_record = studio_data.data[0]
        # Remove metadata column if present
        if 'metadata' in studio_record:
            del studio_record['metadata']
        
        webhook_payload = {
            'event': 'training_completed',
            'studio': studio_record
        }
        
        print(f"🔗 Calling Next.js webhook: {nextjs_webhook_url}")
        
        response = requests.post(
            nextjs_webhook_url,
            json=webhook_payload,
            timeout=30
        )
        
        if response.status_code == 200:
            print(f"✅ Next.js webhook called successfully")
        else:
            print(f"⚠️ Next.js webhook returned status: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Failed to call Next.js webhook: {str(e)}")
        # Don't raise exception as the main process succeeded

# Training request handler
async def handle_training_request(request: TrainingRequest):
    """Handle training request - start a new LoRA training job"""
    print(f"🚀 Starting training for studio: {request.studio_id}")
    
    try:
        # Call the synchronous training function
        return handle_training_request_sync(request)
    except Exception as e:
        print(f"❌ Error in training request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Training request failed: {str(e)}")

# Legacy training function (kept for compatibility)
def handle_training_request_sync(request: TrainingRequest):
    """Original training function that processes images and starts Replicate training"""
    import json
    from PIL import Image
    import boto3
    import replicate
    
    print(f"🚀 Processing training request for studio: {request.studio_id}")
    
    # Initialize R2 client for datasets bucket
    try:
        r2_account_id = os.environ["R2_ACCOUNT_ID"]
        r2_access_key_id = os.environ["R2_ACCESS_KEY_ID"]
        r2_secret_access_key = os.environ["R2_SECRET_ACCESS_KEY"]
        datasets_bucket = "datasets"
        
        s3_client = boto3.client(
            service_name="s3",
            endpoint_url=f"https://{r2_account_id}.r2.cloudflarestorage.com",
            aws_access_key_id=r2_access_key_id,
            aws_secret_access_key=r2_secret_access_key,
            region_name="auto",
        )
        print("✅ R2 client initialized")
    except KeyError as e:
        raise HTTPException(status_code=500, detail=f"R2 configuration error: Missing secret {e}")
    
    # Download and process images (simplified version)
    try:
        # Get crop data
        crop_data_key = f"{request.object_key}/crop_data.json"
        crop_data_response = s3_client.get_object(Bucket=datasets_bucket, Key=crop_data_key)
        crop_data = json.loads(crop_data_response['Body'].read().decode('utf-8'))
        
        valid_genders = ['woman', 'man']
        caption_gender = request.gender if request.gender in valid_genders else 'person'
        
        output_zip_buffer = io.BytesIO()
        processed_count = 0
        
        with zipfile.ZipFile(output_zip_buffer, 'w', zipfile.ZIP_DEFLATED) as z_out:
            for filename, crop_info in crop_data.items():
                try:
                    # Download original image
                    image_key = f"{request.object_key}/{filename}"
                    image_response = s3_client.get_object(Bucket=datasets_bucket, Key=image_key)
                    image_data = image_response['Body'].read()
                    
                    # Process image
                    image = Image.open(io.BytesIO(image_data))
                    
                    # Apply crop if specified
                    if crop_info:
                        crop_box = calculate_crop_box(crop_info, image.size)
                        image = image.crop(crop_box)
                    
                    # Resize to 1024x1024
                    image = image.resize((1024, 1024), Image.Resampling.LANCZOS)
                    
                    # Save processed image
                    processed_filename = f"image_{processed_count + 1:03d}.jpg"
                    img_buffer = io.BytesIO()
                    image.save(img_buffer, format='JPEG', quality=95)
                    z_out.writestr(processed_filename, img_buffer.getvalue())
                    
                    # Create caption
                    caption_filename = f"image_{processed_count + 1:03d}.txt"
                    caption_content = f'ohwx {caption_gender}'
                    z_out.writestr(caption_filename, caption_content)
                    
                    processed_count += 1
                    print(f"✅ Processed {processed_filename} ({processed_count}/{len(crop_data)})")
                    
                except Exception as e:
                    print(f"❌ Failed to process {filename}: {e}")
                    continue
        
        if processed_count == 0:
            raise HTTPException(status_code=400, detail="No images were successfully processed")
        
        print(f"🎉 Successfully processed {processed_count} images")
        output_zip_buffer.seek(0)
        
        # Upload processed dataset
        upload_filename = f"{request.object_key}/datasets.zip"
        s3_client.put_object(
            Bucket=datasets_bucket,
            Key=upload_filename,
            Body=output_zip_buffer.getvalue(),
            ContentType='application/zip'
        )
        
        # Generate presigned URL
        r2_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': datasets_bucket, 'Key': upload_filename},
            ExpiresIn=3600
        )
        
        # Start Replicate training
        webhook_base_url = os.environ.get("MODAL_REPLICATE_LORA_TRAINING_ENDPOINT")
        webhook_url = f"{webhook_base_url}?user_id={request.user_id}&studio_id={request.studio_id}&secret={os.environ.get('WEBHOOK_SECRET')}" if webhook_base_url else None
        
        training = replicate.trainings.create(
            model="ostris/flux-dev-lora-trainer",
            version="e440909d3512c31646ee2e0c7d6f6f4923224863a6a10c494606e79fb5844497",
            destination="prime-ai-co/headshots",
            input={
                "input_images": r2_url,
                "steps": 3000,
                "lora_rank": 32,
                "learning_rate": 0.0001,
                "optimizer": "adamw",
                "batch_size": 1,
                "resolution": "1024",
                "autocaption": False,
                "trigger_word": "ohwx",
                "wandb_project": "flux_train_replicate",
                "wandb_save_interval": 100,
                "caption_dropout_rate": 0.05,
                "wandb_sample_interval": 100,
            },
            webhook=webhook_url,
            webhook_events_filter=["completed"],
        )
        
        print(f"✅ Replicate training started: {training.id}")
        return training.dict()
        
    except Exception as e:
        print(f"❌ Training request failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process training request: {str(e)}")

def calculate_crop_box(crop_info, image_size):
    """
    Calculate crop box coordinates from crop_data.json format.
    crop_info format: {"unit": "%", "x": 25, "y": 25, "width": 50, "height": 50}
    """
    width, height = image_size
    
    # Convert percentage to pixel coordinates
    x_percent = crop_info.get('x', 0)
    y_percent = crop_info.get('y', 0)
    width_percent = crop_info.get('width', 100)
    height_percent = crop_info.get('height', 100)
    
    # Calculate pixel coordinates
    left = int((x_percent / 100) * width)
    top = int((y_percent / 100) * height)
    right = int(((x_percent + width_percent) / 100) * width)
    bottom = int(((y_percent + height_percent) / 100) * height)
    
    # Ensure coordinates are within image bounds
    left = max(0, min(left, width))
    top = max(0, min(top, height))
    right = max(left, min(right, width))
    bottom = max(top, min(bottom, height))
    
    return (left, top, right, bottom)