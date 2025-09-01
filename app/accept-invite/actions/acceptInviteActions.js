"use server";

import createSupabaseServerClient from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Input validation schema
const AcceptInvitationSchema = z.object({
  token: z.string().min(1, "Invitation token is required"),
});

/**
 * Accept organization invitation and automatically transfer team credit
 * @param params - Invitation parameters containing token
 * @returns Result with success/error status and message
 */
export async function acceptInvitationAction(params) {
  try {
    // Validate input parameters
    const validationResult = AcceptInvitationSchema.safeParse(params);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors
        .map((err) => err.message)
        .join(", ");
      return { error: `Invalid parameters: ${errorMessage}` };
    }

    const { token } = validationResult.data;

    // Create Supabase client
    const supabase = await createSupabaseServerClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error(
        "Authentication error in acceptInvitationAction:",
        authError
      );
      return { error: "Authentication failed. Please log in and try again." };
    }

    if (!user) {
      return { error: "User not authenticated. Please log in and try again." };
    }

    if (!user.email) {
      return {
        error:
          "User email not found. Please ensure your account has a valid email address.",
      };
    }

    // Call the accept_invitation RPC function
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "accept_invitation",
      {
        p_invite_token: token,
        p_accepting_user_id: user.id,
        p_accepting_user_email: user.email,
      }
    );

    if (rpcError) {
      console.error("RPC error in accept_invitation:", rpcError);
      return {
        error:
          rpcError.message || "Failed to process invitation. Please try again.",
      };
    }

    // Handle RPC response
    if (!rpcData) {
      return {
        error: "No response from invitation processing. Please try again.",
      };
    }

    // Check if the RPC function returned an error
    if (rpcData.error) {
      return { error: rpcData.error };
    }

    // Check if the invitation was processed successfully
    if (rpcData.success) {
      // Revalidate relevant paths to update the UI
      revalidatePath("/", "layout");
      revalidatePath("/organizations", "page");
      revalidatePath("/billing", "page");

      return {
        data: {
          success: true,
          message: rpcData.message || "Successfully joined the organization!",
        },
      };
    }

    // Fallback error case
    return {
      error:
        "Failed to process invitation. Please check the invitation link and try again.",
    };
  } catch (error) {
    console.error("Unexpected error in acceptInvitationAction:", error);

    // Return user-friendly error message
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      error: `An unexpected error occurred: ${errorMessage}. Please try again later.`,
    };
  }
}
