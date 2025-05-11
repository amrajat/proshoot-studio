export const CLOTHING_OPTIONS = {
  "Business Professional": [
    { name: "Navy Blue Suit", image: "/placeholder.svg" },
    { name: "Charcoal Grey Suit", image: "/placeholder.svg" },
    { name: "White Button-Up Shirt & Tie", image: "/placeholder.svg" },
    { name: "Black Blazer (Professional)", image: "/placeholder.svg" },
  ],
  "Business Casual": [
    { name: "Khaki Trousers & Blazer", image: "/placeholder.svg" },
    { name: "Polo Shirt & Chinos", image: "/placeholder.svg" },
    { name: "Sweater Over Collared Shirt", image: "/placeholder.svg" },
    { name: "Sports Coat & Dress Pants", image: "/placeholder.svg" },
  ],
  "Smart Casual": [
    { name: "Dark Jeans & Button-Up Shirt", image: "/placeholder.svg" },
    { name: "Fitted T-Shirt & Blazer", image: "/placeholder.svg" },
    { name: "Henley Shirt & Dark Trousers", image: "/placeholder.svg" },
    { name: "Turtleneck & Smart Jacket", image: "/placeholder.svg" },
  ],
  "Tech Casual / Startup Style": [
    { name: "Branded Hoodie/T-Shirt (Subtle)", image: "/placeholder.svg" },
    { name: "Clean Dark Wash Jeans & Sneakers", image: "/placeholder.svg" },
    { name: "Quarter-Zip Pullover", image: "/placeholder.svg" },
  ],
  "Creative Professional": [
    { name: "Unique Patterned Shirt", image: "/placeholder.svg" },
    { name: "Stylish Scarf or Accessory", image: "/placeholder.svg" },
    { name: "Well-Fitted Dark Denim Jacket", image: "/placeholder.svg" },
  ],
  "Executive / Luxury Branding": [
    { name: "High-End Designer Suit", image: "/placeholder.svg" },
    { name: "Silk Blouse & Pencil Skirt", image: "/placeholder.svg" },
    { name: "Luxury Watch & Cufflinks (Visible)", image: "/placeholder.svg" },
  ],
  "Cultural or Identity-Informed": [
    {
      name: "Traditional Cultural Attire (Specify)",
      image: "/placeholder.svg",
    },
    // Add more specific cultural items if a user can select them
  ],
  // Add more themes and items as needed
};

export const ALL_CLOTHING_OPTIONS = Object.values(CLOTHING_OPTIONS).flat();

export const BACKGROUND_OPTIONS = {
  "Studio (Solid Colors)": [
    { name: "Grey Studio Backdrop", image: "/placeholder.svg" },
    { name: "Dark Studio Backdrop", image: "/placeholder.svg" },
    { name: "Blue Studio Backdrop", image: "/placeholder.svg" },
    { name: "Green Studio Backdrop", image: "/placeholder.svg" },
  ],
  "Office (Modern or Traditional)": [
    { name: "Modern Office Interior", image: "/placeholder.svg" },
    { name: "Office Lobby", image: "/placeholder.svg" },
    { name: "Loft-Style Office", image: "/placeholder.svg" },
    { name: "Office Window View", image: "/placeholder.svg" },
  ],
  "City (Urban, Rooftop, Street View)": [
    { name: "Cityscape Window View", image: "/placeholder.svg" },
    { name: "Urban Building Exterior", image: "/placeholder.svg" },
    { name: "French Rooftop View", image: "/placeholder.svg" },
  ],
  "Nature (Parks, Trees, Outdoors)": [
    { name: "Garden Scenery", image: "/placeholder.svg" },
    { name: "Lush Greenery Backdrop", image: "/placeholder.svg" },
  ],
  "Bookshelves / Intellectual": [
    { name: "Bookshelf Backdrop (Intellectual)", image: "/placeholder.svg" },
  ],
  "Home Office / Hybrid Work": [
    { name: "Home Office with Window", image: "/placeholder.svg" },
    { name: "Cafe as a Workspace", image: "/placeholder.svg" },
  ],
  // Add more themes and items as needed
};

export const ALL_BACKGROUND_OPTIONS = Object.values(BACKGROUND_OPTIONS).flat();

// Helper function to find the theme for a given clothing item name
export const findClothingTheme = (itemName) => {
  for (const theme in CLOTHING_OPTIONS) {
    if (CLOTHING_OPTIONS[theme].some((option) => option.name === itemName)) {
      return theme;
    }
  }
  return "Unknown";
};

// Helper function to find the theme for a given background item name
export const findBackgroundTheme = (itemName) => {
  for (const theme in BACKGROUND_OPTIONS) {
    if (BACKGROUND_OPTIONS[theme].some((option) => option.name === itemName)) {
      return theme;
    }
  }
  return "Unknown";
};
