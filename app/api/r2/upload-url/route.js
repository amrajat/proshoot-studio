import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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
  region: "auto", // For R2, "auto" is typically used
  endpoint: R2_ENDPOINT, // Ensure this is just https://<ACCOUNT_ID>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  // forcePathStyle: true, // Usually not needed for R2, but can be a fallback for S3-compatible services if virtual-hosted style fails.
  // For R2, the default (false or undefined) is preferred.
});

export async function POST(request) {
  const supabase = await createSupabaseServerClient();

  try {
    const { fileName, contentType, userToken } = await request.json();

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: "Missing fileName or contentType" },
        { status: 400 }
      );
    }

    if (!userToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user session with Supabase
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(userToken);

    if (userError || !user) {
      console.error("Supabase auth error:", userError);
      return NextResponse.json(
        { error: "Invalid user session" },
        { status: 401 }
      );
    }

    const userId = user.id; // User's UUID from Supabase
    const uniqueFileName = `${uuidv4()}-${fileName.replace(/\s+/g, "_")}`; // Create a unique file name to prevent overwrites
    const objectKey = `${userId}/${uniqueFileName}`; // Path in R2: /uuid/unique-filename.jpg

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: objectKey,
      ContentType: contentType,
      // ACL: 'public-read', // R2 does not use ACLs like S3. Public access is via bucket settings or Cloudflare Workers.
      // For client-side uploads, metadata can be set here if needed
      // Metadata: {
      //   'custom-header': 'value',
      // },
    });

    // Pre-signed URLs for R2 should have a relatively short expiration time for security
    const expiresIn = 300; // 5 minutes
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });

    // Construct the public URL (this part is for accessing the file later, not for the PUT upload itself)
    let publicFileUrl;
    if (process.env.R2_PUBLIC_URL) {
      publicFileUrl = `${process.env.R2_PUBLIC_URL}/${objectKey}`;
    } else {
      // Fallback if R2_PUBLIC_URL is not set: Construct a standard virtual-hosted style R2 URL
      try {
        const endpointHost = new URL(R2_ENDPOINT).hostname; // e.g., c7616cca1c5a5038e0c45956512164bb.r2.cloudflarestorage.com
        // Correct virtual-hosted style for R2: https://<bucket>.<account-id-host>/<objectKey>
        publicFileUrl = `https://${R2_BUCKET_NAME}.${endpointHost}/${objectKey}`;
      } catch (e) {
        console.error(
          "Error constructing fallback public URL due to invalid R2_ENDPOINT:",
          e
        );
        publicFileUrl = null; // or some default/error indicator
      }
    }

    // Log the generated signed URL that the client will use for PUT
    console.log("Generated pre-signed URL for client PUT:", signedUrl);
    console.log("Object Key for this URL:", objectKey);

    return NextResponse.json({
      uploadUrl: signedUrl,
      objectKey: objectKey,
      publicUrl: publicFileUrl,
    });
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    let errorMessage = "Failed to generate upload URL.";
    if (error.name === "CredentialsProviderError") {
      errorMessage =
        "Could not load R2 credentials. Ensure R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY are set correctly.";
    } else if (error.message && error.message.includes("Forbidden")) {
      errorMessage =
        "Access to R2 bucket denied. Check bucket permissions and API token scopes.";
    }
    return NextResponse.json(
      { error: errorMessage, details: error.message },
      { status: 500 }
    );
  }
}
