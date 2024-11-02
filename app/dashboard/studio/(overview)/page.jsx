import { Suspense } from "react";
import {
  getCurrentSession,
  getPurchaseHistory,
  getStudios,
} from "@/lib/supabase/actions/server";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import BuyStudio from "../buy/page";
import StudioCard from "@/components/dashboard/studio/StudioCard";

async function StudioContent() {
  try {
    const { session } = await getCurrentSession();
    const [{ purchase_history = [] } = {}] = await getPurchaseHistory();
    const studios = await getStudios(session.user.id);

    if (purchase_history.length < 1) {
      return <BuyStudio />;
    }

    if (studios.length < 1) {
      return (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            No Headshots Found!
          </h2>
          <p className="text-muted-foreground">
            It appears that you have not generated any headshots yet.
          </p>
          <Button asChild>
            <Link href="/dashboard/studio/create">Generate AI Headshots</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Card className="group rounded shadow-none flex flex-col h-full">
          <CardHeader className="relative aspect-[4/5] p-0 overflow-hidden rounded">
            <Image
              src="/examples/ai-portrait-1.jpg"
              alt="Create New Studio"
              fill
              className="object-cover rounded"
            />
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            <p className="text-sm font-semibold text-primary">
              Create New Studio
            </p>
            <CardTitle>Generate Headshots</CardTitle>
            <p className="text-sm text-muted-foreground">
              Generate headshots for another person.
            </p>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button asChild className="w-full">
              <Link href="/dashboard/studio/create">
                Generate Now
                <Plus className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        {studios.map((studio, index) => (
          <StudioCard key={studio.id} studio={studio} index={index} />
        ))}
      </div>
    );
  } catch (error) {
    console.error("Error in StudioContent:", error);
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Something went wrong. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }
}

export default function Studio() {
  return (
    <Suspense fallback={<StudioSkeleton />}>
      <StudioContent />
    </Suspense>
  );
}

function StudioSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="p-0">
            <Skeleton className="aspect-[4/5] w-full" />
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
