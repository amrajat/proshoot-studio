/**
 * Header Step Navigation Component
 * Modern progress indicator and navigation for the studio creation wizard
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";

const HeaderStepNavigation = ({
  steps,
  currentStep,
  onStepClick,
  disabled = false,
  isStepValid = () => true,
}) => {
  return (
    <Card className="border-0 shadow-sm bg-gradient-to-r from-background to-muted/20">
      <CardContent className="p-6">
        {/* Desktop Progress Navigation */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-center space-x-3">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                {/* Step Button */}
                <button
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200 text-sm font-medium
                    ${
                      step.isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : step.isCompleted
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    }
                    ${
                      disabled ||
                      (!step.isCompleted &&
                        index > currentStep &&
                        !isStepValid(index))
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }
                  `}
                  onClick={() => {
                    if (disabled) return;
                    if (
                      index <= currentStep ||
                      step.isCompleted ||
                      isStepValid(index)
                    ) {
                      onStepClick(index);
                    }
                  }}
                  disabled={
                    disabled ||
                    (!step.isCompleted &&
                      index > currentStep &&
                      !isStepValid(index))
                  }
                >
                  {/* Step Icon */}
                  {step.isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <div
                      className={`
                        flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold
                        ${
                          step.isActive
                            ? "bg-primary-foreground text-primary"
                            : "bg-muted text-muted-foreground"
                        }
                      `}
                    >
                      {index + 1}
                    </div>
                  )}

                  {/* Step Title */}
                  <span>{step.title}</span>
                </button>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`
                      h-px w-12 transition-all duration-300
                      ${
                        index < currentStep
                          ? "bg-green-400"
                          : index === currentStep
                          ? "bg-primary"
                          : "bg-muted"
                      }
                    `}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Tablet Progress Navigation */}
        <div className="hidden md:block lg:hidden">
          <div className="flex items-center justify-center space-x-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200
                    ${
                      step.isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : step.isCompleted
                        ? "bg-green-50 text-green-700 hover:bg-green-100"
                        : "text-muted-foreground hover:bg-muted/50"
                    }
                  `}
                  onClick={() => {
                    if (disabled) return;
                    if (
                      index <= currentStep ||
                      step.isCompleted ||
                      isStepValid(index)
                    ) {
                      onStepClick(index);
                    }
                  }}
                  disabled={
                    disabled ||
                    (!step.isCompleted &&
                      index > currentStep &&
                      !isStepValid(index))
                  }
                >
                  {step.isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <div
                      className={`
                        flex items-center justify-center w-5 h-5 rounded-full border text-xs font-bold
                        ${
                          step.isActive
                            ? "bg-primary-foreground text-primary border-primary-foreground"
                            : "border-current"
                        }
                      `}
                    >
                      {index + 1}
                    </div>
                  )}
                  <span className="text-sm font-medium">{step.title}</span>
                </Button>

                {index < steps.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Mobile Progress Navigation */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full
                  ${
                    steps[currentStep]?.isCompleted
                      ? "bg-green-100 text-green-700"
                      : "bg-primary text-primary-foreground"
                  }
                `}
              >
                {steps[currentStep]?.isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-bold">{currentStep + 1}</span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-base">
                  {steps[currentStep]?.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Progress Bar */}
          <div className="flex items-center space-x-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`
                  h-2 flex-1 rounded-full transition-all duration-300
                  ${
                    index < currentStep
                      ? "bg-success"
                      : index === currentStep
                      ? "bg-primary"
                      : "bg-muted"
                  }
                `}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeaderStepNavigation;
