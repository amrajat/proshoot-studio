// "use server";
//FIXME: Must be run on server not on the client due to security issue

export const PLANS = [
  {
    planName: "Basic",
    planPrice: 21,
    headshots: 20,
    features: ["f11", "f12", "f13"],
    description:
      "this is going to be an brief explanation of the plan and product.",
  },
  {
    planName: "Standard",
    planPrice: 39,
    headshots: 40,
    features: ["f21", "f22", "f23"],
    description:
      "this is going to be an brief explanation of the plan and product.",
  },
  {
    planName: "Premium",
    planPrice: 59,
    headshots: 100,
    features: ["f31", "f32", "f33"],
    description:
      "this is going to be an brief explanation of the plan and product.",
  },
];
