import JSZip from "jszip";
import { getCroppedImage } from "@/lib/imageProcessing";
import createSupabaseBrowserClient from "@/lib/supabase/BrowserClient";
import { v4 as uuidv4 } from "uuid";

// This function handles all the client-side processing and direct upload to Supabase
export async function processImagesWithCaptions(
  files,
  crops,
  cropDimension,
  onProgress,
  gender
) {
  const zip = new JSZip();
  const processedFiles = [];
  const errors = [];
  const MAX_RETRIES = 2;

  const BATCH_SIZE = 3; // Process 3 images at a time
  const CONCURRENT_BATCHES = 2; // Run 2 batches concurrently

  // Create a progress tracker
  let processedCount = 0;
  const totalCount = files.length;

  // Update progress
  const updateProgress = (stage, percent) => {
    if (onProgress) {
      onProgress({
        stage,
        percent,
        processed: processedCount,
        total: totalCount,
      });
    }
  };

  updateProgress("processing", 0);

  for (let i = 0; i < files.length; i += BATCH_SIZE * CONCURRENT_BATCHES) {
    const batchPromises = [];

    for (let j = 0; j < CONCURRENT_BATCHES; j++) {
      const startIdx = i + j * BATCH_SIZE;
      const batch = files.slice(startIdx, startIdx + BATCH_SIZE);

      if (batch.length > 0) {
        batchPromises.push(
          Promise.all(
            batch.map(async (file, batchIndex) => {
              const index = startIdx + batchIndex;
              let retries = 0;

              while (retries <= MAX_RETRIES) {
                try {
                  const cropData = crops[index] || file.initialCrop;
                  if (!cropData) {
                    throw new Error(`Missing crop data for image ${index + 1}`);
                  }

                  // Add a timeout for the entire processing of this image
                  const processingPromise = new Promise(
                    async (resolve, reject) => {
                      const timeoutId = setTimeout(() => {
                        reject(
                          new Error(
                            `Processing timed out for image ${index + 1}`
                          )
                        );
                      }, 30000); // 30 seconds timeout per image

                      try {
                        // Get high-quality cropped image for storage
                        const croppedBlob = await getCroppedImage(
                          file.preview,
                          cropData,
                          cropDimension,
                          1.0 // Use maximum quality (1.0) for the stored image
                        );

                        if (!croppedBlob || croppedBlob.size === 0) {
                          reject(
                            new Error(`Failed to crop image ${index + 1}`)
                          );
                          return;
                        }

                        // Use a more generic naming scheme to hide the purpose
                        const imageFileName = `${index + 1}.jpg`;
                        const metaFileName = `${index + 1}.txt`;

                        // Store the high-quality cropped image in the zip
                        zip.file(imageFileName, croppedBlob);
                        zip.file(metaFileName, `ohwx ${gender || "person"}`);

                        processedCount++;
                        updateProgress(
                          "processing",
                          (processedCount / totalCount) * 50
                        );

                        resolve({
                          imageName: imageFileName,
                          metaName: metaFileName,
                          meta: `ohwx ${gender || "person"}`,
                          size: croppedBlob.size, // Track the size for debugging
                        });
                      } catch (error) {
                        reject(error);
                      } finally {
                        clearTimeout(timeoutId);
                      }
                    }
                  );

                  const result = await processingPromise;
                  processedFiles.push(result);
                  break; // Success, exit retry loop
                } catch (error) {
                  retries++;
                  console.warn(
                    `Error processing image ${index + 1} (attempt ${retries}):`,
                    error
                  );

                  if (retries > MAX_RETRIES) {
                    // If we've exhausted retries, add a fallback entry
                    try {
                      // Try to use the original image if cropping failed
                      const imageBlob = file.file;
                      const imageFileName = `${index + 1}.jpg`;
                      const metaFileName = `${index + 1}.txt`;

                      zip.file(imageFileName, imageBlob);
                      zip.file(metaFileName, `ohwx ${gender || "person"}`);

                      processedFiles.push({
                        imageName: imageFileName,
                        metaName: metaFileName,
                        meta: `ohwx ${gender || "person"}`,
                        fallback: true,
                        size: imageBlob.size, // Track the size for debugging
                      });

                      processedCount++;
                      updateProgress(
                        "processing",
                        (processedCount / totalCount) * 50
                      );
                    } catch (fallbackError) {
                      errors.push({
                        index,
                        fileName: file.file.name,
                        error: `Failed after ${MAX_RETRIES} retries: ${error.message}`,
                      });
                    }
                  } else {
                    // Wait before retrying
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                  }
                }
              }
            })
          )
        );
      }
    }

    // Wait for current batch of concurrent operations to complete
    await Promise.all(batchPromises);
  }

  // Log errors but continue if we have at least some processed files
  if (errors.length > 0) {
    // console.warn(`Some images failed: ${JSON.stringify(errors)}`);
  }

  // If we have no processed files at all, throw an error
  if (processedFiles.length === 0) {
    throw new Error(`Failed to process any images: ${JSON.stringify(errors)}`);
  }

  try {
    updateProgress("packaging", 0);

    // Generate the zip with progress tracking
    const packagedData = await zip.generateAsync({
      type: "blob",
      compression: "STORE", // Use STORE instead of DEFLATE to preserve image quality
      onUpdate: (metadata) => {
        updateProgress("packaging", metadata.percent / 2);
      },
    });

    const MAX_PACKAGE_SIZE = 50 * 1024 * 1024; // 50MB
    if (packagedData.size > MAX_PACKAGE_SIZE) {
      throw new Error(
        `Generated package is too large (${(
          packagedData.size /
          (1024 * 1024)
        ).toFixed(2)}MB)`
      );
    }

    updateProgress("uploading", 0);

    // Direct upload to Supabase from the client
    try {
      const supabase = createSupabaseBrowserClient();

      // Get user session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session || !session.user) {
        throw new Error(
          "Authentication session not found. Please log in again."
        );
      }

      // Generate a unique file path using uuidv4 which is more reliable in browser environments
      // Use a more generic name for the file
      const filePath = `${
        session.user.id
      }/${uuidv4()}/${Date.now()}-${uuidv4()}.zip`;

      // Upload directly to Supabase from the client
      const { data, error } = await supabase.storage
        .from("training-images")
        .upload(filePath, packagedData, {
          contentType: "application/octet-stream", // Use generic content type
          cacheControl: "3600",
          upsert: false, // Ensure we don't overwrite existing files
        });

      if (error) {
        throw error;
      }

      updateProgress("uploading", 50);

      // Generate a signed URL
      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
          .from("training-images")
          .createSignedUrl(filePath, 604800);

      if (signedUrlError) {
        throw signedUrlError;
      }

      updateProgress("uploading", 100);

      // Don't expose the actual URL to console logs
      const secureUrl = signedUrlData.signedUrl;

      return {
        processedFiles,
        errors: errors.length > 0 ? errors : undefined,
        stats: {
          total: totalCount,
          processed: processedCount,
          failed: errors.length,
          packageSizeMB: (packagedData.size / (1024 * 1024)).toFixed(2),
          averageImageSizeMB:
            processedFiles.length > 0
              ? (
                  processedFiles.reduce(
                    (sum, file) => sum + (file.size || 0),
                    0
                  ) /
                  processedFiles.length /
                  (1024 * 1024)
                ).toFixed(2)
              : 0,
        },
        signedUrl: secureUrl,
      };
    } catch (uploadError) {
      throw new Error(`Failed to upload data: ${uploadError.message}`);
    }
  } catch (error) {
    throw new Error(`Failed to package data: ${error.message}`);
  }
}
