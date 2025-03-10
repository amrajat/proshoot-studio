"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import {
  Upload,
  CircleCheck,
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

import { Progress } from "@/components/ui/progress";

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
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { processImagesWithCaptions } from "@/lib/services/imageCaptioningService";

// Image validation rules
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_NUM_IMAGES = 20;
const MIN_NUM_IMAGES = 3;
const MIN_NUM_IMAGES_RECOMMENDED = 10;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const ACCEPTED_IMAGE_TYPES = {
  "image/jpeg": [],
  "image/jpg": [],
  "image/png": [],
};
const MIN_IMAGE_DIMENSION = 265;

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [completedCrops, setCompletedCrops] = useState({});
  const fileInputRef = useRef(null);
  const [imageToRemove, setImageToRemove] = useState(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showRemoveAllDialog, setShowRemoveAllDialog] = useState(false);

  // Add breakpoint columns for masonry
  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 1,
  };

  useEffect(() => {
    const validFiles = files.filter((file) => !file.error && file.accepted);
    if (
      validFiles.length > 0 &&
      validFiles.length < MIN_NUM_IMAGES_RECOMMENDED
    ) {
      setWarningMessage(
        `You are uploading only ${validFiles.length} high-resolution image${
          validFiles.length !== 1 ? "s" : ""
        }. We recommend at-least ${MIN_NUM_IMAGES_RECOMMENDED} for best output.`
      );
    } else {
      setWarningMessage("");
    }
  }, [files]);

  // Add this effect to reset the component state when stepping back
  useEffect(() => {
    return () => {
      // Cleanup function that runs when component unmounts
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });

      // Only set the form value to empty, don't update component state
      // as this can cause infinite loops during unmounting
      setValue("images", ""); // Reset the form value
    };
  }, [setValue, files]);

  // Modify uploadFiles function to remove includeInvalidImages references
  const uploadFiles = useCallback(async () => {
    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Use all files instead of filtering by includeInvalidImages
      const validFiles = files.filter((file) => file.accepted);

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
  }, [files, setValue, completedCrops, retryCount, isCompleted, uploadError]);

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
          declineReason = `This image is smaller than ${MIN_IMAGE_DIMENSION}×${MIN_IMAGE_DIMENSION} pixels.`;
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

  const onDrop = useCallback(
    async (acceptedFiles, rejectedFiles) => {
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
        let newFiles = [...files]; // Start with current files

        for (let i = 0; i < acceptedFiles.length; i += BATCH_SIZE) {
          const batch = acceptedFiles.slice(i, i + BATCH_SIZE);
          const batchResults = await Promise.all(batch.map(processImage));
          processedFiles = [...processedFiles, ...batchResults];

          // Calculate how many new files we can add
          const availableSlots = MAX_NUM_IMAGES - newFiles.length;

          if (availableSlots <= 0) {
            // We're already at max, don't add any new files
            setWarningMessage(
              `Maximum of ${MAX_NUM_IMAGES} images reached. Some files were not added.`
            );
            break;
          }

          // Only add as many new files as we have slots for
          const filesToAdd = batchResults.slice(0, availableSlots);

          if (filesToAdd.length < batchResults.length) {
            setWarningMessage(
              `Maximum of ${MAX_NUM_IMAGES} images reached. Some files were not added.`
            );
          }

          newFiles = [...newFiles, ...filesToAdd];

          // If we've reached the maximum, stop processing
          if (newFiles.length >= MAX_NUM_IMAGES) {
            break;
          }
        }

        // Update files state once at the end instead of in each iteration
        setFiles(newFiles);
      } catch (error) {
        console.error("File processing error:", error);
        setWarningMessage("Error processing images: " + error.message);
      } finally {
        setProcessing(false);
        setUploading(false);
      }
    },
    [files]
  );

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

  // Function to handle remove all with confirmation
  const handleRemoveAll = useCallback(() => {
    setShowRemoveAllDialog(true);
  }, []);

  // Add a removeFile function to remove individual images
  const removeFile = useCallback(
    (index) => {
      // Make a copy of the current files
      const prevFiles = [...files];

      // Make sure to revoke the object URL to prevent memory leaks
      if (prevFiles[index] && prevFiles[index].preview) {
        URL.revokeObjectURL(prevFiles[index].preview);
      }

      // Create a new array without the removed file
      const newFiles = prevFiles.filter((_, i) => i !== index);

      // Create new previews for files whose indices changed
      const updatedFiles = newFiles.map((file, newIndex) => {
        // If this file's index changed, we need to recreate its preview
        if (newIndex >= index) {
          // Create a new preview URL for this file
          const newPreview = URL.createObjectURL(file.file);

          // Revoke the old preview URL to prevent memory leaks
          if (file.preview) {
            URL.revokeObjectURL(file.preview);
          }

          // Return a new file object with the updated preview
          return {
            ...file,
            preview: newPreview,
          };
        }

        // If this file's index didn't change, return it as is
        return file;
      });

      // Update the files state
      setFiles(updatedFiles);

      // Update the crop data
      const newCrops = { ...completedCrops };
      delete newCrops[index];

      // Reindex the crops based on the new file indices
      const reindexedCrops = {};

      updatedFiles.forEach((file, newIndex) => {
        const oldIndex = newIndex >= index ? newIndex + 1 : newIndex;
        if (completedCrops[oldIndex]) {
          reindexedCrops[newIndex] = completedCrops[oldIndex];
        }
      });

      // Update the completedCrops state
      setCompletedCrops(reindexedCrops);
    },
    [files, completedCrops]
  );

  // Function to confirm remove all
  const confirmRemoveAll = useCallback(() => {
    // Clean up all object URLs first
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });

    // Clear all files and crops in a single batch update
    setFiles([]);
    setCompletedCrops({});

    // Close the dialog
    setShowRemoveAllDialog(false);
  }, [files]);

  // Function to handle image removal with confirmation
  const handleRemoveImage = useCallback((index) => {
    // Only set the index to remove, don't perform any state updates yet
    setImageToRemove(index);
    setShowRemoveDialog(true);
  }, []);

  // Function to confirm image removal
  const confirmRemoveImage = useCallback(() => {
    if (imageToRemove !== null) {
      // Only remove the file if we have a valid index
      removeFile(imageToRemove);
      // Reset the imageToRemove state
      setImageToRemove(null);
    }
    // Close the dialog
    setShowRemoveDialog(false);
  }, [imageToRemove, removeFile]);

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

  // Update the renderFileCard function to include the remove button
  const renderFileCard = (file, index) => (
    <Card
      key={index}
      className={`mb-4 rounded-md ${
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
            minWidth={128} // Minimum width in pixels
            minHeight={128} // Minimum height in pixels
            keepSelection={true}
            ruleOfThirds={true}
          >
            <Image
              src={file.preview}
              alt={`Preview ${index + 1}`}
              width={400}
              height={400}
              className="w-full h-auto object-cover"
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
              <CircleCheck className="h-4 w-4 text-success" />
            ) : (
              <CircleAlert className="h-4 w-4 text-destructive" />
            )}
            <Trash
              className="h-4 w-4 text-destructive cursor-pointer hover:text-destructive/80"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering other click handlers
                handleRemoveImage(index);
              }}
              aria-label="Remove image"
              disabled={uploading || isCompleted}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Retry upload function
  const handleRetryUpload = () => {
    setRetryCount(0);
    setUploadError(null);
    uploadFiles();
  };

  // Removed loadingModels check since we no longer use face-api
  return (
    <>
      {/* Confirmation dialog for removing an image */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Image</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-sm">
            <p>
              Are you sure you want to remove this image? You can always add
              more images before uploading.
            </p>
          </DialogDescription>
          <DialogFooter className="flex justify-between sm:justify-between">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmRemoveImage}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog for removing all images */}
      <Dialog open={showRemoveAllDialog} onOpenChange={setShowRemoveAllDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove All Images</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-sm">
            <p>
              Are you sure you want to remove all images? You can always add
              more images before uploading.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              You will need to upload new images to continue.
            </p>
          </DialogDescription>
          <DialogFooter className="flex justify-between sm:justify-between">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmRemoveAll}
            >
              Remove All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isSubmitting || studioMessage ? (
        studioMessage ? (
          <Alert variant="destructive">
            <AlertTitle>Message</AlertTitle>
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
            These guidelines aren’t strict rules—just tips to help you get the
            best results! The closer you follow them, the better, but no
            pressure.{" "}
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
            <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[80vw] xl:max-w-6xl h-[90vh] p-4 sm:p-6 overflow-hidden">
              <DialogHeader className="mb-2 sm:mb-4">
                <DialogTitle className="text-xl sm:text-2xl">
                  Image Upload Guidelines
                </DialogTitle>
              </DialogHeader>
              <div className="overflow-y-auto pr-2 -mr-2 h-full pb-12">
                <ImageUploadingGuideLines />
              </div>
              <DialogFooter className="mt-4 sm:mt-6">
                <DialogClose asChild>
                  <Button variant="destructive">Close</Button>
                </DialogClose>
              </DialogFooter>
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

              {files.length > 0 && (
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={uploadFiles}
                      disabled={
                        uploading ||
                        processing ||
                        files.filter((file) => file.accepted).length <
                          MIN_NUM_IMAGES
                      }
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploading
                        ? `Uploading... ${uploadProgress}%`
                        : "Upload Images"}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      You will need at least {MIN_NUM_IMAGES} hi-res images to
                      continue.
                    </span>
                  </div>
                  {!uploading && !isCompleted && (
                    <Button variant="destructive" onClick={handleRemoveAll}>
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
