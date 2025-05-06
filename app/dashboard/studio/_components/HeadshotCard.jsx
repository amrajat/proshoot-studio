"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Assuming you have a utility for classnames
import { useToast } from "@/hooks/use-toast";
import { toggleFavoriteAction } from "../_actions/favoriteActions"; // We'll create this next

export function HeadshotCard({ headshot, studioId, initialIsFavorited }) {
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isPending, startTransition] = useTransition();

  const handleToggleFavorite = () => {
    startTransition(async () => {
      const result = await toggleFavoriteAction({
        studioId: studioId,
        headshotId: headshot.id,
        isCurrentlyFavorited: isFavorited,
      });

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error updating favorite",
          description: result.error,
        });
      } else {
        setIsFavorited(result.newFavoriteState);
        toast({
          title: result.newFavoriteState
            ? "Added to favorites"
            : "Removed from favorites",
        });
      }
    });
  };

  return (
    <div className="aspect-square relative overflow-hidden rounded-md border group">
      <Image
        src={headshot.image_url}
        alt={`Result headshot ${headshot.id}`}
        fill
        style={{ objectFit: "cover" }}
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        priority
      />
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-2 right-2 h-8 w-8 p-1.5 rounded-full",
          "bg-black/30 hover:bg-black/60 text-white",
          "opacity-0 group-hover:opacity-100 transition-opacity",
          isPending && "animate-pulse"
        )}
        onClick={handleToggleFavorite}
        disabled={isPending}
        aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          className={cn(
            "h-full w-full transition-colors",
            isFavorited
              ? "fill-red-500 text-red-500"
              : "fill-transparent text-white"
          )}
        />
      </Button>
    </div>
  );
}
