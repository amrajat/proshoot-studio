"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast"; // Assuming you use Shadcn toast
import {
  createInvitationAction,
  resendInvitationAction,
} from "@/app/dashboard/organization/_actions/invitationActions"; // Adjusted relative path

// Re-use or import types
type Invitation = {
  id: string;
  invited_email: string;
  role: string;
  status: string;
  transfer_credit_type: string;
  transfer_credit_amount: number | null;
  created_at: string /* ... */;
};
type Credits = {
  id: string;
  balance: number;
  starter: number;
  pro: number;
  elite: number;
  studio: number /* ... */;
};
type CreditTransferType =
  | "starter"
  | "pro"
  | "elite"
  | "studio"
  | "balance"
  | "none";

interface InvitationsClientProps {
  organizationId: string;
  initialInvitations: Invitation[];
  orgCredits: Credits | null; // Pass the org's credits down
}

export default function InvitationsClient({
  // <<< Added export default
  organizationId,
  initialInvitations,
  orgCredits,
}: InvitationsClientProps) {
  const { toast } = useToast();
  const [invitations, setInvitations] =
    useState<Invitation[]>(initialInvitations);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [transferType, setTransferType] = useState<CreditTransferType>("none");
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const getAvailableCredits = (type: CreditTransferType): number => {
    if (!orgCredits) return 0;
    switch (type) {
      case "starter":
        return orgCredits.starter;
      case "pro":
        return orgCredits.pro;
      case "elite":
        return orgCredits.elite;
      case "studio":
        return orgCredits.studio;
      case "balance":
        return orgCredits.balance;
      default:
        return 0;
    }
  };

  const validateTransfer = (): boolean => {
    if (transferType === "none") return true;

    const amountToTransfer =
      transferType === "balance" ? parseInt(transferAmount, 10) : 1;
    if (
      transferType === "balance" &&
      (isNaN(amountToTransfer) || amountToTransfer <= 0)
    ) {
      setFormError(
        "Please enter a valid positive number for balance transfer."
      );
      return false;
    }

    const available = getAvailableCredits(transferType);
    if (available < amountToTransfer) {
      setFormError(
        `Insufficient credits. Organization only has ${available} ${
          transferType === "balance" ? "" : transferType
        } credits.`
      );
      return false;
    }
    return true;
  };

  const handleInviteSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setFormError(null);

    if (!validateTransfer()) {
      return;
    }

    setIsLoading(true);

    const transferData = {
      transfer_credit_type: transferType,
      transfer_credit_amount:
        transferType === "balance" ? parseInt(transferAmount, 10) : null,
    };

    try {
      const result = await createInvitationAction({
        organization_id: organizationId,
        invited_email: email,
        role: role,
        ...transferData,
      });

      if (result.error) {
        setFormError(result.error);
        toast({
          variant: "destructive",
          title: "Invitation Failed",
          description: result.error,
        });
      } else if (result.data) {
        // Add new invitation to the top of the list
        setInvitations([result.data, ...invitations]);
        setEmail("");
        setRole("member");
        setTransferType("none");
        setTransferAmount("");
        toast({
          title: "Invitation Sent",
          description: `Invitation sent to ${email}.`,
        });
      }
    } catch (err) {
      console.error("Error sending invitation:", err);
      setFormError("An unexpected error occurred.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not send invitation.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async (invitationId: string) => {
    // Optional: Add logic to resend an invitation
    console.log("Resend requested for:", invitationId);
    // try {
    //     await resendInvitationAction(invitationId); // Implement this action if needed
    //     toast({ title: "Invitation Resent" });
    // } catch (error) {
    //     toast({ variant: 'destructive', title: 'Error Resending' });
    // }
  };

  return (
    <div className="space-y-8">
      {/* Invitation Form */}
      <form
        onSubmit={handleInviteSubmit}
        className="space-y-4 border p-4 rounded-lg"
      >
        <h3 className="text-lg font-semibold">Invite New Member</h3>
        {formError && <p className="text-red-500 text-sm">{formError}</p>}
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-required="true"
            disabled={isLoading}
            placeholder="member@example.com"
          />
        </div>
        <div>
          <Label htmlFor="role">Role</Label>
          <Select
            value={role}
            onValueChange={(value: "admin" | "member") => setRole(value)}
            disabled={isLoading}
          >
            <SelectTrigger id="role">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 border p-3 rounded">
          <Label>Transfer Credits on Join (Optional)</Label>
          <Select
            value={transferType}
            onValueChange={(value: CreditTransferType) =>
              setTransferType(value)
            }
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select credit type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem
                value="starter"
                disabled={getAvailableCredits("starter") < 1}
              >
                Starter (Available: {getAvailableCredits("starter")})
              </SelectItem>
              <SelectItem value="pro" disabled={getAvailableCredits("pro") < 1}>
                Pro (Available: {getAvailableCredits("pro")})
              </SelectItem>
              <SelectItem
                value="elite"
                disabled={getAvailableCredits("elite") < 1}
              >
                Elite (Available: {getAvailableCredits("elite")})
              </SelectItem>
              <SelectItem
                value="studio"
                disabled={getAvailableCredits("studio") < 1}
              >
                Studio (Available: {getAvailableCredits("studio")})
              </SelectItem>
              <SelectItem
                value="balance"
                disabled={getAvailableCredits("balance") < 1}
              >
                From Balance (Available: {getAvailableCredits("balance")})
              </SelectItem>
            </SelectContent>
          </Select>
          {transferType === "balance" && (
            <div>
              <Label htmlFor="transferAmount">Amount from Balance</Label>
              <Input
                id="transferAmount"
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                required={transferType === "balance"}
                aria-required={transferType === "balance"}
                disabled={isLoading}
                min="1"
                placeholder="e.g., 10"
              />
            </div>
          )}
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Sending..." : "Send Invitation"}
        </Button>
      </form>

      {/* Invitations List */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Sent Invitations</h3>
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Credits Transfer
                </th>
                {/* Add Action column if needed (e.g., Resend, Revoke) */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invitations.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No invitations sent yet.
                  </td>
                </tr>
              )}
              {invitations.map((invite) => (
                <tr key={invite.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invite.invited_email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invite.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invite.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invite.transfer_credit_type === "none"
                      ? "None"
                      : invite.transfer_credit_type === "balance"
                      ? `${invite.transfer_credit_amount} (Balance)`
                      : `1 (${invite.transfer_credit_type})`}
                  </td>
                  {/* Example Action Button
                                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                         {invite.status === 'pending' && (
                                             <Button variant="ghost" size="sm" onClick={() => handleResend(invite.id)}>Resend</Button>
                                         )}
                                     </td>
                                     */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
