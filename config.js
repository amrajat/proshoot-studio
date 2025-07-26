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
    starter: {
      planPrice: 29,
      variantID: 387793,
      totalHeadshots: 40,
      stylesLimit: 10,
      accountContext: "personal",
      mostPopular: false,
    },

    professional: {
      planPrice: 39,
      variantID: 387811,
      totalHeadshots: 60,
      stylesLimit: 15,
      accountContext: "personal",
      mostPopular: true,
      features: ["feature one", "feature two", "feature three"],
    },

    studio: {
      planPrice: 59,
      variantID: 387813,
      totalHeadshots: 100,
      stylesLimit: 25,
      accountContext: "personal",
      mostPopular: false,
      features: ["feature one", "feature two", "feature three"],
    },
    team: {
      planPrice: 49,
      variantID: 387813,
      totalHeadshots: 100,
      stylesLimit: 25,
      accountContext: "team",
      mostPopular: false,
      features: ["feature one", "feature two", "feature three"],
    },
  },
};

export default config;
