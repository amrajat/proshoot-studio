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
        "Perfect for individuals, Personal branding and career advancement.",
      features: [
        "40 HD Professional Headshots",
        "2 Unique Styles",
        "Build your own style.",
        "10K+ style combinations",
        "Ready in ~90 minutes",
        "Full Commercial Rights",
        "7-Day Money Back Guarantee",
      ],
    },

    professional: {
      displayPrice: 49,
      totalHeadshots: 100,
      stylesLimit: 5,
      accountContext: "personal",
      mostPopular: true,
      description:
        "Most popular choice for professionals who need variety and quality for their personal brand.",
      features: [
        "100 HD Professional Headshots",
        "5 Unique Styles",
        "Build your own style.",
        "10K+ style combinations",
        "Ready in ~60 minutes",
        "Full Commercial Rights",
        "7-Day Money Back Guarantee",
      ],
    },

    studio: {
      displayPrice: 59,
      totalHeadshots: 200,
      stylesLimit: 10,
      accountContext: "personal",
      mostPopular: false,
      description:
        "Premium package with maximum variety for demanding professionals.",
      features: [
        "200 HD Professional Headshots",
        "10 Unique Styles",
        "Build your own style.",
        "10K+ style combinations",
        "Ready in ~45 minutes",
        "Full Commercial Rights",
        "7-Day Money Back Guarantee",
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
        "100 HD Professional Headshots per member",
        "10 Unique Styles",
        "Build your own style.",
        "10K+ style combinations",
        "Ready in ~45 minutes",
        "Full Commercial Rights",
        "7-Day Money Back Guarantee",
        "Volume Discounts Available",
        "Team Management Dashboard",
      ],
    },
  },
};

export default config;
