import JSZip from "jszip";
import { compressImage, getCroppedImage } from "@/lib/imageProcessing";

export async function generateCaption(imageBlob) {
  try {
    // Set timeout to 15 seconds per image to ensure we stay within overall limit
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    const base64Image = await compressImage(imageBlob, 1); // Reduced to 1MB max

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
      const error = await response.json();
      throw new Error(error.message || "IC generation failed");
    }

    const data = await response.json();
    return data.caption;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("IC generation timed out");
    }
    console.error("IC generation error:", error);
    throw error;
  }
}

export async function processImagesWithCaptions(files, crops, cropDimension) {
  const zip = new JSZip();
  const processedFiles = [];
  const errors = [];

  const BATCH_SIZE = 5; // Process 5 images at a time
  const CONCURRENT_BATCHES = 2; // Run 2 batches concurrently

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
              try {
                const cropData = crops[index] || file.initialCrop;
                if (!cropData) {
                  throw new Error(`Missing crop data for image ${index + 1}`);
                }

                const croppedBlob = await getCroppedImage(
                  file.preview,
                  cropData,
                  cropDimension
                );

                if (!croppedBlob || croppedBlob.size === 0) {
                  throw new Error(`Failed to crop image ${index + 1}`);
                }

                // Set a timeout for caption generation
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 seconds for each batch

                const caption = await generateCaption(croppedBlob, {
                  signal: controller.signal,
                });

                clearTimeout(timeoutId);

                const imageFileName = `${index + 1}.jpg`;
                const txtFileName = `${index + 1}.txt`;

                zip.file(imageFileName, croppedBlob);
                zip.file(txtFileName, caption);

                processedFiles.push({
                  imageName: imageFileName,
                  captionName: txtFileName,
                  caption,
                });
              } catch (error) {
                errors.push({
                  index,
                  fileName: file.file.name,
                  error: error.message,
                });
              }
            })
          )
        );
      }
    }

    // Wait for current batch of concurrent operations to complete
    await Promise.all(batchPromises);
  }

  if (errors.length > 0 && processedFiles.length > 0) {
    console.warn(`Some images failed: ${JSON.stringify(errors)}`);
  } else if (errors.length > 0) {
    throw new Error(`Failed to process images: ${JSON.stringify(errors)}`);
  }

  try {
    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "STORE",
    });

    const MAX_ZIP_SIZE = 50 * 1024 * 1024; // 50MB
    if (zipBlob.size > MAX_ZIP_SIZE) {
      throw new Error("Generated zip file is too large");
    }

    return {
      zipBlob,
      processedFiles,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("Zip generation error:", error);
    throw new Error("Failed to create zip file");
  }
}
