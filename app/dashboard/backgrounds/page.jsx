"use client";

import React, { useState, useEffect } from "react";
import { useAccountContext } from "@/context/AccountContext";
import createSupabaseBrowserClient from "@/lib/supabase/browser-client";
import { ContentLayout } from "@/components/dashboard/sidebar/content-layout";
import Heading from "@/components/shared/heading";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BACKGROUND_OPTIONS,
  ALL_BACKGROUND_OPTIONS,
  findBackgroundTheme,
} from "@/app/utils/studioOptions";

export default function ManageBackgroundsPage() {
  const { selectedContext, userId, isCurrentUserOrgAdmin } =
    useAccountContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [restrictBackgrounds, setRestrictBackgrounds] = useState(false);
  const [approvedBackgrounds, setApprovedBackgrounds] = useState([]); // Array of {name, theme}
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
          .select("restrict_background_options")
          .eq("id", selectedContext.id)
          .single();

        if (orgError) throw orgError;
        setRestrictBackgrounds(orgData?.restrict_background_options || false);

        if (orgData?.restrict_background_options) {
          const { data: approvedData, error: approvedError } = await supabase
            .from("organization_approved_backgrounds")
            .select("background_name, background_theme")
            .eq("organization_id", selectedContext.id);
          if (approvedError) throw approvedError;
          setApprovedBackgrounds(
            approvedData.map((item) => ({
              name: item.background_name,
              theme: item.background_theme,
            })) || []
          );
        } else {
          setApprovedBackgrounds([]);
        }
      } catch (err) {
        console.error("Error fetching background settings:", err);
        setError("Failed to load background settings. " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrgSettings();
  }, [selectedContext, supabase]);

  const handleToggleRestrictBackgrounds = (isRestricted) => {
    setRestrictBackgrounds(isRestricted);
    if (!isRestricted) {
      setApprovedBackgrounds([]);
    }
  };

  const handleBackgroundItemToggle = (item, theme) => {
    const itemIdentifier = { name: item.name, theme };
    setApprovedBackgrounds((prev) =>
      prev.some(
        (approved) => approved.name === item.name && approved.theme === theme
      )
        ? prev.filter(
            (approved) =>
              !(approved.name === item.name && approved.theme === theme)
          )
        : [...prev, itemIdentifier]
    );
  };

  const handleSaveChanges = async () => {
    if (!selectedContext || selectedContext.type !== "organization") return;
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error: orgUpdateError } = await supabase
        .from("organizations")
        .update({ restrict_background_options: restrictBackgrounds })
        .eq("id", selectedContext.id);
      if (orgUpdateError) throw orgUpdateError;

      const { error: deleteError } = await supabase
        .from("organization_approved_backgrounds")
        .delete()
        .eq("organization_id", selectedContext.id);
      if (deleteError) throw deleteError;

      if (restrictBackgrounds && approvedBackgrounds.length > 0) {
        const itemsToInsert = approvedBackgrounds.map((item) => ({
          organization_id: selectedContext.id,
          background_name: item.name,
          background_theme: item.theme,
        }));
        const { error: insertError } = await supabase
          .from("organization_approved_backgrounds")
          .insert(itemsToInsert);
        if (insertError) throw insertError;
      }
      setSuccessMessage("Background preferences saved successfully!");
    } catch (err) {
      console.error("Error saving background settings:", err);
      setError("Failed to save background settings. " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getOptionsForTab = () => {
    if (activeTab === "All")
      return ALL_BACKGROUND_OPTIONS.map((item) => ({
        ...item,
        theme: findBackgroundTheme(item.name),
      }));
    return (
      BACKGROUND_OPTIONS[activeTab]?.map((item) => ({
        ...item,
        theme: activeTab,
      })) || []
    );
  };

  const getOptionsForDisplay = () => {
    if (activeTab === "All")
      return ALL_BACKGROUND_OPTIONS.map((item) => ({
        ...item,
        theme: findBackgroundTheme(item.name),
      }));
    return (
      BACKGROUND_OPTIONS[activeTab]?.map((item) => ({
        ...item,
        theme: activeTab,
      })) || []
    );
  };

  const tabKeys = ["All", ...Object.keys(BACKGROUND_OPTIONS)];

  if (selectedContext && selectedContext.type === "personal") {
    return (
      <ContentLayout title="Browse Background Options">
        <Heading variant={"h2"} className="mb-4">
          Available Background Styles
        </Heading>
        <p className="text-muted-foreground mb-6">
          You are currently in your personal account. You have access to all
          background options shown below when creating your studios. Management
          of restrictions is available for organization administrators.
        </p>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="mb-4">
            {tabKeys.map((group) => (
              <TabsTrigger key={group} value={group}>
                {group}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabKeys.map((group) => (
            <TabsContent key={group} value={group}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {getOptionsForDisplay()
                  .filter(
                    (item) => activeTab === "All" || item.theme === activeTab
                  )
                  .map((item) => (
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
          ))}
        </Tabs>
      </ContentLayout>
    );
  }
  if (selectedContext && selectedContext.type !== "organization") {
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
        <Button
          onClick={handleSaveChanges}
          disabled={isLoading || isSaving || !isCurrentUserOrgAdmin}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {error && <p className="text-destructive mb-4">Error: {error}</p>}
      {successMessage && (
        <p className="text-green-600 mb-4">{successMessage}</p>
      )}
      {!isCurrentUserOrgAdmin && selectedContext?.type === "organization" && (
        <p className="text-orange-600 mb-4">
          You do not have permission to modify these settings.
        </p>
      )}

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
              disabled={isLoading || isSaving || !isCurrentUserOrgAdmin}
            />
            <Label htmlFor="restrict-backgrounds-toggle" className="text-base">
              Restrict background options for organization members
            </Label>
          </div>
          <p className="text-sm text-muted-foreground">
            If enabled, only the background items selected below will be
            available to members of your organization. If disabled, all globally
            available background options will be accessible.
          </p>
        </CardContent>
      </Card>

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

          {tabKeys.map((group) => (
            <TabsContent key={group} value={group}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {getOptionsForTab().map((item) => {
                  if (activeTab !== "All" && item.theme !== activeTab)
                    return null;
                  const isApproved = approvedBackgrounds.some(
                    (approved) =>
                      approved.name === item.name &&
                      approved.theme === item.theme
                  );
                  return (
                    <Card
                      key={item.name}
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
                        handleBackgroundItemToggle(item, item.theme)
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
                        {restrictBackgrounds && (
                          <Switch
                            checked={isApproved}
                            onCheckedChange={() =>
                              handleBackgroundItemToggle(item, item.theme)
                            }
                            aria-label={`Approve ${item.name}`}
                            disabled={
                              !restrictBackgrounds ||
                              isSaving ||
                              !isCurrentUserOrgAdmin
                            }
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
          ))}
        </Tabs>
      )}
    </ContentLayout>
  );
}
