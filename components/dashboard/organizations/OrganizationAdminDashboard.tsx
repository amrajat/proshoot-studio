"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAccountContext } from "@/context/AccountContext";
import type {
  OrganizationContext,
  AvailableContext,
} from "@/context/AccountContext";
import createSupabaseBrowserClient from "@/lib/supabase/browser-client";
import {
  createInvitationAction,
  generateUniversalInviteTokenAction,
  revokeUniversalInviteTokenAction,
  deleteInvitationAction,
  resendInvitationEmailAction,
} from "@/app/dashboard/organization/_actions/invitationActions";
import { createOrganizationCreditCheckoutAction } from "@/app/dashboard/organization/_actions/lemonSqueezyActions";
import {
  organizationCreditPlans,
  type CreditPlan,
} from "@/config/lemonsqueezyConfig";
import {
  Copy,
  RefreshCw,
  Trash2,
  Send,
  ShoppingCart,
  Loader2,
} from "lucide-react"; // Icons
import { InviteMembersDialog } from "./InviteMembersDialog";
import { ShareableLinkSection } from "./ShareableLinkSection";
import { SentInvitationsList } from "./SentInvitationsList";

// Types (ensure CreditTransferType matches invitationActions.ts)
// ... (OrgCredits, Invitation, CreditTransferType types - unchanged)

type CreditTransferType =
  | "starter"
  | "pro"
  | "elite"
  | "studio"
  | "balance"
  | "none";

type OrgCredits = {
  id: string;
  organization_id: string;
  user_id: string;
  balance: number;
  starter: number;
  pro: number;
  elite: number;
  studio: number;
  team: number;
};

type Invitation = {
  id: string;
  organization_id: string;
  invited_email: string;
  role: "admin" | "member";
  status: "pending" | "accepted" | "expired" | "denied";
  created_at: string;
  transfer_credit_type?: CreditTransferType;
  transfer_credit_amount?: number | null;
};

interface OrganizationAdminDashboardProps {
  orgContext: { type: "organization" } & OrganizationContext;
}

export default function OrganizationAdminDashboardComponent({
  orgContext,
}: OrganizationAdminDashboardProps) {
  const supabase = createSupabaseBrowserClient();
  const { refreshContext, userId, selectedContext } = useAccountContext();

  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [orgCredits, setOrgCredits] = useState<OrgCredits | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [sentInvitations, setSentInvitations] = useState<Invitation[]>([]);
  const [invitationsLoading, setInvitationsLoading] = useState(true);
  const [isBuyingCredits, setIsBuyingCredits] = useState<string | null>(null);

  // State for owner's credits (Model 1)
  const [ownerCredits, setOwnerCredits] = useState<OrgCredits | null>(null);

  // Fetch OWNER credits for the organization
  useEffect(() => {
    const fetchOwnerCredits = async () => {
      if (!orgContext.owner_user_id) {
        console.error("Org context missing owner_user_id");
        setCreditsLoading(false);
        return;
      }
      setCreditsLoading(true);
      const { data, error } = await supabase
        .from("credits")
        .select("*")
        .eq("organization_id", orgContext.id)
        .eq("user_id", orgContext.owner_user_id)
        .maybeSingle();

      if (error) {
        toast({
          title: "Error fetching organization credits",
          description: error.message,
          variant: "destructive",
        });
        setOwnerCredits(null);
      } else {
        setOwnerCredits(data as OrgCredits);
      }
      setCreditsLoading(false);
    };
    fetchOwnerCredits();
  }, [orgContext.id, orgContext.owner_user_id, supabase]);

  useEffect(() => {
    const fetchCredits = async () => {
      setCreditsLoading(true);
      const { data, error } = await supabase
        .from("credits")
        .select("*")
        .eq("organization_id", orgContext.id)
        .single();
      if (error) {
        toast({
          title: "Error fetching organization credits",
          description: error.message,
          variant: "destructive",
        });
        setOrgCredits(null);
      } else {
        setOrgCredits(data as OrgCredits);
      }
      setCreditsLoading(false);
    };
    fetchCredits();
  }, [orgContext.id, supabase]);

  useEffect(() => {
    const fetchInvitations = async () => {
      setInvitationsLoading(true);
      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("organization_id", orgContext.id)
        .order("created_at", { ascending: false });
      if (error) {
        toast({
          title: "Error fetching invitations",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setSentInvitations(data as Invitation[]);
      }
      setInvitationsLoading(false);
    };
    fetchInvitations();
  }, [orgContext.id, supabase]);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) {
      toast({ title: "Email is required", variant: "destructive" });
      return;
    }

    if (!orgCredits) {
      toast({
        title: "Cannot Invite Member",
        description: "Credit information not loaded yet or unavailable.",
        variant: "destructive",
      });
      return;
    }

    let determinedCreditType: CreditTransferType | null = null;
    if (orgCredits.starter > 0) determinedCreditType = "starter";
    else if (orgCredits.pro > 0) determinedCreditType = "pro";
    else if (orgCredits.elite > 0) determinedCreditType = "elite";
    else if (orgCredits.studio > 0) determinedCreditType = "studio";

    if (!determinedCreditType) {
      toast({
        title: "Cannot Invite Member",
        description: "Organization has no specific plan credits to transfer.",
        variant: "destructive",
      });
      return;
    }

    setIsInviting(true);
    const result = await createInvitationAction({
      organization_id: orgContext.id,
      invited_email: inviteEmail,
      role: "member",
      transfer_credit_type: determinedCreditType,
      transfer_credit_amount: 1,
    });
    setIsInviting(false);

    if (result.error) {
      toast({
        title: "Invitation Failed",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Invitation Sent!",
        description: `Invitation sent to ${inviteEmail}.`,
      });
      setInviteEmail("");
      // Refresh invitations list locally for immediate feedback
      if (result.data) {
        setSentInvitations((prev) => [result.data as Invitation, ...prev]);
      }
    }
  };

  const handleBuyTeamCredits = async () => {
    const teamPlan = organizationCreditPlans.find(
      (p) => p.name.toLowerCase() === "team"
    );
    if (!teamPlan) {
      toast({
        title: "Error",
        description: "Team credit plan configuration not found.",
        variant: "destructive",
      });
      return;
    }
    if (!userId) {
      toast({
        title: "Error",
        description: "User not logged in.",
        variant: "destructive",
      });
      return;
    }

    setIsBuyingCredits(teamPlan.variantId);
    const result = await createOrganizationCreditCheckoutAction({
      planId: teamPlan.id,
      organizationId: orgContext.id,
      organizationName: orgContext.name,
      userEmail: userId
        ? (
            await supabase.auth.getUser()
          ).data.user?.email
        : undefined,
    });
    setIsBuyingCredits(null);

    if (result.error || !result.checkoutUrl) {
      toast({
        title: "Checkout Failed",
        description: result.error || "Could not create checkout session.",
        variant: "destructive",
      });
    } else {
      window.location.href = result.checkoutUrl;
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">
        {orgContext.name} - Admin Dashboard
      </h1>

      {/* Credits Section - Focused on Team Credits */}
      <section className="space-y-4 rounded-md border p-4">
        <h2 className="text-xl font-semibold">Team Credits</h2>
        {creditsLoading ? (
          <p>Loading credits...</p>
        ) : ownerCredits ? (
          <div className="flex items-center justify-between">
            <p className="text-lg">
              Available Team Credits:{" "}
              <span className="font-bold">{ownerCredits.team}</span>
            </p>
            <Button
              onClick={handleBuyTeamCredits}
              disabled={isBuyingCredits !== null}
            >
              {isBuyingCredits ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShoppingCart className="mr-2 h-4 w-4" />
              )}
              Buy More Team Credits
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground">
            Could not load credit information.
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Team credits are used when inviting new members via email or the
          shareable link.
        </p>
      </section>

      {/* Invitations Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Manage Invitations</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Invite by Email Dialog */}
          <div className="rounded-md border p-4 space-y-3">
            <h4 className="font-medium">Invite by Email</h4>
            <p className="text-sm text-muted-foreground">
              Send an invitation email using the organization's shareable link.
              Requires sufficient Team Credits.
            </p>
            <InviteMembersDialog
              organizationId={orgContext.id}
              organizationName={orgContext.name}
              ownerUserId={orgContext.owner_user_id}
              currentTeamCredits={ownerCredits?.team ?? 0}
            />
          </div>

          {/* Shareable Link Section */}
          <ShareableLinkSection
            organizationId={orgContext.id}
            initialInviteToken={orgContext.invite_token ?? null}
            onLinkChange={refreshContext}
          />
        </div>

        {/* Sent Invitations List */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Sent Invitations</h3>
          <SentInvitationsList organizationId={orgContext.id} />
        </div>
      </section>

      {/* TODO: Add sections for managing members, org settings etc. */}
    </div>
  );
}
