"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const loaderActions = [
  "Balancing",
  "Beaming",
  "Bouncing",
  "Buzzing",
  "Chasing",
  "Climbing",
  "Cooking",
  "Crafting",
  "Crawling",
  "Cycling",
  "Dancing",
  "Discovering",
  "Diving",
  "Drawing",
  "Dreaming",
  "Drifting",
  "Exploring",
  "Fetching",
  "Flipping",
  "Floating",
  "Flying",
  "Gathering",
  "Gliding",
  "Growing",
  "Hiking",
  "Humming",
  "Jumping",
  "Juggling",
  "Knitting",
  "Leaping",
  "Lifting",
  "Marching",
  "Painting",
  "Paddling",
  "Peeking",
  "Planting",
  "Polishing",
  "Prancing",
  "Rolling",
  "Running",
  "Shining",
  "Shuffling",
  "Sketching",
  "Sliding",
  "Smiling",
  "Spinning",
  "Stretching",
  "Surfing",
  "Swimming",
  "Swinging",
  "Tapping",
  "Walking",
  "Whirling",
  "Writing",
  "Zipping",
];

/**
 * Universal Loading Component
 *
 * A consistent loading component that shows a spinning Loader2 icon
 * with a random joyful action word. Replaces all loading states across the app.
 *
 * @param {Object} props - Component props
 * @param {string} props.size - Size variant: 'sm', 'default', 'lg', 'xl', 'page'
 * @param {string} props.variant - Layout variant: 'inline', 'centered', 'fullscreen'
 * @param {string} props.text - Custom text (overrides random action word)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showText - Whether to show text (default: true)
 * @param {string} props.textPosition - Text position: 'bottom', 'right' (default: 'bottom')
 */
const UniversalLoader = ({
  size = "default",
  variant = "centered",
  text,
  className = "",
  showText = true,
  textPosition = "bottom",
  ...props
}) => {
  const [actionWord, setActionWord] = useState("");

  // Get random action word on mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * loaderActions.length);
    setActionWord(loaderActions[randomIndex]);
  }, []);

  // Size classes for the spinner
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
    page: "h-16 w-16",
  };

  // Text size classes
  const textSizeClasses = {
    sm: "text-xs",
    default: "text-sm",
    lg: "text-base",
    xl: "text-lg",
    page: "text-xl",
  };

  // Layout variants
  const getVariantClasses = () => {
    switch (variant) {
      case "inline":
        return textPosition === "right"
          ? "flex items-center space-x-2"
          : "flex flex-col items-center space-y-1";
      case "centered":
        return textPosition === "right"
          ? "flex items-center justify-center space-x-3"
          : "flex flex-col items-center justify-center space-y-2";
      case "fullscreen":
        return textPosition === "right"
          ? "min-h-screen flex items-center justify-center space-x-4"
          : "min-h-screen flex flex-col items-center justify-center space-y-3";
      default:
        return textPosition === "right"
          ? "flex items-center justify-center space-x-3"
          : "flex flex-col items-center justify-center space-y-2";
    }
  };

  const displayText = text || `${actionWord}...`;

  return (
    <div
      className={cn(getVariantClasses(), className)}
      role="status"
      aria-label={`Loading: ${displayText}`}
      {...props}
    >
      <Loader2
        className={cn("animate-spin text-primary", sizeClasses[size])}
        aria-hidden="true"
      />
      {showText && (
        <span
          className={cn(
            "text-muted-foreground font-medium",
            textSizeClasses[size]
          )}
        >
          {displayText}
        </span>
      )}
      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );
};

export default UniversalLoader;

// Export convenience components for common use cases
export const PageLoader = (props) => (
  <UniversalLoader size="page" variant="fullscreen" {...props} />
);

export const InlineLoader = (props) => (
  <UniversalLoader size="sm" variant="inline" {...props} />
);

export const CenteredLoader = (props) => (
  <UniversalLoader size="default" variant="centered" {...props} />
);

export const ButtonLoader = (props) => (
  <UniversalLoader
    size="sm"
    variant="inline"
    textPosition="right"
    showText={false}
    {...props}
  />
);
