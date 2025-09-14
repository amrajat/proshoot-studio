"use client";

import React, { useState, useEffect } from "react";
import { useAccountContext } from "@/context/AccountContext";
import createSupabaseBrowserClient from "@/lib/supabase/browser-client";
import { GLOBAL_ALL_CLOTHING_OPTIONS } from "@/utils/styleOptions";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Settings, Shirt, User, Users } from "lucide-react";
import { CenteredLoader } from "@/components/shared/universal-loader";
import OptimizedImage from "@/components/shared/optimized-image";

export default function ManageClothingPage() {
  const { selectedContext, isCurrentUserOrgAdmin } = useAccountContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const [restrictClothing, setRestrictClothing] = useState(false);
  const [approvedClothing, setApprovedClothing] = useState([]); // Now stores array of clothing objects
  const [activeTab, setActiveTab] = useState("All");
  const [selectedGender, setSelectedGender] = useState("woman");

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
        // Parse JSON data or fallback to empty array
        const parsedClothing = Array.isArray(orgData?.approved_clothing) 
          ? orgData.approved_clothing 
          : [];
        setApprovedClothing(parsedClothing);
      } catch (err) {
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
    const item = GLOBAL_ALL_CLOTHING_OPTIONS.find(option => option.id === itemId);
    if (!item) return;

    setApprovedClothing((prev) => {
      const existingIndex = prev.findIndex(approved => approved.id === itemId);
      if (existingIndex >= 0) {
        // Remove item
        return prev.filter(approved => approved.id !== itemId);
      } else {
        // Add item with structured data
        return [...prev, {
          id: item.id,
          name: item.name,
          theme: item.theme
        }];
      }
    });
  };

  const handleSaveChanges = async () => {
    if (!selectedContext || !isCurrentUserOrgAdmin) return;

    try {
      setIsSaving(true);
      setError(null);

      const { error } = await supabase
        .from("organizations")
        .update({
          restrict_clothing_options: restrictClothing,
          approved_clothing: restrictClothing ? approvedClothing : [],
        })
        .eq("id", selectedContext.id);

      if (error) {
        throw error;
      }

      toast.success("Clothing settings updated successfully!");
    } catch (error) {
      toast.error("Failed to update clothing settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenderChange = (gender) => {
    setSelectedGender(gender);
    setActiveTab("All"); // Reset to "All" tab when gender changes
  };

  // Filter clothing options by selected gender first
  const genderFilteredClothing = GLOBAL_ALL_CLOTHING_OPTIONS.filter(
    (item) => item.gender === selectedGender
  );

  const clothingThemes = [
    ...new Set(genderFilteredClothing.map((item) => item.theme)),
  ];
  const tabKeys = ["All", ...clothingThemes];

  const itemsToDisplay =
    activeTab === "All"
      ? genderFilteredClothing
      : genderFilteredClothing.filter((item) => item.theme === activeTab);

  if (selectedContext?.type === "personal") {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Shirt className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Clothing</h1>
              <p className="text-gray-600">
                Manage clothing restrictions for your organization
              </p>
            </div>
          </div>
          {/* Gender Switch */}
          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
            <Button
              variant={selectedGender === "woman" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleGenderChange("woman")}
              className="flex items-center gap-2 px-3 py-2"
            >
              <User className="w-4 h-4" />
              Woman
            </Button>
            <Button
              variant={selectedGender === "man" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleGenderChange("man")}
              className="flex items-center gap-2 px-3 py-2"
            >
              <Users className="w-4 h-4" />
              Man
            </Button>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {itemsToDisplay.map((item) => (
                <Card
                  key={item.id}
                  className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    
                    <OptimizedImage
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      fill
                      sizes="160px"
                      priority={false}
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
    <div className="space-y-8">
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
        <div className="flex items-center gap-4">
          {/* Gender Switch */}
          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
            <Button
              variant={selectedGender === "woman" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleGenderChange("woman")}
              className="flex items-center gap-2 px-3 py-2"
            >
              <User className="w-4 h-4" />
              Woman
            </Button>
            <Button
              variant={selectedGender === "man" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleGenderChange("man")}
              className="flex items-center gap-2 px-3 py-2"
            >
              <Users className="w-4 h-4" />
              Man
            </Button>
          </div>
          {isCurrentUserOrgAdmin && (
            <Button onClick={handleSaveChanges} disabled={isLoading || isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>
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
        <CenteredLoader text="Loading clothing options" />
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
                const isApproved = approvedClothing.some(approved => approved.id === item.id);
                const isInteractive = restrictClothing && isCurrentUserOrgAdmin;

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
                      <OptimizedImage
                        src={item.image}
                        alt={item.name}
                        className={`w-full h-full object-cover transition-transform duration-200 ${
                          isInteractive ? "group-hover:scale-105" : ""
                        }`}
                        fill
                        sizes="160px"
                        priority={false}
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
