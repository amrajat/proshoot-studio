const headshotPrompts = [
  `4K DSLR quality headshot of a TOK ${data.gender}, a ${data.profession} in ${
    data.gender === "man" ? "his" : data.gender === "woman" ? "her" : "their"
  } ${data.age}. ${data.ethnicity} with ${
    data["hair-style"] || "short, neat"
  } ${data["hair-color"]} hair. Wearing a ${
    data["cloth-type"] || "navy blue button-up shirt"
  }. ${data.expression || "Confident and approachable"} expression. ${
    data.background || "Blurred modern office"
  } setting. ${data.lighting || "Soft, diffused lighting"}. Shot with a ${
    data["camera-type"] || "full-frame DSLR"
  }, ${data["lens-type"] || "85mm prime"} at ${data.aperture || "f/2.8"}.`,

  `High-resolution professional portrait of a TOK ${data.gender}, a ${
    data.profession
  } in ${
    data.gender === "man" ? "his" : data.gender === "woman" ? "her" : "their"
  } ${data.age}. ${data.ethnicity} with ${
    data["hair-style"] || "short cropped"
  } ${data["hair-color"]} hair. ${
    data["cloth-type"] || "Charcoal gray suit with a burgundy tie"
  }. ${data.expression || "Trustworthy and knowledgeable"} look. ${
    data.background || "Elegant office interior"
  }, slightly out of focus. ${
    data.lighting || "Rembrandt lighting"
  }. Captured with a ${
    data["camera-type"] || "medium format digital camera"
  }, ${data["lens-type"] || "110mm prime"} at ${data.aperture || "f/4"}.`,

  `Studio-quality LinkedIn headshot of a TOK ${data.gender}, a ${
    data.profession
  } in ${
    data.gender === "man" ? "his" : data.gender === "woman" ? "her" : "their"
  } ${data.age}. ${data.ethnicity} with ${
    data["hair-style"] || "curly, medium-length"
  } ${data["hair-color"]} hair${
    data.grooming ? ` and ${data.grooming}` : ""
  }. Wearing a ${
    data["cloth-type"] || "black turtleneck under a gray blazer"
  }. ${data.expression || "Artistic and confident"} expression. ${
    data.background || "Gradient backdrop from light to dark gray"
  }. ${data.lighting || "Dramatic side lighting"}. Shot with a ${
    data["camera-type"] || "mirrorless camera"
  }, ${data["lens-type"] || "56mm prime"} at ${data.aperture || "f/1.4"}.`,

  `4K resolution corporate portrait of a TOK ${data.gender}, a ${
    data.profession
  } in ${
    data.gender === "man" ? "his" : data.gender === "woman" ? "her" : "their"
  } ${data.age}. ${data.ethnicity} with ${
    data["hair-style"] || "short, styled"
  } ${data["hair-color"]} hair. ${
    data["cloth-type"] ||
    "Tailored navy suit with a light blue shirt and no tie"
  }. ${data.expression || "Authoritative yet approachable"} look. ${
    data.background || "Corner office with city view"
  }, blurred. ${
    data.lighting || "Natural window light with fill"
  }. Captured with a ${data["camera-type"] || "high-end DSLR"}, ${
    data["lens-type"] || "70-200mm zoom"
  } at ${data.aperture || "f/4"}.`,

  `High-detail headshot of a TOK ${data.gender}, a ${data.profession} in ${
    data.gender === "man" ? "his" : data.gender === "woman" ? "her" : "their"
  } ${data.age}. ${data.ethnicity} with ${
    data["hair-style"] || "short, professional"
  } ${data["hair-color"]} hair. Wearing a ${
    data["cloth-type"] || "white coat over a light blue dress shirt"
  }. ${data.expression || "Confident and compassionate"} expression. ${
    data.background || "Clean, minimalist hospital setting"
  }. ${data.lighting || "Soft, even lighting"}. Shot with a ${
    data["camera-type"] || "full-frame mirrorless camera"
  }, ${data["lens-type"] || "35mm prime"} at ${data.aperture || "f/2"}.`,

  `Professional DSLR portrait of a TOK ${data.gender}, a ${
    data.profession
  } in ${
    data.gender === "man" ? "his" : data.gender === "woman" ? "her" : "their"
  } ${data.age}. ${data.ethnicity} with ${
    data["hair-style"] || "wavy, medium-length"
  } ${data["hair-color"]} hair. Wearing a ${
    data["cloth-type"] || "charcoal gray button-up with rolled-up sleeves"
  }. ${data.expression || "Creative and focused"} look. ${
    data.background || "Modern architectural studio"
  } with drafting tables. ${
    data.lighting || "Soft studio lighting with a hair light"
  }. Captured with a ${data["camera-type"] || "full-frame DSLR"}, ${
    data["lens-type"] || "50mm prime"
  } at ${data.aperture || "f/1.8"}.`,

  `Studio-quality LinkedIn image of a TOK ${data.gender}, a ${
    data.profession
  } in ${
    data.gender === "man" ? "his" : data.gender === "woman" ? "her" : "their"
  } ${data.age}. ${data.ethnicity} with ${
    data["hair-style"] || "short, slightly messy"
  } ${data["hair-color"]} hair. ${
    data["cloth-type"] || "Green polo shirt under a khaki field jacket"
  }. ${data.expression || "Passionate and determined"} expression. ${
    data.background || "Blurred forest scene"
  }. ${data.lighting || "Natural, dappled light"} effect. Shot with a ${
    data["camera-type"] || "weather-sealed mirrorless camera"
  }, ${data["lens-type"] || "24-70mm zoom"} at ${data.aperture || "f/5.6"}.`,

  `4K resolution headshot of a TOK ${data.gender}, a ${data.profession} in ${
    data.gender === "man" ? "his" : data.gender === "woman" ? "her" : "their"
  } ${data.age}. ${data.ethnicity} with ${data["hair-style"] || "bald"} head${
    data.grooming ? ` and ${data.grooming}` : ""
  }. Wearing a ${
    data["cloth-type"] || "tweed jacket over a white shirt with a bowtie"
  }. ${data.expression || "Wise and engaging"} look. ${
    data.background || "Warm-toned library or study"
  }. ${data.lighting || "Soft, warm lighting"}. Captured with a ${
    data["camera-type"] || "high-end DSLR"
  }, ${data["lens-type"] || "85mm prime"} at ${data.aperture || "f/2.8"}.`,

  `High-quality professional portrait of a TOK ${data.gender}, a ${
    data.profession
  } in ${
    data.gender === "man" ? "his" : data.gender === "woman" ? "her" : "their"
  } ${data.age}. ${data.ethnicity} with ${
    data["hair-style"] || "medium-length, slightly tousled"
  } ${data["hair-color"]} hair. ${
    data["cloth-type"] ||
    "Navy blue V-neck sweater over a light blue collared shirt"
  }. ${data.expression || "Innovative and friendly"} smile. ${
    data.background || "Modern, open-plan office"
  } with a whiteboard visible. ${
    data.lighting || "Bright, airy natural light"
  }. Shot with a ${data["camera-type"] || "mirrorless camera"}, ${
    data["lens-type"] || "35mm prime"
  } at ${data.aperture || "f/2"}.`,

  `DSLR quality LinkedIn headshot of a TOK ${data.gender}, a ${
    data.profession
  } in ${
    data.gender === "man" ? "his" : data.gender === "woman" ? "her" : "their"
  } ${data.age}. ${data.ethnicity} with ${
    data["hair-style"] || "short, neat"
  } ${data["hair-color"]} hair. Wearing a ${
    data["cloth-type"] || "light blue dress shirt under a white doctor's coat"
  }. ${data.expression || "Warm and trustworthy"} smile. ${
    data.background || "Colorful pediatric office"
  }, out of focus. ${
    data.lighting || "Soft, flattering lighting"
  }. Captured with a ${data["camera-type"] || "full-frame DSLR"}, ${
    data["lens-type"] || "100mm macro"
  } at ${data.aperture || "f/2.8"}.`,

  `Studio-quality portrait of a TOK ${data.gender}, a ${data.profession} in ${
    data.gender === "man" ? "his" : data.gender === "woman" ? "her" : "their"
  } ${data.age}. ${data.ethnicity} with ${
    data["hair-style"] || "short, athletic cut"
  } ${data["hair-color"]} hair. Wearing a ${
    data["cloth-type"] || "fitted black athletic shirt"
  }. ${data.expression || "Energetic and motivating"} expression. ${
    data.background || "Clean, light gray backdrop"
  }. ${
    data.lighting || "High-key lighting"
  } for a bright, fresh look. Shot with a ${
    data["camera-type"] || "mirrorless camera"
  }, ${data["lens-type"] || "56mm prime"} at ${data.aperture || "f/2"}.`,

  `4K resolution headshot of a TOK ${data.gender}, a ${data.profession} in ${
    data.gender === "man" ? "his" : data.gender === "woman" ? "her" : "their"
  } ${data.age}. ${data.ethnicity} with ${
    data["hair-style"] || "short, styled"
  } ${data["hair-color"]} hair. Wearing a ${
    data["cloth-type"] || "white chef's jacket with black buttons"
  }. ${data.expression || "Confident and passionate"} look. ${
    data.background || "Professional kitchen"
  }, slightly blurred. ${
    data.lighting || "Balanced studio lighting"
  }. Captured with a ${data["camera-type"] || "full-frame DSLR"}, ${
    data["lens-type"] || "70-200mm zoom"
  } at ${data.aperture || "f/4"}.`,

  `High-detail professional portrait of a TOK ${data.gender}, a ${
    data.profession
  } in ${
    data.gender === "man" ? "his" : data.gender === "woman" ? "her" : "their"
  } ${data.age}. ${data.ethnicity} with ${
    data["hair-style"] || "short, professional"
  } ${data["hair-color"]} hair. ${
    data["cloth-type"] || "Navy pinstripe suit with a red tie"
  }. ${data.expression || "Confident and assertive"} look. ${
    data.background || "Elegant law office with leather-bound books"
  }. ${data.lighting || "Dramatic three-point lighting"}. Shot with a ${
    data["camera-type"] || "high-end mirrorless camera"
  }, ${data["lens-type"] || "85mm prime"} at ${data.aperture || "f/2.8"}.`,

  `LinkedIn profile image of a TOK ${data.gender}, a ${data.profession} in ${
    data.gender === "man" ? "his" : data.gender === "woman" ? "her" : "their"
  } ${data.age}. ${data.ethnicity} with ${
    data["hair-style"] || "medium-length, textured"
  } ${data["hair-color"]} hair. Wearing a ${
    data["cloth-type"] || "black turtleneck under a gray blazer"
  }. ${data.expression || "Creative and friendly"} smile. ${
    data.background || "Colorful, abstract backdrop"
  }. ${
    data.lighting || "Soft, even lighting with a subtle edge light"
  }. Captured with a ${data["camera-type"] || "mirrorless camera"}, ${
    data["lens-type"] || "35mm prime"
  } at ${data.aperture || "f/1.8"}.`,

  `Studio-quality headshot of a TOK ${data.gender}, a ${data.profession} in ${
    data.gender === "man" ? "his" : data.gender === "woman" ? "her" : "their"
  } ${data.age}. ${data.ethnicity} with ${
    data["hair-style"] || "short, neatly combed"
  } ${data["hair-color"]} hair. ${
    data["cloth-type"] ||
    "Navy blue suit with a light blue shirt and striped tie"
  }. ${data.expression || "Authoritative yet approachable"} look. ${
    data.background || "Blurred newsroom set"
  }. ${data.lighting || "Professional three-point lighting"}. Shot with a ${
    data["camera-type"] || "high-end DSLR"
  }, ${data["lens-type"] || "70-200mm zoom"} at ${data.aperture || "f/5.6"}.`,

  `4K resolution portrait of a TOK ${data.gender}, a ${data.profession} in ${
    data.gender === "man" ? "his" : data.gender === "woman" ? "her" : "their"
  } ${data.age}. ${data.ethnicity} with ${
    data["hair-style"] || "short, professional"
  } ${data["hair-color"]} hair. Wearing a ${
    data["cloth-type"] ||
    "light blue dress shirt with a navy tie and a safety vest"
  }. ${data.expression || "Confident and capable"} look. ${
    data.background || "Construction site"
  }, slightly out of focus. ${
    data.lighting || "Natural outdoor lighting"
  }. Captured with a ${data["camera-type"] || "weather-sealed DSLR"}, ${
    data["lens-type"] || "24-70mm zoom"
  } at ${data.aperture || "f/4"}.`,

  `High-quality LinkedIn headshot of a TOK ${data.gender}, a ${
    data.profession
  } in ${
    data.gender === "man" ? "his" : data.gender === "woman" ? "her" : "their"
  } ${data.age}. ${data.ethnicity} with ${
    data["hair-style"] || "short, neat"
  } ${data["hair-color"]} hair. ${
    data["cloth-type"] || "Teal scrubs under a white coat"
  }. ${data.expression || "Kind and reassuring"} smile. ${
    data.background || "Modern veterinary clinic"
  }, blurred. ${data.lighting || "Soft, flattering lighting"}. Shot with a ${
    data["camera-type"] || "full-frame mirrorless camera"
  }, ${data["lens-type"] || "50mm prime"} at ${data.aperture || "f/2"}.`,

  `Professional studio portrait of a TOK ${data.gender}, a ${
    data.profession
  } in ${
    data.gender === "man" ? "his" : data.gender === "woman" ? "her" : "their"
  } ${data.age}. ${data.ethnicity} with ${data["hair-style"] || "long, wavy"} ${
    data["hair-color"]
  } hair. Wearing a ${
    data["cloth-type"] || "black leather jacket over a vintage band t-shirt"
  }. ${data.expression || "Passionate and charismatic"} look. ${
    data.background || "Dark backdrop with subtle stage lighting effects"
  }. ${data.lighting || "Dramatic side lighting"}. Captured with a ${
    data["camera-type"] || "medium format digital camera"
  }, ${data["lens-type"] || "80mm prime"} at ${data.aperture || "f/2.8"}.`,

  `4K DSLR quality headshot of a TOK ${data.gender}, a ${data.profession} in ${
    data.gender === "man" ? "his" : data.gender === "woman" ? "her" : "their"
  } ${data.age}. ${data.ethnicity} with ${
    data["hair-style"] || "short, neat"
  } ${data["hair-color"]} hair. ${
    data["cloth-type"] || "Light gray dress shirt with a dark blue sweater vest"
  }. ${data.expression || "Intelligent and approachable"} smile. ${
    data.background || "Clean, minimalist office space"
  }. ${data.lighting || "Soft, even lighting"}. Shot with a ${
    data["camera-type"] || "full-frame DSLR"
  }, ${data["lens-type"] || "85mm prime"} at ${data.aperture || "f/2.8"}.`,

  `Studio-quality LinkedIn portrait of a TOK ${data.gender}, a ${
    data.profession
  } in ${
    data.gender === "man" ? "his" : data.gender === "woman" ? "her" : "their"
  } ${data.age}. ${data.ethnicity} with ${
    data["hair-style"] || "short, slightly tousled"
  } ${data["hair-color"]} hair. Wearing a ${
    data["cloth-type"] || "forest green blazer over a white dress shirt, no tie"
  }. ${data.expression || "Passionate and optimistic"} look. ${
    data.background || "Modern office with visible green technology"
  }. ${data.lighting || "Natural-looking, soft lighting"}. Captured with a ${
    data["camera-type"] || "high-end mirrorless camera"
  }, ${data["lens-type"] || "56mm prime"} at ${data.aperture || "f/2"}.`,
];
