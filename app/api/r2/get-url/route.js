import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import createSupabaseServerClient from "@/lib/supabase/server-client";

const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME; // The primary bucket
const R2_REGION = process.env.R2_REGION || "auto";

if (
  !R2_ENDPOINT ||
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY ||
  !R2_BUCKET_NAME
) {
  console.error("Critical R2 environment variables are not fully configured.");
}

const s3Client = new S3Client({
  region: R2_REGION,
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const DEFAULT_EXPIRATION_SECONDS = 3600; // 1 hour

export async function POST(req) {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    console.error("Get Presigned URL API - Auth Error:", userError);
    return NextResponse.json(
      { error: "Authentication failed." },
      { status: 401 }
    );
  }

  const userId = userData.user.id;

  try {
    const body = await req.json();

    const isSingleRequest = !Array.isArray(body);
    const filesToProcess = isSingleRequest ? [body] : body;

    if (filesToProcess.length === 0) {
      return NextResponse.json(
        { error: "Request body is empty or invalid" },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      filesToProcess.map(async (file) => {
        const { filePath, bucketName, expiresInSeconds } = file;

        if (!filePath || !bucketName) {
          return {
            filePath,
            error: "Missing filePath or bucketName",
            status: 400,
          };
        }

        // Security Check: Ensure the user is requesting a file in their own folder.
        const pathUserId = filePath.split("/")[0];
        if (pathUserId !== userId) {
          return {
            filePath,
            error: "Forbidden",
            status: 403,
          };
        }

        if (bucketName !== R2_BUCKET_NAME) {
          return {
            filePath,
            error: `Invalid bucket name. Only '${R2_BUCKET_NAME}' is allowed.`,
            status: 400,
          };
        }

        const getCommand = new GetObjectCommand({
          Bucket: bucketName,
          Key: filePath,
        });

        const expiry = expiresInSeconds || DEFAULT_EXPIRATION_SECONDS;

        try {
          const url = await getSignedUrl(s3Client, getCommand, {
            expiresIn: expiry,
          });
          return {
            filePath,
            url,
            status: 200,
          };
        } catch (s3Error) {
          console.error(
            `Error generating signed URL for ${filePath}:`,
            s3Error
          );
          return {
            filePath,
            error: "Failed to generate presigned URL.",
            details: s3Error.message,
            status: 500,
          };
        }
      })
    );

    const hasErrors = results.some((r) => r.error);
    if (hasErrors && isSingleRequest) {
      const firstErrorResult = results.find((r) => r.error);
      return NextResponse.json(
        {
          error: firstErrorResult.error,
          details: firstErrorResult.details,
        },
        { status: firstErrorResult.status || 400 }
      );
    }

    if (isSingleRequest) {
      return NextResponse.json(results[0], { status: results[0].status });
    } else {
      // For batch requests, return a 207 Multi-Status if there are mixed results
      const overallStatus = hasErrors ? 207 : 200;
      return NextResponse.json(results, { status: overallStatus });
    }
  } catch (error) {
    console.error("Get Presigned URL API - General Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred.", details: error.message },
      { status: 500 }
    );
  }
}
