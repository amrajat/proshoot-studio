import JSZip from "jszip";
import { compressImage, getCroppedImage } from "@/lib/imageProcessing";
import createSupabaseBrowserClient from "@/lib/supabase/BrowserClient";

// This function will call the server API for caption generation only
export async function generateCaption(imageBlob, options = {}) {
  try {
    // Set timeout to 15 seconds per image to ensure we stay within overall limit
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000); // 55 second timeout (slightly less than Vercel's 60s limit)

    // Compress image to reduce upload size for the API call ONLY
    let base64Image;
    try {
      base64Image = await compressImage(imageBlob, 0.5); // Reduced to 0.5MB max for API call
    } catch (compressionError) {
      console.error("Image compression error:", compressionError);
      // Fallback to a default caption if compression fails
      clearTimeout(timeoutId);
      return "A photograph.";
    }

    try {
      // Call the existing caption generation endpoint
      const response = await fetch("/dashboard/studio/create/ic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64Image }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Caption generation failed with status ${response.status}`
        );
      }

      const data = await response.json();
      return data.caption || "A photograph.";
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("Caption fetch error:", fetchError);

      // Return a default caption instead of failing
      return "A photograph.";
    }
  } catch (error) {
    if (error.name === "AbortError") {
      console.warn("Caption generation timed out");
      return "A photograph.";
    }
    console.error("Caption generation error:", error);
    return "A photograph.";
  }
}

// This function handles all the client-side processing and direct upload to Supabase
export async function processImagesWithCaptions(
  files,
  crops,
  cropDimension,
  onProgress
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

                        // Generate caption with a compressed version of the image
                        const caption = await generateCaption(croppedBlob, {
                          timeout: 12000,
                        });

                        const imageFileName = `${index + 1}.jpg`;
                        const txtFileName = `${index + 1}.txt`;

                        // Store the high-quality cropped image in the zip
                        zip.file(imageFileName, croppedBlob);
                        zip.file(txtFileName, caption);

                        processedCount++;
                        updateProgress(
                          "processing",
                          (processedCount / totalCount) * 50
                        );

                        resolve({
                          imageName: imageFileName,
                          captionName: txtFileName,
                          caption,
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
                      const txtFileName = `${index + 1}.txt`;

                      zip.file(imageFileName, imageBlob);
                      zip.file(txtFileName, "A photograph.");

                      processedFiles.push({
                        imageName: imageFileName,
                        captionName: txtFileName,
                        caption: "A photograph.",
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
    console.warn(`Some images failed: ${JSON.stringify(errors)}`);
  }

  // If we have no processed files at all, throw an error
  if (processedFiles.length === 0) {
    throw new Error(`Failed to process any images: ${JSON.stringify(errors)}`);
  }

  try {
    updateProgress("zipping", 0);

    // Generate the zip with progress tracking
    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "STORE", // Use STORE instead of DEFLATE to preserve image quality
      onUpdate: (metadata) => {
        updateProgress("zipping", metadata.percent / 2);
      },
    });

    // Log the total zip size for debugging
    console.log(
      `Zip file size: ${(zipBlob.size / (1024 * 1024)).toFixed(2)}MB`
    );

    const MAX_ZIP_SIZE = 50 * 1024 * 1024; // 50MB
    if (zipBlob.size > MAX_ZIP_SIZE) {
      throw new Error(
        `Generated zip file is too large (${(
          zipBlob.size /
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

      // Generate a unique file path using crypto.randomUUID() which is more reliable than uuidv4
      const filePath = `${
        session.user.id
      }/${crypto.randomUUID()}/${Date.now()}.zip`;

      // Upload directly to Supabase from the client
      const { data, error } = await supabase.storage
        .from("training-images")
        .upload(filePath, zipBlob, {
          contentType: "application/zip",
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

      return {
        zipBlob,
        processedFiles,
        errors: errors.length > 0 ? errors : undefined,
        stats: {
          total: totalCount,
          processed: processedCount,
          failed: errors.length,
          zipSizeMB: (zipBlob.size / (1024 * 1024)).toFixed(2),
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
        signedUrl: signedUrlData.signedUrl,
      };
    } catch (uploadError) {
      console.error("Supabase upload error:", uploadError);
      throw new Error(`Failed to upload to Supabase: ${uploadError.message}`);
    }
  } catch (error) {
    console.error("Zip generation error:", error);
    throw new Error(`Failed to create zip file: ${error.message}`);
  }
}
