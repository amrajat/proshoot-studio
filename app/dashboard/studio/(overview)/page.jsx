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
import { Plus, Camera, ImagePlus } from "lucide-react";
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
        <div className="max-w-md mx-auto text-center space-y-6 py-12">
          <div className="bg-primary/10 rounded-full p-4 w-20 h-20 mx-auto flex items-center justify-center">
            <Camera className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            No Headshots Found
          </h2>
          <p className="text-muted-foreground">
            It appears that you have not generated any headshots yet. Let's
            create your first AI headshot studio!
          </p>
          <Button asChild size="lg" className="mt-4 px-8">
            <Link href="/dashboard/studio/create" className="flex items-center">
              <ImagePlus className="mr-2 h-5 w-5" />
              Generate AI Headshots
            </Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Card className="group shadow-none rounded-lg transition-all duration-300 border border-border/50 h-full flex flex-col overflow-hidden">
          <CardHeader className="relative aspect-[4/5] p-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/20 group-hover:opacity-80 transition-opacity duration-300 z-10" />
            {/* <Image
                src="/examples/ai-portrait-1.jpg"
                alt="Create New Studio"
                fill
                className="object-cover transition-transform duration-500"
              /> */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
              <Link
                href="/dashboard/studio/create"
                className="flex items-center justify-center"
              >
                <div className="bg-background/80 backdrop-blur-sm rounded-full p-4 mb-3 hover:scale-110 transition-all duration-300">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-2 flex-grow">
            <p className="text-sm font-medium text-primary">
              Create New Studio
            </p>
            <CardTitle className="text-xl group-hover:text-primary transition-colors">
              Generate Headshots
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload your images and generate.
            </p>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button
              asChild
              className="w-full group-hover:bg-primary/90 transition-colors"
            >
              <Link
                href="/dashboard/studio/create"
                className="flex items-center justify-center"
              >
                <ImagePlus className="mr-2 h-4 w-4" />
                Generate Now
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
          Something went wrong. Please try again later or contact support if the
          problem persists.
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
    <div>
      <div className="mb-8">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-72" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="overflow-hidden border border-border/50">
            <CardHeader className="p-0">
              <Skeleton className="aspect-[4/5] w-full" />
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-6 w-2/3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
