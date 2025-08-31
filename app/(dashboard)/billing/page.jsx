import createSupabaseServerClient from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
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
import { unstable_noStore as noStore } from "next/cache";
import { Briefcase, Camera, Coins, Rocket, Users } from "lucide-react";

// Helper function to format currency
const formatCurrency = (amount, currency = "USD") => {
  if (typeof amount !== "number") return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

// Helper function to get status badge variant
const getStatusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case "succeeded":
    case "completed":
      return "default";
    case "pending":
    case "processing":
      return "secondary";
    case "failed":
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
};

// Helper function to format transaction amount with color
const formatTransactionAmount = (amount) => {
  const isPositive = amount > 0;
  return {
    text: `${isPositive ? "+" : ""}${amount}`,
    className: isPositive ? "text-green-600" : "text-red-600",
  };
};

export default async function BillingPage() {
  noStore();
  const supabase = await createSupabaseServerClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth");
  }

  // Fetch all purchases for the user
  const { data: purchases, error: purchasesError } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (purchasesError) {
    console.error("Purchases Error:", purchasesError.message);
  }

  // Fetch all transactions for the user
  const { data: transactions, error: transactionsError } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (transactionsError) {
    console.error("Transactions Error:", transactionsError.message);
  }

  // Fetch user credits (single record per user with their organization_id)
  const { data: credits, error: creditsError } = await supabase
    .from("credits")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (creditsError) {
    console.error("Credits Error:", creditsError.message);
  }

  return (
    <div className="space-y-8">
        {/* Credits Overview Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              Credit Balance
            </h2>
            <p className="text-muted-foreground">
              Your current credit balances across different plans.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Balance</CardTitle>
                <Coins className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {credits?.balance || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Available credits
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Starter</CardTitle>
                <Rocket className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {credits?.starter || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Starter plan credits
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Professional
                </CardTitle>
                <Briefcase className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {credits?.professional || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Professional plan credits
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Studio</CardTitle>
                <Camera className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{credits?.studio || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Studio plan credits
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team</CardTitle>
                <Users className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{credits?.team || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Team plan credits
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Purchases Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              Purchase History
            </h2>
            <p className="text-muted-foreground">
              View all your credit purchases and payment history.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Purchases</CardTitle>
              <CardDescription>
                All credit purchases made on your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Credit Type</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!purchases || purchases.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No purchases found. Start by purchasing credits to see
                          your history here.
                        </TableCell>
                      </TableRow>
                    ) : (
                      purchases.map((purchase) => (
                        <TableRow key={purchase.id}>
                          <TableCell className="font-medium">
                            {format(
                              new Date(purchase.created_at),
                              "MMM dd, yyyy"
                            )}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(purchase.amount, purchase.currency)}
                          </TableCell>
                          <TableCell className="uppercase">
                            {purchase.currency}
                          </TableCell>
                          <TableCell>
                            {purchase.credits_granted || "N/A"}
                          </TableCell>
                          <TableCell className="capitalize">
                            {purchase.credits_type?.replace("_", " ") || "N/A"}
                          </TableCell>
                          <TableCell className="capitalize">
                            {purchase.payment_provider}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(purchase.status)}>
                              {purchase.status || "Unknown"}
                            </Badge>
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

        {/* Transactions Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              Transaction History
            </h2>
            <p className="text-muted-foreground">
              Detailed log of all credit transactions and usage.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>
                All credit transactions including purchases, usage, and
                transfers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Context</TableHead>
                      <TableHead>Credit Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Credits Used</TableHead>
                      <TableHead>Studio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!transactions || transactions.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No transactions found. Transactions will appear here
                          when you purchase or use credits.
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((transaction) => {
                        const amountFormatted = formatTransactionAmount(
                          transaction.credits_used
                        );
                        return (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium">
                              {format(
                                new Date(transaction.created_at),
                                "MMM dd, yyyy HH:mm"
                              )}
                            </TableCell>
                            <TableCell className="capitalize">
                              {transaction.context?.replace("_", " ") || "N/A"}
                            </TableCell>
                            <TableCell className="capitalize">
                              {transaction.credit_type?.replace("_", " ") ||
                                "N/A"}
                            </TableCell>
                            <TableCell>
                              {transaction.description || "No description"}
                            </TableCell>
                            <TableCell
                              className={`text-right font-medium ${amountFormatted.className}`}
                            >
                              {amountFormatted.text}
                            </TableCell>
                            <TableCell>
                              {transaction.related_studio_id ? (
                                <Badge variant="outline">
                                  Studio:{" "}
                                  {transaction.related_studio_id.substring(
                                    0,
                                    8
                                  )}
                                  ...
                                </Badge>
                              ) : (
                                "N/A"
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>
    </div>
  );
}
