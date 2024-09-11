export default function generatePrompts(data) {
  const result = [
    `4K DSLR quality headshot of a TOK ${data.gender} ${data.profession} in ${
      data.gender === "non-binary"
        ? "their"
        : data.gender === "female"
        ? "her"
        : "his"
    } ${data.age}. ${data.ethnicity} with ${data["hair-style"]} ${
      data["hair-color"]
    } hair and ${data["eye-color"]} eyes. Wearing a ${data["cloth-color"]} ${
      data["cloth-type"]
    }. ${data.expression} expression. ${data.background} background setting. ${
      data.lighting
    }. Shot with a ${data["camera-type"] || "full-frame DSLR"}, ${
      data["lens-type"] || "85mm prime"
    } at ${data.aperture || "f/2.8"}.`,

    `High-resolution professional portrait of a TOK ${data.gender} ${
      data.profession
    } in ${
      data.gender === "non-binary"
        ? "their"
        : data.gender === "female"
        ? "her"
        : "his"
    } ${data.age}. ${data.ethnicity} with ${data["hair-style"]} ${
      data["hair-color"]
    } hair. ${data["cloth-type"]} in ${data["cloth-color"]}. ${
      data.expression
    } look. ${data.background} background, slightly out of focus. ${
      data.lighting
    }. Captured with a ${
      data["camera-type"] || "medium format digital camera"
    }, ${data["lens-type"] || "110mm prime"} at ${data.aperture || "f/4"}.`,

    `Studio-quality LinkedIn headshot of a TOK ${data.gender} ${
      data.profession
    } in ${
      data.gender === "non-binary"
        ? "their"
        : data.gender === "female"
        ? "her"
        : "his"
    } ${data.age}. ${data.ethnicity} with ${data["hair-style"]} ${
      data["hair-color"]
    } hair, ${data.grooming}. Wearing a ${data["cloth-color"]} ${
      data["cloth-type"]
    }. ${data.expression} expression. ${data.background} background. ${
      data.lighting
    }. Shot with a ${data["camera-type"] || "mirrorless camera"}, ${
      data["lens-type"] || "56mm prime"
    } at ${data.aperture || "f/1.4"}.`,

    `4K resolution corporate portrait of a TOK ${data.gender} ${
      data.profession
    } in ${
      data.gender === "non-binary"
        ? "their"
        : data.gender === "female"
        ? "her"
        : "his"
    } ${data.age}. ${data.ethnicity} with ${data["hair-style"]} ${
      data["hair-color"]
    } hair. ${data["cloth-type"]} in ${data["cloth-color"]}. ${
      data.expression
    } look. ${data.background} background, blurred. ${
      data.lighting
    }. Captured with a ${data["camera-type"] || "high-end DSLR"}, ${
      data["lens-type"] || "70-200mm zoom"
    } at ${data.aperture || "f/4"}.`,

    `High-detail headshot of a TOK ${data.gender} ${data.profession} in ${
      data.gender === "non-binary"
        ? "their"
        : data.gender === "female"
        ? "her"
        : "his"
    } ${data.age}. ${data.ethnicity} with ${data["hair-style"]} ${
      data["hair-color"]
    } hair. Wearing a ${data["cloth-color"]} ${data["cloth-type"]}. ${
      data.expression
    } expression. ${data.background} background. ${
      data.lighting
    }. Shot with a ${data["camera-type"] || "full-frame mirrorless camera"}, ${
      data["lens-type"] || "35mm prime"
    } at ${data.aperture || "f/2"}.`,

    `Professional DSLR portrait of a TOK ${data.gender} ${data.profession} in ${
      data.gender === "non-binary"
        ? "their"
        : data.gender === "female"
        ? "her"
        : "his"
    } ${data.age}. ${data.ethnicity} with ${data["hair-style"]} ${
      data["hair-color"]
    } hair. Wearing a ${data["cloth-color"]} ${data["cloth-type"]}. ${
      data.expression
    } look. ${data.background} background. ${
      data.lighting
    } with a hair light. Captured with a ${
      data["camera-type"] || "full-frame DSLR"
    }, ${data["lens-type"] || "50mm prime"} at ${data.aperture || "f/1.8"}.`,

    `Studio-quality LinkedIn image of a TOK ${data.gender} ${
      data.profession
    } in ${
      data.gender === "non-binary"
        ? "their"
        : data.gender === "female"
        ? "her"
        : "his"
    } ${data.age}. ${data.ethnicity} with ${data["hair-style"]} ${
      data["hair-color"]
    } hair. ${data["cloth-type"]} in ${data["cloth-color"]}. ${
      data.expression
    } expression. ${data.background} background. ${
      data.lighting
    } effect. Shot with a ${
      data["camera-type"] || "weather-sealed mirrorless camera"
    }, ${data["lens-type"] || "24-70mm zoom"} at ${data.aperture || "f/5.6"}.`,

    `4K resolution headshot of a TOK ${data.gender} ${data.profession} in ${
      data.gender === "non-binary"
        ? "their"
        : data.gender === "female"
        ? "her"
        : "his"
    } ${data.age}. ${data.ethnicity} with ${data["hair-style"]} ${
      data["hair-color"]
    } hair, ${data.grooming}. Wearing a ${data["cloth-color"]} ${
      data["cloth-type"]
    }. ${data.expression} look. ${data.background} background. ${
      data.lighting
    }. Captured with a ${data["camera-type"] || "high-end DSLR"}, ${
      data["lens-type"] || "85mm prime"
    } at ${data.aperture || "f/2.8"}.`,

    `High-quality professional portrait of a TOK ${data.gender} ${
      data.profession
    } in ${
      data.gender === "non-binary"
        ? "their"
        : data.gender === "female"
        ? "her"
        : "his"
    } ${data.age}. ${data.ethnicity} with ${data["hair-style"]} ${
      data["hair-color"]
    } hair. ${data["cloth-type"]} in ${data["cloth-color"]}. ${
      data.expression
    } smile. ${data.background} background with a whiteboard visible. ${
      data.lighting
    }. Shot with a ${data["camera-type"] || "mirrorless camera"}, ${
      data["lens-type"] || "35mm prime"
    } at ${data.aperture || "f/2"}.`,

    `DSLR quality LinkedIn headshot of a TOK ${data.gender} ${
      data.profession
    } in ${
      data.gender === "non-binary"
        ? "their"
        : data.gender === "female"
        ? "her"
        : "his"
    } ${data.age}. ${data.ethnicity} with ${data["hair-style"]} ${
      data["hair-color"]
    } hair. Wearing a ${data["cloth-color"]} ${data["cloth-type"]}. ${
      data.expression
    } smile. ${data.background} background, out of focus. ${
      data.lighting
    }. Captured with a ${data["camera-type"] || "full-frame DSLR"}, ${
      data["lens-type"] || "100mm macro"
    } at ${data.aperture || "f/2.8"}.`,

    `Studio-quality portrait of a TOK ${data.gender} ${data.profession} in ${
      data.gender === "non-binary"
        ? "their"
        : data.gender === "female"
        ? "her"
        : "his"
    } ${data.age}. ${data.ethnicity} with ${data["hair-style"]} ${
      data["hair-color"]
    } hair. Wearing a ${data["cloth-color"]} ${data["cloth-type"]}. ${
      data.expression
    } expression. ${data.background} background. ${
      data.lighting
    } for a bright, fresh look. Shot with a ${
      data["camera-type"] || "mirrorless camera"
    }, ${data["lens-type"] || "56mm prime"} at ${data.aperture || "f/2"}.`,

    `4K resolution headshot of a TOK ${data.gender} ${data.profession} in ${
      data.gender === "non-binary"
        ? "their"
        : data.gender === "female"
        ? "her"
        : "his"
    } ${data.age}. ${data.ethnicity} with ${data["hair-style"]} ${
      data["hair-color"]
    } hair. Wearing a ${data["cloth-color"]} ${data["cloth-type"]}. ${
      data.expression
    } look. ${data.background} background, slightly blurred. ${
      data.lighting
    }. Captured with a ${data["camera-type"] || "full-frame DSLR"}, ${
      data["lens-type"] || "70-200mm zoom"
    } at ${data.aperture || "f/4"}.`,

    `High-detail professional portrait of a TOK ${data.gender} ${
      data.profession
    } in ${
      data.gender === "non-binary"
        ? "their"
        : data.gender === "female"
        ? "her"
        : "his"
    } ${data.age}. ${data.ethnicity} with ${data["hair-style"]} ${
      data["hair-color"]
    } hair. ${data["cloth-type"]} in ${data["cloth-color"]}. ${
      data.expression
    } look. ${data.background} background. ${data.lighting}. Shot with a ${
      data["camera-type"] || "high-end mirrorless camera"
    }, ${data["lens-type"] || "85mm prime"} at ${data.aperture || "f/2.8"}.`,

    `LinkedIn profile image of a TOK ${data.gender} ${data.profession} in ${
      data.gender === "non-binary"
        ? "their"
        : data.gender === "female"
        ? "her"
        : "his"
    } ${data.age}. ${data.ethnicity} with ${data["hair-style"]} ${
      data["hair-color"]
    } hair. Wearing a ${data["cloth-color"]} ${data["cloth-type"]}. ${
      data.expression
    } smile. ${data.background} background. ${
      data.lighting
    } with a subtle edge light. Captured with a ${
      data["camera-type"] || "mirrorless camera"
    }, ${data["lens-type"] || "35mm prime"} at ${data.aperture || "f/1.8"}.`,

    `Studio-quality headshot of a TOK ${data.gender} ${data.profession} in ${
      data.gender === "non-binary"
        ? "their"
        : data.gender === "female"
        ? "her"
        : "his"
    } ${data.age}. ${data.ethnicity} with ${data["hair-style"]} ${
      data["hair-color"]
    } hair. ${data["cloth-type"]} in ${data["cloth-color"]}. ${
      data.expression
    } look. ${data.background} background. ${data.lighting}. Shot with a ${
      data["camera-type"] || "high-end DSLR"
    }, ${data["lens-type"] || "70-200mm zoom"} at ${data.aperture || "f/5.6"}.`,

    `4K resolution portrait of a TOK ${data.gender} ${data.profession} in ${
      data.gender === "non-binary"
        ? "their"
        : data.gender === "female"
        ? "her"
        : "his"
    } ${data.age}. ${data.ethnicity} with ${data["hair-style"]} ${
      data["hair-color"]
    } hair. Wearing a ${data["cloth-color"]} ${data["cloth-type"]}. ${
      data.expression
    } look. ${data.background} background, slightly out of focus. ${
      data.lighting
    }. Captured with a ${data["camera-type"] || "weather-sealed DSLR"}, ${
      data["lens-type"] || "24-70mm zoom"
    } at ${data.aperture || "f/4"}.`,

    `High-quality LinkedIn headshot of a TOK ${data.gender} ${
      data.profession
    } in ${
      data.gender === "non-binary"
        ? "their"
        : data.gender === "female"
        ? "her"
        : "his"
    } ${data.age}. ${data.ethnicity} with ${data["hair-style"]} ${
      data["hair-color"]
    } hair. ${data["cloth-type"]} in ${data["cloth-color"]}. ${
      data.expression
    } smile. ${data.background} background, blurred. ${
      data.lighting
    }. Shot with a ${data["camera-type"] || "full-frame mirrorless camera"}, ${
      data["lens-type"] || "50mm prime"
    } at ${data.aperture || "f/2"}.`,

    `Professional studio portrait of a TOK ${data.gender} ${
      data.profession
    } in ${
      data.gender === "non-binary"
        ? "their"
        : data.gender === "female"
        ? "her"
        : "his"
    } ${data.age}. ${data.ethnicity} with ${data["hair-style"]} ${
      data["hair-color"]
    } hair. Wearing a ${data["cloth-color"]} ${data["cloth-type"]}. ${
      data.expression
    } look. ${data.background} background. ${data.lighting}. Captured with a ${
      data["camera-type"] || "medium format digital camera"
    }, ${data["lens-type"] || "80mm prime"} at ${data.aperture || "f/2.8"}.`,

    `4K DSLR quality headshot of a TOK ${data.gender} ${data.profession} in ${
      data.gender === "non-binary"
        ? "their"
        : data.gender === "female"
        ? "her"
        : "his"
    } ${data.age}. ${data.ethnicity} with ${data["hair-style"]} ${
      data["hair-color"]
    } hair. ${data["cloth-type"]} in ${data["cloth-color"]}. ${
      data.expression
    } smile. ${data.background} background. ${data.lighting}. Shot with a ${
      data["camera-type"] || "full-frame DSLR"
    }, ${data["lens-type"] || "85mm prime"} at ${data.aperture || "f/2.8"}.`,

    `Studio-quality LinkedIn portrait of a TOK ${data.gender} ${
      data.profession
    } in ${
      data.gender === "man" ? "his" : data.gender === "woman" ? "her" : "their"
    } ${data.age}. ${data.ethnicity} with ${data["hair-style"]} ${
      data["hair-color"]
    } hair. Wearing a ${data["cloth-color"]} ${data["cloth-type"]}. ${
      data.expression
    } look. ${data.background} background. ${data.lighting}. Captured with a ${
      data["camera-type"] || "high-end mirrorless camera"
    }, ${data["lens-type"] || "56mm prime"} at ${data.aperture || "f/2"}.`,
  ];

  console.log(result);
  return result;
}
