/**
 * Style Pairing Step Component
 * Allows users to create clothing and background combinations
 */

import React, { useState, useEffect, useMemo } from "react";
import OptimizedImage from "@/components/shared/optimized-image";
import Masonry from "react-masonry-css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  X,
  Shuffle,
  Shirt,
  Images as ImagesIcon,
  RotateCw,
  Check,
  Play,
} from "lucide-react";
import useStudioCreateStore from "@/stores/studioCreateStore";
import {
  GLOBAL_ALL_CLOTHING_OPTIONS,
  ALL_BACKGROUND_OPTIONS,
  getGenderBasedBackgroundPath,
} from "@/utils/styleOptions";
import StepNavigation from "@/components/studio/create/step-navigation";
import config from "@/config";

const StylePairingStep = ({
  clothingOptions,
  backgroundOptions,
}) => {
  // Get fresh data directly from store to avoid stale props
  const {
    updateFormField,
    nextStep,
    prevStep,
    setErrors,
    formData: storeFormData,
    isSubmitting,
  } = useStudioCreateStore();
  const [selectedClothing, setSelectedClothing] = useState("");
  const [selectedBackground, setSelectedBackground] = useState("");
  const [selectedClothingItem, setSelectedClothingItem] = useState(null);
  const [selectedBackgroundItem, setSelectedBackgroundItem] = useState(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showHowItWorksDialog, setShowHowItWorksDialog] = useState(false);
  const [clothingThemeFilter, setClothingThemeFilter] = useState("All");
  const [backgroundThemeFilter, setBackgroundThemeFilter] = useState("All");

  // Use store data as source of truth
  const currentPlan = storeFormData.plan;
  const currentGender = storeFormData.gender;
  const currentPairs = storeFormData.style_pairs || [];
  
  // Track what plan/gender was used when style pairs were created (stored in Zustand, persists across mounts)
  const stylePairsCreatedWithPlan = storeFormData.stylePairsCreatedWithPlan;
  const stylePairsCreatedWithGender = storeFormData.stylePairsCreatedWithGender;

  // Get plan configuration from config using store data
  const planConfig = useMemo(() => {
    return config.PLANS[currentPlan] || config.PLANS.starter;
  }, [currentPlan]);

  // Filter clothing options by gender using filtered options from props
  const genderFilteredClothingOptions = useMemo(() => {
    if (!currentGender) return [];
    const optionsToFilter = clothingOptions || GLOBAL_ALL_CLOTHING_OPTIONS;

    // For non-binary users, show both men's and women's clothing options
    if (currentGender === "non-binary") {
      return optionsToFilter.filter(
        (item) =>
          item.gender === "man" ||
          item.gender === "woman" ||
          item.gender === "unisex"
      );
    }

    // For binary genders, filter by exact match or unisex
    return optionsToFilter.filter(
      (item) => item.gender === currentGender || item.gender === "unisex"
    );
  }, [currentGender, clothingOptions]);

  // Extract unique themes for clothing (based on current gender)
  const clothingThemes = useMemo(() => {
    const themes = [
      ...new Set(genderFilteredClothingOptions.map((item) => item.theme)),
    ];
    return ["All", ...themes.sort()];
  }, [genderFilteredClothingOptions]);

  // Extract unique themes for backgrounds
  const backgroundThemes = useMemo(() => {
    const optionsToFilter = backgroundOptions || ALL_BACKGROUND_OPTIONS;
    const themes = [...new Set(optionsToFilter.map((item) => item.theme))];
    return ["All", ...themes.sort()];
  }, [backgroundOptions]);

  // Apply theme filters to clothing options
  const filteredClothingOptions = useMemo(() => {
    if (clothingThemeFilter === "All") return genderFilteredClothingOptions;
    return genderFilteredClothingOptions.filter(
      (item) => item.theme === clothingThemeFilter
    );
  }, [genderFilteredClothingOptions, clothingThemeFilter]);

  // Apply theme filters to background options and add gender-based paths
  const filteredBackgroundOptions = useMemo(() => {
    const optionsToFilter = backgroundOptions || ALL_BACKGROUND_OPTIONS;
    
    // First apply theme filter
    const themeFiltered = backgroundThemeFilter === "All" 
      ? optionsToFilter 
      : optionsToFilter.filter((item) => item.theme === backgroundThemeFilter);
    
    // Then apply gender-based image paths
    return themeFiltered.map((item) => ({
      ...item,
      image: getGenderBasedBackgroundPath(item.image, currentGender),
    }));
  }, [backgroundThemeFilter, backgroundOptions, currentGender]);

  // Clear style pairs when plan or gender changes from what they were created with
  useEffect(() => {
    // If no style pairs exist, nothing to clear
    if (currentPairs.length === 0) return;
    
    // If we don't know what plan/gender the pairs were created with, they're from before this fix
    // In this case, store the current values and don't clear (backward compatibility)
    if (stylePairsCreatedWithPlan === null || stylePairsCreatedWithGender === null) {
      updateFormField("stylePairsCreatedWithPlan", currentPlan);
      updateFormField("stylePairsCreatedWithGender", currentGender);
      return;
    }

    // Check if current plan/gender differs from what pairs were created with
    const planChanged = stylePairsCreatedWithPlan !== currentPlan;
    const genderChanged = stylePairsCreatedWithGender !== currentGender;

    // If plan or gender changed, clear the pairs
    if (planChanged || genderChanged) {
      // Clear the pairs and reset tracking
      updateFormField("style_pairs", []);
      updateFormField("stylePairsCreatedWithPlan", null);
      updateFormField("stylePairsCreatedWithGender", null);

      // Show message
      const changeType =
        planChanged && genderChanged
          ? "plan and gender"
          : planChanged
          ? "plan"
          : "gender";
      setErrors({
        style_pairs: `Style pairs cleared due to ${changeType} change. Please select new combinations.`,
      });
    }
  }, [
    currentPlan,
    currentGender,
    currentPairs.length,
    stylePairsCreatedWithPlan,
    stylePairsCreatedWithGender,
    updateFormField,
    setErrors,
  ]);

  // Additional useEffect to monitor plan config changes and enforce limits
  useEffect(() => {
    if (currentPairs.length > planConfig.stylesLimit) {
      // Trim to plan limit
      const trimmedPairs = currentPairs.slice(0, planConfig.stylesLimit);
      updateFormField("style_pairs", trimmedPairs);
      setErrors({
        style_pairs: `Reduced to ${planConfig.stylesLimit} combinations due to plan limit`,
      });
    }
  }, [planConfig.stylesLimit, currentPairs, updateFormField, setErrors]);

  const addStylePair = () => {
    if (!selectedClothing || !selectedBackground) {
      toast.error("Please select both clothing and background");
      return;
    }

    // Check plan limit
    if (currentPairs.length >= planConfig.stylesLimit) {
      toast.error(
        `Maximum ${planConfig.stylesLimit} style combinations allowed for your plan`
      );
      return;
    }

    // Check if this combination already exists using optimized check
    if (combinationExists(selectedClothing, selectedBackground)) {
      toast.error("This combination already exists");
      return;
    }

    // Create optimized style pair structure
    const optimizedPair = createOptimizedStylePair(
      selectedClothing,
      selectedBackground
    );

    if (!optimizedPair) {
      toast.error("Invalid clothing or background selection");
      return;
    }

    const newPairs = [...currentPairs, optimizedPair];

    updateFormField("style_pairs", newPairs);
    
    // Track what plan/gender these pairs were created with (for change detection)
    if (stylePairsCreatedWithPlan === null) {
      updateFormField("stylePairsCreatedWithPlan", currentPlan);
    }
    if (stylePairsCreatedWithGender === null) {
      updateFormField("stylePairsCreatedWithGender", currentGender);
    }
    
    setSelectedClothing("");
    setSelectedBackground("");
    setSelectedClothingItem(null);
    setSelectedBackgroundItem(null);
    setErrors({});
  };

  const handleAutoPair = () => {
    const availableClothing = filteredClothingOptions;
    const availableBackgrounds = filteredBackgroundOptions;

    if (availableClothing.length === 0 || availableBackgrounds.length === 0) {
      toast.error(
        "No clothing or background options available for pairing with current theme filters."
      );
      return;
    }

    const newPairs = [];
    const clothingCount = availableClothing.length;
    const backgroundCount = availableBackgrounds.length;

    const maxPairs = Math.min(
      planConfig.stylesLimit,
      clothingCount * backgroundCount
    );

    // Create arrays of shuffled indexes for random selection
    const shuffledClothingIndexes = [...Array(clothingCount).keys()].sort(
      () => Math.random() - 0.5
    );
    const shuffledBackgroundIndexes = [...Array(backgroundCount).keys()].sort(
      () => Math.random() - 0.5
    );

    // Keep track of used combinations to avoid duplicates
    const usedCombinations = new Set();

    let attempts = 0;
    const maxAttempts = maxPairs * 3; // Prevent infinite loops

    while (newPairs.length < maxPairs && attempts < maxAttempts) {
      // Get random clothing and background
      const clothingIndex = shuffledClothingIndexes[attempts % clothingCount];
      const backgroundIndex =
        shuffledBackgroundIndexes[attempts % backgroundCount];

      const clothing = availableClothing[clothingIndex];
      const background = availableBackgrounds[backgroundIndex];

      // Create combination key using name and theme for uniqueness
      const combinationKey = `${clothing.name}-${clothing.theme}-${background.name}-${background.theme}`;

      // Only add if this combination hasn't been used
      if (!usedCombinations.has(combinationKey)) {
        const optimizedPair = createOptimizedStylePair(
          clothing.id,
          background.id
        );
        if (optimizedPair) {
          newPairs.push(optimizedPair);
          usedCombinations.add(combinationKey);
        }
      }

      attempts++;
    }

    updateFormField("style_pairs", newPairs);
    
    // Track what plan/gender these pairs were created with (for change detection)
    if (newPairs.length > 0) {
      updateFormField("stylePairsCreatedWithPlan", currentPlan);
      updateFormField("stylePairsCreatedWithGender", currentGender);
    }
    
    setErrors({});
  };

  const handleClearAll = () => {
    updateFormField("style_pairs", []);
    // Reset tracking when all pairs are cleared
    updateFormField("stylePairsCreatedWithPlan", null);
    updateFormField("stylePairsCreatedWithGender", null);
    setShowClearDialog(false);
    setErrors({});
  };

  const removeStylePair = (index) => {
    const newPairs = currentPairs.filter((_, i) => i !== index);
    updateFormField("style_pairs", newPairs);
    
    // Reset tracking when all pairs are removed
    if (newPairs.length === 0) {
      updateFormField("stylePairsCreatedWithPlan", null);
      updateFormField("stylePairsCreatedWithGender", null);
    }
  };

  const handleNext = () => {
    // Get the latest pairs from store to ensure we have fresh data
    const latestPairs = storeFormData.style_pairs || [];

    // Validate that at least one combination is selected
    if (latestPairs.length === 0) {
      toast.error("At least one style combination is required.");
      return;
    }

    // Clear any existing errors
    setErrors({});
    nextStep();
  };

  // Helper functions to get item details - DRY principle
  const getClothingById = (id) => {
    const optionsToSearch = clothingOptions || GLOBAL_ALL_CLOTHING_OPTIONS;
    return optionsToSearch.find((item) => item.id === id);
  };

  const getBackgroundById = (id) => {
    const optionsToSearch = backgroundOptions || ALL_BACKGROUND_OPTIONS;
    const backgroundItem = optionsToSearch.find((item) => item.id === id);
    
    if (!backgroundItem) return null;
    
    // Apply gender-based path to the background image
    return {
      ...backgroundItem,
      image: getGenderBasedBackgroundPath(backgroundItem.image, currentGender),
    };
  };

  // Helper function to create optimized style pair structure
  const createOptimizedStylePair = (clothingId, backgroundId) => {
    const clothingItem = getClothingById(clothingId);
    const backgroundItem = getBackgroundById(backgroundId);

    if (!clothingItem || !backgroundItem) {
      console.error("Invalid clothing or background ID:", {
        clothingId,
        backgroundId,
      });
      return null;
    }

    return {
      clothing: {
        name: clothingItem.name,
        theme: clothingItem.theme,
      },
      background: {
        name: backgroundItem.name,
        theme: backgroundItem.theme,
      },
    };
  };

  // Helper function to get full item details for UI display
  const getFullItemDetails = (stylePair) => {
    // Find items by matching name and theme (since we removed IDs)
    const clothingOptionsToSearch =
      clothingOptions || GLOBAL_ALL_CLOTHING_OPTIONS;
    const backgroundOptionsToSearch =
      backgroundOptions || ALL_BACKGROUND_OPTIONS;

    const clothingItem = clothingOptionsToSearch.find(
      (item) =>
        item.name === stylePair.clothing.name &&
        item.theme === stylePair.clothing.theme
    );
    const backgroundItem = backgroundOptionsToSearch.find(
      (item) =>
        item.name === stylePair.background.name &&
        item.theme === stylePair.background.theme
    );

    // Apply gender-based path to background item if found
    const backgroundItemWithGenderPath = backgroundItem ? {
      ...backgroundItem,
      image: getGenderBasedBackgroundPath(backgroundItem.image, currentGender),
    } : null;

    return { clothingItem, backgroundItem: backgroundItemWithGenderPath };
  };

  // Helper function to check if combination exists (using names instead of IDs)
  const combinationExists = (clothingId, backgroundId) => {
    const clothingItem = getClothingById(clothingId);
    const backgroundItem = getBackgroundById(backgroundId);

    if (!clothingItem || !backgroundItem) return false;

    return currentPairs.some(
      (pair) =>
        pair.clothing.name === clothingItem.name &&
        pair.clothing.theme === clothingItem.theme &&
        pair.background.name === backgroundItem.name &&
        pair.background.theme === backgroundItem.theme
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 sm:space-y-3">
        <h2 className="text-xl sm:text-2xl font-semibold">Create style combinations</h2>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
          Create combinations of clothing and backgrounds for your headshots.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-primary/20 rounded-full"
          >
            {currentPairs.length} / {planConfig.stylesLimit} combinations
          </Badge>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <Button
          variant="outline"
          onClick={handleAutoPair}
          disabled={currentPairs.length >= planConfig.stylesLimit}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100 text-blue-700 rounded-full"
        >
          <Shuffle className="h-4 w-4" />
          Auto pair (
          {Math.min(
            planConfig.stylesLimit,
            filteredClothingOptions.length * filteredBackgroundOptions.length
          )}
          )
        </Button>

        <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              disabled={currentPairs.length === 0}
              className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700 rounded-full"
            >
              <RotateCw className="h-4 w-4" />
              Clear all
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Clear all combinations?</DialogTitle>
              <DialogDescription>
                This will remove all {currentPairs.length} style combinations.
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setShowClearDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleClearAll}
              >
                Clear all
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* How it works video dialog */}
        <Dialog open={showHowItWorksDialog} onOpenChange={setShowHowItWorksDialog}>
          <DialogTrigger asChild>
            <Button
              variant="default"
              className="flex items-center gap-2 rounded-full"
              aria-label="Watch how to create style combinations"
            >
              <Play className="h-4 w-4" />
              How it works
            </Button>
          </DialogTrigger>
          <DialogContent 
            className="sm:max-w-3xl w-[calc(100vw-2rem)] max-h-[90vh] p-0 overflow-hidden"
            aria-describedby="how-it-works-description"
          >
              <div className="relative w-full bg-muted rounded-lg overflow-hidden">
                {showHowItWorksDialog && (
                  <video
                    className="w-full h-auto object-cover"
                    src="https://cdn.proshoot.co/demo-videos/final-style-selection.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    poster="https://cdn.proshoot.co/demo-videos/final-style-selection-poster.jpg"
                  />
                )}
              </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Style Pair Creator */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
        <CardContent className="space-y-6">
          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Clothing Column */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                    <Shirt className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Clothing</h4>
                    <p className="text-xs text-muted-foreground">
                      {filteredClothingOptions.length} options
                    </p>
                  </div>
                </div>
                <Select
                  value={clothingThemeFilter}
                  onValueChange={setClothingThemeFilter}
                >
                  <SelectTrigger className="w-full sm:w-[160px] h-9">
                    <SelectValue placeholder="All themes" />
                  </SelectTrigger>
                  <SelectContent>
                    {clothingThemes.map((theme) => (
                      <SelectItem key={theme} value={theme}>
                        {theme}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="border rounded-xl p-3 bg-background/50">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-[32rem] overflow-y-auto overflow-x-hidden">
                  {filteredClothingOptions.map((option) => (
                    <div
                      key={option.id}
                      className="group cursor-pointer transition-all duration-200 focus:outline-none"
                      onClick={() => {
                        setSelectedClothing(option.id);
                        setSelectedClothingItem(option);
                      }}
                    >
                      <div
                        className={`relative rounded-xl overflow-hidden border transition-all ${
                          selectedClothing === option.id
                            ? "border-primary/40 ring-primary/50"
                            : "border-border/50 hover:border-primary/30"
                        }`}
                      >
                        <div className="aspect-square bg-muted/40 relative">
                          <OptimizedImage
                            src={option.image}
                            alt={option.name}
                            fill
                            className="object-cover"
                            sizes="160px"
                            priority={false}
                          />
                        </div>
                        {selectedClothing === option.id && (
                          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                              <Plus className="h-3 w-3" />
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-medium text-center mt-2 leading-tight">
                        {option.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Background Column */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-destructive/10 text-destructive">
                    <ImagesIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Backgrounds</h4>
                    <p className="text-xs text-muted-foreground">
                      {filteredBackgroundOptions.length} options
                    </p>
                  </div>
                </div>
                <Select
                  value={backgroundThemeFilter}
                  onValueChange={setBackgroundThemeFilter}
                >
                  <SelectTrigger className="w-full sm:w-[160px] h-9">
                    <SelectValue placeholder="All themes" />
                  </SelectTrigger>
                  <SelectContent>
                    {backgroundThemes.map((theme) => (
                      <SelectItem key={theme} value={theme}>
                        {theme}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="border rounded-xl p-3 bg-background/50">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-[32rem] overflow-y-auto overflow-x-hidden">
                  {filteredBackgroundOptions.map((option) => (
                    <div
                      key={option.id}
                      className="group cursor-pointer transition-all duration-200 focus:outline-none"
                      onClick={() => {
                        setSelectedBackground(option.id);
                        setSelectedBackgroundItem(option);
                      }}
                    >
                      <div
                        className={`relative rounded-xl overflow-hidden border transition-all ${
                          selectedBackground === option.id
                            ? "border-primary/40 ring-primary/50"
                            : "border-border/50 hover:border-primary/30"
                        }`}
                      >
                        <div className="aspect-square bg-muted/40 relative">
                          <OptimizedImage
                            src={option.image}
                            alt={option.name}
                            fill
                            className="object-cover"
                            sizes="160px"
                            priority={false}
                          />
                        </div>
                        {selectedBackground === option.id && (
                          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                              <Plus className="h-3 w-3" />
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-medium text-center mt-2 leading-tight">
                        {option.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Selected Combination Preview & Add Button (matches card style) */}
          {(selectedClothing || selectedBackground) && (
            <div className="max-w-3xl mx-auto">
              <div
                onClick={addStylePair}
                disabled={
                  !selectedClothing ||
                  !selectedBackground ||
                  currentPairs.length >= planConfig.stylesLimit
                }
                className="group relative bg-background border border-primary/25 rounded-xl p-4 transition-all duration-200 cursor-crosshair"
              >
                <div className="flex w-full flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Clothing (left) */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-muted relative">
                      {selectedClothingItem ? (
                        <OptimizedImage
                          key={`clothing-preview-${selectedClothingItem.id}`}
                          src={selectedClothingItem.image}
                          alt={selectedClothingItem.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                          priority={true}
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Shirt className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">
                        {selectedClothingItem?.name || "Not selected"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {selectedClothingItem?.theme || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Plus Icon (center) */}
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mx-auto sm:mx-0">
                    {/* <Plus className="h-3 w-3 text-primary" /> */}
                    <Button
                      onClick={addStylePair}
                      disabled={
                        !selectedClothing ||
                        !selectedBackground ||
                        currentPairs.length >= planConfig.stylesLimit
                      }
                      className="h-7 w-7 rounded-full bg-destructive hover:bg-destructive/90 shadow text-primary-foreground cursor-crosshair"
                      aria-label="Add selected combination"
                      title={`Add (${currentPairs.length}/${planConfig.stylesLimit})`}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Background (right) */}
                  <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate text-right">
                        {selectedBackgroundItem?.name || "Not selected"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate text-right">
                        {selectedBackgroundItem?.theme || "—"}
                      </p>
                    </div>
                    <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-muted relative">
                      {selectedBackgroundItem ? (
                        <OptimizedImage
                          key={`background-preview-${selectedBackgroundItem.id}`}
                          src={selectedBackgroundItem.image}
                          alt={selectedBackgroundItem.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                          priority={true}
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <ImagesIcon className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Badge
                  variant="destructive"
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-semibold w-full flex items-center justify-center rounded-lg"
                >
                  Click here to add your combination
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Created Style Pairs */}
      {currentPairs.length > 0 && (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-lg mb-4">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Check className="h-4 w-4" />
              </div>
              Your combinations ({currentPairs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Masonry
              breakpointCols={{
                default: 2,
                1024: 2,
                768: 1,
                640: 1,
              }}
              className="flex w-auto -ml-4"
              columnClassName="pl-4 bg-clip-padding"
            >
              {currentPairs.map((pair, index) => {
                // Get full item details for UI display (includes images)
                const { clothingItem, backgroundItem } =
                  getFullItemDetails(pair);

                return (
                  <div
                    key={`${pair.clothing.name}-${pair.background.name}-${index}`}
                    className="group relative bg-background border border-border/50 rounded-xl p-4 mb-4 transition-all duration-200 hover:border-primary/30 break-inside-avoid"
                  >
                    <div className="flex w-full flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {/* Combination Preview */}
                      <div className="flex w-full flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-1 min-w-0">
                        {/* Clothing */}
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-muted relative">
                            <OptimizedImage
                              src={
                                clothingItem?.image ||
                                "/images/placeholder.svg"
                              }
                              alt={pair.clothing.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                              priority={false}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">
                              {pair.clothing.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {pair.clothing.theme}
                            </p>
                          </div>
                        </div>

                        {/* Plus Icon */}
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mx-auto sm:mx-0">
                          <Plus className="h-3 w-3 text-primary" />
                        </div>

                        {/* Background */}
                        <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                          <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-muted relative">
                            <OptimizedImage
                              src={
                                backgroundItem?.image ||
                                "/images/placeholder.svg"
                              }
                              alt={pair.background.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                              priority={false}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">
                              {pair.background.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {pair.background.theme}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <span
                        className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-destructive hover:bg-destructive/80 p-1 rounded-full cursor-pointer focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40 transition-opacity"
                        onClick={() => removeStylePair(index)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Remove combination ${pair.clothing.name} with ${pair.background.name}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            removeStylePair(index);
                          }
                        }}
                      >
                        <X className="size-3 text-white" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </Masonry>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <StepNavigation
        onNext={handleNext}
        onPrevious={prevStep}
        nextDisabled={currentPairs.length === 0}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default StylePairingStep;
