# Postman Testing Guide for Modal Replicate LoRA Trainer

## Overview
This guide shows how to test both training requests and webhook payloads using Postman.

## Endpoint Information
- **URL**: Your Modal deployment URL (e.g., `https://your-modal-app.modal.run`)
- **Method**: POST
- **Content-Type**: application/json

## Test Cases

### 1. Training Request Test

**Request Body:**
```json
{
  "object_key": "test-user-123/studio-456",
  "gender": "man",
  "user_id": "user-123",
  "user_email": "test@example.com",
  "plan": "premium",
  "studio_id": "studio-456"
}
```

**Expected Response:**
```json
{
  "id": "training_abc123",
  "status": "starting",
  "model": "ostris/flux-dev-lora-trainer",
  "version": "e440909d3512c31646ee2e0c7d6f6f4923224863a6a10c494606e79fb5844497",
  "input": {
    "input_images": "https://...",
    "steps": 3000,
    "lora_rank": 32,
    "learning_rate": 0.0001,
    "optimizer": "adamw",
    "batch_size": 1,
    "resolution": "1024",
    "autocaption": false,
    "trigger_word": "ohwx"
  },
  "webhook": "https://your-webhook-url?user_id=user-123&studio_id=studio-456&secret=your-secret"
}
```

### 2. Webhook Payload Test

**URL with Query Parameters:**
```
https://your-modal-app.modal.run?user_id=user-123&studio_id=studio-456&secret=your-webhook-secret
```

**Request Body (Successful Training):**
```json
{
  "id": "training_abc123",
  "status": "succeeded",
  "output": {
    "trained_model": "https://replicate.delivery/pbxt/abc123/trained_model.tar"
  },
  "started_at": "2024-01-01T10:00:00Z",
  "completed_at": "2024-01-01T11:30:00Z"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Training completion processed successfully",
  "training_id": "training_abc123",
  "weights_url": "https://weights.headsshot.com/user-123/studio-456/lora.safetensors"
}
```

**Request Body (Failed Training):**
```json
{
  "id": "training_abc123",
  "status": "failed",
  "error": "Training failed due to insufficient data",
  "started_at": "2024-01-01T10:00:00Z",
  "completed_at": "2024-01-01T11:30:00Z"
}
```

**Expected Response:**
```json
{
  "status": "ignored",
  "reason": "Training status: failed"
}
```

## Environment Variables Required

Make sure these are set in your Modal secrets:

### R2 Credentials
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID` 
- `R2_SECRET_ACCESS_KEY`

### Replicate
- `REPLICATE_API_TOKEN`
- `REPLICATE_TRAINING_WEBHOOK_SECRET`
- `REPLICATE_TRAINING_WEBHOOK_BASE_URL`

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Next.js Webhook
- `NEXTJS_COMPLETION_WEBHOOK_URL`

## Testing Steps

### Step 1: Test Training Request
1. Open Postman
2. Create new POST request
3. Set URL to your Modal endpoint
4. Set Content-Type header to `application/json`
5. Add training request body (see example above)
6. Send request
7. Verify response contains Replicate training object

### Step 2: Test Webhook Payload
1. Create new POST request
2. Set URL with query parameters (user_id, studio_id, secret)
3. Set Content-Type header to `application/json`
4. Add webhook payload body (see example above)
5. Send request
6. Verify response indicates successful processing

## Error Testing

### Invalid Request Type
**Request Body:**
```json
{
  "unknown_field": "test",
  "invalid": true
}
```

**Expected Response:**
```json
{
  "detail": "Unknown request type. Keys found: ['unknown_field', 'invalid']"
}
```

### Missing Query Parameters (Webhook)
**URL:** `https://your-modal-app.modal.run` (no query params)

**Expected Response:**
```json
{
  "detail": "Missing user_id or studio_id in query params"
}
```

### Invalid Webhook Secret
**URL:** `https://your-modal-app.modal.run?user_id=user-123&studio_id=studio-456&secret=wrong-secret`

**Expected Response:**
```json
{
  "detail": "Invalid webhook secret"
}
```

## Logs to Monitor

When testing, monitor the Modal logs for these messages:

### Training Request Logs
- `📥 Received request with keys: ['object_key', 'gender', 'user_id', 'user_email', 'plan', 'studio_id']`
- `🚀 Routing to training handler`
- `🚀 Processing training request for studio: studio-456`
- `✅ R2 client initialized`
- `📋 Processing X images`
- `✅ Replicate training started: training_abc123`

### Webhook Payload Logs
- `📥 Received request with keys: ['id', 'status', 'output']`
- `🔔 Routing to webhook handler`
- `🔔 Processing webhook for user_id: user-123, studio_id: studio-456`
- `📦 Found trained model: https://replicate.delivery/...`
- `📦 Downloading trained model from: https://...`
- `✅ Downloaded tar file to: /tmp/...`
- `✅ Extracted lora.safetensors (X bytes)`
- `☁️ Uploading lora.safetensors to: user-123/studio-456/lora.safetensors`
- `✅ lora.safetensors uploaded to R2`
- `🗄️ Updating studio record: studio-456`
- `✅ Studio record updated successfully`
- `🔗 Calling Next.js webhook: https://...`
- `✅ Next.js webhook called successfully`

## Troubleshooting

### Common Issues

1. **"Missing required query parameters"**
   - Ensure webhook requests include user_id, studio_id, and secret in query params

2. **"Invalid webhook secret"**
   - Verify REPLICATE_TRAINING_WEBHOOK_SECRET matches the secret in query params

3. **"No trained model (.tar) found in output"**
   - Check that webhook payload includes output with a .tar file URL

4. **"Failed to upload LoRA weights"**
   - Verify R2 credentials are correct and bucket exists

5. **"Supabase credentials not configured"**
   - Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set

### Debug Mode
Add `print()` statements in the code to debug specific issues:

```python
print(f"Debug: Request body keys: {list(body_data.keys())}")
print(f"Debug: Query params: {query_params}")
print(f"Debug: Webhook payload status: {webhook_payload.status}")
```
