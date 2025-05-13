"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Copy, RefreshCw, Loader2, Ban, AlertTriangle } from "lucide-react";
import {
  generateNewShareableLinkAction,
  revokeUniversalInviteTokenAction,
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

interface GenerateLinkState {
  success: boolean;
  newLink?: string;
  message?: string;
}

export function ShareableLinkSection({
  organizationId,
  initialInviteToken,
  onLinkChange,
}: ShareableLinkSectionProps) {
  const [currentLink, setCurrentLink] = useState<string | null>(null);
  const [generateState, setGenerateState] = useState<GenerateLinkState | null>(
    null
  );
  const [isGenerating, startGenerateTransition] = useTransition();
  const [isRevoking, startRevokeTransition] = useTransition();
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);

  useEffect(() => {
    if (initialInviteToken) {
      const link = `${
        window.location.origin
      }/accept-invite?token=${encodeURIComponent(
        initialInviteToken
      )}&orgId=${encodeURIComponent(organizationId)}`;
      setCurrentLink(link);
    } else {
      setCurrentLink(null);
    }
  }, [initialInviteToken, organizationId]);

  useEffect(() => {
    if (generateState?.message) {
      toast({
        title: generateState.success ? "Success" : "Error",
        description: generateState.message,
        variant: generateState.success ? "default" : "destructive",
      });
    }
    if (generateState?.success && generateState.newLink) {
      onLinkChange();
    }
    if (generateState !== null) setGenerateState(null);
  }, [generateState, onLinkChange]);

  const handleCopy = () => {
    if (currentLink) {
      navigator.clipboard.writeText(currentLink);
      toast({
        title: "Copied!",
        description: "Invite link copied to clipboard.",
      });
    } else {
      toast({
        title: "Error",
        description: "No active link to copy.",
        variant: "destructive",
      });
    }
  };

  const triggerGenerate = () => {
    if (currentLink) {
      setShowGenerateConfirm(true);
    } else {
      performGenerate();
    }
  };

  const performGenerate = () => {
    setShowGenerateConfirm(false);
    startGenerateTransition(async () => {
      const formData = new FormData();
      formData.append("organizationId", organizationId);
      formData.append("host", window.location.origin);
      const result = await generateNewShareableLinkAction(formData);
      setGenerateState(result);
    });
  };

  const handleRevoke = () => {
    startRevokeTransition(async () => {
      const result = await revokeUniversalInviteTokenAction(organizationId);
      if (result.success) {
        toast({ title: "Success", description: "Shareable link revoked." });
        setCurrentLink(null);
        onLinkChange();
      } else {
        toast({
          title: "Error Revoking Link",
          description: result.error || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    });
  };

  const canCopy = !!currentLink;
  const canRevoke = !!currentLink;
  const isLoading = isGenerating || isRevoking;

  return (
    <div className="space-y-3 rounded-md border p-4">
      <h4 className="font-medium">Shareable Invite Link</h4>
      <p className="text-sm text-muted-foreground">
        {currentLink
          ? "Anyone with this link can join your organization as a member. Joining uses 1 Team Credit."
          : "Generate a link to allow anyone to join your organization."}
      </p>
      <div className="flex items-center space-x-2">
        <Input
          value={currentLink ?? "No active link"}
          readOnly
          className="flex-1"
        />
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={handleCopy}
          disabled={!canCopy || isLoading}
          aria-label="Copy link"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center space-x-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={triggerGenerate}
          disabled={isLoading}
          className="flex-grow"
        >
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          {currentLink ? "Generate New Link" : "Generate Link"}
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={handleRevoke}
          disabled={!canRevoke || isLoading}
          className="flex-grow"
        >
          {isRevoking ? (
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
              Generating a new link will invalidate the current shareable link.
              Anyone using the old link will no longer be able to join. Are you
              sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isGenerating}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={performGenerate}
              disabled={isGenerating}
            >
              {isGenerating && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Generate New Link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
