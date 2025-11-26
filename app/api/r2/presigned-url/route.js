import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import createSupabaseServerClient from "@/lib/supabase/server-client";
import { env, publicEnv } from "@/lib/env";

const R2_ACCOUNT_ID = env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY;

const BUCKET_CONFIGS = {
  datasets: {
    name: publicEnv.NEXT_PUBLIC_R2_DATASETS_BUCKET_NAME,
    customDomain: publicEnv.NEXT_PUBLIC_R2_DATASETS_CUSTOM_DOMAIN,
  },
};

export async function POST(request) {
  // Environment variable validation
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.error("R2 environment variables are not properly configured.");
    return NextResponse.json(
      {
        error: "Server configuration error: R2 environment variables are missing.",
      },
      { status: 500 }
    );
  }

  const supabase = await createSupabaseServerClient();

  try {
    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const { fileName, fileType, studioId } = await request.json();

    if (!fileName || !studioId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get bucket config
    const config = BUCKET_CONFIGS.datasets;
    if (!config || !config.name) {
      return NextResponse.json(
        { error: "Invalid or misconfigured bucket" },
        { status: 400 }
      );
    }

    // Sanitize filename
    const sanitizedFileName = fileName
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9._-]/g, "");

    // Construct object key: user_id/studio_id/filename
    const objectKey = `${user.id}/${studioId}/${sanitizedFileName}`;

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

    // Generate presigned URL for PUT operation (15 minutes expiry)
    const command = new PutObjectCommand({
      Bucket: config.name,
      Key: objectKey,
      ContentType: fileType || "application/octet-stream",
    });

    const presignedUrl = await getSignedUrl(r2S3Client, command, {
      expiresIn: 900, // 15 minutes
    });

    return NextResponse.json({
      success: true,
      presignedUrl,
      objectKey,
      sanitizedFileName,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      { 
        error: "Failed to generate presigned URL",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
