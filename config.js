const config = {
  // REQUIRED
  appName: "Proshoot",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "Create high-quality, professional AI headshots in seconds using Proshoot.co's cutting-edge AI technology. Save time and money, get the perfect AI headshot.",
  // REQUIRED (no https://, not trialing slash at the end, just the naked domain)
  domainName: "www.proshoot.co",
  baseUrl: "https://www.proshoot.co",

  PLANS: {
    Starter: {
      planPrice: 29,
      variantId: 387793,
      headshots: 40,
      styles: 10,
    },

    Pro: {
      planPrice: 39,
      variantId: 387811,
      headshots: 60,
      styles: 15,
    },

    Elite: {
      planPrice: 49,
      variantId: 387812,
      headshots: 80,
      styles: 20,
    },

    Studio: {
      planPrice: 59,
      variantId: 387813,
      headshots: 100,
      styles: 25,
    },
  },
};

export default config;
