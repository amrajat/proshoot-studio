import { NextResponse } from "next/server";
import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import createSupabaseServerClient from "@/lib/supabase/server-client";

// Initialize R2/S3 client
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

if (
  !R2_ENDPOINT ||
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY ||
  !R2_BUCKET_NAME
) {
  console.error(
    "R2 environment variables for batch delete are not fully configured."
  );
}

const s3Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  const supabase = await createSupabaseServerClient();

  try {
    const { userToken } = await request.json();

    if (!userToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(userToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Invalid user session" },
        { status: 401 }
      );
    }

    const userId = user.id;
    const userFolderPrefix = `${userId}/`;

    // List all objects in the user's folder
    let allObjects = [];
    let isTruncated = true;
    let continuationToken = undefined;

    while (isTruncated) {
      const listCommand = new ListObjectsV2Command({
        Bucket: R2_BUCKET_NAME,
        Prefix: userFolderPrefix,
        ContinuationToken: continuationToken,
      });
      const listResponse = await s3Client.send(listCommand);

      if (listResponse.Contents) {
        allObjects.push(...listResponse.Contents);
      }
      isTruncated = listResponse.IsTruncated;
      continuationToken = listResponse.NextContinuationToken;
    }

    if (allObjects.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No objects found to delete.",
      });
    }

    // Prepare objects for batch deletion (max 1000 per request)
    const objectsToDelete = allObjects.map((obj) => ({ Key: obj.Key }));

    // R2 DeleteObjects can handle up to 1000 keys at a time.
    // If you expect more than 1000 objects per user, you'll need to batch this.
    // For simplicity, this example assumes less than 1000. For more, implement chunking.
    const MAX_DELETE_BATCH = 1000;
    for (let i = 0; i < objectsToDelete.length; i += MAX_DELETE_BATCH) {
      const batch = objectsToDelete.slice(i, i + MAX_DELETE_BATCH);
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: R2_BUCKET_NAME,
        Delete: {
          Objects: batch,
          Quiet: false, // Set to true if you don't need success/error for each object in response
        },
      });
      const deleteResult = await s3Client.send(deleteCommand);
      if (deleteResult.Errors && deleteResult.Errors.length > 0) {
        console.error("Errors during batch delete:", deleteResult.Errors);
        // Handle partial failure if necessary
        return NextResponse.json(
          {
            error: "Some objects failed to delete.",
            details: deleteResult.Errors,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${allObjects.length} object(s) from ${userFolderPrefix}`,
    });
  } catch (error) {
    console.error("Error deleting all objects for user:", error);
    return NextResponse.json(
      { error: "Failed to delete objects.", details: error.message },
      { status: 500 }
    );
  }
}
