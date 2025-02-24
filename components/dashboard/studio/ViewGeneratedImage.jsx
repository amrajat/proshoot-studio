"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";
import { updateStudioDownloadStatus } from "@/lib/supabase/actions/server";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

function ViewGeneratedImage({
  image,
  tune_id,
  alreadyDownloaded,
  imageNumber,
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function downloadImage() {
    setIsLoading(true);
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `image-${imageNumber}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
    setIsLoading(false);
  }

  return (
    <Card className="overflow-hidden shadow-none rounded">
      <CardContent className="p-0 relative">
        <div className="absolute top-2 left-2 bg-background/80 text-foreground px-2 py-1 rounded-md text-sm font-semibold">
          #{imageNumber}
        </div>
        <PhotoProvider>
          <PhotoView src={image}>
            <Image
              unoptimized={true}
              src={image}
              alt={`AI generated image ${imageNumber}`}
              width={1024}
              height={1024}
              className="w-full aspect-square object-cover cursor-zoom-in"
            />
          </PhotoView>
        </PhotoProvider>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2 p-2">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <a href={image} target="_blank" rel="noopener noreferrer">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </a>
        </Button>
        {!alreadyDownloaded ? (
          <form
            className="w-full"
            action={async () => {
              await updateStudioDownloadStatus(tune_id);
            }}
          >
            <Button type="submit" size="sm" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </form>
        ) : (
          <Button
            onClick={downloadImage}
            disabled={isLoading}
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
