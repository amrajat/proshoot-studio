export default function generatePrompts(userInputs) {
  const { gender, age, ethnicity, hairStyle, eyeColor, grooming, ...rest } =
    userInputs;

  const result = [
    // 1
    `4K DSLR quality headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a tailored charcoal gray blazer over a white collared shirt. Directly looking at the camera with a confident expression. Sleek, modern office background with glass walls and subtle reflections, slightly blurred. Soft, natural lighting coming through large glass windows, with gentle reflections for a polished look.`,

    `High-resolution professional portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a dark navy suit with a light blue dress shirt. Directly looking at the camera with a thoughtful expression. Corporate boardroom background with a long wooden table and minimalist decor. Even, diffused lighting to create a professional and balanced tone, with subtle highlights on the subject's face.`,

    `Studio-quality LinkedIn headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a soft gray button-up shirt with a well-fitted blazer. Directly looking at the camera with an aspirational expression. Bright, airy co-working space background with open desks and large windows, slightly out of focus. Bright, natural daylight streaming through large windows, casting soft shadows for a lively, fresh atmosphere.`,

    `4K resolution corporate portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a deep burgundy sweater over a light gray collared shirt. Directly looking at the camera with a calm, approachable expression. Softly lit, elegant library background with bookshelves slightly blurred. Warm, ambient lighting with gentle shadows, enhancing the cozy and sophisticated atmosphere of the room.`,

    `High-detail headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a classic black suit with a pale blue shirt. Directly looking at the camera with a subtle smile, creating an approachable vibe. Blurred city skyline view from a high-rise office background. Natural outdoor light filtering through the windows, with a subtle fill light to softly illuminate the subject's face.`,

    `Professional DSLR portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a clean, crisp white button-up shirt under a light gray vest. Directly looking at the camera with a focused expression. Minimalist, high-tech workspace background with abstract art on the walls. Cool, diffused lighting to give a clean and modern look, with subtle highlights for depth.`,

    `Studio-quality LinkedIn image of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a slate gray polo shirt under a navy blue blazer. Directly looking at the camera with a friendly expression. Clean, modern workspace background with large tables and soft lighting, slightly out of focus. Bright, airy lighting with soft shadows to complement the open and collaborative atmosphere of the space.`,

    `4K resolution headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a fitted dark blue blazer over a pastel pink collared shirt. Directly looking at the camera with a professional and warm expression. Professional office background with floor-to-ceiling windows and neutral colors. Natural light from large windows, combined with soft fill lighting for a balanced, professional tone.`,

    `High-quality professional portrait of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a dark olive green suit with a light beige dress shirt. Directly looking at the camera with a thoughtful, contemplative expression. Elegant background with a large desk, bookshelves, and modern decor, slightly blurred. Warm, soft lighting to create an inviting, sophisticated look, with subtle shadows for added depth.`,

    `DSLR quality LinkedIn headshot of a JSSPRT ${gender}, ${ethnicity} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${hairStyle} and ${eyeColor} eyes. ${grooming}. Wearing a light gray suit with a soft white shirt. Directly looking at the camera with an engaging and friendly look. Contemporary open-plan office background with collaborative spaces and whiteboards. Bright, natural lighting from overhead windows, casting soft, even light for a dynamic and collaborative feel.`,

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
