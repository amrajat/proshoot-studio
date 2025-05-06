"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// Removed TypeScript types

// Helper to format currency (remains the same)
const formatCurrency = (amount, currency) => {
  if (typeof amount !== "number" || typeof currency !== "string") return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

// Helper to get description for transaction type (remains the same)
const getTransactionDescription = (tx) => {
  if (!tx) return "N/A";
  if (tx.description) return tx.description;
  switch (tx.type) {
    case "purchase":
      return "Purchased credits";
    case "studio_creation":
      return "Studio creation fee";
    case "refund":
      return "Credit refund";
    case "admin_grant":
      return "Credits granted by admin";
    case "initial":
      return "Initial balance assignment";
    case "transfer_in":
      return "Credits received via invite";
    case "transfer_out":
      return "Credits transferred via invite";
    default:
      return `Unknown transaction (${tx.type})`;
  }
};

// Helper to identify if transaction is personal or for which org (remains the same)
const getTransactionContext = (tx) => {
  if (!tx?.credits) return "Unknown";
  if (tx.credits.user_id) {
    return "Personal";
  }
  if (tx.credits.organization_id) {
    return (
      tx.credits.organizations?.name ||
      `Organization (${tx.credits.organization_id.substring(0, 6)}...)`
    );
  }
  return "Unknown";
};

export default function BillingClient({
  personalCredits,
  ownedOrganizationCredits, // Updated prop name
  memberOrganizationCredits, // Updated prop name
  personalPurchases,
  organizationPurchases,
  transactions,
}) {
  const allPurchases = [
    ...(personalPurchases || []),
    ...(organizationPurchases || []),
  ].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const safeOwnedOrgs = ownedOrganizationCredits || [];
  const safeMemberOrgs = memberOrganizationCredits || [];
  const safeTransactions = transactions || [];

  return (
    <div className="space-y-8">
      {/* Credits Overview */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Credit Balances</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Personal Credits Card */}
          {personalCredits && (
            <Card>
              <CardHeader>
                <CardTitle>Personal Credits</CardTitle>
                <CardDescription>Your individual balance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <strong>Balance:</strong> {personalCredits.balance ?? 0}
                </p>
                <p>
                  <strong>Starter:</strong> {personalCredits.starter ?? 0}
                </p>
                <p>
                  <strong>Pro:</strong> {personalCredits.pro ?? 0}
                </p>
                <p>
                  <strong>Elite:</strong> {personalCredits.elite ?? 0}
                </p>
                <p>
                  <strong>Studio:</strong> {personalCredits.studio ?? 0}
                </p>
                <p className="text-xs text-gray-500 pt-2">
                  Last updated:{" "}
                  {format(new Date(personalCredits.updated_at), "PPp")}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Owned Organization Credits Cards */}
          {safeOwnedOrgs.map((org) => (
            <Card key={org.id}>
              <CardHeader>
                <CardTitle>{org.name ?? "Organization"}</CardTitle>
                <CardDescription>Owned Organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {org.credits ? (
                  <>
                    <p>
                      <strong>Balance:</strong> {org.credits.balance ?? 0}
                    </p>
                    <p>
                      <strong>Starter:</strong> {org.credits.starter ?? 0}
                    </p>
                    <p>
                      <strong>Pro:</strong> {org.credits.pro ?? 0}
                    </p>
                    <p>
                      <strong>Elite:</strong> {org.credits.elite ?? 0}
                    </p>
                    <p>
                      <strong>Studio:</strong> {org.credits.studio ?? 0}
                    </p>
                    <p className="text-xs text-gray-500 pt-2">
                      Last updated:{" "}
                      {format(new Date(org.credits.updated_at), "PPp")}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">
                    Credit details unavailable.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Member Organization Credits Cards */}
          {safeMemberOrgs.map((org) => (
            <Card key={org.id}>
              <CardHeader>
                <CardTitle>{org.name ?? "Organization"}</CardTitle>
                <CardDescription>Member Of</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {org.credits ? (
                  <>
                    <p>
                      <strong>Balance:</strong> {org.credits.balance ?? 0}
                    </p>
                    <p>
                      <strong>Starter:</strong> {org.credits.starter ?? 0}
                    </p>
                    <p>
                      <strong>Pro:</strong> {org.credits.pro ?? 0}
                    </p>
                    <p>
                      <strong>Elite:</strong> {org.credits.elite ?? 0}
                    </p>
                    <p>
                      <strong>Studio:</strong> {org.credits.studio ?? 0}
                    </p>
                    <p className="text-xs text-gray-500 pt-2">
                      Last updated:{" "}
                      {format(new Date(org.credits.updated_at), "PPp")}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">
                    Credit details unavailable.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        {personalCredits === null &&
          safeOwnedOrgs.length === 0 &&
          safeMemberOrgs.length === 0 && (
            <p className="text-center text-gray-500 mt-4">
              No credit balances found.
            </p>
          )}
      </section>

      {/* Purchase History */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Purchase History</h2>
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Credits Granted</TableHead>
                  <TableHead>For</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allPurchases.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-gray-500"
                    >
                      No purchases found.
                    </TableCell>
                  </TableRow>
                )}
                {allPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>
                      {format(new Date(purchase.created_at), "PP")}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(purchase.amount, purchase.currency)}
                    </TableCell>
                    <TableCell>{purchase.credits_granted ?? "N/A"}</TableCell>
                    <TableCell>
                      {purchase.organization_id
                        ? purchase.organizations?.name || "Organization"
                        : "Personal"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          purchase.status === "succeeded"
                            ? "default"
                            : purchase.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {purchase.status ?? "Unknown"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* Transaction History */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Context</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeTransactions.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-gray-500"
                    >
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
                {safeTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      {format(new Date(tx.created_at), "PPp")}
                    </TableCell>
                    <TableCell>{getTransactionContext(tx)}</TableCell>
                    <TableCell>{getTransactionDescription(tx)}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        tx.change_amount > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {tx.change_amount > 0 ? "+" : ""}
                      {tx.change_amount ?? 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
