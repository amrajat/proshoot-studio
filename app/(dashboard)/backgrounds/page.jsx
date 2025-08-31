"use client";

import React, { useState, useEffect } from "react";
import { useAccountContext } from "@/context/AccountContext";
import createSupabaseBrowserClient from "@/lib/supabase/browser-client";
import { ALL_BACKGROUND_OPTIONS } from "@/utils/styleOptions";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Settings, Image } from "lucide-react";
import { CenteredLoader } from "@/components/shared/universal-loader";

export default function ManageBackgroundsPage() {
  const { selectedContext, isCurrentUserOrgAdmin } = useAccountContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const [restrictBackgrounds, setRestrictBackgrounds] = useState(false);
  const [approvedBackgrounds, setApprovedBackgrounds] = useState([]); // Now stores array of IDs
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
          .select("restrict_background_options, approved_backgrounds")
          .eq("id", selectedContext.id)
          .single();

        if (orgError) throw orgError;

        setRestrictBackgrounds(orgData?.restrict_background_options || false);
        setApprovedBackgrounds(orgData?.approved_backgrounds || []);
      } catch (err) {
        setError("Failed to load background settings. " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrgSettings();
  }, [selectedContext?.id, supabase]);

  const handleToggleRestrictBackgrounds = (isRestricted) => {
    setRestrictBackgrounds(isRestricted);
    if (!isRestricted) {
      setApprovedBackgrounds([]); // Clear approved list when restrictions are turned off
    }
  };

  const handleBackgroundItemToggle = (itemId) => {
    setApprovedBackgrounds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSaveChanges = async () => {
    if (!selectedContext || !isCurrentUserOrgAdmin) return;

    try {
      setIsSaving(true);
      setError(null);

      const { error } = await supabase
        .from("organizations")
        .update({
          restrict_background_options: restrictBackgrounds,
          approved_backgrounds: restrictBackgrounds ? approvedBackgrounds : [],
        })
        .eq("id", selectedContext.id);

      if (error) {
        throw error;
      }

      toast.success("Background settings updated successfully!");
    } catch (error) {
      toast.error("Failed to update background settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const backgroundThemes = [
    ...new Set(ALL_BACKGROUND_OPTIONS.map((item) => item.theme)),
  ];
  const tabKeys = ["All", ...backgroundThemes];

  const itemsToDisplay =
    activeTab === "All"
      ? ALL_BACKGROUND_OPTIONS
      : ALL_BACKGROUND_OPTIONS.filter((item) => item.theme === activeTab);

  if (selectedContext?.type === "personal") {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Image className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Available Background Styles
            </h1>
            <p className="text-muted-foreground">
              Management of restrictions is available for organization
              administrators.
            </p>
          </div>
        </div>

        {/* Tabs and Grid */}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {itemsToDisplay.map((item) => (
                <Card
                  key={item.name}
                  className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    {/* TODO: FIX THE PROPER IMAGE LATER */}

                    <img
                      // src={item.image}
                      src="/images/placeholder.svg"
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                      fill
                      sizes="48px"
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
            <Image className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Organization Required</h3>
          <p className="text-muted-foreground max-w-sm">
            Please select an organization context to manage background options.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Background Preferences
            </h1>
            <p className="text-muted-foreground">
              Manage background options for{" "}
              {selectedContext?.name || "your organization"}
            </p>
          </div>
        </div>
        {isCurrentUserOrgAdmin && (
          <Button onClick={handleSaveChanges} disabled={isLoading || isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </div>

      {/* Status Messages */}
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
                id="restrict-backgrounds-toggle"
                checked={restrictBackgrounds}
                onCheckedChange={handleToggleRestrictBackgrounds}
                disabled={isLoading || isSaving}
              />
              <Label
                htmlFor="restrict-backgrounds-toggle"
                className="text-base"
              >
                Restrict background options for organization members
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              If enabled, only the background items selected below will be
              available.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading ? (
        <CenteredLoader text="Loading background options" />
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {itemsToDisplay.map((item) => {
                const isApproved = approvedBackgrounds.includes(item.id);
                const isInteractive =
                  restrictBackgrounds && isCurrentUserOrgAdmin;

                return (
                  <Card
                    key={item.id}
                    className={`group overflow-hidden transition-all duration-200 ${
                      isApproved && restrictBackgrounds
                        ? "ring-2 ring-primary border-primary shadow-md"
                        : "border-0 shadow-sm hover:shadow-md"
                    } ${isInteractive ? "cursor-pointer" : "opacity-75"}`}
                    onClick={() =>
                      isInteractive && handleBackgroundItemToggle(item.id)
                    }
                  >
                    <div className="aspect-square relative overflow-hidden bg-muted">
                      {/* TODO: FIX THE PROPER IMAGE LATER */}
                      <img
                        // src={item.image}
                        src="/images/placeholder.svg"
                        alt={item.name}
                        className={`w-full h-full object-cover transition-transform duration-200 ${
                          isInteractive ? "group-hover:scale-105" : ""
                        }`}
                        fill
                        sizes="48px"
                        loading="lazy"
                      />
                      {isApproved && restrictBackgrounds && (
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

                      {restrictBackgrounds && isCurrentUserOrgAdmin && (
                        <div className="flex justify-center">
                          <Switch
                            checked={isApproved}
                            onCheckedChange={() =>
                              handleBackgroundItemToggle(item.id)
                            }
                            aria-label={`Approve ${item.name}`}
                            disabled={isSaving}
                            size="sm"
                          />
                        </div>
                      )}

                      {!restrictBackgrounds && (
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
