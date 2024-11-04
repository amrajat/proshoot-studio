"use client";
import ImageUploadingGuideLines from "@/components/dashboard/studio/ImageUploadingGuideLines";
import Button from "@/components/ui/Button";
import { useState, useCallback, useRef } from "react";
import createSupabaseBrowserClient from "@/lib/supabase/BrowserClient";
import { v4 as uuidv4 } from "uuid";

import {
  HiCloudArrowUp,
  HiOutlinePaperClip,
  HiTrash,
  HiXMark,
} from "react-icons/hi2";
import Image from "next/image";

const supabase = createSupabaseBrowserClient();

export default function Component() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = useCallback((e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
    }
  }, []);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = useCallback((index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setPreviews((prevPreviews) => {
      URL.revokeObjectURL(prevPreviews[index]);
      return prevPreviews.filter((_, i) => i !== index);
    });
  }, []);

  const removeAllFiles = useCallback(() => {
    previews.forEach((preview) => URL.revokeObjectURL(preview));
    setFiles([]);
    setPreviews([]);
  }, [previews]);

  const uploadFiles = useCallback(async () => {
    setUploading(true);
    setProgress(0);

    const {
      data: {
        session: { user },
      },
    } = await supabase.auth.getSession();

    const randomString = uuidv4();

    let uploadedCount = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const { error } = await supabase.storage
        .from("temp-flux")
        .upload(`${user?.id}/${randomString}/${Date.now()}_${file.name}`, file);

      if (error) {
        console.error("Error uploading file:", error);
        // Implement proper error handling here
      } else {
        uploadedCount++;
        // Update progress after each successful upload
        setProgress((uploadedCount / files.length) * 100);
      }
    }

    // Set isCompleted only after all files have been processed
    setIsCompleted(uploadedCount === files.length);
    setUploading(false);
    removeAllFiles();
  }, [files, removeAllFiles]);

  return (
    <>
      {!isCompleted && (
        <div className="w-full mx-auto space-y-4">
          <p className="font-semibold">
            <span className="text-red-600">Information: </span>It appears that
            your initial AI photoshoot did not meet your expectations,
            particularly with the headshots. This could be due to the quality of
            the training images provided. To improve the results, we kindly
            request that you re-upload high-quality images. We strongly
            recommend submitting at{" "}
            <span className="text-red-600">
              least 10 to 12 good-quality images
            </span>{" "}
            to ensure the AI-generated headshots are sharp and realistic and
            resemble you accurately. Please adhere to this image upload
            guideline, as we cannot emphasize enough that good input leads to
            good results.{" "}
            <span className="text-green-600">
              You can safely ignore old images that were used creating your
              first studio.
            </span>
            Thanks!
          </p>
          <ImageUploadingGuideLines />

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
          />
          <button
            onClick={triggerFileInput}
            disabled={uploading}
            className="py-3 px-4 inline-flex justify-center items-center gap-x-2 text-base font-semibold rounded border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
          >
            <HiOutlinePaperClip strokeWidth={2} />
            Select Images
          </button>

          {previews.length > 0 && (
            <div className="flex w-full flex-wrap gap-2 mt-4 justify-center">
              {previews.map((preview, index) => (
                <div key={index} className="relative">
                  <Image
                    width={160}
                    height={160}
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-40 object-cover rounded-md"
                  />
                  <button
                    // variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => removeFile(index)}
                  >
                    <HiXMark
                      className="h-4 w-4 text-red-600"
                      strokeWidth={1.25}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}

          {previews.length > 0 && (
            <div className="space-y-2 space-x-2">
              <Button
                onClick={uploadFiles}
                disabled={uploading || files.length < 1}
              >
                <HiCloudArrowUp />
                {uploading ? "Uploading..." : "Upload & Create Studio"}
              </Button>
              <Button
                onClick={removeAllFiles}
                cls="bg-red-600 hover:bg-red-700"
                disabled={uploading}
              >
                <HiTrash />
                Remove All Images
              </Button>
            </div>
          )}

          {parseInt(progress) <= 100 && parseInt(progress) > 0 && (
            <div
              className="flex w-full h-4 bg-gray-200 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={parseInt(progress)}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div
                className="flex flex-col justify-center rounded-full overflow-hidden bg-blue-600 text-xs text-white text-center whitespace-nowrap duration-500 transition-all"
                style={{ width: `${parseInt(progress)}%` }}
              >
                {parseInt(progress)}%
              </div>
            </div>
          )}
        </div>
      )}
      {isCompleted && parseInt(progress) === 100 && !uploading && (
        <h1 className="text-2xl font-bold">
          Thank you! If you don't hear from us within 3 business days, please
          email us.
        </h1>
      )}
    </>
  );
}
