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
} from "lucide-react";
import JSZip from "jszip";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

const supabase = createSupabaseBrowserClient();

// Image validation rules
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_NUM_IMAGES = 50;
const MIN_NUM_IMAGES = 10; // This variable is not used anymore.
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const ACCEPTED_IMAGE_TYPES = {
  "image/jpeg": [],
  "image/jpg": [],
  "image/png": [],
};
const MIN_IMAGE_DIMENSION = 1024;

function ImageUploader({ setValue, errors, isSubmitting, studioMessage }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  // Removed loadingModels state since we no longer use face-api
  const [processing, setProcessing] = useState(false);
  const [includeInvalidImages, setIncludeInvalidImages] = useState(false);
  const [allowLessThanTen, setAllowLessThanTen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const validFiles = files.filter((file) => !file.error && file.accepted);
    if (validFiles.length > 0 && validFiles.length < 10) {
      setWarningMessage(
        `You are uploading ${validFiles.length} valid image${
          validFiles.length !== 1 ? "s" : ""
        }. We suggest that you upload at least 10 images for best outputs.`
      );
    } else {
      setWarningMessage("");
    }
  }, [files]);

  // Simplified image processing without face detection
  const processImage = async (file) => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = async () => {
        let accepted = true;
        let declineReason = "";

        // Only check image dimensions
        if (
          img.width < MIN_IMAGE_DIMENSION ||
          img.height < MIN_IMAGE_DIMENSION
        ) {
          accepted = false;
          declineReason = `Image is too small. Minimum size is ${MIN_IMAGE_DIMENSION}x${MIN_IMAGE_DIMENSION} pixels.`;
        }

        resolve({
          file: file,
          preview: URL.createObjectURL(file),
          accepted,
          declineReason,
        });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
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

  const removeFile = useCallback((index) => {
    setFiles((prevFiles) => {
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
    setUploadProgress(0);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    try {
      const zip = new JSZip();
      const validFiles = includeInvalidImages
        ? files
        : files.filter((file) => file.accepted);
      validFiles.forEach((file) => {
        zip.file(file.file.name, file.file);
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const filePath = `${session.user.id}/${uuidv4()}/${Date.now()}.zip`;

      const { data, error } = await supabase.storage
        .from("training-images")
        .upload(filePath, zipBlob, {
          contentType: "application/zip",
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            setUploadProgress(percent);
          },
        });

      if (error) {
        console.error("Upload error:", error);
      } else {
        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from("training-images")
            .createSignedUrl(filePath, 21600);

        if (signedUrlError) {
          console.error("Signed URL error:", signedUrlError);
        } else {
          setValue("images", signedUrlData.signedUrl);
        }
      }
    } catch (error) {
      console.error("General error:", error);
    } finally {
      setUploading(false);
      setIsCompleted(true);
    }
  }, [files, setValue, includeInvalidImages]);

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
            Please follow the image uploading guidelines for best results.{" "}
          </p>
          {/* <ImageUploadingGuideLines /> */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mr-2">Show Image Guidelines</Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl overflow-x-auto max-h-screen">
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
                    Upload up to {MAX_NUM_IMAGES} images, each up to{" "}
                    {(MAX_FILE_SIZE / 1048576).toFixed(0)} MB,
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    and combined size of all images lesser than{" "}
                    {((MAX_FILE_SIZE / 1048576) * 10).toFixed(0)} MB
                  </p>
                </div>
              </div>

              {files.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {files.map((file, index) => (
                    <Card
                      key={index}
                      className={
                        file.accepted ? "border-success" : "border-destructive"
                      }
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative h-10 w-10">
                            <Image
                              src={file.preview}
                              alt={`Preview ${index + 1}`}
                              className="rounded-md object-cover"
                              fill
                            />
                          </div>
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
                              <p className="text-xs text-destructive">
                                {file.declineReason}
                              </p>
                            )}
                          </div>
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
                            >
                              <Trash className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {(includeInvalidImages || allowLessThanTen) && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {includeInvalidImages
                      ? "You are including invalid images in your upload. "
                      : allowLessThanTen
                      ? "You are uploading fewer than 10 images. "
                      : ""}
                    We suggest that you upload at least 1024*1024 resolution for
                    best outputs.
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
                      Include Invalid Images
                    </Button>
                  )}
                {/* <p className="text-sm text-muted-foreground">
                  Please ensure your images meet the minimum size requirements.
                  If you believe your images are valid, you can include them
                  despite any warnings.
                </p> */}
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
