"use server";

// Import the necessary Supabase SSR helpers and cookie functions
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sendTransactionalEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/constants";
import createSupabaseServerClient from "@/lib/supabase/server-client";

// Types (ensure consistency)
type CreditTransferType =
  | "starter"
  | "pro"
  | "elite"
  | "studio"
  | "balance"
  | "none";
type Invitation = {
  id: string;
  invited_email: string;
  role: string;
  status: string;
  transfer_credit_type: string;
  transfer_credit_amount: number | null;
  created_at: string;
  token?: string;
};

interface CreateInvitationParams {
  organization_id: string;
  invited_email: string;
  role: "admin" | "member";
  transfer_credit_type: CreditTransferType;
  transfer_credit_amount: number | null;
}

// Helper to get current user and check admin status for a given org
async function verifyAdmin(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  organization_id: string
) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("User not authenticated.");
  }

  const { data: memberData, error: memberError } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("organization_id", organization_id)
    .single(); // Expect exactly one membership row for user in this org

  if (memberError || !memberData || memberData.role !== "admin") {
    throw new Error("User is not an admin of this organization.");
  }
  return user; // Return the verified user object
}

export async function createInvitationAction(
  params: CreateInvitationParams
): Promise<{ data?: Invitation; error?: string }> {
  const supabase = await createSupabaseServerClient();

  try {
    // 1. Verify user is admin of the target organization
    const user = await verifyAdmin(supabase, params.organization_id);

    // 2. Validate input
    if (!params.invited_email || !params.invited_email.includes("@")) {
      return { error: "Invalid email address provided." };
    }
    // Enforce role and amount as per new requirements
    const actualRole = "member";
    let actualAmount = params.transfer_credit_amount;
    if (
      params.transfer_credit_type !== "balance" &&
      params.transfer_credit_type !== "none"
    ) {
      actualAmount = 1; // Always 1 for specific plan types
    }
    if (params.transfer_credit_type === "none") {
      actualAmount = null; // No amount for 'none'
    }

    // 3. Validate credit availability (Server-side check)
    if (params.transfer_credit_type !== "none") {
      const { data: orgCredits, error: creditError } = await supabase
        .from("credits")
        .select("balance, starter, pro, elite, studio")
        .eq("organization_id", params.organization_id)
        .single();

      if (creditError || !orgCredits) {
        console.error(
          "Failed to fetch org credits for validation:",
          creditError
        );
        return { error: "Could not verify organization credits." };
      }

      const amountNeeded =
        params.transfer_credit_type === "balance" ? actualAmount! : 1;
      let hasEnoughCredits = false;

      switch (params.transfer_credit_type) {
        case "starter":
          hasEnoughCredits = orgCredits.starter >= amountNeeded;
          break;
        case "pro":
          hasEnoughCredits = orgCredits.pro >= amountNeeded;
          break;
        case "elite":
          hasEnoughCredits = orgCredits.elite >= amountNeeded;
          break;
        case "studio":
          hasEnoughCredits = orgCredits.studio >= amountNeeded;
          break;
        case "balance":
          hasEnoughCredits = orgCredits.balance >= amountNeeded;
          break;
      }

      if (!hasEnoughCredits) {
        return {
          error: `Insufficient ${params.transfer_credit_type} credits available.`,
        };
      }
    }

    // 4. Check for existing PENDING invitation for the same email/org
    const { data: existingInvite, error: existingError } = await supabase
      .from("invitations")
      .select("id")
      .eq("organization_id", params.organization_id)
      .eq("invited_email", params.invited_email)
      .eq("status", "pending")
      .maybeSingle();

    if (existingError) {
      console.error("Error checking existing invites:", existingError);
      return { error: "Failed to check existing invitations." };
    }
    if (existingInvite) {
      return {
        error: `Pending invitation for ${params.invited_email} already exists.`,
      };
    }

    // 5. Insert the invitation
    const { data: newInvite, error: insertError } = await supabase
      .from("invitations")
      .insert({
        organization_id: params.organization_id,
        invited_email: params.invited_email,
        role: actualRole,
        invited_by_user_id: user.id,
        transfer_credit_type: params.transfer_credit_type,
        transfer_credit_amount: actualAmount,
      })
      .select("*, token")
      .single();

    if (insertError) {
      console.error("Error inserting invitation:", insertError);
      return { error: `Failed to create invitation: ${insertError.message}` };
    }
    if (!newInvite)
      return { error: "Failed to create invitation, no data returned." };

    // TODO: Send invitation email with newInvite.token
    console.log(
      `TODO: Send email to ${newInvite.invited_email} with token ${newInvite.token}`
    );

    // 6. Revalidate path for the specific org's invitation page
    revalidatePath(
      `/dashboard/organization/${params.organization_id}/invitations`
    );

    return { data: newInvite as Invitation };
  } catch (error: any) {
    console.error("Error in createInvitationAction:", error);
    return { error: error.message || "An unexpected error occurred." };
  }
}

export async function generateUniversalInviteTokenAction(
  organizationId: string
): Promise<{ token?: string; error?: string }> {
  const supabase = await createSupabaseServerClient();
  try {
    await verifyAdmin(supabase, organizationId);
    const newUniversalToken = crypto.randomUUID();

    const { error: updateError } = await supabase
      .from("organizations")
      .update({
        invite_token: newUniversalToken,
        invite_token_generated_at: new Date().toISOString(),
      })
      .eq("id", organizationId);

    if (updateError) {
      console.error(
        "Error updating organization with new universal token:",
        updateError
      );
      return {
        error: `Failed to generate universal invite link: ${updateError.message}`,
      };
    }
    revalidatePath(`/dashboard`); // Or a more specific path if needed
    return { token: newUniversalToken };
  } catch (error: any) {
    return {
      error:
        error.message || "An unexpected error occurred while generating link.",
    };
  }
}

export async function revokeUniversalInviteTokenAction(
  organizationId: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();
  try {
    await verifyAdmin(supabase, organizationId);
    const { error: updateError } = await supabase
      .from("organizations")
      .update({
        invite_token: null,
        invite_token_generated_at: null,
      })
      .eq("id", organizationId);

    if (updateError) {
      console.error("Error revoking universal invite token:", updateError);
      return {
        error: `Failed to revoke universal invite link: ${updateError.message}`,
      };
    }
    revalidatePath(`/dashboard`);
    return { success: true };
  } catch (error: any) {
    return {
      error:
        error.message || "An unexpected error occurred while revoking link.",
    };
  }
}

// Optional: Action to resend invite (needs email sending logic)
export async function resendInvitationAction(invitationId: string) {
  // 1. Verify admin status for the org associated with invitationId
  // 2. Fetch invitation details (token, email)
  // 3. Re-send email
  console.log("Resend action called for:", invitationId);
  // ... implementation needed
}

export async function deleteInvitationAction(
  invitationId: string,
  organizationId: string // Pass organizationId for admin verification and revalidation
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();
  try {
    await verifyAdmin(supabase, organizationId); // Verify admin for the org of the invitation

    const { error } = await supabase
      .from("invitations")
      .delete()
      .eq("id", invitationId)
      .eq("organization_id", organizationId); // Ensure deleting from correct org

    if (error) {
      console.error("Error deleting invitation:", error);
      return { error: `Failed to delete invitation: ${error.message}` };
    }
    revalidatePath(`/dashboard/organization/${organizationId}/invitations`); // Revalidate list
    return { success: true };
  } catch (error: any) {
    return {
      error:
        error.message ||
        "An unexpected error occurred while deleting invitation.",
    };
  }
}

// Placeholder for Resend - actual email sending logic needed
export async function resendInvitationEmailAction(
  invitationId: string,
  organizationId: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();
  try {
    await verifyAdmin(supabase, organizationId);
    const { data: invite, error: fetchError } = await supabase
      .from("invitations")
      .select("invited_email, token")
      .eq("id", invitationId)
      .eq("organization_id", organizationId)
      .single();

    if (fetchError || !invite) {
      return { error: "Invitation not found or error fetching details." };
    }

    // TODO: Implement actual email sending logic with invite.invited_email and invite.token
    console.log(
      `SIMULATING: Resend email to ${invite.invited_email} with token ${invite.token}`
    );
    // For example: await sendZeptoMail(invite.invited_email, invite.token, organization.name);

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to resend invitation." };
  }
}

const inviteEmailsSchema = z.object({
  organizationId: z.string().uuid(),
  emails: z
    .array(z.string().email({ message: "Invalid email address." }))
    .min(1, "At least one email is required."),
  host: z.string().optional(), // For constructing the invite link
});

interface ActionResult {
  success: boolean;
  message?: string;
  errors?: { email: string; error?: string }[];
}

export async function sendOrganizationInvitesAction(
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "User not authenticated." };
  }

  const organizationId = formData.get("organizationId") as string;
  const emailListString = formData.get("emails") as string;
  const emails = emailListString
    .split(/[\s,]+/)
    .filter((email) => email.length > 0);
  const host = (formData.get("host") as string) || getBaseUrl();

  const validation = inviteEmailsSchema.safeParse({
    organizationId,
    emails,
    host,
  });

  if (!validation.success) {
    const formattedErrors = validation.error.flatten().fieldErrors;
    const emailErrors =
      formattedErrors.emails?.map((err, index) => ({
        email: emails[index] || "unknown",
        error: err,
      })) || [];
    return {
      success: false,
      message: "Validation failed.",
      errors: emailErrors,
    };
  }

  const { organizationId: orgId, emails: validEmails } = validation.data;

  try {
    // 1. Verify admin status
    const { data: memberData, error: memberError } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", orgId)
      .eq("user_id", user.id)
      .single();

    if (memberError || memberData?.role !== "admin") {
      return {
        success: false,
        message: "User is not an admin of this organization.",
      };
    }

    // 2. Fetch organization details (owner_id and current universal token)
    const { data: orgData, error: orgError } = await supabase
      .from("organizations")
      .select("name, owner_user_id, invite_token")
      .eq("id", orgId)
      .single();

    if (orgError || !orgData) {
      return { success: false, message: "Organization not found." };
    }

    let {
      name: orgName,
      owner_user_id: orgOwnerId,
      invite_token: universalInviteToken,
    } = orgData;

    // 3. If no universal token exists, generate one (should be rare after initial setup)
    if (!universalInviteToken) {
      const { data: newToken, error: tokenError } = await supabase.rpc(
        "generate_org_invite_token",
        { p_org_id: orgId }
      );
      if (tokenError || !newToken) {
        return {
          success: false,
          message: `Failed to generate invite token: ${
            tokenError?.message || "Unknown error"
          }`,
        };
      }
      universalInviteToken = newToken;
    }

    // 4. Check if the org owner has enough team credits (1 per invite)
    const { data: creditData, error: creditError } = await supabase
      .from("credits")
      .select("team")
      .eq("user_id", orgOwnerId) // Credits belong to the owner
      .eq("organization_id", orgId)
      .single();

    if (creditError || !creditData) {
      return {
        success: false,
        message: `Error fetching organization credits: ${
          creditError?.message || "Not found"
        }`,
      };
    }
    if (creditData.team < validEmails.length) {
      return {
        success: false,
        message: `Insufficient team credits. Required: ${validEmails.length}, Available: ${creditData.team}. Please purchase more credits.`,
      };
    }

    const inviteLink = `${host}/accept-invite?token=${encodeURIComponent(
      universalInviteToken
    )}&orgId=${encodeURIComponent(orgId)}`;
    const results: { email: string; error?: string; success: boolean }[] = [];
    let successfulInvites = 0;

    for (const email of validEmails) {
      // Check if user is already a member or has a pending invite
      const { data: existingMember } = await supabase
        .from("organization_members")
        .select("id")
        .eq("organization_id", orgId)
        .eq("user_id", user.id) // This is wrong, should check by invited email -> user_id if exists
        .maybeSingle();

      // TODO: Better check for existing users by email
      // const { data: existingUserByEmail } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
      // if (existingUserByEmail?.id) { ... check if that user.id is in org_members ... }

      // Check for existing pending invitation to this email for this org
      const { data: existingInvite } = await supabase
        .from("invitations")
        .select("id")
        .eq("organization_id", orgId)
        .eq("invited_email", email)
        .eq("status", "pending")
        .maybeSingle();

      if (existingInvite) {
        results.push({
          email,
          error: "User already has a pending invitation.",
          success: false,
        });
        continue;
      }

      // 5. Send email
      const emailSubject = `You're invited to join ${orgName} on Headsshot`;
      const emailHtmlBody = `<p>Hello,</p><p>You have been invited to join the organization "${orgName}" on Headsshot.</p><p>Click the link below to accept the invitation:</p><p><a href="${inviteLink}">${inviteLink}</a></p><p>If you were not expecting this invitation, you can safely ignore this email.</p><p>Thanks,<br/>The Headsshot Team</p>`;
      const emailTextBody = `Hello,\n\nYou have been invited to join the organization "${orgName}" on Headsshot.\n\nAccept the invitation here: ${inviteLink}\n\nIf you were not expecting this invitation, you can safely ignore this email.\n\nThanks,\nThe Headsshot Team`;

      const emailResult = await sendTransactionalEmail(
        [{ email_address: { address: email } }],
        emailSubject,
        emailHtmlBody,
        emailTextBody
      );

      if (!emailResult.success) {
        results.push({
          email,
          error: emailResult.error || "Failed to send email.",
          success: false,
        });
        continue;
      }

      // 6. Record the invitation (no specific token, uses org's universal token)
      const { error: inviteInsertError } = await supabase
        .from("invitations")
        .insert({
          organization_id: orgId,
          invited_by_user_id: user.id,
          invited_email: email,
          role: "member", // Default role
          status: "pending",
          token: universalInviteToken, // Store the universal token used for this batch
          expires_at: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(), // e.g., 7 days expiry
        });

      if (inviteInsertError) {
        results.push({
          email,
          error: `Failed to record invitation: ${inviteInsertError.message}`,
          success: false,
        });
        continue;
      }

      // 7. Deduct credit (This is done on acceptance via accept_organization_invite_with_credit_transfer)
      // No deduction at the point of sending the email.

      results.push({ email, success: true });
      successfulInvites++;
    }

    if (successfulInvites === validEmails.length) {
      return { success: true, message: "All invitations sent successfully!" };
    } else {
      return {
        success: false,
        message: `Sent ${successfulInvites} of ${validEmails.length} invitations. Some had issues.`,
        errors: results.filter((r) => !r.success),
      };
    }
  } catch (error: any) {
    console.error("Error sending organization invites:", error);
    return {
      success: false,
      message: `An unexpected error occurred: ${error.message}`,
    };
  }
}

export async function generateNewShareableLinkAction(
  formData: FormData
): Promise<{ success: boolean; newLink?: string; message?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const organizationId = formData.get("organizationId") as string;
  const host = (formData.get("host") as string) || getBaseUrl();

  if (!user) {
    return { success: false, message: "User not authenticated." };
  }
  if (!organizationId) {
    return { success: false, message: "Organization ID is required." };
  }

  try {
    // Verify admin status first (using the function directly does this too, but good practice)
    const { data: memberData, error: memberError } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .single();

    if (memberError || memberData?.role !== "admin") {
      return {
        success: false,
        message: "User is not an admin of this organization.",
      };
    }

    const { data: newToken, error: rpcError } = await supabase.rpc(
      "generate_org_invite_token",
      { p_org_id: organizationId }
    );

    if (rpcError || !newToken) {
      return {
        success: false,
        message: `Failed to generate new link: ${
          rpcError?.message || "Unknown RPC error"
        }`,
      };
    }

    const newLink = `${host}/accept-invite?token=${encodeURIComponent(
      newToken
    )}&orgId=${encodeURIComponent(organizationId)}`;
    return { success: true, newLink, message: "New shareable link generated!" };
  } catch (error: any) {
    console.error("Error generating new shareable link:", error);
    return {
      success: false,
      message: `An unexpected error occurred: ${error.message}`,
    };
  }
}
