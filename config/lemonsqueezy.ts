export const lemonsqueezy = {
  plans: {
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
    Studio: {
      planPrice: 59,
      variantId: 387813,
      headshots: 100,
      styles: 25,
    },
    Team: {
      planPrice: 49,
      variantId: 387813,
      headshots: 100,
      styles: 25,
    },
  },
  organizationCreditPlans: [
    {
      id: "org-starter-pack",
      name: "Org Starter Pack",
      description: "10 Starter Credits for your Organization",
      price: "$9.99",
      variantId: "YOUR_LSQ_STARTER_PACK_VARIANT_ID",
      credits: { type: "starter", amount: 10 },
    },
    {
      id: "org-pro-pack",
      name: "Org Pro Pack",
      description: "10 Pro Credits for your Organization",
      price: "$19.99",
      variantId: "YOUR_LSQ_PRO_PACK_VARIANT_ID",
      credits: { type: "pro", amount: 10 },
    },
    {
      id: "org-balance-100",
      name: "Org Balance Top-up (100)",
      description: "100 General Purpose Credits for your Organization",
      price: "$49.99",
      variantId: "YOUR_LSQ_BALANCE_100_VARIANT_ID",
      credits: { type: "balance", amount: 100 },
    },
  ],
};

