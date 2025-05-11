// utils/prompts.js
export const PROMPT_TEMPLATES = [
  {
    id: "studio_solid_biz_prof_01",
    name: "Studio Solid - Business Professional",
    description: "Clean, professional studio shot on a solid background.",
    compatibleClothingThemes: [
      "Business Professional",
      "Executive / Luxury Branding",
    ],
    compatibleBackgroundThemes: ["Studio (Solid Colors)"],
    promptFunction: (character, clothingName, backgroundName) => {
      const bgColor = backgroundName.toLowerCase().includes("grey")
        ? "neutral gray"
        : backgroundName.toLowerCase().includes("dark")
        ? "dark charcoal"
        : backgroundName.toLowerCase().includes("blue")
        ? "deep blue"
        : backgroundName.toLowerCase().includes("green")
        ? "muted green"
        : "off-white";
      return `photorealistic studio portrait of ohwx, ${character.ethnicity} ${
        character.gender
      } in ${character.age}, with ${character.eyeColor} eyes, ${
        character.hairStyle
      }${
        character.glasses ? ", wearing glasses" : ""
      }. Subject is wearing ${clothingName}. Background is a plain solid ${bgColor}. Lighting is soft and even, professional corporate style. High resolution, sharp focus.`;
    },
  },
  {
    id: "office_modern_biz_cas_01",
    name: "Modern Office - Business Casual",
    description: "Approachable professional in a modern office setting.",
    compatibleClothingThemes: [
      "Business Casual",
      "Smart Casual",
      "Tech Casual / Startup Style",
    ],
    compatibleBackgroundThemes: [
      "Office (Modern or Traditional)",
      "Home Office / Hybrid Work",
    ],
    promptFunction: (character, clothingName, backgroundName) => {
      return `professional headshot of ohwx, ${character.ethnicity} ${
        character.gender
      } in ${character.age}, with ${character.eyeColor} eyes, ${
        character.hairStyle
      }${
        character.glasses ? ", wearing glasses" : ""
      }. Subject wears ${clothingName}. Background is a ${backgroundName}, slightly blurred. Natural light from a window. Warm and approachable.`;
    },
  },
  {
    id: "city_urban_smart_cas_01",
    name: "Urban Cityscape - Smart Casual",
    description: "Dynamic shot with a city background.",
    compatibleClothingThemes: [
      "Smart Casual",
      "Creative Professional",
      "Tech Casual / Startup Style",
    ],
    compatibleBackgroundThemes: ["City (Urban, Rooftop, Street View)"],
    promptFunction: (character, clothingName, backgroundName) => {
      return `headshot of ohwx, ${character.ethnicity} ${character.gender} in ${
        character.age
      }, with ${character.eyeColor} eyes, ${character.hairStyle}${
        character.glasses ? ", wearing glasses" : ""
      }, wearing ${clothingName}. Background is a blurred ${backgroundName}. Cinematic lighting, confident expression.`;
    },
  },
  {
    id: "nature_creative_prof_01",
    name: "Outdoor Nature - Creative Professional",
    description: "Artistic and relaxed outdoor portrait.",
    compatibleClothingThemes: ["Creative Professional", "Smart Casual"],
    compatibleBackgroundThemes: ["Nature (Parks, Trees, Outdoors)"],
    promptFunction: (character, clothingName, backgroundName) => {
      return `outdoor portrait of ohwx, ${character.ethnicity} ${
        character.gender
      } in ${character.age}, with ${character.eyeColor} eyes, ${
        character.hairStyle
      }${
        character.glasses ? ", wearing glasses" : ""
      }. Attire: ${clothingName}. Setting: serene ${backgroundName} with soft, natural lighting.`;
    },
  },
  {
    id: "bookshelf_intellectual_01",
    name: "Bookshelf - Intellectual Vibe",
    description: "Thoughtful portrait with a bookshelf background.",
    compatibleClothingThemes: [
      "Business Casual",
      "Smart Casual",
      "Creative Professional",
    ],
    compatibleBackgroundThemes: [
      "Bookshelves / Intellectual",
      "Home Office / Hybrid Work",
    ],
    promptFunction: (character, clothingName, backgroundName) => {
      return `professional portrait of ohwx, ${character.ethnicity} ${
        character.gender
      } in ${character.age}, with ${character.eyeColor} eyes, ${
        character.hairStyle
      }${
        character.glasses ? ", wearing glasses" : ""
      }. Wearing ${clothingName}. Background: ${backgroundName}, creating an intellectual atmosphere. Warm indoor lighting.`;
    },
  },
  {
    id: "tech_startup_gradient_01",
    name: "Tech Startup - Abstract Gradient",
    description: "Modern and clean for tech profiles.",
    compatibleClothingThemes: [
      "Tech Casual / Startup Style",
      "Creative Professional",
    ],
    compatibleBackgroundThemes: [
      "Abstract / Gradient",
      "Studio (Solid Colors)",
    ],
    promptFunction: (character, clothingName, backgroundName) => {
      const bgDesc =
        backgroundName.toLowerCase().includes("backdrop") ||
        backgroundName.toLowerCase().includes("studio")
          ? backgroundName
          : `an abstract gradient with ${backgroundName} hues`;
      return `modern tech headshot of ohwx, ${character.ethnicity} ${
        character.gender
      } in ${character.age}, with ${character.eyeColor} eyes, ${
        character.hairStyle
      }${
        character.glasses ? ", wearing glasses" : ""
      }. Wearing ${clothingName}. Background: ${bgDesc}. Clean, minimalist aesthetic.`;
    },
  },
  {
    id: "executive_luxury_office_01",
    name: "Executive - Luxury Office",
    description: "Powerful and sophisticated executive portrait.",
    compatibleClothingThemes: [
      "Executive / Luxury Branding",
      "Business Professional",
    ],
    compatibleBackgroundThemes: ["Office (Modern or Traditional)"],
    promptFunction: (character, clothingName, backgroundName) => {
      return `executive portrait of ohwx, ${character.ethnicity} ${
        character.gender
      } in ${character.age}, with ${character.eyeColor} eyes, ${
        character.hairStyle
      }${
        character.glasses ? ", wearing glasses" : ""
      }. Subject in ${clothingName}. Background: luxurious ${backgroundName} with rich textures. Strong, directional lighting.`;
    },
  },
  {
    id: "cultural_studio_01",
    name: "Cultural Attire - Studio",
    description: "Respectful studio portrait highlighting cultural attire.",
    compatibleClothingThemes: ["Cultural or Identity-Informed"],
    compatibleBackgroundThemes: [
      "Studio (Solid Colors)",
      "Abstract / Gradient",
    ],
    promptFunction: (character, clothingName, backgroundName) => {
      const bgColor =
        backgroundName.toLowerCase().includes("backdrop") ||
        backgroundName.toLowerCase().includes("studio")
          ? backgroundName
          : "a neutral, respectful solid color backdrop";
      return `portrait of ohwx, ${character.ethnicity} ${character.gender} in ${
        character.age
      }, with ${character.eyeColor} eyes, ${character.hairStyle}${
        character.glasses ? ", wearing glasses" : ""
      }. Proudly wearing ${clothingName}. Background: ${bgColor}. Lighting designed to honor the attire.`;
    },
  },
  {
    id: "generic_any_any_01", // Fallback generic template
    name: "Generic Professional Headshot",
    description: "A versatile fallback prompt.",
    compatibleClothingThemes: ["Any"],
    compatibleBackgroundThemes: ["Any"],
    promptFunction: (character, clothingName, backgroundName) => {
      return `professional headshot of ohwx, ${character.ethnicity} ${
        character.gender
      } in ${character.age}, with ${character.eyeColor} eyes, ${
        character.hairStyle
      }${
        character.glasses ? ", wearing glasses" : ""
      }. Subject is wearing ${clothingName}. Background is ${backgroundName}. Photorealistic, high quality, well-lit.`;
    },
  },
  // TODO: Add at least 11 more diverse templates here to reach a good number (e.g., 20 total unique templates).
  // Ensure you cover combinations like:
  // - Home Office + Tech Casual
  // - Rooftop + Creative Professional
  // - Solid Color + Smart Casual
  // - Park + Business Casual
  // - etc.
];

export function generatePrompts(
  userCharacterInputs,
  selectedClothing,
  selectedBackgrounds,
  stylesLimit
) {
  if (
    !userCharacterInputs ||
    !selectedClothing?.length ||
    !selectedBackgrounds?.length ||
    !stylesLimit
  ) {
    console.error("generatePrompts: Invalid inputs", {
      userCharacterInputs,
      selectedClothing,
      selectedBackgrounds,
      stylesLimit,
    });
    return [];
  }

  const allPossiblePromptObjects = [];
  const uniquePromptStrings = new Set();

  for (const clothing of selectedClothing) {
    for (const background of selectedBackgrounds) {
      const suitableTemplates = PROMPT_TEMPLATES.filter(
        (template) =>
          (template.compatibleClothingThemes.includes(clothing.theme) ||
            template.compatibleClothingThemes.includes("Any")) &&
          (template.compatibleBackgroundThemes.includes(background.theme) ||
            template.compatibleBackgroundThemes.includes("Any"))
      );

      for (const template of suitableTemplates) {
        const promptString = template.promptFunction(
          userCharacterInputs,
          clothing.name,
          background.name
        );
        if (!uniquePromptStrings.has(promptString)) {
          allPossiblePromptObjects.push({
            prompt: promptString,
            clothingName: clothing.name,
            clothingTheme: clothing.theme,
            backgroundName: background.name,
            backgroundTheme: background.theme,
            templateId: template.id,
          });
          uniquePromptStrings.add(promptString);
        }
      }
    }
  }

  if (allPossiblePromptObjects.length === 0) {
    const genericTemplate = PROMPT_TEMPLATES.find(
      (t) => t.id === "generic_any_any_01"
    );
    if (
      genericTemplate &&
      selectedClothing.length > 0 &&
      selectedBackgrounds.length > 0
    ) {
      const C = selectedClothing[0];
      const B = selectedBackgrounds[0];
      const promptString = genericTemplate.promptFunction(
        userCharacterInputs,
        C.name,
        B.name
      );
      if (!uniquePromptStrings.has(promptString)) {
        allPossiblePromptObjects.push({
          prompt: promptString,
          clothingName: C.name,
          clothingTheme: C.theme,
          backgroundName: B.name,
          backgroundTheme: B.theme,
          templateId: genericTemplate.id,
        });
        uniquePromptStrings.add(promptString);
      }
    }
    if (allPossiblePromptObjects.length === 0) {
      console.warn(
        "generatePrompts: No suitable prompts could be generated, returning empty array."
      );
      return [];
    }
  }

  let finalPrompts = [];
  if (allPossiblePromptObjects.length > stylesLimit) {
    // Simple shuffle to get a somewhat random assortment if we have more unique prompts than the limit
    const shuffled = [...allPossiblePromptObjects].sort(
      () => 0.5 - Math.random()
    );
    finalPrompts = shuffled.slice(0, stylesLimit).map((p) => p.prompt);
  } else {
    finalPrompts = allPossiblePromptObjects.map((p) => p.prompt);
  }

  // If we still have fewer prompts than stylesLimit and need to fill up to the limit
  if (finalPrompts.length < stylesLimit && finalPrompts.length > 0) {
    const needed = stylesLimit - finalPrompts.length;
    for (let i = 0; i < needed; i++) {
      // Cycle through the unique prompts we were able to generate
      finalPrompts.push(finalPrompts[i % finalPrompts.length]);
    }
  }
  return finalPrompts;
}

export function _generatePrompts(
  userCharacterInputs,
  selectedClothing,
  selectedBackgrounds,
  stylesLimit
) {
  // Ensure inputs are valid
  if (
    !userCharacterInputs ||
    !selectedClothing?.length ||
    !selectedBackgrounds?.length ||
    !stylesLimit
  ) {
    console.error("generatePrompts: Invalid inputs", {
      userCharacterInputs,
      selectedClothing,
      selectedBackgrounds,
      stylesLimit,
    });
    return [];
  }

  const allPossiblePromptObjects = [];
  const uniquePromptStrings = new Set();

  // 1. Generate all unique combinations of (clothing, background, compatible_template)
  for (const clothing of selectedClothing) {
    for (const background of selectedBackgrounds) {
      const suitableTemplates = PROMPT_TEMPLATES.filter(
        (template) =>
          (template.compatibleClothingThemes.includes(clothing.theme) ||
            template.compatibleClothingThemes.includes("Any")) &&
          (template.compatibleBackgroundThemes.includes(background.theme) ||
            template.compatibleBackgroundThemes.includes("Any"))
      );

      for (const template of suitableTemplates) {
        const promptString = template.promptFunction(
          userCharacterInputs,
          clothing.name,
          background.name
        );
        if (!uniquePromptStrings.has(promptString)) {
          allPossiblePromptObjects.push({
            prompt: promptString,
            clothingName: clothing.name,
            clothingTheme: clothing.theme,
            backgroundName: background.name,
            backgroundTheme: background.theme,
            templateId: template.id,
            // Add a score for sorting/selection if needed in the future
            // score: calculateScore(clothing.theme, background.theme, template),
          });
          uniquePromptStrings.add(promptString);
        }
      }
    }
  }

  // If no unique prompts were generated (e.g. no matching templates at all)
  if (allPossiblePromptObjects.length === 0) {
    // Try with the most generic template if available
    const genericTemplate = PROMPT_TEMPLATES.find(
      (t) => t.id === "generic_any_any_01"
    );
    if (
      genericTemplate &&
      selectedClothing.length > 0 &&
      selectedBackgrounds.length > 0
    ) {
      const C = selectedClothing[0];
      const B = selectedBackgrounds[0];
      const promptString = genericTemplate.promptFunction(
        userCharacterInputs,
        C.name,
        B.name
      );
      if (!uniquePromptStrings.has(promptString)) {
        allPossiblePromptObjects.push({
          prompt: promptString,
          clothingName: C.name,
          clothingTheme: C.theme,
          backgroundName: B.name,
          backgroundTheme: B.theme,
          templateId: genericTemplate.id,
        });
        uniquePromptStrings.add(promptString);
      }
    }
    if (allPossiblePromptObjects.length === 0) return []; // Still nothing, return empty
  }

  // 2. Select prompts up to stylesLimit, prioritizing diversity.
  let finalPrompts = [];

  // Shuffle to get random assortment if we have more than stylesLimit
  if (allPossiblePromptObjects.length > stylesLimit) {
    // Simple shuffle
    const shuffled = [...allPossiblePromptObjects].sort(
      () => 0.5 - Math.random()
    );
    finalPrompts = shuffled.slice(0, stylesLimit).map((p) => p.prompt);
  } else {
    finalPrompts = allPossiblePromptObjects.map((p) => p.prompt);
  }

  // If we have fewer prompts than stylesLimit and want to fill it up
  // (e.g. by reusing clothing/backgrounds with different templates, or cycling)
  // This part can be complex. For now, we return what we have up to stylesLimit.
  // If allPossiblePromptObjects.length < stylesLimit, we might want to duplicate or generate variants.
  // Example: if stylesLimit is 10 and we only have 5 unique prompts, we return 5.
  // If requirements are to *always* return stylesLimit (by duplication if needed):
  if (finalPrompts.length < stylesLimit && finalPrompts.length > 0) {
    const needed = stylesLimit - finalPrompts.length;
    for (let i = 0; i < needed; i++) {
      finalPrompts.push(finalPrompts[i % finalPrompts.length]); // Cycle through existing prompts
    }
  }

  return finalPrompts;
}
