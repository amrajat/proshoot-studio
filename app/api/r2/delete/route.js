import { NextResponse } from "next/server";
import {
  S3Client,
  DeleteObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import createSupabaseServerClient from "@/lib/supabase/server-client";
import { env } from "@/lib/env";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

// Helper function to extract user ID from object path
const extractUserIdFromPath = (path) => {
  if (!path) return null;
  const parts = path.split("/");
  return parts[0]; // First part should be the user ID
};

export async function DELETE(request) {
  try {
    const { objectKey, bucketName, deletePath } = await request.json();

    // --- Authentication ---
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // --- Authorization - Extract and validate user ID from path ---
    const pathToCheck = objectKey || deletePath;
    const pathUserId = extractUserIdFromPath(pathToCheck);

    if (!pathUserId) {
      return NextResponse.json(
        { error: "Invalid path format - user ID not found" },
        { status: 400 }
      );
    }

    if (pathUserId !== user.id) {
      return NextResponse.json(
        { error: "Access denied: You can only delete your own files" },
        { status: 403 }
      );
    }

    if (deletePath) {
      // Delete all objects with the specified path prefix
      const listCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: deletePath,
      });

      const listResponse = await s3Client.send(listCommand);

      if (listResponse.Contents && listResponse.Contents.length > 0) {
        const deleteObjects = listResponse.Contents.map((obj) => ({
          Key: obj.Key,
        }));

        const deleteCommand = new DeleteObjectsCommand({
          Bucket: bucketName,
          Delete: {
            Objects: deleteObjects,
          },
        });

        await s3Client.send(deleteCommand);

        return NextResponse.json({
          success: true,
          deletedCount: deleteObjects.length,
          deletedObjects: deleteObjects.map((obj) => obj.Key),
        });
      } else {
        return NextResponse.json({ success: true, deletedCount: 0 });
      }
    } else if (objectKey) {
      // Delete single object
      const deleteCommand = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      });

      await s3Client.send(deleteCommand);

      return NextResponse.json({ success: true, deletedObject: objectKey });
    } else {
      return NextResponse.json(
        { error: "Either objectKey or deletePath is required" },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete from R2: " + error.message },
      { status: 500 }
    );
  }
}
