"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";

export default function DownloadAllImages({ images }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDownload = async () => {
    if (!images || images.length === 0 || isDownloading) return;

    setIsDownloading(true);
    setProgress(0);

    try {
      toast({
        title: "Preparing download",
        description:
          "We're preparing your images for download. This may take a moment.",
      });

      const zip = new JSZip();
      const folder = zip.folder("headshots");

      // Calculate progress increment per image
      const progressIncrement = 90 / images.length;

      // Download each image and add to zip
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const imageUrl = image.url || image;
        const imageName = `headshot_${i + 1}.jpg`;

        try {
          // Fetch the image
          const response = await fetch(imageUrl);
          if (!response.ok) throw new Error(`Failed to fetch image ${i + 1}`);

          // Convert to blob
          const blob = await response.blob();

          // Add to zip
          folder.file(imageName, blob);

          // Update progress
          setProgress((i + 1) * progressIncrement);
        } catch (error) {
          console.error(`Error processing image ${i + 1}:`, error);
          // Continue with other images even if one fails
        }
      }

      // Generate the zip file
      setProgress(95);
      const content = await zip.generateAsync(
        {
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: { level: 6 },
        },
        (metadata) => {
          // Update progress during zip generation
          if (metadata.percent) {
            const zipProgress = 95 + metadata.percent * 0.05;
            setProgress(Math.min(99, zipProgress));
          }
        }
      );

      // Save the zip file
      saveAs(content, "headshots.zip");
      setProgress(100);

      toast({
        title: "Download complete",
        description: "Your headshots have been downloaded successfully!",
        variant: "success",
      });
    } catch (error) {
      console.error("Error creating zip file:", error);
      toast({
        title: "Download failed",
        description:
          "There was an error downloading your images. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Reset after a short delay to show 100% completion
      setTimeout(() => {
        setIsDownloading(false);
        setProgress(0);
      }, 1000);
    }
  };

  return (
    <div className="w-full max-w-md">
      {isDownloading ? (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Preparing download...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleDownload} className="w-full" size="lg">
                <Download className="mr-2 h-4 w-4" />
                Download All Images as ZIP
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download all your headshots in a single ZIP file</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
