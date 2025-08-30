import { NextResponse } from "next/server";
import createServerSupabaseClient from "@/lib/supabase/server-client";
import { env } from "@/lib/env";

export async function POST(request) {
  try {
    // Verify authentication
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { objectKey, bucketName } = await request.json();

    if (!objectKey || !bucketName) {
      return NextResponse.json(
        { error: "Missing objectKey or bucketName" },
        { status: 400 }
      );
    }

    // Get R2 credentials from environment
    const accountId = env.R2_ACCOUNT_ID;
    const accessKeyId = env.R2_ACCESS_KEY_ID;
    const secretAccessKey = env.R2_SECRET_ACCESS_KEY;

    if (!accountId || !accessKeyId || !secretAccessKey) {
      return NextResponse.json(
        { error: "Missing R2 configuration" },
        { status: 500 }
      );
    }

    // Import AWS SDK v3 for R2
    const { S3Client, HeadObjectCommand } = await import("@aws-sdk/client-s3");

    // Configure S3 client for Cloudflare R2
    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    try {
      // Try to get object metadata (HEAD request)
      await s3Client.send(
        new HeadObjectCommand({
          Bucket: bucketName,
          Key: objectKey,
        })
      );

      // If no error, file exists
      return NextResponse.json({ exists: true });
    } catch (error) {
      // If error is 404 (NoSuchKey), file doesn't exist
      if (
        error.name === "NoSuchKey" ||
        error.$metadata?.httpStatusCode === 404
      ) {
        return NextResponse.json({ exists: false });
      }

      // For other errors, assume file exists to be safe
      console.error("Error checking file existence:", error);
      return NextResponse.json({ exists: true });
    }
  } catch (error) {
    console.error("Error in check-file API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
