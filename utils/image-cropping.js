// FIXME: TODO: THIS IS NOT IN USED SO FEEL FREE TO REMOVE IT

/**
 * Convert percentage-based crop coordinates to pixel coordinates
 * @param {Object} crop - Crop data with x, y, width, height in percentages
 * @param {number} imageWidth - Original image width in pixels
 * @param {number} imageHeight - Original image height in pixels
 * @returns {Object} Pixel-based crop coordinates
 */
export const convertCropToPixels = (crop, imageWidth, imageHeight) => {
  console.log("🔄 Converting crop to pixels:", {
    crop,
    imageWidth,
    imageHeight,
  });

  const pixelCrop = {
    x: Math.round((crop.x / 100) * imageWidth),
    y: Math.round((crop.y / 100) * imageHeight),
    width: Math.round((crop.width / 100) * imageWidth),
    height: Math.round((crop.height / 100) * imageHeight),
  };

  console.log("✅ Pixel coordinates:", pixelCrop);
  return pixelCrop;
};

/**
 * Manually crop an image using Canvas API
 * @param {string|HTMLImageElement} imageSrc - Image source or image element
 * @param {Object} crop - Crop coordinates in percentages
 * @param {number} outputWidth - Desired output width (optional)
 * @param {number} outputHeight - Desired output height (optional)
 * @returns {Promise<Blob>} Cropped image as blob
 */
export const manualCropImage = async (
  imageSrc,
  crop,
  outputWidth = null,
  outputHeight = null
) => {
  return new Promise((resolve, reject) => {
    try {
      console.log("✂️ Manual crop started:", {
        crop,
        outputWidth,
        outputHeight,
      });

      const image = new Image();

      image.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Convert percentage crop to pixels
          const pixelCrop = convertCropToPixels(
            crop,
            image.width,
            image.height
          );

          // Set canvas size (use crop dimensions if output size not specified)
          canvas.width = outputWidth || pixelCrop.width;
          canvas.height = outputHeight || pixelCrop.height;

          console.log("🖼️ Canvas setup:", {
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            sourceRegion: pixelCrop,
          });

          // Draw the cropped portion
          ctx.drawImage(
            image,
            pixelCrop.x, // Source X
            pixelCrop.y, // Source Y
            pixelCrop.width, // Source Width
            pixelCrop.height, // Source Height
            0, // Destination X
            0, // Destination Y
            canvas.width, // Destination Width
            canvas.height // Destination Height
          );

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                console.log("✅ Manual crop completed:", {
                  originalSize: `${image.width}x${image.height}`,
                  croppedSize: `${canvas.width}x${canvas.height}`,
                  blobSize: (blob.size / 1024).toFixed(2) + "KB",
                });
                resolve(blob);
              } else {
                reject(new Error("Failed to create blob from canvas"));
              }
            },
            "image/jpeg",
            0.95
          );
        } catch (error) {
          console.error("❌ Canvas processing error:", error);
          reject(error);
        }
      };

      image.onerror = () => {
        console.error("❌ Failed to load image for cropping");
        reject(new Error("Failed to load image"));
      };

      // Handle both string URLs and image elements
      if (typeof imageSrc === "string") {
        image.src = imageSrc;
      } else if (imageSrc instanceof HTMLImageElement) {
        image.src = imageSrc.src;
      } else {
        reject(new Error("Invalid image source"));
      }
    } catch (error) {
      console.error("❌ Manual crop setup error:", error);
      reject(error);
    }
  });
};

export const getCroppedImage = async (
  imageSrc,
  crop,
  dimension,
  quality = 0.95
) => {
  return new Promise((resolve, reject) => {
    try {
      if (!imageSrc) {
        reject(new Error("No image source provided"));
        return;
      }

      if (!crop) {
        reject(new Error("No crop data provided"));
        return;
      }

      const image = new Image();

      // Set a timeout to prevent hanging
      const timeout = setTimeout(() => {
        reject(new Error("Image cropping timed out"));
      }, 30000);

      image.onload = () => {
        clearTimeout(timeout);
        try {
          // Validate crop data
          const validCrop = {
            x: Math.max(0, Math.min(100, crop.x || 0)),
            y: Math.max(0, Math.min(100, crop.y || 0)),
            width: Math.max(1, Math.min(100 - (crop.x || 0), crop.width || 50)),
            height: Math.max(
              1,
              Math.min(100 - (crop.y || 0), crop.height || 50)
            ),
          };

          const canvas = document.createElement("canvas");
          canvas.width = dimension;
          canvas.height = dimension;
          const ctx = canvas.getContext("2d");

          const sourceX = (validCrop.x / 100) * image.width;
          const sourceY = (validCrop.y / 100) * image.height;
          const sourceWidth = (validCrop.width / 100) * image.width;
          const sourceHeight = (validCrop.height / 100) * image.height;

          // Draw with error handling
          try {
            // Use high quality image rendering
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            ctx.drawImage(
              image,
              sourceX,
              sourceY,
              sourceWidth,
              sourceHeight,
              0,
              0,
              dimension,
              dimension
            );
          } catch (drawError) {
            reject(
              new Error(`Failed to draw cropped image: ${drawError.message}`)
            );
            return;
          }

          // Convert to blob with error handling
          canvas.toBlob(
            (blob) => {
              if (!blob || blob.size === 0) {
                reject(new Error("Generated empty blob"));
                return;
              }
              resolve(blob);
            },
            "image/jpeg",
            quality // Use the provided quality parameter (default 0.95)
          );
        } catch (error) {
          reject(new Error(`Image cropping failed: ${error.message}`));
        }
      };

      image.onerror = () => {
        clearTimeout(timeout);
        reject(new Error("Failed to load image for cropping"));
      };

      image.src = imageSrc;
    } catch (error) {
      reject(new Error(`Image cropping setup failed: ${error.message}`));
    }
  });
};

// Add a utility function to check if an image is valid
export const isImageValid = async (file) => {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      const timeout = setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
        resolve({ valid: false, reason: "Image validation timed out" });
      }, 10000);

      img.onload = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(objectUrl);

        const valid = img.width >= 1024 && img.height >= 1024;
        const reason = valid
          ? ""
          : "Image dimensions are too small (minimum 1024x1024 pixels)";

        resolve({
          valid,
          reason,
          width: img.width,
          height: img.height,
        });
      };

      img.onerror = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(objectUrl);
        resolve({ valid: false, reason: "Failed to load image" });
      };

      img.src = objectUrl;
    } catch (error) {
      resolve({
        valid: false,
        reason: `Image validation error: ${error.message}`,
      });
    }
  });
};
