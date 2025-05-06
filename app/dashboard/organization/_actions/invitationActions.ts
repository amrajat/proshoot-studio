"use server";

// Import the necessary Supabase SSR helpers and cookie functions
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Function to create the default server client (user context) for this action
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
            // Ignore server component errors
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Ignore server component errors
          }
        },
      },
    }
  );
};

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
  created_at: string /* ... */;
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
  supabase: ReturnType<typeof createServerActionClient>,
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
  const supabase = createServerActionClient();

  try {
    // 1. Verify user is admin of the target organization
    const user = await verifyAdmin(supabase, params.organization_id);

    // 2. Validate input
    if (!params.invited_email || !params.invited_email.includes("@")) {
      return { error: "Invalid email address provided." };
    }
    if (
      params.transfer_credit_type === "balance" &&
      (!params.transfer_credit_amount || params.transfer_credit_amount <= 0)
    ) {
      return { error: "Invalid transfer amount for balance type." };
    }
    if (
      params.transfer_credit_type !== "balance" &&
      params.transfer_credit_amount !== null
    ) {
      return { error: "Transfer amount should only be set for balance type." };
    }
    // Prevent inviting self? Maybe check if invited_email === user.email

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
        params.transfer_credit_type === "balance"
          ? params.transfer_credit_amount!
          : 1;
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
          error: `Insufficient ${params.transfer_credit_type} credits available in the organization.`,
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
        error: `There is already a pending invitation for ${params.invited_email}.`,
      };
    }

    // 5. Insert the invitation
    const { data: newInvite, error: insertError } = await supabase
      .from("invitations")
      .insert({
        organization_id: params.organization_id,
        invited_email: params.invited_email,
        role: params.role,
        invited_by_user_id: user.id, // Log who sent it
        transfer_credit_type: params.transfer_credit_type,
        transfer_credit_amount: params.transfer_credit_amount,
        // token is generated by default trigger/value
        // status is 'pending' by default
      })
      .select("*") // Select the full invite data to return
      .single();

    if (insertError) {
      console.error("Error inserting invitation:", insertError);
      return { error: `Failed to create invitation: ${insertError.message}` };
    }

    // TODO: Send invitation email containing the token/link
    // Use a service like Resend, SendGrid, or Supabase Auth invite features (if applicable)
    // Link should point to e.g., /accept-invite?token=...

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

// Optional: Action to resend invite (needs email sending logic)
export async function resendInvitationAction(invitationId: string) {
  // 1. Verify admin status for the org associated with invitationId
  // 2. Fetch invitation details (token, email)
  // 3. Re-send email
  console.log("Resend action called for:", invitationId);
  // ... implementation needed
}
