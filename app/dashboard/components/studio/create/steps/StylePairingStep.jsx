/**
 * Style Pairing Step Component
 * Allows users to create clothing and background combinations
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  ChevronLeft,
  ChevronRight,
  Shirt,
  Image as ImageIcon,
  Info,
  Shuffle,
  RotateCcw,
} from "lucide-react";
import useStudioCreateStore from "@/stores/studioCreateStore";
import {
  GLOBAL_ALL_CLOTHING_OPTIONS,
  ALL_BACKGROUND_OPTIONS,
} from "@/app/utils/styleOptions";
import { useStudioForm } from "../forms/StudioFormProvider";
import config from "@/config";

const StylePairingStep = ({ formData, errors, accountContext }) => {
  // Get fresh data directly from store to avoid stale props
  const {
    updateFormField,
    nextStep,
    prevStep,
    setErrors,
    formData: storeFormData,
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

  // Filter clothing options by gender using store data
  const genderFilteredClothingOptions = useMemo(() => {
    if (!currentGender) return [];
    return GLOBAL_ALL_CLOTHING_OPTIONS.filter(
      (item) => item.gender === currentGender || item.gender === "unisex"
    );
  }, [currentGender]);

  // Extract unique themes for clothing (based on current gender)
  const clothingThemes = useMemo(() => {
    const themes = [
      ...new Set(genderFilteredClothingOptions.map((item) => item.theme)),
    ];
    return ["All", ...themes.sort()];
  }, [genderFilteredClothingOptions]);

  // Extract unique themes for backgrounds
  const backgroundThemes = useMemo(() => {
    const themes = [
      ...new Set(ALL_BACKGROUND_OPTIONS.map((item) => item.theme)),
    ];
    return ["All", ...themes.sort()];
  }, []);

  // Apply theme filters to clothing options
  const filteredClothingOptions = useMemo(() => {
    if (clothingThemeFilter === "All") return genderFilteredClothingOptions;
    return genderFilteredClothingOptions.filter(
      (item) => item.theme === clothingThemeFilter
    );
  }, [genderFilteredClothingOptions, clothingThemeFilter]);

  // Apply theme filters to background options
  const filteredBackgroundOptions = useMemo(() => {
    if (backgroundThemeFilter === "All") return ALL_BACKGROUND_OPTIONS;
    return ALL_BACKGROUND_OPTIONS.filter(
      (item) => item.theme === backgroundThemeFilter
    );
  }, [backgroundThemeFilter]);

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
      setErrors({ stylePair: "Please select both clothing and background" });
      return;
    }

    // Check plan limit
    if (currentPairs.length >= planConfig.stylesLimit) {
      setErrors({
        stylePair: `Maximum ${planConfig.stylesLimit} style combinations allowed for your plan`,
      });
      return;
    }

    // Check if this combination already exists using optimized check
    if (combinationExists(selectedClothing, selectedBackground)) {
      setErrors({ stylePair: "This combination already exists" });
      return;
    }

    // Create optimized style pair structure
    const optimizedPair = createOptimizedStylePair(selectedClothing, selectedBackground);
    
    if (!optimizedPair) {
      setErrors({ stylePair: "Invalid clothing or background selection" });
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
      setErrors({
        style_pairs:
          "No clothing or background options available for pairing with current theme filters.",
      });
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
        const optimizedPair = createOptimizedStylePair(clothing.id, background.id);
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
      setErrors({
        style_pairs: "At least one style combination is required.",
      });
      return;
    }

    // Clear any existing errors
    setErrors({});
    nextStep();
  };

  // Helper functions to get item details - DRY principle
  const getClothingById = (id) => {
    return GLOBAL_ALL_CLOTHING_OPTIONS.find((item) => item.id === id);
  };
  
  const getBackgroundById = (id) => {
    return ALL_BACKGROUND_OPTIONS.find((item) => item.id === id);
  };
  
  // Helper function to create optimized style pair structure
  const createOptimizedStylePair = (clothingId, backgroundId) => {
    const clothingItem = getClothingById(clothingId);
    const backgroundItem = getBackgroundById(backgroundId);
    
    if (!clothingItem || !backgroundItem) {
      console.error('Invalid clothing or background ID:', { clothingId, backgroundId });
      return null;
    }
    
    return {
      clothing: {
        name: clothingItem.name,
        theme: clothingItem.theme
      },
      background: {
        name: backgroundItem.name,
        theme: backgroundItem.theme
      }
    };
  };
  
  // Helper function to get full item details for UI display
  const getFullItemDetails = (stylePair) => {
    // Find items by matching name and theme (since we removed IDs)
    const clothingItem = GLOBAL_ALL_CLOTHING_OPTIONS.find(
      item => item.name === stylePair.clothing.name && item.theme === stylePair.clothing.theme
    );
    const backgroundItem = ALL_BACKGROUND_OPTIONS.find(
      item => item.name === stylePair.background.name && item.theme === stylePair.background.theme
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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Style Combinations</h2>
        <p className="text-muted-foreground">
          Create combinations of clothing and backgrounds for your headshots
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <Badge variant="outline">
            {currentPairs.length} / {planConfig.stylesLimit} combinations
          </Badge>
          <span>•</span>
          <span>Gender: {currentGender}</span>
          <span>•</span>
          <span>Plan: {currentPlan}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-3">
        <Button
          variant="outline"
          onClick={handleAutoPair}
          disabled={currentPairs.length >= planConfig.stylesLimit}
          className="flex items-center gap-2"
        >
          <Shuffle className="h-4 w-4" />
          Auto Pair (
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
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear All
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clear All Style Combinations</DialogTitle>
              <DialogDescription>
                Are you sure you want to clear all {currentPairs.length} style
                combinations? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowClearDialog(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleClearAll}>
                Clear All
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Style Pair Creator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Combination
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Clothing Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shirt className="h-5 w-5" />
                  <h4 className="font-medium">
                    Clothing ({filteredClothingOptions.length} options)
                  </h4>
                </div>
                <Select
                  value={clothingThemeFilter}
                  onValueChange={setClothingThemeFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by theme" />
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
              <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto p-2">
                {filteredClothingOptions.map((option) => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedClothing === option.id
                        ? "ring-2 ring-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedClothing(option.id)}
                  >
                    <div className="aspect-square relative overflow-hidden bg-muted rounded-t-lg">
                      <img
                        src={option.image}
                        alt={option.name}
                        className="w-full h-full object-cover transition-transform duration-200 hover:scale-105 p-1"
                        loading="lazy"
                      />
                    </div>
                    <CardContent className="p-1">
                      <h5 className="font-medium text-xs text-center leading-tight">
                        {option.name}
                      </h5>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Background Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  <h4 className="font-medium">
                    Backgrounds ({filteredBackgroundOptions.length} options)
                  </h4>
                </div>
                <Select
                  value={backgroundThemeFilter}
                  onValueChange={setBackgroundThemeFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by theme" />
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
              <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto p-2">
                {filteredBackgroundOptions.map((option) => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedBackground === option.id
                        ? "ring-2 ring-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedBackground(option.id)}
                  >
                    <div className="aspect-square relative overflow-hidden bg-muted rounded-t-lg">
                      <img
                        src={option.image}
                        alt={option.name}
                        className="w-full h-full object-cover transition-transform duration-200 hover:scale-105 p-1"
                        loading="lazy"
                      />
                    </div>
                    <CardContent className="p-1">
                      <h5 className="font-medium text-xs text-center leading-tight">
                        {option.name}
                      </h5>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Combination Preview */}
          {(selectedClothing || selectedBackground) && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <h5 className="font-medium mb-2">Current Selection:</h5>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Clothing:</span>{" "}
                  <span className="font-medium">
                    {getClothingById(selectedClothing)?.name || "Not selected"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Background:</span>{" "}
                  <span className="font-medium">
                    {getBackgroundById(selectedBackground)?.name ||
                      "Not selected"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Add Button */}
          <div className="mt-6">
            <Button
              onClick={addStylePair}
              disabled={
                !selectedClothing ||
                !selectedBackground ||
                currentPairs.length >= planConfig.stylesLimit
              }
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Combination ({currentPairs.length}/{planConfig.stylesLimit})
            </Button>
          </div>

          {/* Error Display */}
          {errors.stylePair && (
            <Alert variant="destructive" className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>{errors.stylePair}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Created Style Pairs */}
      {currentPairs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Your Style Combinations ({currentPairs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {currentPairs.map((pair, index) => {
                // Get full item details for UI display (includes images)
                const { clothingItem, backgroundItem } = getFullItemDetails(pair);

                return (
                  <div
                    key={`${pair.clothing.name}-${pair.background.name}-${index}`}
                    className="flex items-start justify-between p-4 border rounded-lg bg-card"
                  >
                    <div className="flex flex-col gap-3 flex-1">
                      {/* Clothing Preview */}
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={
                              clothingItem?.image || "/placeholder-clothing.jpg"
                            }
                            alt={pair.clothing.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-sm min-w-0 flex-1">
                          <div className="font-medium truncate">
                            {pair.clothing.name}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {pair.clothing.theme}
                          </div>
                        </div>
                      </div>

                      {/* Background Preview */}
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={
                              backgroundItem?.image ||
                              "/placeholder-background.jpg"
                            }
                            alt={pair.background.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-sm min-w-0 flex-1">
                          <div className="font-medium truncate">
                            {pair.background.name}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {pair.background.theme}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStylePair(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {(errors.style_pairs || errors.stylePair) && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertDescription>
            {errors.style_pairs || errors.stylePair}
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button onClick={handleNext} disabled={stylePairs.length === 0}>
          Next Step
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default StylePairingStep;
