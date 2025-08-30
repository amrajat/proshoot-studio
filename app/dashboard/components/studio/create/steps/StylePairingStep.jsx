/**
 * Style Pairing Step Component
 * Allows users to create clothing and background combinations
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
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
  Info,
  RotateCw,
  Check,
} from "lucide-react";
import useStudioCreateStore from "@/stores/studioCreateStore";
import {
  GLOBAL_ALL_CLOTHING_OPTIONS,
  ALL_BACKGROUND_OPTIONS,
} from "@/app/utils/styleOptions";
import { useStudioForm } from "../forms/StudioFormProvider";
import StepNavigation from "../components/StepNavigation";
import config from "@/config";

const StylePairingStep = ({
  formData,
  errors,
  accountContext,
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
    resetFormCompletely,
    isSubmitting,
  } = useStudioCreateStore();

  const { validateCurrentStep } = useStudioForm();
  const [selectedClothing, setSelectedClothing] = useState("");
  const [selectedBackground, setSelectedBackground] = useState("");
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [clothingThemeFilter, setClothingThemeFilter] = useState("All");
  const [backgroundThemeFilter, setBackgroundThemeFilter] = useState("All");

  // Store previous values in localStorage for persistence across component mounts
  const PREV_VALUES_KEY = "style-pairing-prev-values";

  const getPrevValues = () => {
    if (typeof window === "undefined") return { plan: null, gender: null };
    try {
      const stored = localStorage.getItem(PREV_VALUES_KEY);
      return stored ? JSON.parse(stored) : { plan: null, gender: null };
    } catch {
      return { plan: null, gender: null };
    }
  };

  const setPrevValues = (values) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(PREV_VALUES_KEY, JSON.stringify(values));
    } catch (error) {}
  };

  // Use store data as source of truth
  const currentPlan = storeFormData.plan;
  const currentGender = storeFormData.gender;
  const currentPairs = storeFormData.style_pairs || [];

  // Keep prop data for compatibility
  const stylePairs = formData.style_pairs || [];
  const selectedPlan = formData.plan;
  const selectedGender = formData.gender;

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

  // Apply theme filters to background options
  const filteredBackgroundOptions = useMemo(() => {
    const optionsToFilter = backgroundOptions || ALL_BACKGROUND_OPTIONS;
    if (backgroundThemeFilter === "All") return optionsToFilter;
    return optionsToFilter.filter(
      (item) => item.theme === backgroundThemeFilter
    );
  }, [backgroundThemeFilter, backgroundOptions]);

  // Clear style pairs when plan or gender changes - USING STORE DATA WITH PERSISTENCE
  useEffect(() => {
    const prevValues = getPrevValues();

    // If this is the first time we see these values, just store them
    if (prevValues.plan === null || prevValues.gender === null) {
      setPrevValues({ plan: currentPlan, gender: currentGender });
      return;
    }

    // Check for actual changes using stored previous values
    const planChanged = prevValues.plan !== currentPlan;
    const genderChanged = prevValues.gender !== currentGender;

    // If plan or gender changed and we have pairs, clear them
    if ((planChanged || genderChanged) && currentPairs.length > 0) {
      // Clear the pairs immediately
      updateFormField("style_pairs", []);

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

    // Always update the stored previous values
    setPrevValues({ plan: currentPlan, gender: currentGender });
  }, [
    currentPlan,
    currentGender,
    currentPairs.length,
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
  }, [
    planConfig.stylesLimit,
    currentPairs.length,
    currentPlan,
    updateFormField,
    setErrors,
  ]);

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
    setSelectedClothing("");
    setSelectedBackground("");
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
    setErrors({});
  };

  const handleClearAll = () => {
    updateFormField("style_pairs", []);
    setShowClearDialog(false);
    setErrors({});
  };

  const removeStylePair = (index) => {
    const newPairs = currentPairs.filter((_, i) => i !== index);
    updateFormField("style_pairs", newPairs);
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
    return optionsToSearch.find((item) => item.id === id);
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

    return { clothingItem, backgroundItem };
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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-semibold">Create style combinations</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
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
                onClick={() => {
                  updateFormField("style_pairs", []);
                  setShowClearDialog(false);
                  setErrors({});
                }}
              >
                Clear all
              </Button>
            </DialogFooter>
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
                      onClick={() => setSelectedClothing(option.id)}
                    >
                      <div
                        className={`relative rounded-xl overflow-hidden border transition-all ${
                          selectedClothing === option.id
                            ? "border-primary/40 ring-primary/50"
                            : "border-border/50 hover:border-primary/30"
                        }`}
                      >
                        <div className="aspect-square bg-muted/40 relative">
                          {/* FIX THE PROPER IMAGE LATER */}
                          <Image
                            // src={option.image}
                            src={"/images/placeholder.svg"}
                            alt={option.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16vw"
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
                      onClick={() => setSelectedBackground(option.id)}
                    >
                      <div
                        className={`relative rounded-xl overflow-hidden border transition-all ${
                          selectedBackground === option.id
                            ? "border-primary/40 ring-primary/50"
                            : "border-border/50 hover:border-primary/30"
                        }`}
                      >
                        <div className="aspect-square bg-muted/40 relative">
                          {/* TODO: FIX THE PROPER IMAGE LATER */}
                          <Image
                            // src={option.image}
                            src={"/images/placeholder.svg"}
                            alt={option.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16vw"
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
                className="group relative bg-background border border-border/50 rounded-xl p-4 transition-all duration-200 cursor-crosshair"
              >
                {/* FIX THE PROPER IMAGE LATER */}
                <div className="flex w-full flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Clothing (left) */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-muted relative">
                      <Image
                        src={
                          getClothingById(selectedClothing)?.image &&
                          "/images/placeholder.svg"
                        }
                        alt={
                          getClothingById(selectedClothing)?.name || "Clothing"
                        }
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">
                        {getClothingById(selectedClothing)?.name ||
                          "Not selected"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {getClothingById(selectedClothing)?.theme || "—"}
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
                        {getBackgroundById(selectedBackground)?.name ||
                          "Not selected"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate text-right">
                        {getBackgroundById(selectedBackground)?.theme || "—"}
                      </p>
                    </div>
                    <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-muted relative">
                      <Image
                        src={
                          getBackgroundById(selectedBackground)?.image &&
                          "/images/placeholder.svg"
                        }
                        alt={
                          getBackgroundById(selectedBackground)?.name ||
                          "Background"
                        }
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 bg-primary/10 text-primary text-xs font-semibold"
                >
                  New Style
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
                            <Image
                              src={
                                clothingItem?.image ||
                                "/placeholder-clothing.jpg"
                              }
                              alt={pair.clothing.name}
                              fill
                              className="object-cover"
                              sizes="48px"
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
                            <Image
                              src={
                                backgroundItem?.image ||
                                "/images/placeholder.svg"
                              }
                              alt={pair.background.name}
                              fill
                              className="object-cover"
                              sizes="48px"
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
        nextDisabled={stylePairs.length === 0}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default StylePairingStep;
