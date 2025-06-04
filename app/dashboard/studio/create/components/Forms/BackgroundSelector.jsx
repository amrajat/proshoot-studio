import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Heading from "@/components/shared/heading";
import {
  BACKGROUND_OPTIONS as GLOBAL_BACKGROUND_OPTIONS,
  ALL_BACKGROUND_OPTIONS as GLOBAL_ALL_BACKGROUND_OPTIONS,
  findBackgroundTheme as globalFindBackgroundTheme,
} from "@/app/utils/studioOptions";

// Updated BACKGROUND_OPTIONS
const BACKGROUND_OPTIONS = {
  "Studio (Solid Colors)": [
    { name: "Grey Studio Backdrop", image: "/images/placeholder.svg" },
    { name: "Dark Studio Backdrop", image: "/images/placeholder.svg" },
    { name: "Blue Studio Backdrop", image: "/images/placeholder.svg" },
    { name: "Green Studio Backdrop", image: "/images/placeholder.svg" }, // Assuming a solid green screen
  ],
  "Office (Modern or Traditional)": [
    { name: "Modern Office Interior", image: "/images/placeholder.svg" },
    { name: "Office Lobby", image: "/images/placeholder.svg" },
    { name: "Loft-Style Office", image: "/images/placeholder.svg" },
    { name: "Office Window View", image: "/images/placeholder.svg" },
  ],
  "City (Urban, Rooftop, Street View)": [
    { name: "Cityscape Window View", image: "/images/placeholder.svg" },
    { name: "Urban Building Exterior", image: "/images/placeholder.svg" },
    { name: "French Rooftop View", image: "/images/placeholder.svg" },
    { name: "Red Brick Wall (Urban)", image: "/images/placeholder.svg" },
    { name: "City Street Scene", image: "/images/placeholder.svg" },
    { name: "Urban Sunlight Effect", image: "/images/placeholder.svg" },
    { name: "Urban Alleyway", image: "/images/placeholder.svg" },
    { name: "Brooklyn Waterfront View", image: "/images/placeholder.svg" },
    { name: "Golden Gate Bridge View", image: "/images/placeholder.svg" },
    { name: "Yellow Brick Wall (Urban)", image: "/images/placeholder.svg" },
    { name: "Urban Marina View", image: "/images/placeholder.svg" },
    { name: "Hotel (City Context)", image: "/images/placeholder.svg" }, // e.g., lobby or exterior city view
  ],
  "Nature (Parks, Trees, Outdoors)": [
    { name: "Garden Scenery", image: "/images/placeholder.svg" },
    { name: "Lush Greenery Backdrop", image: "/images/placeholder.svg" },
    { name: "Park Setting", image: "/images/placeholder.svg" },
    { name: "Forest Woods", image: "/images/placeholder.svg" },
    { name: "Lakeside View", image: "/images/placeholder.svg" },
    { name: "Sunset Over Landscape", image: "/images/placeholder.svg" },
    { name: "Beachside Stairs", image: "/images/placeholder.svg" },
    { name: "Tulip Field", image: "/images/placeholder.svg" },
    { name: "Wildflower Meadow", image: "/images/placeholder.svg" },
    { name: "Outdoor Wooden Fence", image: "/images/placeholder.svg" },
    { name: "Natural Marina View", image: "/images/placeholder.svg" },
  ],
  "Abstract / Gradient": [
    // This category can be populated if you have abstract/gradient images
    // { name: "Soft Blue Gradient", image: "/images/placeholder.svg" },
    // { name: "Geometric Abstract", image: "/images/placeholder.svg" },
  ],
  "Bookshelves / Intellectual": [
    {
      name: "Bookshelf Backdrop (Intellectual)",
      image: "/images/placeholder.svg",
    },
  ],
  "Home Office / Hybrid Work": [
    { name: "Home Office with Window", image: "/images/placeholder.svg" },
    { name: "Loft-Style Home Workspace", image: "/images/placeholder.svg" },
    { name: "Cafe as a Workspace", image: "/images/placeholder.svg" },
    { name: "Home Kitchen Backdrop", image: "/images/placeholder.svg" },
    { name: "Rustic Charm Home Interior", image: "/images/placeholder.svg" },
  ],
};

const ALL_BACKGROUND_OPTIONS = Object.values(BACKGROUND_OPTIONS).flat();

// Helper function to find the theme for a given background item name
const findBackgroundTheme = (itemName) => {
  for (const theme in BACKGROUND_OPTIONS) {
    if (BACKGROUND_OPTIONS[theme].some((option) => option.name === itemName)) {
      return theme;
    }
  }
  return "Unknown"; // Should not happen if item is from BACKGROUND_OPTIONS
};

export default function BackgroundSelector({
  value = [], // Array of { name: string, theme: string }
  onChange,
  max,
  min = 1,
  isSubmitting,
  errors,
  shouldValidate,
  availableItems = null, // New prop: array of {name, theme, image}
}) {
  const [activeTab, setActiveTab] = useState("All");

  const currentBackgroundOptions = availableItems
    ? availableItems.reduce((acc, item) => {
        if (!acc[item.theme]) acc[item.theme] = [];
        acc[item.theme].push({
          name: item.name,
          image: item.image,
          theme: item.theme,
        });
        return acc;
      }, {})
    : GLOBAL_BACKGROUND_OPTIONS;

  const currentAllBackgroundOptions = availableItems
    ? availableItems.map((item) => ({
        name: item.name,
        image: item.image,
        theme: item.theme,
      }))
    : GLOBAL_ALL_BACKGROUND_OPTIONS;

  const findCurrentTheme = availableItems
    ? (itemName) =>
        currentAllBackgroundOptions.find((item) => item.name === itemName)
          ?.theme || "Unknown"
    : globalFindBackgroundTheme;

  const tabKeys = ["All", ...Object.keys(currentBackgroundOptions)];

  const getOptions = () => {
    if (activeTab === "All") return currentAllBackgroundOptions;
    return currentBackgroundOptions[activeTab];
  };

  const handleSelect = (item) => {
    // item is { name: string, image: string } from getOptions()
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
    // item is { name: string, image: string }
    return value.some((selected) => selected.name === item.name);
  };

  return (
    <fieldset disabled={isSubmitting} className="space-y-4">
      <Badge variant="destructive" className="mb-2 uppercase">
        This field is required
      </Badge>
      <Heading variant={"hero"}>Select Backgrounds</Heading>
      <p className="text-muted-foreground mb-2">
        Choose up to {max} backgrounds. At least {min} required.
      </p>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList>
          {tabKeys.map((group) => (
            <TabsTrigger key={group} value={group}>
              {group}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {getOptions().map((item) => (
          <Card
            key={item.name}
            className={`relative cursor-pointer ${
              isSelected(item)
                ? "border-primary ring-2 ring-primary"
                : "border-border"
            }`}
            onClick={() => handleSelect(item)}
            tabIndex={0}
            aria-label={item.name}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleSelect(item);
            }}
          >
            <CardContent className="flex flex-col items-center p-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 object-cover rounded mb-2"
                loading="lazy"
              />
              <span className="font-medium text-center">{item.name}</span>
              {isSelected(item) && (
                <span className="absolute top-2 right-2 text-primary font-bold">
                  ✓
                </span>
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
