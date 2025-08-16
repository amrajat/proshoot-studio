import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import createSupabaseServerClient from "@/lib/supabase/server-client";

// --- Centralized R2 Configuration ---
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME_DATASETS = "datasets";

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
  const { data: userData, error: userError } = await supabase.auth.getUser(
    token
  );
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
    const objectKey = `${userId}/${fileName}`;

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
