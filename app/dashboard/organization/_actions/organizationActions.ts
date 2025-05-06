"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Helper to create a Supabase client in server actions using cookies
const createServerActionClient = () => {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // ignore
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // ignore
          }
        },
      },
    }
  );
};

// Interface for data coming from the create form
interface OrgFormData {
  name: string;
  team_size: number | null;
  website: string | null;
  industry: string | null;
  department: string | null;
  position: string | null;
}

// Type for returned data after creating an organization
interface CreatedOrgData {
  id: string;
  name: string;
}

// Action to create a new organization
export async function createOrganizationAction(
  formData: OrgFormData
): Promise<{ data?: CreatedOrgData; error?: string }> {
  const supabase = createServerActionClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "User not authenticated." };
  }
  const ownerUserId = user.id;

  // Validate name
  if (!formData.name.trim()) {
    return { error: "Organization name is required." };
  }

  try {
    // Insert organization
    const { data: orgData, error: orgError } = await supabase
      .from("organizations")
      .insert({
        owner_user_id: ownerUserId,
        name: formData.name,
        team_size: formData.team_size,
        website: formData.website,
        industry: formData.industry,
        department: formData.department,
        position: formData.position,
      })
      .select("id, name")
      .single();
    if (orgError || !orgData) {
      return { error: orgError?.message ?? "Failed to create organization." };
    }

    // Insert membership for owner
    const { error: memberError } = await supabase
      .from("organization_members")
      .insert({
        organization_id: orgData.id,
        user_id: ownerUserId,
        role: "admin",
      });
    if (memberError) {
      return { error: memberError.message };
    }

    // Initialize credits row
    const { error: creditError } = await supabase
      .from("credits")
      .insert({ organization_id: orgData.id });
    if (creditError) {
      return { error: creditError.message };
    }

    // Revalidate dashboard route
    revalidatePath("/dashboard");

    return { data: orgData };
  } catch (error: any) {
    return { error: error?.message ?? "Unexpected error." };
  }
}

// Interface for data coming from the update form
interface OrgUpdateFormData {
  name: string;
  team_size: number | null;
  website: string | null;
  industry: string | null;
  department: string | null;
  position: string | null;
}

// Type for returned data after updating an organization
interface UpdatedOrgData {
  id: string;
  name: string;
}

// Action to update an existing organization
export async function updateOrganizationAction(
  orgId: string,
  formData: OrgUpdateFormData
): Promise<{ data?: UpdatedOrgData; error?: string }> {
  const supabase = createServerActionClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "User not authenticated." };
  }

  // Validate name
  if (!formData.name.trim()) {
    return { error: "Organization name is required." };
  }

  try {
    const { data: updatedOrg, error: updateError } = await supabase
      .from("organizations")
      .update({
        name: formData.name,
        team_size: formData.team_size,
        website: formData.website,
        industry: formData.industry,
        department: formData.department,
        position: formData.position,
      })
      .eq("id", orgId)
      .select("id, name")
      .single();
    if (updateError || !updatedOrg) {
      return {
        error: updateError?.message ?? "Failed to update organization.",
      };
    }

    // Revalidate dashboard route
    revalidatePath("/dashboard");

    return { data: updatedOrg };
  } catch (error: any) {
    return { error: error?.message ?? "Unexpected error." };
  }
}
