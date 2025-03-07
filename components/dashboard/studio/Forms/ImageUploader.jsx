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
  RefreshCw,
} from "lucide-react";
import SmartCrop from "smartcrop";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import Masonry from "react-masonry-css";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

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
const MIN_NUM_IMAGES = 10;
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [completedCrops, setCompletedCrops] = useState({});
  const fileInputRef = useRef(null);

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

  // Modify uploadFiles function with client-side upload
  const uploadFiles = useCallback(async () => {
    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const validFiles = includeInvalidImages
        ? files
        : files.filter((file) => file.accepted);

      if (validFiles.length === 0) {
        throw new Error("No valid files to upload");
      }

      // Process images with captions and upload directly to Supabase
      const { signedUrl, stats } = await processImagesWithCaptions(
        validFiles,
        completedCrops,
        CROP_DIMENSION,
        // Progress callback
        (progress) => {
          const { stage, percent } = progress;
          let totalProgress = 0;

          // Calculate overall progress based on stage
          if (stage === "processing") {
            totalProgress = percent * 0.4; // Processing is 40% of total
          } else if (stage === "zipping") {
            totalProgress = 40 + percent * 0.2; // Zipping is 20% of total
          } else if (stage === "uploading") {
            totalProgress = 60 + percent * 0.4; // Uploading is 40% of total
          }

          setUploadProgress(Math.round(totalProgress));
        }
      );

      // Set the form value with the signed URL
      setValue("images", signedUrl);
      setUploadProgress(100);
      setIsCompleted(true);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error.message || "Upload failed. Please try again.");

      // Auto-retry logic for certain errors
      if (
        retryCount < 2 &&
        (error.message.includes("network") ||
          error.message.includes("timeout") ||
          error.message.includes("connection"))
      ) {
        setRetryCount((prev) => prev + 1);
        setTimeout(() => {
          uploadFiles();
        }, 3000);
      }
    } finally {
      if (!isCompleted && !uploadError) {
        setUploading(false);
      }
    }
  }, [
    files,
    setValue,
    includeInvalidImages,
    completedCrops,
    retryCount,
    isCompleted,
    uploadError,
  ]);

  // Reset retry count when files change
  useEffect(() => {
    setRetryCount(0);
  }, [files]);

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

      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        reject(new Error("Image loading timed out"));
      }, 30000);

      img.onload = () => {
        clearTimeout(timeout);
        if (img.width === 0 || img.height === 0) {
          reject(new Error("Image failed to load properly"));
          return;
        }
        resolve(img);
      };
    });
  };

  // Modify applySmartCrop for more accurate cropping with fallback
  const applySmartCrop = async (file) => {
    return new Promise(async (resolve, reject) => {
      try {
        const objectUrl = URL.createObjectURL(file);
        const img = await createImagePromise(objectUrl);

        // Implement a timeout for SmartCrop to prevent hanging
        const cropPromise = SmartCrop.crop(img, {
          width: CROP_DIMENSION,
          height: CROP_DIMENSION,
          minScale: 1.0,
          ruleOfThirds: true,
          boost: [{ x: 0, y: 0, width: 1, height: 1, weight: 1.0 }],
          samples: 8,
        });

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Smart crop timed out")), 5000);
        });

        const result = await Promise.race([cropPromise, timeoutPromise]);

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

        URL.revokeObjectURL(objectUrl);
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

  // Define the processImage function with better error handling
  const processImage = async (file) => {
    return new Promise(async (resolve) => {
      try {
        const objectUrl = URL.createObjectURL(file);
        const img = await createImagePromise(objectUrl);

        let accepted = true;
        let declineReason = "";

        if (
          img.width < MIN_IMAGE_DIMENSION ||
          img.height < MIN_IMAGE_DIMENSION
        ) {
          accepted = false;
          declineReason = `This image is low-resolution. Should be a minimum size of ${MIN_IMAGE_DIMENSION}×${MIN_IMAGE_DIMENSION} pixels.`;
        }

        const smartCropResult = await applySmartCrop(file);

        resolve({
          file,
          preview: objectUrl,
          accepted,
          declineReason,
          initialCrop: smartCropResult,
          dimensions: {
            width: img.width,
            height: img.height,
          },
        });
      } catch (error) {
        console.error("Process image error:", error);
        // Even if processing fails, we should return something to prevent the UI from breaking
        const objectUrl = URL.createObjectURL(file);
        resolve({
          file,
          preview: objectUrl,
          accepted: false,
          declineReason: "Failed to process image: " + error.message,
          initialCrop: {
            unit: "%",
            x: 25,
            y: 25,
            width: 50,
            height: 50,
          },
          error: true,
        });
      }
    });
  };

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    // Clear any previous errors
    setUploadError(null);

    if (acceptedFiles.length === 0 && rejectedFiles.length > 0) {
      let errorMessage = "Some files couldn't be accepted:";

      rejectedFiles.forEach((file) => {
        if (file.file.size > MAX_FILE_SIZE) {
          errorMessage += `\n- ${file.file.name} is too large (max: 20MB)`;
        } else if (!ALLOWED_IMAGE_TYPES.includes(file.file.type)) {
          errorMessage += `\n- ${file.file.name} is not a JPG or PNG`;
        } else {
          errorMessage += `\n- ${file.file.name} couldn't be processed`;
        }
      });

      setWarningMessage(errorMessage);
      return;
    }

    setUploading(true);
    setProcessing(true);

    try {
      // Process files in batches to prevent browser from freezing
      const BATCH_SIZE = 5;
      let processedFiles = [];

      for (let i = 0; i < acceptedFiles.length; i += BATCH_SIZE) {
        const batch = acceptedFiles.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(batch.map(processImage));
        processedFiles = [...processedFiles, ...batchResults];

        // Update files after each batch to show progress
        setFiles((prevFiles) => {
          const newFiles = [...prevFiles, ...batchResults];
          return newFiles.slice(0, MAX_NUM_IMAGES);
        });
      }
    } catch (error) {
      console.error("File processing error:", error);
      setWarningMessage("Error processing images: " + error.message);
    } finally {
      setProcessing(false);
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: ACCEPTED_IMAGE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_NUM_IMAGES,
    noClick: true,
    noKeyboard: true,
    disabled: processing || uploading,
  });

  const handleFileChange = useCallback(
    (e) => {
      if (e.target.files && e.target.files.length > 0) {
        onDrop(Array.from(e.target.files), []);
      }
    },
    [onDrop]
  );

  const removeFile = useCallback((index) => {
    setFiles((prevFiles) => {
      // Make sure to revoke the object URL to prevent memory leaks
      URL.revokeObjectURL(prevFiles[index].preview);

      // Remove the crop data for this file
      setCompletedCrops((prev) => {
        const newCrops = { ...prev };
        delete newCrops[index];

        // Reindex the remaining crops
        const reindexedCrops = {};
        let newIndex = 0;

        prevFiles.forEach((_, i) => {
          if (i !== index && newCrops[i]) {
            reindexedCrops[newIndex] = newCrops[i];
            newIndex++;
          }
        });

        return reindexedCrops;
      });

      return prevFiles.filter((_, i) => i !== index);
    });
  }, []);

  const removeAllFiles = useCallback(() => {
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    setCompletedCrops({});
  }, [files]);

  // Modify the handleCropComplete function to normalize crop data
  const handleCropComplete = (crop, percentCrop, index) => {
    if (!percentCrop) return;

    // Get the image dimensions
    const file = files[index];
    const dimensions = file.dimensions || { width: 1024, height: 1024 };

    // Normalize the crop data to ensure it's valid
    const normalizedCrop = normalizeCropData(
      percentCrop,
      dimensions.width,
      dimensions.height
    );

    setCompletedCrops((prev) => ({
      ...prev,
      [index]: normalizedCrop,
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
          >
            <Image
              src={file.preview}
              alt={`Preview ${index + 1}`}
              width={400}
              height={400}
              className="w-full h-full object-cover"
              onClick={() => setSelectedImageIndex(index)}
              unoptimized={true}
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
            {!uploading && !isCompleted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile(index)}
                aria-label="Remove image"
              >
                <Trash className="h-4 w-4 text-destructive" />
              </Button>
            )}
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

  // Retry upload function
  const handleRetryUpload = () => {
    setRetryCount(0);
    setUploadError(null);
    uploadFiles();
  };

  // Removed loadingModels check since we no longer use face-api
  return (
    <TooltipProvider>
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
                className={`cursor-pointer p-12 flex justify-center bg-background border-2 border-dashed ${
                  uploading || processing
                    ? "border-muted cursor-not-allowed"
                    : "border-primary"
                } rounded-lg`}
                onClick={uploading || processing ? undefined : open}
              >
                <input
                  {...getInputProps()}
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  disabled={uploading || processing}
                />
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

              {uploadError && (
                <Alert variant="destructive">
                  <AlertTitle className="flex items-center justify-between">
                    Upload Error
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetryUpload}
                      className="ml-2"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry Upload
                    </Button>
                  </AlertTitle>
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}

              {uploading && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              <div className="flex flex-col gap-1 items-start">
                {files.length > 0 && files.length < 10 && !allowLessThanTen && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => setAllowLessThanTen(true)}
                        variant="outline"
                      >
                        Upload Fewer Than 10 Images
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>We recommend at least 10 images for best results</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {files.some((file) => !file.accepted) &&
                  !includeInvalidImages && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => setIncludeInvalidImages(true)}
                          variant="outline"
                        >
                          Include Low Resolution Images
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Low resolution images may result in lower quality
                          output
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )}
              </div>
              {files.length > 0 && (
                <div className="flex justify-between items-center">
                  <Button
                    onClick={uploadFiles}
                    disabled={
                      uploading ||
                      processing ||
                      (!includeInvalidImages &&
                        !allowLessThanTen &&
                        files.filter((file) => file.accepted).length < 10)
                    }
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading
                      ? `Uploading... ${uploadProgress}%`
                      : "Upload Images"}
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
    </TooltipProvider>
  );
}

export default ImageUploader;
