"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAccountContext } from "@/context/AccountContext";
import createSupabaseBrowserClient from "@/lib/supabase/browser-client";
import { createOrganizationCreditCheckoutAction } from "@/app/dashboard/components/organizations/actions/lemonSqueezyActions";
import { lemonsqueezy } from "@/config/lemonsqueezy";
import { ShoppingCart, Loader2 } from "lucide-react";
import { InviteMembersDialog } from "./InviteMembersDialog";
import { ShareableLinkSection } from "./ShareableLinkSection";
import { SentInvitationsList } from "./SentInvitationsList";
import type { OrganizationContext } from "@/context/AccountContext";
import type { Credits } from "@/types/shared";

interface OrganizationAdminDashboardProps {
  orgContext: { type: "organization" } & OrganizationContext;
}

export default function OrgAdminDashboard({
  orgContext,
}: OrganizationAdminDashboardProps) {
  const { userId, refreshContext } = useAccountContext();
  const [credits, setCredits] = useState<Credits | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [isBuyingCredits, setIsBuyingCredits] = useState<string | null>(null);

  const fetchCredits = useCallback(async () => {
    setCreditsLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("credits")
      .select("*")
      .eq("organization_id", orgContext.id)
      .maybeSingle();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load organization credits.",
        variant: "destructive",
      });
    }
    setCredits(data as Credits);
    setCreditsLoading(false);
  }, [orgContext.id]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const handleBuyTeamCredits = async () => {
    const teamPlan = lemonsqueezy.organizationCreditPlans.find(
      (p) => p.name.toLowerCase() === "team"
    );
    if (!teamPlan || !userId) {
      toast({
        title: "Error",
        description: "Configuration or user error.",
        variant: "destructive",
      });
      return;
    }

    setIsBuyingCredits(teamPlan.variantId);
    const result = await createOrganizationCreditCheckoutAction({
      planId: teamPlan.id,
      organizationId: orgContext.id,
      organizationName: orgContext.name,
      userEmail: (
        await createSupabaseBrowserClient().auth.getUser()
      ).data.user?.email,
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

      <section className="space-y-4 rounded-md border p-4">
        <h2 className="text-xl font-semibold">Team Credits</h2>
        {creditsLoading ? (
          <p>Loading credits...</p>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-lg">
              Available Team Credits:{" "}
              <span className="font-bold">{credits?.team ?? 0}</span>
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
        )}
        <p className="text-sm text-muted-foreground">
          Team credits are used when inviting new members. One credit is
          transferred per invitation.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Manage Invitations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <InviteMembersDialog
            organizationId={orgContext.id}
            organizationName={orgContext.name}
            ownerUserId={orgContext.owner_user_id}
            currentTeamCredits={credits?.team ?? 0}
          />
          <ShareableLinkSection
            organizationId={orgContext.id}
            initialInviteToken={orgContext.invite_token ?? null}
            onLinkChange={refreshContext}
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">Sent Invitations</h3>
          <SentInvitationsList organizationId={orgContext.id} />
        </div>
      </section>
    </div>
  );
}
