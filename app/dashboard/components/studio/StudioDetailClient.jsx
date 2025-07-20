"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAccountContext } from "@/context/AccountContext";
import {
  getStudioDetailsData,
  toggleFavoriteAction,
} from "../../actions/getStudioDetailsData";
import { updateStudioDownloadedStatusAction } from "../../actions/studioActions";
import Image from "next/image";
import { Button } from "@/components/ui/button";
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
import {
  Heart,
  CheckCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  Download,
  Maximize,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ContentLayout } from "@/components/dashboard/sidebar/content-layout";
import { toast } from "sonner";

// Lightbox-like modal for viewing image larger
function ImageModal({ src, alt, onClose }) {
  if (!src) return null;
  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose} // Close on overlay click
    >
      <div
        className="relative max-w-4xl max-h-[90vh] bg-card p-2 rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on image/modal content
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-destructive text-destructive-foreground rounded-full p-1.5 z-10 hover:bg-destructive/80"
          aria-label="Close image view"
        >
          &times;
        </button>
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={800}
          className="object-contain max-h-[85vh] w-auto rounded"
        />
      </div>
    </div>
  );
}

export default function StudioDetailClient({ studioId }) {
  const {
    userId,
    selectedContext,
    isLoading: isContextLoading,
  } = useAccountContext();

  const [studioDetails, setStudioDetails] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [resultHeadshots, setResultHeadshots] = useState([]);
  const [previewHeadshots, setPreviewHeadshots] = useState([]);
  const [canFavorite, setCanFavorite] = useState(false);
  const [viewMode, setViewMode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageTitle, setPageTitle] = useState("Loading Studio...");
  const [lightboxImage, setLightboxImage] = useState(null);
  const [isDownloadAlertOpen, setDownloadAlertOpen] = useState(false);
  const [isUpdatingDownloadStatus, setIsUpdatingDownloadStatus] =
    useState(false);

  const fetchStudioDetails = useCallback(async () => {
    if (isContextLoading || !userId || !selectedContext || !studioId) {
      if (!isContextLoading && !userId && studioId) {
        setError({ message: "User session not found. Please log in again." });
        setPageTitle("Authentication Error");
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const contextType = selectedContext.type;
      const contextId =
        selectedContext.type === "organization" ? selectedContext.id : null;

      if (selectedContext.type === "organization" && !contextId) {
        setError({
          message: "Organization context is selected but ID is missing.",
        });
        setPageTitle("Context Error");
        setIsLoading(false);
        return;
      }

      const result = await getStudioDetailsData(
        userId,
        studioId,
        contextType,
        contextId
      );

      if (result.error || !result.studio) {
        setError(result.error || { message: "Studio not found." });
        setPageTitle("Studio Not Found");
        setStudioDetails(null);
        setFavorites([]);
        setResultHeadshots([]);
        setPreviewHeadshots([]);
      } else {
        setStudioDetails(result.studio);
        setFavorites(result.favorites || []);
        setResultHeadshots(result.resultHeadshots || []);
        setPreviewHeadshots(result.previewHeadshots || []);
        setCanFavorite(result.canFavorite);
        setViewMode(result.viewMode);
        setPageTitle(result.studio.name || "Studio Details");
      }
    } catch (e) {
      console.error("Client fetchStudioDetails error:", e);
      setError({ message: e.message || "An unexpected error occurred." });
      setPageTitle("Error");
    }
    setIsLoading(false);
  }, [userId, studioId, selectedContext, isContextLoading]);

  useEffect(() => {
    if (studioId) {
      fetchStudioDetails();
    }
  }, [fetchStudioDetails, studioId]);

  useEffect(() => {
    if (!studioDetails) return;
    let logSection = "unknown";
    let favoritesCount = 0;
    let previewCount = 0;
    let otherCount = 0;
    if (!studioDetails.downloaded) {
      logSection = "preview";
      previewCount = previewHeadshots.length;
    } else if (viewMode === "admin_viewing_member_studio") {
      logSection = "admin_favorites_only";
      favoritesCount = favorites.length;
    } else if (
      studioDetails &&
      userId &&
      studioDetails.creator_user_id === userId
    ) {
      logSection = "creator_favorites_and_results";
      favoritesCount = favorites.length;
      otherCount = resultHeadshots.length;
    } else {
      logSection = "all_results";
      otherCount = resultHeadshots.length;
    }
  }, [studioDetails, viewMode, favorites, resultHeadshots, userId, studioId]);

  const handleToggleFavorite = async (headshotId, currentIsFavorite) => {
    if (!canFavorite || !userId || !studioId) return;

    // Optimistically update UI
    setFavorites((prevFavorites) =>
      prevFavorites
        .map((h) =>
          h.id === headshotId ? { ...h, isFavorite: !currentIsFavorite } : h
        )
        .sort(
          (a, b) =>
            b.isFavorite - a.isFavorite ||
            new Date(a.created_at) - new Date(b.created_at)
        )
    );

    try {
      const result = await toggleFavoriteAction(
        userId,
        studioId,
        headshotId,
        currentIsFavorite
      );
      if (result.error) {
        toast.error(
          `Failed to ${currentIsFavorite ? "unfavorite" : "favorite"}: ${
            result.error.message
          }`
        );
        // Revert optimistic update
        setFavorites((prevFavorites) =>
          prevFavorites
            .map((h) =>
              h.id === headshotId ? { ...h, isFavorite: currentIsFavorite } : h
            )
            .sort(
              (a, b) =>
                b.isFavorite - a.isFavorite ||
                new Date(a.created_at) - new Date(b.created_at)
            )
        );
      } else {
        toast.success(
          `Image ${result.newFavoriteStatus ? "favorited" : "unfavorited"}!`
        );
        // Optional: re-fetch or ensure server state matches if needed, but optimistic should be fine here.
      }
    } catch (e) {
      toast.error("An error occurred while updating favorite status.");
      // Revert optimistic update
      setFavorites((prevFavorites) =>
        prevFavorites
          .map((h) =>
            h.id === headshotId ? { ...h, isFavorite: currentIsFavorite } : h
          )
          .sort(
            (a, b) =>
              b.isFavorite - a.isFavorite ||
              new Date(a.created_at) - new Date(b.created_at)
          )
      );
    }
  };

  const handleConfirmDownload = async () => {
    if (!studioDetails || !userId || studioDetails.creator_user_id !== userId) {
      toast.error(
        "You are not authorized to perform this action or studio details are missing."
      );
      return;
    }
    setIsUpdatingDownloadStatus(true);
    setDownloadAlertOpen(false);

    try {
      const result = await updateStudioDownloadedStatusAction(
        studioDetails.id,
        userId
      );
      if (result.error) {
        toast.error(
          result.error.message || "Failed to mark studio as downloaded."
        );
      } else {
        toast.success(result.message || "Studio marked as downloaded!");
        fetchStudioDetails();
      }
    } catch (e) {
      toast.error("An unexpected error occurred while downloading the studio.");
      console.error("Error in handleConfirmDownload:", e);
    } finally {
      setIsUpdatingDownloadStatus(false);
    }
  };

  if (isContextLoading) {
    return (
      <ContentLayout title="Loading Studio...">
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="h-10 w-10 text-muted-foreground animate-spin" />
          <p className="ml-3 text-muted-foreground text-lg">
            Initializing account...
          </p>
        </div>
      </ContentLayout>
    );
  }

  if (!userId && !isContextLoading) {
    return (
      <ContentLayout title="Authentication Error">
        <div className="my-10 p-6 bg-destructive/10 text-destructive border border-destructive/30 rounded-md flex flex-col items-center text-center">
          <AlertTriangle className="h-12 w-12 mb-3" />
          <h2 className="text-xl font-semibold mb-2">User Not Authenticated</h2>
          <p>Please log in to view studio details.</p>
        </div>
      </ContentLayout>
    );
  }

  if (userId && !selectedContext && !error && !isContextLoading) {
    return (
      <ContentLayout title="Loading Studio...">
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="h-10 w-10 text-muted-foreground animate-spin" />
          <p className="ml-3 text-muted-foreground text-lg">
            Finalizing account context...
          </p>
        </div>
      </ContentLayout>
    );
  }

  if (isLoading && !error) {
    return (
      <ContentLayout
        title={pageTitle === "Error" ? "Loading Studio..." : pageTitle}
      >
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="h-10 w-10 text-muted-foreground animate-spin" />
          <p className="ml-3 text-muted-foreground text-lg">
            Loading studio details...
          </p>
        </div>
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout title={pageTitle}>
        <div className="my-10 p-6 bg-destructive/10 text-destructive border border-destructive/30 rounded-md flex flex-col items-center text-center">
          <AlertTriangle className="h-12 w-12 mb-3" />
          <h2 className="text-xl font-semibold mb-2">Could not load studio</h2>
          <p>{error.message}</p>
        </div>
      </ContentLayout>
    );
  }

  if (!studioDetails) {
    return (
      <ContentLayout
        title={pageTitle === "Error" ? "Studio Not Found" : pageTitle}
      >
        <p className="text-center py-10 text-muted-foreground">
          The requested studio could not be found or you do not have access.
        </p>
      </ContentLayout>
    );
  }

  const isCurrentUserCreator =
    studioDetails && userId && studioDetails.creator_user_id === userId;

  let noHeadshotsMessage = "No images available for this studio.";

  return (
    <ContentLayout title={pageTitle}>
      <div className="mb-6 p-4 border rounded-lg bg-card shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
          <h1 className="text-2xl font-bold text-primary mb-2 sm:mb-0">
            {studioDetails.name}
          </h1>
          <Badge
            variant={
              studioDetails.status === "completed" ? "default" : "outline"
            }
            className={`text-sm px-3 py-1 ${
              studioDetails.status === "completed"
                ? "bg-green-100 text-green-700 border-green-300"
                : ""
            }`}
          >
            Status: {studioDetails.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-1">
          Created: {new Date(studioDetails.created_at).toLocaleDateString()}
        </p>
        {studioDetails.organizations && (
          <p className="text-sm text-muted-foreground mb-1">
            Organization: {studioDetails.organizations.name}
          </p>
        )}
        <div
          className={`mt-2 flex items-center justify-between ${
            studioDetails.downloaded ? "text-green-600" : "text-amber-600"
          }`}
        >
          <div className="flex items-center">
            {studioDetails.downloaded ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <Info className="h-5 w-5 mr-2" />
            )}
            <p className="font-medium">
              {studioDetails.downloaded
                ? "Studio images are ready and downloaded."
                : "Studio images are in preview. Download to get full access."}
            </p>
          </div>
          {isCurrentUserCreator && !studioDetails.downloaded && (
            <AlertDialog
              open={isDownloadAlertOpen}
              onOpenChange={setDownloadAlertOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="ml-4"
                  onClick={() => setDownloadAlertOpen(true)}
                  disabled={isUpdatingDownloadStatus}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isUpdatingDownloadStatus
                    ? "Downloading..."
                    : "Download Studio"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Studio Download</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will mark the studio as downloaded and process the
                    final images. This action cannot be undone. Are you sure you
                    want to proceed?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isUpdatingDownloadStatus}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmDownload}
                    disabled={isUpdatingDownloadStatus}
                  >
                    {isUpdatingDownloadStatus
                      ? "Processing..."
                      : "Yes, Download"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        {viewMode === "admin_favorites_only" && (
          <p className="text-sm text-blue-600 mt-1 italic">
            Viewing all favorited images for this studio (Admin View).
          </p>
        )}
      </div>

      {/* Headshot Display Section */}
      <div className="mt-8">
        {/* Preview mode: only preview headshots */}
        {viewMode === "preview" && previewHeadshots.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-4">Preview Images</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {previewHeadshots.map((headshot) => (
                <div
                  key={headshot.id}
                  className="relative group bg-card border rounded-lg shadow-sm overflow-hidden"
                >
                  <Image
                    src={headshot.image_url}
                    alt={`Preview ${headshot.id}`}
                    width={300}
                    height={400}
                    className="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    priority={true}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute bottom-2 right-2 h-8 backdrop-blur-sm bg-black/30 hover:bg-black/50 border-gray-400/50 hover:border-gray-300/70 text-xs text-white"
                      onClick={() =>
                        setLightboxImage({
                          src: headshot.image_url,
                          alt: `Preview ${headshot.id}`,
                        })
                      }
                    >
                      <Maximize className="mr-1.5 h-3.5 w-3.5" /> View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Downloaded: Creator or admin/creator view: show favorites and result headshots */}
        {viewMode === "creator" && (
          <>
            {favorites.length > 0 && (
              <>
                <h2 className="text-xl font-semibold mb-4 mt-6">Favorites</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {favorites.map((headshot) => (
                    <div
                      key={headshot.id}
                      className="relative group bg-card border rounded-lg shadow-sm overflow-hidden"
                    >
                      <Image
                        src={headshot.image_url}
                        alt={`Favorite ${headshot.id}`}
                        width={300}
                        height={400}
                        className="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        priority={true}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-end">
                        {canFavorite && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-9 w-9 rounded-full transition-all duration-200 bg-red-500/80 text-white hover:bg-red-600/90 hover:scale-110 active:scale-95"
                            onClick={() =>
                              handleToggleFavorite(headshot.id, true)
                            }
                            aria-label="Unfavorite"
                          >
                            <Heart className="h-5 w-5 fill-current" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute bottom-2 right-2 h-8 backdrop-blur-sm bg-black/30 hover:bg-black/50 border-gray-400/50 hover:border-gray-300/70 text-xs text-white"
                          onClick={() =>
                            setLightboxImage({
                              src: headshot.image_url,
                              alt: `Favorite ${headshot.id}`,
                            })
                          }
                        >
                          <Maximize className="mr-1.5 h-3.5 w-3.5" /> View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {resultHeadshots.length > 0 && (
              <>
                <h2 className="text-xl font-semibold mb-4 mt-6">
                  Result Headshots
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {resultHeadshots.map((headshot) => (
                    <div
                      key={headshot.id}
                      className="relative group bg-card border rounded-lg shadow-sm overflow-hidden"
                    >
                      <Image
                        src={headshot.image_url}
                        alt={`Result ${headshot.id}`}
                        width={300}
                        height={400}
                        className="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        priority={true}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-end">
                        {canFavorite && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-9 w-9 rounded-full transition-all duration-200 bg-gray-500/50 text-white hover:bg-gray-600/70 hover:scale-110 active:scale-95"
                            onClick={() =>
                              handleToggleFavorite(headshot.id, false)
                            }
                            aria-label="Favorite"
                          >
                            <Heart className="h-5 w-5" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute bottom-2 right-2 h-8 backdrop-blur-sm bg-black/30 hover:bg-black/50 border-gray-400/50 hover:border-gray-300/70 text-xs text-white"
                          onClick={() =>
                            setLightboxImage({
                              src: headshot.image_url,
                              alt: `Result ${headshot.id}`,
                            })
                          }
                        >
                          <Maximize className="mr-1.5 h-3.5 w-3.5" /> View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Downloaded: Admin viewing member's studio: only show favorites */}
        {viewMode === "admin_viewing_member_studio" && favorites.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-4 mt-6">
              Favorited Headshots (Admin View)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {favorites.map((headshot) => (
                <div
                  key={headshot.id}
                  className="relative group bg-card border rounded-lg shadow-sm overflow-hidden"
                >
                  <Image
                    src={headshot.image_url}
                    alt={`Favorited (Admin View) ${headshot.id}`}
                    width={300}
                    height={400}
                    className="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    priority={true}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-end">
                    <Heart
                      className="absolute top-2 right-2 h-5 w-5 text-red-500 fill-current"
                      title="Favorited by studio creator"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute bottom-2 right-2 h-8 backdrop-blur-sm bg-black/30 hover:bg-black/50 border-gray-400/50 hover:border-gray-300/70 text-xs text-white"
                      onClick={() =>
                        setLightboxImage({
                          src: headshot.image_url,
                          alt: `Favorited (Admin View) ${headshot.id}`,
                        })
                      }
                    >
                      <Maximize className="mr-1.5 h-3.5 w-3.5" /> View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* No images message */}
        {viewMode === "preview" && previewHeadshots.length === 0 && (
          <p className="text-center py-10 text-muted-foreground">
            No preview images available for this studio yet.
          </p>
        )}
        {viewMode === "creator" &&
          favorites.length === 0 &&
          resultHeadshots.length === 0 && (
            <p className="text-center py-10 text-muted-foreground">
              No images available for this studio.
            </p>
          )}
        {viewMode === "admin_viewing_member_studio" &&
          favorites.length === 0 && (
            <p className="text-center py-10 text-muted-foreground">
              The studio creator has not favorited any headshots in this studio
              yet.
            </p>
          )}
      </div>

      {lightboxImage && (
        <ImageModal
          src={lightboxImage.src}
          alt={lightboxImage.alt}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </ContentLayout>
  );
}
