import { NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export async function DELETE(request) {
  try {
    const { objectKey, bucketName, deletePath } = await request.json();

    console.log("🗑️ R2 Delete request:", { objectKey, bucketName, deletePath });

    if (deletePath) {
      // Delete all objects with the specified path prefix
      const listCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: deletePath,
      });

      const listResponse = await s3Client.send(listCommand);
      
      if (listResponse.Contents && listResponse.Contents.length > 0) {
        const deleteObjects = listResponse.Contents.map(obj => ({ Key: obj.Key }));
        
        const deleteCommand = new DeleteObjectsCommand({
          Bucket: bucketName,
          Delete: {
            Objects: deleteObjects,
          },
        });

        await s3Client.send(deleteCommand);
        console.log("✅ Deleted", deleteObjects.length, "objects from path:", deletePath);
        
        return NextResponse.json({ 
          success: true, 
          deletedCount: deleteObjects.length,
          deletedObjects: deleteObjects.map(obj => obj.Key)
        });
      } else {
        console.log("ℹ️ No objects found at path:", deletePath);
        return NextResponse.json({ success: true, deletedCount: 0 });
      }
    } else if (objectKey) {
      // Delete single object
      const deleteCommand = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      });

      await s3Client.send(deleteCommand);
      console.log("✅ Deleted single object:", objectKey);
      
      return NextResponse.json({ success: true, deletedObject: objectKey });
    } else {
      return NextResponse.json(
        { error: "Either objectKey or deletePath is required" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("❌ R2 delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete from R2: " + error.message },
      { status: 500 }
    );
  }
}
