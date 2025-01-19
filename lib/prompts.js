export default function generatePrompts(userInputs) {
  const {
    gender,
    age,
    ethnicity,
    hairStyle,
    eyeColor,
    glasses = false,
    ...rest
  } = userInputs;

  const solidBackgrounds = [
    // Basic Plan
    "navy blue",
    "gray",
    "arctic white",
    "black",
    // Standard Plan
    "steel blue",
    "charcoal",

    // Premium Plan
    "pewter gray",
    "midnight blue",
    // Pro Plan
    "gunmetal gray",
    "graphite gray",
  ];
  const greeneryBackgrounds = [
    `a photorealistic professional portrait of JSSPRT, natural and approachable tone, suitable for corporate profiles and LinkedIn. Featuring a poised ${ethnicity} ${gender} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${eyeColor} eyes, ${hairStyle}${
      glasses ? ", wearing glasses" : ""
    }, captured in a sunlit park with blurred greenery in the background. Captured using a Canon EOS R6, 50mm lens, ISO 200, with natural sunlight and soft fill lighting. The subject wears a tailored blazer over a light shirt, exuding confidence and warmth. Realistic skin textures, minimal makeup, and a relaxed yet professional pose. The composition emphasizes natural beauty with a clean, centered focus.`,
    `a vibrant and professional headshot of JSSPRT, colorful yet polished tone, perfect for creative business profiles. Featuring a confident ${ethnicity} ${gender} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${eyeColor} eyes, ${hairStyle}${
      glasses ? ", wearing glasses" : ""
    }, standing in a tulip field with blurred colorful flowers in the background. Captured with a Canon EOS R5, 70mm lens, ISO 320, using soft natural lighting. The subject wears a pastel blazer with a light scarf, balancing professionalism and individuality. Realistic skin textures with soft highlights, minimal makeup, and a warm smile. The composition combines natural beauty with corporate elegance.`,
    `a serene professional portrait of JSSPRT, natural and polished tone, ideal for business branding. Featuring a poised ${ethnicity} ${gender} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${eyeColor} eyes, ${hairStyle}${
      glasses ? ", wearing glasses" : ""
    }, photorealistically captured in a vibrant garden with lush greenery and blooming flowers in the background. Shot with a Canon EOS R3, 50mm lens, ISO 250, with diffused sunlight for soft lighting. The subject wears a tailored navy blazer over a white shirt, radiating confidence. Realistic skin textures, minimal makeup, and a composed, friendly expression. Centered composition highlights professionalism in a natural setting.`,
    `a warm and professional portrait of JSSPRT, approachable and natural tone, suitable for business and personal branding. Featuring a confident ${ethnicity} ${gender} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${eyeColor} eyes, ${hairStyle}${
      glasses ? ", wearing glasses" : ""
    }, standing in a grass field full of dandelions with trees softly blurred in the background. Captured using a Canon 7D, 35mm lens, ISO 200, with natural lighting on a sunny day. The subject wears a smart casual blazer, exuding professionalism and warmth. Realistic skin textures with minimal makeup, a slight smile, and a natural pose. The composition is vibrant and detailed, emphasizing clarity and authenticity.`,
    `a calm and professional headshot of JSSPRT, natural yet polished tone, perfect for eco-conscious or outdoor industry profiles. Featuring a poised ${ethnicity} ${gender} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${eyeColor} eyes, ${hairStyle}${
      glasses ? ", wearing glasses" : ""
    }, standing in a wooded area with blurred vibrant green foliage in the background. Captured using a Sony Alpha 7 IV, 50mm lens, ISO 320, with soft, natural lighting and intricate details. The subject wears a tailored blazer over a light shirt, conveying confidence. Realistic skin textures with minimal makeup, a composed expression, and centered framing enhance professionalism.`,
    `a serene professional portrait of JSSPRT, calm yet confident tone, suitable for eco-conscious or creative professionals. Featuring a poised ${ethnicity} ${gender} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${eyeColor} eyes, ${hairStyle}${
      glasses ? ", wearing glasses" : ""
    }, standing in front of a natural landscape with blurred trees and gentle sunlight filtering through. Captured using a Sony Alpha 7 IV, 50mm lens, ISO 100, during morning light for soft, natural illumination. The subject wears a neutral-toned blazer paired with a light scarf, blending professionalism with individuality. Realistic skin textures enhanced by soft highlights, minimal makeup, and a calm expression. The composition emphasizes harmony between the subject and nature, perfectly centered.`,
    `a captivating, photorealistic image of JSSPRT, vibrant and nostalgic tone, perfect for creative business branding. Featuring a poised ${ethnicity} ${gender} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${eyeColor} eyes, ${hairStyle}${
      glasses ? ", wearing glasses" : ""
    }, posing confidently in a lush green field surrounded by colorful wildflowers. Captured in cinematic quality with a Sony Alpha 7R IV, 50mm lens, ISO 200. The subject wears an elegant blazer that complements the vibrant natural setting, exuding a timeless blend of professionalism and charm. Realistic skin textures, warm lighting, and a centered composition create an impactful and engaging visual tone.`,
  ];

  const officeBackgrounds = [
    `a sleek and professional portrait of JSSPRT, corporate and polished tone, ideal for LinkedIn and executive profiles. Featuring a confident ${ethnicity} ${gender} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${eyeColor} eyes, ${hairStyle}${
      glasses ? ", wearing glasses" : ""
    }, standing in a modern high-rise office with a blurred city skyline in the background. Captured using a Canon EOS R5, 70mm lens, ISO 250, with bright natural lighting and balanced shadows. The subject wears a tailored charcoal suit and white shirt, exuding professionalism. Realistic skin textures with minimal makeup, a composed expression, and clean, centered composition ensure a polished finish.`,

    `a refined professional portrait of JSSPRT, corporate and neutral tone, perfect for business branding. Featuring a poised ${ethnicity} ${gender} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${eyeColor} eyes, ${hairStyle}${
      glasses ? ", wearing glasses" : ""
    }, standing against frosted glass doors subtly blurred in the background. Captured with a Canon EOS R6, 50mm lens, ISO 200, using soft studio lighting. The subject wears a tailored navy blazer with a light blue shirt, radiating confidence. Realistic skin textures with soft highlights, minimal makeup, and a confident pose. The composition balances subject focus with a professional office ambiance.`,

    `a polished and approachable professional portrait of JSSPRT, business-friendly tone, ideal for corporate profiles. Featuring a confident ${ethnicity} ${gender} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${eyeColor} eyes, ${hairStyle}${
      glasses ? ", wearing glasses" : ""
    }, standing in an empty office lobby with minimalist décor and bright lighting. Captured using a Canon 7D mirrorless camera, 85mm lens, ISO 250, with soft directional lighting. The subject wears a tailored suit jacket over a pastel shirt, exuding professionalism. Realistic skin textures with minimal makeup, a warm smile, and a centered composition highlight corporate elegance.`,

    `a sleek professional portrait of JSSPRT, global and business-oriented tone, perfect for high-level corporate branding. Featuring a poised ${ethnicity} ${gender} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${eyeColor} eyes, ${hairStyle}${
      glasses ? ", wearing glasses" : ""
    }, photorealistically captured in a corporate office with large windows and a blurred city skyline in the background. Shot with a Canon EOS R3, 50mm lens, ISO 320, with soft natural lighting. The subject wears a tailored dark gray blazer over a crisp white shirt. Realistic skin textures, minimal makeup, and a composed expression emphasize authority and clarity.`,

    `a warm and professional portrait of JSSPRT, intellectual and polished tone, ideal for consulting and academic profiles. Featuring a confident ${ethnicity} ${gender} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${eyeColor} eyes, ${hairStyle}${
      glasses ? ", wearing glasses" : ""
    }, standing in front of a blurred bookshelf filled with books. Captured with a Canon EOS R5, 50mm lens, ISO 320, with soft, warm lighting. The subject wears a smart blazer over a collared shirt, exuding professionalism and depth. Realistic skin textures with subtle highlights, minimal makeup, and a calm expression. The composition balances focus on the subject with a knowledge-rich ambiance.`,

    `a cinematic-style studio portrait of JSSPRT, vibrant yet professional tone, suitable for LinkedIn and business profiles. Featuring a professional ${ethnicity} ${gender} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${eyeColor} eyes, ${hairStyle}${
      glasses ? ", wearing glasses" : ""
    }, captured with a Canon 7D mirrorless camera, 85mm lens, ISO 400, and a diffused spotlight setup. Half-body portrait with soft bokeh from a modern office background featuring glass windows and desks. The subject wears a tailored navy-blue blazer over a white silk blouse, exuding confidence. Realistic skin textures enhanced subtly with warm tones, natural makeup, and sharp details. Crisp lighting emphasizes facial features with dynamic shadow play, centered composition.`,

    `a vibrant professional portrait of JSSPRT, neutral yet approachable tone, ideal for business branding and LinkedIn profiles. Featuring a photorealistic capture of a confident ${ethnicity} ${gender} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${eyeColor} eyes, ${hairStyle}${
      glasses ? ", wearing glasses" : ""
    }, standing in a bustling urban outdoor setting, with blurred skyscrapers and city streets in the background. Captured using a Canon R5, 70mm lens, ISO 200, with natural lighting during golden hour. The subject wears a sleek gray blazer paired with a pastel shirt. Realistic skin textures with soft highlights, minimal makeup, and a smile conveying approachability. The composition balances subject focus with soft urban ambiance, centered frame.`,

    `a sleek and professional portrait of JSSPRT, corporate and approachable tone, perfect for LinkedIn profiles. Featuring a confident ${ethnicity} ${gender} in ${
      gender === "man" ? "his" : gender === "woman" ? "her" : "their"
    } ${age}, with ${eyeColor} eyes, ${hairStyle}${
      glasses ? ", wearing glasses" : ""
    }, standing in a modern office with floor-to-ceiling windows, a blurred desk, and indoor potted plants in the background. Captured using a Canon EOS R5, 85mm lens, ISO 320, with soft natural lighting. The subject wears a tailored dark blue blazer over a crisp white shirt, exuding confidence and professionalism. Realistic skin textures, minimal makeup, and a poised expression. The composition balances subject focus with a clean, modern office ambiance.`,
  ];

  const result = [
    // Basic Plan
    ...greeneryBackgrounds.slice(0, 3),
    ...officeBackgrounds.slice(0, 3),
    ...solidBackgrounds.slice(0, 4).map((bgColor) => [
      `
    a photorealistic studio portrait of JSSPRT, neutral and professional tone, suitable for various business uses, most popular on Shutterstock, featuring a professional ${ethnicity} ${gender} in ${
        gender === "man" ? "his" : gender === "woman" ? "her" : "their"
      } ${age}, with ${eyeColor} eyes, ${hairStyle}${
        false ? ", wearing glasses" : ""
      }, photorealistic, captured using Canon 7D mirrorless camera, 50mm lens, ISO 250, half body portrait, RAW format, on a plain solid ${bgColor} background, realistic skin textures with minimal makeup, confident pose, soft lighting with soft reflections and shadows, centered composition
  `,
    ]),

    // Standard Plan
    ...greeneryBackgrounds.slice(3, 4),
    ...officeBackgrounds.slice(3, 5),
    ...solidBackgrounds.slice(4, 6).map((bgColor, index) => [
      `
    a photorealistic studio portrait of JSSPRT, neutral and professional tone, suitable for various business uses, most popular on Shutterstock, featuring a professional ${ethnicity} ${gender} in ${
        gender === "man" ? "his" : gender === "woman" ? "her" : "their"
      } ${age}, with ${eyeColor} eyes, ${hairStyle}${
        false ? ", wearing glasses" : ""
      }, photorealistic, captured using Canon 7D mirrorless camera, 50mm lens, ISO 250, half body portrait, RAW format, on a plain solid ${bgColor} background, realistic skin textures with minimal makeup, confident pose, soft lighting with soft reflections and shadows, centered composition
  `,
    ]),

    // Premium Plan
    ...greeneryBackgrounds.slice(4, 5),
    ...officeBackgrounds.slice(5, 7),
    ...solidBackgrounds.slice(6, 8).map((bgColor, index) => [
      `
    a photorealistic studio portrait of JSSPRT, neutral and professional tone, suitable for various business uses, most popular on Shutterstock, featuring a professional ${ethnicity} ${gender} in ${
        gender === "man" ? "his" : gender === "woman" ? "her" : "their"
      } ${age}, with ${eyeColor} eyes, ${hairStyle}${
        false ? ", wearing glasses" : ""
      }, photorealistic, captured using Canon 7D mirrorless camera, 50mm lens, ISO 250, half body portrait, RAW format, on a plain solid ${bgColor} background, realistic skin textures with minimal makeup, confident pose, soft lighting with soft reflections and shadows, centered composition
  `,
    ]),

    // Pro Plan
    ...greeneryBackgrounds.slice(5, 7),
    ...officeBackgrounds.slice(7, 8),
    ...solidBackgrounds.slice(8, 10).map((bgColor, index) => [
      `
    a photorealistic studio portrait of JSSPRT, neutral and professional tone, suitable for various business uses, most popular on Shutterstock, featuring a professional ${ethnicity} ${gender} in ${
        gender === "man" ? "his" : gender === "woman" ? "her" : "their"
      } ${age}, with ${eyeColor} eyes, ${hairStyle}${
        false ? ", wearing glasses" : ""
      }, photorealistic, captured using Canon 7D mirrorless camera, 50mm lens, ISO 250, half body portrait, RAW format, on a plain solid ${bgColor} background, realistic skin textures with minimal makeup, confident pose, soft lighting with soft reflections and shadows, centered composition
  `,
    ]),
  ];

  return result;
}
