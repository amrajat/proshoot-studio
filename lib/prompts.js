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
      cameraType || "high-end high end mirrorless camera"
    }, ${lensType || "56mm prime"} at ${aperture || "f/2"}.`,
  ];
  return result;
}
