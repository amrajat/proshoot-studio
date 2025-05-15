"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAccountContext } from "@/context/AccountContext";
import {
  getStudioDetailsData,
  toggleFavoriteAction,
} from "../_actions/getStudioDetailsData";
import { updateStudioDownloadedStatusAction } from "../_actions/studioActions";
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
  console.log(
    "Client: StudioDetailClient RENDER START, studioId prop:",
    studioId
  );
  const {
    userId,
    selectedContext,
    isLoading: isContextLoading,
  } = useAccountContext();
  console.log("Client: AccountContext values:", {
    userId,
    selectedContextId: selectedContext?.id,
    selectedContextType: selectedContext?.type,
    isContextLoading,
  });

  const [studioDetails, setStudioDetails] = useState(null);
  const [headshots, setHeadshots] = useState([]);
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
    console.log("Client: fetchStudioDetails CALLED. Context state:", {
      isContextLoading,
      userId,
      selectedContextId: selectedContext?.id,
      studioId,
    });
    if (isContextLoading || !userId || !selectedContext || !studioId) {
      if (!isContextLoading && !userId && studioId) {
        console.error("Client Error: User session not found. Cannot fetch.");
        setError({ message: "User session not found. Please log in again." });
        setPageTitle("Authentication Error");
        setIsLoading(false);
      }
      // If other conditions are met (context loading, or selectedContext null), the main render handles loading/pending UI.
      console.log(
        "Client: fetchStudioDetails returning early due to context/ID checks."
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    console.log(
      "Client: Attempting to call getStudioDetailsData server action..."
    );

    try {
      const contextType = selectedContext.type;
      const contextId =
        selectedContext.type === "organization" ? selectedContext.id : null;

      if (selectedContext.type === "organization" && !contextId) {
        console.error(
          "Client Error: Organization context selected but ID is missing."
        );
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
      console.log(
        "Client: getStudioDetailsData SERVER ACTION RESULT:",
        result
          ? {
              studioId: result.studio?.id,
              headshotsCount: result.headshots?.length,
              canFavorite: result.canFavorite,
              viewMode: result.viewMode,
              error: result.error,
            }
          : "null result"
      );

      if (result.error || !result.studio) {
        console.error(
          "Client Error: Error from getStudioDetailsData or no studio found:",
          result.error?.message
        );
        setError(result.error || { message: "Studio not found." });
        setPageTitle("Studio Not Found");
        setStudioDetails(null);
        setHeadshots([]);
      } else {
        console.log("Client: Setting state from server action result.");
        setStudioDetails(result.studio);
        setHeadshots(result.headshots || []);
        setCanFavorite(result.canFavorite);
        setViewMode(result.viewMode); // Setting client-side viewMode from server
        setPageTitle(result.studio.name || "Studio Details");
      }
    } catch (e) {
      console.error(
        "Client Error: Exception in fetchStudioDetails calling server action:",
        e
      );
      setError({ message: e.message || "An unexpected error occurred." });
      setPageTitle("Error");
    }
    setIsLoading(false);
    console.log(
      "Client: fetchStudioDetails COMPLETED. isLoading (client state):",
      false
    );
  }, [userId, studioId, selectedContext, isContextLoading]);

  useEffect(() => {
    console.log(
      "Client: useEffect for fetchStudioDetails TRIGGERED. studioId:",
      studioId
    );
    if (studioId) {
      fetchStudioDetails();
    }
  }, [fetchStudioDetails, studioId]);

  const handleToggleFavorite = async (headshotId, currentIsFavorite) => {
    if (!canFavorite || !userId || !studioId) return;

    // Optimistically update UI
    setHeadshots((prevHeadshots) =>
      prevHeadshots
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
        setHeadshots((prevHeadshots) =>
          prevHeadshots
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
      setHeadshots((prevHeadshots) =>
        prevHeadshots
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

  console.log(
    "Client: PRE-RENDER LOGIC. StudioDetails:",
    studioDetails
      ? {
          id: studioDetails.id,
          downloaded: studioDetails.downloaded,
          creator: studioDetails.creator_user_id,
        }
      : null,
    "Client ViewMode:",
    viewMode,
    "Raw Headshots count:",
    headshots.length
  );

  const isCurrentUserCreator =
    studioDetails && userId && studioDetails.creator_user_id === userId;
  console.log("Client: isCurrentUserCreator:", isCurrentUserCreator);

  let previewHeadshotsToShow = [];
  let favoriteHeadshotsToShow = [];
  let otherResultHeadshotsToShow = []; // Renamed from otherResultHeadshots for clarity
  let noHeadshotsMessage = "No images available for this studio.";
  let showSeparateFavoritesSectionForCreator = false;
  let showOnlyFavoritesForAdminViewer = false;
  let mainHeadshotsTitle = "Headshots";

  if (studioDetails) {
    if (!studioDetails.downloaded) {
      mainHeadshotsTitle = "Preview Images";
      previewHeadshotsToShow = headshots; // Assumes `headshots` from backend ARE preview images when not downloaded
      if (previewHeadshotsToShow.length === 0) {
        noHeadshotsMessage = "No preview images available for this studio yet.";
      }
      console.log(
        "Client Logic: NOT DOWNLOADED. Preview count:",
        previewHeadshotsToShow.length
      );
    } else {
      // Studio IS downloaded
      // viewMode examples: 'creator', 'admin_creator', 'admin_viewing_member_studio'
      // isCurrentUserCreator is a boolean

      if (viewMode === "admin_viewing_member_studio") {
        // Admin viewing member's studio, downloaded = true
        showOnlyFavoritesForAdminViewer = true;
        mainHeadshotsTitle = "Favorited Headshots (Admin View)";
        // Assumes `headshots` contains all result_headshots, and `isFavorite` is true if creator of THAT studio favorited it.
        favoriteHeadshotsToShow = headshots.filter((h) => h.isFavorite);
        if (headshots.length > 0 && favoriteHeadshotsToShow.length === 0) {
          noHeadshotsMessage =
            "The studio creator has not favorited any headshots in this studio yet.";
        } else if (headshots.length === 0) {
          noHeadshotsMessage =
            "No headshots have been generated for this studio yet.";
        }
        console.log(
          "Client Logic: ADMIN VIEWING MEMBER. Favorite count (should be all from server for this mode):",
          favoriteHeadshotsToShow.length
        );
      } else if (isCurrentUserCreator) {
        // Covers 'creator' and 'admin_creator' or personal studio creator
        showSeparateFavoritesSectionForCreator = true;
        // `headshots` contains all result_headshots; `isFavorite` is for the current user (the creator)
        favoriteHeadshotsToShow = headshots.filter((h) => h.isFavorite);
        otherResultHeadshotsToShow = headshots.filter((h) => !h.isFavorite);
        if (headshots.length === 0) {
          noHeadshotsMessage =
            "No headshots have been generated for this studio yet.";
        }
        console.log(
          "Client Logic: IS CREATOR. Favorites count:",
          favoriteHeadshotsToShow.length,
          "Others count:",
          otherResultHeadshotsToShow.length
        );
      } else {
        // Member viewing their own downloaded studio (but not creator role for this specific logic branch),
        // or any other role that sees all results mixed.
        // `headshots` is pre-sorted by `isFavorite` (current user's favorites) then date.
        mainHeadshotsTitle = "Headshots";
        otherResultHeadshotsToShow = headshots; // Display all in one list, sorted with favorites first
        if (headshots.length === 0) {
          noHeadshotsMessage = "No headshots found for this studio.";
        }
        console.log(
          "Client Logic: OTHER DOWNLOADED VIEW. All results count (sorted by fav):",
          otherResultHeadshotsToShow.length
        );
      }
    }
  } else {
    console.log("Client Logic: studioDetails is NULL.");
  }
  console.log("Client: Final calculated display vars:", {
    mainHeadshotsTitle,
    noHeadshotsMessage,
    showSeparateFavoritesSectionForCreator,
    showOnlyFavoritesForAdminViewer,
    previewCount: previewHeadshotsToShow.length,
    favCount: favoriteHeadshotsToShow.length,
    otherCount: otherResultHeadshotsToShow.length,
  });

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
        {/* Case 1: Previews (Studio Not Downloaded) */}
        {!studioDetails?.downloaded && previewHeadshotsToShow.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-4">{mainHeadshotsTitle}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {previewHeadshotsToShow.map((headshot) => (
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

        {/* Case 2: Downloaded - Admin Viewing Member's Studio (Favorites Only) */}
        {studioDetails?.downloaded &&
          showOnlyFavoritesForAdminViewer &&
          favoriteHeadshotsToShow.length > 0 && (
            <>
              {/* Message for admin view - this was pre-existing and seems fine if context is clear */}
              {/* <p className="text-sm text-blue-600 mt-1 italic">Viewing favorited images for this studio (Admin View).</p> */}
              <h2 className="text-xl font-semibold mb-4 mt-6">
                {mainHeadshotsTitle}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {favoriteHeadshotsToShow.map((headshot) => (
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
                      {headshot.isFavorite && (
                        <Heart
                          className={`absolute top-2 right-2 h-5 w-5 text-red-500 fill-current`}
                          title="Favorited by studio creator"
                        />
                      )}
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

        {/* Case 3: Downloaded - Creator's View (Separate Favorites & Other Results) */}
        {studioDetails?.downloaded &&
          showSeparateFavoritesSectionForCreator && (
            <>
              {favoriteHeadshotsToShow.length > 0 && (
                <>
                  <h2 className="text-xl font-semibold mb-4 mt-6">
                    Your Favorite Headshots
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {favoriteHeadshotsToShow.map((headshot) => (
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
                              className={`absolute top-2 right-2 h-9 w-9 rounded-full transition-all duration-200 ${
                                headshot.isFavorite
                                  ? "bg-red-500/80 text-white hover:bg-red-600/90"
                                  : "bg-gray-500/50 text-white hover:bg-gray-600/70"
                              } hover:scale-110 active:scale-95`}
                              onClick={() =>
                                handleToggleFavorite(
                                  headshot.id,
                                  headshot.isFavorite
                                )
                              }
                              aria-label={
                                headshot.isFavorite ? "Unfavorite" : "Favorite"
                              }
                            >
                              <Heart
                                className={`h-5 w-5 ${
                                  headshot.isFavorite ? "fill-current" : ""
                                }`}
                              />
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
              {otherResultHeadshotsToShow.length > 0 && (
                <>
                  <h2 className="text-xl font-semibold mb-4 mt-6">
                    Other Result Headshots
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {otherResultHeadshotsToShow.map((headshot) => (
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
                              className={`absolute top-2 right-2 h-9 w-9 rounded-full transition-all duration-200 ${
                                headshot.isFavorite
                                  ? "bg-red-500/80 text-white hover:bg-red-600/90"
                                  : "bg-gray-500/50 text-white hover:bg-gray-600/70"
                              } hover:scale-110 active:scale-95`}
                              onClick={() =>
                                handleToggleFavorite(
                                  headshot.id,
                                  headshot.isFavorite
                                )
                              }
                              aria-label={
                                headshot.isFavorite ? "Unfavorite" : "Favorite"
                              }
                            >
                              <Heart
                                className={`h-5 w-5 ${
                                  headshot.isFavorite ? "fill-current" : ""
                                }`}
                              />
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

        {/* Case 4: Downloaded - Default View (e.g., member viewing own, not creator context for separate lists) */}
        {studioDetails?.downloaded &&
          !showSeparateFavoritesSectionForCreator &&
          !showOnlyFavoritesForAdminViewer &&
          otherResultHeadshotsToShow.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-4 mt-6">
                {mainHeadshotsTitle}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {otherResultHeadshotsToShow.map((headshot) => (
                  <div
                    key={headshot.id}
                    className="relative group bg-card border rounded-lg shadow-sm overflow-hidden"
                  >
                    <Image
                      src={headshot.image_url}
                      alt={`Headshot ${headshot.id}`}
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
                          className={`absolute top-2 right-2 h-9 w-9 rounded-full transition-all duration-200 ${
                            headshot.isFavorite
                              ? "bg-red-500/80 text-white hover:bg-red-600/90"
                              : "bg-gray-500/50 text-white hover:bg-gray-600/70"
                          } hover:scale-110 active:scale-95`}
                          onClick={() =>
                            handleToggleFavorite(
                              headshot.id,
                              headshot.isFavorite
                            )
                          }
                          aria-label={
                            headshot.isFavorite ? "Unfavorite" : "Favorite"
                          }
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              headshot.isFavorite ? "fill-current" : ""
                            }`}
                          />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute bottom-2 right-2 h-8 backdrop-blur-sm bg-black/30 hover:bg-black/50 border-gray-400/50 hover:border-gray-300/70 text-xs text-white"
                        onClick={() =>
                          setLightboxImage({
                            src: headshot.image_url,
                            alt: `Headshot ${headshot.id}`,
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

        {/* No Headshots Message - if all relevant display arrays are empty after logic */}
        {previewHeadshotsToShow.length === 0 &&
          favoriteHeadshotsToShow.length === 0 &&
          otherResultHeadshotsToShow.length === 0 && (
            <p className="text-center py-10 text-muted-foreground">
              {noHeadshotsMessage}
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
