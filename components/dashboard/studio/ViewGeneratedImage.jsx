"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download, AlertCircle, ZoomIn } from "lucide-react";
import { updateStudioDownloadStatus } from "@/lib/supabase/actions/server";
import { PhotoView } from "react-photo-view";
import * as Sentry from "@sentry/nextjs";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

function ViewGeneratedImage({
  image,
  tune_id,
  alreadyDownloaded,
  imageNumber,
  allImages,
  currentIndex,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const { toast } = useToast();

  // Reset loading state when image changes
  useEffect(() => {
    setIsLoading(true);
    setImageError(false);
  }, [image]);

  async function downloadImage() {
    setIsDownloading(true);
    try {
      const response = await fetch(image);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch image: ${response.status} ${response.statusText}`
        );
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `headshot-${imageNumber}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast({
        title: "Success",
        description: "Image downloaded successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error downloading image:", error);
      Sentry.captureException(error);

      toast({
        title: "Download failed",
        description:
          "There was a problem downloading your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  }

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
    console.error("Failed to load image:", image);
    Sentry.captureMessage(`Failed to load image: ${image}`);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 rounded-lg border border-border/50 h-full flex flex-col">
      <CardContent className="p-0 relative flex-grow">
        <Badge
          variant="secondary"
          className="absolute top-2 left-2 z-20 bg-background/80 backdrop-blur-sm font-medium"
        >
          #{imageNumber}
        </Badge>

        {/* Loading Skeleton */}
        {isLoading && !imageError && (
          <div className="absolute inset-0 bg-muted/20 animate-pulse flex items-center justify-center z-10">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error State */}
        {imageError ? (
          <div className="w-full aspect-square flex items-center justify-center bg-muted/10">
            <div className="text-center p-4">
              <AlertCircle className="mx-auto h-12 w-12 text-destructive/70" />
              <p className="mt-2 text-sm text-muted-foreground font-medium">
                Failed to load image
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setImageError(false);
                  setIsLoading(true);
                }}
              >
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="relative"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <PhotoView src={image} index={currentIndex}>
              <div className="relative aspect-square cursor-zoom-in overflow-hidden">
                <Image
                  unoptimized={true}
                  src={image}
                  alt={`AI generated headshot ${imageNumber}`}
                  width={1024}
                  height={1024}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    isHovering ? "scale-105" : "scale-100"
                  }`}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  loading="lazy"
                />

                {/* Hover overlay */}
                <div
                  className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-300 ${
                    isHovering ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="bg-background/80 backdrop-blur-sm p-2 rounded-full">
                    <ZoomIn className="h-8 w-8 text-primary" />
                  </div>
                  <span className="absolute bottom-3 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                    Click to view enlarged.
                  </span>
                </div>
              </div>
            </PhotoView>
          </div>
        )}
      </CardContent>

      <CardFooter className="grid grid-cols-2 gap-2 p-3 bg-muted/5">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          asChild
          disabled={imageError || isLoading}
        >
          <a
            href={image}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </a>
        </Button>

        {!alreadyDownloaded ? (
          <form
            className="w-full"
            action={async () => {
              try {
                await updateStudioDownloadStatus(tune_id);
              } catch (error) {
                console.error("Error updating download status:", error);
                Sentry.captureException(error);
                toast({
                  title: "Error",
                  description:
                    "Failed to update download status. Please try again.",
                  variant: "destructive",
                });
              }
            }}
          >
            <Button
              type="submit"
              size="sm"
              className="w-full"
              disabled={imageError || isLoading}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </form>
        ) : (
          <Button
            onClick={downloadImage}
            disabled={isDownloading || imageError || isLoading}
            size="sm"
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? "Downloading..." : "Download"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default ViewGeneratedImage;
