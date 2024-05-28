"use server";

import { redirect } from "next/navigation";
import {
  lemonSqueezySetup,
  createCheckout,
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
  let updateData = {};
  if (formData.get("company")) updateData.company = formData.get("company");
  if (formData.get("f_name")) updateData.f_name = formData.get("f_name");
  if (formData.get("l_name")) updateData.l_name = formData.get("l_name");
  if (formData.get("position")) updateData.position = formData.get("position");
  if (formData.get("permission") === "on") updateData.permission = true;
  if (formData.get("permission") === null) updateData.permission = false;
  if (formData.get("website")) updateData.website = formData.get("website");
  if (formData.get("x_username"))
    updateData.x_username = formData.get("x_username");
  updateData.updated_at = new Date().toISOString();

  if (!updateData) return;

  const { data, error } = await supabase
    .from("users")
    .update(updateData)
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
    },
  });

  // console.log(error, data);
  if (!error) redirect(data.url);
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

  // Delete watermarked images from supabase
  //https://fpczpgjfyejjuezbiqjq.supabase.co/storage/v1/object/public/studios/0505a4f3-136f-4e36-9549-6127a808db45/previews/16245364/68154a90-82b7-454e-894f-27ac71d9df59.jpg

  // const { data, error } = await supabase
  // .storage
  // .from('avatars')
  // .remove(['folder/avatar1.png'])

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

  console.log(error);

  if (!error) redirect(data.data.attributes.url);
}
