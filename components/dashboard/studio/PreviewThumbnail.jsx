// components/ImagePreview.tsx
import React from "react";
import Image from "next/image";
import {
  IoCheckmarkCircle,
  IoTrashBin,
  IoRefreshCircle,
} from "react-icons/io5";
import Link from "next/link";

const PreviewThumbnail = ({
  images,
  onRemoveImage,
  setImageError,
  imageError,
  MAX_IMAGE_SIZE,
}) => {
  return (
    <div className="p-4 md:p-5 space-y-7">
      {/* <div className="flex flex-col bg-white border shadow-sm rounded-xl dark:bg-slate-800 dark:border-gray-700"> */}
      {images.map((image, index) => {
        const src = URL.createObjectURL(image);
        return (
          <div key={index}>
            {/* Uploading File Content */}
            <div className="mb-2 flex justify-between items-center">
              <div className="flex items-center gap-x-3">
                <Link href={src} target="_blank">
                  <span className="size-20 object-cover overflow-hidden flex justify-center items-center border border-gray-200 text-gray-500 rounded-md dark:border-neutral-700">
                    <Image
                      src={src}
                      alt={image.name}
                      width={100}
                      height={100}
                      style={{ objectFit: "contain" }}
                    />
                  </span>
                </Link>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {image.name}
                  </p>
                  <p
                    className={`text-xs ${
                      image.size > MAX_IMAGE_SIZE ||
                      !image.type.startsWith("image/")
                        ? "text-red-500"
                        : "text-gray-500 dark:text-gray-500"
                    }`}
                  >
                    {Math.round(
                      (Number(image.size) / 1024 / 1024 + Number.EPSILON) * 100
                    ) / 100}
                    MB {image.type.toUpperCase()}{" "}
                  </p>
                  <p className="text-xs text-red-500">
                    {Number(image.size) > MAX_IMAGE_SIZE ||
                    !image.type.startsWith("image/")
                      ? "This is not a valid image/size. Please remove this by clicking on trash icon right side."
                      : ""}
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-x-2">
                {/* <IoCheckmarkCircle /> */}

                <button
                  className="text-red-500"
                  onClick={(e) => onRemoveImage(index, e)}
                >
                  <IoTrashBin />
                </button>
              </div>
            </div>
            {/* End Uploading File Content */}
          </div>
        );
      })}
    </div>
  );
};

export default PreviewThumbnail;
