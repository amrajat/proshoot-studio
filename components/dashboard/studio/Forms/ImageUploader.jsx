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
const MAX_TOTAL_SIZE = 400 * 1024 * 1024; // 200MB total
const MAX_NUM_IMAGES = 20;
const MIN_NUM_IMAGES = 5;
const MIN_NUM_IMAGES_RECOMMENDED = 8;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const ACCEPTED_IMAGE_TYPES = {
  "image/jpeg": [],
  "image/jpg": [],
  "image/png": [],
};
const MIN_IMAGE_DIMENSION = 512;

// Add these constants
const CROP_DIMENSION = 1024;
const CROP_ASPECT = 1;

// Add timeout configuration
const TIMEOUTS = {
  // Adjust these based on network conditions and device capabilities
  IMAGE_LOAD: 600000, // 60 seconds for image loading
  SMART_CROP: 600000, // 60 seconds for smart crop
  PROCESSING: 6000000, // 600 seconds for image processing
  UPLOAD_RETRY_DELAY: 3000, // 3 seconds before retrying upload
  UPLOAD_TOTAL: 15000000, // 2 minutes for total upload time
};

// Add network detection to adjust timeouts
const detectNetworkSpeed = () => {
  // Use navigator.connection if available (modern browsers)
  if (navigator.connection) {
    const connection = navigator.connection;

    // Adjust timeouts based on connection type/speed
    if (connection.effectiveType === "4g") {
      // Fast connection, use default timeouts
      return 1;
    } else if (connection.effectiveType === "3g") {
      // Medium connection, increase timeouts by 50%
      return 1.5;
    } else {
      // Slow connection, double timeouts
      return 2;
    }
  }

  // Default multiplier if connection info not available
  return 1;
};

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

function ImageUploader({
  setValue,
  errors,
  isSubmitting,
  studioMessage,
  watch,
}) {
  // Define reducer for related state management
  const initialState = {
    files: [],
    uploading: false,
    isCompleted: false,
    warningMessage: "",
    processing: false,
    uploadProgress: 0,
    uploadError: null,
    retryCount: 0,
    selectedImageIndex: null,
    completedCrops: {},
    imageToRemove: null,
    showRemoveDialog: false,
    showRemoveAllDialog: false,
    showGuidelinesDialog: true,
  };

  // Define reducer function to handle related state updates
  const reducer = (state, action) => {
    switch (action.type) {
      case "SET_FILES":
        return { ...state, files: action.payload };
      case "SET_UPLOADING":
        return { ...state, uploading: action.payload };
      case "SET_COMPLETED":
        return { ...state, isCompleted: action.payload };
      case "SET_WARNING":
        return { ...state, warningMessage: action.payload };
      case "SET_PROCESSING":
        return { ...state, processing: action.payload };
      case "SET_UPLOAD_PROGRESS":
        return { ...state, uploadProgress: action.payload };
      case "SET_UPLOAD_ERROR":
        return { ...state, uploadError: action.payload };
      case "SET_RETRY_COUNT":
        return { ...state, retryCount: action.payload };
      case "INCREMENT_RETRY_COUNT":
        return { ...state, retryCount: state.retryCount + 1 };
      case "SET_SELECTED_IMAGE":
        return { ...state, selectedImageIndex: action.payload };
      case "SET_COMPLETED_CROPS":
        return { ...state, completedCrops: action.payload };
      case "UPDATE_CROP":
        return {
          ...state,
          completedCrops: {
            ...state.completedCrops,
            [action.payload.index]: action.payload.crop,
          },
        };
      case "REMOVE_CROP":
        const newCrops = { ...state.completedCrops };
        delete newCrops[action.payload];
        return { ...state, completedCrops: newCrops };
      case "SET_IMAGE_TO_REMOVE":
        return { ...state, imageToRemove: action.payload };
      case "SET_SHOW_REMOVE_DIALOG":
        return { ...state, showRemoveDialog: action.payload };
      case "SET_SHOW_REMOVE_ALL_DIALOG":
        return { ...state, showRemoveAllDialog: action.payload };
      case "SET_SHOW_GUIDELINES_DIALOG":
        return { ...state, showGuidelinesDialog: action.payload };
      case "RESET_UPLOAD_STATE":
        return {
          ...state,
          uploading: false,
          uploadProgress: 0,
          uploadError: null,
          retryCount: 0,
        };
      case "RESET_ALL":
        return initialState;
      default:
        return state;
    }
  };

  // Use reducer instead of multiple useState calls
  const [state, dispatch] = React.useReducer(reducer, initialState);

  // Destructure state for easier access
  const {
    files,
    uploading,
    isCompleted,
    warningMessage,
    processing,
    uploadProgress,
    uploadError,
    retryCount,
    selectedImageIndex,
    completedCrops,
    imageToRemove,
    showRemoveDialog,
    showRemoveAllDialog,
    showGuidelinesDialog,
  } = state;

  const [networkFactor, setNetworkFactor] = useState(1);
  const fileInputRef = useRef(null);

  // Add breakpoint columns for masonry
  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 1,
  };

  // Add this line near the top of the component to watch the gender field
  const gender = watch("gender");

  // Detect network speed on component mount and when online status changes
  useEffect(() => {
    const updateNetworkFactor = () => {
      const factor = detectNetworkSpeed();
      setNetworkFactor(factor);
    };

    // Initial detection
    updateNetworkFactor();

    // Update when online status changes
    window.addEventListener("online", updateNetworkFactor);

    return () => {
      window.removeEventListener("online", updateNetworkFactor);
    };
  }, []);

  // Update the useEffect for warning message
  useEffect(() => {
    const validFiles = files.filter((file) => !file.error && file.accepted);
    if (
      validFiles.length > 0 &&
      validFiles.length < MIN_NUM_IMAGES_RECOMMENDED
    ) {
      dispatch({
        type: "SET_WARNING",
        payload: `You are uploading only ${validFiles.length} image${
          validFiles.length !== 1 ? "s" : ""
        }. We recommend at-least ${MIN_NUM_IMAGES_RECOMMENDED} for best output.`,
      });
    } else {
      dispatch({ type: "SET_WARNING", payload: "" });
    }
  }, [files]);

  // Add this effect to reset the component state when stepping back
  useEffect(() => {
    // Cleanup function that runs when component unmounts
    return () => {
      // Clean up all object URLs to prevent memory leaks
      cleanupObjectUrls();

      // Only set the form value to empty, don't update component state
      // as this can cause infinite loops during unmounting
      setValue("images", ""); // Reset the form value
    };
  }, [setValue]);

  // Update the cleanup function
  const cleanupObjectUrls = useCallback(() => {
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
  }, [files]);

  // Add a centralized error handler function
  const handleError = useCallback((error, context, fallback = null) => {
    // Log the error with context
    // console.error(`Error in ${context}:`, error);

    // Send to Sentry if available
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        tags: {
          component: "ImageUploader",
          context: context,
        },
      });
    }

    // Return fallback value if provided
    return fallback;
  }, []);

  // Update the createImagePromise function with dynamic timeouts
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

      // Add timeout to prevent hanging with dynamic adjustment
      const timeout = setTimeout(() => {
        reject(new Error("Image loading timed out"));
      }, TIMEOUTS.IMAGE_LOAD * networkFactor);

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

  // Update the applySmartCrop function with dynamic timeouts
  const applySmartCrop = async (file) => {
    return new Promise(async (resolve, reject) => {
      try {
        const objectUrl = URL.createObjectURL(file);
        const img = await createImagePromise(objectUrl).catch((error) => {
          throw new Error(
            `Failed to load image for smart crop: ${error.message}`
          );
        });

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
          setTimeout(
            () => reject(new Error("Smart crop timed out")),
            TIMEOUTS.SMART_CROP * networkFactor
          );
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
        // Use standardized error handling
        handleError(error, "applySmartCrop");

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

  // Update the processImage function with standardized error handling
  const processImage = async (file) => {
    return new Promise(async (resolve) => {
      try {
        const objectUrl = URL.createObjectURL(file);
        const img = await createImagePromise(objectUrl).catch((error) => {
          throw new Error(
            `Failed to load image for processing: ${error.message}`
          );
        });

        let accepted = true;
        let declineReason = "";

        if (
          img.width < MIN_IMAGE_DIMENSION ||
          img.height < MIN_IMAGE_DIMENSION
        ) {
          accepted = true;
          declineReason = `This image is smaller than ${MIN_IMAGE_DIMENSION}×${MIN_IMAGE_DIMENSION} pixels, but we will still use it, it may not be perfect.`;
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
        // Use standardized error handling
        handleError(error, "processImage");

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

  // Add a function to calculate total file size
  const calculateTotalSize = useCallback((fileList) => {
    return fileList.reduce((total, file) => total + file.file.size, 0);
  }, []);

  // Add validation for total file size
  const validateTotalSize = useCallback(
    (currentFiles, newFiles) => {
      const currentSize = calculateTotalSize(currentFiles);
      const newSize = calculateTotalSize(newFiles);
      const totalSize = currentSize + newSize;

      if (totalSize > MAX_TOTAL_SIZE) {
        return {
          valid: false,
          message: `Total size of all images (${(
            totalSize /
            (1024 * 1024)
          ).toFixed(2)} MB) exceeds the maximum allowed (${
            MAX_TOTAL_SIZE / (1024 * 1024)
          } MB).`,
        };
      }

      return { valid: true };
    },
    [calculateTotalSize]
  );

  // Update the onDrop function to include total size validation
  const onDrop = useCallback(
    async (acceptedFiles, rejectedFiles) => {
      // Clear any previous errors
      dispatch({ type: "SET_UPLOAD_ERROR", payload: null });

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

        dispatch({ type: "SET_WARNING", payload: errorMessage });
        return;
      }

      // Validate total size before processing
      const filesToValidate = acceptedFiles.map((file) => ({ file }));
      const sizeValidation = validateTotalSize(files, filesToValidate);

      if (!sizeValidation.valid) {
        dispatch({ type: "SET_WARNING", payload: sizeValidation.message });
        return;
      }

      dispatch({ type: "SET_UPLOADING", payload: true });
      dispatch({ type: "SET_PROCESSING", payload: true });

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
            dispatch({
              type: "SET_WARNING",
              payload: `Maximum of ${MAX_NUM_IMAGES} images reached. Some files were not added.`,
            });
            break;
          }

          // Only add as many new files as we have slots for
          const filesToAdd = batchResults.slice(0, availableSlots);

          if (filesToAdd.length < batchResults.length) {
            dispatch({
              type: "SET_WARNING",
              payload: `Maximum of ${MAX_NUM_IMAGES} images reached. Some files were not added.`,
            });
          }

          newFiles = [...newFiles, ...filesToAdd];

          // If we've reached the maximum, stop processing
          if (newFiles.length >= MAX_NUM_IMAGES) {
            break;
          }
        }

        // Update files state once at the end instead of in each iteration
        dispatch({ type: "SET_FILES", payload: newFiles });
      } catch (error) {
        // Use standardized error handling
        handleError(error, "onDrop");
        dispatch({
          type: "SET_WARNING",
          payload: "Error processing images: " + error.message,
        });
      } finally {
        dispatch({ type: "SET_PROCESSING", payload: false });
        dispatch({ type: "SET_UPLOADING", payload: false });
      }
    },
    [files, handleError, validateTotalSize]
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: ACCEPTED_IMAGE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_NUM_IMAGES,
    disabled: processing || uploading,
    noClick: true,
  });

  const handleFileChange = useCallback(
    (e) => {
      if (e.target.files && e.target.files.length > 0) {
        onDrop(Array.from(e.target.files), []);
      }
    },
    [onDrop]
  );

  // Update the handleRemoveAll function
  const handleRemoveAll = useCallback(() => {
    dispatch({ type: "SET_SHOW_REMOVE_ALL_DIALOG", payload: true });
  }, []);

  // Update the removeFile function
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

      // Update the files state
      dispatch({ type: "SET_FILES", payload: newFiles });

      // Create a new completedCrops object without the removed index
      // and with all subsequent indices shifted down by 1
      const newCompletedCrops = {};

      // For each entry in the current completedCrops
      Object.entries(completedCrops).forEach(([cropIndex, cropData]) => {
        const numericIndex = parseInt(cropIndex, 10);

        if (numericIndex < index) {
          // Indices before the removed index stay the same
          newCompletedCrops[numericIndex] = cropData;
        } else if (numericIndex > index) {
          // Indices after the removed index shift down by 1
          newCompletedCrops[numericIndex - 1] = cropData;
        }
        // The index that matches the removed file is excluded
      });

      // Update the completedCrops state
      dispatch({ type: "SET_COMPLETED_CROPS", payload: newCompletedCrops });
    },
    [files, completedCrops]
  );

  // Update the confirmRemoveAll function
  const confirmRemoveAll = useCallback(() => {
    // Clean up all object URLs first
    cleanupObjectUrls();

    // Clear all files and crops in a single batch update
    dispatch({ type: "SET_FILES", payload: [] });
    dispatch({ type: "SET_COMPLETED_CROPS", payload: {} });

    // Close the dialog
    dispatch({ type: "SET_SHOW_REMOVE_ALL_DIALOG", payload: false });
  }, [cleanupObjectUrls]);

  // Update the handleRemoveImage function
  const handleRemoveImage = useCallback((index) => {
    // Only set the index to remove, don't perform any state updates yet
    dispatch({ type: "SET_IMAGE_TO_REMOVE", payload: index });
    dispatch({ type: "SET_SHOW_REMOVE_DIALOG", payload: true });
  }, []);

  // Update the confirmRemoveImage function
  const confirmRemoveImage = useCallback(() => {
    if (imageToRemove !== null) {
      // Only remove the file if we have a valid index
      removeFile(imageToRemove);
      // Reset the imageToRemove state
      dispatch({ type: "SET_IMAGE_TO_REMOVE", payload: null });
    }
    // Close the dialog
    dispatch({ type: "SET_SHOW_REMOVE_DIALOG", payload: false });
  }, [imageToRemove, removeFile]);

  // Update the handleCropComplete function
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

    dispatch({
      type: "UPDATE_CROP",
      payload: { index, crop: normalizedCrop },
    });
  };

  // Update the renderFileCard function to include accessibility features
  const renderFileCard = (file, index) => (
    <Card
      key={index}
      className={`mb-4 rounded-md ${
        file.accepted && !file.declineReason
          ? "border-success"
          : "border-destructive"
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

          <div
            role="application"
            aria-label="Image crop editor"
            tabIndex="0"
            onKeyDown={(e) => {
              // Handle keyboard navigation for the crop area
              const crop = completedCrops[index] || file.initialCrop;
              const step = e.shiftKey ? 10 : 2; // Larger steps with shift key
              let newCrop = { ...crop };

              switch (e.key) {
                case "ArrowLeft":
                  newCrop.x = Math.max(0, crop.x - step);
                  e.preventDefault();
                  break;
                case "ArrowRight":
                  newCrop.x = Math.min(100 - crop.width, crop.x + step);
                  e.preventDefault();
                  break;
                case "ArrowUp":
                  newCrop.y = Math.max(0, crop.y - step);
                  e.preventDefault();
                  break;
                case "ArrowDown":
                  newCrop.y = Math.min(100 - crop.height, crop.y + step);
                  e.preventDefault();
                  break;
                default:
                  return; // Don't handle other keys
              }

              handleCropComplete(null, newCrop, index);
            }}
          >
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
              aria-label="Crop image"
            >
              <Image
                src={file.preview}
                alt={`Preview ${index + 1}`}
                width={400}
                height={400}
                className="w-full h-auto object-cover"
                onClick={() =>
                  dispatch({ type: "SET_SELECTED_IMAGE", payload: index })
                }
                unoptimized={true}
              />
            </ReactCrop>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div>
            <p className="text-sm font-medium">
              {file.file.name.slice(0, 10) +
                "...XXX." +
                file.file.type.split("/")[1]}
              <span className="text-xs text-muted-foreground">
                &nbsp;{(file.file.size / 1048576).toFixed(2)} MB
              </span>
            </p>

            {(!file.accepted || file.declineReason) && (
              <p className="text-xs text-destructive">{file.declineReason}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {file.accepted && !file.declineReason ? (
              <CircleCheck className="h-4 w-4 text-success" />
            ) : (
              <CircleAlert className="h-4 w-4 text-destructive" />
            )}
            <button
              type="button"
              className="flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering other click handlers
                handleRemoveImage(index);
              }}
              aria-label={`Remove image ${index + 1}`}
              disabled={uploading || isCompleted}
              tabIndex="0"
            >
              <Trash
                className="h-4 w-4 text-destructive cursor-pointer hover:text-destructive/80"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Update the handleRetryUpload function
  const handleRetryUpload = () => {
    dispatch({ type: "SET_RETRY_COUNT", payload: 0 });
    dispatch({ type: "SET_UPLOAD_ERROR", payload: null });
    uploadFiles();
  };

  // Add a comprehensive validation function
  const validateImages = useCallback(() => {
    const validFiles = files.filter((file) => file.accepted);
    const errors = [];

    // Check minimum number of images
    if (validFiles.length < MIN_NUM_IMAGES) {
      errors.push(
        `You need at least ${MIN_NUM_IMAGES} valid images to continue.`
      );
    }

    // Check maximum number of images
    if (validFiles.length > MAX_NUM_IMAGES) {
      errors.push(`You can upload a maximum of ${MAX_NUM_IMAGES} images.`);
    }

    // Check total size
    const totalSize = calculateTotalSize(validFiles);
    if (totalSize > MAX_TOTAL_SIZE) {
      errors.push(
        `Total size of all images (${(totalSize / (1024 * 1024)).toFixed(
          2
        )} MB) exceeds the maximum allowed (${
          MAX_TOTAL_SIZE / (1024 * 1024)
        } MB).`
      );
    }

    // Check if any images have missing crop data
    const missingCrops = validFiles.some(
      (file, index) => !completedCrops[index] && !file.initialCrop
    );
    if (missingCrops) {
      errors.push(
        "Some images are missing crop data. Please ensure all images have been properly cropped."
      );
    }

    // Return validation result
    return {
      valid: errors.length === 0,
      errors,
    };
  }, [files, completedCrops, calculateTotalSize]);

  // Update the uploadFiles function to use the comprehensive validation
  const uploadFiles = useCallback(async () => {
    // Run comprehensive validation
    const validation = validateImages();

    if (!validation.valid) {
      dispatch({
        type: "SET_UPLOAD_ERROR",
        payload: validation.errors.join("\n"),
      });
      return;
    }

    dispatch({ type: "SET_UPLOADING", payload: true });
    dispatch({ type: "SET_UPLOAD_PROGRESS", payload: 0 });
    dispatch({ type: "SET_UPLOAD_ERROR", payload: null });

    // Set a global timeout for the entire upload process
    const uploadTimeout = setTimeout(() => {
      if (uploading && !isCompleted) {
        dispatch({
          type: "SET_UPLOAD_ERROR",
          payload:
            "Upload timed out. Please try again with a better connection.",
        });
        dispatch({ type: "SET_UPLOADING", payload: false });
      }
    }, TIMEOUTS.UPLOAD_TOTAL * networkFactor);

    try {
      const validFiles = files.filter((file) => file.accepted);

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

          dispatch({
            type: "SET_UPLOAD_PROGRESS",
            payload: Math.round(totalProgress),
          });
        },
        gender // Pass the gender value here
      );

      // Set the form value with the signed URL
      setValue("images", signedUrl);
      dispatch({ type: "SET_UPLOAD_PROGRESS", payload: 100 });
      dispatch({ type: "SET_COMPLETED", payload: true });
    } catch (error) {
      // Use standardized error handling
      handleError(error, "uploadFiles");
      dispatch({
        type: "SET_UPLOAD_ERROR",
        payload: error.message || "Upload failed. Please try again.",
      });

      // Auto-retry logic for certain errors
      if (
        retryCount < 2 &&
        (error.message.includes("network") ||
          error.message.includes("timeout") ||
          error.message.includes("connection"))
      ) {
        dispatch({ type: "INCREMENT_RETRY_COUNT" });
        setTimeout(() => {
          uploadFiles();
        }, TIMEOUTS.UPLOAD_RETRY_DELAY * networkFactor);
      }
    } finally {
      clearTimeout(uploadTimeout);
      if (!isCompleted && !uploadError) {
        dispatch({ type: "SET_UPLOADING", payload: false });
      }
    }
  }, [
    files,
    setValue,
    completedCrops,
    retryCount,
    isCompleted,
    uploadError,
    uploading,
    networkFactor,
    handleError,
    validateImages,
    gender,
  ]);

  // Reset retry count when files change
  useEffect(() => {
    dispatch({ type: "SET_RETRY_COUNT", payload: 0 });
  }, [files]);

  return (
    <>
      {/* Confirmation dialog for removing an image */}
      <Dialog
        open={showRemoveDialog}
        onOpenChange={(open) =>
          dispatch({ type: "SET_SHOW_REMOVE_DIALOG", payload: open })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Image</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-sm">
            Are you sure you want to remove this image? You can always add more
            images before uploading.
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
      <Dialog
        open={showRemoveAllDialog}
        onOpenChange={(open) =>
          dispatch({ type: "SET_SHOW_REMOVE_ALL_DIALOG", payload: open })
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove All Images</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-sm">
            Are you sure you want to remove all images? You can always add more
            images before uploading.
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
            Click on "Show Image Guidelines" button to read about image
            uploading guidelines.
          </p>
          {/* <ImageUploadingGuideLines /> */}
          <Dialog
            open={showGuidelinesDialog}
            onOpenChange={(open) =>
              dispatch({ type: "SET_SHOW_GUIDELINES_DIALOG", payload: open })
            }
          >
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
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (!uploading && !processing) {
                    fileInputRef.current?.click();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (!uploading && !processing) {
                      fileInputRef.current?.click();
                    }
                  }
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  multiple
                  accept={Object.keys(ACCEPTED_IMAGE_TYPES).join(",")}
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
                      You will need at least {MIN_NUM_IMAGES} images to
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
