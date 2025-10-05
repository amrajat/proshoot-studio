import { NextResponse } from "next/server";
import crypto from 'crypto';
import { env } from '@/lib/env';

// Verify API key for security
const verifyApiKey = (apiKey) => {
  if (!apiKey || !env.WEBHOOK_SECRET) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(apiKey),
    Buffer.from(env.WEBHOOK_SECRET)
  );
};

const createErrorResponse = (message, status = 400) => {
  return NextResponse.json({ error: message }, { status });
};

const createSuccessResponse = (data) => {
  return NextResponse.json({ success: true, ...data });
};

const hairStyle = (character) => {
  // Return empty string if no hair length or if wearing hijab
  if (!character.hair_length || character.hair_length.toLowerCase() === "hijab") {
    return "";
  }
  
  // Handle bald case
  if (character.hair_length.toLowerCase() === "bald") {
    return " with a bald head";
  }
  
  // Build hair description with available attributes
  const hairParts = [];
  
  // Always include hair length (it's required)
  hairParts.push(character.hair_length);
  
  // Add hair color if available
  if (character.hair_color && character.hair_color.trim()) {
    hairParts.push(character.hair_color);
  }
  
  // Add hair type if available
  if (character.hair_type && character.hair_type.trim()) {
    hairParts.push(character.hair_type);
  }
  
  // Return formatted hair description
  return ` with ${hairParts.join(" ")} hair`;
};

const glasses = (character) => {
  // Handle boolean values and string representations
  if (character.glasses === true || character.glasses === "true") {
    return ", wearing glasses";
  }
  return "";
};

// Helper function to normalize gender for AI image generation
const normalizeGender = (gender) => {
  if (gender === "man" || gender === "woman") {
    return gender;
  }
  // Use 'person' for non-binary or any other gender value
  return "person";
};

const PROMPT_TEMPLATES = [
  {
    id: "academic_01",
    name: "Academic Headshots",
    compatibleBackgroundThemes: ["Academic"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a sleek and professional headshot of ohwx, ${character.ethnicity} ${
        normalizeGender(character.gender)
      }${hairStyle(character)}${glasses(character)}. The subject wears a ${clothingName}, positioned in a ${backgroundName}. Captured with Canon EOS R5, 85mm lens, ISO 200, even professional lighting illuminates the subject naturally. Subject is in sharp focus with a clean depth of field, background softly blurred for a scholarly yet approachable atmosphere. Expression conveys expertise, credibility, and warmth. Centered composition with professional framing ensures a polished, trustworthy, and accessible academic presence, ideal for faculty directories, university websites, conference presentations, and scholarly publications.`,
  }, 
  {
    id: "cityscape_02",
    name: "Cityscape Headshots",
    compatibleBackgroundThemes: ["Cityscape"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a sleek and professional headshot of ohwx, ${character.ethnicity} ${
        normalizeGender(character.gender)
      }${hairStyle(character)}${glasses(character)}. The subject wears a ${clothingName}, positioned in a ${backgroundName}. Captured with Sony Alpha 7R IV, 85mm lens, ISO 200. Soft, even natural lighting with gentle highlights ensures a polished and flattering look that blends seamlessly with urban environments. Subject is in sharp focus with shallow depth of field, background softly blurred to suggest city energy and sophistication. Centered composition with clean framing, expression confident yet approachable, conveying professionalism and modern metropolitan presence. Ideal for executive profiles, LinkedIn branding, corporate communications, and professional networking in urban contexts.`,
  },
  {
    id: "creative_03",
    name: "Creative Headshots",
    compatibleBackgroundThemes: ["Creative"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a sleek and professional headshot of ohwx, ${character.ethnicity} ${
        normalizeGender(character.gender)
      }${hairStyle(character)}${glasses(character)}. The subject wears a ${clothingName}, confident and approachable expression, suitable for creative professionals, designers, artists, and entrepreneurs. Positioned in a ${backgroundName}. Captured with Hasselblad H6D-400c, 85mm lens, ISO 200. Soft, even lighting with gentle shadows emphasizes facial features and harmonizes with the artistic environment. Realistic skin textures, minimal makeup, and relaxed yet professional posture. Centered composition with clean focus conveys creativity, professionalism, and inspiration, adaptable across all creative workspaces.`,
  },
  {
    id: "conference_speaker_04",
    name: "Keynote Conference Speakers",
    compatibleBackgroundThemes: ["Conference Speaker"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a sleek and professional keynote speaker headshot of ohwx, ${character.ethnicity} ${
        normalizeGender(character.gender)
      }${hairStyle(character)}${glasses(character)}. The subject wears a ${clothingName}, positioned in a ${backgroundName}. Captured with Canon EOS R6, 50mm f/1.4 lens, ISO 200, dramatic professional stage lighting that emphasizes authority and commanding presence. The speaker has a confident, engaging, and authoritative expression with approachable charisma, conveying thought leadership and expertise. Sharp focus, centered composition, and polished presentation suitable for high-profile conferences, corporate summits, and keynote introductions.`,
  },
  {
    id: "home_office_05",
    name: "Home Office Headshots",
    compatibleBackgroundThemes: ["Home Office"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a sleek and professional portrait of a ohwx, ${character.ethnicity} ${
        normalizeGender(character.gender)
      }${hairStyle(character)}${glasses(character)}. The subject wears a ${clothingName}, natural and approachable tone, suitable for corporate profiles, LinkedIn, and professional remote work. Positioned in a ${backgroundName}. Captured with Canon EOS R5, 85mm lens, ISO 200. Soft, even indoor lighting with gentle highlights and shadows creates a flattering, consistent look across all home office environments. Realistic skin textures, minimal makeup, and a relaxed yet professional pose. Centered composition with clean focus emphasizes warmth, professionalism, and authenticity.`,
  },
  {
    id: "office_06",
    name: "Professional Office Headshots",
    compatibleBackgroundThemes: ["Office"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a sleek and professional portrait of ohwx, confident and approachable tone, suitable for LinkedIn, executive profiles and corporate branding. Featuring a poised ${character.ethnicity} ${
        normalizeGender(character.gender)
      }${hairStyle(character)}${glasses(character)}, standing in a ${backgroundName}. Captured with Canon EOS R5, 85mm lens, ISO 320, with soft natural lighting and balanced shadows. The subject wears ${clothingName}, exuding professionalism, realistic skin textures with minimal makeup, a composed expression, and clean, centered composition ensure a polished finish.`,
  },
  {
    id: "medical_08",
    name: "Medical Professional",
    compatibleBackgroundThemes: ["Medical"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a sleek and professional headshot of a ohwx, ${character.ethnicity} ${
        normalizeGender(character.gender)
      }${hairStyle(character)}${glasses(character)}. The subject wears a clinical ${clothingName}, photographed in a ${backgroundName}. Captured with Canon EOS R6, 85mm f/1.8 lens, ISO 200, using soft clinical lighting to emphasize professionalism and warmth. Expression should be compassionate yet authoritative, conveying trust, medical expertise, and patient care. Perfect for hospital directories, medical websites, healthcare leadership profiles, and professional practice branding.`,
  },
  {
    id: "monochrome_09",
    name: "Monochrome Portraits",
    compatibleBackgroundThemes: ["Monochrome"],
    // We intentially don't use clothingName here since it's monochrome so we want same color for clothing and background
    promptFunction: (character, clothingName, backgroundName) => {
      return `a photorealistic studio portrait of ohwx, ${character.ethnicity} ${normalizeGender(character.gender)}${hairStyle(character)}${glasses(
        character
      )}. The subject wears a professional monochromatic ${backgroundName} blazer over a ${backgroundName} ${character.gender=== "woman" ? "blouse": "dress shirt"}, front view half body shot, neutral facial expression, on a plain solid ${backgroundName} background. Captured with Canon EOS R6, 85mm f/1.4 lens, 24k resolution, RAW format, professional studio lighting.`;
    },
  },
  {
    id: "nature_10",
    name: "Nature Headshots: Sunlit Park Based",
    compatibleBackgroundThemes: ["Nature"],
    promptFunction: (character, clothingName, backgroundName) =>
      `a photorealistic professional portrait of ohwx, natural and approachable tone, suitable for corporate profiles and LinkedIn. Featuring poised ${character.ethnicity} ${
        normalizeGender(character.gender)
      }${hairStyle(character)}${glasses(character)}. The subject wears a ${clothingName}, captured in a ${backgroundName}. Shot with a Canon EOS R6, 50mm lens, ISO 200. Soft, natural outdoor lighting creates flattering highlights and gentle shadows that complement the natural environment. Realistic skin textures, minimal makeup, and a relaxed yet professional pose. Centered composition with clean focus emphasizes authenticity and warmth, making it versatile across diverse natural environments.`,
  },
  {
    id: "studio_11",
    name: "Studio Headshots",
    compatibleBackgroundThemes: ["Studio"],
    promptFunction: (character, clothingName, backgroundName) => {
      return `a photorealistic studio portrait of ohwx, neutral and professional tone, suitable for various business uses, most popular on Shutterstock, featuring a professional ${character.ethnicity} ${normalizeGender(character.gender)}${hairStyle(character)}${glasses(character)}, photorealistic, captured using Canon 7D mirrorless camera, 50mm lens, ISO 250, half body portrait, RAW format, on a ${backgroundName} background. The subject wears a ${clothingName}, realistic skin textures with minimal makeup, confident pose, soft lighting with soft reflections and shadows, centered composition`
    }
  },
];

function generatePrompts(userCharacterInputs, stylePairs, stylesLimit) {
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


export async function POST(request) {
  try {
    // Get API key from headers
    const apiKey = request.headers.get('x-api-key');
    
    // Verify API key
    if (!verifyApiKey(apiKey)) {
      return createErrorResponse('Unauthorized', 401);
    }
    
    // Parse the request payload
    let payload;
    try {
      payload = await request.json();
    } catch (error) {
      return createErrorResponse('Invalid JSON payload');
    }
    
    const { userCharacterInputs, stylePairs, stylesLimit } = payload;
    
    // Validate required fields
    if (!userCharacterInputs || !stylePairs || !stylesLimit) {
      return createErrorResponse('Missing required fields: userCharacterInputs, stylePairs, stylesLimit');
    }
    
    // Generate prompts using secure function
    const generatedPrompts = generatePrompts(
      userCharacterInputs,
      stylePairs,
      stylesLimit
    );
    
    if (!generatedPrompts || generatedPrompts.length === 0) {
      return createErrorResponse('Failed to generate prompts');
    }
    
    return createSuccessResponse({
      prompts: generatedPrompts,
      count: generatedPrompts.length
    });
    
  } catch (error) {
    console.error('Prompts API error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
