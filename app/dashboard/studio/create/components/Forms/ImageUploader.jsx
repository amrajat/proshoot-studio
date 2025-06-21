"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { getCroppedImage } from "@/utils/image-cropping"; // use this to upload cropped images.
import {
  Upload,
  CircleCheck,
  ImageIcon,
  Trash,
  CircleAlert,
  Move,
  RefreshCw,
  FileArchive,
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

import ImageUploadingGuideLines from "@/app/dashboard/studio/create/components/ImageUploadingGuideLines";
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

import createSupabaseBrowserClient from "@/lib/supabase/browser-client";
import { useImageAnalysis } from "@/hooks/useImageAnalysis";
import JSZip from "jszip";

// Image validation rules
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_TOTAL_SIZE = 400 * 1024 * 1024; // 200MB total
const MAX_NUM_IMAGES = 20;
const MIN_NUM_IMAGES = 1;
const MIN_NUM_IMAGES_RECOMMENDED = 10;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
];
const ACCEPTED_IMAGE_TYPES = {
  "image/jpeg": [],
  "image/jpg": [],
  "image/png": [],
  "image/webp": [],
};
const MIN_IMAGE_DIMENSION = 512;

// Add these constants
const CROP_DIMENSION = 1024;
const CROP_ASPECT = 1;

// Add timeout configuration
const TIMEOUTS = {
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
    uploadedFileDetails: [],
  };

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
      case "SET_UPLOADED_FILE_DETAILS":
        return { ...state, uploadedFileDetails: action.payload };
      case "ADD_UPLOADED_FILE_DETAIL":
        return {
          ...state,
          uploadedFileDetails: [...state.uploadedFileDetails, action.payload],
        };
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

  const [state, dispatch] = React.useReducer(reducer, initialState);
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
    uploadedFileDetails,
  } = state;

  const {
    analysisState,
    analysisResults,
    analysisError,
    startImageAnalysis,
    resetAnalysis,
  } = useImageAnalysis();

  const [networkFactor, setNetworkFactor] = useState(1);
  const fileInputRef = useRef(null);
  const supabase = createSupabaseBrowserClient();

  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 1,
  };

  const gender = watch("gender");

  useEffect(() => {
    const updateNetworkFactor = () => {
      const factor = detectNetworkSpeed();
      setNetworkFactor(factor);
    };
    updateNetworkFactor();
    window.addEventListener("online", updateNetworkFactor);
    return () => {
      window.removeEventListener("online", updateNetworkFactor);
    };
  }, []);

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
    } else if (
      warningMessage &&
      warningMessage.startsWith("You are uploading only")
    ) {
      dispatch({ type: "SET_WARNING", payload: "" });
    }
  }, [files, warningMessage]);

  useEffect(() => {
    return () => {
      cleanupObjectUrls();
      setValue("images", "");
    };
  }, [setValue]);

  useEffect(() => {
    if (files.length === 0 && analysisState !== "idle") {
      resetAnalysis();
    }
  }, [files, analysisState, resetAnalysis]);

  const cleanupObjectUrls = useCallback(() => {
    files.forEach((file) => {
      if (file.preview) URL.revokeObjectURL(file.preview);
    });
  }, [files]);

  const handleError = useCallback((error, context, fallback = null) => {
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        tags: { component: "ImageUploader", context },
      });
    }
    return fallback;
  }, []);

  const createImagePromise = (src) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const loadTimeout = setTimeout(
        () => reject(new Error("Image loading timed out")),
        TIMEOUTS.IMAGE_LOAD * networkFactor
      );
      img.onload = () => {
        clearTimeout(loadTimeout);
        if (img.width === 0 || img.height === 0)
          return reject(
            new Error("Image failed to load properly (zero dimensions)")
          );
        resolve(img);
      };
      img.onerror = () => {
        clearTimeout(loadTimeout);
        reject(new Error("Failed to load image"));
      };
      img.crossOrigin = "anonymous";
      img.src = src;
    });
  };

  const applySmartCrop = async (file) => {
    return new Promise(async (resolve, reject) => {
      try {
        const objectUrl = URL.createObjectURL(file);
        const img = await createImagePromise(objectUrl).catch((err) => {
          throw new Error(
            `Failed to load image for smart crop: ${err.message}`
          );
        });

        const cropPromise = SmartCrop.crop(img, {
          width: CROP_DIMENSION,
          height: CROP_DIMENSION,
          minScale: 1.0,
          ruleOfThirds: true,
          samples: 8,
        });
        const timeoutPromise = new Promise((_, rej) =>
          setTimeout(
            () => rej(new Error("Smart crop timed out")),
            TIMEOUTS.SMART_CROP * networkFactor
          )
        );
        const result = await Promise.race([cropPromise, timeoutPromise]);

        if (!result || !result.topCrop)
          throw new Error("Smart crop failed to generate valid crop data");

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
        handleError(error, "applySmartCrop");
        resolve({ unit: "%", x: 25, y: 25, width: 50, height: 50 }); // Fallback
      }
    });
  };

  const processImage = async (file) => {
    return new Promise(async (resolve) => {
      try {
        const objectUrl = URL.createObjectURL(file);
        const img = await createImagePromise(objectUrl).catch((err) => {
          throw new Error(
            `Failed to load image for processing: ${err.message}`
          );
        });
        let accepted = true;
        let declineReason = "";
        if (
          img.width < MIN_IMAGE_DIMENSION ||
          img.height < MIN_IMAGE_DIMENSION
        ) {
          declineReason = `This image is smaller than ${MIN_IMAGE_DIMENSION}x${MIN_IMAGE_DIMENSION} pixels, but we will still use it, it may not be perfect.`;
        }
        const smartCropResult = await applySmartCrop(file);
        resolve({
          file,
          preview: objectUrl,
          accepted,
          declineReason,
          initialCrop: smartCropResult,
          dimensions: { width: img.width, height: img.height },
        });
      } catch (error) {
        handleError(error, "processImage");
        const objectUrl = URL.createObjectURL(file); // Create new URL as previous might be revoked on error
        resolve({
          file,
          preview: objectUrl,
          accepted: false,
          declineReason: "Failed to process image: " + error.message,
          initialCrop: { unit: "%", x: 25, y: 25, width: 50, height: 50 },
          error: true,
        });
      }
    });
  };

  const calculateTotalSize = useCallback((fileList) => {
    return fileList.reduce(
      (total, currentFile) => total + currentFile.file.size,
      0
    );
  }, []);

  const validateTotalSize = useCallback(
    (currentFiles, newFiles) => {
      const currentSize = calculateTotalSize(currentFiles);
      const newSize = newFiles.reduce((total, nf) => total + nf.size, 0);
      const totalSize = currentSize + newSize;
      if (totalSize > MAX_TOTAL_SIZE) {
        return {
          valid: false,
          message: `Total size (${(totalSize / (1024 * 1024)).toFixed(
            2
          )} MB) exceeds max (${MAX_TOTAL_SIZE / (1024 * 1024)} MB).`,
        };
      }
      return { valid: true };
    },
    [calculateTotalSize]
  );

  const onDrop = useCallback(
    async (acceptedFiles, rejectedFiles) => {
      dispatch({ type: "SET_UPLOAD_ERROR", payload: null });
      if (
        files.length > 0 &&
        (acceptedFiles.length > 0 || rejectedFiles.length > 0)
      ) {
        // resetAnalysis(); // Decide if any new drop with existing files resets analysis
      }

      if (acceptedFiles.length === 0 && rejectedFiles.length > 0) {
        let errorMessage = "Some files couldn't be accepted:";
        rejectedFiles.forEach((rejFile) => {
          if (rejFile.file.size > MAX_FILE_SIZE)
            errorMessage += `\n- ${rejFile.file.name} is too large (max: 20MB)`;
          else if (!ALLOWED_IMAGE_TYPES.includes(rejFile.file.type))
            errorMessage += `\n- ${rejFile.file.name} is not a JPG or PNG`;
          else errorMessage += `\n- ${rejFile.file.name} couldn't be processed`;
        });
        dispatch({ type: "SET_WARNING", payload: errorMessage });
        return;
      }

      const sizeValidation = validateTotalSize(files, acceptedFiles); // Pass acceptedFiles directly
      if (!sizeValidation.valid) {
        dispatch({ type: "SET_WARNING", payload: sizeValidation.message });
        return;
      }

      dispatch({ type: "SET_PROCESSING", payload: true }); // For smart-crop, etc.

      try {
        const BATCH_SIZE = 5;
        let processedFileObjects = []; // Will store objects from processImage

        for (let i = 0; i < acceptedFiles.length; i += BATCH_SIZE) {
          const batch = acceptedFiles.slice(i, i + BATCH_SIZE);
          const batchResults = await Promise.all(batch.map(processImage));
          processedFileObjects = [...processedFileObjects, ...batchResults];
        }

        const currentValidFilesCount = files.filter(
          (f) => f.accepted && !f.error
        ).length;
        const availableSlots = MAX_NUM_IMAGES - currentValidFilesCount;

        const filesToAdd = processedFileObjects.slice(0, availableSlots);
        if (processedFileObjects.length > filesToAdd.length) {
          dispatch({
            type: "SET_WARNING",
            payload: `Maximum of ${MAX_NUM_IMAGES} images reached. Some files were not added.`,
          });
        }

        dispatch({ type: "SET_FILES", payload: [...files, ...filesToAdd] });
      } catch (error) {
        handleError(error, "onDrop");
        dispatch({
          type: "SET_WARNING",
          payload: "Error processing images: " + error.message,
        });
      } finally {
        dispatch({ type: "SET_PROCESSING", payload: false });
      }
    },
    [files, handleError, validateTotalSize]
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: ACCEPTED_IMAGE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_NUM_IMAGES, // This is handled by dropzone, but we also do manual check.
    disabled:
      processing ||
      uploading ||
      analysisState === "preparing" ||
      analysisState === "hashing" ||
      analysisState === "rekognition",
    noClick: true,
  });

  const handleFileChange = useCallback(
    (e) => {
      if (e.target.files && e.target.files.length > 0) {
        // if (files.length > 0) resetAnalysis(); // If replacing files, reset.
        onDrop(Array.from(e.target.files), []);
      }
    },
    [onDrop] // files.length removed, onDrop itself depends on files
  );

  const handleRemoveAll = useCallback(() => {
    dispatch({ type: "SET_SHOW_REMOVE_ALL_DIALOG", payload: true });
  }, []);

  const removeFile = useCallback(
    (indexToRemove) => {
      const fileToRemove = files[indexToRemove];
      if (fileToRemove && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      const newFiles = files.filter((_, i) => i !== indexToRemove);
      dispatch({ type: "SET_FILES", payload: newFiles });

      const newCompletedCrops = {};
      Object.entries(completedCrops).forEach(([cropIdx, cropData]) => {
        const numericCropIdx = parseInt(cropIdx, 10);
        if (numericCropIdx < indexToRemove)
          newCompletedCrops[numericCropIdx] = cropData;
        else if (numericCropIdx > indexToRemove)
          newCompletedCrops[numericCropIdx - 1] = cropData;
      });
      dispatch({ type: "SET_COMPLETED_CROPS", payload: newCompletedCrops });
      // Reset analysis as the list of images and their indices have changed.
      resetAnalysis();
    },
    [files, completedCrops, resetAnalysis]
  );

  const confirmRemoveAll = useCallback(() => {
    cleanupObjectUrls();
    dispatch({ type: "SET_FILES", payload: [] });
    dispatch({ type: "SET_COMPLETED_CROPS", payload: {} });
    dispatch({ type: "SET_SHOW_REMOVE_ALL_DIALOG", payload: false });
    resetAnalysis();
  }, [cleanupObjectUrls, resetAnalysis]);

  const handleRemoveImage = useCallback((index) => {
    dispatch({ type: "SET_IMAGE_TO_REMOVE", payload: index });
    dispatch({ type: "SET_SHOW_REMOVE_DIALOG", payload: true });
  }, []);

  const confirmRemoveImage = useCallback(() => {
    if (imageToRemove !== null) {
      removeFile(imageToRemove); // removeFile now calls resetAnalysis
      dispatch({ type: "SET_IMAGE_TO_REMOVE", payload: null });
    }
    dispatch({ type: "SET_SHOW_REMOVE_DIALOG", payload: false });
  }, [imageToRemove, removeFile]);

  const handleCropComplete = (crop, percentCrop, index) => {
    if (!percentCrop) return;
    const file = files[index];
    if (!file) return; // File might have been removed
    const dimensions = file.dimensions || { width: 1024, height: 1024 }; // Default if not set
    const normalizedCrop = normalizeCropData(
      percentCrop,
      dimensions.width,
      dimensions.height
    );
    dispatch({ type: "UPDATE_CROP", payload: { index, crop: normalizedCrop } });
    // A crop change invalidates analysis for that specific image and potentially group analyses.
    // It's simplest to reset all analysis or inform the user to re-analyze.
    resetAnalysis();
  };

  const handleAnalyzeButtonClick = async () => {
    const validFilesToAnalyze = files.filter(
      (f) =>
        f.accepted &&
        !f.error &&
        f.preview &&
        !f.declineReason?.includes("Failed to process image")
    );
    if (validFilesToAnalyze.length > 0) {
      const originalIndexToAnalysisIndexMap = {};
      validFilesToAnalyze.forEach((file) => {
        const originalIdx = files.findIndex(
          (origFile) => origFile.preview === file.preview
        );
        if (originalIdx !== -1) {
          originalIndexToAnalysisIndexMap[originalIdx] = files.findIndex(
            (f) => f.preview === file.preview
          );
        }
      });
      const cropsForAnalysis = {};
      validFilesToAnalyze.forEach((file) => {
        const originalIdx = files.findIndex(
          (origFile) => origFile.preview === file.preview
        );
        if (originalIdx !== -1 && completedCrops[originalIdx]) {
          cropsForAnalysis[originalIdx] = completedCrops[originalIdx];
        } else if (originalIdx !== -1 && file.initialCrop) {
          cropsForAnalysis[originalIdx] = file.initialCrop;
        }
      });
      // Pass the filtered files and their corresponding crops (keyed by original index)
      await startImageAnalysis(validFilesToAnalyze, cropsForAnalysis);
    } else {
      dispatch({
        type: "SET_WARNING",
        payload: "No valid images available to analyze.",
      });
    }
  };

  const renderFileCard = (file, originalIndex) => {
    // originalIndex is the index in the `files` array
    const analysisResultForThisFile = analysisResults[originalIndex];

    let cardBorderColor = "border-gray-300"; // Default
    if (file.accepted && !file.declineReason && !file.error) {
      if (analysisResultForThisFile) {
        if (
          analysisResultForThisFile.status &&
          (analysisResultForThisFile.status.startsWith("error_") ||
            analysisResultForThisFile.rekognitionIndividual?.status === "error")
        ) {
          cardBorderColor = "border-red-500";
        } else if (
          analysisResultForThisFile.status === "skipped" ||
          analysisResultForThisFile.status === "skipped_no_crop"
        ) {
          cardBorderColor = "border-amber-500";
        } else if (analysisState === "completed" && !analysisError) {
          // Global analysis completed without system error
          if (
            analysisResultForThisFile.rekognitionIndividual?.noFaceDetected ||
            analysisResultForThisFile.rekognitionIndividual
              ?.multipleFacesDetected ||
            analysisResultForThisFile.rekognitionIndividual?.isBlurry ===
              true ||
            analysisResultForThisFile.hashAnalysis?.isExactDuplicate ||
            analysisResultForThisFile.rekognitionBatch?.isVisuallySimilar
          ) {
            cardBorderColor = "border-orange-500"; // Specific issues found
          } else if (
            analysisResultForThisFile.status &&
            analysisResultForThisFile.status.includes("analyzed")
          ) {
            cardBorderColor = "border-green-500"; // Analyzed and looks good
          } else {
            cardBorderColor = "border-blue-400"; // Still processing or undetermined
          }
        } else if (isAnalysisInProgress) {
          cardBorderColor = "border-blue-400";
        } else {
          cardBorderColor = "border-success"; // Default good, pre-analysis or no specific issues yet
        }
      } else {
        cardBorderColor = "border-success";
      }
    } else if (file.error || file.declineReason) {
      cardBorderColor = "border-destructive";
    }

    return (
      <Card
        key={originalIndex}
        className={`mb-4 rounded-md ${cardBorderColor}`}
      >
        <CardContent className="p-4">
          <div className="relative">
            <ReactCrop
              crop={completedCrops[originalIndex] || file.initialCrop}
              onChange={(c, pc) => handleCropComplete(c, pc, originalIndex)}
              onComplete={(c, pc) => handleCropComplete(c, pc, originalIndex)}
              aspect={CROP_ASPECT}
              className="max-w-full h-auto"
              minWidth={128}
              minHeight={128}
              keepSelection={true}
              ruleOfThirds={true}
              aria-label="Crop image"
            >
              <Image
                src={file.preview}
                alt={`Preview ${originalIndex + 1}`}
                width={400}
                height={400}
                className="w-full h-auto object-cover rounded"
                onClick={() =>
                  dispatch({
                    type: "SET_SELECTED_IMAGE",
                    payload: originalIndex,
                  })
                }
                unoptimized={true}
              />
            </ReactCrop>
          </div>
          <div className="mt-2">
            <p className="text-sm font-medium truncate" title={file.file.name}>
              {file.file.name.length > 25
                ? `${file.file.name.slice(0, 15)}...${file.file.name.slice(-7)}`
                : file.file.name}
              <span className="text-xs text-muted-foreground">
                &nbsp;{(file.file.size / 1048576).toFixed(2)} MB
              </span>
            </p>
            {(!file.accepted || file.declineReason) && (
              <p className="text-xs text-destructive">{file.declineReason}</p>
            )}
          </div>

          {analysisResultForThisFile && (
            <div className="mt-2 p-2 border border-dashed border-border rounded-md text-xs space-y-1">
              <p className="font-semibold text-xs underline decoration-dotted mb-0.5">
                Analysis:{" "}
                <span className="font-normal normal-case">
                  {analysisResultForThisFile.status
                    ? analysisResultForThisFile.status.replace(/_/g, " ")
                    : "Pending..."}
                </span>
              </p>

              {analysisResultForThisFile.status === "skipped" && (
                <p className="text-gray-500">
                  Skipped: {analysisResultForThisFile.error}
                </p>
              )}
              {analysisResultForThisFile.status === "skipped_no_crop" && (
                <p className="text-amber-600">
                  Skipped (no crop data): {analysisResultForThisFile.error}
                </p>
              )}
              {analysisResultForThisFile.status === "error_preparation" && (
                <p className="text-red-500">
                  Prep Error: {analysisResultForThisFile.error}
                </p>
              )}
              {analysisResultForThisFile.status === "error_hash" && (
                <p className="text-red-500">
                  Hashing Error: {analysisResultForThisFile.error}
                </p>
              )}

              {analysisResultForThisFile.hashAnalysis?.isExactDuplicate && (
                <Badge
                  variant="destructive"
                  className="text-xs font-normal mb-0.5 block w-fit"
                >
                  Exact Duplicate (Group:{" "}
                  {analysisResultForThisFile.hashAnalysis.groupKey.substring(
                    0,
                    6
                  )}
                  )
                </Badge>
              )}
              {analysisResultForThisFile.rekognitionBatch
                ?.isVisuallySimilar && (
                <Badge
                  variant="outline"
                  className="text-xs font-normal mb-0.5 block w-fit border-yellow-500 text-yellow-700"
                >
                  Visually Similar (Group:{" "}
                  {analysisResultForThisFile.rekognitionBatch.groupIds
                    .map((id) => id.split("_")[1])
                    .join(", ")}
                  )
                </Badge>
              )}

              {analysisResultForThisFile.rekognitionIndividual?.status ===
                "error" && (
                <p className="text-red-500">
                  AI Analysis Error:{" "}
                  {analysisResultForThisFile.rekognitionIndividual.error}
                </p>
              )}
              {analysisResultForThisFile.rekognitionIndividual?.status ===
                "success" && (
                <>
                  {analysisResultForThisFile.rekognitionIndividual
                    .noFaceDetected && (
                    <p className="text-orange-600">No face detected.</p>
                  )}
                  {analysisResultForThisFile.rekognitionIndividual
                    .multipleFacesDetected && (
                    <p className="text-orange-600">Multiple faces detected.</p>
                  )}
                  {analysisResultForThisFile.rekognitionIndividual.isBlurry ===
                    true && (
                    <p className="text-orange-600">Face appears blurry.</p>
                  )}
                  {analysisResultForThisFile.rekognitionIndividual.exposure ===
                    "underexposed" && (
                    <p className="text-orange-600">
                      Image may be underexposed.
                    </p>
                  )}
                  {analysisResultForThisFile.rekognitionIndividual.exposure ===
                    "overexposed" && (
                    <p className="text-orange-600">Image may be overexposed.</p>
                  )}
                  {analysisResultForThisFile.rekognitionIndividual
                    .faceProximity === "too_close" && (
                    <p className="text-orange-600">Face too close to camera.</p>
                  )}
                  {analysisResultForThisFile.rekognitionIndividual
                    .faceProximity === "too_far" && (
                    <p className="text-orange-600">Face too far from camera.</p>
                  )}
                  {analysisResultForThisFile.rekognitionIndividual
                    .faceProximity === "unknown_dimensions" && (
                    <p className="text-amber-600">
                      Face proximity check skipped.
                    </p>
                  )}

                  {!(
                    analysisResultForThisFile.rekognitionIndividual
                      .noFaceDetected ||
                    analysisResultForThisFile.rekognitionIndividual
                      .multipleFacesDetected ||
                    analysisResultForThisFile.rekognitionIndividual.isBlurry ===
                      true ||
                    analysisResultForThisFile.rekognitionIndividual.exposure ===
                      "underexposed" ||
                    analysisResultForThisFile.rekognitionIndividual.exposure ===
                      "overexposed" ||
                    analysisResultForThisFile.rekognitionIndividual
                      .faceProximity === "too_close" ||
                    analysisResultForThisFile.rekognitionIndividual
                      .faceProximity === "too_far"
                  ) &&
                    !analysisResultForThisFile.hashAnalysis?.isExactDuplicate &&
                    !analysisResultForThisFile.rekognitionBatch
                      ?.isVisuallySimilar &&
                    analysisResultForThisFile.rekognitionIndividual.status ===
                      "success" && (
                      <p className="text-green-600">Looks good!</p>
                    )}
                </>
              )}
            </div>
          )}

          <div className="flex items-center justify-end mt-2">
            {file.accepted && !file.declineReason && !file.error ? (
              <CircleCheck className="h-4 w-4 text-success" />
            ) : (
              <CircleAlert className="h-4 w-4 text-destructive" />
            )}
            <button
              type="button"
              className="ml-2 flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage(originalIndex);
              }}
              aria-label={`Remove image ${originalIndex + 1}`}
              disabled={uploading || isCompleted || isAnalysisInProgress}
              tabIndex="0"
            >
              <Trash
                className="h-4 w-4 text-destructive cursor-pointer hover:text-destructive/80"
                aria-hidden="true"
              />
            </button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const validateImages = useCallback(() => {
    const validFiles = files.filter((file) => file.accepted && !file.error); // Ensure only valid files are considered
    const validationErrors = [];

    if (validFiles.length < MIN_NUM_IMAGES) {
      validationErrors.push(
        `You need at least ${MIN_NUM_IMAGES} valid images.`
      );
    }
    if (validFiles.length > MAX_NUM_IMAGES) {
      validationErrors.push(
        `You can upload a maximum of ${MAX_NUM_IMAGES} images.`
      );
    }
    const totalSize = calculateTotalSize(validFiles);
    if (totalSize > MAX_TOTAL_SIZE) {
      validationErrors.push(
        `Total size (${(totalSize / (1024 * 1024)).toFixed(
          2
        )} MB) exceeds max (${MAX_TOTAL_SIZE / (1024 * 1024)} MB).`
      );
    }
    const missingCrops = validFiles.some(
      (file, index) => !completedCrops[index] && !file.initialCrop
    );
    if (missingCrops) {
      validationErrors.push(
        "Some images are missing crop data. Ensure all images are cropped."
      );
    }
    return { valid: validationErrors.length === 0, errors: validationErrors };
  }, [files, completedCrops, calculateTotalSize]);

  const uploadFiles = useCallback(async () => {
    // const validation = validateImages();
    // if (!validation.valid) {
    //   dispatch({
    //     type: "SET_UPLOAD_ERROR",
    //     payload: validation.errors.join("\n"),
    //   });
    //   return;
    // }

    // Additional check: Ensure analysis is complete and no critical errors exist
    // const hasCriticalAnalysisIssues = Object.values(analysisResults).some(
    //   (res) =>
    //     (res.status &&
    //       (res.status.startsWith("error_") ||
    //         res.status === "skipped_no_crop")) ||
    //     (res.rekognitionIndividual &&
    //       (res.rekognitionIndividual.noFaceDetected ||
    //         res.rekognitionIndividual.multipleFacesDetected)) ||
    //     (res.hashAnalysis && res.hashAnalysis.isExactDuplicate)
    // );

    // if (analysisState !== "completed" || hasCriticalAnalysisIssues) {
    //   let errorMsg =
    //     "Please complete image analysis and resolve any critical issues before uploading.";
    //   if (analysisState !== "completed")
    //     errorMsg =
    //       "Image analysis is not yet complete. Please wait or re-analyze.";
    //   else if (hasCriticalAnalysisIssues)
    //     errorMsg =
    //       "Some images have critical issues (e.g., no face, duplicates). Please review or remove them before uploading.";
    //   dispatch({ type: "SET_UPLOAD_ERROR", payload: errorMsg });
    //   return;
    // }

    dispatch({ type: "SET_UPLOADING", payload: true });
    dispatch({ type: "SET_UPLOAD_PROGRESS", payload: 0 });
    dispatch({ type: "SET_UPLOAD_ERROR", payload: null });
    dispatch({ type: "SET_UPLOADED_FILE_DETAILS", payload: [] }); // Clear previous details

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      dispatch({
        type: "SET_UPLOAD_ERROR",
        payload: "Authentication error. Please log in again.",
      });
      dispatch({ type: "SET_UPLOADING", payload: false });
      handleError(
        sessionError || new Error("No session"),
        "uploadFiles.getSession"
      );
      return;
    }
    const userToken = session.access_token;

    const uploadTimeout = setTimeout(() => {
      if (state.uploading && !state.isCompleted) {
        dispatch({
          type: "SET_UPLOAD_ERROR",
          payload: "Upload timed out. Please try again.",
        });
        dispatch({ type: "SET_UPLOADING", payload: false });
      }
    }, TIMEOUTS.UPLOAD_TOTAL * networkFactor);

    try {
      const validFilesToProcess = files.filter(
        (file, index) =>
          file.accepted &&
          !file.error &&
          (completedCrops[index] || file.initialCrop)
      );

      if (validFilesToProcess.length === 0) {
        dispatch({
          type: "SET_UPLOAD_ERROR",
          payload: "No valid files to zip and upload.",
        });
        dispatch({ type: "SET_UPLOADING", payload: false });
        clearTimeout(uploadTimeout);
        return;
      }

      dispatch({ type: "SET_PROCESSING", payload: true }); // Indicate zipping process

      const zip = new JSZip();
      let filesAddedToZip = 0;
      let currentZippingProgress = 0;
      const totalFilesToZip = validFilesToProcess.length;

      for (let i = 0; i < totalFilesToZip; i++) {
        const fileData = validFilesToProcess[i];
        const originalIndex = files.findIndex(
          (f) => f.preview === fileData.preview
        );
        const cropData = completedCrops[originalIndex] || fileData.initialCrop;
        const originalFile = fileData.file;

        if (!cropData) {
          console.warn(
            `Skipping file ${originalFile.name} due to missing crop data during zipping.`
          );
          continue;
        }

        try {
          const croppedImageBlob = await getCroppedImage(
            fileData.preview,
            cropData,
            CROP_DIMENSION
          );

          if (croppedImageBlob) {
            const fileNameInZip = originalFile.name.replace(
              /[^a-zA-Z0-9._-]/g,
              "_"
            );
            zip.file(fileNameInZip, croppedImageBlob);
            filesAddedToZip++;
          } else {
            console.warn(
              `Skipping file ${originalFile.name} as getCroppedImage returned null.`
            );
          }
        } catch (cropError) {
          console.error(
            `Error cropping file ${originalFile.name} for zipping:`,
            cropError
          );
          // Optionally, add to an error list to show the user
        }
        currentZippingProgress = ((i + 1) / totalFilesToZip) * 50; // Zipping is first 50%
        dispatch({
          type: "SET_UPLOAD_PROGRESS",
          payload: Math.round(currentZippingProgress),
        });
      }

      if (filesAddedToZip === 0) {
        dispatch({
          type: "SET_UPLOAD_ERROR",
          payload: "No files could be processed and added to the ZIP.",
        });
        dispatch({ type: "SET_PROCESSING", payload: false });
        dispatch({ type: "SET_UPLOADING", payload: false });
        clearTimeout(uploadTimeout);
        return;
      }

      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });

      dispatch({ type: "SET_PROCESSING", payload: false }); // Zipping done

      const zipFileName = `dataset_${session.user.id.substring(
        0,
        8
      )}_${Date.now()}.zip`;

      console.log(
        "[Zip Upload] Requesting presign URL for:",
        zipFileName,
        "Type:",
        zipBlob.type
      );

      const presignResponse = await fetch("/api/r2/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: zipFileName,
          contentType: zipBlob.type,
          userToken: userToken,
        }),
        cache: "no-store",
      });

      console.log(
        "[Zip Upload] Presign Response Status:",
        presignResponse.status
      );

      if (!presignResponse.ok) {
        const errorData = await presignResponse
          .json()
          .catch(() => ({ error: "Failed to parse presign error" }));
        console.error("[Zip Upload] Presign error data:", errorData);
        throw new Error(
          `Failed to get upload URL for ZIP: ${
            errorData.error || presignResponse.statusText
          }`
        );
      }

      // EXPECTING API to return: { uploadUrl, downloadUrl, objectKey }
      const { uploadUrl, downloadUrl, objectKey } =
        await presignResponse.json();

      console.log("[Zip Upload] Received uploadUrl (for PUT):", uploadUrl);
      console.log(
        "[Zip Upload] Received downloadUrl (for GET, 24hr expiry - from API):",
        downloadUrl
      );
      console.log("[Zip Upload] Received objectKey:", objectKey);

      if (!uploadUrl) {
        console.error(
          "[Zip Upload] uploadUrl is missing from presign response."
        );
        throw new Error("uploadUrl missing for ZIP file upload");
      }
      if (!downloadUrl) {
        console.warn(
          "[Zip Upload] downloadUrl is missing from presign response. Download link may not work as expected for private objects unless PUT URL is publicly accessible for GET too (not typical)."
        );
        // Fallback or error if downloadUrl is critical and missing
        // For now, we'll proceed, but the download link might use the PUT URL which could fail for GET
      }

      dispatch({ type: "SET_UPLOAD_PROGRESS", payload: 50 });

      const r2UploadResponse = await fetch(uploadUrl, {
        // Use PUT URL for upload
        method: "PUT",
        headers: { "Content-Type": zipBlob.type },
        body: zipBlob,
      });

      console.log(
        "[Zip Upload] R2 Upload Response Status:",
        r2UploadResponse.status
      );

      if (!r2UploadResponse.ok) {
        const r2ErrorText = await r2UploadResponse
          .text()
          .catch(() => "Could not read R2 error.");
        console.error("[Zip Upload] R2 upload error text:", r2ErrorText);
        throw new Error(
          `Failed to upload ZIP to R2: ${r2UploadResponse.statusText}. Details: ${r2ErrorText}`
        );
      }

      const finalUrlForForm = downloadUrl || uploadUrl; // Prefer downloadUrl if available

      const uploadedZipDisplayDetails = {
        objectKey,
        // Use downloadUrl for the link, fallback to uploadUrl if downloadUrl isn't provided (though this might not work for GET)
        displayUrl: downloadUrl || uploadUrl,
        originalName: zipFileName,
        size: zipBlob.size,
        type: zipBlob.type,
        isZip: true,
        zippedFileCount: filesAddedToZip,
      };

      dispatch({
        type: "SET_UPLOADED_FILE_DETAILS",
        payload: [uploadedZipDisplayDetails],
      });

      // Set 'images' to the (ideally GET) pre-signed URL string with 24hr expiry from API
      // setValue("images", finalUrlForForm);
      setValue("images", objectKey);

      dispatch({ type: "SET_UPLOAD_PROGRESS", payload: 100 });
      dispatch({ type: "SET_COMPLETED", payload: true });
      dispatch({ type: "SET_UPLOAD_ERROR", payload: null });
      resetAnalysis();
    } catch (error) {
      handleError(error, "uploadFiles.zipAndUpload");
      dispatch({
        type: "SET_UPLOAD_ERROR",
        payload: error.message || "ZIP Upload failed. Please try again.",
      });
      dispatch({ type: "SET_COMPLETED", payload: false });
      dispatch({ type: "SET_PROCESSING", payload: false });

      if (
        state.retryCount < 2 &&
        (error.message.includes("network") ||
          error.message.includes("timeout") ||
          error.message.includes("connection")) &&
        !error.message.toLowerCase().includes("zip") // Avoid retrying logical ZIP errors
      ) {
        dispatch({ type: "INCREMENT_RETRY_COUNT" });
        setTimeout(() => {
          uploadFiles();
        }, TIMEOUTS.UPLOAD_RETRY_DELAY * networkFactor);
      }
    } finally {
      clearTimeout(uploadTimeout);
      if (!state.isCompleted) {
        dispatch({ type: "SET_UPLOADING", payload: false });
      }
    }
  }, [
    files,
    setValue,
    completedCrops,
    supabase,
    networkFactor,
    handleError,
    validateImages,
    state.uploading,
    state.isCompleted,
    state.uploadError,
    state.retryCount,
    analysisState,
    analysisResults,
    resetAnalysis,
    TIMEOUTS.UPLOAD_RETRY_DELAY,
    TIMEOUTS.UPLOAD_TOTAL,
    CROP_DIMENSION,
  ]);

  const handleRetryUpload = useCallback(() => {
    dispatch({ type: "RESET_UPLOAD_STATE" });
    uploadFiles();
  }, [uploadFiles]);

  useEffect(() => {
    dispatch({ type: "SET_RETRY_COUNT", payload: 0 });
  }, [files]); // Reset retry count when files list changes.

  const isAnalysisInProgress =
    analysisState === "preparing" ||
    analysisState === "hashing" ||
    analysisState === "rekognition";

  const canAnalyze =
    files.filter(
      (f) =>
        f.accepted &&
        !f.error &&
        f.preview &&
        !f.declineReason?.includes("Failed to process image")
    ).length > 0 &&
    !uploading &&
    !processing &&
    !isAnalysisInProgress &&
    !isCompleted;

  const minImagesMet =
    files.filter((file) => file.accepted && !file.error).length >=
    MIN_NUM_IMAGES;

  // Determine if there are critical issues from analysis that should block upload
  const hasCriticalAnalysisErrors =
    analysisState === "completed" &&
    Object.values(analysisResults).some(
      (res) =>
        (res.status &&
          (res.status.startsWith("error_") ||
            res.status === "skipped_no_crop")) ||
        (res.rekognitionIndividual &&
          (res.rekognitionIndividual.noFaceDetected ||
            res.rekognitionIndividual.multipleFacesDetected ||
            res.rekognitionIndividual.isBlurry)) ||
        (res.hashAnalysis && res.hashAnalysis.isExactDuplicate)
      // Add other conditions you deem critical from analysisResults per image.
    );

  // const canUpload =
  minImagesMet &&
    !isAnalysisInProgress &&
    analysisState === "completed" && // Must have completed analysis
    !hasCriticalAnalysisErrors && // And no critical errors
    !uploading &&
    !processing &&
    !isCompleted;

  let uploadButtonTitle = `Upload ${MIN_NUM_IMAGES}+ selected images`;
  if (!minImagesMet)
    uploadButtonTitle = `Need at least ${MIN_NUM_IMAGES} valid images.`;
  else if (isAnalysisInProgress)
    uploadButtonTitle = "Image analysis in progress...";
  else if (analysisState !== "completed")
    uploadButtonTitle = "Please complete image analysis before uploading.";
  else if (hasCriticalAnalysisErrors)
    uploadButtonTitle =
      "Resolve critical image analysis issues before uploading.";
  else if (uploading) uploadButtonTitle = "Upload in progress...";
  else if (isCompleted) uploadButtonTitle = "Upload complete.";

  return (
    <>
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
            Are you sure you want to remove this image?
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
            Are you sure you want to remove all images?
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
          <Heading variant={"hero"}>Please upload your images.</Heading>
          <p className="text-muted-foreground">
            Upload {MIN_NUM_IMAGES_RECOMMENDED}-{MAX_NUM_IMAGES} good quality
            photos. Click "Show Image Guidelines" for details.
          </p>

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

          {isAnalysisInProgress && (
            <Alert
              variant="default"
              className="my-4 bg-blue-50 border-blue-300 text-blue-700 flex items-center"
            >
              <Loader className="h-5 w-5 text-blue-600 mr-3 animate-spin" />
              <AlertDescription>
                {analysisState === "preparing" &&
                  "Preparing images for analysis..."}
                {analysisState === "hashing" &&
                  "Analyzing for duplicates (hashing)..."}
                {analysisState === "rekognition" &&
                  "Performing AI analysis on images... (this may take a moment)"}
              </AlertDescription>
            </Alert>
          )}
          {analysisState === "completed" &&
            !analysisError &&
            files.length > 0 && (
              <Alert
                variant="default"
                className={`my-4 ${
                  hasCriticalAnalysisErrors
                    ? "bg-orange-50 border-orange-300 text-orange-700"
                    : "bg-green-50 border-green-300 text-green-700"
                }`}
              >
                {hasCriticalAnalysisErrors ? (
                  <CircleAlert className="h-5 w-5 mr-2" />
                ) : (
                  <CircleCheck className="h-5 w-5 mr-2" />
                )}
                <AlertTitle className="font-semibold">
                  Analysis Complete!
                </AlertTitle>
                <AlertDescription>
                  {hasCriticalAnalysisErrors
                    ? "Some images have issues. Please review feedback below before uploading."
                    : "Review feedback on each image. You can now proceed to upload if satisfied."}
                </AlertDescription>
              </Alert>
            )}
          {analysisError &&
            !isAnalysisInProgress && ( // Show general analysis error if not during active analysis phases
              <Alert variant="destructive" className="my-4">
                <CircleAlert className="h-5 w-5 mr-2" />
                <AlertTitle className="font-semibold">
                  Analysis System Problem
                </AlertTitle>
                <AlertDescription className="mt-1 whitespace-pre-line">
                  {analysisError}
                  <br />
                  Please try re-analyzing. If the problem persists, contact
                  support.
                </AlertDescription>
              </Alert>
            )}

          {!isCompleted ? (
            <div className="space-y-4">
              {processing && ( // This is for SmartCrop etc.
                <div className="fixed inset-0 bg-background/80 flex flex-col items-center justify-center z-50">
                  <Loader />{" "}
                  <p className="ml-2 mt-2 text-lg">
                    Processing images (cropping, etc.)...
                  </p>
                </div>
              )}

              <div
                {...getRootProps()}
                className={`cursor-pointer p-12 flex justify-center bg-background border-2 border-dashed ${
                  uploading || processing || isAnalysisInProgress
                    ? "border-muted cursor-not-allowed"
                    : "border-primary"
                } rounded-lg`}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (!uploading && !processing && !isAnalysisInProgress) {
                    fileInputRef.current?.click();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (!uploading && !processing && !isAnalysisInProgress) {
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
                  disabled={uploading || processing || isAnalysisInProgress}
                />
                <div className="text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold text-foreground">
                    <span>Drop your images here or</span>{" "}
                    <span className="text-primary">browse</span>
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    You can upload up to {MAX_NUM_IMAGES} images, each up to{" "}
                    {(MAX_FILE_SIZE / 1048576).toFixed(0)} MB.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Combined size of all images lesser than{" "}
                    {(MAX_TOTAL_SIZE / (1024 * 1024)).toFixed(0)} MB.
                  </p>
                </div>
              </div>

              {files.length > 0 && (
                <>
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="px-3 py-1 flex gap-1 items-center text-xs font-normal text-muted rounded bg-foreground">
                      <Move className="text-destructive" strokeWidth={1.5} />
                      KEEP <span className="italic">your head in frame</span>
                    </span>
                    <span className="px-3 py-1 flex gap-1 items-center text-xs font-normal text-muted rounded bg-foreground">
                      <Move className="text-destructive" strokeWidth={1.5} />
                      KEEP <span className="italic">some upper body shots</span>
                    </span>
                  </div>
                  <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="flex -ml-4 w-auto"
                    columnClassName="pl-4 bg-clip-padding"
                  >
                    {files.map((file, index) => renderFileCard(file, index))}
                  </Masonry>
                </>
              )}

              {warningMessage &&
                !warningMessage.startsWith("You are uploading only") && ( // General warnings (not the "uploading only X images" one)
                  <Alert variant="destructive" className="my-2">
                    <CircleAlert className="h-4 w-4 mr-2" />{" "}
                    <AlertDescription>{warningMessage}</AlertDescription>
                  </Alert>
                )}

              {uploadError && ( // Upload specific errors
                <Alert variant="destructive">
                  <AlertTitle className="flex items-center justify-between">
                    Upload Error{" "}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetryUpload}
                      className="ml-2"
                      disabled={uploading}
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
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t mt-6">
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <Button
                      onClick={uploadFiles}
                      // disabled={!canUpload} //TODO: uncomment this
                      title={uploadButtonTitle}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploading
                        ? `Uploading... ${uploadProgress}%`
                        : "Upload Images"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAnalyzeButtonClick}
                      disabled={!canAnalyze || isCompleted}
                    >
                      {isAnalysisInProgress ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Analyzing...
                        </>
                      ) : analysisState === "completed" ||
                        analysisState === "error" ? (
                        "Re-Analyze Images"
                      ) : (
                        "Analyze Images"
                      )}
                    </Button>
                  </div>
                  <div className="flex flex-col gap-1 text-right items-end sm:items-start">
                    {!minImagesMet && (
                      <span className="text-xs text-destructive">
                        Requires at least {MIN_NUM_IMAGES} valid images to
                        upload.
                      </span>
                    )}
                    {minImagesMet &&
                      analysisState !== "completed" &&
                      !isAnalysisInProgress && (
                        <span className="text-xs text-amber-600">
                          Please run image analysis before uploading.
                        </span>
                      )}
                    {minImagesMet &&
                      analysisState === "completed" &&
                      hasCriticalAnalysisErrors && (
                        <span className="text-xs text-orange-600">
                          Resolve image issues identified by analysis.
                        </span>
                      )}
                    {minImagesMet &&
                      analysisState === "completed" &&
                      !hasCriticalAnalysisErrors &&
                      !isAnalysisInProgress && (
                        <span className="text-xs text-green-600">
                          Ready to upload!
                        </span>
                      )}
                  </div>
                  {!uploading && !isCompleted && files.length > 0 && (
                    <Button
                      variant="destructive"
                      onClick={handleRemoveAll}
                      className="mt-2 sm:mt-0"
                      disabled={isAnalysisInProgress}
                    >
                      <Trash className="mr-2 h-4 w-4" /> Remove All
                    </Button>
                  )}
                </div>
              )}
              {uploading && (
                <div className="flex justify-center mt-4">
                  <Loader />
                </div>
              )}
            </div>
          ) : (
            <Alert className="my-4">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Your images are successfully uploaded. Tap on Create Studio
                button.
              </AlertDescription>
            </Alert>
          )}
          {isCompleted && uploadedFileDetails.length > 0 && (
            <div className="mt-6">
              <Heading variant="h3" className="mb-3">
                Upload Successful!
              </Heading>
              <Alert className="my-4">
                <AlertTitle>ZIP File Ready</AlertTitle>
                <AlertDescription>
                  Your ZIP file has been uploaded. The pre-signed URL for access
                  has been set. You can typically find the URL in the form data
                  if needed, or use the download link below if configured.
                </AlertDescription>
              </Alert>
              {/* Display details of the single uploaded ZIP */}
              {uploadedFileDetails.map((uploadedFile, index) => (
                <Card key={uploadedFile.objectKey || index} className="mb-4">
                  <CardContent className="p-4">
                    {uploadedFile.isZip && ( // Should always be true now
                      <div className="flex items-center space-x-4">
                        <FileArchive className="h-12 w-12 text-muted-foreground flex-shrink-0" />
                        <div className="flex-grow">
                          <p
                            className="text-sm font-semibold truncate"
                            title={uploadedFile.originalName}
                          >
                            {uploadedFile.originalName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Contains {uploadedFile.zippedFileCount} image(s)
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)}{" "}
                            MB
                          </p>
                          {/* Use the displayUrl which should be the pre-signed GET URL */}
                          {uploadedFile.displayUrl && (
                            <a
                              href={uploadedFile.displayUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline mt-1 block"
                            >
                              Download ZIP
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
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
