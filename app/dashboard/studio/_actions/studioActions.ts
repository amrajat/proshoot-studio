"use server";

import createSupabaseServerClient from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import * as z from "zod";

// Define Zod schema matching the form from CreateStudioForm.jsx
const formSchema = z.object({
  contextId: z.string().min(1), // 'personal' or org UUID
  studioName: z.string().min(3).max(50),
  creditType: z.enum(["starter", "pro", "elite", "studio"]),
  // previewUrls and resultUrls are optional and handled if passed
  previewUrls: z.string().optional(),
  resultUrls: z.string().optional(),
});

// Input type derived from Zod schema
type CreateStudioInput = z.infer<typeof formSchema>;

// Type for the credit type column names
type CreditTypeColumn = "starter" | "pro" | "elite" | "studio";

// Helper to parse URLs from textarea (one URL per line)
const parseUrls = (urlStr?: string): string[] => {
  if (!urlStr) return [];
  return urlStr
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter((url) => {
      try {
        // Basic URL validation
        new URL(url);
        return true;
      } catch (_) {
        return false;
      }
    });
};

export async function createStudioAction(values: CreateStudioInput) {
  const cookieStore = cookies();
  const supabase = await createSupabaseServerClient();

  // 1. Validate input
  const validatedFields = formSchema.safeParse(values);
  if (!validatedFields.success) {
    console.error(
      "Form validation failed:",
      validatedFields.error.flatten().fieldErrors
    );
    return { error: "Invalid input data." };
  }
  const {
    contextId,
    studioName,
    creditType,
    previewUrls: previewUrlsStr,
    resultUrls: resultUrlsStr,
  } = validatedFields.data;

  const isPersonalContext = contextId === "personal";
  const organizationId = isPersonalContext ? null : contextId;
  const creditUpdateColumn = creditType as CreditTypeColumn;

  // Parse URLs
  const previewUrls = parseUrls(previewUrlsStr);
  const resultUrls = parseUrls(resultUrlsStr);

  let newStudioId: string | null = null;
  let personalCreditDataId: string | null = null;
  let originalCreditValue: number | null = null;

  try {
    // 2. Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "User not authenticated." };
    }

    // 3. Verify Org Membership if context is an organization
    if (!isPersonalContext) {
      const { data: membership, error: membershipError } = await supabase
        .from("organization_members")
        .select("user_id") // Select any column to check existence
        .eq("user_id", user.id)
        .eq("organization_id", organizationId)
        .limit(1) // We only need to know if at least one row exists
        .maybeSingle();

      if (membershipError)
        throw new Error(
          `Organization membership check failed: ${membershipError.message}`
        );
      // User MUST be a member if creating in org context
      if (!membership)
        throw new Error(
          "Permission denied: You are not a member of this organization."
        );
    }

    // 4. Fetch and Verify User's Personal Credits (Always use personal credits)
    const { data: personalCreditData, error: creditError } = await supabase
      .from("credits")
      .select(`id, ${creditType}`)
      .eq("user_id", user.id)
      .is("organization_id", null)
      .single();

    if (creditError)
      throw new Error(
        `Failed to fetch personal credits: ${creditError.message}`
      );

    // Use dynamic access with 'as any' assertion for now
    if (!personalCreditData || (personalCreditData as any)[creditType] <= 0) {
      throw new Error(`No personal ${creditType} credits available.`);
    }

    personalCreditDataId = personalCreditData.id;
    originalCreditValue = (personalCreditData as any)[creditType]; // Store original value (assert as any)

    // Add null check before decrementing
    if (
      originalCreditValue === null ||
      typeof originalCreditValue === "undefined"
    ) {
      throw new Error(
        `Could not read the current value for ${creditType} credits.`
      );
    }

    // 5. Decrement the User's Personal Credit
    const { error: updateError } = await supabase
      .from("credits")
      .update({ [creditUpdateColumn]: originalCreditValue - 1 })
      .eq("id", personalCreditDataId);

    if (updateError) {
      throw new Error(
        `Failed to update personal credit balance: ${updateError.message}`
      );
    }

    // 6. Create the studio record (with correct organization_id)
    const { data: newStudio, error: studioInsertError } = await supabase
      .from("studios")
      .insert({
        creator_user_id: user.id,
        name: studioName,
        organization_id: organizationId, // This will be null if isPersonalContext is true
      })
      .select("id")
      .single();

    if (studioInsertError || !newStudio) {
      if (personalCreditDataId && originalCreditValue !== null) {
        await supabase
          .from("credits")
          .update({ [creditUpdateColumn]: originalCreditValue })
          .eq("id", personalCreditDataId);
        console.log(
          `Rolled back credit decrement for credit ID: ${personalCreditDataId}`
        );
      }
      throw new Error(
        `Failed to create studio record: ${studioInsertError?.message}`
      );
    }
    newStudioId = newStudio.id;

    // 7. Insert Preview Headshots (if any)
    if (previewUrls.length > 0) {
      const previewInserts = previewUrls.map((url) => ({
        studio_id: newStudioId!, // Use non-null assertion as ID is confirmed above
        image_url: url,
      }));
      const { error: previewInsertError } = await supabase
        .from("preview_headshots")
        .insert(previewInserts);
      if (previewInsertError)
        // Don't rollback credits here, but log issue. Studio exists.
        console.error(
          `Failed to insert preview headshots: ${previewInsertError.message}`
        );
    }

    // 8. Insert Result Headshots (if any)
    if (resultUrls.length > 0) {
      const resultInserts = resultUrls.map((url) => ({
        studio_id: newStudioId!, // Use non-null assertion
        image_url: url,
      }));
      const { error: resultInsertError } = await supabase
        .from("result_headshots")
        .insert(resultInserts);
      if (resultInsertError)
        // Don't rollback credits here, but log issue. Studio exists.
        console.error(
          `Failed to insert result headshots: ${resultInsertError.message}`
        );
    }

    // 9. Create the transaction log (referencing personal credit account)
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id, // User performing action
        organization_id: organizationId, // Org context (can be null)
        credit_account_id: personalCreditDataId, // The personal credit account that was changed
        change_amount: -1,
        type: "studio_creation",
        related_studio_id: newStudioId,
        description: `Created studio '${studioName}' using 1 personal ${creditType} credit ${
          organizationId
            ? `in organization ${organizationId}`
            : "(personal context)"
        }.`,
      });
    if (transactionError) {
      console.error(
        "Error creating transaction log:",
        transactionError.message
      );
      // Don't return error to user, core action succeeded, but log inconsistency.
    }

    // 10. Revalidate path
    revalidatePath("/dashboard/studio");
    return { success: true, studioId: newStudioId };
  } catch (e: any) {
    console.error("Error during studio creation process:", e.message);

    // --- Attempt Rollback on Major Failure ---
    try {
      if (newStudioId) {
        console.log(
          `Studio ${newStudioId} created, but error occurred later. Not deleting studio, check logs.`
        );
      } else if (personalCreditDataId && originalCreditValue !== null) {
        const { data: currentCreditData } = await supabase
          .from("credits")
          .select(`${creditType}`)
          .eq("id", personalCreditDataId)
          .single();

        // Use dynamic access with 'as any' assertion here too
        if (
          currentCreditData &&
          (currentCreditData as any)[creditType] === originalCreditValue - 1
        ) {
          await supabase
            .from("credits")
            .update({ [creditUpdateColumn]: originalCreditValue })
            .eq("id", personalCreditDataId);
          console.log(
            `Rolled back credit decrement for credit ID ${personalCreditDataId} due to studio creation failure.`
          );
        }
      }
    } catch (rollbackError: any) {
      console.error("Error during rollback attempt:", rollbackError.message);
    }
    // --- End Rollback ---

    return {
      error:
        e.message || "An unexpected error occurred during studio creation.",
    };
  }
}
