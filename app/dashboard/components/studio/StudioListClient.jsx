"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAccountContext } from "@/context/AccountContext";
import { getStudiosData } from "../../actions/getStudiosData"; // Action import
import StudioGridItem from "./StudioGridItem";
import { Button } from "@/components/ui/button";
import { PlusCircle, Info, RefreshCw } from "lucide-react";
import { ContentLayout } from "../../components/sidebar/content-layout"; // If title is dynamic from here

export default function StudioListClient() {
  const {
    userId,
    selectedContext,
    isLoading: isContextLoading,
  } = useAccountContext();
  const [studiosData, setStudiosData] = useState({
    studios: [],
    pageTitle: "Loading Studios...",
    isOrgAdminViewingCurrentContext: false,
    currentOrgId: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudios = useCallback(async () => {
    if (isContextLoading || !userId || !selectedContext) {
      // Wait for context to be ready
      // If selectedContext is null (e.g. no personal and no orgs), handle appropriately
      if (!isContextLoading && !selectedContext && userId) {
        setStudiosData({
          studios: [],
          pageTitle: "No active context",
          isOrgAdminViewingCurrentContext: false,
          currentOrgId: null,
        });
        setIsLoading(false);
        setError({
          message: "Please select an account context or create one.",
        });
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const contextType = selectedContext.type;
      const contextId =
        selectedContext.type === "organization" ? selectedContext.id : null;

      // console.log(`Fetching studios for user: ${userId}, contextType: ${contextType}, contextId: ${contextId}`);
      const result = await getStudiosData(userId, contextType, contextId);

      if (result.error) {
        setError(result.error);
        setStudiosData({
          studios: [],
          pageTitle: "Error Loading Studios",
          isOrgAdminViewingCurrentContext: false,
          currentOrgId: null,
        });
      } else {
        setStudiosData({
          studios: result.studios || [],
          pageTitle: result.pageTitle || "Studios",
          isOrgAdminViewingCurrentContext:
            result.isOrgAdminViewingCurrentContext || false,
          currentOrgId: result.currentOrgId,
        });
      }
    } catch (e) {
      console.error("Client fetchStudios error:", e);
      setError({ message: e.message || "An unexpected error occurred." });
      setStudiosData({
        studios: [],
        pageTitle: "Error",
        isOrgAdminViewingCurrentContext: false,
        currentOrgId: null,
      });
    }
    setIsLoading(false);
  }, [userId, selectedContext, isContextLoading]);

  useEffect(() => {
    fetchStudios();
  }, [fetchStudios]);

  // The ContentLayout might be better placed in the parent server component (page.jsx)
  // if the title is static or passed from server. If title is dynamic from client, then here.
  // For this example, assuming dynamic title based on fetched data.
  return (
    <ContentLayout
      title={isLoading ? "Loading Studios..." : studiosData.pageTitle}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">
          {/* Title is now in ContentLayout prop */}
        </h1>
        <Button asChild>
          <Link href="/dashboard/studio/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Studio
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
          <p className="ml-2 text-muted-foreground">Loading studios...</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-destructive/10 text-destructive border border-destructive/30 rounded-md flex items-center">
          <Info className="h-5 w-5 mr-2" />
          <p>Could not load studios: {error.message}</p>
        </div>
      )}

      {!isLoading &&
      !error &&
      studiosData.studios &&
      studiosData.studios.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {studiosData.studios.map((studio) => (
            <StudioGridItem
              key={studio.id}
              studio={studio}
              studioImageUrl={studio.imageUrl}
              // Pass necessary props for StudioGridItem. Context type might not be needed if links are simple.
              // isOrgAdminView is specific to the context the list is being viewed in.
              isOrgAdminView={
                studiosData.isOrgAdminViewingCurrentContext &&
                studio.organization_id === studiosData.currentOrgId
              }
            />
          ))}
        </div>
      ) : (
        !isLoading &&
        !error && (
          <p className="text-center text-muted-foreground py-8">
            No studios found for the current context. Try creating one!
          </p>
        )
      )}
    </ContentLayout>
  );
}
