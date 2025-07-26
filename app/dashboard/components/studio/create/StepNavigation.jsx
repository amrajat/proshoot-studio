/**
 * Step Navigation Component
 * Progress indicator and navigation for the studio creation wizard
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";

const StepNavigation = ({ 
  steps, 
  currentStep, 
  onStepClick, 
  disabled = false,
  isStepValid = () => true // Function to check if a step is valid/completed
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Desktop Progress Bar */}
          <div className="hidden md:flex items-center space-x-2 flex-1">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`
                      flex items-center space-x-2 px-3 py-2 rounded-lg transition-all
                      ${step.isActive 
                        ? "bg-primary text-primary-foreground" 
                        : step.isCompleted 
                          ? "bg-green-100 text-green-700 hover:bg-green-200" 
                          : "text-muted-foreground hover:bg-muted"
                      }
                      ${disabled || (!step.isCompleted && index > currentStep && !isStepValid(index)) 
                        ? "cursor-not-allowed opacity-50" 
                        : "cursor-pointer"
                      }
                    `}
                    onClick={() => {
                      if (disabled) return;
                      // Allow clicking on current step, completed steps, or valid future steps
                      if (index <= currentStep || step.isCompleted || isStepValid(index)) {
                        onStepClick(index);
                      }
                    }}
                    disabled={disabled || (!step.isCompleted && index > currentStep && !isStepValid(index))}
                  >
                    {step.isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Circle 
                        className={`h-4 w-4 ${
                          step.isActive ? "fill-current" : ""
                        }`} 
                      />
                    )}
                    <span className="text-sm font-medium">
                      {step.title}
                    </span>
                  </Button>
                </div>
                
                {/* Connector */}
                {index < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Mobile Progress Indicator */}
          <div className="md:hidden flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                Step {currentStep + 1} of {steps.length}
              </Badge>
              <span className="text-sm font-medium">
                {steps[currentStep]?.title}
              </span>
            </div>
            
            {/* Mobile Progress Bar */}
            <div className="flex items-center space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`
                    h-2 w-8 rounded-full transition-all
                    ${index <= currentStep 
                      ? "bg-primary" 
                      : "bg-muted"
                    }
                  `}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Current Step Description */}
        <div className="mt-3 pt-3 border-t">
          <p className="text-sm text-muted-foreground text-center">
            {steps[currentStep]?.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepNavigation;
