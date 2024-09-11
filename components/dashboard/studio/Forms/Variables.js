import { z } from "zod";

export const GENDERS = [
  {
    title: "Please select your gender.",
    subtitle: null,
    fieldName: "gender",
  },
  {
    Man: "man",
    Woman: "woman",
    "Non-Binary": "non-binary",
  },
];

export const AGES = [
  {
    title: "Please select your age range.",
    subtitle:
      "Please choose the age range that reflects how old you look, not your actual age.",
    fieldName: "age",
  },
  {
    "Early 20s": "early 20s",
    "Mid 20s": "mid 20s",
    "Late 20s": "late 20s",
    "Early 30s": "early 30s",
    "Mid 30s": "mid 30s",
    "Late 30s": "late 30s",
    "Early 40s": "early 40s",
    "Mid 40s": "mid 40s",
    "Late 40s": "late 40s",
    "Early 50s": "early 50s",
    "Mid 50s": "mid 50s",
    "Late 50s": "late 50s",
    "Early 60s": "early 60s",
    "Mid 60s": "mid 60s",
    "Late 60s": "late 60s",
    "70s": "70s",
    "80s": "80s",
  },
];

export const ETHNICITIES = [
  {
    title: "Please select your ethnicity.",
    subtitle:
      "Please choose your ethnicity from the options provided or feel free to enter a custom value.",
    fieldName: "ethnicity",
  },
  {
    "African American": "african american",
    Caucasian: "caucasian",
    "East Asian": "east asian",
    "Hispanic/Latino": "hispanic latino",
    "Middle Eastern": "middle eastern",
    "Mixed race": "mixed race",
    "Native American": "native american",
    "Pacific Islander": "pacific islander",
    "South Asian": "south asian",
    "Southeast Asian": "southeast asian",
  },
];

export const HAIR_COLORS = [
  {
    title: "Please select your hair color.",
    subtitle:
      "Please choose the option that best matches your hair color. If none of the options fit, feel free to enter a custom color",
    fieldName: "hair-color",
  },
  {
    Auburn: "auburn",
    Black: "black",
    Blonde: "blonde",
    Chestnut: "chestnut",
    "Dark brown": "dark brown",
    Gray: "gray",
    "Light brown": "light brown",
    "Medium brown": "medium brown",
    "Platinum blonde": "platinum blonde",
    Red: "red",
    "Salt and pepper": "salt and pepper",
    White: "white",
  },
];

export const HAIR_STYLES = [
  {
    title: "Please select your hair style.",
    subtitle:
      "Please choose the option that best matches your hair style. If none of the options fit, feel free to enter a custom style",
    fieldName: "hair-style",
  },
  {
    Afro: "afro",
    Bald: "bald",
    Balding: "balding",
    Bob: "bob",
    Braids: "braids",
    "Buzz cut": "buzz cut",
    Bun: "bun",
    "Crew cut": "crew cut",
    Curly: "curly",
    Dreadlocks: "dreadlocks",
    Long: "long",
    "Middle-parted": "middle parted",
    Pixie: "pixie cut",
    Ponytail: "ponytail",
    "Short cropped": "short cropped",
    "Shoulder-length": "shoulder length",
    "Side-parted": "side parted",
    "Slicked back": "slicked back",
    Straight: "straight",
    Tousled: "tousled",
    Wavy: "wavy",
  },
];

export const EYE_COLORS = [
  {
    title: "Please select eye color.",
    subtitle:
      "Please choose the option that best matches your current eye color. If none of the options fit, feel free to enter a custom color",
    fieldName: "eye-color",
  },
  {
    Amber: "amber",
    Black: "black",
    Blue: "blue",
    Brown: "brown",
    "Dark brown": "dark brown",
    Gray: "gray",
    Green: "green",
    Hazel: "hazel",
    "Light brown": "light brown",
  },
];

export const PROFESSIONS = [
  {
    title: "Please select PROFESSION  .",
    subtitle:
      "Please choose the option that best matches your profession. If you don't see a suitable option, feel free to enter a custom profession.",
    fieldName: "profession",
  },
  {
    Accountant: "accountant",
    Actor: "actor",
    Archaeologist: "archaeologist",
    Architect: "architect",
    Artist: "artist",
    Athlete: "athlete",
    Botanist: "botanist",
    "Business Analyst": "business analyst",
    Carpenter: "carpenter",
    Chef: "chef",
    Coach: "coach",
    "Construction Worker": "construction worker",
    Consultant: "consultant",
    Curator: "curator",
    "Customer Service Representative": "customer service representative",
    "Data Scientist": "data scientist",
    Dentist: "dentist",
    Doctor: "doctor",
    Electrician: "electrician",
    Engineer: "engineer",
    "Environmental Scientist": "environmental scientist",
    Farmer: "farmer",
    "Financial Advisor": "financial advisor",
    Firefighter: "firefighter",
    "Flight Attendant": "flight attendant",
    "Graphic Designer": "graphic designer",
    "Human Resources Professional": "human resources professional",
    Interpreter: "interpreter",
    Journalist: "journalist",
    Lawyer: "lawyer",
    Librarian: "librarian",
    "Marketing Specialist": "marketing specialist",
    Mechanic: "mechanic",
    "Military Personnel": "military personnel",
    Musician: "musician",
    Nurse: "nurse",
    Optometrist: "optometrist",
    Pharmacist: "pharmacist",
    Photographer: "photographer",
    Pilot: "pilot",
    Politician: "politician",
    "Product Manager": "product manager",
    "Project Manager": "project manager",
    Professor: "professor",
    Psychologist: "psychologist",
    Researcher: "researcher",
    Realtor: "realtor",
    "Sales Representative": "sales representative",
    Scientist: "scientist",
    "Social Worker": "social worker",
    "Software Engineer": "software engineer",
    Teacher: "teacher",
    Therapist: "therapist",
    Translator: "translator",
    "UX/UI Designer": "ux ui designer",
    Veterinarian: "veterinarian",
    Videographer: "videographer",
    "Web Developer": "web developer",
    Writer: "writer",
    Zoologist: "zoologist",
  },
];
// FIXME: MAKE SURE WE EXCLUDE LOWER BOD CLOTHS FROM THIS LIST. AS WE ONLY GENERATE HEADSHOTS. NO THE FULL BODY IMAGES.
export const CLOTHING_TYPE = [
  {
    title: "Please select TYPE OF CLOTHS.",
    subtitle: "If none of the options fit, feel free to enter a custom value.",
    fieldName: "cloth-type",
  },
  {
    Blazer: "blazer",
    "Button-up shirt": "button up shirt",
    Cardigan: "cardigan",
    Coat: "coat",
    Dress: "dress",
    "Dress shirt": "dress shirt",
    Jeans: "jeans",
    Jacket: "jacket",
    Khakis: "khakis",
    "Polo shirt": "polo shirt",
    Skirt: "skirt",
    "Sport coat": "sport coat",
    Sweater: "sweater",
    "Tank top": "tank top",
    "T-shirt": "t shirt",
    Trousers: "trousers",
    Turtleneck: "turtleneck",
    Vest: "vest",
  },
];

export const CLOTHING_COLORS = [
  {
    title: "Please select COLOR OF YOU CLOTHS.",
    subtitle:
      "You can always enter your choice of color in custom value input.",
    fieldName: "cloth-color",
  },
  {
    Beige: "beige",
    Black: "black",
    Brown: "brown",
    Burgundy: "burgundy",
    Charcoal: "charcoal",
    Cream: "cream",
    Gold: "gold",
    Gray: "gray",
    Green: "green",
    "Light blue": "light blue",
    Lavender: "lavender",
    "Navy blue": "navy blue",
    Olive: "olive",
    Orange: "orange",
    Pink: "pink",
    Purple: "purple",
    Red: "red",
    "Royal blue": "royal blue",
    Silver: "silver",
    Tan: "tan",
    Teal: "teal",
    White: "white",
    Yellow: "yellow",
  },
];
// BELOW STYLE DESCRIPTION IS NOT REQUIRED FOR THE PROMPTS.
// export const STYLE_DESCRIPTION = [
//   {
//     title: "Please select YOU STYLE.",
//     subtitle: "If none of the options fit, feel free to enter a custom value.",
//     fieldName: "style-type",
//   },
//   {
//     Bohemian: "bohemian",
//     "Business casual": "business casual",
//     "Business professional": "business professional",
//     Casual: "casual",
//     Conservative: "conservative",
//     Creative: "creative",
//     Eclectic: "eclectic",
//     Formal: "formal",
//     Minimalist: "minimalist",
//     Modern: "modern",
//     Preppy: "preppy",
//     "Smart casual": "smart casual",
//     Trendy: "trendy",
//     Vintage: "vintage",
//   },
// ];
// FIXME: WE MIGHT NEED TO REMOVE THIS
// export const ACCESSORIES = [
//   {
//     title: "Please select ACCESSORIES.",
//     subtitle: null,
//     fieldName: "accessories",
//   },
//   {
//     Bracelet: "bracelet",
//     Brooch: "brooch",
//     Cufflinks: "cufflinks",
//     Earrings: "earrings",
//     "Glasses (specify style: rimless, full-frame, cat-eye, etc.)":
//       "glasses specify style rimless full frame cat eye etc",
//     "Hair accessory (headband, clip, etc.)": "hair accessory headband clip etc",
//     "Lapel pin": "lapel pin",
//     Necklace: "necklace",
//     Ring: "ring",
//     Scarf: "scarf",
//     Tie: "tie",
//     Watch: "watch",
//     "Bow tie": "bow tie",
//   },
// ];

export const GROOMING = [
  {
    title: "Please select GROOMING STYLE.",
    subtitle: "If none of the options fit, feel free to enter a custom value.",
    fieldName: "grooming",
  },
  {
    "Clean-shaven": "clean shaven",
    "Full beard": "full beard",
    Goatee: "goatee",
    "Minimal makeup": "minimal makeup",
    Mustache: "mustache",
    "Natural makeup": "natural makeup",
    "No visible makeup": "no visible makeup",
    "Professional makeup": "professional makeup",
    "Short beard": "short beard",
    Stubble: "stubble",
    "Well-groomed eyebrows": "well groomed eyebrows",
  },
];

export const BACKGROUND_TYPE = [
  {
    title: "Please select BACKGROUND_TYPE.",
    subtitle: "If none of the options fit, feel free to enter a custom value.",
    fieldName: "background",
  },
  {
    "Abstract pattern": "abstract pattern",
    "Blurred cityscape": "blurred cityscape",
    "Blurred nature scene": "blurred nature scene",
    "Blurred office": "blurred office",
    "Blurred bookshelf": "blurred bookshelf",
    "Bokeh effect": "bokeh effect",
    "Classic interior": "classic interior",
    Gradient: "gradient",
    "Modern interior": "modern interior",
    "Outdoor professional setting": "outdoor professional setting",
    "Solid color (specify color)": "solid color specify color",
    "Studio backdrop": "studio backdrop",
    "Textured wall": "textured wall",
  },
];

export const LIGHTINGS = [
  {
    title: "Please select lightings.",
    subtitle: "If none of the options fit, feel free to enter a custom value.",
    fieldName: "lighting",
  },
  {
    "Butterfly lighting": "butterfly lighting",
    "Dramatic side lighting": "dramatic side lighting",
    "Flat lighting": "flat lighting",
    "Golden hour lighting": "golden hour lighting",
    "Harsh studio lighting": "harsh studio lighting",
    "High-key lighting": "high key lighting",
    "Loop lighting": "loop lighting",
    "Low-key lighting": "low key lighting",
    "Natural window light": "natural window light",
    "Outdoor natural light": "outdoor natural light",
    "Rembrandt lighting": "rembrandt lighting",
    "Soft studio lighting": "soft studio lighting",
  },
];

// export const POSES = [
//   {
//     title: "Please select POSES.",
//     subtitle: "If none of the options fit, feel free to enter a custom value.",
//     fieldName: "pose",
//   },
//   {
//     "45-degree angle": "45 degree angle",
//     "Chin slightly raised": "chin slightly raised",
//     "Head tilt": "head tilt",
//     "Leaning forward slightly": "leaning forward slightly",
//     "One shoulder toward camera": "one shoulder toward camera",
//     Profile: "profile",
//     "Shoulders squared to camera": "shoulders squared to camera",
//     "Slightly angled": "slightly angled",
//     "Straight-on": "straight on",
//     "Three-quarter view": "three quarter view",
//   },
// ];

export const EXPRESSIONS = [
  {
    title: "Please select your face expressions.",
    subtitle: "If none of the options fit, feel free to enter a custom value.",
    fieldName: "expression",
  },
  {
    Approachable: "approachable",
    "Broad smile": "broad smile",
    "Confident smile": "confident smile",
    Determined: "determined",
    Engaging: "engaging",
    Focused: "focused",
    Friendly: "friendly",
    Neutral: "neutral",
    Professional: "professional",
    Relaxed: "relaxed",
    Serious: "serious",
    "Subtle smile": "subtle smile",
    Thoughtful: "thoughtful",
    Warm: "warm",
  },
];

// export const GAZE_DIRECTION = [
//   {
//     title: "Please select GAZE DIRECTION.",
//     subtitle: "If none of the options fit, feel free to enter a custom value.",
//     fieldName: "gaze-direction",
//   },
//   {
//     "Directly at camera": "directly at camera",
//     "Looking down": "looking down",
//     "Looking to the side": "looking to the side",
//     "Looking up": "looking up",
//     "Slightly off-camera": "slightly off camera",
//   },
// ];

export const CAMERA_TYPE = [
  {
    title: "Please select camera type.",
    subtitle:
      "It's not recommended to select any particular camera type here as we will generate your images with multiple camera types.",
    fieldName: "camera-type",
  },
  {
    "APS-C sensor camera": "aps c sensor camera",
    "Full-frame DSLR": "full frame dslr",
    "Medium format digital": "medium format digital",
    "Micro four-thirds camera": "micro four thirds camera",
    Mirrorless: "mirrorless",
  },
];

export const LENSE_DESCRIPTION = [
  {
    title: "Please select CAMERA LENSE.",
    subtitle:
      "It's not recommended to select any particular lens type here as we will generate your images with multiple lens types.",
    fieldName: "lens-type",
  },
  {
    "100mm macro": "100 mm macro",
    "24-70mm zoom": "24 70 mm zoom",
    "35mm prime": "35 mm prime",
    "50mm prime": "50 mm prime",
    "70-200mm zoom": "70 200 mm zoom",
    "85mm prime": "85 mm prime",
    "Telephoto lens": "telephoto lens",
    "Wide-angle lens": "wide angle lens",
  },
];
// export const LENS_FOCAL_LENGTH = [
//   {
//     title: "Please select lens-focal-length.",
//     subtitle:
//       "Numerical values in mm, typically ranging from 24mm to 200mm for portrait photography.",
//     fieldName: "lens-focal-length",
//   },
// ];
export const APERTURE = [
  {
    title: "Please select APERTURE.",
    subtitle:
      "It's not recommended to select any particular aperture value here as we will generate your images with multiple aperture values typically ranging from f/1.4 to f/8 for portrait photography.",
    fieldName: "aperture",
  },
];

export const formSchema = z.object({
  plan: z.enum(["Basic", "Standard", "Premium", "Pro"]),
  gender: z.string().min(2), // Adjust based on your GENDERS data
  profession: z.string().min(2), // Adjust based on your PROFESSIONS data
  images: z.string().min(1, "Please upload at least one image"), // Since you're uploading a zip, validate the signed URL string
  customField: z.string().min(1, "This field is required"),
  age: z.string().min(1, "This field is required"),
  ethnicity: z.string().min(1, "This field is required"),
  "eye-color": z.string().min(1, "This field is required"),
  "hair-color": z.string().min(1, "This field is required"),
  "hair-style": z.string().min(1, "This field is required"),
  "cloth-type": z.string().min(1, "This field is required"),
  "cloth-color": z.string().min(1, "This field is required"),
  grooming: z.string().min(1, "This field is required"),
  background: z.string().min(1, "This field is required"),
  lighting: z.string().min(1, "This field is required"),
  expression: z.string().min(1, "This field is required"),
  "camera-type": z.string().min(1, "This field is required"),
  "lens-type": z.string().min(1, "This field is required"),
  aperture: z.string().min(1, "This field is required"),
});
