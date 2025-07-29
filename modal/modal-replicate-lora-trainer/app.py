from cProfile import label
import io
import os
import zipfile
from dataclasses import dataclass

import modal
from fastapi import HTTPException
from pydantic import BaseModel

# Define the Modal image, installing necessary packages
image = modal.Image.debian_slim().pip_install(
    "requests", "boto3", "replicate", "Pillow", "fastapi[standard]"
)

# Define the Modal app and secrets
app = modal.App(
    "replicate-lora-trainer",
    image=image,
    secrets=[
        modal.Secret.from_name("cloudflare-r2-credentials"),
        modal.Secret.from_name("replicate-api-token"),
        # modal.Secret.from_name("webhook-credentials"),  # For WEBHOOK_BASE_URL
    ],
  
)

# Pydantic model for the request body
class TrainingRequest(BaseModel):
    object_key: str  # Path to the R2 folder containing images and crop_data.json
    gender: str
    user_id: str
    user_email: str
    plan: str

@app.function(cpu=0.1, timeout=600, scaledown_window=2)  # Specify CPU and timeout
@modal.fastapi_endpoint(method="POST", requires_proxy_auth=True, label="replicate-lora-trainer")
def start_training(request: TrainingRequest):
    import json
    from PIL import Image
    import boto3
    import replicate

    MAX_IMAGES = 30
    TARGET_SIZE = (1024, 1024)
    
    print(f"🚀 Starting training for object_key: {request.object_key}")

    # 1. Initialize R2 client
    try:
        r2_account_id = os.environ["R2_ACCOUNT_ID"]
        r2_access_key_id = os.environ["R2_ACCESS_KEY_ID"]
        r2_secret_access_key = os.environ["R2_SECRET_ACCESS_KEY"]
        datasets_bucket = "datasets"  # Hardcoded bucket name for datasets

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

    # 2. Download crop_data.json from R2
    try:
        crop_data_key = f"{request.object_key}/crop_data.json"
        print(f"📥 Downloading crop data from: {crop_data_key}")
        
        crop_response = s3_client.get_object(Bucket=datasets_bucket, Key=crop_data_key)
        crop_data = json.loads(crop_response['Body'].read().decode('utf-8'))
        print(f"✅ Crop data loaded: {len(crop_data)} images")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to download crop data: {e}")

    # 3. Process images based on crop data
    valid_genders = ['woman', 'man']
    caption_gender = request.gender if request.gender in valid_genders else 'person'
    
    output_zip_buffer = io.BytesIO()
    processed_count = 0
    
    with zipfile.ZipFile(output_zip_buffer, 'w', zipfile.ZIP_DEFLATED) as z_out:
        for filename, crop_info in crop_data.items():
            if processed_count >= MAX_IMAGES:
                print(f"⚠️ Reached maximum image limit of {MAX_IMAGES}")
                break
                
            try:
                # Download original image from R2
                image_key = f"{request.object_key}/{filename}"
                print(f"📥 Downloading image: {image_key}")
                
                image_response = s3_client.get_object(Bucket=datasets_bucket, Key=image_key)
                image_data = image_response['Body'].read()
                
                # Open image with PIL
                original_image = Image.open(io.BytesIO(image_data))
                print(f"🖼️ Original image size: {original_image.size}")
                
                # Apply crop based on crop_data.json
                crop_box = calculate_crop_box(crop_info, original_image.size)
                cropped_image = original_image.crop(crop_box)
                print(f"✂️ Cropped to: {cropped_image.size}")
                
                # Resize to 1024x1024 with high quality
                resized_image = cropped_image.resize(TARGET_SIZE, Image.Resampling.LANCZOS)
                print(f"📏 Resized to: {resized_image.size}")
                
                # Convert to RGB if necessary (for JPEG compatibility)
                if resized_image.mode in ('RGBA', 'LA', 'P'):
                    rgb_image = Image.new('RGB', resized_image.size, (255, 255, 255))
                    if resized_image.mode == 'P':
                        resized_image = resized_image.convert('RGBA')
                    rgb_image.paste(resized_image, mask=resized_image.split()[-1] if resized_image.mode in ('RGBA', 'LA') else None)
                    resized_image = rgb_image
                
                # Save processed image to zip (high quality, no compression)
                img_buffer = io.BytesIO()
                resized_image.save(img_buffer, format='JPEG', quality=100, optimize=False)
                img_buffer.seek(0)
                
                # Use original filename but ensure .jpg extension
                base_name = os.path.splitext(filename)[0]
                processed_filename = f"{base_name}.jpg"
                
                z_out.writestr(processed_filename, img_buffer.getvalue())
                
                # Create caption file
                caption_filename = f"{base_name}.txt"
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

    # 4. Upload processed dataset zip to R2
    try:
        upload_filename = f"{request.object_key}/datasets.zip"
        print(f"☁️ Uploading processed dataset to: {upload_filename}")
        
        s3_client.put_object(
            Bucket=datasets_bucket,
            Key=upload_filename,
            Body=output_zip_buffer.getvalue(),
            ContentType='application/zip'
        )

        # Generate presigned URL for Replicate
        r2_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': datasets_bucket, 'Key': upload_filename},
            ExpiresIn=3600  # 1 hour
        )
        print(f"✅ Dataset uploaded, presigned URL generated")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload processed dataset: {e}")

    # 5. Trigger the Replicate training job
    try:
        # webhook_base_url = os.environ.get("REPLICATE_TRAINING_WEBHOOK_BASE_URL")
        # webhook_url = f"{webhook_base_url}?user_id={request.user_id}&user_email={request.user_email}&event=training&plan={request.plan}" if webhook_base_url else None

        print(f"🤖 Starting Replicate training with {processed_count} images")
        # training = replicate.trainings.create(
        #     model="ostris/flux-dev-lora-trainer",
        #     version="e440909d3512c31646ee2e0c7d6f6f4923224863a6a10c494606e79fb5844497",
        #     destination="prime-ai-co/headshots",
        #     input={
        #         "input_images": r2_url,
        #         "steps": 3000,
        #         "lora_rank": 32,
        #         "learning_rate": 0.0001,
        #         "optimizer": "adamw",
        #         "batch_size": 1,
        #         "resolution": "1024",
        #         "autocaption": False,
        #         "trigger_word": "ohwx",
        #         "wandb_project": "flux_train_replicate",
        #         "wandb_save_interval": 100,
        #         "caption_dropout_rate": 0.05,
        #         "wandb_sample_interval": 100,
        #     },
        #     webhook=webhook_url,
        #     webhook_events_filter=["completed"],
        # )
        # print(f"✅ Replicate training started: {training.id}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create Replicate training: {e}")

    # 6. Return the Replicate training object
    # return training.dict()
    return True


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