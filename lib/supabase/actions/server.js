"use server";
import { redirect } from "next/navigation";
import createSupabaseServerClient from "../ServerClient";
// FIXME: Need to make 2 separate client for server and client and use then accordingly.

// export async function signUpNewUser({ email, password }) {
// //   const { error } = await supabase.auth.signUp({
//     email,
//     password,
//   });
//   // Do something if the signup process is successful and show user to confirm their email address.

//   return JSON.stringify(error?.message);
// }

// export async function signInNewUser({ email, password }) {
// //   const { error } = await supabase.auth.signInWithPassword({
//     email,
//     password,
//   });
//   if (!error) redirect("/dashboard");
//   return JSON.stringify(error?.message);
// }
export async function getCurrentSession() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.getSession();
  if (error) return error;

  return data;
}

export async function signOutCurrentUser() {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signOut();
  // Need to check for session first then remove the cookies and localStorage files from client.
  if (error) throw new Error(error.message);
  redirect("/auth");
}

export async function requestPasswordReset(email) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw new Error(error.message);
  return JSON.stringify(data);
}

export async function signInWithEmailOTP(email) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: null,
    },
  });
  if (error) throw new Error(error);
  return { data, error: null };
}

export async function verifyEmailOTP(email, token) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) throw new Error(error); // Throw the error directly

  return { data, error: null };
}
export async function getCurrentUserProfile(id) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("users").select().eq("id", id);
  if (error) throw new Error(error);
  return data;
}

export async function updateCurrentUserProfile(formData) {
  const supabase = await createSupabaseServerClient();

  // 1. Update password OR fullName
  let updateData = {};
  const file = formData.get("avatar");
  if (formData.get("company")) updateData.company = formData.get("company");
  if (formData.get("f_name")) updateData.f_name = formData.get("f_name");
  if (formData.get("l_name")) updateData.l_name = formData.get("l_name");
  if (formData.get("position")) updateData.position = formData.get("position");
  if (formData.get("permission"))
    updateData.permission = formData.get("permission");
  if (formData.get("website")) updateData.website = formData.get("website");
  if (formData.get("x_username"))
    updateData.x_username = formData.get("x_username");
  updateData.updated_at = new Date().toISOString();

  if (!updateData || !file) return;

  const { data, error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", "dfac2d1a-50c9-4285-af42-8befbeac0dcf")
    .select();
  if (error) throw new Error(error.message);
  if (file?.size === 0 || !file?.type.startsWith("image/")) return data;

  // 2. Upload the avatar image
  const fileName = `avatar-${""}-${Math.random()}-${file?.name}`;

  const { error: storageError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file);

  if (storageError) throw new Error(storageError.message);

  // 3. Update avatar in the user
  const { data: updatedUser, error: error2 } = await supabase
    .from("users")
    .update({
      avatar: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${fileName}`,
    })
    .eq("id", "dfac2d1a-50c9-4285-af42-8befbeac0dcf")
    .select();

  if (error2) throw new Error(error2.message);
  return updatedUser;
}

export async function getPurchaseHistory() {
  const supabase = await createSupabaseServerClient();

  let { data: purchase_history, error } = await supabase
    .from("users")
    .select("purchase_history")
    .eq("id", "dfac2d1a-50c9-4285-af42-8befbeac0dcf");
  if (error) throw new Error(error);
  return purchase_history;
}

export async function getCredits() {
  const supabase = await createSupabaseServerClient();

  let { data: credits, error } = await supabase
    .from("users")
    .select("credits")
    .eq("id", "dfac2d1a-50c9-4285-af42-8befbeac0dcf");
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
