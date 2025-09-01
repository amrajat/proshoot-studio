import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import useStudioCreateStore from "@/stores/studioCreateStore";

const StepNavigation = ({
  // Navigation handlers
  onNext,
  onPrevious,

  // Button states
  nextDisabled = false,
  showPrevious = true,
  showReset = true,
  isSubmitting = false,

  // Button text customization
  nextText = "Continue",
  previousText = "Back",

  // Custom next button props
  nextVariant = "default",
  nextSize = "lg",
  nextClassName = "min-w-[120px] mb-4",

  // Custom previous button props
  previousVariant = "outline",
  previousSize = "sm",

  // Custom reset styling
  resetClassName = "flex items-center space-x-1 text-destructive hover:text-destructive/80 underline text-sm disabled:opacity-50",
  resetConfirmMessage = "Are you sure you want to start over? This will clear all your progress.",
}) => {
  const { resetFormCompletely } = useStudioCreateStore();

  const handleReset = () => {
    if (confirm(resetConfirmMessage)) {
      resetFormCompletely();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Next/Continue Button */}
      <Button
        onClick={onNext}
        disabled={nextDisabled}
        variant={nextVariant}
        size={nextSize}
        className={nextClassName}
      >
        {nextText}
        {nextText.toLowerCase().includes("step") && (
          <ChevronRight className="h-4 w-4 ml-2" />
        )}
      </Button>

      {/* Bottom Row: Previous and Reset */}
      <div className="flex items-center justify-center space-x-6">
        {showPrevious && (
          <Button
            variant={previousVariant}
            size={previousSize}
            onClick={onPrevious}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {previousText}
          </Button>
        )}

        {showReset && (
          <button
            onClick={handleReset}
            disabled={isSubmitting}
            className={resetClassName}
          >
            <RotateCw className="size-3" />
            <span>Start over</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default StepNavigation;
