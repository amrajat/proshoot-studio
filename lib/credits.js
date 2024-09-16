export async function updateUserCredits(supabase, userId, plan) {
  const { data, error } = await supabase
    .from("users")
    .select("credits")
    .eq("id", userId)
    .single();

  if (error) throw new Error("Failed to fetch user credits");

  const newCredits = { ...data.credits, [plan]: data.credits[plan] - 1 };

  const { error: updateError } = await supabase
    .from("users")
    .update({ credits: newCredits })
    .eq("id", userId);

  if (updateError) throw new Error("Failed to update user credits");
}
