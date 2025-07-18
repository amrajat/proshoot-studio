"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Heading from "@/components/shared/heading";
import { Plus, Trash2, Shuffle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StylePairing({
  value: pairs = [],
  onChange,
  max, // stylesLimit
  isSubmitting,
  selectedGender,
  clothingOptions = [],
  backgroundOptions = [],
}) {
  const [tempClothing, setTempClothing] = useState(null);
  const [tempBackground, setTempBackground] = useState(null);
  const [clothingTheme, setClothingTheme] = useState("All");
  const [backgroundTheme, setBackgroundTheme] = useState("All");

  const clothingThemes = ["All", ...new Set(clothingOptions.map((c) => c.theme))];
  const backgroundThemes = ["All", ...new Set(backgroundOptions.map((b) => b.theme))];

  const filteredClothing = React.useMemo(() => {
    if (!selectedGender || !clothingOptions) return [];
    return clothingOptions
      .filter(
        (c) =>
          c.gender.toLowerCase() === selectedGender.toLowerCase() ||
          c.gender.toLowerCase() === "unisex"
      )
      .filter((c) => clothingTheme === "All" || c.theme === clothingTheme);
  }, [selectedGender, clothingOptions, clothingTheme]);

  const filteredBackgrounds = React.useMemo(() => {
    if (!backgroundOptions) return [];
    return backgroundOptions.filter(
      (b) => backgroundTheme === "All" || b.theme === backgroundTheme
    );
  }, [backgroundOptions, backgroundTheme]);

  const handleAddPair = () => {
    if (tempClothing && tempBackground && pairs.length < max) {
      const newPair = { clothing: tempClothing, background: tempBackground };
      onChange([...pairs, newPair]);
      setTempClothing(null);
      setTempBackground(null);
    }
  };

  const handleRemovePair = (index) => {
    const newPairs = pairs.filter((_, i) => i !== index);
    onChange(newPairs);
  };

  const handleAutoPair = () => {
    const newPairs = [];
    const clothingCount = filteredClothing.length;
    const backgroundCount = backgroundOptions.length;
    if (clothingCount === 0 || backgroundCount === 0) return;

    for (let i = 0; i < max; i++) {
      const clothing = clothingOptions[i % clothingCount];
      const background = backgroundOptions[i % backgroundCount];
      newPairs.push({ clothing, background });
    }
    onChange(newPairs);
  };

  return (
    <fieldset disabled={isSubmitting} className="space-y-6">
      <Heading variant={"hero"}>Create Your Style Pairs</Heading>
      <p className="text-muted-foreground">
        Combine your selected clothing and backgrounds to create up to {max}{" "}
        unique styles for your headshots.
      </p>

      {/* --- PAIR CREATION UI --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 border rounded-lg bg-muted/50">
        {/* Clothing Selector */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">1. Select Clothing</h3>
          <Tabs value={clothingTheme} onValueChange={setClothingTheme}>
            <TabsList>
              {clothingThemes.map((theme) => (
                <TabsTrigger key={theme} value={theme}>
                  {theme}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-2 bg-background rounded-md border">
            {filteredClothing.map((item) => (
              <SelectableItem
                key={item.id}
                item={item}
                isSelected={tempClothing?.id === item.id}
                onClick={() => setTempClothing(item)}
              />
            ))}
          </div>
        </div>

        {/* Background Selector */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">2. Select Background</h3>
          <Tabs value={backgroundTheme} onValueChange={setBackgroundTheme}>
            <TabsList>
              {backgroundThemes.map((theme) => (
                <TabsTrigger key={theme} value={theme}>
                  {theme}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-2 bg-background rounded-md border">
            {filteredBackgrounds.map((item) => (
              <SelectableItem
                key={item.id}
                item={item}
                isSelected={tempBackground?.id === item.id}
                onClick={() => setTempBackground(item)}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="md:col-span-2 flex justify-center items-center gap-4">
          <Button
            type="button"
            onClick={handleAddPair}
            disabled={!tempClothing || !tempBackground || pairs.length >= max}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Pair
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleAutoPair}
            disabled={pairs.length >= max}
          >
            <Shuffle className="mr-2 h-4 w-4" /> Auto-pair for me
          </Button>
        </div>
      </div>

      {/* --- PAIRED ITEMS DISPLAY --- */}
      <div>
        <h3 className="font-semibold text-lg mb-4">
          Your Pairs ({pairs.length} / {max})
        </h3>
        {pairs.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No pairs created yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pairs.map((pair, index) => (
              <div key={index} className="relative group">
                <Card className="overflow-hidden">
                  <Image
                    // src={getImagePath('clothing', selectedGender, pair.clothing.image)}
                    src={"/images/background.jpg"}
                    alt={pair.clothing.name}
                    width={150}
                    height={150}
                    className="w-full h-auto aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <Image
                      // src={getImagePath('background', selectedGender, pair.background.image)}
                      src={"/images/background.jpg"}
                      alt={pair.background.name}
                      layout="fill"
                      className="absolute -z-10 object-cover"
                    />
                    <p className="text-white text-center font-semibold text-sm p-2 bg-black/50 rounded-md">
                      {pair.clothing.name} + {pair.background.name}
                    </p>
                  </div>
                </Card>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemovePair(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </fieldset>
  );
}

const SelectableItem = ({ item, isSelected, onClick }) => (
  <button
    type="button"
    className={`relative aspect-square w-full rounded-lg overflow-hidden transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background group ${
      isSelected ? "ring-2 ring-primary" : "ring-0"
    }`}
    onClick={onClick}
  >
    <Image
      // src={item.image || "/images/placeholder.png"}
      src={"/images/background.jpg"}
      alt={item.name}
      fill
      className="object-cover transition-transform duration-300 group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors" />
  </button>
);
