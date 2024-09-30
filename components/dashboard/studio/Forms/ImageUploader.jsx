"use client";
import Button from "@/components/ui/Button";
import { useState, useCallback, useRef } from "react";
import createSupabaseBrowserClient from "@/lib/supabase/BrowserClient";
import { v4 as uuidv4 } from "uuid";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import {
  HiArrowUpTray,
  HiCheckCircle,
  HiOutlinePhoto,
  HiOutlineTrash,
} from "react-icons/hi2";
import JSZip from "jszip";
import Heading, { SubHeading } from "@/components/ui/Heading";
import ImageUploadingGuideLines from "../ImageUploadingGuideLines";
import Loader from "@/components/Loader";

const supabase = createSupabaseBrowserClient();

// Image validation rules
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 5MB
const MAX_NUM_IMAGES = 50;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const ACCEPTED_IMAGE_TYPES = {
  "image/jpeg": [],
  "image/jpg": [],
  "image/png": [],
};

export default function ImageUploader({
  setValue,
  errors,
  isSubmitting,
  studioMessage,
}) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(true);

  const fileInputRef = useRef(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files (e.g., show error messages)
    rejectedFiles.forEach((file) => {
      if (file.file.size > MAX_FILE_SIZE) {
        alert(`File ${file.file.name} is too large. Max size is 50MB.`);
      } else if (!ALLOWED_IMAGE_TYPES.includes(file.file.type)) {
        alert(
          `File ${file.file.name} is not an allowed type. Only JPG and PNG are allowed.`
        );
      }
    });

    // Add accepted files
    setFiles((prevFiles) => {
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
          progress: 0,
          error: null,
        })
      );

      // Limit the number of files
      const totalFiles = [...prevFiles, ...newFiles].slice(0, MAX_NUM_IMAGES);
      return totalFiles;
    });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ACCEPTED_IMAGE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_NUM_IMAGES,
  });

  const handleFileChange = useCallback((e) => {
    onDrop(Array.from(e.target.files), []);
  }, []);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = useCallback((index) => {
    setFiles((prevFiles) => {
      // Revoke object URL to free memory
      URL.revokeObjectURL(prevFiles[index].preview);
      return prevFiles.filter((_, i) => i !== index);
    });
  }, []);

  const removeAllFiles = useCallback(() => {
    files.forEach((file) => URL.revokeObjectURL(file.preview));
    setFiles([]);
  }, [files]);

  const uploadFiles = useCallback(async () => {
    setUploading(true);

    const {
      data: {
        session: { user },
      },
    } = await supabase.auth.getSession();

    try {
      const zip = new JSZip();
      files.forEach((file) => {
        zip.file(file.name, file);
      });
      // Generate the zip file as a Blob
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const filePath = `${user?.id}/${uuidv4()}/${Date.now()}.zip`;

      // Upload the zip blob to Supabase
      const { data, error } = await supabase.storage
        .from("training-images") // Replace with your bucket name
        .upload(filePath, zipBlob, {
          contentType: "application/zip", // Set the content type to zip
        });

      if (error) {
        // Handle error, e.g., show an error message
      } else {
        // Handle success, e.g., show a success message
        // Get signed URL for the uploaded zip file
        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from("training-images")
            .createSignedUrl(filePath, 21600); // Expires after 6 hours. Seconds
        setValue("images", signedUrlData.signedUrl);
      }
    } catch (error) {
      // Handle error, e.g., show an error message
    } finally {
      setUploading(false);
    }
    // Update progress after each successful upload
    // setUploadProgress((uploadedCount / files.length) * 100);
    // await Promise.all(uploadPromises);

    setIsCompleted(true);
    setUploading(false);

    // removeAllFiles(); // You might want to keep the previews after upload
  }, [files]);

  return (
    <>
      {isSubmitting || studioMessage ? (
        studioMessage ? (
          <p className="mt-2 text-sm text-red-500">{studioMessage}</p>
        ) : (
          <Loader />
        )
      ) : (
        <div>
          <span className="text-xs uppercase font-bold pl-0 xs:pl-0 xl:pl-1 text-red-600">
            this field required.
          </span>
          <Heading type="h3">Please upload your images.</Heading>

          <SubHeading align="left" cls="pl-0 xs:pl-0 xl:pl-1">
            Please follow the image uploading guidelines for best results.{" "}
            <span
              onClick={() => setShowGuidelines(!showGuidelines)}
              className="underline cursor-pointer text-blue-600 hover:to-blue-700"
            >
              {showGuidelines ? "Hide" : "Show"} guidelines
            </span>
          </SubHeading>
          {showGuidelines && <ImageUploadingGuideLines />}
          {!isCompleted ? (
            <div className="w-full mx-auto space-y-4 mt-6 transition-all">
              <div
                {...getRootProps()}
                className="dropzone cursor-pointer p-12 flex justify-center bg-white border border-dashed border-blue-600 rounded"
              >
                <input
                  {...getInputProps()}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  ref={fileInputRef}
                />
                <div className="text-center">
                  <span className="inline-flex justify-center items-center size-16 bg-gray-100 text-gray-800 rounded-full">
                    <HiOutlinePhoto
                      className="shrink-0 size-6"
                      width={24}
                      height={24}
                      strokeWidth={2}
                    />
                  </span>
                  <div className="mt-4 flex flex-wrap justify-center text-sm leading-6 text-gray-600">
                    <span className="pe-1 font-medium text-gray-800">
                      Drop your images here or
                    </span>
                    <span className="bg-white font-semibold text-blue-600 hover:text-blue-700 rounded-lg decoration-2 hover:underline focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2">
                      browse
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    Upload up to{" "}
                    <span className="font-medium text-blue-600 hover:text-blue-700">
                      {MAX_NUM_IMAGES} images
                    </span>
                    , each up to{" "}
                    <span className="font-medium text-blue-600 hover:text-blue-700">
                      {(MAX_FILE_SIZE / 1048576).toFixed(0)} MB
                    </span>{" "}
                    and combined size of all images lesser than{" "}
                    <span className="font-medium text-blue-600 hover:text-blue-700">
                      {(MAX_FILE_SIZE / 1048576).toFixed(0)} MB
                    </span>
                    . Accepted formats are{" "}
                    <span className="font-medium text-blue-600 hover:text-blue-700">
                      {ALLOWED_IMAGE_TYPES.join(",").replaceAll("image/", " ")}
                    </span>
                    .
                  </p>
                </div>
              </div>

              {files.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* <div className="mt-4 space-y-2 empty:mt-0"> */}
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white border border-solid border-gray-300 rounded"
                    >
                      <div className="mb-1 flex justify-between items-center">
                        <div className="flex items-center gap-x-3">
                          <span className="size-10 flex justify-center items-center border border-gray-200 text-gray-500 rounded-lg overflow-hidden">
                            <Image
                              width={40}
                              height={40}
                              src={file.preview}
                              alt={`Preview ${index + 1}`}
                              className="rounded object-cover"
                            />
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              <span className="truncate inline-block max-w-[300px] align-bottom" />
                              {file.name.slice(0, 10) +
                                "...XXX." +
                                file.type.split("/")[1]}
                              <span />
                            </p>
                            <span className="text-xs text-gray-500">
                              {(file.size / 1048576).toFixed(2)} MB
                            </span>
                            {file.error && (
                              <p className="text-xs text-red-500">
                                We could not upload this file as it was not
                                valid format, size, or type.
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-x-2">
                          {!uploading && isCompleted && (
                            <HiCheckCircle className="shrink-0 size-4 text-blue-600" />
                          )}
                          {uploading && !isCompleted && (
                            <div
                              className="animate-spin inline-block size-4 border-[2px] border-current border-t-transparent text-blue-600 rounded-full"
                              role="status"
                              aria-label="uploading"
                            >
                              <span className="sr-only">uploading...</span>
                            </div>
                          )}
                          {!uploading && !isCompleted && (
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-gray-500 hover:text-gray-800 focus:outline-none focus:text-gray-800"
                            >
                              <HiOutlineTrash
                                className="shrink-0 size-4 text-red-500 hover:text-red-600"
                                strokeWidth={2}
                              />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* <div className="flex items-center gap-x-3 whitespace-nowrap">
                    <div
                      className="flex w-full h-2 bg-gray-200 rounded-full overflow-hidden"
                      role="progressbar"
                      aria-valuenow={parseInt(uploadProgress)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      {uploading && (
                        <div
                          className="flex flex-col justify-center rounded-full overflow-hidden bg-blue-600 text-xs text-white text-center whitespace-nowrap transition-all duration-500"
                          style={{ width: `${parseInt(uploadProgress)}%` }}
                        />
                      )}
                    </div>
                    <div className="w-10 text-end">
                      <span className="text-sm text-gray-800">
                        <span>0</span>%
                      </span>
                    </div>
                  </div> */}
                    </div>
                  ))}
                </div>
              )}

              {files.length > 0 && (
                <div className="flex gap-x-4 justify-end items-center">
                  <Button onClick={uploadFiles} disabled={uploading}>
                    <HiArrowUpTray strokeWidth={2} />
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                  {!uploading && !isCompleted && (
                    <p
                      onClick={removeAllFiles}
                      className="flex items-center gap-x-2 text-sm text-red-600 hover:text-red-700 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <HiOutlineTrash />
                      Remove All
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <SubHeading align="left" cls="pl-0 xs:pl-0 xl:pl-1">
              Your images are successfully uploaded. Tap on Create Studio
              button.
            </SubHeading>
          )}
          <div className="mt-2">
            {!isCompleted && errors && errors["images"]?.message && (
              <p className="mt-2 text-sm text-red-400">
                {errors["images"]?.message}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
