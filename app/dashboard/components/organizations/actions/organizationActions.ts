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

// Expected shape of the data returned by the RPC function
interface CreateOrgRpcResponse {
  created_org_id: string;
  created_org_name: string;
}

// Expected shape of the parameters for the RPC function
interface CreateOrgRpcParams {
  p_owner_user_id: string;
  p_org_name: string;
  p_team_size: number | null;
  p_website: string | null;
  p_industry: string | null;
  p_department: string | null;
  p_position: string | null;
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

  // Validate name (though the function also does basic validation)
  if (!formData.name.trim()) {
    return { error: "Organization name is required." };
  }

  try {
    const rpcParams: CreateOrgRpcParams = {
      p_owner_user_id: ownerUserId,
      p_org_name: formData.name,
      p_team_size: formData.team_size,
      p_website: formData.website,
      p_industry: formData.industry,
      p_department: formData.department,
      p_position: formData.position,
    };

    // Call the database function. Types for `data` and `error` will be inferred.
    // The .single() method should correctly type `data` based on the function's return signature.
    const { data, error: rpcError } = await supabase
      .rpc("create_organization_with_initial_setup", rpcParams)
      .single<CreateOrgRpcResponse>(); // Apply the type to .single()

    if (rpcError) {
      if (
        rpcError.message.includes(
          "duplicate key value violates unique constraint"
        )
      ) {
        return {
          error:
            "A user can only own one organization, or this organization name might already be taken.",
        };
      }
      return {
        error: rpcError.message ?? "Failed to create organization using RPC.",
      };
    }

    // data should now be CreateOrgRpcResponse | null
    if (!data || !data.created_org_id) {
      return {
        error:
          "Failed to create organization: No data returned from function or missing ID.",
      };
    }

    const orgData: CreatedOrgData = {
      id: data.created_org_id,
      name: data.created_org_name,
    };

    // Revalidate dashboard route
    revalidatePath("/dashboard");

    return { data: orgData };
  } catch (error: any) {
    // Catch any other unexpected errors
    console.error("Unexpected error in createOrganizationAction:", error);
    return { error: error?.message ?? "An unexpected error occurred." };
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
