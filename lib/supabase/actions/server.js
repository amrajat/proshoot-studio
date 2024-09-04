"use server";

import { redirect } from "next/navigation";
import {
  lemonSqueezySetup,
  createCheckout,
  createDiscount,
} from "@lemonsqueezy/lemonsqueezy.js";
import createSupabaseServerClient from "../ServerClient";
import { revalidatePath } from "next/cache";

export async function getCurrentSession() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) return error;

  return data;
}

export async function signOutCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
  redirect("/auth");
}

export async function requestPasswordReset(email) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw new Error(error.message);
  return JSON.stringify(data);
}

export async function getCurrentUserProfile(id) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("users").select().eq("id", id);
  if (error) throw new Error(error);
  return data;
}

export async function updateCurrentUserProfile(formData, id) {
  const supabase = await createSupabaseServerClient();
  let metadata = {
    f_name: null,
    l_name: null,
    company: null,
    website: null,
    position: null,
    x_username: null,
    linkedin_username: null,
    instagram_username: null,
  };

  if (formData.get("company")) metadata.company = formData.get("company");
  if (formData.get("f_name")) metadata.f_name = formData.get("f_name");
  if (formData.get("l_name")) metadata.l_name = formData.get("l_name");
  if (formData.get("position")) metadata.position = formData.get("position");
  if (formData.get("website")) metadata.website = formData.get("website");
  if (formData.get("linkedin_username"))
    metadata.linkedin_username = formData.get("linkedin_username");
  if (formData.get("instagram_username"))
    metadata.instagram_username = formData.get("instagram_username");
  if (formData.get("x_username"))
    metadata.x_username = formData.get("x_username");

  if (!metadata) return;

  const { data, error } = await supabase
    .from("users")
    .update({ metadata, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select();
  if (error) throw new Error(error.message);

  return null;
}

export async function signInWithGoogle() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.URL}/auth/callback`,
      access_type: "offline",
      prompt: "consent",
    },
  });

  // if (error) throw Error(error.message);

  if (data.url) {
    console.log("data.url", data.url);
    // New code start
    // Extract the code from the original URL
    const originalUrl = new URL(data.url);
    const code = originalUrl.searchParams.get("code");

    // Construct the new redirect URL
    const newRedirectUrl = `${process.env.URL}/auth/callback?code=${code}`;

    redirect(newRedirectUrl);
    // New code end
    redirect(data.url);
  }
}

export async function getPurchaseHistory() {
  const supabase = await createSupabaseServerClient();
  const { session } = await getCurrentSession();

  let { data: purchase_history, error } = await supabase
    .from("users")
    .select("purchase_history")
    .eq("id", session.user.id);
  if (error) throw new Error(error);
  return purchase_history;
}

export async function getCredits() {
  const supabase = await createSupabaseServerClient();
  const { session } = await getCurrentSession();

  let { data: credits, error } = await supabase
    .from("users")
    .select("credits")
    .eq("id", session.user.id);
  if (error) throw new Error(error);
  return credits;
}

export async function getStudios(id) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("users")
    .select("studios")
    .eq("id", id);

  if (error) throw new Error(error); // Throw the error directly

  return data[0]?.studios || []; // Assuming `studios` is an array
}

export async function getStudioImages(studio_id) {
  const { session } = await getCurrentSession();
  const supabase = await createSupabaseServerClient();
  const isDownloaded = await isStudioDownloaded(Number(studio_id));
  const columnName = isDownloaded ? "results" : "preview";

  const {
    data: [
      {
        [columnName]: { [studio_id]: images },
      },
    ],
    error,
  } = await supabase.from("users").select(columnName).eq("id", session.user.id);
  if (error) throw new Error(error);
  return images;
}

export async function isStudioDownloaded(id) {
  const supabase = await createSupabaseServerClient();
  const { session } = await getCurrentSession();

  const {
    data: { studios },
    error,
  } = await supabase
    .from("users")
    .select("studios")
    .eq("id", session.user.id)
    .single();
  if (!studios) redirect("/dashboard/studio");

  const isDownloaded = studios.find((item) => item.id === id)?.downloaded;
  return isDownloaded;
}
export async function updateStudioDownloadStatus(tune_id) {
  const supabase = await createSupabaseServerClient();
  const { session } = await getCurrentSession();

  let {
    data: [{ studios }],
    error,
  } = await supabase.from("users").select("studios").eq("id", session.user.id);

  function updateDownloadStatus(data, tune_id) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].id === tune_id) {
        data[i].downloaded = true;
        break;
      }
    }
  }

  updateDownloadStatus(studios, Number(tune_id));

  const { data, error: newError } = await supabase
    .from("users")
    .update({ studios: studios })
    .eq("id", session.user.id)
    .select();

  revalidatePath(`/dashboard/studio/${tune_id}`);
  redirect(`/dashboard/studio/${tune_id}`);
}

// LemonSqueezy Payments
export async function createCheckoutLS(plan, quantity, variantId) {
  const { session } = await getCurrentSession();

  lemonSqueezySetup({
    apiKey: process.env.LS_API_KEY,
  });
  const storeId = 88664;
  // const variantId = 387793;
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
          variant_id: variantId, // Replace 1 with your actual variant ID
          quantity: quantity, // Ensure this is an integer representing the quantity
        },
      ],
      custom: {
        user: session.user.id,
        email_id: session.user.email,
        plan,
        quantity: String(quantity),
      },
    },
    expiresAt: null,
    // preview: true,
    testMode: false,
  };

  const { statusCode, error, data } = await createCheckout(
    storeId,
    variantId,
    newCheckout
  );

  if (!error) redirect(data.data.attributes.url);
}
