import { z } from "zod";

// Gender Selection
export const GENDERS = [
  {
    title: "Please select your gender.",
    subtitle: "This will help us provide you with the most accurate headshots.",
    fieldName: "gender",
  },
  {
    Man: "man",
    Woman: "woman",
    "Non-Binary": "non-binary",
  },
  {
    isRequired: true,
    placeholderText: null,
    helpText: null,
    regexPattern: null,
    radioOptions: true,
    customOption: false,
  },
];

// Age Ranges
export const AGES = [
  "early-20s",
  "mid-20s",
  "late-20s",
  "early-30s",
  "mid-30s",
  "late-30s",
  "early-40s",
  "mid-40s",
  "late-40s",
  "early-50s",
  "mid-50s",
  "late-50s",
  "early-60s",
  "mid-60s",
  "late-60s",
  "early-70s",
  "mid-70s",
  "late-70s",
  "early-80s",
  "mid-80s",
  "late-80s",
  "early-90s",
  "mid-90s",
  "late-90s",
];

// Ethnicities
export const ETHNICITIES = [
  "Black or of African Descent",
  "East Asian",
  "European / White",
  "Hispanic or Latino",
  "Indigenous Peoples",
  "Middle Eastern or North African (MENA)",
  "South Asian",
  "Southeast Asian",
  "Multiracial or Mixed",
];

// Eye Colors
export const EYE_COLORS = ["Brown", "Hazel", "Blue", "Amber", "Gray", "Green"];

// Glasses
export const GLASSES = ["Yes", "No"];

// Hair Attributes by Gender
export const HAIR_LENGTH = {
  man: [
    "Bald",
    "Buzz Cut",
    "Short Cropped",
    "Fade / Taper",
    "Undercut",
    "Medium Length / Bro Flow",
    "Long",
    "Man Bun / Top Knot",
  ],
  woman: [
    "Pixie Cut",
    "Bald",
    "Bob Cut",
    "Lob / Long Bob",
    "Medium Length",
    "Long",
    "Layered Cut",
    "Updo / Bun",
    "Hisab",
  ],
  "non-binary": [
    "Bald",
    "Buzz Cut",
    "Short Cropped",
    "Fade / Taper",
    "Undercut",
    "Medium Length / Bro Flow",
    "Long",
    "Man Bun / Top Knot",
    "Pixie Cut",
    "Bob Cut",
    "Lob / Long Bob",
    "Layered Cut",
    "Updo / Bun",
  ],
};

export const HAIR_COLOR = {
  man: [
    "Jet Black",
    "Natural Black",
    "Dark Brown",
    "Medium Brown",
    "Light Brown",
    "Golden Blonde",
    "Ash Blonde",
    "Platinum Blonde",
    "Ginger / Red",
    "Auburn",
    "Salt & Pepper",
    "Silver / Gray",
    "White",
  ],
  woman: [
    "Jet Black",
    "Natural Black",
    "Dark Brown / Espresso",
    "Chestnut Brown",
    "Medium Brown",
    "Light Brown",
    "Golden Blonde",
    "Ash Blonde",
    "Platinum Blonde",
    "Strawberry Blonde",
    "Ginger",
    "Auburn",
    "Deep Red / Burgundy",
    "Salt & Pepper",
    "Silver / Gray",
    "White",
    "Highlights",
    "Balayage",
    "Ombré",
  ],
  "non-binary": [
    "Jet Black",
    "Natural Black",
    "Dark Brown",
    "Medium Brown",
    "Light Brown",
    "Golden Blonde",
    "Ash Blonde",
    "Platinum Blonde",
    "Ginger / Red",
    "Auburn",
    "Salt & Pepper",
    "Silver / Gray",
    "White",
    "Dark Brown / Espresso",
    "Chestnut Brown",
    "Strawberry Blonde",
    "Deep Red / Burgundy",
    "Highlights",
    "Balayage",
    "Ombré",
  ],
};

export const HAIR_TYPE = {
  man: ["Straight", "Wavy", "Curly", "Coily / Afro-Textured", "Dreadlocks"],
  woman: [
    "Straight",
    "Wavy",
    "Curly",
    "Coily / Afro-Textured",
    "Dreadlocks",
    "Braids",
  ],
  "non-binary": [
    "Straight",
    "Wavy",
    "Curly",
    "Coily / Afro-Textured",
    "Dreadlocks",
    "Braids",
  ],
};

// Height Ranges
export const HEIGHT_RANGES = [
  "4'8\" – 4'9\"",
  "4'10\" – 4'11\"",
  "5'0\" – 5'1\"",
  "5'2\" – 5'3\"",
  "5'4\" – 5'5\"",
  "5'6\" – 5'7\"",
  "5'8\" – 5'9\"",
  "5'10\" – 5'11\"",
  "6'0\" – 6'1\"",
  "6'2\" – 6'3\"",
  "6'4\" – 6'5\"",
  "6'6\" – 6'7\"",
  "6'8\" – 6'9\"",
  "6'10\" – 6'11\"",
  "7'0\"+",
];

// Weight Ranges
export const WEIGHT_RANGES = [
  "Under 100 lbs",
  "100 – 114 lbs",
  "115 – 129 lbs",
  "130 – 144 lbs",
  "145 – 159 lbs",
  "160 – 174 lbs",
  "175 – 189 lbs",
  "190 – 204 lbs",
  "205 – 219 lbs",
  "220 – 234 lbs",
  "235 – 249 lbs",
  "250 – 264 lbs",
  "265 – 279 lbs",
  "280 – 299 lbs",
  "300 – 324 lbs",
  "325 – 349 lbs",
  "350 – 374 lbs",
  "375 – 399 lbs",
  "400+ lbs",
];

export const BODY_TYPES = {
  man: [
    "Slim",
    "Average",
    "Athletic",
    "Broad / Muscular",
    "Heavyset / Stocky",
    "Large / Plus Size",
  ],
  woman: [
    "Slim",
    "Average",
    "Athletic / Toned",
    "Curvy",
    "Full Figured",
    "Plus Size",
  ],
  "non-binary": [
    "Slim",
    "Average",
    "Athletic",
    "Broad / Muscular",
    "Heavyset / Stocky",
    "Large / Plus Size",
  ],
};

// Combined Attributes for the new step
export const ATTRIBUTES = {
  age: {
    label: "Age Range",
    options: AGES,
    description: "Select the age range that best represents you.",
  },
  ethnicity: {
    label: "Ethnicity",
    options: ETHNICITIES,
    description: "Select your ethnicity.",
  },
  hairLength: {
    label: "Hair Length",
    options: HAIR_LENGTH,
    description: "Select your hair length.",
  },
  hairColor: {
    label: "Hair Color",
    options: HAIR_COLOR,
    description: "Select your hair color.",
  },
  hairType: {
    label: "Hair Type",
    options: HAIR_TYPE,
    description: "Select your hair type.",
  },
  bodyType: {
    label: "Body Type",
    options: BODY_TYPES,
    description: "Select your body type.",
  },
  height: {
    label: "Height",
    options: HEIGHT_RANGES,
    description: "Select your height range.",
  },
  weight: {
    label: "Weight",
    options: WEIGHT_RANGES,
    description: "Select your weight range.",
  },
  eyeColor: {
    label: "Eye Color",
    options: EYE_COLORS,
    description: "Select your eye color.",
  },
  glasses: {
    label: "Wear Glasses?",
    options: GLASSES,
    description: "Do you want glasses in your headshots?",
  },
  studioName: {
    label: "Studio Name",
    description: "Usually it's your name, e.g., 'yourname'",
  },
  howDidYouHearAboutUs: {
    label: "How did you hear about us?",
    description: "Please select an option",
    options: [
      "Google",
      "Reddit",
      "Instagram",
      "X (Twitter)",
      "LinkedIn",
      "TikTok",
      "YouTube",
      "Friend & Colleague",
      "Facebook",
    ],
  },
};

// Updated Zod Form Schema
export const formSchema = z
  .object({
    plan: z.enum(["Starter", "Professional", "Studio", "Team"], {
      message: "Please select a valid plan.",
    }),
    gender: z.string().min(3, { message: "Please select your gender." }),
    age: z.string().optional(),
    ethnicity: z.string().optional(),
    hairLength: z
      .string()
      .min(1, { message: "Please select your hair length." }),
    hairColor: z.string().optional(),
    hairType: z.string().optional(),
    eyeColor: z.string().optional(),
    glasses: z
      .string()
      .min(1, { message: "Please choose your glass preference." }),
    bodyType: z.string().optional(),
    height: z.string().optional(),
    weight: z.string().optional(),
    clothing: z
      .array(z.object({ name: z.string(), theme: z.string() }))
      .min(1, { message: "Please select at least 1 clothing option." }),
    backgrounds: z
      .array(z.object({ name: z.string(), theme: z.string() }))
      .min(1, { message: "Please select at least 1 background." }),
    images: z.string(),
    howDidYouHearAboutUs: z.string().optional(),
    studioName: z.string().min(1, "Please enter your studio name."),
  })
  .refine(
    (data) => {
      if (data.hairLength === "Bald" || data.hairLength === "Hisab") {
        return true; // hairColor and hairType are optional, so no need to check them
      }
      return !!data.hairColor && !!data.hairType;
    },
    {
      // message: "Hair color and type are required unless hair length is Bald.",
      path: ["hairColor"], // You can associate the error with a specific field
    }
  );
