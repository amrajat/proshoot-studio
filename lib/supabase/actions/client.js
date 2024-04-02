import createSupabaseBrowserClient from "../BrowserClient";

export async function signInWithEmailOTP(email) {
  const supabase = await createSupabaseBrowserClient();

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
  const supabase = await createSupabaseBrowserClient();

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) throw new Error(error); // Throw the error directly

  return { data, error: null };
}

export async function getCurrentSession() {
  const supabase = await createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) return error;
  return data;
}
export async function getCredits() {
  const { session } = await getCurrentSession();
  const supabase = await createSupabaseBrowserClient();
  let { data: credits, error } = await supabase
    .from("users")
    .select("credits")
    .eq("id", session.user.id);
  if (error) throw new Error(error);
  return credits;
}
