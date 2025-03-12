import JSZip from "jszip";
import imageCompression from "browser-image-compression";
import { getCroppedImage } from "@/lib/imageProcessing";
import createSupabaseBrowserClient from "@/lib/supabase/BrowserClient";
import { v4 as uuidv4 } from "uuid";

// Function to generate authentication token for secure API requests
function generateAuthToken() {
  // This should match the secret on the server side
  const secretKey = "default-secret-key-change-in-production";
  const timestamp = Date.now().toString();

  // Simple hash function for browser environments
  // In production, you might want to use a more secure method
  // or fetch tokens from a secure endpoint
  function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Generate a token using the timestamp and secret
  const token = simpleHash(timestamp + secretKey + timestamp.slice(0, 5));

  return { timestamp, token };
}

// Optimized function to compress images using browser-image-compression
async function compressImageForAPI(imageBlob) {
  try {
    // Options for compression - specifically for API calls
    const options = {
      maxSizeMB: 0.3, // Compress to 300KB for API calls
      maxWidthOrHeight: 1024, // Resize to max 800px width/height
      useWebWorker: true, // Use web worker for better performance
      fileType: "image/jpeg", // Always convert to JPEG for better compression
      initialQuality: 0.7, // Start with 70% quality
      alwaysKeepResolution: false, // Allow resizing for API calls
      onProgress: () => {}, // Progress tracking if needed
      signal: null, // For abort controller if needed
    };

    // Compress the image
    const compressedFile = await imageCompression(imageBlob, options);
    // log the size of the compressed file in MB

    // Convert to base64 for API transmission
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = (error) =>
        reject(new Error(`Base64 conversion failed: ${error}`));
    });
  } catch (error) {
    throw error;
  }
}

// This function will call the server API for image content (IC) generation only
export async function generateCaption(imageBlob, options = {}) {
  const MAX_RETRIES = 2;
  let retryCount = 0;
  const DEFAULT_CAPTION = "A photograph of JSSPRT.";

  // Function to attempt IC generation with retry logic
  async function attemptICGeneration() {
    try {
      // Set timeout to 45 seconds per image to ensure we stay within Vercel's 60s limit
      // with some buffer for processing
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      // Compress image to reduce upload size for the API call ONLY
      let base64Image;
      try {
        base64Image = await compressImageForAPI(imageBlob);
      } catch (compressionError) {
        clearTimeout(timeoutId);
        return DEFAULT_CAPTION;
      }

      try {
        // Generate authentication token
        const auth = generateAuthToken();

        // Call the existing IC generation endpoint
        const response = await fetch("/dashboard/studio/create/ic", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: base64Image,
            timestamp: auth.timestamp,
            token: auth.token,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error ||
              `IC generation failed with status ${response.status}`
          );
        }

        const data = await response.json();

        // Handle the obfuscated response
        if (data.data && data.type === "ic-data") {
          try {
            // Decode the base64 encoded data
            const decodedData = atob(data.data);
            return decodedData || DEFAULT_CAPTION;
          } catch (decodeError) {
            return DEFAULT_CAPTION;
          }
        }

        return DEFAULT_CAPTION;
      } catch (fetchError) {
        clearTimeout(timeoutId);

        // Check if we should retry
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retrying IC generation (attempt ${retryCount})`);
          // Wait a short time before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return attemptICGeneration();
        }

        // Return a default caption after exhausting retries
        return DEFAULT_CAPTION;
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.warn("IC generation timed out");

        // Check if we should retry
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(
            `Retrying IC generation after timeout (attempt ${retryCount})`
          );
          // Wait a short time before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return attemptICGeneration();
        }
      }

      return DEFAULT_CAPTION;
    }
  }

  // Start the IC generation process with retry logic
  return attemptICGeneration();
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
                        const caption = await generateCaption(croppedBlob);

                        // Use a more generic naming scheme to hide the purpose
                        const imageFileName = `${index + 1}.jpg`;
                        const metaFileName = `${index + 1}.txt`;

                        // Store the high-quality cropped image in the zip
                        zip.file(imageFileName, croppedBlob);
                        zip.file(metaFileName, caption);

                        processedCount++;
                        updateProgress(
                          "processing",
                          (processedCount / totalCount) * 50
                        );

                        resolve({
                          imageName: imageFileName,
                          metaName: metaFileName,
                          meta: caption,
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
                      zip.file(metaFileName, "A photograph of JSSPRT.");

                      processedFiles.push({
                        imageName: imageFileName,
                        metaName: metaFileName,
                        meta: "A photograph of JSSPRT.",
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

      // Generate a unique file path using crypto.randomUUID() which is more reliable than uuidv4
      // Use a more generic name for the file
      const filePath = `${
        session.user.id
      }/${uuidv4()}/${Date.now()}-${uuidv4()}-${uuidv4()}.zip`;

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
