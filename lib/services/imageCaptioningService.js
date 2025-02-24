import JSZip from "jszip";
import { compressImage, getCroppedImage } from "@/lib/imageProcessing";

export async function generateCaption(imageBlob) {
  try {
    // Compress image if larger than 1MB
    const base64Image = await compressImage(imageBlob, 1);

    const response = await fetch("/dashboard/studio/create/imagecaption", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: base64Image }),
    });

    if (!response.ok) {
      throw new Error("Caption generation failed");
    }

    const data = await response.json();
    return data.caption;
  } catch (error) {
    console.error("Caption generation error:", error);
    return "Failed to generate caption";
  }
}

export async function processImagesWithCaptions(files, crops, cropDimension) {
  const zip = new JSZip();
  const processedFiles = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      // Get the cropped image blob
      const cropData = crops[i] || file.initialCrop;
      const croppedBlob = await getCroppedImage(
        file.preview,
        cropData,
        cropDimension
      );

      // Generate caption using the cropped image
      const caption = await generateCaption(croppedBlob);

      // Add cropped image to zip with new naming convention
      const imageFileName = `${i + 1}.jpg`;
      zip.file(imageFileName, croppedBlob);

      // Add caption file to zip with new naming convention
      const txtFileName = `${i + 1}.txt`;
      zip.file(txtFileName, caption);

      processedFiles.push({
        imageName: imageFileName,
        captionName: txtFileName,
        caption,
      });
    } catch (error) {
      console.error(`Error processing ${file.file.name}:`, error);
    }
  }

  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "STORE",
  });

  return {
    zipBlob,
    processedFiles,
  };
}
