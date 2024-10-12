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

export const PROFESSIONS = [
  {
    title: "Please select profession.",
    subtitle:
      "Please choose the option that matches your profession. If you don't see a suitable option, feel free to enter a custom profession.",
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
  {
    isRequired: true,
    placeholderText: null,
    helpText:
      "Please make sure you provide text in the style of available options, just provide the name of your profession.",
    regexPattern: null,
    radioOptions: true,
    customOption: true,
  },
];

export const CLOTHINGS = [
  {
    title: "Please select clothing style and color.",
    subtitle:
      "If none of the options suit your preferences, you are welcome to input a custom value for your desired clothing. Alternatively, we will provide images featuring a variety of clothing options.",
    fieldName: "clothing",
  },
  {
    "tailored charcoal gray blazer over a white collared shirt":
      "tailored charcoal gray blazer over a white collared shirt",
    "dark navy suit with a light blue dress shirt, no tie":
      "dark navy suit with a light blue dress shirt, no tie",
    "soft gray button-up shirt with a well-fitted blazer":
      "soft gray button-up shirt with a well-fitted blazer",
    "deep burgundy sweater over a light gray collared shirt":
      "deep burgundy sweater over a light gray collared shirt",
    "classic black suit with a pale blue shirt":
      "classic black suit with a pale blue shirt",
    "clean, crisp white button-up shirt under a light gray vest":
      "clean, crisp white button-up shirt under a light gray vest",
    "slate gray polo shirt under a navy blue blazer":
      "slate gray polo shirt under a navy blue blazer",
    "fitted dark blue blazer over a pastel pink collared shirt":
      "fitted dark blue blazer over a pastel pink collared shirt",
    "dark olive green suit with a light beige dress shirt":
      "dark olive green suit with a light beige dress shirt",
    "light gray suit with a soft white shirt":
      "light gray suit with a soft white shirt",
    "tailored light gray blazer over a soft blue shirt":
      "tailored light gray blazer over a soft blue shirt",
    "classic navy blue button-up shirt, neatly pressed":
      "classic navy blue button-up shirt, neatly pressed",
    "charcoal gray sweater over a crisp white collared shirt":
      "charcoal gray sweater over a crisp white collared shirt",
    "dark charcoal suit with a pale gray dress shirt":
      "dark charcoal suit with a pale gray dress shirt",
    "light blue dress shirt with a fitted navy vest":
      "light blue dress shirt with a fitted navy vest",
    "deep charcoal blazer over a soft cream shirt":
      "deep charcoal blazer over a soft cream shirt",
    "dark blue button-up shirt with a light gray vest":
      "dark blue button-up shirt with a light gray vest",
    "olive green jacket over a white collared shirt":
      "olive green jacket over a white collared shirt",
    "light gray blazer over a soft lavender shirt":
      "light gray blazer over a soft lavender shirt",
    "tailored dark navy suit with a white collared shirt":
      "tailored dark navy suit with a white collared shirt",
  },
  {
    isRequired: false,
    placeholderText: null,
    helpText:
      "Please make sure you provide text in the style of available options above..",
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

export const GAZE_DIRECTIONS = [
  {
    title: "Please select gaze direction.",
    subtitle:
      "Please refrain from selecting any options or entering custom values as we will create your images using a range of gaze direction variations provided below.",
    fieldName: "gazeDirection",
  },
  {
    "directly looking at the camera": "directly looking at the camera",
    "slightly looking off to the side": "slightly looking off to the side",
    "looking slightly upwards": "looking slightly upwards",
    "gazing directly at the camera": "gazing directly at the camera",
    "looking slightly off-camera": "looking slightly off-camera",
    "looking confidently at the camera": "looking confidently at the camera",
    "looking directly into the camera": "looking directly into the camera",
    "gazing slightly to the side": "gazing slightly to the side",
    "gazing slightly off-camera": "gazing slightly off-camera",
    "looking straight into the camera": "looking straight into the camera",
    "gazing slightly upwards": "gazing slightly upwards",
    "looking directly at the camera": "looking directly at the camera",
    "slightly gazing off to the side": "slightly gazing off to the side",
    "directly facing the camera": "directly facing the camera",
    "looking slightly to the side": "looking slightly to the side",
  },
  {
    isRequired: false,
    placeholderText: null,
    helpText: null,
    regexPattern: null,
    radioOptions: true,
    customOption: false,
  },
];

export const BACKGROUNDS = [
  {
    title: "Please select background for your images.",
    subtitle:
      "Please refrain from selecting any options or entering custom values as we will create your images using a range of background variations provided below.",
    fieldName: "background",
  },
  {
    "Sleek modern office":
      "a sleek, modern office background with glass walls and subtle reflections, slightly blurred",
    "Corporate boardroom":
      "a corporate boardroom background with a long wooden table and minimalist decor",
    "Bright co-working space":
      "a bright, airy co-working space background with open desks and large windows, slightly out of focus",
    "Elegant library":
      "a softly lit, elegant library background with bookshelves slightly blurred",
    "Blurred city skyline":
      "a blurred city skyline view from a high-rise office background",
    "Minimalist high-tech workspace":
      "a minimalist, high-tech workspace background with abstract art on the walls",
    "Modern workspace":
      "a clean, modern workspace background with large tables and soft lighting, slightly out of focus",
    "Professional office with windows":
      "a professional office background with floor-to-ceiling windows and neutral colors",
    "Elegant office with desk and books":
      "an elegant background with a large desk, bookshelves, and modern decor, slightly blurred",
    "Open-plan office":
      "a contemporary open-plan office background with collaborative spaces and whiteboards",
    "Softly lit studio":
      "a softly lit studio background with a gradient from gray to white",
    "Clean professional space":
      "a professional, clean background with subtle furniture and modern lighting",
    "Modern office with computers":
      "a modern office environment background with computer desks and clean lines, slightly out of focus",
    "Newsroom background":
      "a newsroom background with professional lighting effects, slightly blurred",
    "Minimalist with window":
      "a minimalist background with a large window and soft shadows",
    "Quiet elegant lounge":
      "a quiet, elegant background with soft furnishings and gentle lighting",
    "Spacious office with urban view":
      "a spacious background with large windows and distant urban views, slightly out of focus",
    "Modern tech office with greenery":
      "a modern tech office background with open spaces and greenery visible",
    "Quiet lounge area":
      "a quiet lounge area background with soft lighting and neutral tones",
    "Luxurious office with dark wood":
      "a luxurious office background with dark wood paneling and contemporary design, slightly blurred",
  },
  {
    isRequired: false,
    placeholderText: null,
    helpText:
      "Please make sure you provide text in the style of available options above..",
    regexPattern: null,
    radioOptions: true,
    customOption: true,
  },
];

export const LIGHTINGS = [
  {
    title: "Please select lightings for your images.",
    subtitle:
      "Please refrain from selecting any options or entering custom values as we will create your images using a range of lighting variations provided below.",
    fieldName: "lighting",
  },
  {
    "soft, natural lighting coming through large glass windows, with gentle reflections for a polished look.":
      "soft, natural lighting coming through large glass windows, with gentle reflections for a polished look.",
    "even, diffused lighting to create a professional and balanced tone, with subtle highlights on the subject's face.":
      "even, diffused lighting to create a professional and balanced tone, with subtle highlights on the subject's face.",
    "bright, natural daylight streaming through large windows, casting soft shadows for a lively, fresh atmosphere.":
      "bright, natural daylight streaming through large windows, casting soft shadows for a lively, fresh atmosphere.",
    "warm, ambient lighting with gentle shadows, enhancing the cozy and sophisticated atmosphere of the room.":
      "warm, ambient lighting with gentle shadows, enhancing the cozy and sophisticated atmosphere of the room.",
    "natural outdoor light filtering through the windows, with a subtle fill light to softly illuminate the subject's face.":
      "natural outdoor light filtering through the windows, with a subtle fill light to softly illuminate the subject's face.",
    "cool, diffused lighting to give a clean and modern look, with subtle highlights for depth.":
      "cool, diffused lighting to give a clean and modern look, with subtle highlights for depth.",
    "bright, airy lighting with soft shadows to complement the open and collaborative atmosphere of the space.":
      "bright, airy lighting with soft shadows to complement the open and collaborative atmosphere of the space.",
    "natural light from large windows, combined with soft fill lighting for a balanced, professional tone.":
      "natural light from large windows, combined with soft fill lighting for a balanced, professional tone.",
    "warm, soft lighting to create an inviting, sophisticated look, with subtle shadows for added depth.":
      "warm, soft lighting to create an inviting, sophisticated look, with subtle shadows for added depth.",
    "bright, natural lighting from overhead windows, casting soft, even light for a dynamic and collaborative feel.":
      "bright, natural lighting from overhead windows, casting soft, even light for a dynamic and collaborative feel.",
    "high-key lighting for a bright and fresh look, with even illumination across the face for a professional finish.":
      "high-key lighting for a bright and fresh look, with even illumination across the face for a professional finish.",
    "soft, diffused lighting to create a clean and crisp look, with minimal shadows for a professional vibe.":
      "soft, diffused lighting to create a clean and crisp look, with minimal shadows for a professional vibe.",
    "even, cool-toned lighting to create a modern, sleek look, with soft shadows for a balanced composition.":
      "even, cool-toned lighting to create a modern, sleek look, with soft shadows for a balanced composition.",
    "professional three-point lighting to highlight the subject, with soft shadows and a subtle edge light for depth.":
      "professional three-point lighting to highlight the subject, with soft shadows and a subtle edge light for depth.",
    "natural light streaming through a large window, with a soft fill light to balance the shadows and keep the look clean.":
      "natural light streaming through a large window, with a soft fill light to balance the shadows and keep the look clean.",
    "warm, ambient lighting with soft highlights to create a relaxed, inviting atmosphere with gentle shadows.":
      "warm, ambient lighting with soft highlights to create a relaxed, inviting atmosphere with gentle shadows.",
    "bright, natural daylight with soft shadows, highlighting the subject while keeping the background slightly out of focus.":
      "bright, natural daylight with soft shadows, highlighting the subject while keeping the background slightly out of focus.",
    "natural, bright lighting with soft highlights, emphasizing the freshness of the space and giving a modern, eco-friendly feel.":
      "natural, bright lighting with soft highlights, emphasizing the freshness of the space and giving a modern, eco-friendly feel.",
    "soft, ambient lighting with gentle shadows for a calm, professional tone, with subtle highlights on the subject’s face.":
      "soft, ambient lighting with gentle shadows for a calm, professional tone, with subtle highlights on the subject’s face.",
    "dramatic, warm lighting to create a rich, sophisticated look, with subtle highlights to enhance depth.":
      "dramatic, warm lighting to create a rich, sophisticated look, with subtle highlights to enhance depth.",
  },
  {
    isRequired: false,
    placeholderText: null,
    helpText:
      "Please make sure you provide text in the style of available options above.",
    regexPattern: null,
    radioOptions: true,
    customOption: true,
  },
];

export const EXPRESSIONS = [
  {
    title: "Please select your face expressions.",
    subtitle:
      "Please refrain from selecting any options or entering custom values as we will create your images using a range of expression variations provided below.",
    fieldName: "expression",
  },
  {
    "a confident expression": "a confident expression",
    "a thoughtful expression": "a thoughtful expression",
    "an aspirational expression": "an aspirational expression",
    "a calm, approachable expression": "a calm, approachable expression",
    "a subtle smile, creating an approachable vibe":
      "a subtle smile, creating an approachable vibe",
    "a focused expression": "a focused expression",
    "a friendly expression": "a friendly expression",
    "a professional and warm expression": "a professional and warm expression",
    "a thoughtful, contemplative expression":
      "a thoughtful, contemplative expression",
    "an engaging and friendly look": "an engaging and friendly look",
    "a relaxed and confident smile": "a relaxed and confident smile",
    "a candid, natural expression": "a candid, natural expression",
    "a determined expression": "a determined expression",
    "an intense, confident look": "an intense, confident look",
    "an optimistic expression": "an optimistic expression",
    "a soft smile": "a soft smile",
    "a composed and assured expression": "a composed and assured expression",
    "a forward-thinking look": "a forward-thinking look",
    "a calm, reassuring look": "a calm, reassuring look",
    "a poised, authoritative expression": "a poised, authoritative expression",
  },
  {
    isRequired: false,
    placeholderText: null,
    helpText:
      "Please make sure you provide text in the style of available options above.",
    regexPattern: null,
    radioOptions: true,
    customOption: true,
  },
];

export const CAMERA_TYPE = [
  {
    title: "Please select camera type.",
    subtitle:
      "Please refrain from selecting any options or entering custom values as we will create your images using a range of camera type variations provided below.",
    fieldName: "cameraType",
  },
  {
    "Full-frame DSLR": "full frame dslr camera",
    "Medium format digital camera": "medium format digital camera",
    "Mirrorless camera": "mirrorless camera",
    "4K resolution digital camera": "4K resolution digital camera",
  },
  {
    isRequired: false,
    placeholderText: null,
    helpText:
      "Please make sure you provide text in the style of available options above.",
    regexPattern: null,
    radioOptions: true,
    customOption: true,
  },
];

export const CAMERA_LENSES = [
  {
    title: "Please select camera lens.",
    subtitle:
      "Please refrain from selecting any options or entering custom values as we will create your images using a range of camera lens variations provided below.",
    fieldName: "lensType",
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
  {
    isRequired: false,
    placeholderText: null,
    helpText:
      "Please make sure you provide text in the style of available options above.",
    regexPattern: null,
    radioOptions: true,
    customOption: true,
  },
];

export const APERTURE = [
  {
    title: "Please select aperture.",
    subtitle:
      "It's important not to set a specific aperture value here, as we will use a range of aperture values, typically from f/1.4 to f/8, to capture stunning portrait photographs.",
    fieldName: "aperture",
  },
  {
    "f/1.4": "f/1.4",
    "f/1.8": "f/1.8",
    "f/2": "f/2",
    "f/2.8": "f/2.8",
    "f/4": "f/4",
    "f/5.6": "f/5.6",
    "f/8": "f/8",
  },
  {
    isRequired: false,
    placeholderText: null,
    helpText:
      "Please make sure you provide text in the style of available options above.",
    regexPattern: null,
    radioOptions: true,
    customOption: true,
  },
];

export const IMAGE_QUALITY_TYPE = [
  {
    title: "Please select the quality of images.",
    subtitle:
      "In normal mode, we will fine-tune your images and generate images as they are. In realistic mode, we add some noise to images after generation to make them look ultra-realistic. In upscale mode, we use the latest AI technology to upscale the image, making it look clear and sharp while increasing resolutions by compromising the likeness. We recommend using the realistic or normal mode, but feel free to choose any option you prefer.",
    fieldName: "imageQualityType",
  },
  {
    Normal: "normal",
    Realistic: "realistic",
    UpScaled: "up-scaled",
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
    placeholderText: "elonmusk2",
    helpText:
      "Just use your first name without any space or any special character.",
    regexPattern: null,
    radioOptions: false,
    customOption: true,
  },
];

export const formSchema = z.object({
  plan: z.enum(["Basic", "Standard", "Premium", "Pro"]),
  gender: z.string().min(3, { message: "Please select your gender." }), // Adjust based on your GENDERS data
  profession: z.string().min(3, { message: "Please select your profession." }), // Adjust based on your PROFESSIONS data
  age: z.string().min(1, { message: "Please select your age range." }),
  ethnicity: z.string().min(1, { message: "Please select your ethnicity." }),
  hairStyle: z.string().min(1, { message: "Please select your hair style." }),
  eyeColor: z.string().min(1, { message: "Please select your eye color." }),
  grooming: z
    .string()
    .min(1, { message: "Please select your grooming style." }),
  clothing: z.string().nullable().optional(),
  gazeDirection: z.string().nullable().optional(),
  expression: z.string().nullable().optional(),
  background: z.string().nullable().optional(),
  lighting: z.string().nullable().optional(),
  cameraType: z.string().nullable().optional(),
  lensType: z.string().nullable().optional(),
  aperture: z.string().nullable().optional(),
  images: z.string().url({ message: "Please upload images." }), // Since you're uploading a zip, validate the signed URL string
  imageQualityType: z.string().min(1, "Please select image generation mode."),
  studioName: z.string().min(1, "Please enter your studio name."),
});
