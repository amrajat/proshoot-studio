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
  const [showGuidlines, setShowGuidlines] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [userDetails, setUserDetails] = useState({
    gender: null,
    profession: null,
  });
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
        .upload(
          `${user?.id}/${randomString}/${
            userDetails?.gender + "-" + userDetails?.profession
          }/${Date.now()}_${file.name}`,
          file
        );

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
  }, [files, removeAllFiles, userDetails]);

  return (
    <>
      {!isCompleted && (
        <div className="w-full mx-auto space-y-4">
          <h1 className="font-semibold">
            <span className="text-red-600">Information -</span> This flux-based
            model pipeline is currently in beta so it may take longer than 2
            hours to generate your images please be patient, You'll be notified
            when It's ready by email. if you have anything to say please throw
            an email to support@proshoot.co. We may share some of your generated
            images to our showcase.{" "}
            <span className="text-red-600">
              Please upload images only once. Click on Show Image Guidelines
              button to read more about image upload guidelines.{" "}
            </span>
            If you don't follow the image uploading guideline then it will not
            finetune your images. Please{" "}
            <span className="text-red-600 font-bold underline">
              upload at-least 10 camera facing photos{" "}
            </span>
            taken on different time and place. Thank you!
          </h1>
          {showGuidlines && <ImageUploadingGuideLines />}
          <Button onClick={() => setShowGuidlines(!showGuidlines)}>
            {showGuidlines ? "Hide" : "Show"} Image Guidelines
          </Button>
          {/* Name, Gender, Profession*/}

          <div className="max-w-sm">
            <select
              disabled={uploading}
              onChange={(e) =>
                setUserDetails((prev) => ({
                  ...prev,
                  gender: e.target.value,
                }))
              }
              className="py-3 px-4 pe-9 block w-full bg-white shadow-sm border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    "
              id="gender"
            >
              <option value={null}>Choose gender</option>
              <option value="man">Man</option>
              <option value="woman">Woman</option>
            </select>
          </div>

          <div className="max-w-sm">
            <select
              disabled={uploading}
              onChange={(e) =>
                setUserDetails((prev) => ({
                  ...prev,
                  profession: e.target.value,
                }))
              }
              className="py-3 px-4 pe-9 block w-full bg-white shadow-sm border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    "
              id="profession"
            >
              <option value="">Choose your profession.</option>
              <option value="Legal">Legal</option>
              <option value="Medical">Medical</option>
              <option value="Financial">Financial</option>
              <option value="Tech">Tech</option>
              <option value="Education">Education</option>
              <option value="Creative">Creative</option>
              <option value="Business">Business</option>
              <option value="Health-Wellness">Health & Wellness</option>
              <option value="Social-Service">Social-Service</option>
              <option value="Others">Others</option>
            </select>
          </div>

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
                disabled={
                  uploading ||
                  !userDetails.gender ||
                  !userDetails.profession ||
                  files.length < 10
                }
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
          Thank you! You'll be notified soon by email or check your studio page
          for generated headshots.
        </h1>
      )}
    </>
  );
}
