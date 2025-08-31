"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import createSupabaseServerClient from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";
import { sendOrganizationInviteEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/utils";
import { env, publicEnv } from "@/lib/env";

/**
 * Transfer team credits from organization owner to a member
 * Uses service role for secure credit manipulation
 */
export async function transferTeamCreditsAction(formData) {
  try {
    const memberUserId = formData.get("memberUserId");
    const organizationId = formData.get("organizationId");
    const creditsAmount = parseInt(formData.get("creditsAmount"));
    const creditType = formData.get("creditType") || "team"; // Default to team credits

    if (!memberUserId || !organizationId || !creditsAmount) {
      return {
        success: false,
        error: "Missing required parameters",
      };
    }

    if (creditsAmount <= 0) {
      return {
        success: false,
        error: "Credits amount must be positive",
      };
    }

    if (!["team", "balance"].includes(creditType)) {
      return {
        success: false,
        error: "Invalid credit type. Must be 'team' or 'balance'",
      };
    }

    // Get current user (organization owner)
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Use service role client for credit transfer
    const cookieStore = cookies();
    const serviceSupabase = createServerClient(
      publicEnv.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name, options) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    const { data, error } = await serviceSupabase.rpc(
      "transfer_team_credits_to_member",
      {
        p_owner_user_id: user.id,
        p_member_user_id: memberUserId,
        p_organization_id: organizationId,
        p_credits_amount: creditsAmount,
        p_skip_membership_check: false,
        p_credit_type: creditType,
      }
    );

    if (error) {
      console.error("Credit transfer error:", error);
      return {
        success: false,
        error: "Failed to transfer credits",
      };
    }

    if (!data.success) {
      return {
        success: false,
        error: data.error,
        availableCredits: data.available_credits,
      };
    }

    // Revalidate the page to show updated credits
    revalidatePath("/organizations");

    return {
      success: true,
      message: `Successfully transferred ${creditsAmount} credits`,
      creditsTransferred: data.credits_transferred,
    };
  } catch (error) {
    console.error("Transfer credits action error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Get organization members with their credit information
 */
export async function getOrganizationMembersWithCreditsAction(organizationId) {
  try {
    if (!organizationId) {
      throw new Error("Organization ID is required");
    }

    const supabase = await createSupabaseServerClient();

    // Verify user is organization owner
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Authentication required");
    }

    // Check if user is organization owner
    const { data: orgData, error: orgError } = await supabase
      .from("organizations")
      .select("owner_user_id")
      .eq("id", organizationId)
      .single();

    if (orgError || !orgData || orgData.owner_user_id !== user.id) {
      throw new Error("Only organization owner can view member credits");
    }

    // Get members with credits using RPC function
    const { data, error } = await supabase.rpc(
      "get_organization_members_with_credits",
      { p_organization_id: organizationId }
    );

    if (error) {
      console.error("Get members with credits error:", error);
      throw new Error("Failed to fetch member credits");
    }

    return {
      success: true,
      members: data || [],
    };
  } catch (error) {
    console.error("Get organization members action error:", error);
    return {
      success: false,
      error: error.message,
      members: [],
    };
  }
}

/**
 * Get member credit transaction history
 */
export async function getMemberCreditHistoryAction(memberUserId, limit = 50) {
  try {
    if (!memberUserId) {
      throw new Error("Member user ID is required");
    }

    const supabase = await createSupabaseServerClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Authentication required");
    }

    // Get credit history using RPC function
    const { data, error } = await supabase.rpc("get_member_credit_history", {
      p_member_user_id: memberUserId,
      p_limit: limit,
    });

    if (error) {
      console.error("Get member credit history error:", error);
      throw new Error("Failed to fetch credit history");
    }

    return {
      success: true,
      history: data || [],
    };
  } catch (error) {
    console.error("Get member credit history action error:", error);
    return {
      success: false,
      error: error.message,
      history: [],
    };
  }
}

/**
 * Resend organization invitation
 */
export async function resendInvitationAction(formData) {
  try {
    const invitationId = formData.get("invitationId");
    const organizationId = formData.get("organizationId");

    if (!invitationId || !organizationId) {
      return {
        success: false,
        error: "Invitation ID and Organization ID are required",
      };
    }

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.rpc(
      "resend_organization_invitation",
      {
        p_organization_id: organizationId,
        p_invitation_id: invitationId,
      }
    );

    if (error) {
      console.error("Resend invitation error:", error);
      return {
        success: false,
        error: "Failed to resend invitation",
      };
    }

    if (!data.success) {
      return {
        success: false,
        error: data.error,
      };
    }

    // Send the actual email
    if (data.email) {
      try {
        // Get organization and inviter details for email
        const { data: orgData } = await supabase
          .from("organizations")
          .select("name")
          .eq("id", organizationId)
          .single();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        // Get invitation token for the email link
        const { data: inviteData } = await supabase
          .from("invitations")
          .select("token")
          .eq("id", invitationId)
          .single();

        if (orgData && user && inviteData?.token) {
          const host = getBaseUrl();
          await sendOrganizationInviteEmail({
            to: data.email,
            inviterName: user.email,
            organizationName: orgData.name,
            inviteUrl: `${host}/accept-invite?token=${inviteData.token}`,
          });
        }
      } catch (emailError) {
        console.error("Failed to send resend email:", emailError);
        // Don't fail the whole operation if email fails
      }
    }

    // Revalidate the page
    revalidatePath("/organizations");

    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    console.error("Resend invitation action error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Remove/cancel organization invitation
 */
export async function removeInvitationAction(formData) {
  try {
    const invitationId = formData.get("invitationId");
    const organizationId = formData.get("organizationId");

    if (!invitationId || !organizationId) {
      return {
        success: false,
        error: "Invitation ID and Organization ID are required",
      };
    }

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.rpc(
      "remove_organization_invitation",
      {
        p_organization_id: organizationId,
        p_invitation_id: invitationId,
      }
    );

    if (error) {
      console.error("Remove invitation error:", error);
      return {
        success: false,
        error: "Failed to remove invitation",
      };
    }

    if (!data.success) {
      return {
        success: false,
        error: data.error,
      };
    }

    // Revalidate the page
    revalidatePath("/organizations");

    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    console.error("Remove invitation action error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
