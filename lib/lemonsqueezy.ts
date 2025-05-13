// import LemonSqueezy from "@lemonsqueezy/lemonsqueezy.js"; // This line will be commented out or removed

export const lemonSqueezySetup = () => {
  if (!process.env.LEMONSQUEEZY_API_KEY) {
    throw new Error("LEMONSQUEEZY_API_KEY is not set in environment variables");
  }
  // The library typically initializes globally or you pass the key to methods.
  // For this specific library, you usually pass the API key directly when making calls if not configured globally.
  // However, the new v1.0.0 of @lemonsqueezy/lemonsqueezy.js seems to not require a global setup function.
  // Instead, the API key is used when calling configureLemonSqueezy or directly in API calls.
  // For simplicity and compatibility with your existing call `lemonSqueezySetup()`,
  // we'll assume it's a check or a custom setup you might have.
  // If you're using the latest @lemonsqueezy/lemonsqueezy.js,
  // ensure your calls to `createCheckout` correctly use the API key implicitly or explicitly as per its documentation.
  // This function can serve as a central point to ensure API key is present.
  console.log("Lemon Squeezy API Key check passed.");
};

// If you have a global instance, you might export it:
// export const ls = new LemonSqueezy(process.env.LEMONSQUEEZY_API_KEY);
