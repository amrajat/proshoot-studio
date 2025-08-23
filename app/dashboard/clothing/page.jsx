"use client";

import React, { useState, useEffect } from "react";
import { useAccountContext } from "@/context/AccountContext";
import createSupabaseBrowserClient from "@/lib/supabase/browser-client";
import { GLOBAL_ALL_CLOTHING_OPTIONS } from "@/app/utils/styleOptions";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, AlertCircle, Settings, Shirt } from "lucide-react";

export default function ManageClothingPage() {
  const { selectedContext, isCurrentUserOrgAdmin } = useAccountContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [restrictClothing, setRestrictClothing] = useState(false);
  const [approvedClothing, setApprovedClothing] = useState([]); // Now stores array of IDs
  const [activeTab, setActiveTab] = useState("All");

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    if (!selectedContext || selectedContext.type !== "organization") {
      setIsLoading(false);
      return;
    }

    const fetchOrgSettings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: orgData, error: orgError } = await supabase
          .from("organizations")
          .select("restrict_clothing_options, approved_clothing")
          .eq("id", selectedContext.id)
          .single();

        if (orgError) throw orgError;

        setRestrictClothing(orgData?.restrict_clothing_options || false);
        setApprovedClothing(orgData?.approved_clothing || []);
      } catch (err) {
        console.error("Error fetching clothing settings:", err);
        setError("Failed to load clothing settings. " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrgSettings();
  }, [selectedContext?.id, supabase]);

  const handleToggleRestrictClothing = (isRestricted) => {
    setRestrictClothing(isRestricted);
    if (!isRestricted) {
      setApprovedClothing([]); // Clear approved list when restrictions are turned off
    }
  };

  const handleClothingItemToggle = (itemId) => {
    setApprovedClothing((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSaveChanges = async () => {
    if (!selectedContext || !isCurrentUserOrgAdmin) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase
        .from("organizations")
        .update({
          restrict_clothing_options: restrictClothing,
          approved_clothing: restrictClothing ? approvedClothing : [],
        })
        .eq("id", selectedContext.id);

      if (error) throw error;

      setSuccessMessage("Settings saved successfully!");
    } catch (err) {
      console.error("Error saving clothing settings:", err);
      setError(`Failed to save settings. ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const clothingThemes = [
    ...new Set(GLOBAL_ALL_CLOTHING_OPTIONS.map((item) => item.theme)),
  ];
  const tabKeys = ["All", ...clothingThemes];

  const itemsToDisplay =
    activeTab === "All"
      ? GLOBAL_ALL_CLOTHING_OPTIONS
      : GLOBAL_ALL_CLOTHING_OPTIONS.filter((item) => item.theme === activeTab);

  if (selectedContext?.type === "personal") {
    return (
      <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Shirt className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Available Clothing Styles
              </h1>
              <p className="text-muted-foreground">
                Management of restrictions is available for organization
                administrators only.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full overflow-x-auto">
              {tabKeys.map((group) => (
                <TabsTrigger
                  key={group}
                  value={group}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm flex-shrink-0"
                >
                  {group}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {itemsToDisplay.map((item) => (
                  <Card
                    key={item.id}
                    className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="aspect-square relative overflow-hidden bg-muted">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-medium text-sm text-center leading-tight">
                        {item.name}
                      </h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
      </div>
    );
  }

  if (selectedContext?.type !== "organization") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mx-auto">
              <Shirt className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Organization Required</h3>
            <p className="text-muted-foreground max-w-sm">
              Please select an organization context to manage clothing options.
            </p>
          </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Clothing Preferences
              </h1>
              <p className="text-muted-foreground">
                Manage clothing options for{" "}
                {selectedContext?.name || "your organization"}
              </p>
            </div>
          </div>
          {isCurrentUserOrgAdmin && (
            <Button
              onClick={handleSaveChanges}
              disabled={isLoading || isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>

        {/* Status Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {successMessage && (
          <Alert className="border-success/20 bg-success/10 text-success">
            <AlertDescription className="text-success flex items-center">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}
        {!isCurrentUserOrgAdmin && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You do not have permission to modify these settings.
            </AlertDescription>
          </Alert>
        )}

        {isCurrentUserOrgAdmin && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Restriction Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  id="restrict-clothing-toggle"
                  checked={restrictClothing}
                  onCheckedChange={handleToggleRestrictClothing}
                  disabled={isLoading || isSaving}
                />
                <Label htmlFor="restrict-clothing-toggle" className="text-base">
                  Restrict clothing options for organization members
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                If enabled, only the clothing items selected below will be
                available.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex space-x-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-20" />
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Tabs and Grid */
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full overflow-x-auto">
              {tabKeys.map((group) => (
                <TabsTrigger
                  key={group}
                  value={group}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm flex-shrink-0"
                >
                  {group}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {itemsToDisplay.map((item) => {
                  const isApproved = approvedClothing.includes(item.id);
                  const isInteractive =
                    restrictClothing && isCurrentUserOrgAdmin;

                  return (
                    <Card
                      key={item.id}
                      className={`group overflow-hidden transition-all duration-200 ${
                        isApproved && restrictClothing
                          ? "ring-2 ring-primary border-primary shadow-md"
                          : "border-0 shadow-sm hover:shadow-md"
                      } ${isInteractive ? "cursor-pointer" : "opacity-75"}`}
                      onClick={() =>
                        isInteractive && handleClothingItemToggle(item.id)
                      }
                    >
                      <div className="aspect-square relative overflow-hidden bg-muted">
                        <img
                          src={item.image}
                          alt={item.name}
                          className={`w-full h-full object-cover transition-transform duration-200 ${
                            isInteractive ? "group-hover:scale-105" : ""
                          }`}
                          loading="lazy"
                        />
                        {isApproved && restrictClothing && (
                          <div className="absolute top-2 right-2">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-3 space-y-2">
                        <h3 className="font-medium text-sm text-center leading-tight">
                          {item.name}
                        </h3>

                        {restrictClothing && isCurrentUserOrgAdmin && (
                          <div className="flex justify-center">
                            <Switch
                              checked={isApproved}
                              onCheckedChange={() =>
                                handleClothingItemToggle(item.id)
                              }
                              aria-label={`Approve ${item.name}`}
                              disabled={isSaving}
                              size="sm"
                            />
                          </div>
                        )}

                        {!restrictClothing && (
                          <div className="flex justify-center">
                            <Badge variant="outline" className="text-xs">
                              All Allowed
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        )}
    </div>
  );
}
