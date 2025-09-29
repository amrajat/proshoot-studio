"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import SmartCrop from "smartcrop";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import Masonry from "react-masonry-css";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  X,
  RefreshCw,
  Info,
  CheckCircle2,
  Loader2,
  Trash2,
} from "lucide-react";

import useStudioCreateStore from "@/stores/studioCreateStore";
import { createCheckoutUrl } from "@/lib/checkout";
import { hasSufficientCredits } from "@/services/creditService";
import ImageUploadGuidelines from "@/components/studio/create/image-upload-guidelines";
import StepNavigation from "@/components/studio/create/step-navigation";
import { Separator } from "@/components/ui/separator";

// Constants

const MB = 1024 * 1024;
const MAX_FILE_SIZE = 25 * MB;
const MAX_IMAGES = 25;
const MIN_IMAGES = 8;
const CROP_DIMENSION = 1024;
const CROP_ASPECT = 1;
const MIN_IMAGE_DIMENSION = 256;
const SMART_CROP_TIMEOUT = 600000; // TIME TO LOAD SMARTCROP
const COMPRESSION_THRESHOLD = 4 * MB;
const ACCEPTED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/heic": [".heic"],
  "image/heif": [".heif"],
};

// Helper functions - exact copy from working ImageUploader
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

// Function to check for duplicate files - robust production-ready approach
const isDuplicateFile = (newFile, existingFiles) => {
  return existingFiles.some((existingFile) => {
    // Primary check: name, size, and lastModified (most reliable)
    const basicMatch =
      existingFile.file.name === newFile.name &&
      existingFile.file.size === newFile.size &&
      existingFile.file.lastModified === newFile.lastModified;

    // Secondary check: same name and size but different lastModified
    // This catches files that might be the same but re-saved
    const nameAndSizeMatch =
      existingFile.file.name === newFile.name &&
      existingFile.file.size === newFile.size;

    // For images, if name and size match exactly, it's very likely a duplicate
    // even if lastModified differs (could be due to file system differences)
    return basicMatch || nameAndSizeMatch;
  });
};

const createImagePromise = (src) => {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
    img.src = src;
  });
};

const ImageUploadStep = ({
  selectedContext,
  credits,
  isOrgWithTeamCredits,
}) => {
  const router = useRouter();
  const { formData, isSubmitting, setIsSubmitting, prevStep, updateFormField } =
    useStudioCreateStore();

  // Initialize upload state from persisted data or create new
  const initializeUploadState = () => {
    const persistedUploadState = formData.uploadState;
    if (persistedUploadState && persistedUploadState.files?.length > 0) {
      // Reconstruct upload progress based on uploaded files
      const reconstructedProgress = {};
      persistedUploadState.files.forEach((file, index) => {
        const uploadedFile = persistedUploadState.uploadedFiles?.find(
          (f) => f.fileId === file.id
        );
        if (uploadedFile) {
          reconstructedProgress[index] = { status: "completed", progress: 100 };
        }
      });

      return {
        ...persistedUploadState,
        uploading: false,
        processing: false,
        uploadProgress: {
          ...persistedUploadState.uploadProgress,
          ...reconstructedProgress,
        },
        // Reset transient states but keep files and uploads
      };
    }
    return {
      files: [],
      uploading: false,
      uploadProgress: {},
      uploadedFiles: [],
      currentUUID: uuidv4(),
      completedCrops: {},
      processing: false,
    };
  };

  // Component state
  const [uploadState, setUploadState] = useState(initializeUploadState);

  // Verify upload and delete status on component mount
  useEffect(() => {
    const verifyFileStatus = async () => {
      if (uploadState.files.length === 0) return;

      const updatedProgress = { ...uploadState.uploadProgress };
      let updatedFiles = [...uploadState.files];
      let updatedUploadedFiles = [...(uploadState.uploadedFiles || [])];
      let hasUpdates = false;

      // Check each file for upload status and deletion status
      for (let index = uploadState.files.length - 1; index >= 0; index--) {
        const progress = uploadState.uploadProgress[index];
        const fileData = uploadState.files[index];
        const uploadedFile = uploadState.uploadedFiles?.find(
          (f) => f.fileId === fileData.id
        );

        // Check if file was being deleted and actually got deleted
        if (uploadedFile?.objectKey) {
          try {
            // Verify file still exists in R2 by attempting a HEAD request
            const response = await fetch("/api/r2/check-file", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                objectKey: uploadedFile.objectKey,
                bucketName: "datasets",
              }),
            });

            if (!response.ok || !(await response.json()).exists) {
              // File was deleted from R2, remove from UI
              updatedFiles = updatedFiles.filter((f) => f.id !== fileData.id);
              updatedUploadedFiles = updatedUploadedFiles.filter(
                (f) => f.fileId !== fileData.id
              );
              delete updatedProgress[index];
              hasUpdates = true;
              continue;
            }
          } catch (error) {
            // If check fails, assume file still exists to avoid false deletions
          }
        }

        // Check upload status for files that show as uploading
        if (
          progress?.status === "uploading" ||
          progress?.status === "processing"
        ) {
          if (uploadedFile) {
            // File was completed while away, update progress
            updatedProgress[index] = { status: "completed", progress: 100 };
            hasUpdates = true;
          } else {
            // File still needs uploading, resume the upload
            try {
              await processAndUploadFile(fileData.file, index);
            } catch (error) {
              updatedProgress[index] = {
                status: "failed",
                progress: 0,
                error: error.message,
              };
              hasUpdates = true;
            }
          }
        }
      }

      if (hasUpdates) {
        setUploadState((prev) => ({
          ...prev,
          files: updatedFiles,
          uploadedFiles: updatedUploadedFiles,
          uploadProgress: updatedProgress,
        }));
      }
    };

    verifyFileStatus();
  }, []); // Only run on mount

  // Persist upload state to Zustand store whenever it changes
  useEffect(() => {
    // Only update if uploadState has actually changed to prevent infinite loops
    if (JSON.stringify(formData.uploadState) !== JSON.stringify(uploadState)) {
      updateFormField("uploadState", uploadState);
    }
  }, [uploadState, updateFormField, formData.uploadState]);

  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showRemoveAllDialog, setShowRemoveAllDialog] = useState(false);
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [isRemovingAll, setIsRemovingAll] = useState(false);
  const [removingFiles, setRemovingFiles] = useState(new Set()); // Track which files are being removed

  // File processing functions
  const convertHeicToJpeg = async (file) => {
    try {
      // Dynamic import to avoid SSR issues
      const heic2any = (await import("heic2any")).default;

      const convertedBlob = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.9,
      });

      const convertedFile = new File(
        [convertedBlob],
        file.name.replace(/\.(heic|heif)$/i, ".jpg"),
        { type: "image/jpeg" }
      );

      return convertedFile;
    } catch (error) {
      throw new Error(`HEIC conversion failed: ${error.message}`);
    }
  };

  const compressImage = async (file) => {
    try {
      const fileSizeMB = file.size / 1024 / 1024;

      // Only compress if file is above 4MB threshold
      if (file.size <= COMPRESSION_THRESHOLD) {
        return file;
      }

      // Dynamic import to avoid SSR issues
      const imageCompression = (await import("browser-image-compression"))
        .default;

      // Progressive compression approach to maintain quality
      const options = {
        maxSizeMB: 3.8, // Target under 4MB with some buffer
        maxWidthOrHeight: 4096, // Keep higher resolution
        useWebWorker: true,
        initialQuality: 0.92, // Start with high quality
        alwaysKeepResolution: true, // Try to maintain resolution
      };

      // Don't change file type for PNG to preserve transparency
      if (file.type !== "image/png") {
        options.fileType = "image/jpeg";
      }

      let compressedFile = await imageCompression(file, options);

      // If still too large, try with slightly lower quality but maintain resolution
      if (compressedFile.size > COMPRESSION_THRESHOLD) {
        const secondaryOptions = {
          ...options,
          maxSizeMB: 3.5,
          initialQuality: 0.85,
          maxWidthOrHeight: 3840, // Slightly reduce max dimension
        };
        compressedFile = await imageCompression(file, secondaryOptions);
      }

      const compressedSizeMB = compressedFile.size / 1024 / 1024;
      const savings = ((file.size - compressedFile.size) / file.size) * 100;

      return compressedFile;
    } catch (error) {
      return file; // Return original if compression fails
    }
  };

  // Exact copy of applySmartCrop from working ImageUploader
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
            SMART_CROP_TIMEOUT
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
        resolve({ unit: "%", x: 25, y: 25, width: 50, height: 50 }); // Fallback
      }
    });
  };

  const deleteFromR2 = async (objectKey) => {
    try {
      const response = await fetch("/api/r2/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectKey,
          bucketName: "datasets",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete from R2");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const deleteAllFromR2 = async () => {
    try {
      // Extract user_id from any uploaded file's objectKey
      let deletePath = uploadState.currentUUID;

      if (uploadState.uploadedFiles.length > 0) {
        // Get user_id from the first uploaded file's objectKey
        // objectKey format: "user_id/uuid/filename.ext"
        const firstObjectKey = uploadState.uploadedFiles[0].objectKey;
        const pathParts = firstObjectKey.split("/");
        if (pathParts.length >= 2) {
          const userId = pathParts[0];
          deletePath = `${userId}/${uploadState.currentUUID}`;
        }
      }

      const response = await fetch("/api/r2/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deletePath: deletePath,
          bucketName: "datasets",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete all files from R2");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const uploadToR2 = async (file, fileName) => {
    try {
      // Create FormData for server-side upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", `${uploadState.currentUUID}/${fileName}`);

      const response = await fetch("/api/r2/upload", {
        method: "POST",
        body: formData, // Send file directly to server
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload file");
      }

      const { objectKey, sanitizedFileName, originalFileName } =
        await response.json();

      return { objectKey, sanitizedFileName, originalFileName };
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  };

  // Auto-upload function for individual files
  const processAndUploadFile = async (file, index) => {
    try {
      setUploadState((prev) => ({
        ...prev,
        uploadProgress: {
          ...prev.uploadProgress,
          [index]: { status: "processing", progress: 10 },
        },
      }));

      let processedFile = file;

      // Convert HEIC/HEIF to JPEG
      if (file.type === "image/heic" || file.type === "image/heif") {
        processedFile = await convertHeicToJpeg(file);
        setUploadState((prev) => ({
          ...prev,
          uploadProgress: {
            ...prev.uploadProgress,
            [index]: { status: "processing", progress: 30 },
          },
        }));
      }

      // Compress if needed (above 1MB)
      processedFile = await compressImage(processedFile);
      setUploadState((prev) => ({
        ...prev,
        uploadProgress: {
          ...prev.uploadProgress,
          [index]: { status: "uploading", progress: 50 },
        },
      }));

      // Upload to R2
      const { objectKey, sanitizedFileName } = await uploadToR2(
        processedFile,
        processedFile.name
      );

      setUploadState((prev) => ({
        ...prev,
        uploadProgress: {
          ...prev.uploadProgress,
          [index]: { status: "completed", progress: 100 },
        },
        uploadedFiles: [
          ...prev.uploadedFiles,
          {
            objectKey,
            fileName: sanitizedFileName || processedFile.name,
            originalFileName: processedFile.name,
            index,
            fileId: prev.files[index]?.id,
          },
        ],
      }));
    } catch (error) {
      setUploadState((prev) => ({
        ...prev,
        uploadProgress: {
          ...prev.uploadProgress,
          [index]: { status: "failed", progress: 0, error: error.message },
        },
      }));
    }
  };

  // Process image with HEIC conversion support
  const processImage = async (file) => {
    return new Promise(async (resolve) => {
      try {
        let processedFile = file;
        let objectUrl = URL.createObjectURL(file);

        // Convert HEIC/HEIF to JPEG for preview compatibility
        if (file.type === "image/heic" || file.type === "image/heif") {
          try {
            processedFile = await convertHeicToJpeg(file);
            // Create new object URL from converted file for preview
            URL.revokeObjectURL(objectUrl); // Clean up original URL
            objectUrl = URL.createObjectURL(processedFile);
          } catch (conversionError) {
            // Fall back to original file, but mark as having issues
          }
        }

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

        // Use converted file for smart crop if available
        const smartCropResult = await applySmartCrop(processedFile);

        resolve({
          file, // Keep original file for upload
          convertedFile: processedFile, // Store converted file separately
          preview: objectUrl, // Use converted file's URL for preview
          accepted,
          declineReason,
          initialCrop: smartCropResult,
          dimensions: { width: img.width, height: img.height },
        });
      } catch (error) {
        // For HEIC files that fail to process, try conversion first
        if (file.type === "image/heic" || file.type === "image/heif") {
          try {
            const convertedFile = await convertHeicToJpeg(file);
            const objectUrl = URL.createObjectURL(convertedFile);
            resolve({
              file,
              convertedFile,
              preview: objectUrl,
              accepted: true,
              declineReason: "HEIC file converted to JPEG for compatibility",
              initialCrop: { unit: "%", x: 25, y: 25, width: 50, height: 50 },
              dimensions: { width: 1024, height: 1024 }, // Default dimensions
            });
            return;
          } catch (conversionError) {}
        }

        const objectUrl = URL.createObjectURL(file);
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

  // Exact copy of handleCropComplete from working ImageUploader
  const handleCropComplete = useCallback(
    (crop, percentCrop, index) => {
      if (!percentCrop) return;
      const file = uploadState.files[index];
      if (!file) return; // File might have been removed
      const dimensions = file.dimensions || { width: 1024, height: 1024 }; // Default if not set
      const normalizedCrop = normalizeCropData(
        percentCrop,
        dimensions.width,
        dimensions.height
      );
      setUploadState((prev) => ({
        ...prev,
        completedCrops: {
          ...prev.completedCrops,
          [index]: normalizedCrop,
        },
      }));
    },
    [uploadState.files]
  );

  // Drop zone handlers
  const handleDropRejected = useCallback((rejectedFiles) => {
    const errors = rejectedFiles.map(({ file, errors }) => {
      const errorMessages = errors.map((error) => {
        switch (error.code) {
          case "file-too-large":
            return `${file.name}: File too large, Max(${(
              MAX_FILE_SIZE / MB
            ).toFixed(0)} MB)`;
          case "file-invalid-type":
            return `${file.name}: Invalid file type`;
          default:
            return `${file.name}: ${error.message}`;
        }
      });
      return errorMessages.join(", ");
    });

    toast.error(errors.join("; "));
  }, []);

  const handleFileDrop = useCallback(
    async (acceptedFiles) => {
      // Filter out duplicate files
      const uniqueFiles = acceptedFiles.filter((file) => {
        const isDuplicate = isDuplicateFile(file, uploadState.files);
        if (isDuplicate) {
        }
        return !isDuplicate;
      });

      if (uniqueFiles.length === 0) {
        toast.error("Duplicate images were skipped.");
        return;
      }

      if (uploadState.files.length + uniqueFiles.length > MAX_IMAGES) {
        toast.error(
          `Maximum ${MAX_IMAGES} images allowed. ${uniqueFiles.length} new files would exceed the limit.`
        );
        return;
      }

      const duplicateCount = acceptedFiles.length - uniqueFiles.length;
      if (duplicateCount > 0) {
        toast.warning(`${duplicateCount} duplicate file(s) were skipped.`);
      }

      setUploadState((prev) => ({ ...prev, processing: true }));
      toast.success("Processing images...");

      const processedFiles = [];
      for (let i = 0; i < uniqueFiles.length; i++) {
        const file = uniqueFiles[i];

        const processedFile = await processImage(file);
        const fileWithId = {
          ...processedFile,
          id: Date.now() + i,
        };
        processedFiles.push(fileWithId);
      }

      // Add files to state first
      const newUploadState = {
        ...uploadState,
        files: [...uploadState.files, ...processedFiles],
        processing: false,
      };
      setUploadState(newUploadState);
      toast.dismiss(); // Dismiss the processing toast

      // Auto-upload each file immediately after adding to state
      setTimeout(async () => {
        const currentFileCount = uploadState.files.length;
        for (let i = 0; i < processedFiles.length; i++) {
          const fileData = processedFiles[i];
          const fileIndex = currentFileCount + i; // Use current count before adding new files

          try {
            await processAndUploadFile(fileData.file, fileIndex);
          } catch (error) {
            // Update progress to show failed state
            setUploadState((prev) => ({
              ...prev,
              uploadProgress: {
                ...prev.uploadProgress,
                [fileIndex]: {
                  status: "failed",
                  progress: 0,
                  error: error.message,
                },
              },
            }));
          }
        }
      }, 100); // Small delay to ensure state is updated
    },
    [uploadState.files.length, uploadState.uploadedFiles, formData.uploadState]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED_TYPES,
    maxFiles: MAX_IMAGES,
    maxSize: MAX_FILE_SIZE,
    onDrop: handleFileDrop,
    onDropRejected: handleDropRejected,
  });

  const removeFile = async (fileId) => {
    // Find the file index in the files array (move outside try block)
    const fileIndex = uploadState.files.findIndex((f) => f.id === fileId);

    // Add to removing files set
    setRemovingFiles((prev) => new Set([...prev, fileId]));

    try {
      // Find the uploaded file using the fileId instead of index
      const uploadedFile = uploadState.uploadedFiles.find(
        (f) => f.fileId === fileId
      );

      if (uploadedFile && uploadedFile.objectKey) {
        try {
          await deleteFromR2(uploadedFile.objectKey);

          // Immediately update state after successful deletion
          const newUploadState = {
            ...uploadState,
            files: uploadState.files.filter((f) => f.id !== fileId),
            uploadedFiles: uploadState.uploadedFiles.filter(
              (f) => f.fileId !== fileId
            ),
            completedCrops: Object.fromEntries(
              Object.entries(uploadState.completedCrops).filter(
                ([key]) => parseInt(key) !== fileIndex
              )
            ),
            uploadProgress: Object.fromEntries(
              Object.entries(uploadState.uploadProgress).filter(
                ([key]) => parseInt(key) !== fileIndex
              )
            ),
          };
          setUploadState(newUploadState);
        } catch (error) {
          toast.error("Failed to delete file. Please try again.");
          // Don't update state if deletion failed
          return;
        }
      } else {
        // File not uploaded yet, just remove from UI
        const newUploadState = {
          ...uploadState,
          files: uploadState.files.filter((f) => f.id !== fileId),
          uploadedFiles: uploadState.uploadedFiles.filter(
            (f) => f.fileId !== fileId
          ),
          completedCrops: Object.fromEntries(
            Object.entries(uploadState.completedCrops).filter(
              ([key]) => parseInt(key) !== fileIndex
            )
          ),
          uploadProgress: Object.fromEntries(
            Object.entries(uploadState.uploadProgress).filter(
              ([key]) => parseInt(key) !== fileIndex
            )
          ),
        };
        setUploadState(newUploadState);
      }
    } finally {
      // Remove from removing files set
      setRemovingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  const removeAllFiles = async () => {
    setIsRemovingAll(true);

    try {
      await deleteAllFromR2();

      const newUploadState = {
        ...uploadState,
        files: [],
        uploadedFiles: [],
        completedCrops: {},
        uploadProgress: {},
      };
      setUploadState(newUploadState);

      toast.success("All files removed successfully!");
    } catch (error) {
      toast.error("Failed to remove all files. Please try again.");
    } finally {
      setIsRemovingAll(false);
      setShowRemoveAllDialog(false);
    }
  };

  const handleCreateStudio = async () => {
    if (localSubmitting || isSubmitting) return;

    // Validate that we have uploaded files
    if (uploadState.files.length < MIN_IMAGES) {
      toast.error(`Please upload at least ${MIN_IMAGES} images`);
      return;
    }

    setLocalSubmitting(true);
    setIsSubmitting(true);

    try {
      const contextType = selectedContext?.type || "personal";
      const selectedPlan = formData.plan;

      // Check if user has credits for the selected plan
      const hasCredits = hasSufficientCredits(credits, selectedPlan, 1);

      // Check if all files are uploaded
      const failedUploads = Object.entries(uploadState.uploadProgress).filter(
        ([_, progress]) => progress.status === "failed"
      );

      if (failedUploads.length > 0) {
        toast.error(
          "Some files failed to upload. Please retry failed uploads."
        );
        return;
      }

      if (uploadState.uploadedFiles.length !== uploadState.files.length) {
        toast.error(
          "Upload in progress. Please wait for all files to complete."
        );
        return;
      }

      toast.success("Finalizing...");

      // Create crop data map
      const cropDataMap = {};
      uploadState.files.forEach((fileData, index) => {
        const cropData = uploadState.completedCrops[index] ||
          fileData.initialCrop || {
            unit: "%",
            x: 25,
            y: 25,
            width: 50,
            height: 50,
          };
        const uploadedFile = uploadState.uploadedFiles.find(
          (f) => f.index === index
        );

        if (uploadedFile && cropData) {
          cropDataMap[uploadedFile.fileName] = cropData;
        }
      });

      // Ensure we have crop data
      if (Object.keys(cropDataMap).length === 0) {
        uploadState.uploadedFiles.forEach((uploadedFile) => {
          cropDataMap[uploadedFile.fileName] = {
            unit: "%",
            x: 25,
            y: 25,
            width: 50,
            height: 50,
          };
        });
      }

      // Upload crop data as single JSON file
      const cropJsonBlob = new Blob([JSON.stringify(cropDataMap, null, 2)], {
        type: "application/json",
      });

      await uploadToR2(cropJsonBlob, "focus_data.json");

      // For personal accounts without credits, redirect to payment
      if (contextType === "personal" && !hasCredits) {
        await handlePaymentFlow(selectedPlan);
        return;
      }

      toast.success("Creating your studio...");

      // Extract user_id from uploaded files to create full path
      let imagesPath = uploadState.currentUUID;

      if (uploadState.uploadedFiles.length > 0) {
        // Get user_id from the first uploaded file's objectKey
        // objectKey format: "user_id/uuid/filename.ext"
        const firstObjectKey = uploadState.uploadedFiles[0].objectKey;
        const pathParts = firstObjectKey.split("/");
        if (pathParts.length >= 2) {
          const userId = pathParts[0];
          imagesPath = `${userId}/${uploadState.currentUUID}`;
        }
      }

      // Determine context from selectedContext
      const context =
        selectedContext?.type === "organization" ? "organization" : "personal";

      const updatedFormData = {
        ...formData,
        studioID: uploadState.currentUUID, // Add the studio ID
        images: imagesPath, // Now includes user_id prefix
        context, // Add context based on selectedContext
        organization_id:
          selectedContext?.type === "organization" ? selectedContext.id : null, // Add organization_id when context is organization
      };

      // Get authenticated user ID from Supabase
      const createSupabaseBrowserClient = (
        await import("@/lib/supabase/browser-client")
      ).default;
      const supabase = createSupabaseBrowserClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }
      // Call studio creation API directly
      const response = await fetch("/api/studio/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studioData: updatedFormData,
        }),
      });

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        throw new Error(result?.error || `Server error: ${response.status}`);
      }

      if (result?.success) {
        toast.success("Studio created successfully!");
        router.push(`/studio/${result.studioId}`);
      } else {
        throw new Error(result?.error || "Failed to create studio");
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLocalSubmitting(false);
      setIsSubmitting(false);
    }
  };

  const handlePaymentFlow = async (selectedPlan) => {
    try {
      // Get authenticated user ID from Supabase
      const createSupabaseBrowserClient = (
        await import("@/lib/supabase/browser-client")
      ).default;
      const supabase = createSupabaseBrowserClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      toast.success("Creating studio...");

      // Use authenticated user ID to create full path
      const userId = user.id;
      const imagesPath = `${userId}/${uploadState.currentUUID}`;

      // Determine context from selectedContext
      const context =
        selectedContext?.type === "organization" ? "organization" : "personal";

      const updatedFormData = {
        ...formData,
        studioID: uploadState.currentUUID, // Add the studio ID
        images: imagesPath, // Now includes user_id prefix
        context, // Add context based on selectedContext
        organization_id:
          selectedContext?.type === "organization" ? selectedContext.id : null, // Add organization_id when context is organization
      };

      // Create PAYMENT_PENDING studio record
      const response = await fetch("/api/studio/create-pending", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studioData: updatedFormData,
        }),
      });

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        throw new Error(result?.error || `Server error: ${response.status}`);
      }

      if (!result?.success) {
        throw new Error(result?.error || "Failed to create studio record");
      }

      toast.success("Redirecting to payment...");

      // Create checkout URL with only studio ID as custom data (user auth handled server-side)
      const checkoutUrl = await createCheckoutUrl(
        selectedPlan,
        1, // quantity
        {
          studio_id: uploadState.currentUUID,
          source: "studio_create",
        },
        `${window.location.origin}/studio/${uploadState.currentUUID}?payment=success`
      );

      if (checkoutUrl) {
        // Redirect to checkout
        window.location.href = checkoutUrl;
      } else {
        throw new Error("Failed to create checkout URL");
      }
    } catch (error) {
      toast.error(`Payment error: ${error.message}`);
      setLocalSubmitting(false);
      setIsSubmitting(false);
    }
  };

  // Check if user has credits for the selected plan
  const hasCreditsForPlan = () => {
    const contextType = selectedContext?.type || "personal";
    const selectedPlan = formData.plan;

    if (contextType === "organization" && isOrgWithTeamCredits) {
      return true; // Organization with team credits
    }

    return hasSufficientCredits(credits, selectedPlan, 1);
  };

  // Check if any files are currently uploading
  const isAnyFileUploading = () => {
    return Object.values(uploadState.uploadProgress).some(
      (progress) => progress.status === "processing" || progress.status === "uploading"
    );
  };

  // Get uploading progress info
  const getUploadingInfo = () => {
    const uploadingFiles = Object.values(uploadState.uploadProgress).filter(
      (progress) => progress.status === "processing" || progress.status === "uploading"
    );
    return {
      count: uploadingFiles.length,
      isUploading: uploadingFiles.length > 0
    };
  };

  // Get minimum images feedback
  const getMinImagesInfo = () => {
    const currentCount = uploadState.files.length;
    const needed = Math.max(0, MIN_IMAGES - currentCount);
    return {
      current: currentCount,
      needed,
      hasMinimum: currentCount >= MIN_IMAGES
    };
  };

  const breakpointColumns = {
    default: 3,
    1100: 2,
    700: 1,
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Upload photos</h2>
        <p className="text-muted-foreground">
          Upload at least {MIN_IMAGES} photos with good variation in outfits,
          lighting, and backgrounds. Each photo should focus on the upper half
          of your body.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <Dialog open={showGuidelines} onOpenChange={setShowGuidelines}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm" className="rounded-lg">
              <Info className="h-4 w-4 mr-2" />
              Photo Guidelines
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl md:max-w-5xl w-[min(100vw-2rem,80rem)] max-h-[85vh] overflow-y-auto rounded-xl p-0">
            <ImageUploadGuidelines />
          </DialogContent>
        </Dialog>
        <Dialog
          open={showRemoveAllDialog}
          onOpenChange={setShowRemoveAllDialog}
        >
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              className="rounded-lg"
              disabled={
                isRemovingAll ||
                uploadState.files.length === 0 ||
                uploadState.uploading ||
                uploadState.processing ||
                isSubmitting
              }
            >
              {isRemovingAll ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {isRemovingAll ? "Removing..." : "Remove All"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove All Photos</DialogTitle>
              <DialogDescription>
                This will remove all uploaded photos from both your session and
                cloud storage. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRemoveAllDialog(false)}
                disabled={isRemovingAll}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={removeAllFiles}
                disabled={isRemovingAll}
              >
                {isRemovingAll ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  "Remove All"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {uploadState.files.length === 0 ? (
        <div
          {...getRootProps()}
          className={`rounded-xl border border-dashed border-muted-foreground/25 p-8 text-center cursor-crosshair hover:cursor-crosshair transition-colors shadow-sm bg-primary/10 ${
            isDragActive
              ? "border-primary/50 bg-primary/20 ring-1 ring-primary/20"
              : "hover:border-primary/50 hover:bg-primary/20"
          }`}
        >
          <input {...getInputProps()} />
          <Image
            src="/images/upload_photos.svg"
            alt="Add files"
            width={96}
            height={96}
            className="h-24 w-24 mx-auto mb-4 opacity-80"
          />
          <h3 className="text-lg font-semibold mb-2">
            {isDragActive ? "Drop your photos here" : "Upload your photos"}
          </h3>
          <p className="text-muted-foreground mb-4">
            Drag and drop your photos here, or click to browse
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Supported formats: JPG, JPEG, PNG, HEIC, HEIF</p>
            <p>• Maximum file size: 4MB per image</p>
            <p>• Upload at least {MIN_IMAGES} photos for best results</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* <div className="flex items-center justify-between rounded-xl p-3 sm:p-4 bg-muted/30 ring-1 ring-muted-foreground/15 shadow-sm">
            <div className="space-y-1">
              <p className="font-medium">
                {uploadState.files.length} photo
                {uploadState.files.length !== 1 ? "s" : ""} ready
              </p>
              <p className="text-sm text-muted-foreground">
                {uploadState.uploadedFiles.length} uploaded •{" "}
                {uploadState.files.length - uploadState.uploadedFiles.length}{" "}
                pending
              </p>
            </div>
            <div className="flex gap-2"></div>
          </div> */}
          <Separator className="my-4" />
          <Masonry
            breakpointCols={breakpointColumns}
            className="flex w-auto -ml-4"
            columnClassName="pl-4 bg-clip-padding"
          >
            {uploadState.files.map((fileData, index) => {
              const progress = uploadState.uploadProgress[index];
              // Check if file is uploaded by looking at uploadedFiles array
              const uploadedFile = uploadState.uploadedFiles?.find(
                (f) => f.fileId === fileData.id
              );
              const isUploaded = uploadedFile
                ? true
                : progress?.status === "completed";
              const isFailed = progress?.status === "failed";
              const isUploading =
                !isUploaded &&
                !isFailed &&
                (progress?.status === "uploading" ||
                  progress?.status === "processing");
              const isRemoving = removingFiles.has(fileData.id);

              return (
                <Card
                  key={fileData.id}
                  className={`mb-4 rounded-xl ring-1 ring-muted-foreground/15 ${
                    isUploading ? "animate-pulse" : ""
                  }`}
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      {/* Upload Status Badge */}
                      {(isUploading || isUploaded || isFailed) && (
                        <div className="absolute top-2 left-2 z-10">
                          {isFailed && (
                            <div className="bg-destructive text-white px-2 py-1 rounded-xl text-xs flex items-center gap-1">
                              <X className="h-3 w-3" />
                              Failed
                            </div>
                          )}
                          {isUploaded && (
                            <div className="pointer-events-none bg-success text-white p-1 rounded-xl text-xs flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                            </div>
                          )}
                          {isUploading && (
                            <div className="bg-primary text-white px-2 py-1 rounded-xl text-xs flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Uploading
                            </div>
                          )}
                        </div>
                      )}

                      {/* Remove Button */}
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute rounded-full top-0 right-0 translate-x-1/2 -translate-y-1/2 z-10 size-5 p-0"
                        onClick={() => removeFile(fileData.id)}
                        disabled={isRemoving || isUploading || isSubmitting}
                      >
                        {isRemoving ? (
                          <Loader2 className="size-4 text-white" />
                        ) : (
                          <X className="size-2" />
                        )}
                      </Button>

                      {/* ReactCrop - now unobstructed */}
                      <ReactCrop
                        crop={
                          uploadState.completedCrops[index] ||
                          fileData.initialCrop || {
                            unit: "%",
                            x: 25,
                            y: 25,
                            width: 50,
                            height: 50,
                          }
                        }
                        onChange={(c, pc) => handleCropComplete(c, pc, index)}
                        onComplete={(c, pc) => handleCropComplete(c, pc, index)}
                        aspect={CROP_ASPECT}
                        className="max-w-full h-auto"
                        minWidth={100}
                        minHeight={100}
                        keepSelection={true}
                        ruleOfThirds={true}
                        disabled={isUploading} // Disable cropping while uploading
                        locked={false}
                        aria-label="Crop image"
                      >
                        <Image
                          src={fileData.preview}
                          alt={`Preview ${index + 1}`}
                          width={400}
                          height={400}
                          className={`w-full h-auto object-cover ${
                            isUploading ? "opacity-70" : ""
                          }`}
                          unoptimized={true}
                        />
                      </ReactCrop>

                      {/* Retry Button for Failed Uploads */}
                      {isFailed && (
                        <div className="absolute bottom-1/2 left-1/2 z-10 -translate-x-1/2 translate-y-1/2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() =>
                              processAndUploadFile(fileData.file, index)
                            }
                            className="text-xs"
                            disabled={isUploading || isSubmitting}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Retry
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="p-3 space-y-2">
                      <p
                        className="text-sm font-medium truncate"
                        title={fileData.file?.name || "Unknown file"}
                      >
                        {fileData.file?.name?.length > 25
                          ? `${fileData.file.name.slice(
                              0,
                              15
                            )}...${fileData.file.name.slice(-7)}`
                          : fileData.file?.name || "Unknown file"}
                      </p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {(fileData.file?.size / 1048576).toFixed(2) || "0.00"}{" "}
                          MB
                        </span>
                        {fileData.dimensions && (
                          <span>
                            {fileData.dimensions.width} ×{" "}
                            {fileData.dimensions.height}
                          </span>
                        )}
                      </div>

                      {fileData.declineReason && (
                        <p className="text-xs text-amber-600">
                          {fileData.declineReason}
                        </p>
                      )}

                      {progress?.error && (
                        <p className="text-xs text-red-600">{progress.error}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </Masonry>

          <div
            {...getRootProps()}
            className="rounded-xl border border-dashed border-muted-foreground/25 p-4 text-center cursor-crosshair hover:cursor-crosshair hover:border-primary/40 transition-colors bg-primary/10"
          >
            <input {...getInputProps()} />
            <Image
              src="/images/upload_photos.svg"
              alt="Add files"
              width={48}
              height={48}
              className="h-12 w-12 mx-auto mb-2 opacity-80"
            />
            <p className="text-sm">
              Add more photos (up to {MAX_IMAGES} total)
            </p>
          </div>
        </div>
      )}

      {/* Minimum Images Feedback */}
      {!getMinImagesInfo().hasMinimum && (
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Please upload {getMinImagesInfo().needed} more image{getMinImagesInfo().needed !== 1 ? 's' : ''} to proceed. 
            You currently have {getMinImagesInfo().current} of {MIN_IMAGES} required images.
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Progress Feedback */}
      {isAnyFileUploading() && (
        <Alert className="mb-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Uploading {getUploadingInfo().count} image{getUploadingInfo().count !== 1 ? 's' : ''}... 
            Please wait for uploads to complete before proceeding.
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex flex-col items-center space-y-3">
        <StepNavigation
          onNext={handleCreateStudio}
          onPrevious={prevStep}
          nextDisabled={
            uploadState.files.length < MIN_IMAGES ||
            uploadState.uploading ||
            uploadState.uploadedFiles.length !== uploadState.files.length ||
            localSubmitting ||
            isRemovingAll ||
            removingFiles.size > 0 ||
            isAnyFileUploading()
          }
          nextText={
            localSubmitting
              ? hasCreditsForPlan()
                ? "Creating..."
                : "Processing Payment..."
              : isAnyFileUploading()
              ? `Uploading... (${getUploadingInfo().count} remaining)`
              : hasCreditsForPlan()
              ? "Create Headshots"
              : "Pay and Create"
          }
          isSubmitting={localSubmitting}
        />
      </div>
    </div>
  );
};

export default ImageUploadStep;
