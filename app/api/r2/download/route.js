import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import createSupabaseServerClient from "@/lib/supabase/server-client";
import { env } from "@/lib/env";

// R2 Configuration
const R2_ACCOUNT_ID = env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY;

// Test endpoint to verify route is working
export async function GET() {
  return NextResponse.json({ message: "R2 Download API is working" });
}

export async function POST(req) {  
  // Environment validation
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.error("R2 environment variables are not properly configured.");
    return NextResponse.json(
      { error: "Server configuration error: R2 environment variables are missing." },
      { status: 500 }
    );
  }

  const supabase = await createSupabaseServerClient();

  try {
    const { objectKey, bucketName = "images" } = await req.json();
    // Validation
    if (!objectKey) {
      return NextResponse.json(
        { error: "Missing objectKey parameter" },
        { status: 400 }
      );
    }

    // Authentication - Get current user
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData.user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const userId = userData.user.id;

    // Authorization - Check if user has access to this image
    // Extract studio_id from object key pattern: studio_id/headshot_id/filename
    const keyParts = objectKey.split('/');
    if (keyParts.length < 2) {
      return NextResponse.json(
        { error: "Invalid object key format" },
        { status: 400 }
      );
    }

    const studioId = keyParts[0];

    // First, get the studio data
    const { data: studioData, error: studioError } = await supabase
      .from('studios')
      .select('id, creator_user_id, organization_id')
      .eq('id', studioId)
      .single();

    if (studioError || !studioData) {
      console.error('Studio query error:', studioError, { studioId, userId });
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    // Check if user is the studio creator
    const isCreator = studioData.creator_user_id === userId;
    let isOrgOwner = false;

    // If not creator and studio has organization, check if user is org owner
    if (!isCreator && studioData.organization_id) {
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('owner_user_id')
        .eq('id', studioData.organization_id)
        .single();

      isOrgOwner = !orgError && orgData && orgData.owner_user_id === userId;
    }

    // Check access permissions: Only creator OR org owner can download
    if (!isCreator && !isOrgOwner) {
      console.error('Access denied for user:', { userId, studioId, isCreator, isOrgOwner });
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Create R2 client
    const r2S3Client = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      forcePathStyle: true,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });

    // Get object from R2
    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    const response = await r2S3Client.send(getCommand);

    if (!response.Body) {
      console.error('No response body from R2:', { objectKey, bucketName });
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    // Convert stream to buffer (Node.js environment)
    const imageBuffer = Buffer.from(await response.Body.transformToByteArray());

    // Extract filename from object key
    const filename = keyParts[keyParts.length - 1] || 'headshot.png';

    // Return image with proper download headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': imageBuffer.length.toString(),
        'Cache-Control': 'private, no-cache',
      },
    });

  } catch (error) {
    // Log detailed error server-side for debugging
    console.error("[R2 DOWNLOAD ERROR]:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      objectKey,
      userId
    });
    
    // Return generic error messages to client (no sensitive info)
    if (error.name === 'NoSuchKey') {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }
    
    if (error.message.includes('Access Denied') || error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }
    
    // Generic error for all other cases
    return NextResponse.json(
      { error: "Unable to process request" },
      { status: 500 }
    );
  }
}
