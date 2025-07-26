/**
 * Loading States Components
 * Consistent loading UI components following design system
 */

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

/**
 * Generic loading spinner
 */
export const LoadingSpinner = ({ size = "default", className = "" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };

  return (
    <Loader2 
      className={`animate-spin ${sizeClasses[size]} ${className}`} 
    />
  );
};

/**
 * Full page loading state
 */
export const PageLoading = ({ message = "Loading..." }) => (
  <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
    <LoadingSpinner size="xl" className="text-primary" />
    <p className="text-muted-foreground">{message}</p>
  </div>
);

/**
 * Card loading skeleton
 */
export const CardSkeleton = ({ showHeader = true, lines = 3 }) => (
  <Card>
    {showHeader && (
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
    )}
    <CardContent className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </CardContent>
  </Card>
);

/**
 * Form step loading skeleton
 */
export const StepSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="text-center space-y-2">
      <Skeleton className="h-8 w-64 mx-auto" />
      <Skeleton className="h-4 w-96 mx-auto" />
    </div>
    
    {/* Form fields */}
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
    
    {/* Navigation buttons */}
    <div className="flex justify-between">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
);

/**
 * Credit display loading skeleton
 */
export const CreditSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-5 w-32" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <Skeleton className="h-4 w-16 mx-auto" />
            <Skeleton className="h-8 w-12 mx-auto" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

/**
 * Plan selection loading skeleton
 */
export const PlanSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {Array.from({ length: 3 }).map((_, i) => (
      <Card key={i} className="relative">
        <CardHeader>
          <div className="flex justify-between items-start">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-8 w-20" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    ))}
  </div>
);

/**
 * Image upload loading skeleton
 */
export const ImageUploadSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-square">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      ))}
    </div>
    <div className="flex justify-center">
      <Skeleton className="h-10 w-32" />
    </div>
  </div>
);

/**
 * Style pairing loading skeleton
 */
export const StylePairingSkeleton = () => (
  <div className="space-y-6">
    {Array.from({ length: 3 }).map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

/**
 * Inline loading state for buttons
 */
export const ButtonLoading = ({ children, isLoading, ...props }) => (
  <button {...props} disabled={isLoading || props.disabled}>
    {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
    {children}
  </button>
);
