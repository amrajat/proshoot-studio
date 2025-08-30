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

// TODO: MAKE SURE WE USE GENDER MAN, WOMAN OR PERSON IF NON-BINARY USED

export const PROMPT_TEMPLATES = [
  // START OF PROMPTBASE
  {
    id: "studio_01",
    name: "Studio Colors",
    description: "Clean, professional studio shot on professional backgrounds.",

    compatibleBackgroundThemes: ["Studio"],
    promptFunction: (character, clothingName, backgroundName) => {
      return `a photorealistic studio portrait of a ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing a ${clothingName}, neutral and professional tone, suitable for various business uses, most popular on Shutterstock, photorealistic, captured using Canon 7D mirrorless camera, 50mm lens, ISO 250, half body portrait, RAW format, on a ${backgroundName} background, realistic skin textures with minimal makeup, confident pose, soft lighting with soft reflections and shadows, centered composition`;
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
      )}, wearing a ${clothingName}, smiling warmly with a confident expression; soft natural lighting highlights face, with a background featuring ${backgroundName} in the background; professional and approachable atmosphere, ideal for business or creative work settings. Use a high-end camera like the Hasselblad H6D-400c or Canon EOS R5`;
    },
  },
  {
    id: "creative_02",
    name: "Artistic Professional",
    description: "Creative professional portrait in artistic environments.",

    compatibleBackgroundThemes: ["Creative"],
    promptFunction: (character, clothingName, backgroundName) => {
      return `Creative professional portrait of a ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing a ${clothingName}, positioned in a ${backgroundName} in the background. Shot with Canon EOS R6, 50mm f/1.4 lens, ISO 160, natural lighting with creative shadows and depth. Artistic yet professional composition with confident, inspiring expression, perfect for designers, artists, architects, and creative entrepreneurs. High-quality headshot with creative energy and professional polish, suitable for portfolios and creative industry branding.`;
    },
  },
  {
    id: "office_01",
    name: "Office Headshots",
    description: "Professional office portraits.",

    compatibleBackgroundThemes: ["Office"],
    promptFunction: (character, clothingName, backgroundName) => {
      return `professional corporate portrait photo of ${
        character.trigger_word
      } ${character.gender}${hairStyle(character)}${glasses(
        character
      )}, captured in a ${backgroundName} in the background, wearing a ${clothingName}, half body portrait, captured on a sony alpha, with a 50mm zoom lens, professional photo retouching, with natural light, photorealistic quality with RAW format, front view centered composition, confident pose and a bright smile`;
    },
  },
  {
    id: "office_02",
    name: "Office Headshots 2",
    description: "Professional office portraits.",

    compatibleBackgroundThemes: ["Office"],
    promptFunction: (character, clothingName, backgroundName) => {
      return `Professional portrait photography of a ${
        character.trigger_word
      } ${character.gender}${hairStyle(character)}${glasses(
        character
      )}, standing in a ${backgroundName} in the background. Attire is a ${clothingName}, with a confident smile and approachable demeanor. Captured using an 85mm f/1.4 lens at f/2.0, ISO 100, and 1/200 shutter speed on a full-frame DSLR, with single-point autofocus locked on the eyes. Lighting is natural daylight softened through a window, enhanced with a reflector for balanced fill. The crisp, noise-free clarity and smooth bokeh radiate professionalism, competence, and trustworthiness—perfect for business cards, company profiles, and executive introductions.`;
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
      )}, model wearing a stylish trendy monochromatic ${backgroundName} outfit, front view half body shot, neutral facial expression, on a plain solid ${backgroundName} background, captured on a canon eos r6, 85mm f/1.4, 24k resolution, RAW format, professional studio lighting`;
    },
  },
  // END OF PROMPTBASE
  // START OFFICE PROMPTS
  {
    id: "office_03",
    name: "High-Rise Office",
    description: "Sleek portrait in a high-rise office with a city skyline.",

    compatibleBackgroundThemes: ["Office"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a sleek and professional portrait of a ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing a ${clothingName}, corporate and polished tone, ideal for LinkedIn and executive profiles. Standing in a ${backgroundName} in the background. Captured using a Canon EOS R5, 70mm lens, ISO 250, with bright natural lighting and balanced shadows, exuding professionalism. Realistic skin textures with minimal makeup, a composed expression, and clean, centered composition ensure a polished finish.`,
  },
  {
    id: "office_04",
    name: "Corporate Office",
    description:
      "Professional portrait in a corporate office with large windows.",

    compatibleBackgroundThemes: ["Office"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a sleek professional portrait of a ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing a ${clothingName}, global and business-oriented tone, perfect for high-level corporate branding. Photorealistically captured in a ${backgroundName} in the background. Shot with a Canon EOS R3, 50mm lens, ISO 320, with soft natural lighting. Realistic skin textures, minimal makeup, and a composed expression emphasize authority and clarity.`,
  },
  {
    id: "office_05",
    name: "Modern Office",
    description: "Cinematic portrait in a modern office with glass windows.",

    compatibleBackgroundThemes: ["Office"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a cinematic-style studio portrait of a ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing a ${clothingName}, vibrant yet professional tone, suitable for LinkedIn and business profiles. Captured with a Canon 7D mirrorless camera, 85mm lens, ISO 400, and a diffused spotlight setup. Half-body portrait with soft bokeh from a ${backgroundName} in the background, exuding confidence. Realistic skin textures enhanced subtly with warm tones, natural makeup, and sharp details. Crisp lighting emphasizes facial features with dynamic shadow play, centered composition.`,
  },
  {
    id: "office_06",
    name: "Office With Plants",
    description:
      "Approachable portrait in an office with floor-to-ceiling windows and plants.",

    compatibleBackgroundThemes: ["Office"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a sleek and professional portrait of a ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing a ${clothingName}, corporate and approachable tone, perfect for LinkedIn profiles. Standing in a ${backgroundName} in the background. Captured using a Canon EOS R5, 85mm lens, ISO 320, with soft natural lighting, exuding confidence and professionalism. Realistic skin textures, minimal makeup, and a poised expression. The composition balances subject focus with a clean, modern office ambiance.`,
  },
  {
    id: "office_07",
    name: "Minimalist Office",
    description: "Refined portrait in a minimalistic modern office interior.",

    compatibleBackgroundThemes: ["Office"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a refined professional portrait of a ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing a ${clothingName}, corporate and neutral tone, perfect for business branding. Standing in a ${backgroundName} in the background. Captured with a Canon EOS R6, 50mm lens, ISO 200, using soft studio lighting, radiating confidence. Realistic skin textures with soft highlights, minimal makeup, and a confident pose. The composition balances subject focus with a professional office ambiance.`,
  },
  // END OFFICE PROMPTS
  // START CITYSCAPE PROMPTS
  {
    id: "cityscape_01",
    name: "Cityscape",
    description: "Urban professional portrait with city architecture.",

    compatibleBackgroundThemes: ["Cityscape"],
    promptFunction: (character, clothingName, backgroundName) =>
      `Urban professional portrait of a ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing a ${clothingName}, positioned against a ${backgroundName} in the background. Shot with Canon EOS R5, 85mm f/1.8 lens, ISO 200, during golden hour for warm natural lighting. Professional composition with beautiful bokeh, capturing the dynamic energy of the city while maintaining focus on the subject. Perfect for LinkedIn profiles, business networking, and metropolitan professional branding with urban sophistication.`,
  },
  {
    id: "cityscape_02",
    name: "Metropolitan Executive",
    description: "Sophisticated city executive portrait for Flux-1.dev.",

    compatibleBackgroundThemes: ["Cityscape"],
    promptFunction: (character, clothingName, backgroundName) =>
      `Metropolitan executive portrait of a ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing a ${clothingName}, captured with a ${backgroundName} in the background. Shot with Sony Alpha 7R IV, 70mm lens, f/2.8, ISO 160, professional outdoor lighting with reflector. Executive presence with sophisticated urban atmosphere, leveraging architectural elements and city textures. Sharp focus with premium quality, ideal for C-suite profiles, corporate leadership, and high-end business communications in urban settings.`,
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
      `a photorealistic professional portrait of a ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing a ${clothingName}, natural and approachable tone, suitable for corporate profiles and linkedin. captured in a ${backgroundName} in the background. captured using a canon eos r6, 50mm lens, iso 200, with natural sunlight and soft fill lighting, exuding confidence and warmth. realistic skin textures, minimal makeup, and a relaxed yet professional pose. the composition emphasizes natural beauty with a clean, centered focus.`,
  },

  {
    id: "nature_02",
    name: "Lush Wildflower Field",
    description:
      "Captivating portrait in a lush green field with colorful wildflowers.",

    compatibleBackgroundThemes: ["Nature"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a captivating, photorealistic image of a ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing a ${clothingName}, vibrant and nostalgic tone, perfect for creative business branding. posing confidently in a ${backgroundName} in the background. captured in cinematic quality with a sony alpha 7r iv, 50mm lens, iso 200, exuding a timeless blend of professionalism and charm. realistic skin textures, warm lighting, and a centered composition create an impactful and engaging visual tone.`,
  },
  {
    id: "nature_03",
    name: "Vibrant Garden",
    description: "Serene portrait in a vibrant garden with lush greenery.",

    compatibleBackgroundThemes: ["Nature"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a serene professional portrait of a ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing a ${clothingName}, natural and polished tone, ideal for business branding. photorealistically captured in a vibrant ${backgroundName} in the background. shot with a canon eos r3, 50mm lens, iso 250, with diffused sunlight for soft lighting, radiating confidence. realistic skin textures, minimal makeup, and a composed, friendly expression. centered composition highlights professionalism in a natural setting.`,
  },
  {
    id: "nature_04",
    name: "Dandelion Field",
    description: "Warm portrait in a grass field full of dandelions.",

    compatibleBackgroundThemes: ["Nature"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a warm and professional portrait of a ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing a ${clothingName}, approachable and natural tone, suitable for business and personal branding. standing in a ${backgroundName} in the background. captured using a canon 7d, 35mm lens, iso 200, with natural lighting on a sunny day, exuding professionalism and warmth. realistic skin textures with minimal makeup, a slight smile, and a natural pose. the composition is vibrant and detailed, emphasizing clarity and authenticity.`,
  },
  {
    id: "nature_05",
    name: "Wooded Area",
    description:
      "Calm and professional headshot in a wooded area with vibrant foliage.",

    compatibleBackgroundThemes: ["Nature"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a calm and professional headshot of a ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing a ${clothingName}, natural yet polished tone, perfect for eco-conscious or outdoor industry profiles. standing in a ${backgroundName} in the background. captured using a sony alpha 7 iv, 50mm lens, iso 320, with soft, natural lighting and intricate details, conveying confidence. realistic skin textures with minimal makeup, a composed expression, and centered framing enhance professionalism.`,
  },
  {
    id: "nature_06",
    name: "Natural Landscape",
    description:
      "Serene professional portrait in a natural landscape with gentle sunlight.",

    compatibleBackgroundThemes: ["Nature"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a serene professional portrait of a ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing a ${clothingName}, calm yet confident tone, suitable for eco-conscious or creative professionals. standing in front of a ${backgroundName} in the background. captured using a sony alpha 7 iv, 50mm lens, iso 100, during morning light for soft, natural illumination, blending professionalism with individuality. realistic skin textures enhanced by soft highlights, minimal makeup, and a calm expression. the composition emphasizes harmony between the subject and nature, perfectly centered.`,
  },
  //END OF NATURE PROMPTS
  // START MEDICAL PROMPTS
  {
    id: "medical_01",
    name: "Medical",
    description: "Healthcare professional portrait in medical environments.",

    compatibleBackgroundThemes: ["Medical"],
    promptFunction: (character, clothingName, backgroundName) =>
      `Healthcare professional portrait of a ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing a ${clothingName}, positioned in a ${backgroundName} in the background. Shot with Canon EOS R6, 85mm f/1.8 lens, ISO 200, soft natural lighting creating trustworthy and professional atmosphere. Clean medical headshot with compassionate yet authoritative expression, conveying medical expertise and patient care. Perfect for medical practice websites, hospital directories, and healthcare professional profiles with clinical credibility.`,
  },
  {
    id: "medical_02",
    name: "Clinical Specialist",
    description: "Authoritative medical specialist portrait for Flux-1.dev.",

    compatibleBackgroundThemes: ["Medical"],
    promptFunction: (character, clothingName, backgroundName) =>
      `Clinical specialist portrait of a ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing a ${clothingName}, captured against a ${backgroundName} in the background. Shot with Sony Alpha 7R IV, 70mm lens, f/2.0, ISO 160, professional medical facility lighting. Authoritative yet approachable medical professional, sharp focus with clean composition. Ideal for specialist consultations, medical conferences, and clinical leadership profiles.`,
  },
  // END MEDICAL PROMPTS
  // START HOME OFFICE PROMPTS
  {
    id: "home_office_01",
    name: "Home Office",
    description: "Professional home office portrait.",

    compatibleBackgroundThemes: ["Home Office", "Academic"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a warm and professional portrait of a ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing a ${clothingName}, intellectual and polished tone, ideal for consulting and academic profiles. Standing in front of a ${backgroundName} in the background. Captured with a Canon EOS R5, 50mm lens, ISO 320, with soft, warm lighting, exuding professionalism and depth. Realistic skin textures with subtle highlights, minimal makeup, and a calm expression. The composition balances focus on the subject with a knowledge-rich ambiance.`,
  },
  {
    id: "home_office_02",
    name: "Work From Home Executive",
    description: "Sophisticated home office executive portrait for Flux-1.dev.",

    compatibleBackgroundThemes: ["Home Office"],
    promptFunction: (character, clothingName, backgroundName) =>
      `Work-from-home executive portrait of a ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing a ${clothingName}, captured against a ${backgroundName} in the background. Shot with Sony Alpha 7R IV, 85mm lens, f/1.8, ISO 160, professional home studio lighting setup. Executive presence with home office sophistication, sharp focus and premium quality. Ideal for senior remote professionals, virtual leadership, and modern executive communications.`,
  },
  // END HOME OFFICE PROMPTS

  // START ACADEMIC PROMPTS
  {
    id: "academic_01",
    name: "University Library",
    description: "Professional academic portrait in scholarly setting.",

    compatibleBackgroundThemes: ["Academic"],
    promptFunction: (character, clothingName, backgroundName) =>
      `Professional academic portrait of a ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing a ${clothingName}, intellectual and scholarly atmosphere. Positioned in a ${backgroundName} in the background, captured with a Canon EOS R5, 85mm f/1.8 lens, ISO 200, natural window lighting creating soft shadows. Sharp focus on subject with shallow depth of field, warm academic ambiance, conveying expertise and approachability. Professional headshot composition with clean background blur, suitable for university profiles and academic publications.`,
  },
  {
    id: "academic_02",
    name: "Campus Setting",
    description: "Distinguished academic portrait with institutional backdrop.",

    compatibleBackgroundThemes: ["Academic"],
    promptFunction: (character, clothingName, backgroundName) =>
      `Distinguished academic headshot of a ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing a ${clothingName}, positioned against a ${backgroundName} in the background. Shot with Sony Alpha 7R IV, 70mm lens, f/2.8, ISO 160, during golden hour for warm natural lighting. Professional composition with subject in sharp focus, background softly blurred, conveying academic authority and wisdom. Ideal for faculty directories, conference presentations, and scholarly publications.`,
  },
  // END ACADEMIC PROMPTS

  // START SPECIALIZED PROMPTS
  {
    id: "specialized_01",
    name: "Conference Speaker",
    description: "Professional portrait for public speaking and presentations.",

    compatibleBackgroundThemes: ["Specialized"],
    promptFunction: (character, clothingName, backgroundName) =>
      `Professional conference speaker portrait of a ${
        character.trigger_word
      } ${character.gender}${hairStyle(character)}${glasses(
        character
      )}, wearing a ${clothingName}, positioned in a ${backgroundName} in the background. Captured with Canon EOS R6, 50mm f/1.4 lens, ISO 100, professional studio lighting with key light and fill. Sharp, high-resolution image with confident expression, suitable for speaker introductions, event marketing, and professional presentations. Clean composition with excellent contrast and professional polish.`,
  },
  {
    id: "specialized_02",
    name: "Industry Professional",
    description: "Specialized professional portrait for specific industries.",

    compatibleBackgroundThemes: ["Specialized"],
    promptFunction: (character, clothingName, backgroundName) =>
      `Industry-specific professional portrait of a ${character.trigger_word} ${
        character.gender
      }${hairStyle(character)}${glasses(
        character
      )}, wearing a ${clothingName}, captured in a ${backgroundName} in the background. Shot with Nikon Z9, 85mm f/1.8 lens, ISO 200, balanced natural and artificial lighting. Professional headshot with industry-appropriate styling, sharp focus on subject, background contextually relevant but not distracting. Perfect for industry publications, professional certifications, and specialized career profiles.`,
  },
  // END SPECIALIZED PROMPTS
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
    const themeTemplates = PROMPT_TEMPLATES.filter((template) =>
      template.compatibleBackgroundThemes.includes(theme)
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
