import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import createSupabaseServerClient from "@/lib/supabase/server-client";
import { env, publicEnv } from "@/lib/env";

// --- Centralized R2 Configuration ---
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/zip",
  "application/json",
];

// Security helpers
const sanitizeFileName = (fileName) => {
  if (!fileName || typeof fileName !== "string") {
    throw new Error("Invalid filename");
  }

  // Handle paths with forward slashes (for UUID folders)
  const pathParts = fileName.split("/");
  const sanitizedParts = pathParts.map((part) => {
    // Sanitize each part of the path separately
    const sanitized = part.replace(/[^a-zA-Z0-9._-]/g, "_").substring(0, 128);

    if (!sanitized || sanitized.length === 0) {
      throw new Error("Invalid filename part after sanitization");
    }

    return sanitized;
  });

  return sanitizedParts.join("/");
};

const R2_ACCOUNT_ID = env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME_DATASETS = "datasets";

const BUCKET_CONFIGS = {
  datasets: {
    name: publicEnv.NEXT_PUBLIC_R2_DATASETS_BUCKET_NAME,
    customDomain: publicEnv.NEXT_PUBLIC_R2_DATASETS_CUSTOM_DOMAIN,
  },
  images: {
    name: publicEnv.NEXT_PUBLIC_IMAGES_BUCKET_NAME,
    customDomain: publicEnv.NEXT_PUBLIC_IMAGES_CUSTOM_DOMAIN,
  },
  // Add other bucket configurations here as needed
};

// --- API Handler ---
export async function POST(req) {
  // --- Environment Variable Validation ---
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.error("R2 environment variables are not properly configured.");
    return NextResponse.json(
      {
        error:
          "Server configuration error: R2 environment variables are missing.",
      },
      { status: 500 }
    );
  }

  const supabase = await createSupabaseServerClient();

  try {
    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file");
    const fileName = formData.get("fileName");

    // --- Validation ---
    if (!file || !fileName) {
      return NextResponse.json(
        { error: "Missing file or fileName" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 20MB limit" },
        { status: 400 }
      );
    }

    // Validate content type
    if (!ALLOWED_CONTENT_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      );
    }

    // Sanitize filename
    let sanitizedFileName;
    try {
      sanitizedFileName = sanitizeFileName(fileName);
    } catch (error) {
      console.error("Filename sanitization error:", error);
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const config = BUCKET_CONFIGS[R2_BUCKET_NAME_DATASETS];
    if (!config || !config.name) {
      return NextResponse.json(
        {
          error: `Invalid or misconfigured R2_BUCKET_NAME_DATASETS: ${R2_BUCKET_NAME_DATASETS}`,
        },
        { status: 400 }
      );
    }

    // --- Authentication ---
    let userId;
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }
    userId = data.user.id;

    // --- Server-side Upload to R2 ---
    const objectKey = `${userId}/${sanitizedFileName}`;

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

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

    // Upload directly to R2 from server
    const putCommand = new PutObjectCommand({
      Bucket: config.name,
      Key: objectKey,
      Body: fileBuffer,
      ContentType: file.type,
    });

    await r2S3Client.send(putCommand);

    return NextResponse.json({
      success: true,
      objectKey,
      originalFileName: fileName,
      sanitizedFileName: sanitizedFileName,
    });
  } catch (error) {
    console.error("[R2 UPLOAD ERROR]:", error);
    if (error.message.includes("Authentication failed")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to upload file to R2.", details: error.message },
      { status: 500 }
    );
  }
}
