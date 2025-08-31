"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  Camera,
  Sparkles,
  RemoveFormatting,
  Trash2,
  Images,
  Heart,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { fetchStudio } from "../../actions/studio/fetchStudio";
import { toggleFavorite } from "../../actions/studio/toggleFavorite";
import { updateStudioStatus } from "../../actions/studio/updateStudioStatus";
import HeadshotImage from "./HeadshotImage";
import StudioStatusMessage from "./StudioStatusMessage";
import { PhotoProvider } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

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
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

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

          if (result.isFavorite) {
            toast.success("Added to favorites");
          } else {
            toast.success("Removed from favorites");
          }
        } else {
          toast.error(
            result.error?.message || "Failed to update favorite status."
          );
        }
      } catch (err) {
        toast.error("An unexpected error occurred. Please try again.");
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
          toast.success("Studio Updated");

          // Update local studio state
          setStudio((prev) => ({
            ...prev,
            status: newStatus,
          }));

          // Refresh data to ensure consistency
          await fetchStudioData();
        } else {
          toast.error(
            result.error?.message || "Failed to update studio status."
          );
        }
      } catch (err) {
        toast.error("An unexpected error occurred. Please try again.");
      }

      setIsUpdatingStatus(false);
      setConfirmDialogOpen(false);
      setPendingAction(null);
    },
    [studio, isUpdatingStatus, toast, fetchStudioData]
  );

  // Handle confirmation dialog
  const handleConfirmAction = () => {
    if (pendingAction) {
      handleStatusUpdate(pendingAction.status);
    }
  };

  const handleCancelAction = () => {
    setConfirmDialogOpen(false);
    setPendingAction(null);
  };

  const openConfirmDialog = (status, title, description) => {
    setPendingAction({ status, title, description });
    setConfirmDialogOpen(true);
  };

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

  // Handle status message actions
  const handleStatusAction = (status) => {
    switch (status) {
      case "FAILED":
        // Dummy retry action
        toast.success("support@proshoot.co");
        break;
      case "PAYMENT_PENDING":
        // Dummy payment redirect
        toast.success("Contact our support.");
        break;
      case "REFUNDED":
        // Dummy contact support
        toast.success("Contact our support.");
        break;
      default:
        break;
    }
  };

  const isCompleted = studio.status === "COMPLETED";
  const isAccepted = studio.status === "ACCEPTED";
  const shouldShowStatusMessage = [
    "FAILED",
    "PAYMENT_PENDING",
    "PROCESSING",
    "REFUNDED",
    "DELETED",
  ].includes(studio.status);

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
      <div className="flex items-center justify-end mb-6">
        {/* Status Action Buttons - Only for Studio Creators */}
        {isStudioCreator && isCompleted && (
          <AlertDialog
            open={confirmDialogOpen && pendingAction?.status === "ACCEPTED"}
            onOpenChange={setConfirmDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="default"
                className="gap-2"
                onClick={() =>
                  openConfirmDialog(
                    "ACCEPTED",
                    "Remove Watermarks",
                    "Removing watermarks indicates that you are satisfied with your headshots. Please keep in mind that once you remove the watermarks, you will not be eligible for any refunds."
                  )
                }
                disabled={isUpdatingStatus}
              >
                <RemoveFormatting className="h-4 w-4" />
                Remove Watermarks
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>A quick heads-up!</AlertDialogTitle>
                <AlertDialogDescription>
                  Removing watermarks indicates that you are satisfied with your
                  headshots. Please keep in mind that once you remove the
                  watermarks, you will not be eligible for any refunds.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={handleCancelAction}
                  disabled={isUpdatingStatus}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmAction}
                  disabled={isUpdatingStatus}
                  className="gap-2"
                >
                  {isUpdatingStatus ? (
                    <ButtonLoader />
                  ) : (
                    <RemoveFormatting className="h-4 w-4" />
                  )}
                  {isUpdatingStatus ? "Removing..." : "Remove Watermarks"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {isStudioCreator && isAccepted && (
          <AlertDialog
            open={confirmDialogOpen && pendingAction?.status === "DELETED"}
            onOpenChange={setConfirmDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="gap-2"
                onClick={() =>
                  openConfirmDialog(
                    "DELETED",
                    "Delete Studio",
                    "This will permanently delete this studio and all associated images. This action cannot be undone and you will lose access to all generated headshots."
                  )
                }
                disabled={isUpdatingStatus}
              >
                <Trash2 className="h-4 w-4" />
                Delete Studio
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Studio</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this studio and all associated
                  images. This action cannot be undone and you will lose access
                  to all generated headshots.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={handleCancelAction}
                  disabled={isUpdatingStatus}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmAction}
                  disabled={isUpdatingStatus}
                  variant="destructive"
                  className="gap-2 !bg-destructive"
                >
                  {isUpdatingStatus ? (
                    <ButtonLoader />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  {isUpdatingStatus ? "Deleting..." : "Delete Studio"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Content - Different layouts for COMPLETED vs ACCEPTED */}
      {!shouldShowStatusMessage && isCompleted ? (
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
              <PhotoProvider
                maskOpacity={0.8}
                speed={() => 300}
                easing={(type) =>
                  type === 2
                    ? "cubic-bezier(0.36, 0, 0.66, -0.56)"
                    : "cubic-bezier(0.34, 1.56, 0.64, 1)"
                }
              >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {headshots.map((headshot, index) => (
                    <HeadshotImage
                      key={headshot.id}
                      index={index}
                      headshot={headshot}
                      showFavoriteToggle={false}
                      preferredImageType="preview"
                      allImages={headshots}
                    />
                  ))}
                </div>
              </PhotoProvider>
            )}
          </CardContent>
        </Card>
      ) : !shouldShowStatusMessage ? (
        // ACCEPTED Status: Three separate sections
        <div className="space-y-8">
          {/* Section 1: Your Favorite Images */}
          {favorites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
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
                  <PhotoProvider
                    maskOpacity={0.8}
                    speed={() => 300}
                    easing={(type) =>
                      type === 2
                        ? "cubic-bezier(0.36, 0, 0.66, -0.56)"
                        : "cubic-bezier(0.34, 1.56, 0.64, 1)"
                    }
                  >
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

                          return favoriteImages;
                        })
                        .flat()
                        .map((imageData, index, allFavoriteImages) => (
                          <HeadshotImage
                            key={imageData.key}
                            index={index}
                            headshot={imageData}
                            showFavoriteToggle={canToggleFavorites}
                            isFavorite={true}
                            onToggleFavorite={handleToggleFavorite}
                            isTogglingFavorite={togglingFavorites.has(
                              imageData.id
                            )}
                            preferredImageType={imageData.preferredType}
                            allImages={allFavoriteImages}
                          />
                        ))}
                    </div>
                  </PhotoProvider>
                )}
              </CardContent>
            </Card>
          )}

          {/* Section 2: Your Headshots (Result Images) */}
          {resultImages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Images className="h-5 w-5" />
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
                  <PhotoProvider
                    maskOpacity={0.8}
                    speed={() => 300}
                    easing={(type) =>
                      type === 2
                        ? "cubic-bezier(0.36, 0, 0.66, -0.56)"
                        : "cubic-bezier(0.34, 1.56, 0.64, 1)"
                    }
                  >
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
                            allImages={resultImages}
                          />
                        );
                      })}
                    </div>
                  </PhotoProvider>
                )}
              </CardContent>
            </Card>
          )}

          {/* Section 3: Your 4K Print Ready Headshots (HD Images) - Only show if any HD images exist */}
          {hasAnyHdImages && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {/* <Sparkles className="h-5 w-5" /> */}
                  <svg
                    id="Layer_1"
                    data-name="Layer 1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 122.88 80.11"
                    className="size-5"
                  >
                    <defs>
                      <style
                        dangerouslySetInnerHTML={{
                          __html:
                            ".cls-1{fill:#ffcb00;}.cls-2{fill:#262626;}.cls-3{fill:#fd5;}",
                        }}
                      />
                    </defs>
                    <title>4k</title>
                    <path
                      className="cls-1"
                      d="M14.18,0H108.7a14.19,14.19,0,0,1,14.18,14.18V65.93A14.22,14.22,0,0,1,114.12,79a14.05,14.05,0,0,1-5.42,1.08H14.18A14.15,14.15,0,0,1,4.17,76h0A14.15,14.15,0,0,1,0,65.93V14.18A14.19,14.19,0,0,1,14.18,0Z"
                    />
                    <path
                      className="cls-2"
                      d="M16.07,7.25H106.8a6.81,6.81,0,0,1,2.65.52,6.7,6.7,0,0,1,2.25,1.51,7,7,0,0,1,1.52,2.26,6.72,6.72,0,0,1,.52,2.64V65.93a6.9,6.9,0,0,1-.52,2.64,7,7,0,0,1-1.52,2.26,6.88,6.88,0,0,1-2.25,1.52,7,7,0,0,1-2.65.52H16.07a6.81,6.81,0,0,1-4.89-2,7,7,0,0,1-1.52-2.26,6.72,6.72,0,0,1-.52-2.64V14.18a6.72,6.72,0,0,1,.52-2.64,7,7,0,0,1,1.52-2.26,6.7,6.7,0,0,1,2.25-1.51,6.79,6.79,0,0,1,2.64-.52Z"
                    />
                    <path
                      className="cls-3"
                      d="M39.7,53.22H19V43.86L39.7,19.22h9.9V44.41h5.15v8.81H49.6v7.67H39.7V53.22ZM60.46,19.91H73.11V35.39L86.38,19.91h16.84l-15,15.39,15.65,25.59H88.33L79.68,44.06l-6.57,6.85v10H60.46v-41ZM39.7,44.41V31.47l-11,12.94Z"
                    />
                  </svg>
                  4K Print Ready Headshots
                </CardTitle>
                <CardDescription>
                  {hdImages.length} ultra high-resolution images perfect for
                  printing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PhotoProvider
                  maskOpacity={0.8}
                  speed={() => 300}
                  easing={(type) =>
                    type === 2
                      ? "cubic-bezier(0.36, 0, 0.66, -0.56)"
                      : "cubic-bezier(0.34, 1.56, 0.64, 1)"
                  }
                >
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
                          allImages={hdImages}
                        />
                      );
                    })}
                  </div>
                </PhotoProvider>
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}

      {/* Studio Status Message for specific statuses */}
      {shouldShowStatusMessage && (
        <div className="space-y-8">
          <StudioStatusMessage
            status={studio.status}
            onAction={handleStatusAction}
          />
        </div>
      )}
    </div>
  );
}
