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
import { toast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { sendOrganizationInvitesAction } from "./actions/invitationActions";
import { usePathname } from "next/navigation";

const emailListSchema = z.object({
  emails: z.string().min(1, "Please enter at least one email address."),
  // We rely on the server for detailed email format validation per address
});

type InviteFormState = {
  success: boolean;
  message?: string;
  errors?: { email: string; error: string }[];
};

const initialFormState: InviteFormState = {
  success: false,
};

interface InviteMembersDialogProps {
  organizationId: string;
  organizationName: string;
  ownerUserId: string;
  currentTeamCredits: number;
}

export function InviteMembersDialog({
  organizationId,
  organizationName,
  ownerUserId,
  currentTeamCredits,
}: InviteMembersDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formState, formAction] = useFormState(
    sendOrganizationInvitesAction,
    initialFormState
  );
  const [pending, setPending] = useState(false);
  const [emailCount, setEmailCount] = useState(0);

  const pathname = usePathname();

  const form = useForm<z.infer<typeof emailListSchema>>({
    resolver: zodResolver(emailListSchema),
    defaultValues: { emails: "" },
    mode: "onChange",
  });
  const watchedEmails = form.watch("emails");

  useEffect(() => {
    const count =
      watchedEmails
        ?.split(/[\s,]+/)
        .filter((email) => email.length > 0 && email.includes("@")).length || 0;
    setEmailCount(count);
  }, [watchedEmails]);

  useEffect(() => {
    if (formState.message) {
      if (formState.success) {
        toast({ title: "Success", description: formState.message });
        setIsOpen(false); // Close dialog on full success
        form.reset();
        setEmailCount(0);
      } else {
        // Keep dialog open on partial success or failure to show errors
        toast({
          title: "Error",
          description: formState.message,
          variant: "destructive",
        });
      }
    }
    setPending(false);
  }, [formState, form]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    form.handleSubmit((data) => {
      setPending(true);
      const formData = new FormData();
      formData.append("emails", data.emails);
      formData.append("organizationId", organizationId);
      formData.append("host", window.location.origin);
      formAction(formData);
    })(event);
  };

  const hasEnoughCredits = currentTeamCredits >= emailCount;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Invite Members</Button>
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
          <div className="grid gap-2">
            <Label htmlFor="emails">Email Addresses</Label>
            <Textarea
              id="emails"
              {...form.register("emails")}
              placeholder="member1@example.com, member2@example.com"
              rows={5}
              disabled={pending}
            />
            {form.formState.errors.emails && (
              <p className="text-sm text-red-600">
                {form.formState.errors.emails.message}
              </p>
            )}
          </div>

          <Alert variant={hasEnoughCredits ? "default" : "destructive"}>
            <Info className="h-4 w-4" />
            <AlertTitle>Credits Check</AlertTitle>
            <AlertDescription>
              Inviting {emailCount} member(s). Available Team Credits:{" "}
              {currentTeamCredits}.
              {!hasEnoughCredits && " Insufficient credits."}
            </AlertDescription>
          </Alert>

          {formState.errors && formState.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Invitation Issues</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5">
                  {formState.errors.map((err, i) => (
                    <li key={i}>
                      {err.email}: {err.error}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="submit"
              disabled={
                pending ||
                !form.formState.isValid ||
                !hasEnoughCredits ||
                emailCount === 0
              }
            >
              {pending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Send {emailCount > 0 ? `${emailCount} Invite(s)` : "Invites"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
