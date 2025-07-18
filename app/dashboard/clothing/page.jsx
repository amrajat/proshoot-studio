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
import { GLOBAL_ALL_CLOTHING_OPTIONS } from "@/app/utils/studioOptions";

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

  const clothingThemes = [...new Set(GLOBAL_ALL_CLOTHING_OPTIONS.map(item => item.theme))];
  const tabKeys = ["All", ...clothingThemes];

  const itemsToDisplay = activeTab === 'All' 
    ? GLOBAL_ALL_CLOTHING_OPTIONS 
    : GLOBAL_ALL_CLOTHING_OPTIONS.filter(item => item.theme === activeTab);

  if (selectedContext?.type === "personal") {
    return (
      <ContentLayout title="Browse Clothing Options">
        <Heading variant={"h2"} className="mb-4">
          Available Clothing Styles
        </Heading>
        <p className="text-muted-foreground mb-6">
          Management of restrictions is available for organization administrators.
        </p>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="mb-4">
            {tabKeys.map((group) => (
              <TabsTrigger key={group} value={group}>{group}</TabsTrigger>
            ))}
          </TabsList>
          {tabKeys.map((group) => (
            <TabsContent key={group} value={group}>
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
          ))}
        </Tabs>
      </ContentLayout>
    );
  }

  if (selectedContext?.type !== "organization") {
    return (
      <ContentLayout title="Manage Clothing Options">
        <p className="text-muted-foreground">
          Please select an organization context to manage clothing options.
        </p>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Manage Organization Clothing Options">
      <div className="flex justify-between items-center mb-6">
        <Heading variant={"h2"}>
          Clothing Preferences for {selectedContext?.name || "Your Organization"}
        </Heading>
        {isCurrentUserOrgAdmin && (
          <Button onClick={handleSaveChanges} disabled={isLoading || isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </div>

      {error && <p className="text-destructive mb-4">Error: {error}</p>}
      {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}
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
              If enabled, only the clothing items selected below will be available.
            </p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p>Loading clothing settings...</p>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="mb-4">
            {tabKeys.map((group) => (
              <TabsTrigger key={group} value={group}>{group}</TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={activeTab}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {itemsToDisplay.map((item) => {
                const isApproved = approvedClothing.includes(item.id);
                return (
                  <Card
                    key={item.id}
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
                      handleClothingItemToggle(item.id)
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
                      {restrictClothing && isCurrentUserOrgAdmin && (
                        <Switch
                          checked={isApproved}
                          onCheckedChange={() => handleClothingItemToggle(item.id)}
                          aria-label={`Approve ${item.name}`}
                          disabled={!restrictClothing || isSaving}
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
        </Tabs>
      )}
    </ContentLayout>
  );
}
