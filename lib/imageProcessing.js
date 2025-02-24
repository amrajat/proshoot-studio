export const compressImage = async (imageBlob, maxSizeInMB = 1) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      // Start with original dimensions
      let quality = 0.7;
      let compression = 1;

      // If image is larger than maxSizeInMB, reduce dimensions
      if (imageBlob.size > maxSizeInMB * 1024 * 1024) {
        compression = Math.min(1, (maxSizeInMB * 1024 * 1024) / imageBlob.size);
        compression = Math.sqrt(compression); // Square root for more gradual reduction
        width *= compression;
        height *= compression;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to base64 with reduced quality
      const thumbnail = canvas.toDataURL("image/jpeg", quality);
      URL.revokeObjectURL(img.src);
      resolve(thumbnail);
    };
    img.src = URL.createObjectURL(imageBlob);
  });
};

export const getCroppedImage = async (imageSrc, crop, dimension) => {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = dimension;
      canvas.height = dimension;
      const ctx = canvas.getContext("2d");

      const sourceX = (crop.x / 100) * image.width;
      const sourceY = (crop.y / 100) * image.height;
      const sourceWidth = (crop.width / 100) * image.width;
      const sourceHeight = (crop.height / 100) * image.height;

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

      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        1.0
      );
    };
  });
};
