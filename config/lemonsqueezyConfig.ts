export type CreditPlan = {
  id: string; // e.g., 'starter-credits', 'pro-credits-pack'
  name: string;
  description: string;
  price: string; // e.g., "$10.00"
  variantId: string; // Actual LemonSqueezy variant ID
  credits: {
    type: "starter" | "pro" | "studio" | "balance";
    amount: number;
  };
};

export const organizationCreditPlans: CreditPlan[] = [
  {
    id: "org-starter-pack",
    name: "Org Starter Pack",
    description: "10 Starter Credits for your Organization",
    price: "$9.99",
    variantId: "YOUR_LSQ_STARTER_PACK_VARIANT_ID", // Replace with actual LemonSqueezy Variant ID
    credits: { type: "starter", amount: 10 },
  },
  {
    id: "org-pro-pack",
    name: "Org Pro Pack",
    description: "10 Pro Credits for your Organization",
    price: "$19.99",
    variantId: "YOUR_LSQ_PRO_PACK_VARIANT_ID", // Replace with actual LemonSqueezy Variant ID
    credits: { type: "pro", amount: 10 },
  },
  // Add more plans as needed, e.g., bulk balance credits
  {
    id: "org-balance-100",
    name: "Org Balance Top-up (100)",
    description: "100 General Purpose Credits for your Organization",
    price: "$49.99",
    variantId: "YOUR_LSQ_BALANCE_100_VARIANT_ID", // Replace with actual LemonSqueezy Variant ID
    credits: { type: "balance", amount: 100 },
  },
];

// Make sure to replace placeholder variant IDs with your actual LemonSqueezy variant IDs.
