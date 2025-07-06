import { NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import createSupabaseServerClient from "@/lib/supabase/server-client";

// --- Centralized R2 Configuration ---
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;

const BUCKET_CONFIGS = {
  datasets: {
    name: process.env.NEXT_PUBLIC_DATASETS_BUCKET_NAME,
    customDomain: process.env.NEXT_PUBLIC_DATASETS_CUSTOM_DOMAIN,
  },
  images: {
    name: process.env.NEXT_PUBLIC_IMAGES_BUCKET_NAME,
    customDomain: process.env.NEXT_PUBLIC_IMAGES_CUSTOM_DOMAIN,
  },
  // Add other bucket configurations here as needed
};

// --- Helper Functions ---
async function getUserIdFromToken(supabase, token) {
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    throw new Error("Authentication failed: Invalid token.");
  }
  return userData.user.id;
}

// --- API Handler ---
export async function POST(req) {
  // --- Environment Variable Validation ---
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.error("R2 environment variables are not properly configured.");
    return NextResponse.json(
      { error: "Server configuration error: R2 environment variables are missing." },
      { status: 500 }
    );
  }

  const supabase = await createSupabaseServerClient();

  try {
    const body = await req.json();
    const {
      fileName,
      contentType,
      bucketName, // Client must specify which bucket to use
      userToken,
    } = body;

    // --- Validation ---
    if (!fileName || !contentType || !bucketName) {
      return NextResponse.json(
        { error: "Missing fileName, contentType, or bucketName" },
        { status: 400 }
      );
    }

    const config = BUCKET_CONFIGS[bucketName];
    if (!config || !config.name || !config.customDomain) {
      return NextResponse.json(
        { error: `Invalid or misconfigured bucketName: ${bucketName}` },
        { status: 400 }
      );
    }

    // --- Authentication ---
    let userId;
    if (userToken) {
      userId = await getUserIdFromToken(supabase, userToken);
    } else {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
      }
      userId = data.user.id;
    }

    // --- URL Generation ---
    const objectKey = `${userId}/${fileName}`;

    // 1. Create a client pointing to the standard R2 S3 API endpoint for signing.
    const r2S3Client = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      forcePathStyle: true,
  
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });

    // 2. Define the command for the PUT operation.
    const putCommand = new PutObjectCommand({
      Bucket: config.name,
      Key: objectKey,
      ContentType: contentType,
    });

    // 3. Generate the presigned URL for the UPLOAD. This URL points to the R2 endpoint.
    const uploadUrl = await getSignedUrl(r2S3Client, putCommand, {
      expiresIn: 3600, // 1 hour
    });

    // 4. Generate the presigned URL for the download (GetObject).
    const getCommand = new GetObjectCommand({
      Bucket: config.name,
      Key: objectKey,
    });
    const downloadUrl = await getSignedUrl(r2S3Client, getCommand, {
      expiresIn: 86400, // 24 hours
    });

    return NextResponse.json({ uploadUrl, downloadUrl, objectKey });
  } catch (error) {
    console.error("[R2 UPLOAD-URL ERROR]:", error);
    if (error.message.includes("Authentication failed")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to generate pre-signed URL.", details: error.message },
      { status: 500 }
    );
  }
}

