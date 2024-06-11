import { getCredits, getCurrentSession } from "@/lib/supabase/actions/server";
import { createUploadthing } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const MIN_NUMBER_IMAGE_UPLOAD =
  Number(process.env.MIN_NUMBER_IMAGE_UPLOAD) || 3;
const MAX_NUMBER_IMAGE_UPLOAD =
  Number(process.env.MAX_NUMBER_IMAGE_UPLOAD) || 50;
const MAX_IMAGE_SIZE = process.env.MAX_IMAGE_SIZE || "5MB";

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      maxFileSize: MAX_IMAGE_SIZE,
      maxFileCount: MAX_NUMBER_IMAGE_UPLOAD,
      minFileCount: MIN_NUMBER_IMAGE_UPLOAD,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const { session } = await getCurrentSession();
      const [{ credits }] = await getCredits();

      if (!Object.values(credits).some((count) => count > 0))
        throw new UploadThingError("No credits available to create studio.");

      // If you throw, the user will not be able to upload
      if (!session) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: session.user.id, email: session.user.email };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload

      console.log("Upload complete for userId:", metadata);

      console.log("file url", file.url);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
};
