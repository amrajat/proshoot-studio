const hairStyle = (character) => {
  if (
    !character.hairLength ||
    character.hairLength === "Bald" ||
    character.hairLength === "Hisab"
  ) {
    return "";
  }
  return `, ${character.hairLength} ${character.hairColor} ${character.hairType}`;
};

const glasses = (character) => {
  return character.glasses ? ", wearing glasses" : "";
};

export const PROMPT_TEMPLATES = [
  // START OF PROMPTBASE
  {
    id: "studio_01",
    name: "Studio Solid Colors",
    description: "Clean, professional studio shot on a solid background.",

    compatibleBackgroundThemes: ["Studio"],
    promptFunction: (character, clothingName, backgroundName) => {
      return `a photorealistic studio portrait of ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing ${clothingName}, neutral and professional tone, suitable for various business uses, most popular on Shutterstock, photorealistic, captured using Canon 7D mirrorless camera, 50mm lens, ISO 250, half body portrait, RAW format, on a plain solid ${backgroundName} background, realistic skin textures with minimal makeup, confident pose, soft lighting with soft reflections and shadows, centered composition`;
    },
  },
  {
    id: "studio_02",
    name: "Studio Casual",
    description: "Clean, professional studio shot on a solid background.",

    compatibleBackgroundThemes: ["Studio"],
    promptFunction: (character, clothingName, backgroundName) => {
      return `casual studio portrait of a confident ${character.trigger_word} ${
        character.gender
      } with a natural smile${hairStyle(character)}${glasses(
        character
      )}, wearing ${clothingName}, perfect stock photo for advertising, captured on a plain solid colored ${backgroundName} background. The half-body shot uses soft, complementary colors with natural skin texture. Taken with a Canon 5D Mark IV, RAW format, 70mm lens, ISO 200, f/11 aperture, and 1/125 sec shutter speed for sharp, high-contrast results. The model's skin is natural to maintain a realistic texture with no makeup. front view, with rich shadows and highlights, creating a natural and professional stock photo style.`;
    },
  },
  {
    id: "creative_01",
    name: "Creative Professionals",
    description: "Approachable professional in a modern office setting.",

    compatibleBackgroundThemes: ["Creative"],
    promptFunction: (character, clothingName, backgroundName) => {
      return `a realistic portrait of a cheerful ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing ${clothingName}, smiling warmly with a confident expression; soft natural lighting highlights face, with a background featuring ${backgroundName}; professional and approachable atmosphere, ideal for business or creative work settings. Use a high-end camera like the Hasselblad H6D-400c or Canon EOS R5`;
    },
  },
  {
    id: "office_01",
    name: "Office",
    description: "Professional office portrait.",

    compatibleBackgroundThemes: ["Office", "Creative"],
    promptFunction: (character, clothingName, backgroundName) => {
      return `professional corporate portrait photo of ${
        character.trigger_word
      } ${character.gender}${hairStyle(character)}${glasses(
        character
      )}, captured in a office with cabinets and windows in the background, wearing ${clothingName}, half body portrait, captured on a sony alpha, with a 50mm zoom lens, professional photo retouching, with natural light, photorealistic quality with RAW format, front view centered composition, confident pose and a bright smile`;
    },
  },
  {
    id: "monochrome_01",
    name: "Monochrome",
    description: "Professional monochrome portrait.",

    compatibleBackgroundThemes: ["Monochrome"],
    promptFunction: (character, clothingName, backgroundName) => {
      return `Expertly shot studio portrait of an attractive professional ${
        character.trigger_word
      } ${character.gender}${hairStyle(character)}${glasses(
        character
      )}, model wearing a stylish trendy monochromatic ${clothingName} outfit, front view half body shot, neutral facial expression, on a plain solid ${backgroundName} background, captured on a canon eos r6, 85mm f/1.4, 24k resolution, RAW format, professional studio lighting`;
    },
  },
  // END OF PROMPTBASE
  // START OFFICE PROMPTS
  {
    id: "office_02",
    name: "High-Rise Office",
    description: "Sleek portrait in a high-rise office with a city skyline.",

    compatibleBackgroundThemes: ["Office"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a sleek and professional portrait of ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing ${clothingName}, corporate and polished tone, ideal for LinkedIn and executive profiles. Standing in a ${backgroundName} in the background. Captured using a Canon EOS R5, 70mm lens, ISO 250, with bright natural lighting and balanced shadows, exuding professionalism. Realistic skin textures with minimal makeup, a composed expression, and clean, centered composition ensure a polished finish.`,
  },
  {
    id: "office_03",
    name: "Corporate Office",
    description:
      "Professional portrait in a corporate office with large windows.",

    compatibleBackgroundThemes: ["Office"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a sleek professional portrait of ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing ${clothingName}, global and business-oriented tone, perfect for high-level corporate branding. Photorealistically captured in a ${backgroundName} in the background. Shot with a Canon EOS R3, 50mm lens, ISO 320, with soft natural lighting. Realistic skin textures, minimal makeup, and a composed expression emphasize authority and clarity.`,
  },
  {
    id: "office_04",
    name: "Modern Office",
    description: "Cinematic portrait in a modern office with glass windows.",

    compatibleBackgroundThemes: ["Office"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a cinematic-style studio portrait of ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing ${clothingName}, vibrant yet professional tone, suitable for LinkedIn and business profiles. Captured with a Canon 7D mirrorless camera, 85mm lens, ISO 400, and a diffused spotlight setup. Half-body portrait with soft bokeh from a ${backgroundName} in the background, exuding confidence. Realistic skin textures enhanced subtly with warm tones, natural makeup, and sharp details. Crisp lighting emphasizes facial features with dynamic shadow play, centered composition.`,
  },
  {
    id: "office_05",
    name: "Office With Plants",
    description:
      "Approachable portrait in an office with floor-to-ceiling windows and plants.",

    compatibleBackgroundThemes: ["Office"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a sleek and professional portrait of ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing ${clothingName}, corporate and approachable tone, perfect for LinkedIn profiles. Standing in a ${backgroundName} in the background. Captured using a Canon EOS R5, 85mm lens, ISO 320, with soft natural lighting, exuding confidence and professionalism. Realistic skin textures, minimal makeup, and a poised expression. The composition balances subject focus with a clean, modern office ambiance.`,
  },
  {
    id: "office_06",
    name: "Minimalist Office",
    description: "Refined portrait in a minimalistic modern office interior.",

    compatibleBackgroundThemes: ["Office"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a refined professional portrait of ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing ${clothingName}, corporate and neutral tone, perfect for business branding. Standing in a ${backgroundName} in the background. Captured with a Canon EOS R6, 50mm lens, ISO 200, using soft studio lighting, radiating confidence. Realistic skin textures with soft highlights, minimal makeup, and a confident pose. The composition balances subject focus with a professional office ambiance.`,
  },
  // END OFFICE PROMPTS
  // START CITYSCAPE PROMPTS
  {
    id: "cityscape_01",
    name: "Cityscape",
    description: "Professional cityscape portrait.",

    compatibleBackgroundThemes: ["Cityscape"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a vibrant professional portrait of ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing ${clothingName}, neutral yet approachable tone, ideal for business branding and LinkedIn profiles. Standing in a ${backgroundName} in the background. Captured using a Canon R5, 70mm lens, ISO 200, with natural lighting during golden hour. Realistic skin textures with soft highlights, minimal makeup, and a smile conveying approachability. The composition balances subject focus with soft urban ambiance, centered frame.`,
  },
  // END CITYSCAPE PROMPTS
  // START OF NATURE PROMPTS
  {
    id: "nature_01",
    name: "Sunlit Park",
    description:
      "Professional portrait in a sunlit park with blurred greenery.",

    compatibleBackgroundThemes: ["Nature"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a photorealistic professional portrait of ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing ${clothingName}, natural and approachable tone, suitable for corporate profiles and linkedin. captured in a ${backgroundName} in the background. captured using a canon eos r6, 50mm lens, iso 200, with natural sunlight and soft fill lighting, exuding confidence and warmth. realistic skin textures, minimal makeup, and a relaxed yet professional pose. the composition emphasizes natural beauty with a clean, centered focus.`,
  },
  {
    id: "nature_02",
    name: "Tulip Field",
    description: "Vibrant headshot in a tulip field with colorful flowers.",

    compatibleBackgroundThemes: ["Nature"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a vibrant and professional headshot of ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing ${clothingName}, colorful yet polished tone, perfect for creative business profiles. standing in a ${backgroundName} in the background. captured with a canon eos r5, 70mm lens, iso 320, using soft natural lighting, balancing professionalism and individuality. realistic skin textures with soft highlights, minimal makeup, and a warm smile. the composition combines natural beauty with corporate elegance.`,
  },
  {
    id: "nature_03",
    name: "Vibrant Garden",
    description: "Serene portrait in a vibrant garden with lush greenery.",

    compatibleBackgroundThemes: ["Nature"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a serene professional portrait of ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing ${clothingName}, natural and polished tone, ideal for business branding. photorealistically captured in a vibrant ${backgroundName} in the background. shot with a canon eos r3, 50mm lens, iso 250, with diffused sunlight for soft lighting, radiating confidence. realistic skin textures, minimal makeup, and a composed, friendly expression. centered composition highlights professionalism in a natural setting.`,
  },
  {
    id: "nature_04",
    name: "Dandelion Field",
    description: "Warm portrait in a grass field full of dandelions.",

    compatibleBackgroundThemes: ["Nature"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a warm and professional portrait of ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing ${clothingName}, approachable and natural tone, suitable for business and personal branding. standing in a ${backgroundName} in the background. captured using a canon 7d, 35mm lens, iso 200, with natural lighting on a sunny day, exuding professionalism and warmth. realistic skin textures with minimal makeup, a slight smile, and a natural pose. the composition is vibrant and detailed, emphasizing clarity and authenticity.`,
  },
  {
    id: "nature_05",
    name: "Wooded Area",
    description:
      "Calm and professional headshot in a wooded area with vibrant foliage.",

    compatibleBackgroundThemes: ["Nature"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a calm and professional headshot of ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing ${clothingName}, natural yet polished tone, perfect for eco-conscious or outdoor industry profiles. standing in a ${backgroundName} in the background. captured using a sony alpha 7 iv, 50mm lens, iso 320, with soft, natural lighting and intricate details, conveying confidence. realistic skin textures with minimal makeup, a composed expression, and centered framing enhance professionalism.`,
  },
  {
    id: "nature_06",
    name: "Natural Landscape",
    description:
      "Serene professional portrait in a natural landscape with gentle sunlight.",

    compatibleBackgroundThemes: ["Nature"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a serene professional portrait of ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing ${clothingName}, calm yet confident tone, suitable for eco-conscious or creative professionals. standing in front of a ${backgroundName}. captured using a sony alpha 7 iv, 50mm lens, iso 100, during morning light for soft, natural illumination, blending professionalism with individuality. realistic skin textures enhanced by soft highlights, minimal makeup, and a calm expression. the composition emphasizes harmony between the subject and nature, perfectly centered.`,
  },
  {
    id: "nature_07",
    name: "Lush Wildflower Field",
    description:
      "Captivating portrait in a lush green field with colorful wildflowers.",

    compatibleBackgroundThemes: ["Nature"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a captivating, photorealistic image of ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing ${clothingName}, vibrant and nostalgic tone, perfect for creative business branding. posing confidently in a ${backgroundName} in the background. captured in cinematic quality with a sony alpha 7r iv, 50mm lens, iso 200, exuding a timeless blend of professionalism and charm. realistic skin textures, warm lighting, and a centered composition create an impactful and engaging visual tone.`,
  },
  //END OF NATURE PROMPTS
  // START MEDICAL PROMPTS
  {
    id: "medical_01",
    name: "Medical",
    description: "Professional medical portrait.",

    compatibleBackgroundThemes: ["Medical"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a warm and professional portrait of ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing ${clothingName}, intellectual and polished tone, ideal for consulting and academic profiles. Standing in front of a ${backgroundName}. Captured with a Canon EOS R5, 50mm lens, ISO 320, with soft, warm lighting, exuding professionalism and depth. Realistic skin textures with subtle highlights, minimal makeup, and a calm expression. The composition balances focus on the subject with a knowledge-rich ambiance.`,
  },
  // END MEDICAL PROMPTS
  // START HOME OFFICE PROMPTS
  {
    id: "home_office_01",
    name: "Home Office",
    description: "Professional home office portrait.",

    compatibleBackgroundThemes: ["Home Office", "Academic"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a warm and professional portrait of ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing ${clothingName}, intellectual and polished tone, ideal for consulting and academic profiles. Standing in front of a ${backgroundName}. Captured with a Canon EOS R5, 50mm lens, ISO 320, with soft, warm lighting, exuding professionalism and depth. Realistic skin textures with subtle highlights, minimal makeup, and a calm expression. The composition balances focus on the subject with a knowledge-rich ambiance.`,
  },
  // END HOME OFFICE PROMPTS

  // START CREATIVE PROMPTS
  {
    id: "creative_02",
    name: "Creative",
    description: "Professional creative portrait.",

    compatibleBackgroundThemes: ["Creative"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a warm and professional portrait of ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing ${clothingName}, intellectual and polished tone, ideal for consulting and academic profiles. Standing in front of a ${backgroundName}. Captured with a Canon EOS R5, 50mm lens, ISO 320, with soft, warm lighting, exuding professionalism and depth. Realistic skin textures with subtle highlights, minimal makeup, and a calm expression. The composition balances focus on the subject with a knowledge-rich ambiance.`,
  },
  // END CREATIVE PROMPTS
  // TODO: generic prompts are being used even without fallback
  {
    id: "generic_any_any_01", // Fallback generic template
    name: "Generic Professional Headshot",
    description: "A versatile fallback prompt.",

    compatibleBackgroundThemes: ["Any"],
    promptFunction: (character, clothingName, backgroundName) => {
      return `generic prompt, ${character.trigger_word} ${
        character.ethnicity
      } ${character.gender} in ${character.age}, with ${hairStyle(
        character
      )}${glasses(
        character
      )}. Subject is wearing ${clothingName}. Background is ${backgroundName}. Photorealistic, high quality, well-lit.`;
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

export function generatePrompts(userCharacterInputs, stylePairs, stylesLimit) {
  if (!userCharacterInputs || !stylePairs?.length || !stylesLimit) {
    console.error("generatePrompts: Invalid inputs", {
      userCharacterInputs,
      stylePairs,
      stylesLimit,
    });
    return [];
  }

  // Group style pairs by background theme for balanced distribution
  const pairsByTheme = {};
  stylePairs.forEach((pair, index) => {
    const { clothing, background } = pair;
    if (!clothing || !background) return;

    const theme = background.theme;
    if (!pairsByTheme[theme]) {
      pairsByTheme[theme] = [];
    }
    pairsByTheme[theme].push({ pair, originalIndex: index });
  });

  const themes = Object.keys(pairsByTheme);
  const numThemes = themes.length;

  if (numThemes === 0) {
    console.warn("No valid style pairs found");
    return [];
  }

  // Calculate balanced distribution
  const basePromptsPerTheme = Math.floor(stylesLimit / numThemes);
  const extraPrompts = stylesLimit % numThemes;

  console.log(`Distribution: ${numThemes} themes, ${stylesLimit} prompts`);
  console.log(`Base per theme: ${basePromptsPerTheme}, Extra: ${extraPrompts}`);

  const finalPrompts = [];
  const uniquePromptStrings = new Set();

  // Process each theme
  themes.forEach((theme, themeIndex) => {
    const themePairs = pairsByTheme[theme];
    const promptsForTheme =
      basePromptsPerTheme + (themeIndex < extraPrompts ? 1 : 0);

    console.log(`Theme ${themeIndex} (${theme}): ${promptsForTheme} prompts`);

    if (promptsForTheme === 0) return;

    // Find templates for this theme
    const themeTemplates = PROMPT_TEMPLATES.filter(
      (template) =>
        (template.compatibleBackgroundThemes.includes(theme) ||
          template.compatibleBackgroundThemes.includes("Any")) &&
        !template.id.startsWith("generic_any_any")
    );

    console.log(`Found ${themeTemplates.length} templates for ${theme}`);

    if (themeTemplates.length === 0) {
      console.warn(`No templates found for theme: ${theme}`);
      return;
    }

    // Generate prompts for this theme - cycle through templates as needed
    for (let i = 0; i < promptsForTheme; i++) {
      const pairData = themePairs[i % themePairs.length];
      const { clothing, background } = pairData.pair;
      const template = themeTemplates[i % themeTemplates.length];

      const promptString = template.promptFunction(
        userCharacterInputs,
        clothing.name,
        background.name
      );

      // Always add the prompt - we want to cycle through templates even if they repeat
      finalPrompts.push({
        prompt: promptString,
        clothingName: clothing.name,
        clothingTheme: clothing.theme,
        backgroundName: background.name,
        backgroundTheme: background.theme,
        templateId: template.id,
      });
    }
    console.log(`Generated ${promptsForTheme} prompts for ${theme}`);
  });

  console.log(`Total prompts generated: ${finalPrompts.length}`);
  // No generic fallback - we cycle through available templates

  return finalPrompts.slice(0, stylesLimit);
}
