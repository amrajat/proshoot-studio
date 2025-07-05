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

interface AcceptInvitationParams {
  token: string;
}

export async function acceptInvitationAction(
  params: AcceptInvitationParams
): Promise<{ data?: any; error?: string }> {
  const supabase = createServerActionClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "User not authenticated. Please log in and try again." };
  }

  if (!params.token) {
    return { error: "Missing invitation token." };
  }

  try {
    const { data, error: rpcError } = await supabase.rpc("accept_invitation", {
      p_invite_token: params.token,
      p_accepting_user_id: user.id,
      p_accepting_user_email: user.email,
    });

    if (rpcError) {
      console.error("Error calling accept_invitation RPC:", rpcError);
      return { error: rpcError.message || "Failed to accept invitation." };
    }

    if (data && data.error) {
      return { error: data.error };
    }

    if (data && data.success) {
      revalidatePath("/dashboard", "layout");
      return { data };
    }

    return {
      error: "An unexpected error occurred while accepting the invitation.",
    };
  } catch (e: any) {
    console.error("Exception in acceptInvitationAction:", e);
    return { error: e.message || "An unexpected server error occurred." };
  }
}
