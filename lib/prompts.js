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
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a tailored light gray blazer over a soft blue shirt. Directly looking at the camera with a relaxed and confident smile. Softly lit studio background with a gradient from gray to white. High-key lighting for a bright and fresh look, with even illumination across the face for a professional finish.`,

    `4K resolution headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a classic navy blue button-up shirt, neatly pressed. Directly looking at the camera with a candid, natural expression. Professional, clean background with subtle furniture and modern lighting. Soft, diffused lighting to create a clean and crisp look, with minimal shadows for a professional vibe.`,

    `High-detail professional portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a charcoal gray sweater over a crisp white collared shirt. Directly looking at the camera with a determined expression. Modern office environment background with computer desks and clean lines, slightly out of focus. Even, cool-toned lighting to create a modern, sleek look, with soft shadows for a balanced composition.`,

    `LinkedIn profile image of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a dark charcoal suit with a pale gray dress shirt. Directly looking at the camera with an intense, confident look. Newsroom background with professional lighting effects, slightly blurred. Professional three-point lighting to highlight the subject, with soft shadows and a subtle edge light for depth. Captured with a high-end mirrorless camera, 35mm prime at f/1.8.`,

    `Studio-quality headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a light blue dress shirt with a fitted navy vest. Directly looking at the camera with an optimistic expression. Minimalist background with a large window and soft shadows. Natural light streaming through a large window, with a soft fill light to balance the shadows and keep the look clean. Shot with a high-end DSLR camera, 70-200mm zoom at f/5.6.`,

    `4K resolution portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a deep charcoal blazer over a soft cream shirt. Directly looking at the camera with a soft smile. Quiet, elegant background with soft furnishings and gentle lighting. Warm, ambient lighting with soft highlights to create a relaxed, inviting atmosphere with gentle shadows. Captured with a weather-sealed DSLR camera, 24-70mm zoom at f/4.`,

    `High-quality LinkedIn headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a dark blue button-up shirt with a light gray vest. Directly looking at the camera with a composed and assured expression. Spacious background with large windows and distant urban views, slightly out of focus. Bright, natural daylight with soft shadows, highlighting the subject while keeping the background slightly out of focus.`,

    `Professional studio portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing an olive green jacket over a white collared shirt. Directly looking at the camera with a forward-thinking look. Modern tech office background with open spaces and greenery visible. Natural, bright lighting with soft highlights, emphasizing the freshness of the space and giving a modern, eco-friendly feel.`,

    `4K DSLR quality headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a light gray blazer over a soft lavender shirt. Directly looking at the camera with a calm, reassuring look. Quiet lounge area background with soft lighting and neutral tones. Soft, ambient lighting with gentle shadows for a calm, professional tone, with subtle highlights on the subject's face.`,

    `Studio-quality LinkedIn portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a tailored dark navy suit with a white collared shirt. Directly looking at the camera with a poised, authoritative expression. Luxurious office background with dark wood paneling and contemporary design, slightly blurred. Dramatic, warm lighting to create a rich, sophisticated look, with subtle highlights to enhance depth.`,

    // 3

    `4K resolution corporate portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a crisp white dress shirt with a navy blue tie. Directly looking at the camera with a warm, approachable smile. Modern, open-concept office with floor-to-ceiling windows and city views, slightly blurred. Soft, diffused lighting from large windows, creating a bright and airy atmosphere.`,

    `High-quality LinkedIn profile image of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a tailored light gray suit with a pale blue shirt. Directly looking at the camera with a thoughtful, engaged expression. Sleek conference room with modern art pieces, slightly out of focus. Natural light combined with soft fill, creating depth and dimension`,

    `Studio-quality headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a deep teal blazer over a cream-colored blouse. Directly looking at the camera with a confident, friendly expression. Minimalist studio setup with a gradient light gray backdrop. Three-point lighting setup with a soft key light, fill, and rim light for depth.`,

    `4K DSLR quality portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a classic black turtleneck sweater. Directly looking at the camera with a serene, introspective look. Contemporary art gallery with abstract paintings, softly blurred. Dramatic chiaroscuro lighting, creating bold shadows and highlights.`,

    `Professional business headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a charcoal pinstripe suit with a burgundy tie. Directly looking at the camera with a poised, authoritative expression. Corner office with leather-bound books and a globe, slightly out of focus. Soft, even lighting with a subtle hair light for separation.`,

    `High-resolution corporate portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a tailored navy blue suit with a crisp white shirt and patterned pocket square. Directly looking at the camera with a subtle, confident smile. Modern boardroom with glass walls and city skyline views, slightly blurred. Soft, wraparound lighting with a touch of ambient window light.`,

    `Studio-quality LinkedIn headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing an emerald green blouse with delicate gold jewelry. Directly looking at the camera with a warm, inviting smile. Clean, white studio backdrop with subtle shadows. Soft, diffused key light with fill and rim lights for a polished look.`,

    `4K resolution professional portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a light gray tweed jacket over a soft pink shirt. Directly looking at the camera with a contemplative, visionary expression. Startup office with exposed brick walls and modern furniture, slightly out of focus. Natural window light mixed with warm interior lighting for a cozy atmosphere.`,

    `High-quality business headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a slate blue suit jacket over a light gray turtleneck. Directly looking at the camera with a determined, forward-thinking expression. Futuristic tech office with holographic displays, softly blurred. Cool, blue-tinted lighting with warm accents for a high-tech feel.`,

    `Professional corporate portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a tailored beige suit with a forest green shirt. Directly looking at the camera with a friendly, approachable smile. Eco-friendly office with living plant walls, slightly out of focus. Natural, dappled light as if filtered through leaves, with soft fill light.`,

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
