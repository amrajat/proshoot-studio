export default function generatePrompts(userInputs) {
  const { gender, age, ethnicity, hairStyle, eyeColor, grooming, ...rest } =
    userInputs;

  const result = [
    // 1
    `4K DSLR quality headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a tailored black blazer over a white collared shirt. Directly looking at the camera with a confident expression. Neutral gray background with a slight gradient for a clean, professional aesthetic. Soft, even lighting highlights the subject's face for a polished look.`,

    `High-resolution professional portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a charcoal suit with a light gray button-up shirt. Directly looking at the camera with a poised and approachable expression. Professional office background with glass walls and subtle decor, slightly out of focus. Bright, natural lighting creates a vibrant and welcoming atmosphere.`,

    `Studio-quality LinkedIn headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a navy blue blazer over a soft pastel shirt. Directly looking at the camera with a warm, professional smile. Modern co-working space background with open seating and large windows, slightly blurred. Bright, airy lighting enhances the fresh and dynamic setting.`,

    `4K resolution corporate portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a deep green jacket over a white turtleneck. Directly looking at the camera with a calm and innovative expression. Clean, modern office background with geometric patterns and natural lighting, slightly blurred. Balanced, diffused lighting creates a sleek and professional tone.`,

    `High-detail headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a light gray blazer over a crisp white shirt. Directly looking at the camera with a composed and confident demeanor. Professional background with a blurred city skyline and large windows. Natural light fills the room, complemented by subtle fill lighting for a well-balanced image.`,

    `Professional DSLR portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a classic black sweater over a light blue collared shirt. Directly looking at the camera with a thoughtful expression. Minimalist office background with clean lines and neutral colors, slightly out of focus. Cool-toned lighting adds depth and clarity to the subject.`,

    `Studio-quality LinkedIn image of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a soft beige blazer over a navy blue shirt. Directly looking at the camera with a friendly and professional demeanor. Bright background with abstract art and soft lighting, creating an inviting and collaborative atmosphere.`,

    `4K resolution headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a tailored dark teal blazer over a pale pink collared shirt. Directly looking at the camera with a professional yet approachable expression. Modern workspace background with large windows and sleek furniture, slightly blurred. Natural lighting enhances the professional and contemporary tone.`,

    `High-quality professional portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a fitted navy blue blazer over a white dress shirt. Directly looking at the camera with a thoughtful and confident expression. Elegant background with subtle textures and neutral tones. Balanced, soft lighting enhances the professional and elegant vibe.`,

    `DSLR quality LinkedIn headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a light gray collared shirt under a dark vest. Directly looking at the camera with an approachable and engaging look. Clean, open-plan office background with soft lighting. Bright, natural light adds a fresh and collaborative feel to the image.`,

    // 2

    `Studio-quality portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a casual yet polished denim jacket over a white t-shirt. Directly looking at the camera with a cheerful, approachable smile. Background features a sunlit park with blurred greenery. Natural sunlight with soft fill for even illumination and a warm tone.`,

    `Professional business portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a dark green blazer paired with a floral-patterned shirt. Directly looking at the camera with a calm and collected expression. Background features a modern coworking space with neutral tones and clean lines. Soft ambient lighting combined with a diffused key light to maintain clarity and depth.`,

    `4K LinkedIn-quality headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a crimson red blouse with gold accents. Directly looking at the camera with a confident, engaging smile. Background is a luxurious hotel lounge with plush furniture and ambient lighting. Warm lighting highlights the subject while maintaining a professional tone.`,

    `High-resolution lifestyle portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a light beige trench coat over a pastel sweater. Directly looking at the camera with a thoughtful, serene expression. Background features a cobblestone street with classic architecture, softly blurred. Natural light with golden hour tones for a soft, romantic atmosphere.`,

    `Studio-quality executive portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a tailored black suit with a crisp white shirt and a burgundy tie. Directly looking at the camera with a determined, no-nonsense expression. Dark, gradient background with a subtle vignette. Dramatic three-point lighting for a bold, high-contrast look.`,

    `Professional creative headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a patterned blazer over a monochromatic shirt. Directly looking at the camera with a playful, innovative smile. Artistic studio background with vibrant splashes of color and textures. Directional lighting with dramatic highlights and shadows for a dynamic, artistic feel.`,

    `LinkedIn portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a fitted white shirt and a navy tie. Directly looking at the camera with a relaxed yet professional expression. Background features a modern high-rise office with city skyline views, softly blurred. Bright, natural lighting with balanced shadows for a clean and polished appearance.`,

    `Casual professional headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a soft plaid shirt under a warm cardigan. Directly looking at the camera with a friendly, welcoming smile. Cozy home office background with bookshelves and warm lighting. Soft, even lighting creates a relaxed, approachable atmosphere.`,

    `Modern corporate portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a tailored gray suit paired with a textured pastel tie. Directly looking at the camera with a poised, confident expression. Background features a minimalist office with sleek furniture and a neutral palette. Even lighting with soft shadows for a contemporary, professional vibe.`,

    `4K studio portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a royal blue blazer with a pocket square. Directly looking at the camera with a warm, charismatic smile. Background is a softly blurred gradient in shades of blue and white. Soft key and fill lighting for a luminous, polished look.`,

    // 3
    `High-resolution portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a navy blue blazer with a white shirt and a subtle silver tie clip. Looking directly at the camera with a confident smile. Background: Modern office lobby with a glass staircase, softly blurred. Lighting: Gentle spotlight with natural window illumination.`,

    `Studio-quality headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a maroon sweater over a white collared shirt. Directly looking at the camera with a relaxed, approachable expression. Background: Abstract colorful gradient in shades of blue and orange. Lighting: Even, soft key light with subtle gradient shadows.`,

    `4K portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a sleek black turtleneck under a tailored gray blazer. Looking directly at the camera with an innovative, forward-thinking gaze. Background: Minimalist tech lab with soft, glowing LED panels. Lighting: Cool, directional lighting with soft rim highlights.`,

    `Professional headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a tailored beige suit with a forest green shirt. Directly looking at the camera with a friendly, approachable smile. Background: Eco-friendly office with living plant walls, slightly out of focus. Lighting: Natural, dappled light as if filtered through leaves, with soft fill light.`,

    `High-quality LinkedIn profile image of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a tailored light gray suit with a pale blue shirt. Directly looking at the camera with a thoughtful, engaged expression. Background: Sleek conference room with modern art pieces, slightly out of focus. Lighting: Natural light combined with soft fill, creating depth and dimension.`,

    `Studio-quality LinkedIn headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing an emerald green blouse with delicate gold jewelry. Directly looking at the camera with a warm, inviting smile. Background: Clean, white studio backdrop with subtle shadows. Lighting: Soft, diffused key light with fill and rim lights for a polished look.`,

    `4K resolution professional portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a light gray tweed jacket over a soft pink shirt. Directly looking at the camera with a contemplative, visionary expression. Background: Startup office with exposed brick walls and modern furniture, slightly out of focus. Lighting: Natural window light mixed with warm interior lighting for a cozy atmosphere.`,

    `High-quality business headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a slate blue suit jacket over a light gray turtleneck. Directly looking at the camera with a determined, forward-thinking expression. Background: Futuristic tech office with holographic displays, softly blurred. Lighting: Cool, blue-tinted lighting with warm accents for a high-tech feel.`,

    `Professional corporate portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a charcoal pinstripe suit with a burgundy tie. Directly looking at the camera with a poised, authoritative expression. Background: Corner office with leather-bound books and a globe, slightly out of focus. Lighting: Soft, even lighting with a subtle hair light for separation.`,

    // 4

    `Studio-quality executive headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a power suit in deep charcoal with subtle pinstripes. Directly looking at the camera with a commanding, self-assured expression. Gradient background from deep gray to black. Dramatic side lighting with a subtle hair light for separation.`,

    `4K DSLR quality LinkedIn profile picture of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a casual-chic outfit with a soft, neutral-toned sweater. Directly looking at the camera with a genuine, relaxed smile. Home office setting with warm, personal touches, slightly blurred. Soft, warm lighting reminiscent of golden hour sunlight.`,

    `High-resolution professional headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a crisp white shirt under a camel-colored blazer. Directly looking at the camera with a warm, trustworthy expression. Tastefully decorated law office with leather-bound books, slightly out of focus. Soft, even lighting with a subtle edge light for depth.`,

    `Studio-quality corporate portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a sophisticated black turtleneck under a tailored blazer. Directly looking at the camera with a focused, visionary expression. Minimalist, high-tech studio setup with subtle blue tones. Dramatic rim lighting with soft fill for a modern, edgy look.`,

    `4K resolution business headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a tailored navy suit with a light blue shirt and textured tie. Directly looking at the camera with a friendly yet professional smile. Modern office lobby with abstract sculptures, slightly blurred. Bright, airy lighting with soft shadows for a fresh, energetic feel.`,

    `High-quality LinkedIn profile image of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a smart-casual outfit with a soft, earth-toned jacket. Directly looking at the camera with an optimistic, forward-looking expression. Outdoor terrace of a modern office building, slightly out of focus. Natural, late afternoon sunlight with a subtle fill for balanced exposure.`,

    `Professional studio headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a classic white button-up shirt with a statement necklace. Directly looking at the camera with a confident, approachable expression. Clean, light gray studio backdrop. Rembrandt lighting setup with soft shadows and a subtle hair light.`,

    `4K DSLR quality corporate portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a well-fitted dark gray suit with a vibrant pocket square. Directly looking at the camera with a subtle, knowing smile. Stylish, modern conference room with glass walls, slightly blurred. Soft, directional lighting with a subtle backlight for separation.`,

    `High-resolution executive headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a power suit in deep burgundy with a contrasting silk scarf. Directly looking at the camera with a poised, authoritative expression. Upscale office with leather furniture and city views, softly blurred. Dramatic side lighting with a subtle fill to maintain detail in shadows.`,

    `Studio-quality LinkedIn profile picture of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a smart-casual outfit with a soft, pastel-colored blazer over a white t-shirt. Directly looking at the camera with a warm, genuine smile. Clean, white backdrop with subtle shadows for depth. Soft, even lighting with a touch of rim light for dimension.`,
  ];

  return result;
}
