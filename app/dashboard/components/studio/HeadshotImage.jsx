"use client";

import { useState, memo } from "react";
import Image from "next/image";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import "react-photo-view/dist/react-photo-view.css";
import { Badge } from "@/components/ui/badge";

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
 */
const HeadshotImage = memo(function HeadshotImage({
  headshot,
  showFavoriteToggle = false,
  isFavorite = false,
  onToggleFavorite,
  isTogglingFavorite = false,
  index,
  preferredImageType = "auto", // 'auto', 'hd', 'result', 'preview'
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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
    badgeText = "SD";
    badgeVariant = "default"; // Primary blue for SD/result
  } else if (thumbnailUrl === headshot.preview) {
    badgeText = "Preview";
    badgeVariant = "success"; // Green for preview
  }

  console.log("🖼️ [DEBUG] HeadshotImage URL Selection:", {
    headshotId: headshot.id,
    preferredImageType,
    availableImages: {
      hasHD: !!headshot.hd,
      hasResult: !!headshot.result,
      hasPreview: !!headshot.preview,
    },
    selectedUrls: {
      imageUrl: imageUrl?.substring(0, 50) + "...",
      thumbnailUrl: thumbnailUrl?.substring(0, 50) + "...",
    },
    badge: { badgeText, badgeVariant },
  });

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
    <div className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center">
            <div className="text-muted-foreground text-sm">Failed to load</div>
          </div>
        </div>
      )}

      {/* PhotoView for full-screen overlay */}
      <PhotoProvider
        maskOpacity={0.8}
        speed={() => 300}
        easing={(type) =>
          type === 2
            ? "cubic-bezier(0.36, 0, 0.66, -0.56)"
            : "cubic-bezier(0.34, 1.56, 0.64, 1)"
        }
      >
        <PhotoView src={imageUrl}>
          <div className="cursor-pointer">
            <Image
              src={thumbnailUrl}
              alt={headshot.prompt || "Generated headshot"}
              fill
              unoptimized={true}
              loading="lazy"
              className={cn(
                "object-cover transition-all duration-300",
                "group-hover:scale-105",
                isLoading && "opacity-0",
                hasError && "opacity-0"
              )}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          </div>
        </PhotoView>
      </PhotoProvider>

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
              <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
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
  );
});

export default HeadshotImage;
