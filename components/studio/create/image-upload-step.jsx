"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
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
  CloudUpload,
} from "lucide-react";

import useStudioCreateStore from "@/stores/studioCreateStore";
import { createCheckoutUrl } from "@/lib/checkout";
import { hasSufficientCredits } from "@/services/creditService";
import ImageUploadGuidelines from "@/components/studio/create/image-upload-guidelines";
import StepNavigation from "@/components/studio/create/step-navigation";
import UniversalLoader from "@/components/shared/universal-loader";
import { Separator } from "@/components/ui/separator";
import { studioMonitoring, uxMonitoring, uploadMonitoring } from "@/lib/monitoring";

// Constants

const MB = 1024 * 1024;
const MAX_FILE_SIZE = 25 * MB;
const MAX_IMAGES = 20;
const MIN_IMAGES = 8;
const CROP_DIMENSION = 1024;
const CROP_ASPECT = 1;
const MIN_IMAGE_DIMENSION = 256;
const SMART_CROP_TIMEOUT = 600000; // TIME TO LOAD SMARTCROP
const BLOB_REVOKE_DELAY = 100; // Delay before revoking blob URLs (ms)
const PREVIEW_MAX_DIMENSION = 800; // Max dimension for preview thumbnails (reduces memory)
const PREVIEW_QUALITY = 0.85; // JPEG quality for preview thumbnails
const ACCEPTED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/heic": [".heic"],
  "image/heif": [".heif"],
};

const getRelativeObjectKey = (objectKey, fallbackName = "") => {
  if (!objectKey) {
    return fallbackName;
  }

  const parts = objectKey.split("/");
  if (parts.length > 1) {
    return parts.slice(1).join("/");
  }

  return objectKey;
};

// Helper function to normalize crop data
const normalizeCropData = (crop) => {
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

// Create compressed thumbnail for preview to reduce memory usage
const createCompressedPreview = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.onload = () => {
        // Calculate scaled dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > PREVIEW_MAX_DIMENSION || height > PREVIEW_MAX_DIMENSION) {
          if (width > height) {
            height = (height / width) * PREVIEW_MAX_DIMENSION;
            width = PREVIEW_MAX_DIMENSION;
          } else {
            width = (width / height) * PREVIEW_MAX_DIMENSION;
            height = PREVIEW_MAX_DIMENSION;
          }
        }
        
        // Create canvas and compress
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedUrl = URL.createObjectURL(blob);
              resolve(compressedUrl);
            } else {
              reject(new Error('Failed to create compressed preview'));
            }
          },
          'image/jpeg',
          PREVIEW_QUALITY
        );
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

const ImageUploadStep = ({
  selectedContext,
  credits,
  isOrgWithTeamCredits,
}) => {
  const router = useRouter();
  const { formData, isSubmitting, setIsSubmitting, prevStep, resetStore } =
    useStudioCreateStore();

  // Initialize upload state - always starts fresh (no persistence)
  const [uploadState, setUploadState] = useState({
    files: [],
    uploading: false,
    uploadProgress: {},
    uploadedFiles: [],
    currentUUID: uuidv4(),
    completedCrops: {},
    processing: false,
  });
  const heicConversionQueueRef = useRef([]);
  const isMountedRef = useRef(true);
  const uploadSessionRef = useRef(null); // Track current upload session for monitoring
  const uploadStartTimeRef = useRef({}); // Track start times for each file upload

  // Check if there are active uploads
  const hasActiveUploads = useCallback(() => {
    return Object.values(uploadState.uploadProgress).some(
      (progress) => progress.status === "uploading" || progress.status === "converting"
    );
  }, [uploadState.uploadProgress]);

  // Check if all uploads are completed
  const hasCompletedUploads = useCallback(() => {
    return uploadState.files.length > 0 && 
           uploadState.uploadedFiles.length === uploadState.files.length;
  }, [uploadState.files.length, uploadState.uploadedFiles.length]);

  // Cleanup blob URLs on component unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      
      // Revoke all blob URLs when component unmounts
      // Use functional state update to access latest files
      setUploadState((prev) => {
        prev.files.forEach((file) => {
          if (file.preview && file.preview.startsWith('blob:')) {
            URL.revokeObjectURL(file.preview);
          }
        });
        return prev; // Return unchanged state
      });
    };
  }, []); // Empty deps = only runs on mount/unmount

  const [showGuidelines, setShowGuidelines] = useState(true); // Open by default on mount
  const [showRemoveAllDialog, setShowRemoveAllDialog] = useState(false);
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [isRemovingAll, setIsRemovingAll] = useState(false);
  const [removingFiles, setRemovingFiles] = useState(new Set()); // Track which files are being removed
  const [isConvertingHeic, setIsConvertingHeic] = useState(false);
  const [showNavigationWarning, setShowNavigationWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  // Handle navigation with blocking and warnings
  const handlePreviousStep = useCallback(() => {
    // Block navigation during active uploads
    if (hasActiveUploads()) {
      toast.error("Please wait for uploads to complete before navigating.");
      return;
    }

    // Warn about re-upload when navigating after completion
    if (hasCompletedUploads()) {
      setPendingNavigation("previous");
      setShowNavigationWarning(true);
      return;
    }

    // No uploads or warnings needed, navigate normally
    prevStep();
  }, [hasActiveUploads, hasCompletedUploads, prevStep]);

  // Confirm navigation and reset state
  const handleConfirmNavigation = useCallback(() => {
    // Revoke all blob URLs before resetting state
    uploadState.files.forEach((file) => {
      if (file.preview && file.preview.startsWith('blob:')) {
        URL.revokeObjectURL(file.preview);
      }
    });

    // Reset upload state with fresh UUID
    setUploadState({
      files: [],
      uploading: false,
      uploadProgress: {},
      uploadedFiles: [],
      currentUUID: uuidv4(),
      completedCrops: {},
      processing: false,
    });

    // Note: uploadState not in Zustand store (no-persistence strategy)

    // Close dialog
    setShowNavigationWarning(false);

    // Execute pending navigation
    if (pendingNavigation === "previous") {
      prevStep();
    }

    setPendingNavigation(null);
  }, [pendingNavigation, prevStep, uploadState.files]);

  // Cancel navigation
  const handleCancelNavigation = useCallback(() => {
    setShowNavigationWarning(false);
    setPendingNavigation(null);
  }, []);

  // Convert HEIC to JPEG with auto-retry (on main thread, but sequential with delays)
  const convertHeicToJpeg = async (file, retryCount = 0) => {
    const MAX_RETRIES = 2;
    
    try {
      const heic2any = (await import("heic2any")).default;

      const convertedBlob = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.92,
      });

      const finalBlob = Array.isArray(convertedBlob) 
        ? convertedBlob[0] 
        : convertedBlob;

      const convertedFile = new File(
        [finalBlob],
        file.name.replace(/\.(heic|heif)$/i, ".jpg"),
        { type: "image/jpeg" }
      );

      return convertedFile;
    } catch (error) {
      // Auto-retry on failure (helps with dynamic import issues and memory pressure)
      if (retryCount < MAX_RETRIES) {
        // Log retry attempt to Sentry
        uploadMonitoring.heicConversionRetry(
          uploadSessionRef.current,
          file.name,
          retryCount + 1,
          MAX_RETRIES,
          error.message
        );
        // Wait before retry (exponential backoff: 500ms, 1000ms)
        await new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1)));
        return convertHeicToJpeg(file, retryCount + 1);
      }
      throw new Error(`HEIC conversion failed after ${MAX_RETRIES + 1} attempts: ${error.message}`);
    }
  };

  // Process HEIC queue sequentially
  const processHeicQueue = async () => {
    if (isConvertingHeic || heicConversionQueueRef.current.length === 0) {
      return;
    }

    setIsConvertingHeic(true);

    while (heicConversionQueueRef.current.length > 0) {
      const { file, fileId } = heicConversionQueueRef.current.shift();
      const conversionStartTime = Date.now();
      
      // Track HEIC conversion start
      uploadMonitoring.heicConversionStarted(uploadSessionRef.current, fileId, file.name);

      try {
        // Convert HEIC to JPEG
        const jpegFile = await convertHeicToJpeg(file);
        
        // Track HEIC conversion completed
        uploadMonitoring.heicConversionCompleted(
          uploadSessionRef.current, 
          fileId, 
          file.name, 
          Date.now() - conversionStartTime
        );

        // Load converted image to get dimensions and run SmartCrop
        const tempUrl = URL.createObjectURL(jpegFile);
        const img = await createImagePromise(tempUrl);
        URL.revokeObjectURL(tempUrl); // Clean up temporary URL immediately after loading
        const smartCropResult = await applySmartCrop(jpegFile);

        // Create compressed preview URL for the converted file (reduces memory)
        const previewUrl = await createCompressedPreview(jpegFile).catch(() => URL.createObjectURL(jpegFile));

        // Update file in state with converted version and proper preview
        setUploadState((prev) => ({
          ...prev,
          files: prev.files.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  file: jpegFile,
                  preview: previewUrl,
                  isConverting: false,
                  initialCrop: smartCropResult,
                  dimensions: { width: img.width, height: img.height },
                }
              : f
          ),
        }));

        // Start upload for this file
        await processAndUploadFile(jpegFile, fileId);

        // Small delay to let UI breathe
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to convert HEIC ${fileId}:`, error);
        
        // Track HEIC conversion failure
        uploadMonitoring.heicConversionFailed(uploadSessionRef.current, fileId, file.name, error);
        
        toast.error(`Failed to convert HEIC: ${error.message}`);
        setUploadState((prev) => ({
          ...prev,
          uploadProgress: {
            ...prev.uploadProgress,
            [fileId]: { status: 'failed', progress: 0, error: error.message },
          },
        }));
      }
    }

    setIsConvertingHeic(false);
  };

  // Queue HEIC file for conversion
  const queueHeicConversion = (file, fileId) => {
    heicConversionQueueRef.current.push({ file, fileId });
    processHeicQueue();
  };

  // Get presigned URL for direct R2 upload
  const getPresignedUrl = async (fileName, fileType, fileId) => {
    const startTime = Date.now();
    uploadMonitoring.presignedUrlRequested(uploadSessionRef.current, fileId, fileName);
    
    let response;
    try {
      response = await fetch('/api/r2/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          fileType,
          studioId: uploadState.currentUUID,
        }),
      });
    } catch (fetchError) {
      // Network error (offline, DNS failure, etc.)
      uploadMonitoring.presignedUrlFailed(uploadSessionRef.current, fileId, fileName, fetchError, 'NETWORK_ERROR');
      throw new Error(`Network error getting presigned URL: ${fetchError.message}`);
    }

    // Session expiry detection
    if (response.status === 401) {
      uploadMonitoring.presignedUrlFailed(uploadSessionRef.current, fileId, fileName, new Error('Session expired'), 401);
      toast.error("Your session has expired. Please login again.");
      router.push(`/auth`);
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || 'Failed to get presigned URL');
      uploadMonitoring.presignedUrlFailed(uploadSessionRef.current, fileId, fileName, error, response.status);
      throw error;
    }

    const data = await response.json();
    uploadMonitoring.presignedUrlReceived(uploadSessionRef.current, fileId, fileName, Date.now() - startTime);
    return data;
  };

  // Upload file directly to R2 using presigned URL
  const uploadDirectToR2 = async (presignedUrl, file, fileId) => {
    const startTime = Date.now();
    uploadMonitoring.r2UploadStarted(uploadSessionRef.current, fileId, file.name, file.size);
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      let lastLoggedProgress = 0;

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadState((prev) => ({
            ...prev,
            uploadProgress: {
              ...prev.uploadProgress,
              [fileId]: { status: 'uploading', progress },
            },
          }));
          
          // Log progress at 50% milestone
          if (progress >= 50 && lastLoggedProgress < 50) {
            uploadMonitoring.r2UploadProgress(uploadSessionRef.current, fileId, file.name, 50);
            lastLoggedProgress = 50;
          }
        }
      });

      xhr.addEventListener('load', () => {
        const durationMs = Date.now() - startTime;
        if (xhr.status === 200) {
          uploadMonitoring.r2UploadCompleted(uploadSessionRef.current, fileId, file.name, file.size, durationMs);
          resolve();
        } else {
          const error = new Error(`Upload failed with status ${xhr.status}`);
          uploadMonitoring.r2UploadFailed(uploadSessionRef.current, fileId, file.name, file.size, error, xhr.status, xhr.statusText, durationMs);
          reject(error);
        }
      });

      xhr.addEventListener('error', () => {
        const durationMs = Date.now() - startTime;
        const error = new Error('Upload failed - network error');
        uploadMonitoring.r2UploadFailed(uploadSessionRef.current, fileId, file.name, file.size, error, 0, 'Network Error', durationMs);
        reject(error);
      });

      xhr.addEventListener('abort', () => {
        const durationMs = Date.now() - startTime;
        const error = new Error('Upload aborted');
        uploadMonitoring.r2UploadFailed(uploadSessionRef.current, fileId, file.name, file.size, error, 0, 'Aborted', durationMs);
        reject(error);
      });

      xhr.addEventListener('timeout', () => {
        const durationMs = Date.now() - startTime;
        const error = new Error('Upload timed out');
        uploadMonitoring.r2UploadFailed(uploadSessionRef.current, fileId, file.name, file.size, error, 0, 'Timeout', durationMs);
        reject(error);
      });

      xhr.open('PUT', presignedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  };

  // Apply SmartCrop to find best crop area
  const applySmartCrop = async (file) => {
    let objectUrl = null;
    try {
      objectUrl = URL.createObjectURL(file);
      const img = await createImagePromise(objectUrl);

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

      if (!result || !result.topCrop) {
        throw new Error("Smart crop failed to generate valid crop data");
      }

      const crop = {
        x: (result.topCrop.x / img.width) * 100,
        y: (result.topCrop.y / img.height) * 100,
        width: (result.topCrop.width / img.width) * 100,
        height: (result.topCrop.height / img.height) * 100,
        unit: "%",
      };
      
      return crop;
    } catch (error) {
      // Return fallback crop on any error
      return { unit: "%", x: 25, y: 25, width: 50, height: 50 };
    } finally {
      // Always clean up blob URL
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    }
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

  // Upload to R2 via API route (used for focus_data.json) with retry logic
  const uploadToR2 = async (file, fileName, retryCount = 0) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 1000; // 1 second base delay
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", `${uploadState.currentUUID}/${fileName}`);

      const response = await fetch("/api/r2/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload file");
      }

      const { objectKey, sanitizedFileName, originalFileName } =
        await response.json();

      return { objectKey, sanitizedFileName, originalFileName };
    } catch (error) {
      // Check if we should retry (network errors)
      const isNetworkError = 
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('Network') ||
        error.message?.includes('network') ||
        error.message?.includes('timeout') ||
        (typeof navigator !== 'undefined' && !navigator.onLine);
      
      if (isNetworkError && retryCount < MAX_RETRIES) {
        // Log retry attempt
        console.warn(`[uploadToR2] Retry ${retryCount + 1}/${MAX_RETRIES} for ${fileName}:`, error.message);
        
        // Wait with exponential backoff before retry
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (retryCount + 1)));
        
        // Recursive retry
        return uploadToR2(file, fileName, retryCount + 1);
      }
      
      throw new Error(`Upload failed: ${error.message}`);
    }
  };

  // Upload file directly to R2 using presigned URL with auto-retry
  const processAndUploadFile = async (file, fileId, isManualRetry = false, autoRetryCount = 0) => {
    const MAX_AUTO_RETRIES = 2;
    
    // Track retry attempts
    if (isManualRetry || autoRetryCount > 0) {
      const totalRetries = (uploadStartTimeRef.current[`${fileId}_retries`] || 0) + 1;
      uploadStartTimeRef.current[`${fileId}_retries`] = totalRetries;
      uploadMonitoring.retryAttempted(uploadSessionRef.current, fileId, file.name, totalRetries);
    }
    
    // Track start time for this file
    uploadStartTimeRef.current[fileId] = Date.now();
    uploadMonitoring.processingStarted(uploadSessionRef.current, fileId, file.name, file.size, file.type);
    
    try {
      setUploadState((prev) => ({
        ...prev,
        uploadProgress: {
          ...prev.uploadProgress,
          [fileId]: { status: "preparing", progress: 5 },
        },
      }));

      // Get presigned URL (now with fileId for tracking)
      const { presignedUrl, objectKey, sanitizedFileName } = await getPresignedUrl(
        file.name,
        file.type,
        fileId
      );

      setUploadState((prev) => ({
        ...prev,
        uploadProgress: {
          ...prev.uploadProgress,
          [fileId]: { status: "uploading", progress: 10 },
        },
      }));

      // Upload directly to R2
      await uploadDirectToR2(presignedUrl, file, fileId);

      setUploadState((prev) => {
        // Safety check: only add to uploadedFiles if file still exists in files array
        const fileStillExists = prev.files.some(f => f.id === fileId);
        
        if (!fileStillExists) {
          // File was removed during upload, clean up uploadProgress and don't add to uploadedFiles
          const { [fileId]: _removed, ...remainingProgress } = prev.uploadProgress;
          return {
            ...prev,
            uploadProgress: remainingProgress,
          };
        }
        
        // Check if already in uploadedFiles (prevent duplicates)
        const alreadyUploaded = prev.uploadedFiles.some(f => f.fileId === fileId);
        
        return {
          ...prev,
          uploadProgress: {
            ...prev.uploadProgress,
            [fileId]: { status: "completed", progress: 100 },
          },
          uploadedFiles: alreadyUploaded 
            ? prev.uploadedFiles 
            : [
                ...prev.uploadedFiles,
                {
                  objectKey,
                  fileName: sanitizedFileName || file.name,
                  originalFileName: file.name,
                  fileId,
                },
              ],
        };
      });
    } catch (error) {
      // Check if we should auto-retry (only for network-related errors)
      const isNetworkError = 
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('Network') ||
        error.message?.includes('network') ||
        error.message?.includes('timeout') ||
        error.message?.includes('aborted') ||
        (typeof navigator !== 'undefined' && !navigator.onLine);
      
      if (isNetworkError && autoRetryCount < MAX_AUTO_RETRIES) {
        // Log auto-retry attempt
        uploadMonitoring.uploadAutoRetry(
          uploadSessionRef.current,
          fileId,
          file.name,
          autoRetryCount + 1,
          MAX_AUTO_RETRIES,
          error.message
        );
        
        // Wait before retry (exponential backoff: 1s, 2s)
        await new Promise(resolve => setTimeout(resolve, 1000 * (autoRetryCount + 1)));
        
        // Recursive retry
        return processAndUploadFile(file, fileId, false, autoRetryCount + 1);
      }
      
      // Track the failure - ensures we capture errors even when caught locally
      uploadMonitoring.uploadFailed(uploadSessionRef.current, fileId, file.name, error, 'upload-process');
      
      setUploadState((prev) => {
        // Check if file still exists before setting error state
        const fileStillExists = prev.files.some(f => f.id === fileId);
        
        if (!fileStillExists) {
          // File was removed, clean up uploadProgress
          const { [fileId]: _removed, ...remainingProgress } = prev.uploadProgress;
          return {
            ...prev,
            uploadProgress: remainingProgress,
          };
        }
        
        return {
          ...prev,
          uploadProgress: {
            ...prev.uploadProgress,
            [fileId]: { status: "failed", progress: 0, error: error.message },
          },
        };
      });
    }
  };

  // Process image - lightweight preview generation only
  const processImage = async (file) => {
    return new Promise(async (resolve) => {
      try {
        const isHeic = file.type === "image/heic" || file.type === "image/heif";

        // For HEIC files, show loader and queue for conversion
        if (isHeic) {
          resolve({
            file,
            preview: null, // Will show UniversalLoader
            accepted: true,
            declineReason: "",
            initialCrop: { unit: "%", x: 25, y: 25, width: 50, height: 50 },
            dimensions: { width: 1024, height: 1024 },
            isConverting: true,
          });
          return;
        }

        // For JPEG/PNG, create compressed preview and run SmartCrop
        const objectUrl = URL.createObjectURL(file);
        const img = await createImagePromise(objectUrl).catch((err) => {
          URL.revokeObjectURL(objectUrl); // Clean up on error
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

        // SmartCrop for preview
        const smartCropResult = await applySmartCrop(file);

        // Create compressed thumbnail for preview (reduces memory by ~80%)
        const compressedPreview = await createCompressedPreview(file).catch(() => objectUrl);
        
        // Revoke original objectUrl if compression succeeded
        if (compressedPreview !== objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }

        resolve({
          file,
          preview: compressedPreview,
          accepted,
          declineReason,
          initialCrop: smartCropResult,
          dimensions: { width: img.width, height: img.height },
        });
      } catch (error) {
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

  // Handle crop completion - keyed by fileId
  const handleCropComplete = useCallback(
    (crop, percentCrop, fileId) => {
      if (!percentCrop) return;
      
      setUploadState((prev) => {
        const file = prev.files.find((f) => f.id === fileId);
        if (!file) return prev; // File might have been removed
        
        const normalizedCrop = normalizeCropData(percentCrop);
        
        return {
          ...prev,
          completedCrops: {
            ...prev.completedCrops,
            [fileId]: normalizedCrop,
          },
        };
      });
    },
    []
  );

  // Drop zone handlers
  const handleDropRejected = useCallback((rejectedFiles) => {
    // Track rejected files in monitoring
    uploadMonitoring.filesRejected(uploadSessionRef.current, rejectedFiles);
    
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
      // Create or reuse upload session for monitoring
      if (!uploadSessionRef.current) {
        uploadSessionRef.current = uploadMonitoring.createUploadSession(
          uploadState.currentUUID, 
          acceptedFiles.length
        );
      }
      
      // Track files dropped
      uploadMonitoring.filesDropped(uploadSessionRef.current, acceptedFiles);
      
      // Filter out duplicate files using fast name+size check (instant, no file reading)
      const uniqueFiles = [];
      const duplicateFiles = [];
      const existingFileKeys = new Set(
        uploadState.files.map(f => `${f.file.name}-${f.file.size}-${f.file.lastModified}`)
      );

      for (const file of acceptedFiles) {
        const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
        if (existingFileKeys.has(fileKey)) {
          duplicateFiles.push(file.name);
        } else {
          existingFileKeys.add(fileKey); // Prevent duplicates within the same drop
          uniqueFiles.push(file);
        }
      }

      if (uniqueFiles.length === 0) {
        toast.error("All images were duplicates and skipped.");
        return;
      }

      if (uploadState.files.length + uniqueFiles.length > MAX_IMAGES) {
        toast.error(
          `Maximum ${MAX_IMAGES} images allowed. ${uniqueFiles.length} new files would exceed the limit.`
        );
        return;
      }

      if (duplicateFiles.length > 0) {
        // Track duplicates detected
        uploadMonitoring.duplicatesDetected(uploadSessionRef.current, duplicateFiles, uniqueFiles.length);
        toast.warning(`${duplicateFiles.length} duplicate file(s) were skipped.`);
      }

      // STEP 1: Immediately add placeholder files to show instant feedback
      const placeholderFiles = uniqueFiles.map((file, i) => {
        const isHeic = file.type === "image/heic" || file.type === "image/heif";
        return {
          file,
          id: uuidv4(),
          preview: null, // No preview yet - will show loader
          accepted: true,
          declineReason: "",
          initialCrop: { unit: "%", x: 25, y: 25, width: 50, height: 50 },
          dimensions: { width: 1024, height: 1024 },
          isConverting: isHeic,
          isProcessingPreview: !isHeic, // Flag for non-HEIC files being processed
          hash: null, // Will be calculated during upload
        };
      });

      // Add placeholders to state immediately - user sees cards right away
      setUploadState((prev) => ({
        ...prev,
        files: [...prev.files, ...placeholderFiles],
        processing: true,
      }));
      
      toast.success(`Processing ${uniqueFiles.length} images...`);

      // STEP 2: Process previews in parallel batches (3 at a time to avoid memory issues)
      const BATCH_SIZE = 3;
      const processPreviewBatch = async (batch) => {
        return Promise.all(
          batch.map(async (placeholderFile) => {
            const file = placeholderFile.file;
            const fileId = placeholderFile.id;
            const isHeic = file.type === "image/heic" || file.type === "image/heif";

            // Skip HEIC files - they're handled by the conversion queue
            if (isHeic) return;

            try {
              // Create blob URL for immediate preview (fast)
              const quickPreview = URL.createObjectURL(file);
              
              // Load image to get dimensions
              const img = await createImagePromise(quickPreview).catch(() => null);
              
              if (!img) {
                // Failed to load, keep placeholder
                return;
              }

              // Check dimensions
              let accepted = true;
              let declineReason = "";
              if (img.width < MIN_IMAGE_DIMENSION || img.height < MIN_IMAGE_DIMENSION) {
                declineReason = `This image is smaller than ${MIN_IMAGE_DIMENSION}x${MIN_IMAGE_DIMENSION} pixels, but we will still use it.`;
              }

              // Run SmartCrop (can be slow, but now in parallel)
              const smartCropResult = await applySmartCrop(file).catch(() => ({
                unit: "%", x: 25, y: 25, width: 50, height: 50
              }));

              // Create compressed preview in background (optional, for memory optimization)
              const compressedPreview = await createCompressedPreview(file).catch(() => quickPreview);
              
              // Revoke quick preview if we got a compressed one
              if (compressedPreview !== quickPreview) {
                URL.revokeObjectURL(quickPreview);
              }

              // Update this specific file in state
              if (isMountedRef.current) {
                setUploadState((prev) => ({
                  ...prev,
                  files: prev.files.map((f) =>
                    f.id === fileId
                      ? {
                          ...f,
                          preview: compressedPreview,
                          accepted,
                          declineReason,
                          initialCrop: smartCropResult,
                          dimensions: { width: img.width, height: img.height },
                          isProcessingPreview: false,
                        }
                      : f
                  ),
                }));
              }
            } catch (error) {
              console.error(`Failed to process preview for ${file.name}:`, error);
              // Keep placeholder on error
              if (isMountedRef.current) {
                setUploadState((prev) => ({
                  ...prev,
                  files: prev.files.map((f) =>
                    f.id === fileId
                      ? { ...f, isProcessingPreview: false, declineReason: "Failed to process preview" }
                      : f
                  ),
                }));
              }
            }
          })
        );
      };

      // Process in batches
      for (let i = 0; i < placeholderFiles.length; i += BATCH_SIZE) {
        if (!isMountedRef.current) break;
        const batch = placeholderFiles.slice(i, i + BATCH_SIZE);
        await processPreviewBatch(batch);
        // Small delay between batches to let UI breathe
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Mark processing as complete
      setUploadState((prev) => ({ ...prev, processing: false }));
      toast.dismiss();

      // STEP 3: Start uploads for all files (use placeholderFiles which have IDs)
      for (const fileData of placeholderFiles) {
        // Check if component is still mounted
        if (!isMountedRef.current) {
          console.warn('Component unmounted, stopping file processing');
          break;
        }

        try {
          const isHeic = fileData.file.type === "image/heic" || fileData.file.type === "image/heif";

          if (isHeic) {
            // Queue HEIC for conversion (non-blocking)
            queueHeicConversion(fileData.file, fileData.id);
            
            // Only update state if still mounted
            if (isMountedRef.current) {
              setUploadState((prev) => ({
                ...prev,
                uploadProgress: {
                  ...prev.uploadProgress,
                  [fileData.id]: { status: "converting", progress: 0 },
                },
              }));
            }
          } else {
            // Upload JPEG/PNG immediately
            await processAndUploadFile(fileData.file, fileData.id);
          }
        } catch (error) {
          // Only update state if still mounted
          if (isMountedRef.current) {
            setUploadState((prev) => ({
              ...prev,
              uploadProgress: {
                ...prev.uploadProgress,
                [fileData.id]: {
                  status: "failed",
                  progress: 0,
                  error: error.message,
                },
              },
            }));
          }
        }
      }
    },
    [processAndUploadFile, queueHeicConversion, uploadState.files, uploadState.currentUUID]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED_TYPES,
    maxFiles: MAX_IMAGES,
    maxSize: MAX_FILE_SIZE,
    onDrop: handleFileDrop,
    onDropRejected: handleDropRejected,
  });

  const removeFile = async (fileId) => {
    // Add to removing files set
    setRemovingFiles((prev) => new Set([...prev, fileId]));

    try {
      // Find the uploaded file using the fileId instead of index
      const uploadedFile = uploadState.uploadedFiles.find(
        (f) => f.fileId === fileId
      );

      if (uploadedFile && uploadedFile.objectKey) {
        await deleteFromR2(uploadedFile.objectKey);
      }

      // Update state using functional update to get latest state
      setUploadState((prev) => {
        // Find the file to revoke its blob URL
        const fileToRemove = prev.files.find((f) => f.id === fileId);
        
        // Revoke blob URL immediately before removing from state
        if (fileToRemove?.preview?.startsWith('blob:')) {
          // Use setTimeout to revoke after React finishes rendering
          setTimeout(() => {
            URL.revokeObjectURL(fileToRemove.preview);
          }, BLOB_REVOKE_DELAY);
        }

        return {
          ...prev,
          files: prev.files.filter((f) => f.id !== fileId),
          uploadedFiles: prev.uploadedFiles.filter((f) => f.fileId !== fileId),
          completedCrops: Object.fromEntries(
            Object.entries(prev.completedCrops).filter(
              ([key]) => key !== String(fileId)
            )
          ),
          uploadProgress: Object.fromEntries(
            Object.entries(prev.uploadProgress).filter(
              ([key]) => key !== String(fileId)
            )
          ),
        };
      });
    } catch (error) {
      console.error('Error removing file:', error);
      toast.error("Failed to delete file. Please try again.");
    } finally {
      // Remove from removing files set - always runs
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
      // Revoke all blob URLs to prevent memory leak - use functional update to get latest state
      setUploadState((prev) => {
        prev.files.forEach((file) => {
          if (file.preview && file.preview.startsWith('blob:')) {
            URL.revokeObjectURL(file.preview);
          }
        });
        return prev; // Return unchanged for now
      });

      await deleteAllFromR2();

      // Use functional update to avoid stale closure
      setUploadState((prev) => ({
        ...prev,
        files: [],
        uploadedFiles: [],
        completedCrops: {},
        uploadProgress: {},
      }));

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
      studioMonitoring.buttonDisabled("Create Studio", "Insufficient images", {
        currentImages: uploadState.files.length,
        requiredImages: MIN_IMAGES
      });
      toast.error(`Please upload at least ${MIN_IMAGES} images`);
      return;
    }

    setLocalSubmitting(true);
    setIsSubmitting(true);

    // Track studio creation start
    studioMonitoring.startStudioCreation(selectedContext?.id, formData.plan);

    try {
      const contextType = selectedContext?.type || "personal";
      const selectedPlan = formData.plan;

      // Check if user has credits for the selected plan
      const hasCredits = hasSufficientCredits(credits, selectedPlan, 1);

      // Check if all files are uploaded
      const failedUploads = Object.entries(uploadState.uploadProgress).filter(
        ([_, progress]) => progress.status === "failed"
      );
      
      // Track upload session completion with stats
      const validStartTimes = Object.values(uploadStartTimeRef.current).filter(t => typeof t === 'number' && t > 0);
      const sessionStartTime = validStartTimes.length > 0 ? Math.min(...validStartTimes) : Date.now();
      uploadMonitoring.uploadSessionCompleted(
        uploadSessionRef.current,
        uploadState.currentUUID,
        {
          totalFiles: uploadState.files.length,
          successCount: uploadState.uploadedFiles.length,
          failedCount: failedUploads.length,
          totalDurationMs: Date.now() - sessionStartTime,
        }
      );

      if (failedUploads.length > 0) {
        studioMonitoring.uploadIssue("Failed uploads blocking studio creation", {
          failedCount: failedUploads.length,
          totalFiles: uploadState.files.length
        });
        toast.error(
          `Please retry failed uploads before creating studio (${failedUploads.length} failed)`
        );
        return;
      }

      if (uploadState.uploadedFiles.length !== uploadState.files.length) {
        studioMonitoring.uploadIssue("Incomplete uploads blocking studio creation", {
          uploadedCount: uploadState.uploadedFiles.length,
          totalFiles: uploadState.files.length
        });
        toast.error(
          "Upload in progress. Please wait for all files to complete."
        );
        return;
      }

      toast.success("Finalizing...");

      // Create crop data map
      const cropDataMap = {};
      uploadState.files.forEach((fileData, index) => {
        const cropData = uploadState.completedCrops[fileData.id] ||
          fileData.initialCrop || {
            unit: "%",
            x: 25,
            y: 25,
            width: 50,
            height: 50,
          };
        const uploadedFile = uploadState.uploadedFiles.find(
          (f) => f.fileId === fileData.id
        );

        if (uploadedFile && cropData) {
          const focusKey = getRelativeObjectKey(
            uploadedFile.objectKey,
            uploadedFile.fileName
          );
          cropDataMap[focusKey] = cropData;
        }
      });

      // Ensure we have crop data
      if (Object.keys(cropDataMap).length === 0) {
        uploadState.uploadedFiles.forEach((uploadedFile) => {
          const focusKey = getRelativeObjectKey(
            uploadedFile.objectKey,
            uploadedFile.fileName
          );
          cropDataMap[focusKey] = {
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
        uxMonitoring.trackSuccess("studio-creation", {
          studioId: result.studioId,
          plan: formData.plan,
          imageCount: uploadState.files.length
        });
        
        // Reset form before redirecting
        resetStore();
        
        toast.success("Studio created successfully!");
        router.push(`/studio/${result.studioId}`);
      } else {
        throw new Error(result?.error || "Failed to create studio");
      }
    } catch (error) {
      studioMonitoring.paymentIssue(error.message, {
        plan: formData.plan,
        hasCredits: hasSufficientCredits(credits, formData.plan, 1),
        step: "studio-creation"
      });
      toast.error(`Error: ${error.message}`);
    } finally {
      setLocalSubmitting(false);
      setIsSubmitting(false);
    }
  };

  const handlePaymentFlow = async (selectedPlan) => {
    // Track payment flow start
    studioMonitoring.stepCompleted("payment-flow-start", { plan: selectedPlan });
    
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

      // Handle studio already exists scenario
      if (result.alreadyExists) {
        const status = result.status;
        
        if (status === "PROCESSING" || status === "COMPLETED" || status === "ACCEPTED") {
          // Studio is already being processed or completed - redirect to studio page
          // Reset form before redirecting
          resetStore();
          
          toast.success("Studio already created! Redirecting...");
          studioMonitoring.stepCompleted("studio-already-exists", { 
            studioId: uploadState.currentUUID,
            status 
          });
          router.push(`/studio/${uploadState.currentUUID}`);
          return;
        } else if (status === "FAILED") {
          // Studio failed previously - allow retry by proceeding to payment
          toast.info("Retrying studio creation...");
        }
      }

      // Handle update scenario (retry payment)
      if (result.isUpdate) {
        toast.info("Redirecting to payment...");
      } else {
        toast.success("Redirecting to payment...");
      }

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
        studioMonitoring.stepCompleted("checkout-redirect", { 
          plan: selectedPlan,
          studioId: uploadState.currentUUID,
          isRetry: result.isUpdate || false
        });
        // Redirect to checkout
        window.location.href = checkoutUrl;
      } else {
        throw new Error("Failed to create checkout URL");
      }
    } catch (error) {
      studioMonitoring.paymentIssue(error.message, {
        plan: selectedPlan,
        step: "payment-flow-error-fallback",
        studioId: uploadState.currentUUID
      });
      
      // FAIL FORWARD: On any error, redirect to payment directly
      // Just like the buy page - simple and robust
      try {
        toast.info("Redirecting to payment...");
        
        const checkoutUrl = await createCheckoutUrl(
          selectedPlan,
          1,
          {
            source: "studio_create_error_fallback",
          },  
          `${window.location.origin}/studio/create`
        );
        
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          throw new Error("Failed to create checkout URL");
        }
      } catch (checkoutError) {
        toast.error("Unable to proceed to payment. Please try again or contact support.");
        setLocalSubmitting(false);
        setIsSubmitting(false);
      }
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

  // Check if any files are currently uploading or converting
  const isAnyFileUploading = useCallback(() => {
    return Object.values(uploadState.uploadProgress).some(
      (progress) => 
        progress.status === "processing" || 
        progress.status === "uploading" ||
        progress.status === "converting" ||
        progress.status === "preparing"
    );
  }, [uploadState.uploadProgress]);

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
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center space-y-1 sm:space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold">Upload photos</h2>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
          Upload at least {MIN_IMAGES} photos with good variation in outfits,
          lighting, and backgrounds. Keep waist-up in crop area.
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
                isSubmitting ||
                isAnyFileUploading()
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
        <div className="p-6 rounded-3xl bg-primary/5">
          <div
            {...getRootProps()}
            className={`relative rounded-2xl border-[3px] border-dashed p-12 text-center cursor-pointer transition-all duration-200 overflow-hidden ${
              isDragActive
                ? "border-primary bg-primary/5 scale-[0.99]"
                : "border-primary/40 hover:border-primary/60 hover:bg-primary/5"
            }`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.08'%3E%3Cpath d='M0 0h20v20H0V0zm20 20h20v20H20V20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px',
              backgroundPosition: 'center',
              backgroundRepeat: 'repeat'
            }}
          >
            {/* Content */}
            <div className="relative z-10 space-y-6">
              <input {...getInputProps()} />
              
              {/* Upload Icon */}
              <div className="flex justify-center">
                <Image
                  src="/images/upload_photos.svg"
                  alt="Upload photos"
                  width={80}
                  height={80}
                  className="h-20 w-20 opacity-90"
                />
              </div>
              
              {/* Upload Button */}
              <div className="flex justify-center">
                 <Button
                 variant="default"
                 size="default"
                 className="rounded-lg"
                 >
                   <CloudUpload className="h-4 w-4 mr-2" />
                   Upload your photos
                 </Button>
              </div>
              
              {/* Drag & Drop Text */}
              <p className="text-muted-foreground text-base">
                {isDragActive ? "Drop your photos here" : "or drag & drop your photos here"}
              </p>
              
              {/* File Info */}
              <div className="text-sm text-muted-foreground/80 space-y-1 pt-2">
                <p>Supported formats: JPG, JPEG, PNG, HEIC, HEIF</p>
                <p>Maximum file size: {(
              MAX_FILE_SIZE / MB
            ).toFixed(0)} MB per image</p>
                <p>Upload at least {MIN_IMAGES} photos for best results</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Separator className="my-4" />
          <Masonry
            breakpointCols={breakpointColumns}
            className="flex w-auto -ml-4"
            columnClassName="pl-4 bg-clip-padding"
          >
            {uploadState.files.map((fileData, index) => {
              const progress = uploadState.uploadProgress[fileData.id];
              // Check if file is uploaded by looking at uploadedFiles array
              const uploadedFile = uploadState.uploadedFiles?.find(
                (f) => f.fileId === fileData.id
              );
              const isUploaded = uploadedFile
                ? true
                : progress?.status === "completed";
              const isFailed = progress?.status === "failed";
              const isConverting = progress?.status === "converting" || fileData.isConverting;
              const isProcessingPreview = fileData.isProcessingPreview;
              const isUploading =
                !isUploaded &&
                !isFailed &&
                !isConverting &&
                !isProcessingPreview &&
                (progress?.status === "uploading" ||
                  progress?.status === "processing" ||
                  progress?.status === "preparing");
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
                      {(isProcessingPreview || isConverting || isUploading || isUploaded || isFailed) && (
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
                          {isProcessingPreview && !isUploaded && !isFailed && (
                            <div className="bg-slate-500 text-white px-2 py-1 rounded-xl text-xs flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Loading
                            </div>
                          )}
                          {isConverting && !isProcessingPreview && (
                            <div className="bg-amber-500 text-white px-2 py-1 rounded-xl text-xs flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Converting
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
                        aria-label={`Remove ${fileData.file?.name || 'image'}`}
                      >
                        {isRemoving ? (
                          <Loader2 className="size-4 text-white" />
                        ) : (
                          <X className="size-2" />
                        )}
                      </Button>

                      {/* Show loader while preview is loading, otherwise show ReactCrop */}
                      {!fileData.preview ? (
                        <div className="w-full aspect-square bg-muted flex items-center justify-center rounded-lg">
                          <UniversalLoader 
                            size="lg" 
                            variant="centered"
                            text={isConverting ? "Converting HEIC..." : "Loading preview..."}
                          />
                        </div>
                      ) : (
                        <ReactCrop
                          crop={
                            uploadState.completedCrops[fileData.id] ||
                            fileData.initialCrop || {
                              unit: "%",
                              x: 25,
                              y: 25,
                              width: 50,
                              height: 50,
                            }
                          }
                          onChange={(c, pc) => handleCropComplete(c, pc, fileData.id)}
                          onComplete={(c, pc) => handleCropComplete(c, pc, fileData.id)}
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
                            onError={(e) => {
                              // Fallback if blob URL is revoked
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </ReactCrop>
                      )}

                      {/* Retry Button for Failed Uploads */}
                      {isFailed && (
                        <div className="absolute bottom-1/2 left-1/2 z-10 -translate-x-1/2 translate-y-1/2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() =>
                              processAndUploadFile(fileData.file, fileData.id, true)
                            }
                            className="text-xs"
                            disabled={isUploading || isSubmitting}
                            aria-label={`Retry upload for ${fileData.file?.name || 'file'}`}
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
            className="relative rounded-2xl border-[3px] border-dashed border-primary/40 p-6 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all duration-200 overflow-hidden"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.08'%3E%3Cpath d='M0 0h20v20H0V0zm20 20h20v20H20V20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px',
              backgroundPosition: 'center',
              backgroundRepeat: 'repeat'
            }}
          >
            {/* Content */}
            <div className="relative z-10 flex items-center justify-center gap-3">
              <input {...getInputProps()} />
              <CloudUpload className="h-5 w-5 text-primary" />
              <p className="text-sm font-medium">
                Add more photos (up to {MAX_IMAGES} total)
              </p>
            </div>
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
            Uploading... 
            Please wait for uploads to complete before proceeding.
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation Warning Dialog */}
      <Dialog open={showNavigationWarning} onOpenChange={setShowNavigationWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Upload Step?</DialogTitle>
            <DialogDescription>
              You will need to upload all images again if you navigate away. All current uploads will be cleared.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelNavigation}>
              Stay Here
            </Button>
            <Button variant="destructive" onClick={handleConfirmNavigation}>
              Leave & Clear Uploads
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Navigation */}
      <div className="flex flex-col items-center space-y-3">
        <StepNavigation
          onNext={handleCreateStudio}
          onPrevious={handlePreviousStep}
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
              ? `Uploading...`
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
