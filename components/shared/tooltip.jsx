import React from "react";
import {
  Tooltip as ShadCNTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react"; // Import the question icon from lucide-react

const Tooltip = ({ content, icon: Icon = HelpCircle }) => {
  return (
    <TooltipProvider>
      <ShadCNTooltip>
        <TooltipTrigger className="inline-flex items-center">
          <Icon className="w-4 h-4 mr-1" />
        </TooltipTrigger>
        <TooltipContent className="leading-normal">
          <p>{content}</p>
        </TooltipContent>
      </ShadCNTooltip>
    </TooltipProvider>
  );
};

export default Tooltip;
