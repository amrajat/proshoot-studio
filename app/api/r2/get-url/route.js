import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import createSupabaseServerClient from "@/lib/supabase/server-client";

const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
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
const MAX_EXPIRATION_SECONDS = 604800; // 7 days
const MIN_EXPIRATION_SECONDS = 60; // 1 minute

// Validate file path format and extract user ID
const validateAndParseFilePath = (filePath, authenticatedUserId) => {
  if (!filePath || typeof filePath !== "string") {
    return { isValid: false, error: "Invalid file path format" };
  }

  // Remove leading slash if present
  const normalizedPath = filePath.startsWith("/")
    ? filePath.slice(1)
    : filePath;

  // Expected format: users/{user_id}/category/filename or users/{user_id}/projects/{project_id}/filename
  const pathParts = normalizedPath.split("/");

  if (pathParts.length < 3) {
    return {
      isValid: false,
      error: "File path must follow format: users/{user_id}/category/filename",
    };
  }

  if (pathParts[0] !== "users") {
    return { isValid: false, error: "File path must start with 'users/'" };
  }

  const pathUserId = pathParts[1];

  if (!pathUserId || pathUserId !== authenticatedUserId) {
    return {
      isValid: false,
      error: "Access denied: You can only access your own files",
    };
  }

  // Validate that the path contains valid characters (prevent path traversal)
  if (normalizedPath.includes("..") || normalizedPath.includes("//")) {
    return { isValid: false, error: "Invalid characters in file path" };
  }

  return {
    isValid: true,
    normalizedPath,
    userId: pathUserId,
    category: pathParts[2],
    filename: pathParts[pathParts.length - 1],
  };
};

// Validate expiration time
const validateExpiration = (expiresInSeconds) => {
  if (!expiresInSeconds) return DEFAULT_EXPIRATION_SECONDS;

  const expiry = parseInt(expiresInSeconds);
  if (isNaN(expiry)) return DEFAULT_EXPIRATION_SECONDS;

  return Math.max(
    MIN_EXPIRATION_SECONDS,
    Math.min(expiry, MAX_EXPIRATION_SECONDS)
  );
};

export async function POST(req) {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    console.error("Get Presigned URL API - Auth Error:", userError);
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const userId = userData.user.id;

  try {
    const body = await req.json();

    // Handle both single file and array of files
    const isSingleRequest = !Array.isArray(body);
    const requestData = isSingleRequest ? [body] : body;

    if (!requestData || requestData.length === 0) {
      return NextResponse.json(
        { error: "Request body is empty or invalid" },
        { status: 400 }
      );
    }

    // Validate request size (prevent abuse)
    if (requestData.length > 50) {
      return NextResponse.json(
        { error: "Too many files requested. Maximum 50 files per request." },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      requestData.map(async (fileRequest, index) => {
        try {
          const { filePath, bucketName, expiresInSeconds } = fileRequest;

          // Validate required fields
          if (!filePath) {
            return {
              index,
              filePath,
              error: "Missing filePath",
              status: 400,
            };
          }

          // Validate bucket name (optional - defaults to env bucket)
          const targetBucket = bucketName || R2_BUCKET_NAME;
          if (bucketName && bucketName !== R2_BUCKET_NAME) {
            return {
              index,
              filePath,
              error: `Invalid bucket name. Only '${R2_BUCKET_NAME}' is allowed.`,
              status: 400,
            };
          }

          // Validate and parse file path
          const pathValidation = validateAndParseFilePath(filePath, userId);
          if (!pathValidation.isValid) {
            return {
              index,
              filePath,
              error: pathValidation.error,
              status: 403,
            };
          }

          // Validate and normalize expiration
          const expiry = validateExpiration(expiresInSeconds);

          // Create S3 command
          const getCommand = new GetObjectCommand({
            Bucket: targetBucket,
            Key: pathValidation.normalizedPath,
          });

          // Generate presigned URL
          const url = await getSignedUrl(s3Client, getCommand, {
            expiresIn: expiry,
          });

          return {
            index,
            filePath: pathValidation.normalizedPath,
            url,
            expiresIn: expiry,
            expiresAt: new Date(Date.now() + expiry * 1000).toISOString(),
            status: 200,
          };
        } catch (s3Error) {
          console.error(
            `Error generating signed URL for file at index ${index}:`,
            s3Error
          );
          return {
            index,
            filePath: fileRequest?.filePath || "unknown",
            error: "Failed to generate presigned URL",
            details:
              process.env.NODE_ENV === "development"
                ? s3Error.message
                : undefined,
            status: 500,
          };
        }
      })
    );

    // Handle single request response
    if (isSingleRequest) {
      const result = results[0];
      if (result.error) {
        return NextResponse.json(
          {
            error: result.error,
            details: result.details,
          },
          { status: result.status }
        );
      }

      // Return success response without index for single requests
      const { index, status, ...responseData } = result;
      return NextResponse.json(responseData);
    }

    // Handle batch request response
    const hasErrors = results.some((r) => r.error);
    const successCount = results.filter((r) => !r.error).length;
    const errorCount = results.length - successCount;

    return NextResponse.json(
      {
        results,
        summary: {
          total: results.length,
          successful: successCount,
          failed: errorCount,
        },
      },
      {
        status: hasErrors ? (successCount > 0 ? 207 : 400) : 200,
      }
    );
  } catch (error) {
    console.error("Get Presigned URL API - General Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
