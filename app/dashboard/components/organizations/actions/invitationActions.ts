"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sendOrganizationInviteEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/utils";
import createSupabaseServerClient from "@/lib/supabase/server-client";

// Types are now imported from a shared location, so no local definitions are needed.
interface ActionResult {
  success: boolean;
  message?: string;
  errors?: { email: string; error: string }[];
}

// Helper to get current user and check admin status for a given org
async function verifyAdmin(
  organization_id: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
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
    .single();

  if (memberError || !memberData || memberData.role !== "admin") {
    throw new Error("User is not an admin of this organization.");
  }
  return user;
}

export async function sendOrganizationInvitesAction(
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const rawEmails = formData.get("emails") as string;
  const organizationId = formData.get("organizationId") as string;
  const host = getBaseUrl();

  try {
    const adminUser = await verifyAdmin(organizationId, supabase);

    const { data: orgData, error: orgError } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", organizationId)
      .single();

    if (orgError || !orgData) throw new Error("Organization not found.");

    const emails = Array.from(
      new Set(rawEmails.split(/[\s,]+/).filter(Boolean))
    );
    if (emails.length === 0) {
      return { success: false, message: "No valid email addresses provided." };
    }

    const { data: orgCredits, error: creditError } = await supabase
      .from("credits")
      .select("team")
      .eq("organization_id", organizationId)
      .single();

    if (creditError) throw new Error("Could not verify organization credits.");
    if (!orgCredits || orgCredits.team < emails.length) {
      return {
        success: false,
        message: `Insufficient team credits. You need ${
          emails.length
        }, but only have ${orgCredits?.team ?? 0}.`,
      };
    }

    const results = await Promise.all(
      emails.map(async (email) => {
        try {
          z.string().email({ message: "Invalid email format." }).parse(email);

          const { data: isMember, error: rpcError } = await supabase.rpc(
            "is_email_org_member",
            {
              p_email: email,
              p_org_id: organizationId,
            }
          );
          if (rpcError)
            throw new Error(`Could not verify email: ${rpcError.message}`);
          if (isMember) {
            return {
              email,
              error: "User is already a member of this organization.",
            };
          }

          const { data: existingInvite } = await supabase
            .from("invitations")
            .select("id")
            .eq("organization_id", organizationId)
            .eq("invited_email", email)
            .eq("status", "pending")
            .maybeSingle();

          if (existingInvite) {
            return {
              email,
              error: "An active invitation for this email already exists.",
            };
          }

          const uniqueToken = crypto.randomUUID();

          const { error: insertError } = await supabase
            .from("invitations")
            .insert({
              organization_id: organizationId,
              invited_by_user_id: adminUser.id,
              invited_email: email,
              role: "member",
              status: "pending",
              token: uniqueToken,
              transfer_credit_type: "team",
              transfer_credit_amount: null,
            });

          if (insertError) {
            throw new Error(`Database Error: ${insertError.message}`);
          }

          try {
            await sendOrganizationInviteEmail({
              to: email,
              inviterName: adminUser.email!,
              organizationName: orgData.name,
              inviteUrl: `${host}/accept-invite?token=${uniqueToken}`,
            });
          } catch (emailError) {
            console.error(
              `Failed to send invite email to ${email}:`,
              emailError
            );
            throw new Error(
              `Database record created, but failed to send email. Please try again.`
            );
          }

          return { email, success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "An unknown server error occurred.";
          console.error(
            `Error processing invitation for ${email}:`,
            errorMessage
          );
          return { email, error: errorMessage };
        }
      })
    );

    const successfulInvites = results.filter((r) => r.success);
    const failedInvites = results.filter((r) => r.error);

    if (successfulInvites.length > 0) {
      revalidatePath(`/dashboard`);
    }

    if (failedInvites.length === 0) {
      return {
        success: true,
        message: `${successfulInvites.length} invitation(s) sent successfully.`,
      };
    }

    return {
      success: successfulInvites.length > 0,
      message: `${successfulInvites.length} sent, ${failedInvites.length} failed. See details below.`,
      errors: failedInvites.map(({ email, error }) => ({
        email,
        error: error!,
      })),
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An unexpected server error occurred.",
    };
  }
}

export async function generateShareableLinkAction(
  organizationId: string
): Promise<{ data?: string; error?: string }> {
  const supabase = await createSupabaseServerClient();
  try {
    // Verify the user is an admin before allowing token generation
    await verifyAdmin(organizationId, supabase);

    const { data, error } = await supabase.rpc("generate_org_invite_token", {
      p_org_id: organizationId,
    });

    if (error) {
      return { error: `Failed to generate link: ${error.message}` };
    }
    revalidatePath("/dashboard");
    return { data };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function revokeShareableLinkAction(
  organizationId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();
  try {
    await verifyAdmin(organizationId, supabase);
    const { error } = await supabase
      .from("organizations")
      .update({ invite_token: null, invite_token_generated_at: null })
      .eq("id", organizationId);

    if (error) {
      return {
        success: false,
        error: `Failed to revoke link: ${error.message}`,
      };
    }
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
