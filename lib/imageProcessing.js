export const compressImage = async (imageBlob, maxSizeInMB = 1) => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();

      // Set a timeout to prevent hanging
      const timeout = setTimeout(() => {
        reject(new Error("Image compression timed out"));
      }, 30000);

      img.onload = () => {
        clearTimeout(timeout);
        try {
          const canvas = document.createElement("canvas");
          let { width, height } = img;

          // Start with original dimensions
          let quality = 0.7;
          let compression = 1;

          // If image is larger than maxSizeInMB, reduce dimensions
          if (imageBlob.size > maxSizeInMB * 1024 * 1024) {
            compression = Math.min(
              1,
              (maxSizeInMB * 1024 * 1024) / imageBlob.size
            );
            compression = Math.sqrt(compression); // Square root for more gradual reduction
            width *= compression;
            height *= compression;
          }

          // Ensure dimensions are valid
          width = Math.max(1, Math.round(width));
          height = Math.max(1, Math.round(height));

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with reduced quality
          const thumbnail = canvas.toDataURL("image/jpeg", quality);
          URL.revokeObjectURL(img.src);
          resolve(thumbnail);
        } catch (error) {
          reject(new Error(`Image compression failed: ${error.message}`));
        }
      };

      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error("Failed to load image for compression"));
      };

      img.src = URL.createObjectURL(imageBlob);
    } catch (error) {
      reject(new Error(`Image compression setup failed: ${error.message}`));
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
