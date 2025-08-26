"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CreditCard, HandCoins, Trash2 } from "lucide-react";
import { InlineLoader } from "@/components/shared/universal-loader";

/**
 * Studio Status Message Component
 * Renders different messages based on studio status with appropriate icons, titles, descriptions, and optional action buttons
 */
const StudioStatusMessage = ({ status, onAction }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case "FAILED":
        return {
          icon: <AlertTriangle className="h-6 w-6 text-destructive" />,
          title: "Studio Generation Failed",
          description:
            "Something went wrong during the headshot generation process. Please contact our support team.",
          buttonText: "Contact Support",
          buttonVariant: "default",
          showButton: true,
          bgColor: "bg-destructive/5",
          borderColor: "border-destructive/20",
        };

      case "PAYMENT_PENDING":
        return {
          icon: <CreditCard className="h-6 w-6 text-warning" />,
          title: "Payment Pending",
          description:
            "Your payment is being processed. Once confirmed, your studio will begin generating headshots automatically.",
          buttonText: "Complete Payment",
          buttonVariant: "default",
          showButton: true,
          bgColor: "bg-warning/5",
          borderColor: "border-warning/20",
        };

      case "PROCESSING":
        return {
          icon: <InlineLoader size="default" showText={false} />,
          title: "Generating Your Headshots",
          description:
            "Your AI headshots are being created. This process typically takes 1-2 hours. You'll receive an email notification when they're ready.",
          buttonText: null,
          buttonVariant: null,
          showButton: false,
          bgColor: "bg-primary/5",
          borderColor: "border-primary/20",
        };

      case "REFUNDED":
        return {
          icon: <HandCoins className="h-6 w-6 text-muted-foreground" />,
          title: "Studio Refunded",
          description:
            "This studio has been refunded. If you have any questions about the refund process, please contact our support team.",
          buttonText: "Contact Support",
          buttonVariant: "outline",
          showButton: true,
          bgColor: "bg-muted/5",
          borderColor: "border-muted/20",
        };

      case "DELETED":
        return {
          icon: <Trash2 className="h-6 w-6 text-muted-foreground" />,
          title: "Studio Deleted",
          description:
            "This studio has been permanently deleted. All associated headshots and data have been removed from our servers.",
          buttonText: null,
          buttonVariant: null,
          showButton: false,
          bgColor: "bg-muted/5",
          borderColor: "border-muted/20",
        };

      default:
        return null;
    }
  };

  const config = getStatusConfig(status);

  if (!config) return null;

  const handleActionClick = () => {
    if (onAction) {
      onAction(status);
    }
  };

  return (
    <div
      className={`min-h-full p-6 md:p-7 ${config.bgColor} rounded-[14px] border ${config.borderColor}`}
    >
      {/* Header with Icon and Title */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-shrink-0">{config.icon}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-lg">
            {config.title}
          </h3>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {config.description}
        </p>
      </div>

      {/* Action Button */}
      {config.showButton && (
        <div className="flex justify-start">
          <Button
            variant={config.buttonVariant}
            onClick={handleActionClick}
            className="gap-2"
          >
            {config.buttonText}
          </Button>
        </div>
      )}
    </div>
  );
};

export default StudioStatusMessage;
