import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getStudioImages,
  isStudioDownloaded,
} from "@/lib/supabase/actions/server";
import CoverPage from "@/components/dashboard/CoverPage";
import ViewGeneratedImage from "@/components/dashboard/studio/ViewGeneratedImage";

function ImageSkeleton() {
  return (
    <Card>
      <CardContent className="p-2">
        <Skeleton className="h-[300px] w-full" />
        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
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
        title="Creating Headshots..."
        buttonLink="/contact"
        buttonText="Contact Support"
      >
        Please wait! Your ai headshots are being created, if it takes more than
        2 hours, please contact support.
      </CoverPage>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {!alreadyDownloaded && (
        <p className="mb-6 text-lg font-light">
          Note: These images are compressed for preview. The downloaded version
          will show the full original image quality.
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Suspense
          fallback={[...Array(8)].map((_, i) => (
            <ImageSkeleton key={i} />
          ))}
        >
          {images.map((image, index) => (
            <ViewGeneratedImage
              key={index}
              image={image}
              tune_id={params.id}
              alreadyDownloaded={alreadyDownloaded}
              imageNumber={index + 1}
            />
          ))}
        </Suspense>
      </div>
    </div>
  );
}

export default ViewStudio;
