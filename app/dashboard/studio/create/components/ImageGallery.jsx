"use client";

import { PhotoProvider } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import ViewGeneratedImage from "./ViewGeneratedImage";

export default function ImageGallery({ images, tune_id, alreadyDownloaded }) {
  return (
    <PhotoProvider
      maskOpacity={0.8}
      speed={() => 250}
      easing={(type) =>
        type === 2
          ? "cubic-bezier(0.36, 0, 0.66, -0.56)"
          : "cubic-bezier(0.34, 1.56, 0.64, 1)"
      }
      toolbarRender={({ rotate, onRotate }) => {
        return (
          <div className="flex items-center gap-2">
            <svg
              className="cursor-pointer w-6 h-6 text-white"
              onClick={() => onRotate(rotate + 90)}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
        );
      }}
      loop={false}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((image, index) => (
          <ViewGeneratedImage
            key={index}
            image={image}
            tune_id={tune_id}
            alreadyDownloaded={alreadyDownloaded}
            imageNumber={index + 1}
            allImages={images}
            currentIndex={index}
          />
        ))}
      </div>
    </PhotoProvider>
  );
}
