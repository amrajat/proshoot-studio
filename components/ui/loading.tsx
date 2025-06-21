import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  rows?: number;
}

export const LoadingSkeleton = ({
  className,
  rows = 2,
}: LoadingSkeletonProps) => (
  <div
    className={cn("space-y-4", className)}
    role="status"
    aria-label="Loading content"
    tabIndex={0}
  >
    {Array.from({ length: rows }).map((_, index) => (
      <Skeleton
        key={index}
        className={index === 0 ? "h-8 w-1/2" : "h-20 w-full"}
        aria-hidden="true"
      />
    ))}
    <span className="sr-only">Loading...</span>
  </div>
);

interface ErrorMessageProps {
  message: string;
  className?: string;
  onRetry?: () => void;
}

export const ErrorMessage = ({
  message,
  className,
  onRetry,
}: ErrorMessageProps) => (
  <div
    className={cn("text-center p-8", className)}
    role="alert"
    aria-live="polite"
    tabIndex={0}
  >
    <p className="text-muted-foreground mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onRetry();
          }
        }}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        tabIndex={0}
        aria-label="Retry operation"
      >
        Try Again
      </button>
    )}
  </div>
);
