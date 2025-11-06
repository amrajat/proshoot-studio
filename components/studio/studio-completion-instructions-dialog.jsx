"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Sparkles, ImageIcon, Wand2, RefreshCw, AlertCircle } from "lucide-react";

/**
 * Studio Completion Instructions Dialog
 * 
 * Displays important instructions when a studio is completed.
 * Shows automatically on first visit, can be manually triggered.
 * 
 * @param {Object} props
 * @param {boolean} props.open - Control dialog visibility
 * @param {Function} props.onOpenChange - Callback when dialog open state changes
 * @param {string} props.studioId - Studio ID for localStorage tracking
 * @param {boolean} props.autoShow - Whether to auto-show on mount (default: true)
 */
export default function StudioCompletionInstructionsDialog({
  open,
  onOpenChange,
  studioId,
  autoShow = true,
}) {
  const [hasSeenInstructions, setHasSeenInstructions] = useState(true);

  // Check if user has seen instructions for this studio
  useEffect(() => {
    if (!studioId || !autoShow) return;

    const storageKey = `studio-instructions-seen-${studioId}`;
    const seen = localStorage.getItem(storageKey);

    if (!seen) {
      setHasSeenInstructions(false);
      onOpenChange?.(true);
    }
  }, [studioId, autoShow, onOpenChange]);

  // Mark instructions as seen when dialog closes
  const handleOpenChange = (isOpen) => {
    if (!isOpen && studioId) {
      const storageKey = `studio-instructions-seen-${studioId}`;
      localStorage.setItem(storageKey, "true");
      setHasSeenInstructions(true);
    }
    onOpenChange?.(isOpen);
  };

  const instructions = [
    {
      icon: Sparkles,
      text: "You should expect 2–10 high-quality headshots (depending on plan). Please note that not every image will be perfect.",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      icon: ImageIcon,
      text: "You can preview all headshots before accepting them. Once you’re happy with the results, you can remove the watermarks and download all of them.",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      icon: Wand2,
      text: "After removing watermarks, you’ll get access to our Powerful AI Editor to make any changes — such as adjusting outfits, backgrounds, or other details.",
      color: "text-pink-600 dark:text-pink-400",
      bgColor: "bg-pink-50 dark:bg-pink-950/30",
    },
    {
      icon: RefreshCw,
      text: "Love a particular headshot? Use the “Generate Similar” feature to create more images in the same style.",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30",
    },
    {
      icon: AlertCircle,
      text: "If your images have distortions or you don’t receive a single usable headshot, please contact support for a free redo or refund.",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Your headshots are ready!
              </DialogTitle>
              <DialogDescription className="text-base mt-1">
                Before you proceed, please review these important points.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          {instructions.map((instruction, index) => {
            const Icon = instruction.icon;
            return (
              <div
                key={index}
                className={`flex gap-4 p-4 rounded-[14px] border border-border/50 ${instruction.bgColor}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-gray-900 shadow-sm ${instruction.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300 pt-1.5">
                  {instruction.text}
                </p>
              </div>
            );
          })}
        </div>

      </DialogContent>
    </Dialog>
  );
}
