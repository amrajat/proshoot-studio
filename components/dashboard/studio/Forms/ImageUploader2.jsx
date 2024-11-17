"use client";

import { Button } from "@/components/ui/button";
import { useState, useCallback, useRef, useEffect } from "react";
import createSupabaseBrowserClient from "@/lib/supabase/BrowserClient";
import { v4 as uuidv4 } from "uuid";
import { useDropzone } from "react-dropzone";
import NextImage from "next/image";
import {
  HiArrowUpTray,
  HiCheckCircle,
  HiOutlinePhoto,
  HiOutlineTrash,
  HiExclamationCircle,
} from "react-icons/hi2";
import JSZip from "jszip";
import Heading from "@/components/shared/heading";
import ImageUploadingGuideLines from "../ImageUploadingGuideLines";
import Loader from "@/components/Loader";
import * as faceapi from "face-api.js";
import smartcrop from "smartcrop";

const supabase = createSupabaseBrowserClient();

// Image validation rules
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_NUM_IMAGES = 50;
const MIN_NUM_IMAGES = 10; //This variable is not used anymore.
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const ACCEPTED_IMAGE_TYPES = {
  "image/jpeg": [],
  "image/jpg": [],
  "image/png": [],
};
const MIN_IMAGE_DIMENSION = 1024;

export default function ImageUploader2({
  setValue,
  errors,
  isSubmitting,
  studioMessage,
}) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [warningMessage, setWarningMessage] = useState("");
  const [loadingModels, setLoadingModels] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [includeInvalidImages, setIncludeInvalidImages] = useState(false);
  const [allowLessThanTen, setAllowLessThanTen] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    Promise.all([
      faceapi.loadTinyFaceDetectorModel("/models"),
      faceapi.loadFaceLandmarkModel("/models"),
    ]).then(() => {
      setLoadingModels(false);
    });
  }, []);

  useEffect(() => {
    const validFiles = files.filter((file) => !file.error && file.accepted);
    if (validFiles.length > 0 && validFiles.length < 10) {
      setWarningMessage(
        `You have uploaded ${validFiles.length} valid image${
          validFiles.length !== 1 ? "s" : ""
        }. If you upload fewer than 10 images, you will not be eligible for refunds or redos. Please follow the guidelines and upload at least 10 images where your face is clearly visible.`
      );
    } else {
      setWarningMessage("");
    }
  }, [files]);

  const cropImage = async (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = async () => {
        const size = Math.max(
          MIN_IMAGE_DIMENSION,
          Math.min(img.width, img.height)
        );
        const result = await smartcrop.crop(img, {
          width: size,
          height: size,
          minScale: 0.9, // Adjust this value to include more of the surrounding area
          ruleOfThirds: false,
        });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(
          img,
          result.topCrop.x,
          result.topCrop.y,
          result.topCrop.width,
          result.topCrop.height,
          0,
          0,
          size,
          size
        );
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: file.type }));
        }, file.type);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const processImage = async (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = async () => {
        let accepted = true;
        let declineReason = "";

        if (
          img.width < MIN_IMAGE_DIMENSION ||
          img.height < MIN_IMAGE_DIMENSION
        ) {
          accepted = false;
          declineReason = `Image is too small. Minimum size is ${MIN_IMAGE_DIMENSION}x${MIN_IMAGE_DIMENSION} pixels.`;
        } else {
          const detections = await faceapi
            .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();

          if (detections.length > 1) {
            accepted = false;
            declineReason = "Multiple faces detected";
          } else if (detections.length === 0) {
            accepted = false;
            declineReason = "No face detected";
          } else if (
            detections[0].detection.box.width /
              detections[0].detection.imageWidth <
            0.1
          ) {
            accepted = false;
            declineReason = "Face is too small";
          } else {
            // Check if the face is frontal
            const landmarks = detections[0].landmarks;
            const leftEye = landmarks.getLeftEye();
            const rightEye = landmarks.getRightEye();
            const nose = landmarks.getNose();

            const eyeDistance = Math.abs(leftEye[0].x - rightEye[3].x);
            const noseDeviation = Math.abs(
              nose[3].x - (leftEye[0].x + rightEye[3].x) / 2
            );

            if (noseDeviation / eyeDistance > 0.2) {
              accepted = false;
              declineReason = "Face is not sufficiently frontal";
            }
          }
        }

        if (accepted) {
          const croppedFile = await cropImage(file);
          resolve({
            file: croppedFile,
            preview: URL.createObjectURL(croppedFile),
            accepted,
            declineReason,
          });
        } else {
          resolve({
            file,
            preview: URL.createObjectURL(file),
            accepted,
            declineReason,
          });
        }
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
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

    setUploading(true);
    setProcessing(true);
    const processedFiles = await Promise.all(acceptedFiles.map(processImage));
    setProcessing(false);
    setUploading(false);

    setFiles((prevFiles) => {
      const newFiles = [...prevFiles, ...processedFiles];
      return newFiles.slice(0, MAX_NUM_IMAGES);
    });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ACCEPTED_IMAGE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_NUM_IMAGES,
  });

  const handleFileChange = useCallback(
    (e) => {
      onDrop(Array.from(e.target.files), []);
    },
    [onDrop]
  );

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
      const validFiles = includeInvalidImages
        ? files
        : files.filter((file) => file.accepted);
      validFiles.forEach((file) => {
        zip.file(file.file.name, file.file);
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
        console.error("Upload error:", error);
      } else {
        // Handle success, e.g., show a success message
        // Get signed URL for the uploaded zip file
        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from("training-images")
            .createSignedUrl(filePath, 21600); // Expires after 6 hours. Seconds
        if (signedUrlError) {
          console.error("Signed URL error:", signedUrlError);
        } else {
          setValue("images", signedUrlData.signedUrl);
        }
      }
    } catch (error) {
      // Handle error, e.g., show an error message
      console.error("General error:", error);
    } finally {
      setUploading(false);
    }

    setIsCompleted(true);
    setUploading(false);
  }, [files, setValue, includeInvalidImages]);

  if (loadingModels) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
        <p className="ml-2">Loading face detection models...</p>
      </div>
    );
  }

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
          <Heading variant={"hero"}>Please upload your images.</Heading>

          <h2 className="pl-0 xs:pl-0 xl:pl-1">
            Please follow the image uploading guidelines for best results.{" "}
            <span
              onClick={() => setShowGuidelines(!showGuidelines)}
              className="underline cursor-pointer text-blue-600 hover:to-blue-700"
            >
              {showGuidelines ? "Hide" : "Show"} guidelines
            </span>
          </h2>
          {showGuidelines && <ImageUploadingGuideLines />}
          {!isCompleted ? (
            <div className="w-full mx-auto space-y-4 mt-6 transition-all">
              {(includeInvalidImages || allowLessThanTen) && (
                <div
                  className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4"
                  role="alert"
                >
                  <p className="font-bold">Warning</p>
                  <p>
                    {includeInvalidImages
                      ? "You are including invalid images in your upload. "
                      : allowLessThanTen
                      ? "You are uploading fewer than 10 images. "
                      : ""}
                    This may make you ineligible for refunds or redos. Proceed
                    with caution.
                  </p>
                </div>
              )}
              {processing && (
                <div className="flex items-center justify-center p-4">
                  <Loader />
                  <p className="ml-2">Processing images...</p>
                </div>
              )}
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
                    . Minimum resolution: {MIN_IMAGE_DIMENSION}x
                    {MIN_IMAGE_DIMENSION} pixels.
                  </p>
                </div>
              </div>

              {files.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className={`p-3 bg-white border border-solid ${
                        file.accepted ? "border-green-300" : "border-red-300"
                      } rounded`}
                    >
                      <div className="mb-1 flex justify-between items-center">
                        <div className="flex items-center gap-x-3">
                          <span className="size-10 flex justify-center items-center border border-gray-200 text-gray-500 rounded-lg overflow-hidden">
                            <NextImage
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
                              {file.file.name.slice(0, 10) +
                                "...XXX." +
                                file.file.type.split("/")[1]}
                              <span />
                            </p>
                            <span className="text-xs text-gray-500">
                              {(file.file.size / 1048576).toFixed(2)} MB
                            </span>
                            {!file.accepted && (
                              <p className="text-xs text-red-500">
                                {file.declineReason}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-x-2">
                          {file.accepted ? (
                            <HiCheckCircle className="shrink-0 size-4 text-green-600" />
                          ) : (
                            <HiExclamationCircle className="shrink-0 size-4 text-red-500" />
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
                    </div>
                  ))}
                </div>
              )}

              {warningMessage && (
                <div
                  className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4"
                  role="alert"
                >
                  <p className="font-bold">Warning</p>
                  <p>{warningMessage}</p>
                </div>
              )}

              {files.length > 0 && files.length < 10 && !allowLessThanTen && (
                <Button
                  onClick={() => setAllowLessThanTen(true)}
                  variant="outline"
                  className="mr-2"
                >
                  Upload Fewer Than 10 Images
                </Button>
              )}
              {files.some((file) => !file.accepted) &&
                !includeInvalidImages && (
                  <Button
                    onClick={() => setIncludeInvalidImages(true)}
                    variant="outline"
                    className="mr-2"
                  >
                    Include Invalid Images
                  </Button>
                )}
              {files.length > 0 && (
                <div className="flex gap-x-4 justify-end items-center">
                  <Button
                    onClick={uploadFiles}
                    disabled={
                      uploading ||
                      (!includeInvalidImages &&
                        !allowLessThanTen &&
                        files.filter((file) => file.accepted).length < 10)
                    }
                  >
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
            <h1 className="pl-0 xs:pl-0 xl:pl-1">
              Your images are successfully uploaded. Tap on Create Studio
              button.
            </h1>
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
