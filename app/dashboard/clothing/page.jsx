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
  CLOTHING_OPTIONS,
  ALL_CLOTHING_OPTIONS,
  findClothingTheme,
} from "@/app/utils/studioOptions";

export default function ManageClothingPage() {
  const { selectedContext, userId, isCurrentUserOrgAdmin } =
    useAccountContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [restrictClothing, setRestrictClothing] = useState(false);
  const [approvedClothing, setApprovedClothing] = useState([]); // Array of {name, theme}
  const [activeTab, setActiveTab] = useState("All");

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    if (!selectedContext || selectedContext.type !== "organization") {
      setIsLoading(false);
      return;
    }
    // Fetch organization's current settings
    const fetchOrgSettings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: orgData, error: orgError } = await supabase
          .from("organizations")
          .select("restrict_clothing_options")
          .eq("id", selectedContext.id)
          .single();

        if (orgError) throw orgError;
        setRestrictClothing(orgData?.restrict_clothing_options || false);

        if (orgData?.restrict_clothing_options) {
          const { data: approvedData, error: approvedError } = await supabase
            .from("organization_approved_clothing")
            .select("clothing_name, clothing_theme")
            .eq("organization_id", selectedContext.id);
          if (approvedError) throw approvedError;
          setApprovedClothing(
            approvedData.map((item) => ({
              name: item.clothing_name,
              theme: item.clothing_theme,
            })) || []
          );
        } else {
          // If not restricted, conceptually all are approved, but UI will reflect the toggle
          setApprovedClothing([]); // Clear local list if toggle is off
        }
      } catch (err) {
        console.error("Error fetching clothing settings:", err);
        setError("Failed to load clothing settings. " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrgSettings();
  }, [selectedContext, supabase]);

  const handleToggleRestrictClothing = (isRestricted) => {
    setRestrictClothing(isRestricted);
    if (!isRestricted) {
      // If admin untoggles restrictions, clear the specific approvals list (UI state)
      // The actual save will handle DB state.
      setApprovedClothing([]);
    }
  };

  const handleClothingItemToggle = (item, theme) => {
    const itemIdentifier = { name: item.name, theme };
    setApprovedClothing((prev) =>
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
      // 1. Update the restrict_clothing_options flag on the organizations table
      const { error: orgUpdateError } = await supabase
        .from("organizations")
        .update({ restrict_clothing_options: restrictClothing })
        .eq("id", selectedContext.id);

      if (orgUpdateError) throw orgUpdateError;

      // 2. Clear existing approved clothing for this org
      const { error: deleteError } = await supabase
        .from("organization_approved_clothing")
        .delete()
        .eq("organization_id", selectedContext.id);

      if (deleteError) throw deleteError; // or handle more gracefully

      // 3. If restricting, insert the new list of approved clothing
      if (restrictClothing && approvedClothing.length > 0) {
        const itemsToInsert = approvedClothing.map((item) => ({
          organization_id: selectedContext.id,
          clothing_name: item.name,
          clothing_theme: item.theme,
        }));
        const { error: insertError } = await supabase
          .from("organization_approved_clothing")
          .insert(itemsToInsert);
        if (insertError) throw insertError;
      }

      setSuccessMessage("Clothing preferences saved successfully!");
    } catch (err) {
      console.error("Error saving clothing settings:", err);
      setError("Failed to save clothing settings. " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getOptionsForTab = () => {
    if (activeTab === "All")
      return ALL_CLOTHING_OPTIONS.map((item) => ({
        ...item,
        theme: findClothingTheme(item.name),
      }));
    return (
      CLOTHING_OPTIONS[activeTab]?.map((item) => ({
        ...item,
        theme: activeTab,
      })) || []
    );
  };

  const getOptionsForDisplay = () => {
    if (activeTab === "All")
      return ALL_CLOTHING_OPTIONS.map((item) => ({
        ...item,
        theme: findClothingTheme(item.name),
      }));
    return (
      CLOTHING_OPTIONS[activeTab]?.map((item) => ({
        ...item,
        theme: activeTab,
      })) || []
    );
  };

  // Tab keys for clothing categories
  const tabKeys = ["All", ...Object.keys(CLOTHING_OPTIONS)];

  if (selectedContext && selectedContext.type === "personal") {
    return (
      <ContentLayout title="Browse Clothing Options">
        <Heading variant={"h2"} className="mb-4">
          Available Clothing Styles
        </Heading>
        <p className="text-muted-foreground mb-6">
          You are currently in your personal account. You have access to all
          clothing options shown below when creating your studios. Management of
          restrictions is available for organization administrators.
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
    // Should not happen if personal is handled above, but good for robustness
    return (
      <ContentLayout title="Manage Clothing Options">
        <p className="text-muted-foreground">
          Please select an organization context to manage clothing options.
        </p>
      </ContentLayout>
    );
  }

  console.log(isCurrentUserOrgAdmin, selectedContext);

  return (
    <ContentLayout title="Manage Organization Clothing Options">
      <div className="flex justify-between items-center mb-6">
        <Heading variant={"h2"}>
          Clothing Preferences for{" "}
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
              id="restrict-clothing-toggle"
              checked={restrictClothing}
              onCheckedChange={handleToggleRestrictClothing}
              disabled={isLoading || isSaving || !isCurrentUserOrgAdmin}
            />
            <Label htmlFor="restrict-clothing-toggle" className="text-base">
              Restrict clothing options for organization members
            </Label>
          </div>
          <p className="text-sm text-muted-foreground">
            If enabled, only the clothing items selected below will be available
            to members of your organization when creating a studio. If disabled,
            all globally available clothing options will be accessible.
          </p>
        </CardContent>
      </Card>

      {isLoading ? (
        <p>Loading clothing settings...</p>
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
                  // Filter by tab if not 'All'
                  if (activeTab !== "All" && item.theme !== activeTab)
                    return null;

                  const isApproved = approvedClothing.some(
                    (approved) =>
                      approved.name === item.name &&
                      approved.theme === item.theme
                  );
                  return (
                    <Card
                      key={item.name}
                      className={`relative ${
                        restrictClothing && isApproved
                          ? "border-primary ring-2 ring-primary"
                          : "border-border"
                      } ${
                        !restrictClothing || !isCurrentUserOrgAdmin
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                      onClick={() =>
                        restrictClothing &&
                        isCurrentUserOrgAdmin &&
                        handleClothingItemToggle(item, item.theme)
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
                        {restrictClothing && (
                          <Switch
                            checked={isApproved}
                            onCheckedChange={() =>
                              handleClothingItemToggle(item, item.theme)
                            }
                            aria-label={`Approve ${item.name}`}
                            disabled={
                              !restrictClothing ||
                              isSaving ||
                              !isCurrentUserOrgAdmin
                            }
                          />
                        )}
                        {!restrictClothing && (
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
