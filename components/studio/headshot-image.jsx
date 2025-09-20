"use client";

import { useState, memo } from "react";
import Image from "next/image";
import { PhotoView } from "react-photo-view";
import { Heart, Loader2, ZoomIn, Shield, Download, Edit, Copy, WandSparkles, Pencil, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { InlineLoader } from "@/components/shared/universal-loader";
import Link from "next/link";

/**
 * Optimized headshot image component with lazy loading and favorite toggle
 * @param {object} props
 * @param {object} props.headshot - Headshot data
 * @param {boolean} props.showFavoriteToggle - Whether to show favorite toggle
 * @param {boolean} props.isFavorite - Current favorite status
 * @param {function} props.onToggleFavorite - Favorite toggle handler
 * @param {number} props.index - Index of the headshot in the list
 * @param {boolean} props.isTogglingFavorite - Loading state for favorite toggle
 * @param {string} props.preferredImageType - Which image to prioritize: 'hd', 'result', or 'preview'
 * @param {array} props.allImages - All images in the current section for PhotoView navigation
 */
const HeadshotImage = memo(function HeadshotImage({
  headshot,
  showFavoriteToggle = false,
  isFavorite = false,
  onToggleFavorite,
  isTogglingFavorite = false,
  index,
  preferredImageType = "auto", // 'auto', 'hd', 'result', 'preview'
  allImages = [], // All images for PhotoView navigation
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Function to handle image download via authenticated R2 API
  const handleDownload = async (imageUrl) => {
    if (isDownloading) return; // Prevent multiple simultaneous downloads
    
    try {
      setIsDownloading(true);
      
      // Extract object key from Cloudflare Worker JWT token
      let objectKey = null;
      try {
        const url = new URL(imageUrl);
        const token = url.searchParams.get('token');
        
        if (token) {
          // Decode JWT payload to get the object key
          const payload = JSON.parse(atob(token.split('.')[1]));
          objectKey = payload.key;
        }
      } catch (e) {
        throw new Error('Invalid image URL format');
      }

      if (!objectKey) {
        throw new Error('Could not extract object key from image URL');
      }

      // Use authenticated R2 download API
      const response = await fetch('/api/r2/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          objectKey,
          bucketName: 'images'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Download failed: ${response.status}`);
      }

      // Get the filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'headshot.png';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Get the blob and trigger download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = downloadUrl;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
      }, 100);
      
    } catch (error) {
      // Fallback to opening in new tab if download fails
      window.open(imageUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  // Determine which image to display based on preferred type
  let imageUrl, thumbnailUrl;

  if (preferredImageType === "hd") {
    // For 4K section: prioritize HD, fallback to result, then preview
    imageUrl = headshot.hd || headshot.result || headshot.preview;
    thumbnailUrl = headshot.hd || headshot.result || headshot.preview;
  } else if (preferredImageType === "result") {
    // For result section: prioritize result, fallback to preview
    imageUrl = headshot.result || headshot.preview;
    thumbnailUrl = headshot.result || headshot.preview;
  } else if (preferredImageType === "preview") {
    // For preview section: only show preview
    imageUrl = headshot.preview;
    thumbnailUrl = headshot.preview;
  } else {
    // Auto mode: HD > result > preview (default behavior)
    imageUrl = headshot.hd || headshot.result || headshot.preview;
    thumbnailUrl = headshot.result || headshot.preview;
  }

  // Determine which badge to show based on the actual image being displayed
  let badgeText = null;
  let badgeVariant = "secondary";

  if (thumbnailUrl === headshot.hd) {
    badgeText = "4K";
    badgeVariant = "destructive"; // Red for 4K/HD
  } else if (thumbnailUrl === headshot.result) {
    badgeText = "HD";
    badgeVariant = "default"; // Primary blue for HD/result
  } else if (thumbnailUrl === headshot.preview) {
    badgeText = "Preview";
    badgeVariant = "success"; // Green for preview
  }

  if (!imageUrl) {
    return null;
  }

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    if (onToggleFavorite && !isTogglingFavorite) {
      onToggleFavorite(headshot.id);
    }
  };

  return (
    <div className="space-y-2">
      <div className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
        {/* Secure Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="flex flex-col items-center gap-3 text-center px-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <InlineLoader size="sm" showText={false} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-primary">
                  Opening Secure Layer
                </p>
                <p className="text-xs text-muted-foreground">
                  Decrypting with end-to-end security
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center">
              <div className="text-muted-foreground text-sm">
                Failed to load
              </div>
            </div>
          </div>
        )}

        {/* PhotoView for full-screen overlay - Now handled by parent PhotoProvider */}
        <PhotoView
          src={imageUrl}
          key={`photo-${headshot.id}-${preferredImageType}`}
        >
          <div className="cursor-zoom-in">
            <Image
              src={thumbnailUrl}
              alt={"Generated headshot"}
              fill
              unoptimized={true}
              loading="lazy"
              className={cn(
                "object-cover transition-all duration-300 cursor-zoom-in",
                "group-hover:scale-105",
                isLoading && "opacity-0",
                hasError && "opacity-0"
              )}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />

            {/* Hover Overlay with Zoom Message */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-2 text-white">
                <ZoomIn className="h-6 w-6" />
                <span className="text-sm font-medium">
                  Click to view enlarged
                </span>
              </div>
            </div>
          </div>
        </PhotoView>

        {/* Favorite Toggle Button */}
        {showFavoriteToggle && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              size="sm"
              variant={isFavorite ? "default" : "secondary"}
              className={cn(
                "h-8 w-8 p-0 shadow-lg",
                isFavorite && "bg-red-500 hover:bg-red-600 text-white"
              )}
              onClick={handleToggleFavorite}
              disabled={isTogglingFavorite}
            >
              {isTogglingFavorite ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart
                  className={cn("h-4 w-4", isFavorite && "fill-current")}
                />
              )}
            </Button>
          </div>
        )}

        {/* Image Type Badge */}
        {badgeText && (
          <div className="absolute top-2 left-2">
            <Badge variant={badgeVariant}>
              {badgeText} - {index + 1}
            </Badge>
          </div>
        )}
      </div>

      {/* Action Buttons - Icon Only */}
      <div className="flex gap-2 w-full">
        <Button 
          variant="secondary" 
          size="sm" 
          className="flex-1 p-2" 
          onClick={() => handleDownload(thumbnailUrl)}
          disabled={isDownloading}
          aria-label={isDownloading ? "Downloading image..." : "Download image"}
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
          ) : (
            <Download className="h-4 w-4 text-primary" />
          )}
        </Button>
        
        <Button 
          variant="secondary" 
          size="sm" 
          className="flex-1 p-2"
          aria-label="Edit image"
          onClick={() => console.log('Edit clicked')}
        >
          <WandSparkles className="h-4 w-4 text-destructive" />
        </Button>
        
        <Button 
          variant="secondary" 
          size="sm" 
          className="flex-1 p-2"
          aria-label="Generate similar image"
          onClick={() => console.log('Generate similar clicked')}
        >
          <Sparkles className="h-4 w-4 text-success" />
        </Button>
      </div>
    </div>
  );
});

export default HeadshotImage;
