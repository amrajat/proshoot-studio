"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Copy, RefreshCw, Loader2, Ban } from "lucide-react";
import {
  generateShareableLinkAction,
  revokeShareableLinkAction,
} from "@/app/dashboard/organization/_actions/invitationActions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ShareableLinkSectionProps {
  organizationId: string;
  initialInviteToken: string | null;
  onLinkChange: () => void;
}

export function ShareableLinkSection({
  organizationId,
  initialInviteToken,
  onLinkChange,
}: ShareableLinkSectionProps) {
  const [inviteToken, setInviteToken] = useState(initialInviteToken);
  const [isLoading, startTransition] = useTransition();
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);

  useEffect(() => {
    setInviteToken(initialInviteToken);
  }, [initialInviteToken]);

  const currentLink = inviteToken
    ? `${window.location.origin}/accept-invite?token=${inviteToken}&orgId=${organizationId}`
    : null;

  const handleCopy = () => {
    if (currentLink) {
      navigator.clipboard.writeText(currentLink);
      toast({
        title: "Copied!",
        description: "Invite link copied to clipboard.",
      });
    }
  };

  const handleGenerate = () => {
    if (currentLink) {
      setShowGenerateConfirm(true);
    } else {
      performGenerate();
    }
  };

  const performGenerate = () => {
    setShowGenerateConfirm(false);
    startTransition(async () => {
      const result = await generateShareableLinkAction(organizationId);
      if (result.error) {
        toast({
          title: "Error Generating Link",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "New shareable link generated.",
        });
        setInviteToken(result.data!);
        onLinkChange(); // Refresh context to get new token
      }
    });
  };

  const handleRevoke = () => {
    startTransition(async () => {
      const result = await revokeShareableLinkAction(organizationId);
      if (result.error) {
        toast({
          title: "Error Revoking Link",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "Shareable link revoked." });
        setInviteToken(null);
        onLinkChange(); // Refresh context
      }
    });
  };

  return (
    <div className="space-y-3 rounded-md border p-4">
      <h4 className="font-medium">Shareable Invite Link</h4>
      <p className="text-sm text-muted-foreground">
        {currentLink
          ? "Anyone with this link can join your organization. This will use 1 Team Credit."
          : "Generate a link to allow anyone to join your organization."}
      </p>
      <div className="flex items-center space-x-2">
        <Input value={currentLink ?? "No active link"} readOnly />
        <Button
          size="icon"
          variant="outline"
          onClick={handleCopy}
          disabled={!currentLink}
          aria-label="Copy link"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center space-x-2 pt-2">
        <Button
          variant="outline"
          onClick={handleGenerate}
          disabled={isLoading}
          className="flex-grow"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          {currentLink ? "Generate New Link" : "Generate Link"}
        </Button>
        <Button
          variant="destructive"
          onClick={handleRevoke}
          disabled={!currentLink || isLoading}
          className="flex-grow"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Ban className="mr-2 h-4 w-4" />
          )}
          Revoke Link
        </Button>
      </div>
      <AlertDialog
        open={showGenerateConfirm}
        onOpenChange={setShowGenerateConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate New Invite Link?</AlertDialogTitle>
            <AlertDialogDescription>
              This will invalidate the current shareable link. Are you sure you
              want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={performGenerate} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate New Link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
