"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download, AlertCircle } from "lucide-react";
import { updateStudioDownloadStatus } from "@/lib/supabase/actions/server";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import * as Sentry from "@sentry/nextjs";
import { useToast } from "@/hooks/use-toast";

function ViewGeneratedImage({
  image,
  tune_id,
  alreadyDownloaded,
  imageNumber,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();

  async function downloadImage() {
    setIsLoading(true);
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
      link.download = `image-${imageNumber}.jpg`;
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
      setIsLoading(false);
    }
  }

  const handleImageError = () => {
    setImageError(true);
    console.error("Failed to load image:", image);
    Sentry.captureMessage(`Failed to load image: ${image}`);
  };

  return (
    <Card className="overflow-hidden shadow-none rounded">
      <CardContent className="p-0 relative">
        <div className="absolute top-2 left-2 bg-background/80 text-foreground px-2 py-1 rounded-md text-sm font-semibold">
          #{imageNumber}
        </div>
        {imageError ? (
          <div className="w-full aspect-square flex items-center justify-center bg-gray-100">
            <div className="text-center p-4">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Failed to load image</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setImageError(false)}
              >
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <PhotoProvider>
            <PhotoView src={image}>
              <Image
                unoptimized={true}
                src={image}
                alt={`AI generated image ${imageNumber}`}
                width={1024}
                height={1024}
                className="w-full aspect-square object-cover cursor-zoom-in"
                onError={handleImageError}
                loading="lazy"
              />
            </PhotoView>
          </PhotoProvider>
        )}
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2 p-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          asChild
          disabled={imageError}
        >
          <a href={image} target="_blank" rel="noopener noreferrer">
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
              disabled={imageError}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </form>
        ) : (
          <Button
            onClick={downloadImage}
            disabled={isLoading || imageError}
            size="sm"
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            {isLoading ? "Downloading..." : "Download"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default ViewGeneratedImage;
