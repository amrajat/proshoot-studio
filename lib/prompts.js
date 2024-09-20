export default function generatePrompts(userInputs) {
  const {
    gender,
    profession,
    age,
    ethnicity,
    hairStyle,
    eyeColor,
    grooming,
    clothing,
    gazeDirection,
    expression,
    background,
    lighting,
    cameraType,
    lensType,
    aperture,
    ...rest
  } = userInputs;

  const result = [
    `4K DSLR quality headshot of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "tailored charcoal gray blazer over a white collared shirt"
    }. ${gazeDirection || "directly looking at the camera"} with ${
      expression || "a confident expression"
    }. ${
      background ||
      "a sleek, modern office background with glass walls and subtle reflections, slightly blurred"
    }. ${
      lighting ||
      "soft, natural lighting coming through large glass windows, with gentle reflections for a polished look"
    }. Shot with a ${cameraType || "full frame dslr camera"}, ${
      lensType || "85mm prime"
    } at ${aperture || "f/2.8"}.`,

    `High-resolution professional portrait of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "dark navy suit with a light blue dress shirt, no tie"
    }. ${gazeDirection || "slightly looking off to the side"} with ${
      expression || "a thoughtful expression"
    }. ${
      background ||
      "a corporate boardroom background with a long wooden table and minimalist decor"
    }. ${
      lighting ||
      "even, diffused lighting to create a professional and balanced tone, with subtle highlights on the subject's face"
    }. Captured with a ${cameraType || "medium format digital camera"}, ${
      lensType || "110mm prime"
    } at ${aperture || "f/4"}.`,

    `Studio-quality LinkedIn headshot of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "soft gray button-up shirt with a well-fitted blazer"
    }. ${gazeDirection || "looking slightly upwards"} with ${
      expression || "an aspirational expression"
    }. ${
      background ||
      "a bright, airy co-working space background with open desks and large windows, slightly out of focus"
    }. ${
      lighting ||
      "bright, natural daylight streaming through large windows, casting soft shadows for a lively, fresh atmosphere"
    }. Shot with a ${cameraType || "high end mirrorless camera"}, ${
      lensType || "56mm prime"
    } at ${aperture || "f/1.4"}.`,

    `4K resolution corporate portrait of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "deep burgundy sweater over a light gray collared shirt"
    }. ${gazeDirection || "gazing directly at the camera"} with ${
      expression || "a calm, approachable expression"
    }. ${
      background ||
      "a softly lit, elegant library background with bookshelves slightly blurred"
    }. ${
      lighting ||
      "warm, ambient lighting with gentle shadows, enhancing the cozy and sophisticated atmosphere of the room"
    }. Captured with a ${cameraType || "high end dslr camera camera"}, ${
      lensType || "70-200mm zoom"
    } at ${aperture || "f/4"}.`,

    `High-detail headshot of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "classic black suit with a pale blue shirt"
    }. ${gazeDirection || "directly looking at the camera"} with ${
      expression || "a subtle smile, creating an approachable vibe"
    }. ${
      background ||
      "a blurred city skyline view from a high-rise office background"
    }. ${
      lighting ||
      "natural outdoor light filtering through the windows, with a subtle fill light to softly illuminate the subject's face"
    }. Shot with a ${cameraType || "full frame high end mirrorless camera"}, ${
      lensType || "35mm prime"
    } at ${aperture || "f/2"}.`,

    `Professional DSLR portrait of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "clean, crisp white button-up shirt under a light gray vest"
    }. ${gazeDirection || "looking slightly off-camera"} with ${
      expression || "a focused expression"
    }. ${
      background ||
      "a minimalist, high-tech workspace background with abstract art on the walls"
    }. ${
      lighting ||
      "cool, diffused lighting to give a clean and modern look, with subtle highlights for depth"
    }. Captured with a ${cameraType || "full frame dslr camera"}, ${
      lensType || "50mm prime"
    } at ${aperture || "f/1.8"}.`,

    `Studio-quality LinkedIn image of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "slate gray polo shirt under a navy blue blazer"
    }. ${gazeDirection || "looking confidently at the camera"} with ${
      expression || "a friendly expression"
    }. ${
      background ||
      "a clean, modern workspace background with large tables and soft lighting, slightly out of focus"
    }. ${
      lighting ||
      "bright, airy lighting with soft shadows to complement the open and collaborative atmosphere of the space"
    }. Shot with a ${
      cameraType || "weather sealed high end mirrorless camera"
    }, ${lensType || "24-70mm zoom"} at ${aperture || "f/5.6"}.`,

    `4K resolution headshot of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "fitted dark blue blazer over a pastel pink collared shirt"
    }. ${gazeDirection || "looking directly into the camera"} with ${
      expression || "a professional and warm expression"
    }. ${
      background ||
      "a professional office background with floor-to-ceiling windows and neutral colors"
    }. ${
      lighting ||
      "natural light from large windows, combined with soft fill lighting for a balanced, professional tone"
    }. Captured with a ${cameraType || "high end dslr camera"}, ${
      lensType || "85mm prime"
    } at ${aperture || "f/2.8"}.`,

    `High-quality professional portrait of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "dark olive green suit with a light beige dress shirt"
    }. ${gazeDirection || "gazing slightly to the side"} with ${
      expression || "a thoughtful, contemplative expression"
    }. ${
      background ||
      "an elegant background with a large desk, bookshelves, and modern decor, slightly blurred"
    }. ${
      lighting ||
      "warm, soft lighting to create an inviting, sophisticated look, with subtle shadows for added depth"
    }. Shot with a ${cameraType || "high end mirrorless camera"}, ${
      lensType || "35mm prime"
    } at ${aperture || "f/2"}.`,

    `DSLR quality LinkedIn headshot of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "light gray suit with a soft white shirt"
    }. ${gazeDirection || "directly facing the camera"} with ${
      expression || "an engaging and friendly look"
    }. ${
      background ||
      "a contemporary open-plan office background with collaborative spaces and whiteboards"
    }. ${
      lighting ||
      "bright, natural lighting from overhead windows, casting soft, even light for a dynamic and collaborative feel"
    }. Captured with a ${cameraType || "full frame dslr camera"}, ${
      lensType || "100mm macro"
    } at ${aperture || "f/2.8"}.`,

    `Studio-quality portrait of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "tailored light gray blazer over a soft blue shirt"
    }. ${gazeDirection || "looking directly at the camera"} with ${
      expression || "a relaxed and confident smile"
    }. ${
      background ||
      "a softly lit studio background with a gradient from gray to white"
    }. ${
      lighting ||
      "high-key lighting for a bright and fresh look, with even illumination across the face for a professional finish"
    }. Shot with a ${cameraType || "high end mirrorless camera"}, ${
      lensType || "56mm prime"
    } at ${aperture || "f/2"}.`,

    `4K resolution headshot of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "classic navy blue button-up shirt, neatly pressed"
    }. ${gazeDirection || "gazing slightly off-camera"} with ${
      expression || "a candid, natural expression"
    }. ${
      background ||
      "a professional, clean background with subtle furniture and modern lighting"
    }. ${
      lighting ||
      "soft, diffused lighting to create a clean and crisp look, with minimal shadows for a professional vibe"
    }. Captured with a ${cameraType || "full frame dslr camera"}, ${
      lensType || "70-200mm zoom"
    } at ${aperture || "f/4"}.`,

    `High-detail professional portrait of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "charcoal gray sweater over a crisp white collared shirt"
    }. ${gazeDirection || "directly at the camera"} with ${
      expression || "a determined expression"
    }. ${
      background ||
      "a modern office environment background with computer desks and clean lines, slightly out of focus"
    }. ${
      lighting ||
      "even, cool-toned lighting to create a modern, sleek look, with soft shadows for a balanced composition"
    }. Shot with a ${cameraType || "high end mirrorless camera"}, ${
      lensType || "85mm prime"
    } at ${aperture || "f/2.8"}.`,

    `LinkedIn profile image of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "dark charcoal suit with a pale gray dress shirt"
    }. ${gazeDirection || "looking straight into the camera"} with ${
      expression || "an intense, confident look"
    }. ${
      background ||
      "a newsroom background with professional lighting effects, slightly blurred"
    }. ${
      lighting ||
      "professional three-point lighting to highlight the subject, with soft shadows and a subtle edge light for depth"
    }. Captured with a ${cameraType || "high end mirrorless camera"}, ${
      lensType || "35mm prime"
    } at ${aperture || "f/1.8"}.`,

    `Studio-quality headshot of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "light blue dress shirt with a fitted navy vest"
    }. ${gazeDirection || "gazing slightly upwards"} with ${
      expression || "an optimistic expression"
    }. ${
      background ||
      "a minimalist background with a large window and soft shadows"
    }. ${
      lighting ||
      "natural light streaming through a large window, with a soft fill light to balance the shadows and keep the look clean"
    }. Shot with a ${cameraType || "high end dslr camera"}, ${
      lensType || "70-200mm zoom"
    } at ${aperture || "f/5.6"}.`,

    `4K resolution portrait of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "deep charcoal blazer over a soft cream shirt"
    }. ${gazeDirection || "directly looking at the camera"} with ${
      expression || "a soft smile"
    }. ${
      background ||
      "a quiet, elegant background with soft furnishings and gentle lighting"
    }. ${
      lighting ||
      "warm, ambient lighting with soft highlights to create a relaxed, inviting atmosphere with gentle shadows"
    }. Captured with a ${cameraType || "weather sealed dslr camera"}, ${
      lensType || "24-70mm zoom"
    } at ${aperture || "f/4"}.`,

    `High-quality LinkedIn headshot of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "dark blue button-up shirt with a light gray vest"
    }. ${gazeDirection || "looking directly at the camera"} with ${
      expression || "a composed and assured expression"
    }. ${
      background ||
      "a spacious background with large windows and distant urban views, slightly out of focus"
    }. ${
      lighting ||
      "bright, natural daylight with soft shadows, highlighting the subject while keeping the background slightly out of focus"
    }. Shot with a ${cameraType || "full frame high end mirrorless camera"}, ${
      lensType || "50mm prime"
    } at ${aperture || "f/2"}.`,

    `Professional studio portrait of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "olive green jacket over a white collared shirt"
    }. ${gazeDirection || "slightly gazing off to the side"} with ${
      expression || "a forward-thinking look"
    }. ${
      background ||
      "a modern tech office background with open spaces and greenery visible"
    }. ${
      lighting ||
      "natural, bright lighting with soft highlights, emphasizing the freshness of the space and giving a modern, eco-friendly feel"
    }. Captured with a ${cameraType || "medium format digital camera"}, ${
      lensType || "80mm prime"
    } at ${aperture || "f/2.8"}.`,

    `4K DSLR quality headshot of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "light gray blazer over a soft lavender shirt"
    }. ${gazeDirection || "directly facing the camera"} with ${
      expression || "a calm, reassuring look"
    }. ${
      background ||
      "a quiet lounge area background with soft lighting and neutral tones"
    }. ${
      lighting ||
      "soft, ambient lighting with gentle shadows for a calm, professional tone, with subtle highlights on the subject’s face"
    }. Shot with a ${cameraType || "full frame dslr camera"}, ${
      lensType || "85mm prime"
    } at ${aperture || "f/2.8"}.`,

    `Studio-quality LinkedIn portrait of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "tailored dark navy suit with a white collared shirt"
    }. ${gazeDirection || "looking slightly to the side"} with ${
      expression || "a poised, authoritative expression"
    }. ${
      background ||
      "a luxurious office background with dark wood paneling and contemporary design, slightly blurred"
    }. ${
      lighting ||
      "dramatic, warm lighting to create a rich, sophisticated look, with subtle highlights to enhance depth"
    }. Captured with a ${
      cameraType || "high end high end mirrorless camera"
    }, ${lensType || "56mm prime"} at ${aperture || "f/2"}.`,
    `4K resolution corporate portrait of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "crisp white dress shirt with a navy blue tie"
    }. ${gazeDirection || "looking confidently at the camera"} with ${
      expression || "a warm, approachable smile"
    }. ${
      background ||
      "a modern, open-concept office with floor-to-ceiling windows and city views, slightly blurred"
    }. ${
      lighting ||
      "soft, diffused lighting from large windows, creating a bright and airy atmosphere"
    }. Shot with a ${cameraType || "high end mirrorless camera"}, ${
      lensType || "85mm prime"
    } at ${aperture || "f/2.8"}.`,
    `High-quality LinkedIn profile image of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "tailored light gray suit with a pale blue shirt"
    }. ${gazeDirection || "gazing slightly to the side"} with ${
      expression || "a thoughtful, engaged expression"
    }. ${
      background ||
      "a sleek conference room with modern art pieces, slightly out of focus"
    }. ${
      lighting ||
      "natural light combined with soft fill, creating depth and dimension"
    }. Captured with a ${cameraType || "full frame DSLR"}, ${
      lensType || "70-200mm zoom"
    } at ${aperture || "f/4"}.`,
    `Studio-quality headshot of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "deep teal blazer over a cream-colored blouse"
    }. ${gazeDirection || "looking directly at the camera"} with ${
      expression || "a confident, friendly expression"
    }. ${
      background ||
      "a minimalist studio setup with a gradient light gray backdrop"
    }. ${
      lighting ||
      "three-point lighting setup with a soft key light, fill, and rim light for depth"
    }. Shot with a ${cameraType || "medium format digital camera"}, ${
      lensType || "100mm macro"
    } at ${aperture || "f/5.6"}.`,
    `4K DSLR quality portrait of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "classic black turtleneck sweater"
    }. ${gazeDirection || "glancing slightly upward"} with ${
      expression || "a serene, introspective look"
    }. ${
      background ||
      "a contemporary art gallery with abstract paintings, softly blurred"
    }. ${
      lighting ||
      "dramatic chiaroscuro lighting, creating bold shadows and highlights"
    }. Captured with a ${cameraType || "high end DSLR camera"}, ${
      lensType || "50mm prime"
    } at ${aperture || "f/1.8"}.`,
    `Professional business headshot of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "charcoal pinstripe suit with a burgundy tie"
    }. ${gazeDirection || "looking straight at the camera"} with ${
      expression || "a poised, authoritative expression"
    }. ${
      background ||
      "a corner office with leather-bound books and a globe, slightly out of focus"
    }. ${
      lighting || "soft, even lighting with a subtle hair light for separation"
    }. Shot with a ${cameraType || "full frame mirrorless camera"}, ${
      lensType || "35mm prime"
    } at ${aperture || "f/2"}.`,
    `High-resolution corporate portrait of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing ||
      "tailored navy blue suit with a crisp white shirt and patterned pocket square"
    }. ${gazeDirection || "looking slightly off-camera"} with ${
      expression || "a subtle, confident smile"
    }. ${
      background ||
      "a modern boardroom with glass walls and city skyline views, slightly blurred"
    }. ${
      lighting ||
      "soft, wraparound lighting with a touch of ambient window light"
    }. Captured with a ${cameraType || "high end DSLR"}, ${
      lensType || "24-70mm zoom"
    } at ${aperture || "f/4"}.`,
    `Studio-quality LinkedIn headshot of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "emerald green blouse with delicate gold jewelry"
    }. ${gazeDirection || "looking directly at the camera"} with ${
      expression || "a warm, inviting smile"
    }. ${background || "a clean, white studio backdrop with subtle shadows"}. ${
      lighting ||
      "soft, diffused key light with fill and rim lights for a polished look"
    }. Shot with a ${cameraType || "medium format digital camera"}, ${
      lensType || "80mm prime"
    } at ${aperture || "f/4"}.`,
    `4K resolution professional portrait of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "light gray tweed jacket over a soft pink shirt"
    }. ${gazeDirection || "gazing thoughtfully to the side"} with ${
      expression || "a contemplative, visionary expression"
    }. ${
      background ||
      "a startup office with exposed brick walls and modern furniture, slightly out of focus"
    }. ${
      lighting ||
      "natural window light mixed with warm interior lighting for a cozy atmosphere"
    }. Captured with a ${cameraType || "high end mirrorless camera"}, ${
      lensType || "56mm prime"
    } at ${aperture || "f/2"}.`,
    `High-quality business headshot of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "slate blue suit jacket over a light gray turtleneck"
    }. ${gazeDirection || "looking slightly up and to the side"} with ${
      expression || "a determined, forward-thinking expression"
    }. ${
      background ||
      "a futuristic tech office with holographic displays, softly blurred"
    }. ${
      lighting ||
      "cool, blue-tinted lighting with warm accents for a high-tech feel"
    }. Shot with a ${cameraType || "full frame DSLR"}, ${
      lensType || "85mm prime"
    } at ${aperture || "f/2.8"}.`,
    `Professional corporate portrait of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "tailored beige suit with a forest green shirt"
    }. ${gazeDirection || "looking directly at the camera"} with ${
      expression || "a friendly, approachable smile"
    }. ${
      background ||
      "an eco-friendly office with living plant walls, slightly out of focus"
    }. ${
      lighting ||
      "natural, dappled light as if filtered through leaves, with soft fill light"
    }. Captured with a ${cameraType || "high end mirrorless camera"}, ${
      lensType || "35mm prime"
    } at ${aperture || "f/2.8"}.`,
    `Studio-quality executive headshot of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "power suit in deep charcoal with subtle pinstripes"
    }. ${gazeDirection || "looking confidently past the camera"} with ${
      expression || "a commanding, self-assured expression"
    }. ${background || "a gradient background from deep gray to black"}. ${
      lighting ||
      "dramatic side lighting with a subtle hair light for separation"
    }. Shot with a ${cameraType || "medium format digital camera"}, ${
      lensType || "110mm prime"
    } at ${aperture || "f/4"}.`,
    `4K DSLR quality LinkedIn profile picture of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "casual-chic outfit with a soft, neutral-toned sweater"
    }. ${
      gazeDirection || "looking slightly off-camera with a gentle head tilt"
    } with ${expression || "a genuine, relaxed smile"}. ${
      background ||
      "a home office setting with warm, personal touches, slightly blurred"
    }. ${
      lighting || "soft, warm lighting reminiscent of golden hour sunlight"
    }. Captured with a ${cameraType || "full frame mirrorless camera"}, ${
      lensType || "50mm prime"
    } at ${aperture || "f/2"}.`,
    `High-resolution professional headshot of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "crisp white shirt under a camel-colored blazer"
    }. ${gazeDirection || "looking directly at the camera"} with ${
      expression || "a warm, trustworthy expression"
    }. ${
      background ||
      "a tastefully decorated law office with leather-bound books, slightly out of focus"
    }. ${
      lighting || "soft, even lighting with a subtle edge light for depth"
    }. Shot with a ${cameraType || "high end DSLR"}, ${
      lensType || "70-200mm zoom"
    } at ${aperture || "f/4"}.`,
    `Studio-quality corporate portrait of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "sophisticated black turtleneck under a tailored blazer"
    }. ${gazeDirection || "looking thoughtfully to the side"} with ${
      expression || "a focused, visionary expression"
    }. ${
      background ||
      "a minimalist, high-tech studio setup with subtle blue tones"
    }. ${
      lighting || "dramatic rim lighting with soft fill for a modern, edgy look"
    }. Captured with a ${cameraType || "medium format digital camera"}, ${
      lensType || "80mm prime"
    } at ${aperture || "f/2.8"}.`,
    `4K resolution business headshot of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "tailored navy suit with a light blue shirt and textured tie"
    }. ${gazeDirection || "looking confidently at the camera"} with ${
      expression || "a friendly yet professional smile"
    }. ${
      background ||
      "a modern office lobby with abstract sculptures, slightly blurred"
    }. ${
      lighting ||
      "bright, airy lighting with soft shadows for a fresh, energetic feel"
    }. Shot with a ${cameraType || "high end mirrorless camera"}, ${
      lensType || "35mm prime"
    } at ${aperture || "f/2.8"}.`,
    `High-quality LinkedIn profile image of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "smart-casual outfit with a soft, earth-toned jacket"
    }. ${gazeDirection || "looking slightly up and to the side"} with ${
      expression || "an optimistic, forward-looking expression"
    }. ${
      background ||
      "an outdoor terrace of a modern office building, slightly out of focus"
    }. ${
      lighting ||
      "natural, late afternoon sunlight with a subtle fill for balanced exposure"
    }. Captured with a ${cameraType || "full frame DSLR"}, ${
      lensType || "85mm prime"
    } at ${aperture || "f/2"}.`,
    `Professional studio headshot of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "classic white button-up shirt with a statement necklace"
    }. ${gazeDirection || "looking directly at the camera"} with ${
      expression || "a confident, approachable expression"
    }. ${background || "a clean, light gray studio backdrop"}. ${
      lighting ||
      "Rembrandt lighting setup with soft shadows and a subtle hair light"
    }. Shot with a ${cameraType || "medium format digital camera"}, ${
      lensType || "100mm macro"
    } at ${aperture || "f/5.6"}.`,
    `4K DSLR quality corporate portrait of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "well-fitted dark gray suit with a vibrant pocket square"
    }. ${gazeDirection || "looking slightly to the side"} with ${
      expression || "a subtle, knowing smile"
    }. ${
      background ||
      "a stylish, modern conference room with glass walls, slightly blurred"
    }. ${
      lighting ||
      "soft, directional lighting with a subtle backlight for separation"
    }. Captured with a ${cameraType || "high end DSLR"}, ${
      lensType || "24-70mm zoom"
    } at ${aperture || "f/4"}.`,
    `High-resolution executive headshot of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing || "power suit in deep burgundy with a contrasting silk scarf"
    }. ${gazeDirection || "looking confidently past the camera"} with ${
      expression || "a poised, authoritative expression"
    }. ${
      background ||
      "an upscale office with leather furniture and city views, softly blurred"
    }. ${
      lighting ||
      "dramatic side lighting with a subtle fill to maintain detail in shadows"
    }. Shot with a ${cameraType || "full frame mirrorless camera"}, ${
      lensType || "50mm prime"
    } at ${aperture || "f/2"}.`,
    `Studio-quality LinkedIn profile picture of a TOK ${gender}, a ${profession} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, ${ethnicity} with ${hairStyle} and ${eyeColor} eyes, ${grooming}, wearing a ${
      clothing ||
      "smart-casual outfit with a soft, pastel-colored blazer over a white t-shirt"
    }. ${
      gazeDirection || "looking directly at the camera with a slight head tilt"
    } with ${expression || "a warm, genuine smile"}. ${
      background || "a clean, white backdrop with subtle shadows for depth"
    }. ${
      lighting || "soft, even lighting with a touch of rim light for dimension"
    }. Captured with a ${cameraType || "full frame DSLR"}, ${
      lensType || "85mm prime"
    } at ${aperture || "f/2"}.`,
  ];
  return result;
}
