export const CLOTHING_OPTIONS = {
  "Business Professional": [
    { name: "Navy Blue Suit", image: "/images/placeholder.svg" },
    { name: "Charcoal Grey Suit", image: "/images/placeholder.svg" },
    { name: "White Button-Up Shirt & Tie", image: "/images/placeholder.svg" },
    { name: "Black Blazer (Professional)", image: "/images/placeholder.svg" },
  ],
  "Business Casual": [
    { name: "Khaki Trousers & Blazer", image: "/images/placeholder.svg" },
    { name: "Polo Shirt & Chinos", image: "/images/placeholder.svg" },
    { name: "Sweater Over Collared Shirt", image: "/images/placeholder.svg" },
    { name: "Sports Coat & Dress Pants", image: "/images/placeholder.svg" },
  ],
  "Smart Casual": [
    { name: "Dark Jeans & Button-Up Shirt", image: "/images/placeholder.svg" },
    { name: "Fitted T-Shirt & Blazer", image: "/images/placeholder.svg" },
    { name: "Henley Shirt & Dark Trousers", image: "/images/placeholder.svg" },
    { name: "Turtleneck & Smart Jacket", image: "/images/placeholder.svg" },
  ],
  "Tech Casual / Startup Style": [
    {
      name: "Branded Hoodie/T-Shirt (Subtle)",
      image: "/images/placeholder.svg",
    },
    {
      name: "Clean Dark Wash Jeans & Sneakers",
      image: "/images/placeholder.svg",
    },
    { name: "Quarter-Zip Pullover", image: "/images/placeholder.svg" },
  ],
  "Creative Professional": [
    { name: "Unique Patterned Shirt", image: "/images/placeholder.svg" },
    { name: "Stylish Scarf or Accessory", image: "/images/placeholder.svg" },
    { name: "Well-Fitted Dark Denim Jacket", image: "/images/placeholder.svg" },
  ],
  "Executive / Luxury Branding": [
    { name: "High-End Designer Suit", image: "/images/placeholder.svg" },
    { name: "Silk Blouse & Pencil Skirt", image: "/images/placeholder.svg" },
    {
      name: "Luxury Watch & Cufflinks (Visible)",
      image: "/images/placeholder.svg",
    },
  ],
  "Cultural or Identity-Informed": [
    {
      name: "Traditional Cultural Attire (Specify)",
      image: "/images/placeholder.svg",
    },
    // Add more specific cultural items if a user can select them
  ],
  // Add more themes and items as needed
};

export const ALL_CLOTHING_OPTIONS = Object.values(CLOTHING_OPTIONS).flat();

export const BACKGROUND_OPTIONS = {
  "Studio (Solid Colors)": [
    { name: "Grey Studio Backdrop", image: "/images/placeholder.svg" },
    { name: "Dark Studio Backdrop", image: "/images/placeholder.svg" },
    { name: "Blue Studio Backdrop", image: "/images/placeholder.svg" },
    { name: "Green Studio Backdrop", image: "/images/placeholder.svg" },
  ],
  "Office (Modern or Traditional)": [
    { name: "Modern Office Interior", image: "/images/placeholder.svg" },
    { name: "Office Lobby", image: "/images/placeholder.svg" },
    { name: "Loft-Style Office", image: "/images/placeholder.svg" },
    { name: "Office Window View", image: "/images/placeholder.svg" },
  ],
  "City (Urban, Rooftop, Street View)": [
    { name: "Cityscape Window View", image: "/images/placeholder.svg" },
    { name: "Urban Building Exterior", image: "/images/placeholder.svg" },
    { name: "French Rooftop View", image: "/images/placeholder.svg" },
  ],
  "Nature (Parks, Trees, Outdoors)": [
    { name: "Garden Scenery", image: "/images/placeholder.svg" },
    { name: "Lush Greenery Backdrop", image: "/images/placeholder.svg" },
  ],
  "Bookshelves / Intellectual": [
    {
      name: "Bookshelf Backdrop (Intellectual)",
      image: "/images/placeholder.svg",
    },
  ],
  "Home Office / Hybrid Work": [
    { name: "Home Office with Window", image: "/images/placeholder.svg" },
    { name: "Cafe as a Workspace", image: "/images/placeholder.svg" },
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
