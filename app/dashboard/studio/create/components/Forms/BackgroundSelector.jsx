import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import Heading from "@/components/shared/heading";
import {
  BACKGROUND_OPTIONS,
  ALL_BACKGROUND_OPTIONS,
  findBackgroundTheme as globalFindBackgroundTheme,
} from "@/app/utils/studioOptions";

export default function BackgroundSelector({
  value = [],
  onChange,
  max,
  min = 1,
  isSubmitting,
  errors,
  shouldValidate,
  availableItems = null,
  selectedGender = "default",
}) {
  const [activeTab, setActiveTab] = useState("All");

  const { currentBackgroundOptions, currentAllBackgroundOptions } =
    useMemo(() => {
      if (!availableItems) {
        return {
          currentBackgroundOptions: BACKGROUND_OPTIONS,
          currentAllBackgroundOptions: ALL_BACKGROUND_OPTIONS,
        };
      }

      const availableNames = new Set(availableItems.map((item) => item.name));
      const filteredOptions = {};
      for (const theme in BACKGROUND_OPTIONS) {
        const themeItems = BACKGROUND_OPTIONS[theme].filter((item) =>
          availableNames.has(item.name)
        );
        if (themeItems.length > 0) {
          filteredOptions[theme] = themeItems;
        }
      }
      const filteredAllOptions = ALL_BACKGROUND_OPTIONS.filter((item) =>
        availableNames.has(item.name)
      );

      return {
        currentBackgroundOptions: filteredOptions,
        currentAllBackgroundOptions: filteredAllOptions,
      };
    }, [availableItems]);

  const findCurrentTheme = (itemName) => {
    return globalFindBackgroundTheme(itemName);
  };

  const tabKeys = ["All", ...Object.keys(currentBackgroundOptions)];

  const getOptions = () => {
    if (activeTab === "All") return currentAllBackgroundOptions;
    return currentBackgroundOptions[activeTab] || [];
  };

  const handleSelect = (item) => {
    const itemTheme =
      activeTab === "All" ? findCurrentTheme(item.name) : activeTab;
    const selectedItemObject = { name: item.name, theme: itemTheme };

    const alreadySelected = value.some(
      (selected) => selected.name === item.name
    );
    let newValue;

    if (alreadySelected) {
      newValue = value.filter((selected) => selected.name !== item.name);
    } else {
      if (value.length >= max) return;
      newValue = [...value, selectedItemObject];
    }
    onChange(newValue);
  };

  const isSelected = (item) => {
    return value.some((selected) => selected.name === item.name);
  };

  const getImageSrc = (imageFilename) => {
    if (!imageFilename) return "/images/placeholder.svg";
    // Construct path: /images/backgrounds/default/{filename}
    return `/images/backgrounds/default/${imageFilename}`;
  };

  const [imagesLoading, setImagesLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const options = getOptions();

  React.useEffect(() => {
    setLoadedCount(0);
    setImagesLoading(true);
  }, [selectedGender, activeTab]);

  const handleImageLoaded = () => {
    setLoadedCount((prevCount) => {
      const newCount = prevCount + 1;
      if (newCount >= options.length) {
        setImagesLoading(false);
      }
      return newCount;
    });
  };

  return (
    <fieldset disabled={isSubmitting} className="space-y-4">
      <Heading variant={"hero"}>Please choose your backgrounds.</Heading>
      <p className="text-muted-foreground mb-2">
        Choose up to {max} backgrounds. At least {min} required.
      </p>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList>
          {tabKeys
            .filter(
              (key) =>
                key === "All" ||
                (currentBackgroundOptions[key] &&
                  currentBackgroundOptions[key].length > 0)
            )
            .map((group) => (
              <TabsTrigger key={group} value={group}>
                {group}
              </TabsTrigger>
            ))}
        </TabsList>
      </Tabs>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {options.map((item) => (
          <Card
            key={item.name}
            className={`relative cursor-pointer overflow-hidden rounded transition-all duration-200 ${
              isSelected(item)
                ? "ring-2 ring-primary ring-offset-2"
                : "ring-1 ring-border"
            }`}
            onClick={() => handleSelect(item)}
            tabIndex={0}
            aria-label={item.name}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleSelect(item);
            }}
          >
            <CardContent className="p-0">
              <Image
                src={getImageSrc(item.image)}
                alt={item.name}
                width={256}
                height={256}
                loading="lazy"
                className="aspect-square w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                onLoadingComplete={handleImageLoaded}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-8">
                <span className="font-semibold text-white text-sm text-center block truncate">
                  {item.name}
                </span>
              </div>
              {isSelected(item) && (
                <div className="absolute top-2 right-2 bg-primary rounded-full w-6 h-6 flex items-center justify-center z-10">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-2 text-sm text-muted-foreground">
        Selected: {value.length} / {max}
      </div>
      {shouldValidate && errors && (
        <p className="text-sm text-destructive mt-2">{errors}</p>
      )}
    </fieldset>
  );
}
