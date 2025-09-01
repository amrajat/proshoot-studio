"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useAccountContext } from "@/context/AccountContext";
import createSupabaseBrowserClient from "@/lib/supabase/browser-client";
import {
  ShoppingCart,
  Plus,
  AlertCircle,
  X,
  RefreshCw,
  Link2,
  Coins,
  Copy,
  Ban,
  UsersRound,
  Send,
  Wallet,
} from "lucide-react";
import { MembersInviteDialog } from "./members-invite-dialog";
import {
  InlineLoader,
  ButtonLoader,
} from "@/components/shared/universal-loader";
import {
  transferTeamCreditsAction,
  getOrganizationMembersWithCreditsAction,
  resendInvitationAction,
  removeInvitationAction,
} from "@/app/(dashboard)/actions/organizations/creditActions";
import {
  generateShareableLinkAction,
  revokeShareableLinkAction,
} from "@/app/(dashboard)/actions/organizations/invitationActions";

/**
 * Organization Admin Dashboard Component
 *
 * Modern dashboard following billing page design patterns with:
 * - Credit overview cards with icons
 * - Team management with clean table layout
 * - Invitation management with inline actions
 * - Credit transfer functionality
 * - Sonner toast notifications
 *
 * @param {Object} orgContext - Organization context with type, id, name, etc.
 */
export default function OwnerDashboard({ orgContext }) {
  // ===== STATE MANAGEMENT =====
  const { userId, refreshContext } = useAccountContext();
  const [credits, setCredits] = useState(null);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [invitations, setInvitations] = useState([]);
  const [invitationsLoading, setInvitationsLoading] = useState(true);
  const [inviteToken, setInviteToken] = useState(orgContext.invite_token);
  const [shareableLinkLoading, setShareableLinkLoading] = useState(false);
  const [creditTransferDialog, setCreditTransferDialog] = useState({
    open: false,
    member: null,
  });
  const [transferAmount, setTransferAmount] = useState("");
  const [creditType, setCreditType] = useState("team");
  const [transferLoading, setTransferLoading] = useState(false);
  const [insufficientCreditsDialog, setInsufficientCreditsDialog] =
    useState(false);

  const router = useRouter();

  // ===== CREDITS FETCHING =====
  const fetchCredits = useCallback(async () => {
    if (!orgContext?.id) return;

    setCreditsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("credits")
        .select("*")
        .eq("organization_id", orgContext.id)
        .maybeSingle();

      if (error) {
        toast.error("Failed to load organization credits");
        return;
      }

      setCredits(data);
    } catch (error) {
      toast.error("Unexpected error loading credits");
    } finally {
      setCreditsLoading(false);
    }
  }, [orgContext?.id]);

  // ===== MEMBERS FETCHING =====
  const fetchMembers = useCallback(async () => {
    if (!orgContext?.id) return;

    setMembersLoading(true);
    try {
      const result = await getOrganizationMembersWithCreditsAction(
        orgContext.id
      );
      if (result.success) {
        // Filter out the owner from members list
        const filteredMembers = result.members.filter(
          (member) => member.role !== "OWNER"
        );
        setMembers(filteredMembers);
      } else {
        toast.error(result.error || "Failed to load team members");
      }
    } catch (error) {
      toast.error("Failed to load team members");
    } finally {
      setMembersLoading(false);
    }
  }, [orgContext?.id]);

  // ===== INVITATIONS FETCHING =====
  const fetchInvitations = useCallback(async () => {
    if (!orgContext?.id) return;

    setInvitationsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("organization_id", orgContext.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load invitations");
        return;
      }

      setInvitations(data || []);
    } catch (error) {
      toast.error("Failed to load invitations");
    } finally {
      setInvitationsLoading(false);
    }
  }, [orgContext?.id]);

  // ===== EFFECTS =====
  useEffect(() => {
    fetchCredits();
    fetchMembers();
    fetchInvitations();
  }, [fetchCredits, fetchMembers, fetchInvitations]);

  // Sync inviteToken state with orgContext changes
  useEffect(() => {
    setInviteToken(orgContext.invite_token);
  }, [orgContext.invite_token]);

  // ===== SHAREABLE LINK FUNCTIONS =====
  const handleGenerateLink = async () => {
    setShareableLinkLoading(true);
    try {
      const result = await generateShareableLinkAction(orgContext.id);
      if (result.success) {
        setInviteToken(result.data);
        toast.success("Shareable link generated successfully");
      } else {
        toast.error(result.error || "Failed to generate shareable link");
      }
    } catch (error) {
      toast.error("Failed to generate shareable link");
    } finally {
      setShareableLinkLoading(false);
    }
  };

  const handleRevokeLink = async () => {
    setShareableLinkLoading(true);
    try {
      const result = await revokeShareableLinkAction(orgContext.id);
      if (result.success) {
        setInviteToken(null);
        toast.success("Shareable link revoked successfully");
      } else {
        toast.error(result.error || "Failed to revoke shareable link");
      }
    } catch (error) {
      toast.error("Failed to revoke shareable link");
    } finally {
      setShareableLinkLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!inviteToken) return;

    const link = `${window.location.origin}/accept-invite?token=${inviteToken}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Invite link copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy link to clipboard");
    }
  };

  // ===== CREDIT TRANSFER =====
  const handleCreditTransfer = async (member, amount) => {
    const creditsToTransfer = parseInt(amount);

    if (!creditsToTransfer || creditsToTransfer <= 0) {
      toast.error("Please enter a valid number of credits");
      return;
    }

    // Check available credits based on credit type
    const availableCredits =
      creditType === "team" ? credits?.team ?? 0 : credits?.balance ?? 0;
    if (creditsToTransfer > availableCredits) {
      setInsufficientCreditsDialog(true);
      return;
    }

    setTransferLoading(true);

    try {
      const formData = new FormData();
      formData.append("memberUserId", member.user_id);
      formData.append("organizationId", orgContext.id);
      formData.append("creditsAmount", creditsToTransfer.toString());
      formData.append("creditType", creditType);

      const result = await transferTeamCreditsAction(formData);

      if (result.success) {
        toast.success(result.message || "Credits transferred successfully");
        // Refresh data
        fetchCredits();
        fetchMembers();
        setCreditTransferDialog({ open: false, member: null });
        setTransferAmount("");
        setCreditType("team");
      } else {
        if (result.error.includes("Insufficient")) {
          setInsufficientCreditsDialog(true);
        } else {
          toast.error(result.error || "Failed to transfer credits");
        }
      }
    } catch (error) {
      toast.error("Failed to transfer credits");
    } finally {
      setTransferLoading(false);
    }
  };

  // ===== INVITATION ACTIONS =====
  const handleResendInvitation = async (invitationId) => {
    try {
      const formData = new FormData();
      formData.append("invitationId", invitationId);
      formData.append("organizationId", orgContext.id);

      const result = await resendInvitationAction(formData);

      if (result.success) {
        toast.success(result.message || "Invitation resent successfully");
        fetchInvitations();
      } else {
        toast.error(result.error || "Failed to resend invitation");
      }
    } catch (error) {
      toast.error("Failed to resend invitation");
    }
  };

  const handleRemoveInvitation = async (invitationId) => {
    try {
      const formData = new FormData();
      formData.append("invitationId", invitationId);
      formData.append("organizationId", orgContext.id);

      const result = await removeInvitationAction(formData);

      if (result.success) {
        toast.success(result.message || "Invitation removed successfully");
        fetchInvitations();
      } else {
        toast.error(result.error || "Failed to remove invitation");
      }
    } catch (error) {
      toast.error("Failed to remove invitation");
    }
  };

  // ===== COMPUTED VALUES =====
  const pendingInvitations = useMemo(
    () => invitations.filter((inv) => inv.status === "PENDING"),
    [invitations]
  );

  const shareableLink = useMemo(
    () =>
      inviteToken
        ? `${window.location.origin}/accept-invite?token=${inviteToken}`
        : null,
    [inviteToken]
  );

  const creditStats = useMemo(
    () => ({
      balance: credits?.balance ?? 0,
      team: credits?.team ?? 0,
      starter: credits?.starter ?? 0,
      professional: credits?.professional ?? 0,
      studio: credits?.studio ?? 0,
    }),
    [credits]
  );

  // ===== RENDER HELPERS =====
  const getStatusBadge = (status) => {
    const variants = {
      PENDING: "secondary",
      ACCEPTED: "default",
      CANCELLED: "destructive",
      EXPIRED: "outline",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  // ===== RENDER =====
  return (
    <div className="space-y-8">
      {/* Overview Section */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            {orgContext.name}
          </h2>
          <p className="text-muted-foreground">
            Organization management dashboard.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card
            className="flex items-center justify-center bg-primary cursor-pointer text-primary-foreground hover:bg-primary/90"
            onClick={() => router.push("/buy")}
          >
            <div className="flex items-center space-x-2 px-4 py-2">
              <ShoppingCart className="h-5 w-5" />
              <span className="text-sm font-medium">Buy More Credits</span>
            </div>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
              <Coins className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {creditsLoading ? (
                  <InlineLoader showText={false} />
                ) : (
                  creditStats.balance
                )}
              </div>
              <p className="text-xs text-muted-foreground">Available credits</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team</CardTitle>
              <Wallet className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {creditsLoading ? (
                  <InlineLoader showText={false} />
                ) : (
                  creditStats.team
                )}
              </div>
              <p className="text-xs text-muted-foreground">Team credits</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Members</CardTitle>
              <UsersRound className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {membersLoading ? (
                  <InlineLoader showText={false} />
                ) : (
                  members.length
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Organization Members
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Invitations</CardTitle>
              <Send className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {invitationsLoading ? (
                  <InlineLoader showText={false} />
                ) : (
                  pendingInvitations.length
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Pending invitations
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Team Invitations Section */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Invite Team Members
          </h2>
          <p className="text-muted-foreground">
            Invite new members via email or shareable link.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Email Invitations (1/4) */}
          <Card className="lg:col-span-1">
            <CardContent className="p-0 h-full">
              <MembersInviteDialog
                organizationId={orgContext.id}
                organizationName={orgContext.name}
                ownerUserId={orgContext.owner_user_id}
                currentTeamCredits={creditStats.team}
              />
            </CardContent>
          </Card>

          {/* Shareable Link (3/4) */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Shareable Link
              </CardTitle>
              <CardDescription>
                Generate a link that anyone can use to join your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  value={shareableLink || "No active link"}
                  readOnly
                  className="flex-1"
                  placeholder="Generate a link to get started"
                />

                {/* Generate/Revoke buttons inline */}
                {!shareableLink ? (
                  <Button
                    size="icon"
                    variant="default"
                    onClick={handleGenerateLink}
                    disabled={shareableLinkLoading}
                    title="Generate Link"
                  >
                    {shareableLinkLoading ? (
                      <InlineLoader showText={false} />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={handleRevokeLink}
                    disabled={shareableLinkLoading}
                    title="Revoke Link"
                  >
                    {shareableLinkLoading ? (
                      <InlineLoader showText={false} />
                    ) : (
                      <Ban className="h-4 w-4" />
                    )}
                  </Button>
                )}

                {/* Copy button */}
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopyLink}
                  disabled={!shareableLink || shareableLinkLoading}
                  title="Copy Link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Team Members Section */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Team Members
          </h2>
          <p className="text-muted-foreground">
            Manage your team members and transfer credits.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>
              Team members and their credit balances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {membersLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <InlineLoader text="Loading team members" />
                      </TableCell>
                    </TableRow>
                  ) : members.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No team members found. Invite your first team member to
                        get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member) => (
                      <TableRow key={member.user_id}>
                        <TableCell className="font-medium">
                          {member.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              member.role === "OWNER" ? "default" : "secondary"
                            }
                          >
                            {member.role.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {member.personal_credits}
                          </span>
                          <span className="text-muted-foreground text-sm ml-1">
                            credits
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(member.joined_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setCreditTransferDialog({ open: true, member })
                            }
                            className="gap-1"
                          >
                            <Plus className="h-3 w-3" />
                            Transfer Credits
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Pending Invitations Section */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Pending Invitations
          </h2>
          <p className="text-muted-foreground">
            Track and manage pending team invitations.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Invitations</CardTitle>
            <CardDescription>
              Pending invitations and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitationsLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <InlineLoader text="Loading invitations" />
                      </TableCell>
                    </TableRow>
                  ) : invitations.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No invitations sent yet. Send your first invitation to
                        get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    invitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell className="font-medium">
                          {invitation.invited_email || "Universal Invite"}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(invitation.status)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(invitation.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          {invitation.status === "PENDING" && (
                            <div className="flex items-center gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleResendInvitation(invitation.id)
                                }
                                className="gap-1"
                              >
                                <RefreshCw className="h-3 w-3" />
                                Resend
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleRemoveInvitation(invitation.id)
                                }
                                className="gap-1 text-destructive hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                                Remove
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Credit Transfer Dialog */}
      <Dialog
        open={creditTransferDialog.open}
        onOpenChange={(open) =>
          setCreditTransferDialog({ open, member: creditTransferDialog.member })
        }
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Transfer Credits</DialogTitle>
            <DialogDescription>
              Transfer {creditType} credits to{" "}
              {creditTransferDialog.member?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="creditType">Credit Type</Label>
              <Select value={creditType} onValueChange={setCreditType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select credit type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Credit Type</SelectLabel>
                    <SelectItem value="team">Team Credits</SelectItem>
                    <SelectItem value="balance">Balance Credits</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="credits">Number of Credits</Label>
              <Input
                id="credits"
                type="number"
                placeholder="Enter credits to transfer"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                min="1"
                max={
                  creditType === "team"
                    ? credits?.team ?? 0
                    : credits?.balance ?? 0
                }
              />
              <p className="text-sm text-muted-foreground">
                Available {creditType} credits:{" "}
                {creditType === "team"
                  ? credits?.team ?? 0
                  : credits?.balance ?? 0}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreditTransferDialog({ open: false, member: null });
                setTransferAmount("");
                setCreditType("team");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                handleCreditTransfer(
                  creditTransferDialog.member,
                  transferAmount
                )
              }
              disabled={transferLoading || !transferAmount}
            >
              {transferLoading && <ButtonLoader />}
              Transfer Credits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Insufficient Credits Dialog */}
      <Dialog
        open={insufficientCreditsDialog}
        onOpenChange={setInsufficientCreditsDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Insufficient Credits
            </DialogTitle>
            <DialogDescription>
              You don&apos;t have enough {creditType} credits for this operation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Current {creditType} credits:{" "}
                <strong>
                  {creditType === "team"
                    ? credits?.team ?? 0
                    : credits?.balance ?? 0}
                </strong>
                <br />
                You need to purchase more credits to continue.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInsufficientCreditsDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setInsufficientCreditsDialog(false);
              }}
              className="gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Buy Credits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
