import JSZip from "jszip";
import { compressImage, getCroppedImage } from "@/lib/imageProcessing";

export async function generateCaption(imageBlob) {
  try {
    // Add timeout and retry logic
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const base64Image = await compressImage(imageBlob, 1);

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
    throw error; // Propagate error up
  }
}

export async function processImagesWithCaptions(files, crops, cropDimension) {
  const zip = new JSZip();
  const processedFiles = [];
  const errors = [];

  // Process images in smaller batches to avoid memory issues
  const BATCH_SIZE = 5;
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (file, batchIndex) => {
        const index = i + batchIndex;
        try {
          // Add validation for crop data
          const cropData = crops[index] || file.initialCrop;
          if (!cropData) {
            throw new Error(`Missing crop data for image ${index + 1}`);
          }

          const croppedBlob = await getCroppedImage(
            file.preview,
            cropData,
            cropDimension
          );

          // Validate cropped blob
          if (!croppedBlob || croppedBlob.size === 0) {
            throw new Error(`Failed to crop image ${index + 1}`);
          }

          // Retry caption generation up to 3 times
          let caption;
          let attempts = 0;
          while (attempts < 3) {
            try {
              caption = await generateCaption(croppedBlob);
              break;
            } catch (error) {
              attempts++;
              if (attempts === 3) throw error;
              await new Promise((resolve) =>
                setTimeout(resolve, 1000 * attempts)
              );
            }
          }

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
    );
  }

  if (errors.length > 0) {
    throw new Error(`Failed to process some images: ${JSON.stringify(errors)}`);
  }

  try {
    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "STORE",
    });

    // Validate zip file size
    const MAX_ZIP_SIZE = 200 * 1024 * 1024; // 100MB
    if (zipBlob.size > MAX_ZIP_SIZE) {
      throw new Error("Generated zip file is too large");
    }

    return {
      zipBlob,
      processedFiles,
    };
  } catch (error) {
    console.error("Zip generation error:", error);
    throw new Error("Failed to create zip file");
  }
}
