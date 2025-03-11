"use server";

import { redirect } from "next/navigation";
import {
  lemonSqueezySetup,
  createCheckout,
} from "@lemonsqueezy/lemonsqueezy.js";
import createSupabaseServerClient from "../ServerClient";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import * as Sentry from "@sentry/nextjs";

// Helper function for retry logic
const retry = async (fn, retries = 3, delay = 300, finalError = null) => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      Sentry.captureException(finalError || error);
      throw finalError || error;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay * 2, finalError || error);
  }
};

// Helper to validate session
const validateSession = (session, errorMessage = "Authentication required") => {
  if (!session) {
    const error = new Error(errorMessage);
    error.status = 401;
    throw error;
  }
  return session;
};

export async function getCurrentSession() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Session retrieval error:", error);
      Sentry.captureException(error);
      return { error };
    }

    return data;
  } catch (error) {
    console.error("Unexpected error in getCurrentSession:", error);
    Sentry.captureException(error);
    return { error };
  }
}

export async function getCurrentUserProfile(id) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("users").select().eq("id", id);

    if (error) {
      console.error("User profile retrieval error:", error);
      Sentry.captureException(error);
      throw new Error(`Failed to get user profile: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Unexpected error in getCurrentUserProfile:", error);
    Sentry.captureException(error);
    throw error;
  }
}

export async function signInWithOAuth(provider) {
  try {
    const supabase = await createSupabaseServerClient();
    const options = { redirectTo: `${process.env.URL}/auth/callback` };

    if (provider === "google") {
      options.queryParams = { access_type: "offline", prompt: "consent" };
    } else {
      options.prompt = "consent";
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options,
    });

    if (error) {
      console.error("OAuth sign-in error:", error);
      Sentry.captureException(error);
      throw new Error(error.message);
    }

    if (data.url) {
      const cookieJar = cookies();
      cookieJar.set("lastSignedInMethod", provider);
      redirect(data.url);
    }
  } catch (error) {
    console.error("Unexpected error in signInWithOAuth:", error);
    Sentry.captureException(error);
    throw error;
  }
}

export async function getPurchaseHistory() {
  try {
    const supabase = await createSupabaseServerClient();
    const { session, error: sessionError } = await getCurrentSession();

    if (sessionError) {
      console.error("Session error in getPurchaseHistory:", sessionError);
      throw new Error("Authentication failed");
    }

    validateSession(session);

    return await retry(async () => {
      const { data: purchase_history, error } = await supabase
        .from("users")
        .select("purchase_history")
        .eq("id", session.user.id);

      if (error) {
        console.error("Purchase history retrieval error:", error);
        throw new Error(`Failed to get purchase history: ${error.message}`);
      }

      return purchase_history;
    });
  } catch (error) {
    console.error("Error in getPurchaseHistory:", error);
    Sentry.captureException(error);
    throw error;
  }
}

export async function getCredits() {
  try {
    const supabase = await createSupabaseServerClient();
    const { session, error: sessionError } = await getCurrentSession();

    if (sessionError) {
      console.error("Session error in getCredits:", sessionError);
      throw new Error("Authentication failed");
    }

    validateSession(session);

    return await retry(async () => {
      const { data: credits, error } = await supabase
        .from("users")
        .select("credits")
        .eq("id", session.user.id);

      if (error) {
        console.error("Credits retrieval error:", error);
        throw new Error(`Failed to get credits: ${error.message}`);
      }

      return credits;
    });
  } catch (error) {
    console.error("Error in getCredits:", error);
    Sentry.captureException(error);
    throw error;
  }
}

export async function getStudios(id) {
  try {
    if (!id) {
      throw new Error("User ID is required");
    }

    const supabase = await createSupabaseServerClient();

    return await retry(async () => {
      const { data, error } = await supabase
        .from("users")
        .select("studios")
        .eq("id", id);

      if (error) {
        console.error("Studios retrieval error:", error);
        throw new Error(`Failed to get studios: ${error.message}`);
      }

      return data[0]?.studios || []; // Assuming `studios` is an array
    });
  } catch (error) {
    console.error("Error in getStudios:", error);
    Sentry.captureException(error);
    throw error;
  }
}

export async function getStudioImages(studio_id) {
  try {
    if (!studio_id) {
      throw new Error("Studio ID is required");
    }

    const { session, error: sessionError } = await getCurrentSession();

    if (sessionError) {
      console.error("Session error in getStudioImages:", sessionError);
      throw new Error("Authentication failed");
    }

    validateSession(session);

    const supabase = await createSupabaseServerClient();
    const isDownloaded = await isStudioDownloaded(studio_id);
    const columnName = isDownloaded ? "results" : "preview";

    return await retry(async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select(columnName)
          .eq("id", session.user.id);

        if (error) {
          console.error("Studio images retrieval error:", error);
          throw new Error(`Failed to get studio images: ${error.message}`);
        }

        if (!data || data.length === 0 || !data[0][columnName]) {
          throw new Error("No images found for this studio");
        }

        const images = data[0][columnName][studio_id];

        return images;
      } catch (error) {
        console.error("Error processing studio images:", error);
        throw error;
      }
    });
  } catch (error) {
    console.error("Error in getStudioImages:", error);
    Sentry.captureException(error);
    throw error;
  }
}

export async function isStudioDownloaded(id) {
  try {
    if (!id) {
      throw new Error("Studio ID is required");
    }

    const supabase = await createSupabaseServerClient();
    const { session, error: sessionError } = await getCurrentSession();

    if (sessionError) {
      console.error("Session error in isStudioDownloaded:", sessionError);
      throw new Error("Authentication failed");
    }

    validateSession(session);

    return await retry(async () => {
      const { data, error } = await supabase
        .from("users")
        .select("studios")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Studio download status retrieval error:", error);
        throw new Error(
          `Failed to check studio download status: ${error.message}`
        );
      }

      if (!data.studios) {
        redirect("/dashboard/studio");
      }

      const isDownloaded = data.studios.find(
        (item) => item.id === id
      )?.downloaded;
      return isDownloaded;
    });
  } catch (error) {
    console.error("Error in isStudioDownloaded:", error);
    Sentry.captureException(error);
    throw error;
  }
}

export async function updateStudioDownloadStatus(tune_id) {
  try {
    if (!tune_id) {
      throw new Error("Studio ID is required");
    }

    const supabase = await createSupabaseServerClient();
    const { session, error: sessionError } = await getCurrentSession();

    if (sessionError) {
      console.error(
        "Session error in updateStudioDownloadStatus:",
        sessionError
      );
      throw new Error("Authentication failed");
    }

    validateSession(session);

    return await retry(async () => {
      // Get current studios data
      const { data: userData, error: fetchError } = await supabase
        .from("users")
        .select("studios")
        .eq("id", session.user.id);

      if (fetchError) {
        console.error("Error fetching studios for update:", fetchError);
        throw new Error(`Failed to fetch studios: ${fetchError.message}`);
      }

      if (!userData || userData.length === 0 || !userData[0].studios) {
        throw new Error("No studios found for this user");
      }

      const studios = userData[0].studios;

      // Update the download status
      let studioFound = false;
      const updatedStudios = studios.map((studio) => {
        if (studio.id === tune_id) {
          studioFound = true;
          return { ...studio, downloaded: true };
        }
        return studio;
      });

      if (!studioFound) {
        throw new Error(`Studio with ID ${tune_id} not found`);
      }

      // Update the database
      const { error: updateError } = await supabase
        .from("users")
        .update({ studios: updatedStudios })
        .eq("id", session.user.id);

      if (updateError) {
        console.error("Error updating studio download status:", updateError);
        throw new Error(
          `Failed to update download status: ${updateError.message}`
        );
      }

      revalidatePath(`/dashboard/studio/${tune_id}`);
      redirect(`/dashboard/studio/${tune_id}`);
    });
  } catch (error) {
    console.error("Error in updateStudioDownloadStatus:", error);
    Sentry.captureException(error);
    throw error;
  }
}

// LemonSqueezy Payments
export async function createCheckoutLS(
  plan,
  quantity,
  variantId,
  firstPromoterReference = null,
  firstPromoterTID = null
) {
  try {
    // Validate inputs
    if (!plan) {
      throw new Error("Plan is required");
    }

    if (!quantity || isNaN(parseInt(quantity))) {
      throw new Error("Valid quantity is required");
    }

    if (!variantId) {
      throw new Error("Variant ID is required");
    }

    // Get session with error handling
    const { session, error: sessionError } = await getCurrentSession();

    if (sessionError) {
      console.error("Session error in createCheckoutLS:", sessionError);
      throw new Error("Authentication failed");
    }

    validateSession(session);

    // Initialize LemonSqueezy with error handling
    try {
      lemonSqueezySetup({
        apiKey: process.env.LS_API_KEY,
      });
    } catch (error) {
      console.error("Error initializing LemonSqueezy:", error);
      Sentry.captureException(error);
      throw new Error("Payment service initialization failed");
    }

    const storeId = 88664;

    // Prepare custom data
    const customData = {
      user: session.user.id,
      email_id: session.user.email,
      plan,
      quantity: String(quantity),
    };

    // Only add FirstPromoter data if ref exists
    if (firstPromoterReference) {
      customData.firstPromoterReference = firstPromoterReference;
      customData.firstPromoterTID = firstPromoterTID;
    }

    const newCheckout = {
      productOptions: {
        name: "Proshoot.co",
        description: "The #1 Professional AI Headshot Generator.",
        enabled_variants: [variantId], // Only show the selected variant in the checkout
        redirect_url: `${process.env.URL}/dashboard/studio/create`,
      },
      checkoutOptions: {
        embed: false,
        media: false,
        logo: true,
      },
      checkoutData: {
        email: session.user.email,
        variant_quantities: [
          {
            variant_id: variantId,
            quantity: parseInt(quantity), // Ensure this is an integer
          },
        ],
        custom: customData,
      },
      expiresAt: null,
      testMode: false,
    };

    // Create checkout with retry logic
    return await retry(async () => {
      const { statusCode, error, data } = await createCheckout(
        storeId,
        variantId,
        newCheckout
      );

      if (error) {
        console.error("LemonSqueezy checkout creation error:", error);
        throw new Error(`Failed to create checkout: ${error}`);
      }

      if (
        !data ||
        !data.data ||
        !data.data.attributes ||
        !data.data.attributes.url
      ) {
        throw new Error("Invalid checkout response from payment provider");
      }

      // Instead of redirecting, return the URL
      return { url: data.data.attributes.url };
    });
  } catch (error) {
    console.error("Error in createCheckoutLS:", error);
    Sentry.captureException(error);
    throw error;
  }
}
