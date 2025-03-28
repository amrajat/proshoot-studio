// Constants and configurations for outfit categories
const OUTFIT_CATEGORIES = {
  // Outfits for specific environments
  ENVIRONMENT: {
    sunlit: {
      woman: "beige blazer over a crisp white blouse",
      man: "a navy blazer over a crisp white shirt",
    },
    cityOffice: {
      woman: "steel blue blazer over a crisp white shirt",
      man: "a navy blue blazer over a light gray shirt",
    },
    corporateOffice: {
      woman: "light beige knit top with a structured collar",
      man: "a dark burgundy blazer over a white shirt",
    },
    monochrome: {
      woman: "black midi fitted dress",
      man: "a classic black turtleneck sweater",
    },
    officeIndoors: {
      woman: "navy blue blazer over a white blouse",
      man: "a dark blue tailored suit jacket over a white shirt",
    },
    cheerful: {
      woman: "wrap blouse in neutral colors beige gray or navy",
      man: "a light beige blazer with a white shirt",
    },
    casual: {
      woman: "textured double-breasted jacket with round neck t-shirt",
      man: "a soft camel crew-neck sweater",
    },
  },

  // Outfits for solid backgrounds
  SOLID_BACKGROUND: {
    navyBlue: {
      woman: "white button-up blouse with a structured collar",
      man: "a white button-up shirt",
    },
    gray: {
      woman: "black ribbed turtleneck with structured shoulders",
      man: "a black long-sleeve button-up shirt",
    },
    arcticWhite: {
      woman: "deep charcoal blazer over a pastel blouse",
      man: "a charcoal ribbed turtleneck sweater",
    },
    white: {
      woman: "soft blush pink knit sweater",
      man: "a midnight blue blazer over a black crew-neck sweater",
    },
    steelBlue: {
      woman:
        "high-neck blouse with subtle texture cream light blue or soft lavender",
      man: "a light blue button-up shirt",
    },
    charcoal: {
      woman: "olive green knit turtleneck",
      man: "a deep olive green blazer over a light gray shirt",
    },
    pewterGray: {
      woman: "caramel ribbed knit turtleneck",
      man: "a heather gray knit sweater",
    },
    midnightBlue: {
      woman: "one-button blazer in linen blend with beige blouse",
      man: "a dark gray blazer with a white shirt",
    },
    gunmetalGray: {
      woman: "collarless blazer in a neutral color",
      man: "a textured charcoal gray crew-neck sweater",
    },
    graphiteGray: {
      woman: "muted satin blouse in champagne dusty pink or soft taupe",
      man: "a deep burgundy knit sweater",
    },
  },
};

// Background configurations
const BACKGROUNDS = {
  // Background colors by plan
  COLORS: {
    BASIC: ["navy blue", "gray", "arctic white", "white"],
    STANDARD: ["steel blue", "charcoal"],
    PREMIUM: ["pewter gray", "midnight blue"],
    PRO: ["gunmetal gray", "graphite gray"],
  },

  // Mapping of background colors to their category keys
  COLOR_TO_KEY: {
    "navy blue": "navyBlue",
    gray: "gray",
    "arctic white": "arcticWhite",
    white: "white",
    "steel blue": "steelBlue",
    charcoal: "charcoal",
    "pewter gray": "pewterGray",
    "midnight blue": "midnightBlue",
    "gunmetal gray": "gunmetalGray",
    "graphite gray": "graphiteGray",
  },
};

// Helper functions for prompt generation
const promptHelpers = {
  getOutfit: (gender, category, subcategory = null) => {
    const outfits = subcategory
      ? OUTFIT_CATEGORIES.SOLID_BACKGROUND[subcategory]
      : OUTFIT_CATEGORIES.ENVIRONMENT[category];

    return gender === "woman" ? outfits.woman : outfits.man;
  },

  getPronoun: (gender) => {
    return gender === "man" ? "his" : gender === "woman" ? "her" : "their";
  },

  getGlassesText: (hasGlasses) => {
    return hasGlasses ? ", wearing glasses" : "";
  },
};

// Template generators for different types of prompts
const templateGenerators = {
  solidBackground: (userInputs, bgColor) => {
    const { gender, age, ethnicity, hairStyle, eyeColor, glasses } = userInputs;
    const { getOutfit, getPronoun, getGlassesText } = promptHelpers;

    return `a photorealistic studio portrait of ohwx, neutral and professional tone, suitable for various business uses, most popular on Shutterstock, featuring a professional ${ethnicity} ${gender} in ${getPronoun(
      gender
    )} ${age}, with ${eyeColor} eyes, ${hairStyle}${getGlassesText(
      glasses
    )}, photorealistic, captured using Canon 7D mirrorless camera, 50mm lens, ISO 250, half body portrait, RAW format, on a plain solid ${bgColor} background, wearing ${getOutfit(
      gender,
      "solid",
      BACKGROUNDS.COLOR_TO_KEY[bgColor]
    )}, realistic skin textures with minimal makeup, confident pose, soft lighting with soft reflections and shadows, centered composition`;
  },
};

export default function generatePrompts(userInputs) {
  const { gender, age, ethnicity, hairStyle, eyeColor, glasses } = userInputs;
  const { getOutfit, getPronoun, getGlassesText } = promptHelpers;

  // Get all background colors in a flat array
  const solidBackgrounds = [
    ...BACKGROUNDS.COLORS.BASIC,
    ...BACKGROUNDS.COLORS.STANDARD,
    ...BACKGROUNDS.COLORS.PREMIUM,
    ...BACKGROUNDS.COLORS.PRO,
  ];

  // Generate headshot arrays
  const BasicHeadshots = [
    // Sunlit park
    `a photorealistic professional portrait of ohwx, natural and approachable tone, suitable for corporate profiles and LinkedIn. Featuring a poised ${ethnicity} ${gender} in ${getPronoun(
      gender
    )} ${age}, with ${eyeColor} eyes, ${hairStyle}${getGlassesText(
      glasses
    )}, captured in a sunlit park with blurred greenery in the background. Captured using a Canon EOS R6, 50mm lens, ISO 200, with natural sunlight and soft fill lighting. The subject wears ${getOutfit(
      gender,
      "sunlit"
    )}, exuding confidence and warmth. Realistic skin textures, minimal makeup, and a relaxed yet professional pose. The composition emphasizes natural beauty with a clean, centered focus.`,

    // city skyline office
    `a sleek and professional portrait of ohwx, corporate and polished tone, ideal for LinkedIn and executive profiles. Featuring a confident ${ethnicity} ${gender} in ${getPronoun(
      gender
    )} ${age}, with ${eyeColor} eyes, ${hairStyle}${getGlassesText(
      glasses
    )}, standing in a modern high-rise office with a blurred city skyline in the background. Captured using a Canon EOS R5, 70mm lens, ISO 250, with bright natural lighting and balanced shadows. The subject wears ${getOutfit(
      gender,
      "cityOffice"
    )}, exuding professionalism. Realistic skin textures with minimal makeup, a composed expression, and clean, centered composition ensure a polished finish.`,

    // corporate office
    `a sleek professional portrait of ohwx, global and business-oriented tone, perfect for high-level corporate branding. Featuring a poised ${ethnicity} ${gender} in ${getPronoun(
      gender
    )} ${age}, with ${eyeColor} eyes, ${hairStyle}${getGlassesText(
      glasses
    )}, photorealistically captured in a corporate office with large windows and a blurred city skyline in the background. Shot with a Canon EOS R3, 50mm lens, ISO 320, with soft natural lighting. The subject wears ${getOutfit(
      gender,
      "corporateOffice"
    )}. Realistic skin textures, minimal makeup, and a composed expression emphasize authority and clarity.`,

    // Monochrome
    `Expertly shot studio portrait of an attractive professional ohwx ${ethnicity} ${gender} in ${getPronoun(
      gender
    )} ${age}, with ${eyeColor} eyes, ${hairStyle}${getGlassesText(
      glasses
    )}, wearing monochromatic outfit, ${
      gender === "woman"
        ? "navy blue tweed full-sleeve sheath dress"
        : "a classic navy blue turtleneck sweater"
    }, front view half body shot, neutral facial expression, on a plain solid navy blue background, captured on a canon eos r6, 85mm f/1.4, 24k resolution, RAW format, professional studio lighting`,

    // Office Indoors background
    `professional corporate portrait photo of ${ethnicity} ohwx ${gender} in ${getPronoun(
      gender
    )} ${age}, with ${eyeColor} eyes, ${hairStyle}${getGlassesText(
      glasses
    )}, wearing ${getOutfit(
      gender,
      "officeIndoors"
    )}, captured in a office with cabinets and windows in the background, half body portrait, captured on a sony alpha, with a 50mm zoom lens, professional photo retouching, with natural light, photorealistic quality with RAW format, front view centered composition, confident pose`,

    `professional corporate portrait photo of ${ethnicity} ohwx ${gender} in ${getPronoun(
      gender
    )} ${age}, with ${eyeColor} eyes, ${hairStyle}${getGlassesText(
      glasses
    )}, wearing ${
      gender === "woman"
        ? "black floral button-up blouse"
        : "a navy short-sleeve polo with a structured collar"
    }, captured in a office with cabinets and windows in the background, half body portrait, captured on a sony alpha, with a 50mm zoom lens, professional photo retouching, with natural light, photorealistic quality with RAW format, front view centered composition, confident pose`,

    ...BACKGROUNDS.COLORS.BASIC.map((bgColor) =>
      templateGenerators.solidBackground(userInputs, bgColor)
    ),
  ];

  const StandardHeadshots = [
    // Office Indoors background
    `professional corporate portrait photo of ${ethnicity} ohwx ${gender} in ${getPronoun(
      gender
    )} ${age}, with ${eyeColor} eyes, ${hairStyle}${getGlassesText(
      glasses
    )}, wearing ${
      gender === "woman"
        ? "striped smocked-waist midi flare dress"
        : "a slim-fit navy long-sleeve button-up shirt"
    }, captured in a office with cabinets and windows in the background, half body portrait, captured on a sony alpha, with a 50mm zoom lens, professional photo retouching, with natural light, photorealistic quality with RAW format, front view centered composition, confident pose`,

    `professional corporate portrait photo of ${ethnicity} ohwx ${gender} in ${getPronoun(
      gender
    )} ${age}, with ${eyeColor} eyes, ${hairStyle}${getGlassesText(
      glasses
    )}, wearing ${
      gender === "woman"
        ? "tweed button short sleeve shift dress"
        : "a black blazer over a crisp white shirt"
    }, captured in a office with cabinets and windows in the background, half body portrait, captured on a sony alpha, with a 50mm zoom lens, professional photo retouching, with natural light, photorealistic quality with RAW format, front view centered composition, confident pose`,

    // Cheerful
    `Realistic portrait of a cheerful ${ethnicity} ohwx ${gender} in ${getPronoun(
      gender
    )} ${age}, with ${eyeColor} eyes, ${hairStyle}${getGlassesText(
      glasses
    )}, wearing ${getOutfit(
      gender,
      "cheerful"
    )}, confident yet approachable expression, soft natural lighting highlights face, with a background featuring working on a laptop in a modern office; professional and approachable atmosphere, ideal for business or creative work settings. Use a high-end camera like the Hasselblad H6D-400c or Canon EOS R5`,

    ...BACKGROUNDS.COLORS.STANDARD.map((bgColor) =>
      templateGenerators.solidBackground(userInputs, bgColor)
    ),
  ];

  const PremiumHeadshots = [
    // Office Indoors background
    `professional corporate portrait photo of ${ethnicity} ohwx ${gender} in ${getPronoun(
      gender
    )} ${age}, with ${eyeColor} eyes, ${hairStyle}${getGlassesText(
      glasses
    )}, wearing ${
      gender === "woman"
        ? "blue little boxy jacket with a round neck t-shirt"
        : "a dark brown wool blazer over a white button-up"
    }, captured in a office with cabinets and windows in the background, half body portrait, captured on a sony alpha, with a 50mm zoom lens, professional photo retouching, with natural light, photorealistic quality with RAW format, front view centered composition, confident pose`,

    // Monochrome
    `Expertly shot studio portrait of an attractive professional ohwx ${ethnicity} ${gender} in ${getPronoun(
      gender
    )} ${age}, with ${eyeColor} eyes, ${hairStyle}${getGlassesText(
      glasses
    )}, wearing monochromatic outfit, ${
      gender === "woman"
        ? "dark olive green tweed full-sleeve sheath dress"
        : "a dark olive green casual blazer over a cream shirt"
    }, front view half body shot, neutral facial expression, on a plain solid olive green background, captured on a canon eos r6, 85mm f/1.4, 24k resolution, RAW format, professional studio lighting`,

    // Casual
    `professional studio portrait of a confident ${ethnicity} ohwx ${gender} in ${getPronoun(
      gender
    )} ${age}, with ${eyeColor} eyes, ${hairStyle}${getGlassesText(
      glasses
    )}, natural smile, perfect for Linked profile, wearing ${getOutfit(
      gender,
      "casual"
    )}, captured on a plain solid colored gray background. The half-body shot uses soft, complementary colors with natural skin texture. Taken with a Canon 5D Mark IV, RAW format, 70mm lens, ISO 200, f/11 aperture, and 1/125 sec shutter speed for sharp, high-contrast results. ${getPronoun(
      gender
    )} skin is natural to maintain a realistic texture with no makeup. front view, with rich shadows and highlights, creating a natural and professional stock photo style.`,

    ...BACKGROUNDS.COLORS.PREMIUM.map((bgColor) =>
      templateGenerators.solidBackground(userInputs, bgColor)
    ),
  ];

  const ProHeadshots = [
    // Office Indoors background
    `professional corporate portrait photo of ${ethnicity} ohwx ${gender} in ${getPronoun(
      gender
    )} ${age}, with ${eyeColor} eyes, ${hairStyle}${getGlassesText(
      glasses
    )}, wearing ${
      gender === "woman"
        ? "ivory or off-white blazer over a taupe blouse"
        : "a soft taupe blazer over a white shirt"
    }, captured in a office with cabinets and windows in the background, half body portrait, captured on a sony alpha, with a 50mm zoom lens, professional photo retouching, with natural light, photorealistic quality with RAW format, front view centered composition, confident pose`,

    // Cheerful
    `Realistic portrait of a cheerful ${ethnicity} ohwx ${gender} in ${getPronoun(
      gender
    )} ${age}, with ${eyeColor} eyes, ${hairStyle}${getGlassesText(
      glasses
    )}, wearing ${
      gender === "woman"
        ? "black ribbed crew-neck sweater"
        : "a navy blue suit jacket with a pale cream shirt"
    }, confident yet approachable expression, soft natural lighting highlights face, with a background featuring reviewing documents at a desk in a study; professional and approachable atmosphere, ideal for business or creative work settings. Use a high-end camera like the Hasselblad H6D-400c or Canon EOS R5`,

    // Casual
    `professional studio portrait of a confident ${ethnicity} ohwx ${gender} in ${getPronoun(
      gender
    )} ${age}, with ${eyeColor} eyes, ${hairStyle}${getGlassesText(
      glasses
    )}, natural smile, perfect for Linked profile, wearing ${
      gender === "woman"
        ? "women's striped slim fit shirt"
        : "a linen blend button-up crisp white shirt"
    }, captured on a plain solid colored arctic white background. The half-body shot uses soft, complementary colors with natural skin texture. Taken with a Canon 5D Mark IV, RAW format, 70mm lens, ISO 200, f/11 aperture, and 1/125 sec shutter speed for sharp, high-contrast results. ${getPronoun(
      gender
    )} skin is natural to maintain a realistic texture with no makeup. front view, with rich shadows and highlights, creating a natural and professional stock photo style.`,

    ...BACKGROUNDS.COLORS.PRO.map((bgColor) =>
      templateGenerators.solidBackground(userInputs, bgColor)
    ),
  ];

  // Combine and flatten all prompts
  const allPrompts = [
    ...BasicHeadshots,
    ...StandardHeadshots,
    ...PremiumHeadshots,
    ...ProHeadshots,
  ].flat();

  return allPrompts;
}
