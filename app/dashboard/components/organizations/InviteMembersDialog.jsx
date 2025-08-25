"use client";

import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, AlertCircle, Info, Send } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { sendOrganizationInvitesAction } from "../../actions/organizations/invitationActions";

// ===== VALIDATION SCHEMA =====
const emailListSchema = z.object({
  emails: z.string().min(1, "Please enter at least one email address."),
  // Server handles detailed email format validation per address
});

// ===== INITIAL STATE =====
const initialFormState = {
  success: false,
};

/**
 * Invite Members Dialog Component
 *
 * Allows organization owners to invite new members via email:
 * - Bulk email invitation with comma/newline separation
 * - Real-time email count and credit validation
 * - Team credit consumption (1 credit per invite)
 * - Comprehensive error handling and feedback
 *
 * @param {string} organizationId - Organization ID for invitations
 * @param {string} organizationName - Organization name for display
 * @param {string} ownerUserId - Owner user ID for validation
 * @param {number} currentTeamCredits - Available team credits
 */
export function InviteMembersDialog({
  organizationId,
  organizationName,
  ownerUserId,
  currentTeamCredits,
}) {
  // ===== STATE MANAGEMENT =====
  const [isOpen, setIsOpen] = useState(false);
  const [formState, formAction] = useFormState(
    sendOrganizationInvitesAction,
    initialFormState
  );
  const [pending, setPending] = useState(false);
  const [emailCount, setEmailCount] = useState(0);

  // ===== FORM SETUP =====
  const form = useForm({
    resolver: zodResolver(emailListSchema),
    defaultValues: { emails: "" },
    mode: "onChange",
  });

  const watchedEmails = form.watch("emails");

  // ===== EMAIL COUNT TRACKING =====
  useEffect(() => {
    // Count valid email addresses (containing @)
    const count =
      watchedEmails
        ?.split(/[\s,]+/)
        .filter((email) => email.length > 0 && email.includes("@")).length || 0;
    setEmailCount(count);
  }, [watchedEmails]);

  // ===== FORM STATE HANDLING =====
  useEffect(() => {
    if (formState.message) {
      if (formState.success) {
        // Success: close dialog and reset form
        toast({
          title: "Success",
          description: formState.message,
        });
        setIsOpen(false);
        form.reset();
        setEmailCount(0);
      } else {
        // Error: keep dialog open to show errors
        toast({
          title: "Error",
          description: formState.message,
          variant: "destructive",
        });
      }
    }
    setPending(false);
  }, [formState, form]);

  // ===== FORM SUBMISSION =====
  const handleSubmit = (event) => {
    event.preventDefault();
    form.handleSubmit((data) => {
      setPending(true);

      // Prepare form data for server action
      const formData = new FormData();
      formData.append("emails", data.emails);
      formData.append("organizationId", organizationId);
      formData.append("host", window.location.origin);

      formAction(formData);
    })(event);
  };

  // ===== VALIDATION CHECKS =====
  const hasEnoughCredits = currentTeamCredits >= emailCount;
  const canSubmit =
    form.formState.isValid && hasEnoughCredits && emailCount > 0 && !pending;

  // ===== RENDER =====
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full h-full min-h-[120px] flex flex-col items-center justify-center space-y-2 text-secondary-foreground"
          variant="secondary"
        >
          <Send className="h-6 w-6" />
          <span className="text-sm font-medium">Invite Members via Email</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Members to {organizationName}</DialogTitle>
          <DialogDescription>
            Enter email addresses separated by commas or new lines. Each invite
            costs 1 Team Credit.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div className="grid gap-2">
            <Label htmlFor="emails">Email Addresses</Label>
            <Textarea
              id="emails"
              {...form.register("emails")}
              placeholder="member1@example.com, member2@example.com"
              rows={5}
              disabled={pending}
              className="resize-none"
            />
            {form.formState.errors.emails && (
              <p className="text-sm text-destructive">
                {form.formState.errors.emails.message}
              </p>
            )}
          </div>

          {/* Credits Check Alert */}
          <Alert variant={hasEnoughCredits ? "default" : "destructive"}>
            <Info className="h-4 w-4" />
            <AlertTitle>Credits Check</AlertTitle>
            <AlertDescription>
              Inviting {emailCount} member(s). Available Team Credits:{" "}
              <span className="font-medium">{currentTeamCredits}</span>.
              {!hasEnoughCredits && (
                <span className="block mt-1 font-medium">
                  ⚠️ Insufficient credits for this invitation.
                </span>
              )}
            </AlertDescription>
          </Alert>

          {/* Error Display */}
          {formState.errors && formState.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Invitation Issues</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5 space-y-1">
                  {formState.errors.map((err, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-medium">{err.email}:</span>{" "}
                      {err.error}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <DialogFooter>
            <Button type="submit" disabled={!canSubmit} className="w-full">
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {pending
                ? "Sending Invites..."
                : `Send ${
                    emailCount > 0
                      ? `${emailCount} Invite${emailCount > 1 ? "s" : ""}`
                      : "Invites"
                  }`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
