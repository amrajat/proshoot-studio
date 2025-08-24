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
      planPrice: 35,
      variantID: 959888,
      totalHeadshots: 40,
      stylesLimit: 10,
      accountContext: "personal",
      mostPopular: false,
      description:
        "this is the description of this plan and it will be changed after some time.",
      features: [
        "40 Professional Headshots",
        "10 Unique Clothing Styles",
        "10 Unique Backgrounds",
        "Ready in ~90 minutes",
        "Full Commercial Rights",
        "7-Day Money Back Guarantee",
        "Our Highest-Quality AI Mode",
      ],
    },

    professional: {
      planPrice: 49,
      variantID: 959891,
      totalHeadshots: 60,
      stylesLimit: 20,
      accountContext: "personal",
      mostPopular: true,
      description:
        "this is the description of this plan and it will be changed after some time.",
      features: [
        "80 Professional Headshots",
        "20 Unique Clothing Styles",
        "20 Unique Backgrounds",
        "Ready in ~60 minutes",
        "Full Commercial Rights",
        "7-Day Money Back Guarantee",
        "Our Highest-Quality AI Mode",
      ],
    },

    studio: {
      planPrice: 59,
      variantID: 959892,
      totalHeadshots: 100,
      stylesLimit: 25,
      accountContext: "personal",
      mostPopular: false,
      description:
        "this is the description of this plan and it will be changed after some time.",
      features: [
        "100 Professional Headshots",
        "25 Unique Clothing Styles",
        "25 Unique Backgrounds",
        "Ready in ~45 minutes",
        "Full Commercial Rights",
        "7-Day Money Back Guarantee",
        "Our Highest-Quality AI Mode",
        "Extra 24 Customized Wardrobe & Backgrounds",
      ],
    },
    team: {
      planPrice: 49,
      variantID: 959893,
      totalHeadshots: 100,
      stylesLimit: 25,
      accountContext: "team",
      mostPopular: false,
      description:
        "this is the description of this plan and it will be changed after some time.",
      features: [
        "100 Professional Headshots",
        "25 Unique Clothing Styles",
        "25 Unique Backgrounds",
        "Ready in ~45 minutes",
        "Full Commercial Rights",
        "7-Day Money Back Guarantee",
        "Our Highest-Quality AI Mode",
        "Extra 24 Customized Wardrobe & Backgrounds",
      ],
    },
  },
};

export default config;
