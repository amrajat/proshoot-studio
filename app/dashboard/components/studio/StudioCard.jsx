import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Building, User, Clock } from "lucide-react";

/**
 * Studio Card Component
 *
 * Displays a studio in a card format with consistent styling.
 * Shows real images for ACCEPTED status, placeholder for others.
 * Follows the existing UI patterns from backgrounds/clothing/billing pages.
 *
 * @param {Object} studio - Studio data object
 * @param {string} studio.id - Studio ID
 * @param {string} studio.name - Studio name
 * @param {string} studio.status - Studio status
 * @param {string} studio.created_at - Studio creation date
 * @param {string} [studio.imageUrl] - Secure image URL for ACCEPTED studios
 * @param {Object} [studio.organizations] - Organization data (if applicable)
 */
export default function StudioCard({ studio }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStudioImageUrl = (studio) => {
    // Show real image only for ACCEPTED status with secure URL
    if (studio.status === "ACCEPTED" && studio.imageUrl) {
      return studio.imageUrl;
    }
    // Use placeholder for all other cases
    return "/images/placeholder.svg";
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "default";
      case "processing":
        return "success";
      case "failed":
        return "destructive";
      case "accepted":
        return "success";
      case "refunded":
        return "destructive";
      case "deleted":
        return "destructive";
      case "payment_pending":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Card className="group overflow-hidden transition-all duration-200 hover:shadow-none ring-1 ring-muted-foreground/15">
      <div className="relative">
        {/* Studio Image - 1:1 Square Ratio */}
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          <Image
            src={getStudioImageUrl(studio)}
            alt={`${studio.name} preview`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={false}
            unoptimized={true}
          />
        </div>

        {/* Status Badge */}
        {!(getStatusVariant(studio.status) == "ACCEPTED") && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2">
            <Badge variant={getStatusVariant(studio.status)}>
              {studio.status}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Studio Name */}
        <h3
          className="font-semibold text-lg leading-tight mb-2 truncate"
          title={studio.name}
        >
          <Link
            href={`/dashboard/studio/${studio.id}`}
            className="hover:underline"
          >
            {studio.name}
          </Link>
        </h3>

        {/* Organization Info */}
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          {studio.organizations ? (
            <>
              <Building className="mr-1.5 h-4 w-4" />
              <span className="truncate" title={studio.organizations.name}>
                {studio.organizations.name}
              </span>
            </>
          ) : (
            <>
              <User className="mr-1.5 h-4 w-4" />
              <span>Personal</span>
            </>
          )}
        </div>

        {/* Created Date */}
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <Clock className="mr-1.5 h-4 w-4" />
          <span>{formatDate(studio.created_at)}</span>
        </div>
      </CardContent>
      {/* Actions */}
      {/* TODO: DISABLE THIS BUTTON BASED ON THE STUDIO STATUS */}
      <Button
        asChild
        variant="default"
        size="sm"
        className="w-full rounded-none border-none shadow"
      >
        <Link href={`/dashboard/studio/${studio.id}`}>View</Link>
      </Button>
    </Card>
  );
}
