"use client";

import React, { useState, useEffect } from "react";
import { useAccountContext } from "@/context/AccountContext";
import createSupabaseBrowserClient from "@/lib/supabase/browser-client";
import { ALL_BACKGROUND_OPTIONS } from "@/app/utils/styleOptions";

import { ContentLayout } from "../components/sidebar/content-layout";

import Heading from "@/components/shared/heading";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function ManageBackgroundsPage() {
  const { selectedContext, isCurrentUserOrgAdmin } = useAccountContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

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
        console.error("Error fetching background settings:", err);
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

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase
        .from("organizations")
        .update({
          restrict_background_options: restrictBackgrounds,
          approved_backgrounds: restrictBackgrounds ? approvedBackgrounds : [],
        })
        .eq("id", selectedContext.id);

      if (error) throw error;

      setSuccessMessage("Settings saved successfully!");
    } catch (err) {
      console.error("Error saving background settings:", err);
      setError(`Failed to save settings. ${err.message}`);
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
      <ContentLayout title="Browse Background Options">
        <Heading variant={"h2"} className="mb-4">
          Available Background Styles
        </Heading>
        <p className="text-muted-foreground mb-6">
          Management of restrictions is available for organization
          administrators.
        </p>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="mb-4">
            {tabKeys.map((group) => (
              <TabsTrigger key={group} value={group}>
                {group}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={activeTab}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {itemsToDisplay.map((item) => (
                <Card key={item.name} className="relative">
                  <CardContent className="flex flex-col items-center p-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded mb-2"
                      loading="lazy"
                    />
                    <span className="font-medium text-center text-sm">
                      {item.name}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </ContentLayout>
    );
  }

  if (selectedContext?.type !== "organization") {
    return (
      <ContentLayout title="Manage Background Options">
        <p className="text-muted-foreground">
          Please select an organization context to manage background options.
        </p>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Manage Organization Background Options">
      <div className="flex justify-between items-center mb-6">
        <Heading variant={"h2"}>
          Background Preferences for{" "}
          {selectedContext?.name || "Your Organization"}
        </Heading>
        {isCurrentUserOrgAdmin && (
          <Button onClick={handleSaveChanges} disabled={isLoading || isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </div>

      {error && <p className="text-destructive mb-4">Error: {error}</p>}
      {successMessage && (
        <p className="text-green-600 mb-4">{successMessage}</p>
      )}
      {!isCurrentUserOrgAdmin && (
        <p className="text-orange-600 mb-4">
          You do not have permission to modify these settings.
        </p>
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

      {isLoading ? (
        <p>Loading background settings...</p>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="mb-4">
            {tabKeys.map((group) => (
              <TabsTrigger key={group} value={group}>
                {group}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={activeTab}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {itemsToDisplay.map((item) => {
                const isApproved = approvedBackgrounds.includes(item.id);
                return (
                  <Card
                    key={item.id}
                    className={`relative ${
                      restrictBackgrounds && isApproved
                        ? "border-primary ring-2 ring-primary"
                        : "border-border"
                    } ${
                      !restrictBackgrounds || !isCurrentUserOrgAdmin
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                    onClick={() =>
                      restrictBackgrounds &&
                      isCurrentUserOrgAdmin &&
                      handleBackgroundItemToggle(item.id)
                    }
                  >
                    <CardContent className="flex flex-col items-center p-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded mb-2"
                        loading="lazy"
                      />
                      <span className="font-medium text-center text-sm mb-2">
                        {item.name}
                      </span>
                      {restrictBackgrounds && isCurrentUserOrgAdmin && (
                        <Switch
                          checked={isApproved}
                          onCheckedChange={() =>
                            handleBackgroundItemToggle(item.id)
                          }
                          aria-label={`Approve ${item.name}`}
                          disabled={!restrictBackgrounds || isSaving}
                        />
                      )}
                      {!restrictBackgrounds && (
                        <Badge variant="outline">All Allowed</Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </ContentLayout>
  );
}
