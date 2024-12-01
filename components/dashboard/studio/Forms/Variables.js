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
  {
    isRequired: true,
    placeholderText: null,
    helpText: null,
    regexPattern: null,
    radioOptions: true,
    customOption: false,
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
  {
    isRequired: true,
    placeholderText: null,
    helpText: null,
    regexPattern: null,
    radioOptions: true,
    customOption: false,
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
  {
    isRequired: true,
    placeholderText: null,
    helpText:
      "Please make sure you provide text in the style of available options above.",
    regexPattern: null,
    radioOptions: true,
    customOption: true,
  },
];

export const HAIR_STYLES = [
  {
    title: "Please select your hair style.",
    subtitle:
      "Please choose the option that best matches your hair style. If none of the options fit, feel free to enter a custom style.",
    fieldName: "hairStyle",
  },
  {
    "Short cropped black hair": "short cropped black hair",
    "Sleek bob cut, dark brown hair": "sleek bob cut, dark brown hair",
    "Wavy shoulder-length, chestnut brown hair":
      "wavy shoulder-length, chestnut brown hair",
    "Curly short, jet black hair": "curly short, jet black hair",
    "Neatly styled buzz cut, dark brown hair":
      "neatly styled buzz cut, dark brown hair",
    "Straight medium-length, light blonde hair":
      "straight medium-length, light blonde hair",
    "Classic short side-part, light brown hair":
      "classic short side-part, light brown hair",
    "Textured quiff, medium brown hair": "textured quiff, medium brown hair",
    "Long sleek, dark brunette hair": "long sleek, dark brunette hair",
    "Short curly, dark auburn hair": "short curly, dark auburn hair",
    "Straight bob cut, platinum blonde hair":
      "straight bob cut, platinum blonde hair",
    "Close-cropped buzz cut, black hair": "close-cropped buzz cut, black hair",
    "Natural medium-length curls, black hair":
      "natural medium-length curls, black hair",
    "Short undercut, light brown hair": "short undercut, light brown hair",
    "Wavy shoulder-length, auburn hair": "wavy shoulder-length, auburn hair",
    "Textured short, dark blonde hair": "textured short, dark blonde hair",
    "Short curly, medium brown hair": "short curly, medium brown hair",
    "Medium-length straight, black hair": "medium-length straight, black hair",
    "Short cropped silver hair": "short cropped silver hair",
    "Slicked-back, dark brown hair": "slicked-back, dark brown hair",
  },
  {
    isRequired: true,
    placeholderText: null,
    helpText:
      "Please make sure you provide text in the style of available options above..",
    regexPattern: null,
    radioOptions: true,
    customOption: true,
  },
];

export const EYE_COLORS = [
  {
    title: "Please select eye color.",
    subtitle:
      "Please choose the option that best matches your current eye color. If none of the options fit, feel free to enter a custom color.",
    fieldName: "eyeColor",
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
  {
    isRequired: true,
    placeholderText: null,
    helpText:
      "Please make sure you provide text in the style of available options, just provide the name of your eyes color.",

    regexPattern: null,
    radioOptions: true,
    customOption: true,
  },
];

export const GROOMING = [
  {
    title: "Please select your grooming style.",
    subtitle: "If none of the options fit, feel free to enter a custom value.",
    fieldName: "grooming",
  },
  {
    "Clean-shaven": "clean shaven with a smooth, polished look",
    "Full beard": "full, well-maintained beard with sharp edges",
    Goatee: "well-groomed goatee with clean lines",
    "Minimal makeup":
      "minimal makeup, enhancing natural features with subtle application",
    Mustache: "neatly trimmed mustache with a clean and defined shape",
    "Natural makeup": "natural makeup for a fresh and polished appearance",
    "No visible makeup": "no visible makeup for a clean and professional look",
    "Professional makeup":
      "professional makeup with well-defined eyes and subtle contouring",
    "Short beard": "short, neatly trimmed beard with precise lines",
    Stubble: "subtle stubble for a clean yet rugged look",
    "Well-groomed eyebrows":
      "well-groomed eyebrows with a clean and defined shape",
    "Light makeup": "light makeup with a focus on enhancing natural features",
    "Glossy lips with minimal eye makeup":
      "glossy lips paired with minimal eye makeup for a soft, professional look",
    "Bold lipstick with subtle eye makeup":
      "bold lipstick balanced by subtle eye makeup for a confident appearance",
    "Well-defined eyebrows with soft blush":
      "well-defined eyebrows complemented by soft blush for a natural look",
    "Fresh-faced with neutral makeup":
      "fresh-faced with neutral makeup that emphasizes a healthy complexion",
    "No makeup with radiant skin":
      "no makeup for a clean, fresh look with radiant skin",
  },

  {
    isRequired: true,
    placeholderText: null,
    helpText:
      "Please make sure you provide text in the style of available options above..",
    regexPattern: null,
    radioOptions: true,
    customOption: true,
  },
];

export const STUDIO_NAME_SELECTOR = [
  {
    title: "Name your studio anything.",
    subtitle: "Usually it's your name.",
    fieldName: "studioName",
  },
  {
    Normal: "normal",
    Realistic: "realistic",
    UpScaled: "up-scaled",
  },
  {
    isRequired: true,
    placeholderText: "yourname",
    helpText:
      "Just use your first name without any space or any special character.",
    regexPattern: null,
    radioOptions: false,
    customOption: true,
  },
];

export const formSchema = z.object({
  plan: z.enum(["Basic", "Standard", "Premium", "Pro"]),
  gender: z.string().min(3, { message: "Please select your gender." }),
  // profession: z.string().min(3, { message: "Please select your profession." }),
  age: z.string().min(1, { message: "Please select your age range." }),
  ethnicity: z.string().min(1, { message: "Please select your ethnicity." }),
  hairStyle: z.string().min(1, { message: "Please select your hair style." }),
  eyeColor: z.string().min(1, { message: "Please select your eye color." }),
  grooming: z
    .string()
    .min(1, { message: "Please select your grooming style." }),
  // clothing: z.string().nullable().optional(),
  // gazeDirection: z.string().nullable().optional(),
  // expression: z.string().nullable().optional(),
  // background: z.string().nullable().optional(),
  // lighting: z.string().nullable().optional(),
  // cameraType: z.string().nullable().optional(),
  // lensType: z.string().nullable().optional(),
  // aperture: z.string().nullable().optional(),
  images: z
    .string()
    .url({ message: "Please upload images first to create studio." }), // Since you're uploading a zip, validate the signed URL string
  // imageQualityType: z.string().min(1, "Please select image generation mode."),
  studioName: z.string().min(1, "Please enter your studio name."),
});
