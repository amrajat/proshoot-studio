"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  AlertCircle,
  Camera,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CenteredLoader,
  ButtonLoader,
} from "@/components/shared/universal-loader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { fetchStudio } from "../../actions/studio/fetchStudio";
import { toggleFavorite } from "../../actions/studio/toggleFavorite";
import { updateStudioStatus } from "../../actions/studio/updateStudioStatus";
import HeadshotImage from "./HeadshotImage";

/**
 * Studio Detail Client Component
 * Handles studio detail view with headshots and favorites
 */
export default function StudioDetailClient({ studioId, currentUserId }) {
  const router = useRouter();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studio, setStudio] = useState(null);
  const [headshots, setHeadshots] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [togglingFavorites, setTogglingFavorites] = useState(new Set());
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Fetch studio data
  const fetchStudioData = useCallback(async () => {
    if (!studioId || !currentUserId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchStudio(studioId, currentUserId);

      if (result.success) {
        setStudio(result.studio);
        setHeadshots(result.headshots);
        setFavorites(result.favorites);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError({ message: "Failed to load studio data. Please try again." });
    }

    setIsLoading(false);
  }, [studioId, currentUserId]);

  // Handle favorite toggle
  const handleToggleFavorite = useCallback(
    async (headshotId) => {
      if (!studio || togglingFavorites.has(headshotId)) return;

      // Determine current favorite status
      const isFavorite = favorites.some(
        (fav) => fav.headshot_id === headshotId
      );

      // Add to toggling set
      setTogglingFavorites((prev) => new Set(prev).add(headshotId));

      try {
        const result = await toggleFavorite(
          headshotId,
          studio.id,
          currentUserId,
          isFavorite
        );

        if (result.success) {
          if (result.isFavorite) {
            // Added to favorites - we need to fetch the headshot details
            const headshot = headshots.find((h) => h.id === headshotId);
            if (headshot) {
              setFavorites((prev) => [
                ...prev,
                {
                  id: `temp-${headshotId}`,
                  headshot_id: headshotId,
                  headshots: headshot,
                  created_at: new Date().toISOString(),
                },
              ]);
            }
          } else {
            // Removed from favorites
            setFavorites((prev) =>
              prev.filter((fav) => fav.headshot_id !== headshotId)
            );
          }

          toast({
            title: result.isFavorite
              ? "Added to favorites"
              : "Removed from favorites",
            description: result.isFavorite
              ? "Headshot saved to your favorites."
              : "Headshot removed from favorites.",
          });
        } else {
          toast({
            title: "Error",
            description:
              result.error?.message || "Failed to update favorite status.",
            variant: "destructive",
          });
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }

      // Remove from toggling set
      setTogglingFavorites((prev) => {
        const newSet = new Set(prev);
        newSet.delete(headshotId);
        return newSet;
      });
    },
    [studio, favorites, headshots, currentUserId, toast, togglingFavorites]
  );

  // Handle studio status update
  const handleStatusUpdate = useCallback(
    async (newStatus) => {
      if (!studio || isUpdatingStatus) return;

      setIsUpdatingStatus(true);

      try {
        const result = await updateStudioStatus(studio.id, newStatus);

        if (result.success) {
          toast({
            title: "Studio Updated",
            description: result.message,
          });

          // Update local studio state
          setStudio((prev) => ({
            ...prev,
            status: newStatus,
          }));

          // Refresh data to ensure consistency
          await fetchStudioData();
        } else {
          toast({
            title: "Error",
            description:
              result.error?.message || "Failed to update studio status.",
            variant: "destructive",
          });
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }

      setIsUpdatingStatus(false);
    },
    [studio, isUpdatingStatus, toast, fetchStudioData]
  );

  // Create favorite lookup for performance
  const favoriteHeadshotIds = useMemo(() => {
    return new Set(favorites.map((fav) => fav.headshot_id));
  }, [favorites]);

  // Load data on mount
  useEffect(() => {
    fetchStudioData();
  }, [fetchStudioData]);

  // Loading state
  if (isLoading) {
    return <CenteredLoader text="Loading studio details" />;
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // No studio found
  if (!studio) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center py-12">
          <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Studio Not Found</h3>
          <p className="text-muted-foreground">
            The requested studio could not be found.
          </p>
        </div>
      </div>
    );
  }

  const isCompleted = studio.status === "COMPLETED";
  const isAccepted = studio.status === "ACCEPTED";

  // Determine user role for this studio
  const isStudioCreator = studio.creator_user_id === currentUserId;
  const isOrganizationOwner = !isStudioCreator; // If not creator but has access, must be org owner
  const canToggleFavorites = isStudioCreator; // Only studio creators can toggle favorites

  // For ACCEPTED status, separate images by type
  const resultImages = isAccepted ? headshots.filter((h) => h.result) : [];
  const hdImages = isAccepted ? headshots.filter((h) => h.hd) : [];
  const hasAnyHdImages = hdImages.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {studio.name}
              </h1>
              <Badge
                variant={
                  studio.status === "COMPLETED" ? "default" : "secondary"
                }
              >
                {studio.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Status Action Buttons - Only for Studio Creators */}
        {isStudioCreator && isCompleted && (
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => handleStatusUpdate("ACCEPTED")}
            disabled={isUpdatingStatus}
          >
            {isUpdatingStatus ? (
              <ButtonLoader />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isUpdatingStatus ? "Updating..." : "Remove Watermarks"}
          </Button>
        )}

        {isStudioCreator && isAccepted && (
          <Button
            variant="destructive"
            className="gap-2"
            onClick={() => handleStatusUpdate("DELETED")}
            disabled={isUpdatingStatus}
          >
            {isUpdatingStatus ? (
              <ButtonLoader />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {isUpdatingStatus ? "Deleting..." : "Delete Studio"}
          </Button>
        )}
      </div>

      {/* Content - Different layouts for COMPLETED vs ACCEPTED */}
      {isCompleted ? (
        // COMPLETED Status: Single section with preview images
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Generated Headshots
            </CardTitle>
            <CardDescription>
              {headshots.length} preview images available
            </CardDescription>
          </CardHeader>
          <CardContent>
            {headshots.length === 0 ? (
              <div className="text-center py-12">
                <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Images Available
                </h3>
                <p className="text-muted-foreground">
                  No preview images have been generated yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {headshots.map((headshot, index) => (
                  <HeadshotImage
                    key={headshot.id}
                    index={index}
                    headshot={headshot}
                    showFavoriteToggle={false}
                    preferredImageType="preview"
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        // ACCEPTED Status: Three separate sections
        <div className="space-y-8">
          {/* Section 1: Your Favorite Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Favorite Headshots
              </CardTitle>
              <CardDescription>
                {favorites.reduce((total, fav) => {
                  let count = 0;
                  const headshot = fav.headshots_secure || fav.headshots;
                  if (headshot?.result) count++;
                  if (headshot?.hd) count++;
                  return total + count;
                }, 0)}{" "}
                favorite images (both SD and 4K versions)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {favorites.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Favorites Yet
                  </h3>
                  <p className="text-muted-foreground">
                    Start adding headshots to your favorites from the sections
                    below.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {favorites
                    .map((favorite) => {
                      const favoriteImages = [];
                      const headshot =
                        favorite.headshots_secure || favorite.headshots;

                      // Add result image if it exists
                      if (headshot?.result) {
                        favoriteImages.push({
                          ...headshot,
                          key: `${favorite.id}-result`,
                          preferredType: "result",
                        });
                      }

                      // Add HD image if it exists
                      if (headshot?.hd) {
                        favoriteImages.push({
                          ...headshot,
                          key: `${favorite.id}-hd`,
                          preferredType: "hd",
                        });
                      }

                      return favoriteImages.map((imageData, index) => (
                        <HeadshotImage
                          key={imageData.key}
                          index={index}
                          headshot={imageData}
                          showFavoriteToggle={canToggleFavorites}
                          isFavorite={true}
                          onToggleFavorite={handleToggleFavorite}
                          isTogglingFavorite={togglingFavorites.has(
                            headshot.id
                          )}
                          preferredImageType={imageData.preferredType}
                        />
                      ));
                    })
                    .flat()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 2: Your Headshots (Result Images) */}
          {resultImages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Headshots
                </CardTitle>
                <CardDescription>
                  {resultImages.length} high-quality headshot images
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resultImages.length === 0 ? (
                  <div className="text-center py-12">
                    <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Result Images
                    </h3>
                    <p className="text-muted-foreground">
                      No result images available for this studio.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {resultImages.map((headshot, index) => {
                      const isFavorite = favoriteHeadshotIds.has(headshot.id);
                      const isToggling = togglingFavorites.has(headshot.id);
                      return (
                        <HeadshotImage
                          key={headshot.id}
                          index={index}
                          headshot={headshot}
                          showFavoriteToggle={canToggleFavorites}
                          isFavorite={isFavorite}
                          onToggleFavorite={handleToggleFavorite}
                          isTogglingFavorite={isToggling}
                          preferredImageType="result"
                        />
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Section 3: Your 4K Print Ready Headshots (HD Images) - Only show if any HD images exist */}
          {hasAnyHdImages && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  4K Print Ready Headshots
                </CardTitle>
                <CardDescription>
                  {hdImages.length} ultra high-resolution images perfect for
                  printing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {hdImages.map((headshot, index) => {
                    const isFavorite = favoriteHeadshotIds.has(headshot.id);
                    const isToggling = togglingFavorites.has(headshot.id);
                    return (
                      <HeadshotImage
                        key={headshot.id}
                        index={index}
                        headshot={headshot}
                        showFavoriteToggle={canToggleFavorites}
                        isFavorite={isFavorite}
                        onToggleFavorite={handleToggleFavorite}
                        isTogglingFavorite={isToggling}
                        preferredImageType="hd"
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
