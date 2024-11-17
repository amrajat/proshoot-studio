import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCredits, getPurchaseHistory } from "@/lib/supabase/actions/server";
import ShowLocalTimeStamp from "@/components/dashboard/ShowLocalTimeStamp";
import BuyStudio from "../studio/buy/page";

const creditTypes = ["Basic", "Standard", "Premium", "Pro"];

async function Credits() {
  let purchaseHistory = [];
  let credits = {};
  let error = null;

  try {
    const [{ purchase_history = [] } = {}] = await getPurchaseHistory();
    const [{ credits: fetchedCredits = {} } = {}] = await getCredits();
    purchaseHistory = purchase_history;
    credits = fetchedCredits;
  } catch (err) {
    error = "Something went wrong while fetching data.";
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-lg mx-auto mt-8">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (purchaseHistory.length < 1) {
    return <BuyStudio />;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Credits</h2>
        <p className="text-muted-foreground mb-6">
          View your available credits.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {creditTypes.map((type) => (
            <CreditCard key={type} type={type} amount={credits[type] || 0} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
        <p className="text-muted-foreground mb-6">
          View your transaction history.
        </p>
        <Card className="rounded shadow-none">
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6 py-4">Qty.</TableHead>
                    <TableHead className="px-6 py-4">Plan</TableHead>
                    <TableHead className="px-6 py-4">Payment ID</TableHead>
                    <TableHead className="px-6 py-4 text-right">
                      Timestamp
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseHistory.map((transaction, index) => (
                    <TableRow key={index}>
                      <TableCell className="px-6 py-4">
                        {transaction.qty}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {transaction.plan}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {transaction.session}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <ShowLocalTimeStamp ts={transaction.timestamp} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function CreditCard({ type, amount }) {
  return (
    <Card className="rounded shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{type}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{amount}</div>
      </CardContent>
    </Card>
  );
}

export default Credits;
