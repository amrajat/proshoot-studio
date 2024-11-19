import createSupabaseBrowserClient from "../BrowserClient";

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

export async function signOutCurrentUser() {
  const supabase = await createSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}
