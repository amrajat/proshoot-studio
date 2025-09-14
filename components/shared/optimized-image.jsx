"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const OptimizedImage = ({
  src,
  alt,
  className,
  fallbackSrc = "/images/placeholder.svg",
  retryCount = 2,
  onError,
  onLoad,
  priority = false,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleError = useCallback(() => {
    if (attempts < retryCount) {
      // Retry with cache-busting parameter
      const cacheBuster = `?retry=${attempts + 1}&t=${Date.now()}`;
      setCurrentSrc(`${src}${cacheBuster}`);
      setAttempts(prev => prev + 1);
      return;
    }

    // All retries failed, use fallback
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(true);
    }

    onError?.();
  }, [src, fallbackSrc, attempts, retryCount, currentSrc, onError]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
  }, []);

  return (
    <>
      <Image
        src={currentSrc}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          hasError ? "opacity-75" : "",
          className
        )}
        onError={handleError}
        onLoad={handleLoad}
        onLoadStart={handleLoadStart}
        priority={priority}
        {...props}
      />
      
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-muted/50 animate-pulse flex items-center justify-center z-10">
          <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground/70 rounded-full animate-spin" />
        </div>
      )}

      {/* Error indicator */}
      {hasError && (
        <div className="absolute top-1 right-1 z-20">
          <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Image loaded from fallback" />
        </div>
      )}
    </>
  );
};

export default OptimizedImage;
