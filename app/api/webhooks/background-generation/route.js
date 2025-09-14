import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      success, 
      generation_id,
      image_data,
      image_format,
      error_message,
      // Callback data from the original request
      theme,
      background_name,
      expected_path,
      safe_filename,
      theme_path
    } = body;

    console.log('Background generation webhook received:', {
      success,
      generation_id,
      background_name,
      theme,
      error_message
    });

    if (success && image_data) {
      // Save the generated image to the correct location
      try {
        await saveImageFromBase64(image_data, theme_path, safe_filename);
        console.log(`Successfully saved background image: ${background_name}`);
      } catch (error) {
        console.error(`Failed to save background image ${background_name}:`, error);
        return NextResponse.json({
          success: false,
          message: 'Failed to save generated image',
          error: error.message
        }, { status: 500 });
      }
    } else {
      console.error(`Background generation failed for ${background_name}:`, error_message);
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    }, { status: 500 });
  }
}

async function saveImageFromBase64(imageBase64, themePath, safeFilename) {
  try {
    const targetDir = path.join(process.cwd(), 'public', 'images', 'styles', 'backgrounds', themePath);
    const targetPath = path.join(targetDir, `${safeFilename}.jpg`);

    // Ensure directory exists
    await fs.mkdir(targetDir, { recursive: true });

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    
    // Save image to target location
    await fs.writeFile(targetPath, imageBuffer);
    
    console.log(`Image saved successfully to: ${targetPath}`);
    return targetPath;

  } catch (error) {
    console.error('Error saving image:', error);
    throw error;
  }
}
