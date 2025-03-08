import { OctagonAlert, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

function Error({
  message,
  details,
  errorCode,
  onRetry,
  retryLabel = "Try Again",
}) {
  return (
    <div
      className="bg-red-50 border-s-4 border-red-500 p-4 rounded-md"
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          {/* Icon */}
          <span className="inline-flex justify-center items-center size-8 rounded border-4 border-red-100 bg-red-200 text-red-800">
            <OctagonAlert className="flex-shrink-0 size-4" />
          </span>
          {/* End Icon */}
        </div>
        <div className="ms-3 flex-grow">
          <h3 className="text-gray-800 font-semibold">
            {errorCode ? `Error ${errorCode}: ` : ""}
            {message || "Oops! Something went wrong"}
          </h3>
          {details && <p className="text-sm text-gray-700 mt-1">{details}</p>}
          {!details && !message && (
            <p className="text-sm text-gray-700 mt-1">
              Something went wrong! Please contact our support team.
            </p>
          )}
          {onRetry && (
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="flex items-center text-sm"
              >
                <RefreshCw className="mr-2 h-3 w-3" />
                {retryLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Error;
