"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAccountContext } from "@/context/AccountContext";
import { fetchAllStudios } from "../actions/studio/fetchAllStudios";
import StudioCard from "../components/studio/StudioCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PlusCircle, AlertCircle, Camera, RefreshCw } from "lucide-react";
import { CenteredLoader } from "@/components/shared/universal-loader";

/**
 * Studio List Page
 *
 * Displays user's studios based on account context (personal or organization).
 * Follows existing UI patterns from backgrounds/clothing/billing pages.
 */
export default function StudioListPage() {
  const {
    userId,
    selectedContext,
    isLoading: isContextLoading,
  } = useAccountContext();

  const [studiosData, setStudiosData] = useState({
    studios: [],
    pageTitle: "Studios",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudios = useCallback(async () => {
    // Wait for context to be ready
    if (isContextLoading || !userId || !selectedContext) {
      if (!isContextLoading && !selectedContext && userId) {
        setStudiosData({
          studios: [],
          pageTitle: "No Context Selected",
        });
        setIsLoading(false);
        setError({
          message: "Please select an account context to view studios.",
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

      const result = await fetchAllStudios(userId, contextType, contextId);

      if (!result.success) {
        setError(result.error);
        setStudiosData({
          studios: [],
          pageTitle: result.pageTitle || "Error",
        });
      } else {
        setStudiosData({
          studios: result.studios || [],
          pageTitle: result.pageTitle || "Studios",
        });
      }
    } catch (e) {
      console.error("Error fetching studios:", e);
      setError({ message: e.message || "An unexpected error occurred." });
      setStudiosData({
        studios: [],
        pageTitle: "Error",
      });
    }
    setIsLoading(false);
  }, [userId, selectedContext, isContextLoading]);

  useEffect(() => {
    fetchStudios();
  }, [fetchStudios]);

  return (
    <div className="space-y-8">
      {/* Studio Management Section */}
      <section>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Studio Management
              </h1>
              <p className="text-muted-foreground">
                {selectedContext?.type === "personal"
                  ? "Manage your personal AI headshot studios."
                  : "Manage studios in your organization."}
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/studio/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Studio
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Studios</CardTitle>
            <CardDescription>
              {selectedContext?.type === "personal"
                ? "All your personal headshot studios"
                : `Studios created in ${
                    selectedContext?.name || "this organization"
                  }`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Loading State */}
            {isLoading && <CenteredLoader text="Loading your studios" />}

            {/* Error State */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}

            {/* Studios Grid */}
            {!isLoading && !error && studiosData.studios.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {studiosData.studios.map((studio) => (
                  <StudioCard key={studio.id} studio={studio} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && studiosData.studios.length === 0 && (
              <div className="text-center py-12">
                <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Studios Found</h3>
                <p className="text-muted-foreground mb-4">
                  {selectedContext?.type === "personal"
                    ? "You haven't created any personal studios yet. Start by creating your first AI headshot studio."
                    : "No studios found in this organization. Create a studio to get started."}
                </p>
                <Button asChild>
                  <Link href="/dashboard/studio/create">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Your First Studio
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
