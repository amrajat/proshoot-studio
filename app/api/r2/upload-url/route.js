import { NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import createSupabaseServerClient from "@/lib/supabase/server-client";
import { v4 as uuidv4 } from "uuid";

// Initialize Supabase client
// Ensure these are set in your Vercel environment variables

// Initialize R2/S3 client
// Ensure these are set in your Vercel environment variables
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_REGION = process.env.R2_REGION || "auto"; // R2 typically uses 'auto'
// R2_PUBLIC_URL is optional, will be handled if not set
// const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

if (
  !R2_ENDPOINT ||
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY ||
  !R2_BUCKET_NAME
) {
  console.error(
    "Critical R2 environment variables are not fully configured (ENDPOINT, ACCESS_KEY_ID, SECRET_ACCESS_KEY, BUCKET_NAME)."
  );
  // Optionally throw an error during startup if critical variables are missing
  // throw new Error("Critical R2 environment variables are not fully configured.");
}

// Log the critical R2 variables on server start (or when module is loaded)
console.log("[API Route Init] R2_ENDPOINT:", R2_ENDPOINT);
console.log("[API Route Init] R2_BUCKET_NAME:", R2_BUCKET_NAME);

const s3Client = new S3Client({
  region: R2_REGION,
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  // forcePathStyle: true, // Usually not needed for R2, but can be a fallback for S3-compatible services if virtual-hosted style fails.
  // For R2, the default (false or undefined) is preferred.
});

const UPLOAD_EXPIRATION_SECONDS = 600; // 10 minutes for the PUT URL
const DEFAULT_DOWNLOAD_EXPIRATION_SECONDS = 86400; // 24 hours for the GET URL

export async function POST(req) {
  const supabase = await createSupabaseServerClient();
  let userId;

  try {
    const body = await req.json();
    const {
      fileName,
      contentType,
      userToken, // Expecting token from client
      expirationInSeconds, // Optional: client can request specific expiry for downloadUrl
    } = body;

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: "Missing fileName or contentType" },
        { status: 400 }
      );
    }

    if (!userToken) {
      return NextResponse.json(
        { error: "Missing user token" },
        { status: 401 }
      );
    }

    const { data: userData, error: userError } = await supabase.auth.getUser(
      userToken
    );

    if (userError || !userData?.user) {
      console.error("R2 Upload API - Auth Error:", userError);
      return NextResponse.json(
        { error: "Authentication failed. Invalid token." },
        { status: 401 }
      );
    }
    userId = userData.user.id;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found after authentication." },
        { status: 401 }
      );
    }

    // Sanitize filename and create a unique object key
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueId = uuidv4(); // Generate a unique ID for the file
    // Example: user_id/original_filename_uniqueid.extension
    // Or if it's always a zip: user_id/uniqueid.zip
    const fileExtension = sanitizedFileName.includes(".")
      ? sanitizedFileName.substring(sanitizedFileName.lastIndexOf("."))
      : "";
    const baseFileName = sanitizedFileName.includes(".")
      ? sanitizedFileName.substring(0, sanitizedFileName.lastIndexOf("."))
      : sanitizedFileName;

    // Construct objectKey - using the filename passed from client (which is already the zip name)
    // const objectKey = `${userId}/${baseFileName}-${uniqueId}${fileExtension}`;
    const objectKey = `${userId}/${fileName}`; // Simpler: use userId/zipFileName.zip

    // Create PutObjectCommand for uploading
    const putCommand = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: objectKey,
      ContentType: contentType,
      // Optionally add Metadata like userId if needed, e.g., Metadata: { "user-id": userId }
    });

    // Generate pre-signed URL for PUT (upload)
    const uploadUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: UPLOAD_EXPIRATION_SECONDS,
    });

    // Determine expiration for the GET (download) URL
    let downloadExpiry = DEFAULT_DOWNLOAD_EXPIRATION_SECONDS;
    if (
      expirationInSeconds &&
      typeof expirationInSeconds === "number" &&
      expirationInSeconds > 0
    ) {
      // Optional: Add a max cap to client-requested expiry if needed
      // downloadExpiry = Math.min(expirationInSeconds, MAX_ALLOWED_EXPIRY_FROM_CLIENT);
      downloadExpiry = expirationInSeconds;
    }

    // Create GetObjectCommand for downloading
    const getCommand = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: objectKey,
    });

    // Generate pre-signed URL for GET (download) with configured/default expiry
    const downloadUrl = await getSignedUrl(s3Client, getCommand, {
      expiresIn: downloadExpiry,
    });

    // This public URL construction is for Cloudflare R2's specific pattern
    // It's useful if you ever decide to make some objects public or use a custom domain.
    // For private objects accessed via pre-signed URLs, this isn't strictly necessary for the client.
    // const r2PublicDomain = process.env.R2_PUBLIC_URL || \`https://${R2_BUCKET_NAME}.${process.env.R2_ACCOUNT_ID_HOSTNAME}\`;
    // const publicUrl = \`\${r2PublicDomain}/${objectKey}\`;

    return NextResponse.json({
      uploadUrl, // For client to PUT the file
      downloadUrl, // For client to GET the file later (e.g., 24hr expiry)
      objectKey,
      // publicUrl, // Only include if meaningful for your setup
    });
  } catch (error) {
    console.error("R2 Upload API - Error generating pre-signed URL:", error);
    // Differentiate between auth errors and other errors if needed
    if (
      error.message.includes("Authentication failed") ||
      error.message.includes("User ID not found")
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to generate pre-signed URL.", details: error.message },
      { status: 500 }
    );
  }
}
