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

const supabase = createSupabaseBrowserClient();

// Image validation rules
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_NUM_IMAGES = 50;
const MIN_FILE_SIZE = 3;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

export default function ImageUploader({ setValue, setCurrentStep }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

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
    accept: "image/jpeg, image/png",
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_NUM_IMAGES,
    minFiles: MIN_FILE_SIZE,
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
      const randomString = uuidv4();
      const filePath = `${user?.id}/${randomString}/${Date.now()}_name.zip`;

      // Upload the zip blob to Supabase
      const { data, error } = await supabase.storage
        .from("temp-flux") // Replace with your bucket name
        .upload(filePath, zipBlob, {
          contentType: "application/zip", // Set the content type to zip
        });

      if (error) {
        console.error("Error uploading zip file:", error);
        // Handle error, e.g., show an error message
      } else {
        console.log("Zip file uploaded successfully:", data);
        // Handle success, e.g., show a success message
        // Get signed URL for the uploaded zip file
        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from("temp-flux")
            .createSignedUrl(filePath, 3600); // Adjust expiration as needed
        console.log(signedUrlData, signedUrlError);
      }
      setCurrentStep((prev) => prev + 1);
    } catch (error) {
      console.error("Error creating or uploading zip file:", error);
      // Handle error, e.g., show an error message
    } finally {
      setUploading(false);
    }
    // Update progress after each successful upload
    // setUploadProgress((uploadedCount / files.length) * 100);
    // await Promise.all(uploadPromises);

    setIsCompleted(true);
    setValue("images", "file has been uploaded");
    setUploading(false);

    // removeAllFiles(); // You might want to keep the previews after upload
  }, [files]);

  return (
    <>
      {!isCompleted && (
        <div className="w-full mx-auto space-y-4 transition-all">
          {/* ... (Information section remains the same) ... */}

          {!uploading && !isCompleted && (
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
                  Pick a file up to 2MB.
                </p>
              </div>
            </div>
          )}

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
                            We could not upload this file as it was not valid
                            format, size, or type.
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
      )}
      {isCompleted && !uploading && (
        <SubHeading>
          Your images are successfully uploaded, please tap on the next button
          to proceed.
        </SubHeading>
      )}
    </>
  );
}
