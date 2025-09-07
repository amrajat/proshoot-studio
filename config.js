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
      displayPrice: 35,
      totalHeadshots: 40,
      stylesLimit: 2,
      accountContext: "personal",
      mostPopular: false,
      description:
        "Perfect for individuals looking to create professional headshots for personal branding and career advancement.",
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
      displayPrice: 49,
      totalHeadshots: 60,
      stylesLimit: 5,
      accountContext: "personal",
      mostPopular: true,
      description:
        "Most popular choice for professionals who need variety and quality for their personal brand.",
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
      displayPrice: 59,
      totalHeadshots: 100,
      stylesLimit: 10,
      accountContext: "personal",
      mostPopular: false,
      description:
        "Premium package with maximum variety and customization options for demanding professionals.",
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
      displayPrice: 49,
      totalHeadshots: 100,
      stylesLimit: 5,
      accountContext: "team",
      mostPopular: false,
      description:
        "Designed for teams and organizations with volume discounts and bulk processing capabilities.",
      features: [
        "100 Professional Headshots per member",
        "25 Unique Clothing Styles",
        "25 Unique Backgrounds",
        "Ready in ~45 minutes",
        "Full Commercial Rights",
        "7-Day Money Back Guarantee",
        "Our Highest-Quality AI Mode",
        "Volume Discounts Available",
        "Team Management Dashboard",
      ],
    },
  },
};

export default config;
