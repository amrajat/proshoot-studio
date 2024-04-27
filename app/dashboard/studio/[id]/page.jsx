"use server";
import ViewGeneratedImage from "@/components/dashboard/studio/ViewGeneratedImage";
import {
  getStudioImages,
  isStudioDownloaded,
  updateStudioDownloadStatus,
} from "@/lib/supabase/actions/server";

async function ViewStudio({ params }) {
  const alreadyDownloaded = await isStudioDownloaded(Number(params.id));
  const images = await getStudioImages(params.id);

  return (
    <div className="max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
      <div className="mb-8 p-4">
        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card */}
          {images.map((image, index) => (
            <ViewGeneratedImage
              key={index}
              image={image}
              tune_id={Number(params.id)}
              alreadyDownloaded={alreadyDownloaded}
            />
          ))}
          {/* End Card */}
        </div>
        {/* End Grid */}
      </div>
    </div>
  );
}

export default ViewStudio;
