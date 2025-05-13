"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

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
          } catch (error) {
            /* Server component, ignore */
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            /* Server component, ignore */
          }
        },
      },
    }
  );
};

interface AcceptUniversalInviteParams {
  universalToken: string;
  organizationId: string;
}

export async function acceptUniversalInviteAction(
  params: AcceptUniversalInviteParams
): Promise<{ data?: any; error?: string }> {
  const supabase = createServerActionClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "User not authenticated. Please log in and try again." };
  }

  if (!params.universalToken || !params.organizationId) {
    return { error: "Missing invite token or organization ID." };
  }

  try {
    const { data, error } = await supabase.rpc(
      "accept_organization_invite_with_credit_transfer",
      {
        p_user_id: user.id,
        p_organization_id: params.organizationId,
        p_invite_token: params.universalToken,
      }
    );

    if (error) {
      console.error(
        "Error calling accept_organization_invite_with_credit_transfer RPC:",
        error
      );
      return { error: error.message || "Failed to accept invitation via RPC." };
    }

    // The RPC function returns a JSONB object. 'data' here is that object.
    // If the RPC itself returns an object like { error: 'some message' }, we need to check that.
    if (data && data.error) {
      return { error: data.error };
    }

    if (data && data.success) {
      revalidatePath("/dashboard"); // Revalidate dashboard to reflect new org membership
      // Also revalidate account context related paths potentially, or rely on client-side refreshContext
      return { data: data };
    }

    // Fallback for unexpected RPC response structure
    return {
      error: "Unexpected response from server when accepting invitation.",
    };
  } catch (e: any) {
    console.error("Exception in acceptUniversalInviteAction:", e);
    return { error: e.message || "An unexpected error occurred." };
  }
}
