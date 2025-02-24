"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import {
  Upload,
  CheckCircle,
  ImageIcon,
  Trash,
  CircleAlert,
  Move,
} from "lucide-react";
import SmartCrop from "smartcrop";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import Masonry from "react-masonry-css";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import createSupabaseBrowserClient from "@/lib/supabase/BrowserClient";
import ImageUploadingGuideLines from "../ImageUploadingGuideLines";
import Loader from "@/components/Loader";
import Heading from "@/components/shared/heading";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { processImagesWithCaptions } from "@/lib/services/imageCaptioningService";

const supabase = createSupabaseBrowserClient();

// Image validation rules
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_NUM_IMAGES = 20;
const MIN_NUM_IMAGES = 10; // This variable is not used anymore.
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const ACCEPTED_IMAGE_TYPES = {
  "image/jpeg": [],
  "image/jpg": [],
  "image/png": [],
};
const MIN_IMAGE_DIMENSION = 1024;

// Add these constants
const CROP_DIMENSION = 1024;
const CROP_ASPECT = 1;

// Add this helper function to normalize crop coordinates
const normalizeCropData = (crop, imageWidth, imageHeight) => {
  if (!crop) return null;

  // Ensure crop values are within 0-100 range
  const x = Math.max(0, Math.min(100, crop.x));
  const y = Math.max(0, Math.min(100, crop.y));

  // Ensure width and height don't exceed image bounds
  const width = Math.min(100 - x, crop.width);
  const height = Math.min(100 - y, crop.height);

  return {
    unit: "%",
    x,
    y,
    width,
    height,
  };
};

function ImageUploader({ setValue, errors, isSubmitting, studioMessage }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [processing, setProcessing] = useState(false);
  const [includeInvalidImages, setIncludeInvalidImages] = useState(false);
  const [allowLessThanTen, setAllowLessThanTen] = useState(false);

  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const [completedCrops, setCompletedCrops] = useState({});

  // Add breakpoint columns for masonry
  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 1,
  };

  useEffect(() => {
    const validFiles = files.filter((file) => !file.error && file.accepted);
    if (validFiles.length > 0 && validFiles.length < MIN_NUM_IMAGES) {
      setWarningMessage(
        `You are uploading only ${validFiles.length} high-resolution image${
          validFiles.length !== 1 ? "s" : ""
        }. We recommend at-least 10 for best output.`
      );
    } else {
      setWarningMessage("");
    }
  }, [files]);

  // Add this effect to reset the component state when stepping back
  useEffect(() => {
    return () => {
      // Cleanup function that runs when component unmounts
      setFiles([]);
      setIsCompleted(false);
      setUploading(false);
      setProcessing(false);
      setWarningMessage("");
      setValue("images", ""); // Reset the form value
    };
  }, [setValue]);

  // Modify uploadFiles function
  const uploadFiles = useCallback(async () => {
    setUploading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    try {
      const validFiles = includeInvalidImages
        ? files
        : files.filter((file) => file.accepted);

      // Process images with captions
      const { zipBlob, processedFiles } = await processImagesWithCaptions(
        validFiles,
        completedCrops,
        CROP_DIMENSION
      );

      const filePath = `${session.user.id}/${uuidv4()}/${Date.now()}.zip`;

      const { data, error } = await supabase.storage
        .from("training-images")
        .upload(filePath, zipBlob, {
          contentType: "application/zip",
        });

      if (error) {
        throw error;
      }

      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
          .from("training-images")
          .createSignedUrl(filePath, 604800);

      if (signedUrlError) {
        throw signedUrlError;
      }

      setValue("images", signedUrlData.signedUrl);
      setIsCompleted(true);
    } catch (error) {
      console.error("Upload error:", error);
      setWarningMessage(`Upload failed: ${error.message}`);
      setIsCompleted(false);
    } finally {
      setUploading(false);
    }
  }, [files, setValue, includeInvalidImages, completedCrops]);

  // Modify createImagePromise for better image loading
  const createImagePromise = (src) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();

      img.onload = () => {
        // Verify image has loaded properly
        if (img.width === 0 || img.height === 0) {
          reject(new Error("Image failed to load properly"));
          return;
        }
        resolve(img);
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      // Set crossOrigin to anonymous if loading from a different origin
      img.crossOrigin = "anonymous";
      img.src = src;
    });
  };

  // Modify applySmartCrop for more accurate cropping
  const applySmartCrop = async (file) => {
    return new Promise(async (resolve, reject) => {
      try {
        const img = await createImagePromise(URL.createObjectURL(file));

        const result = await SmartCrop.crop(img, {
          width: CROP_DIMENSION,
          height: CROP_DIMENSION,
          minScale: 1.0,
          ruleOfThirds: true,
          boost: [{ x: 0, y: 0, width: 1, height: 1, weight: 1.0 }],
          samples: 8,
        });

        if (!result || !result.topCrop) {
          throw new Error("Smart crop failed to generate valid crop data");
        }

        // Calculate precise crop values
        const crop = {
          x: (result.topCrop.x / img.width) * 100,
          y: (result.topCrop.y / img.height) * 100,
          width: (result.topCrop.width / img.width) * 100,
          height: (result.topCrop.height / img.height) * 100,
          unit: "%",
        };

        resolve(crop);
      } catch (error) {
        console.error("Smart crop error:", error);
        // Fallback to center crop
        resolve({
          unit: "%",
          x: 25,
          y: 25,
          width: 50,
          height: 50,
        });
      }
    });
  };

  // Define the processImage function
  const processImage = async (file) => {
    return new Promise(async (resolve) => {
      const img = await createImagePromise(URL.createObjectURL(file));
      const preview = URL.createObjectURL(file);

      let accepted = true;
      let declineReason = "";

      if (img.width < MIN_IMAGE_DIMENSION || img.height < MIN_IMAGE_DIMENSION) {
        accepted = false;
        declineReason = `This image is low-resolution. Should be a minimum size of ${MIN_IMAGE_DIMENSION}×${MIN_IMAGE_DIMENSION} pixels.`;
      }

      const smartCropResult = await applySmartCrop(file);

      resolve({
        file,
        preview,
        accepted,
        declineReason,
        initialCrop: smartCropResult,
      });
    });
  };

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    rejectedFiles.forEach((file) => {
      if (file.file.size > MAX_FILE_SIZE) {
        alert(`File ${file.file.name} is too large. Max size is 20MB.`);
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

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: ACCEPTED_IMAGE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_NUM_IMAGES,
    noClick: true,
    noKeyboard: true,
  });

  const handleFileChange = useCallback(
    (e) => {
      onDrop(Array.from(e.target.files), []);
    },
    [onDrop]
  );

  // const removeFile = useCallback((index) => {
  //   setFiles((prevFiles) => {
  //     URL.revokeObjectURL(prevFiles[index].preview);
  //     return prevFiles.filter((_, i) => i !== index);
  //   });
  // }, []);

  const removeAllFiles = useCallback(() => {
    files.forEach((file) => URL.revokeObjectURL(file.preview));
    setFiles([]);
  }, [files]);

  // Modify the handleCropComplete function
  const handleCropComplete = (crop, percentCrop, index) => {
    setCompletedCrops((prev) => ({
      ...prev,
      [index]: {
        unit: "%",
        x: percentCrop.x,
        y: percentCrop.y,
        width: percentCrop.width,
        height: percentCrop.height,
      },
    }));
  };

  // Modify the file card rendering to include cropping UI
  const renderFileCard = (file, index) => (
    <Card
      key={index}
      className={`mb-4 ${
        file.accepted ? "border-success" : "border-destructive"
      }`}
    >
      <CardContent className="p-4">
        <div className="relative">
          <div className="absolute top-2 left-2 z-10">
            <span className="px-3 py-1 flex gap-1 items-center text-xs font-normal text-muted rounded bg-foreground">
              <Move className="text-destructive" strokeWidth={1.5} />
              Move
              <span className="italic">
                selection area to center your face.
              </span>
            </span>
          </div>
          <ReactCrop
            crop={completedCrops[index] || file.initialCrop}
            onChange={(c, pc) => handleCropComplete(c, pc, index)}
            onComplete={(c, pc) => handleCropComplete(c, pc, index)}
            aspect={CROP_ASPECT}
            className="max-w-full h-auto"
            minWidth={100} // Minimum width in pixels
            minHeight={100} // Minimum height in pixels
            keepSelection={true}
            ruleOfThirds={true}
            locked={true}
          >
            <Image
              src={file.preview}
              alt={`Preview ${index + 1}`}
              width={400}
              height={400}
              className="w-full h-full object-cover"
              onClick={() => setSelectedImageIndex(index)}
            />
          </ReactCrop>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div>
            <p className="text-sm font-medium">
              {file.file.name.slice(0, 10) +
                "...XXX." +
                file.file.type.split("/")[1]}
            </p>
            <p className="text-xs text-muted-foreground">
              {(file.file.size / 1048576).toFixed(2)} MB
            </p>
            {!file.accepted && (
              <p className="text-xs text-destructive">{file.declineReason}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {file.accepted ? (
              <CheckCircle className="h-4 w-4 text-success" />
            ) : (
              <CircleAlert className="h-4 w-4 text-destructive" />
            )}
            {/* {!uploading && !isCompleted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile(index)}
              >
                <Trash className="h-4 w-4 text-destructive" />
              </Button>
            )} */}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Add cleanup in useEffect
  useEffect(() => {
    return () => {
      // Cleanup URLs when component unmounts
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  // Removed loadingModels check since we no longer use face-api
  return (
    <>
      {isSubmitting || studioMessage ? (
        studioMessage ? (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{studioMessage}</AlertDescription>
          </Alert>
        ) : (
          <Loader />
        )
      ) : (
        <div className="space-y-6">
          <Badge variant="destructive" className="uppercase">
            This field is required
          </Badge>
          <Heading variant={"hero"}> Please upload your images.</Heading>

          <p className="text-muted-foreground">
            By following these guidelines, you're setting yourself up for the
            best possible outcome. Each photo you upload directly impacts the
            final outcome, so take a moment to select your best shots that meet
            our guidelines.{" "}
            <span className="text-destructive">
              Click on "Show Image Guidelines" button to read about image
              uploading guidelines.
            </span>
          </p>
          {/* <ImageUploadingGuideLines /> */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mr-2" variant={"destructive"}>
                Show Image Guidelines
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl overflow-x-auto max-h-screen mt-2 border-none">
              <DialogHeader>
                <DialogTitle>Guidelines</DialogTitle>
              </DialogHeader>
              <ImageUploadingGuideLines />
              <DialogFooter></DialogFooter>
            </DialogContent>
          </Dialog>
          {!isCompleted ? (
            <div className="space-y-4">
              {processing && (
                <div className="flex items-center justify-center p-4">
                  <Loader />
                  <p className="ml-2">Processing images...</p>
                </div>
              )}
              <div
                {...getRootProps()}
                className="cursor-pointer p-12 flex justify-center bg-background border-2 border-dashed border-primary rounded-lg"
                onClick={open}
              >
                <input {...getInputProps()} onChange={handleFileChange} />
                <div className="text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold text-foreground">
                    <span>Drop your images here or</span>{" "}
                    <span className="text-primary">browse</span>
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    You can upload up to {MAX_NUM_IMAGES} images, each up to{" "}
                    {(MAX_FILE_SIZE / 1048576).toFixed(0)} MB,
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    and combined size of all images lesser than{" "}
                    {((MAX_FILE_SIZE / 1048576) * 10).toFixed(0)} MB
                  </p>
                </div>
              </div>

              {files.length > 0 && (
                <Masonry
                  breakpointCols={breakpointColumnsObj}
                  className="flex -ml-4 w-auto"
                  columnClassName="pl-4 bg-clip-padding"
                >
                  {files.map((file, index) => renderFileCard(file, index))}
                </Masonry>
              )}

              {(includeInvalidImages || allowLessThanTen) && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {includeInvalidImages
                      ? "We recommend uploading all images of at least 1024×1024 resolution for the best results."
                      : allowLessThanTen
                      ? "You are uploading fewer than 10 images. "
                      : ""}
                  </AlertDescription>
                </Alert>
              )}

              {warningMessage && (
                <Alert variant="destructive">
                  <AlertDescription>{warningMessage}</AlertDescription>
                </Alert>
              )}
              <div className="flex flex-col gap-1 items-start">
                {files.length > 0 && files.length < 10 && !allowLessThanTen && (
                  <Button
                    onClick={() => setAllowLessThanTen(true)}
                    variant="outline"
                  >
                    Upload Fewer Than 10 Images
                  </Button>
                )}
                {files.some((file) => !file.accepted) &&
                  !includeInvalidImages && (
                    <Button
                      onClick={() => setIncludeInvalidImages(true)}
                      variant="outline"
                    >
                      Include Low Resolution Images
                    </Button>
                  )}
              </div>
              {files.length > 0 && (
                <div className="flex justify-between items-center">
                  <Button
                    onClick={uploadFiles}
                    disabled={
                      uploading ||
                      (!includeInvalidImages &&
                        !allowLessThanTen &&
                        files.filter((file) => file.accepted).length < 10)
                    }
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? "Uploading..." : "Upload Images"}
                  </Button>
                  {!uploading && !isCompleted && (
                    <Button variant="ghost" onClick={removeAllFiles}>
                      <Trash className="mr-2 h-4 w-4" />
                      Remove All
                    </Button>
                  )}
                </div>
              )}
              {uploading && <Loader />}
            </div>
          ) : (
            <Alert>
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Your images are successfully uploaded. Tap on Create Studio
                button.
              </AlertDescription>
            </Alert>
          )}
          {!isCompleted && errors && errors["images"]?.message && (
            <p className="text-sm text-destructive">
              {errors["images"]?.message}
            </p>
          )}
        </div>
      )}
    </>
  );
}

export default ImageUploader;
