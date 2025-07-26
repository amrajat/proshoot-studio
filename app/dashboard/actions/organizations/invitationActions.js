"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sendOrganizationInviteEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/utils";
import createSupabaseServerClient from "@/lib/supabase/server-client";

// ===== VALIDATION SCHEMAS =====
const emailSchema = z.string().email({ message: "Invalid email format" });
const uuidSchema = z.string().uuid({ message: "Invalid UUID format" });

const inviteFormSchema = z.object({
  emails: z.string().min(1, "At least one email is required"),
  organizationId: z.string().uuid("Invalid organization ID"),
  host: z.string().url("Invalid host URL"),
});

// ===== CONSTANTS =====
const INVITATION_EXPIRY_DAYS = 7;
const MAX_INVITATIONS_PER_REQUEST = 50;

/**
 * Verify Organization Owner Helper Function
 *
 * Checks if the current user is the owner of the specified organization.
 * Uses the new database schema with proper validation.
 *
 * @param {string} organizationId - Organization ID to check ownership for
 * @param {Object} supabase - Supabase client instance
 * @returns {Promise<Object>} User and organization data if owner
 * @throws {Error} When user is not authenticated or not the owner
 */
async function verifyOrganizationOwner(organizationId, supabase) {
  try {
    // Validate organization ID format
    uuidSchema.parse(organizationId);

    // ===== AUTHENTICATION CHECK =====
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      throw new Error(`Authentication error: ${authError.message}`);
    }

    if (!user) {
      throw new Error("User not authenticated");
    }

    // ===== OWNERSHIP CHECK =====
    const { data: orgData, error: orgError } = await supabase
      .from("organizations")
      .select("owner_user_id, name")
      .eq("id", organizationId)
      .single();

    if (orgError) {
      if (orgError.code === "PGRST116") {
        throw new Error("Organization not found");
      }
      throw new Error(`Database error: ${orgError.message}`);
    }

    if (!orgData || orgData.owner_user_id !== user.id) {
      throw new Error("Only organization owners can perform this action");
    }

    return { user, organization: orgData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error("Invalid organization ID format");
    }
    throw error;
  }
}

/**
 * Check if email is already a member of the organization
 *
 * @param {string} email - Email to check
 * @param {string} organizationId - Organization ID
 * @param {Object} supabase - Supabase client
 * @returns {Promise<boolean>} True if already a member
 */
async function isEmailAlreadyMember(email, organizationId, supabase) {
  const { data, error } = await supabase
    .from("members")
    .select("id")
    .eq("organization_id", organizationId)
    .eq(
      "user_id",
      supabase.auth
        .getUser()
        .then(({ data }) =>
          supabase.from("profiles").select("id").eq("email", email).single()
        )
    )
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Error checking membership: ${error.message}`);
  }

  return !!data;
}

/**
 * Check if email has pending invitation
 *
 * @param {string} email - Email to check
 * @param {string} organizationId - Organization ID
 * @param {Object} supabase - Supabase client
 * @returns {Promise<boolean>} True if has pending invitation
 */
async function hasPendingInvitation(email, organizationId, supabase) {
  const { data, error } = await supabase
    .from("invitations")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("invited_email", email)
    .eq("status", "PENDING")
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Error checking pending invitations: ${error.message}`);
  }

  return !!data;
}

/**
 * Generate unique invitation token
 *
 * @returns {string} Unique token
 */
function generateInvitationToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Process single email invitation
 *
 * @param {string} email - Email to invite
 * @param {string} organizationId - Organization ID
 * @param {Object} organizationData - Organization data
 * @param {Object} inviterUser - User sending invitation
 * @param {Object} supabase - Supabase client
 * @param {string} host - Host URL for invite link
 * @returns {Promise<Object>} Result of invitation processing
 */
async function processSingleInvitation(
  email,
  organizationId,
  organizationData,
  inviterUser,
  supabase,
  host
) {
  try {
    // Validate email format
    emailSchema.parse(email);

    // Check if already a member (simplified check)
    const { data: existingMember } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (existingMember) {
      const { data: membershipCheck } = await supabase
        .from("members")
        .select("id")
        .eq("user_id", existingMember.id)
        .eq("organization_id", organizationId)
        .single();

      if (membershipCheck) {
        throw new Error("User is already a member of this organization");
      }
    }

    // Check for pending invitation
    if (await hasPendingInvitation(email, organizationId, supabase)) {
      throw new Error("User already has a pending invitation");
    }

    // Generate unique token and expiry
    const token = generateInvitationToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

    // Create invitation record
    const { data: invitationData, error: insertError } = await supabase
      .from("invitations")
      .insert({
        organization_id: organizationId,
        invited_email: email,
        role: "MEMBER",
        status: "PENDING",
        token: token,
        invited_by_user_id: inviterUser.id,
        expires_at: expiresAt.toISOString(),
      })
      .select("id")
      .single();

    if (insertError) {
      throw new Error(`Failed to create invitation: ${insertError.message}`);
    }

    // Send invitation email
    try {
      await sendOrganizationInviteEmail({
        to: email,
        inviterName: inviterUser.email,
        organizationName: organizationData.name,
        inviteUrl: `${host}/accept-invite?token=${token}`,
      });
    } catch (emailError) {
      console.error(`Failed to send invite email to ${email}:`, emailError);

      // Clean up invitation record if email failed
      await supabase.from("invitations").delete().eq("id", invitationData.id);

      throw new Error("Failed to send invitation email");
    }

    return { email, success: true, invitationId: invitationData.id };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`Error processing invitation for ${email}:`, errorMessage);
    return { email, error: errorMessage };
  }
}

/**
 * Send Organization Invites Server Action
 *
 * Processes bulk email invitations for organization membership with improved:
 * - Input validation and sanitization
 * - Credit verification and deduction
 * - Individual email processing with detailed error handling
 * - Email sending with proper cleanup on failure
 * - Comprehensive error reporting
 *
 * @param {any} prevState - Previous form state (for useFormState)
 * @param {FormData} formData - Form data containing emails and organization info
 * @returns {Promise<Object>} Action result with success status and detailed messages
 */
export async function sendOrganizationInvitesAction(prevState, formData) {
  try {
    // ===== INPUT VALIDATION =====
    const rawData = {
      emails: formData.get("emails"),
      organizationId: formData.get("organizationId"),
      host: formData.get("host") || getBaseUrl(),
    };

    const validatedData = inviteFormSchema.parse(rawData);
    const supabase = await createSupabaseServerClient();

    // ===== OWNER VERIFICATION =====
    const { user: inviterUser, organization: orgData } =
      await verifyOrganizationOwner(validatedData.organizationId, supabase);

    // ===== EMAIL PROCESSING =====
    const emails = Array.from(
      new Set(
        validatedData.emails
          .split(/[\s,;]+/)
          .map((email) => email.trim().toLowerCase())
          .filter((email) => email.length > 0)
      )
    );

    if (emails.length === 0) {
      return {
        success: false,
        message: "No valid email addresses provided",
      };
    }

    if (emails.length > MAX_INVITATIONS_PER_REQUEST) {
      return {
        success: false,
        message: `Too many invitations. Maximum ${MAX_INVITATIONS_PER_REQUEST} per request`,
      };
    }

    // ===== CREDIT VALIDATION =====
    const { data: orgCredits, error: creditError } = await supabase
      .from("credits")
      .select("team")
      .eq("organization_id", validatedData.organizationId)
      .single();

    if (creditError) {
      throw new Error("Could not verify organization credits");
    }

    const availableCredits = orgCredits?.team ?? 0;
    if (availableCredits < emails.length) {
      return {
        success: false,
        message: `Insufficient team credits. Need ${emails.length}, have ${availableCredits}`,
      };
    }

    // ===== PROCESS INVITATIONS =====
    const results = await Promise.all(
      emails.map((email) =>
        processSingleInvitation(
          email,
          validatedData.organizationId,
          orgData,
          inviterUser,
          supabase,
          validatedData.host
        )
      )
    );

    // ===== ANALYZE RESULTS =====
    const successfulInvites = results.filter((r) => r.success);
    const failedInvites = results.filter((r) => r.error);

    // ===== DEDUCT CREDITS FOR SUCCESSFUL INVITES =====
    if (successfulInvites.length > 0) {
      const { error: creditDeductError } = await supabase
        .from("credits")
        .update({
          team: availableCredits - successfulInvites.length,
          updated_at: new Date().toISOString(),
        })
        .eq("organization_id", validatedData.organizationId);

      if (creditDeductError) {
        console.error("Failed to deduct credits:", creditDeductError);
        // Note: Invitations were already sent, so we don't fail the entire operation
      }

      // Revalidate to refresh UI
      revalidatePath("/dashboard");
    }

    // ===== RETURN RESULTS =====
    if (failedInvites.length === 0) {
      return {
        success: true,
        message: `Successfully sent ${successfulInvites.length} invitation${
          successfulInvites.length > 1 ? "s" : ""
        }`,
      };
    }

    if (successfulInvites.length === 0) {
      return {
        success: false,
        message: "All invitations failed to send",
        errors: failedInvites.map(({ email, error }) => ({ email, error })),
      };
    }

    return {
      success: true, // Partial success
      message: `${successfulInvites.length} sent successfully, ${failedInvites.length} failed`,
      errors: failedInvites.map(({ email, error }) => ({ email, error })),
    };
  } catch (error) {
    console.error("Send invitations action error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Invalid input data",
        errors: error.errors.map((err) => ({
          field: err.path.join("."),
          error: err.message,
        })),
      };
    }

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Generate Shareable Link Server Action
 *
 * Creates or updates the organization's shareable invite token.
 * Uses the organizations table invite_token field.
 *
 * @param {string} organizationId - Organization ID to generate link for
 * @returns {Promise<Object>} Result with token data or error message
 */
export async function generateShareableLinkAction(organizationId) {
  try {
    const supabase = await createSupabaseServerClient();

    // ===== OWNER VERIFICATION =====
    const { organization: orgData } = await verifyOrganizationOwner(
      organizationId,
      supabase
    );

    // ===== GENERATE NEW TOKEN =====
    const newToken = generateInvitationToken();

    const { data, error } = await supabase
      .from("organizations")
      .update({
        invite_token: newToken,
        updated_at: new Date().toISOString(),
      })
      .eq("id", organizationId)
      .select("invite_token")
      .single();

    if (error) {
      throw new Error(`Failed to generate shareable link: ${error.message}`);
    }

    // ===== REVALIDATE & RETURN =====
    revalidatePath("/dashboard");

    return {
      success: true,
      data: data.invite_token,
    };
  } catch (error) {
    console.error("Generate shareable link error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate link",
    };
  }
}

/**
 * Revoke Shareable Link Server Action
 *
 * Removes the organization's shareable invite token for security.
 *
 * @param {string} organizationId - Organization ID to revoke link for
 * @returns {Promise<Object>} Result with success status or error message
 */
export async function revokeShareableLinkAction(organizationId) {
  try {
    const supabase = await createSupabaseServerClient();

    // ===== OWNER VERIFICATION =====
    await verifyOrganizationOwner(organizationId, supabase);

    // ===== REVOKE TOKEN =====
    const { error } = await supabase
      .from("organizations")
      .update({
        invite_token: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", organizationId);

    if (error) {
      throw new Error(`Failed to revoke shareable link: ${error.message}`);
    }

    // ===== REVALIDATE & RETURN =====
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Shareable link revoked successfully",
    };
  } catch (error) {
    console.error("Revoke shareable link error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to revoke link",
    };
  }
}
