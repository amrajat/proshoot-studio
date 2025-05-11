import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Heading from "@/components/shared/heading";
import {
  CLOTHING_OPTIONS as GLOBAL_CLOTHING_OPTIONS,
  ALL_CLOTHING_OPTIONS as GLOBAL_ALL_CLOTHING_OPTIONS,
  findClothingTheme as globalFindClothingTheme,
} from "@/app/utils/studioOptions";

export default function ClothingSelector({
  value = [],
  onChange,
  max,
  min = 1,
  isSubmitting,
  errors,
  shouldValidate,
  availableItems = null,
}) {
  const [activeTab, setActiveTab] = useState("All");

  const currentClothingOptions = availableItems
    ? availableItems.reduce((acc, item) => {
        if (!acc[item.theme]) acc[item.theme] = [];
        acc[item.theme].push({
          name: item.name,
          image: item.image,
          theme: item.theme,
        });
        return acc;
      }, {})
    : GLOBAL_CLOTHING_OPTIONS;

  const currentAllClothingOptions = availableItems
    ? availableItems.map((item) => ({
        name: item.name,
        image: item.image,
        theme: item.theme,
      }))
    : GLOBAL_ALL_CLOTHING_OPTIONS;

  const findCurrentTheme = availableItems
    ? (itemName) =>
        currentAllClothingOptions.find((item) => item.name === itemName)
          ?.theme || "Unknown"
    : globalFindClothingTheme;

  const tabKeys = ["All", ...Object.keys(currentClothingOptions)];

  const getOptions = () => {
    if (activeTab === "All") return currentAllClothingOptions;
    return currentClothingOptions[activeTab] || [];
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

  return (
    <fieldset disabled={isSubmitting} className="space-y-4">
      <Badge variant="destructive" className="mb-2 uppercase">
        This field is required
      </Badge>
      <Heading variant={"hero"}>Select Clothing</Heading>
      <p className="text-muted-foreground mb-2">
        Choose up to {max} clothing styles. At least {min} required.
      </p>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList>
          {tabKeys
            .filter(
              (key) =>
                key === "All" ||
                (currentClothingOptions[key] &&
                  currentClothingOptions[key].length > 0)
            )
            .map((group) => (
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
