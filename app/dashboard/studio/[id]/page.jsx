import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getStudioImages,
  isStudioDownloaded,
} from "@/lib/supabase/actions/server";
import CoverPage from "@/components/dashboard/CoverPage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ImageGallery from "@/components/dashboard/studio/ImageGallery";

function ImageSkeleton() {
  return (
    <Card className="overflow-hidden shadow-sm border border-border/50 h-full">
      <CardContent className="p-0">
        <div className="relative aspect-square bg-muted/20 animate-pulse">
          <div className="absolute top-2 left-2 bg-background/80 w-12 h-6 rounded-md"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        </div>
        <div className="p-3 bg-muted/5">
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

async function ViewStudio({ params }) {
  const alreadyDownloaded = await isStudioDownloaded(params.id);
  const images = await getStudioImages(params.id);

  if (!images) {
    return (
      <CoverPage
        title="Generating Headshots..."
        buttonLink="/contact"
        buttonText="Contact Support"
      >
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-lg mb-4">
            Please wait! Your AI headshots are being generated.
          </p>
          <p className="text-sm text-muted-foreground">
            This process typically takes 30-60 minutes. If it takes more than 2
            hours, please contact our support team for assistance.
          </p>
        </div>
      </CoverPage>
    );
  }

  return (
    <div className="container mx-auto py-2">
      {!alreadyDownloaded && (
        <Alert className="mb-6 bg-primary/5 border-primary/20">
          <AlertDescription className="text-sm mt-2">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                These images are compressed for preview and protected with
                watermarks.
              </li>
              <li>
                Clicking the <strong>Preview</strong> button will open the image
                in a new window, still in a compressed format.
              </li>
              <li>
                Clicking the <strong>Download</strong> button will provide the
                image in full quality, and all watermarks will be automatically
                removed from all images.
              </li>
              <li className="font-medium">
                If you require headshots with custom outfits or backgrounds,
                feel free to reach out to us via chat or email. We'll do our
                best to generate them for you at no additional cost.
              </li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {alreadyDownloaded && (
        <Alert className="mb-6 bg-muted/20 border-muted">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription className="text-sm">
            If you require headshots with custom outfits or backgrounds, feel
            free to reach out. We'll do our best to generate them for you at no
            additional cost.
          </AlertDescription>
        </Alert>
      )}

      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
            {[...Array(8)].map((_, i) => (
              <ImageSkeleton key={i} />
            ))}
          </div>
        }
      >
        <ImageGallery
          images={images}
          tune_id={params.id}
          alreadyDownloaded={alreadyDownloaded}
        />
      </Suspense>
    </div>
  );
}

export default ViewStudio;
