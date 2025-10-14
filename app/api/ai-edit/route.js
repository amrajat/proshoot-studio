import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import createSupabaseServerClient from "@/lib/supabase/server-client";
import { env, publicEnv } from "@/lib/env";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * AI Edit Image API Route
 * Costs 50 credits from the user's balance
 * Maximum duration: 60 seconds (Vercel Hobby plan limit)
 */
export const maxDuration = 60; // Set maximum execution time to 60 seconds

export async function POST(req) {
  try {
    const body = await req.json();
    const { prompt, imageUrls, numImages = 1, studioId } = body;

    // Validate required parameters
    if (!prompt || !imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters",
        },
        { status: 400 }
      );
    }

    // Get current user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Use service role client for credit operations
    const cookieStore = cookies();
    const serviceSupabase = createServerClient(
      publicEnv.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name, options) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    // Check if user has sufficient credits (don't deduct yet)
    const CREDITS_COST = 50;
    const { data: userCredits, error: creditsCheckError } = await serviceSupabase
      .from("credits")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (creditsCheckError) {
      console.error("Credits check error:", creditsCheckError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to check credits",
        },
        { status: 500 }
      );
    }

    if (!userCredits || userCredits.balance < CREDITS_COST) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient credits",
          insufficientCredits: true,
          currentCredits: userCredits?.balance || 0,
          requiredCredits: CREDITS_COST,
        },
        { status: 400 }
      );
    }

    // Process AI editing first - use PNG format and get URL
    try {
      const response = await fetch('https://fal.run/fal-ai/nano-banana/edit', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${env.FAL_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          image_urls: imageUrls,
          num_images: numImages,
          output_format: 'png', // Always use PNG format
          sync_mode: false // Get URL instead of base64
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('FAL API Error:', response.status, errorText);
        return NextResponse.json(
          {
            success: false,
            error: "AI processing failed",
          },
          { status: 500 }
        );
      }

      const result = await response.json();
      
      // Validate result has images
      if (!result.images || result.images.length === 0) {
        console.error('FAL API returned no images');
        return NextResponse.json(
          {
            success: false,
            error: "No edited images received from AI",
          },
          { status: 500 }
        );
      }

      // Download, upload to R2, and save to database
      const uploadedImages = [];
      
      for (let i = 0; i < result.images.length; i++) {
        const falImageUrl = result.images[i].url;
        
        try {
          // Download image from fal.ai URL
          const imageResponse = await fetch(falImageUrl);
          if (!imageResponse.ok) {
            console.error(`Failed to download image ${i} from fal.ai`);
            continue;
          }
          
          const imageBuffer = await imageResponse.arrayBuffer();
          const imageBytes = Buffer.from(imageBuffer);
          
          // Generate unique filename for R2
          const filename = `${Date.now()}_${i}_${Math.random().toString(36).substring(7)}.png`;
          const objectKey = `${studioId}/${filename}`;
          
          // Upload to R2 (images bucket)
          const r2Client = new S3Client({
            region: 'auto',
            endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
              accessKeyId: env.R2_ACCESS_KEY_ID,
              secretAccessKey: env.R2_SECRET_ACCESS_KEY,
            },
          });
          
          await r2Client.send(
            new PutObjectCommand({
              Bucket: 'images',
              Key: objectKey,
              Body: imageBytes,
              ContentType: 'image/png',
            })
          );
          
          console.log(`Uploaded edited image to R2: ${objectKey}`);
          
          // Generate presigned URL for the uploaded image
          const getCommand = new GetObjectCommand({
            Bucket: 'images',
            Key: objectKey,
          });
          
          const presignedUrl = await getSignedUrl(r2Client, getCommand, {
            expiresIn: 3600, // 1 hour
          });
          
          // Insert into headshots table
          const { data: headshotData, error: headshotError } = await serviceSupabase
            .from('headshots')
            .insert({
              studio_id: studioId,
              result: objectKey,
              prompt: null,
            })
            .select()
            .single();
          
          if (headshotError) {
            console.error('Failed to insert headshot record:', headshotError);
            // Continue with other images even if one fails
            continue;
          }
          
          uploadedImages.push({
            url: presignedUrl, // Return presigned URL for immediate display
            objectKey: objectKey, // Also return object key for reference
            id: headshotData.id,
            type: 'edited'
          });
          
        } catch (uploadError) {
          console.error(`Error processing image ${i}:`, uploadError);
          // Continue with other images
          continue;
        }
      }
      
      // Check if at least one image was successfully processed
      if (uploadedImages.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to process and save edited images",
          },
          { status: 500 }
        );
      }

      // Only deduct credits after successful upload and database save
      const { data: creditResult, error: creditError } = await serviceSupabase.rpc(
        "deduct_credits",
        {
          p_user_id: user.id,
          p_plan: "balance",
          p_credits_to_deduct: CREDITS_COST,
          p_context: "PERSONAL",
          p_studio_id: studioId,
          p_description: `AI Image Edit - ${prompt.substring(0, 50)}... (${CREDITS_COST} credits)`,
        }
      );

      if (creditError || !creditResult.success) {
        console.error("Credit deduction error after successful AI processing:", creditError || creditResult);
        // AI processing succeeded but credit deduction failed - this is a critical error
        return NextResponse.json(
          {
            success: false,
            error: "Credit processing failed after successful AI generation",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        images: uploadedImages,
        editedAt: new Date().toISOString(),
        creditsUsed: CREDITS_COST,
        remainingCredits: creditResult.remaining_credits,
      });

    } catch (aiError) {
      console.error("AI processing error:", aiError);
      return NextResponse.json(
        {
          success: false,
          error: "AI processing failed",
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("AI Edit API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
