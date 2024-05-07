"use client";
import { updateStudioDownloadStatus } from "@/lib/supabase/actions/server";
import Image from "next/image";

function ViewGeneratedImage({ image, tune_id, alreadyDownloaded }) {
  async function downloadImage() {
    try {
      // Fetch the image data
      const response = await fetch(image);
      const blob = await response.blob();

      // Create a URL for the blob
      const blobUrl = window.URL.createObjectURL(new Blob([blob]));

      // Create a link element
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "image.jpg"; // Set the filename for the downloaded image

      // Append the link to the document body
      document.body.appendChild(link);

      // Trigger a click event on the link
      link.click();

      // Remove the link and revoke the URL from memory
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  }
  return (
    <div className="group flex flex-col h-full bg-white border border-gray-200 shadow-sm dark:bg-slate-900 dark:border-gray-700 dark:shadow-slate-700/[.7]">
      <div className="h-auto w-full">
        <Image
          src={image}
          alt="ai generated image"
          width={"393"}
          height={"491"}
          className="overflow-hidden w-auto"
          quality={100}
          // objectFit="contain"
          // layout="fill"
        />
      </div>

      <div className="mt-auto flex border-t border-gray-200 divide-x divide-gray-200 dark:border-gray-700 dark:divide-gray-700">
        <a
          className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
          href={image}
          target="_blank"
        >
          Preview
        </a>
        <a
          className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
          href="#"
        >
          {!alreadyDownloaded ? (
            <form
              action={async () => {
                await updateStudioDownloadStatus(tune_id);
              }}
            >
              <button type="submit">Download</button>
            </form>
          ) : (
            <button onClick={downloadImage}>Download</button>
          )}
        </a>
      </div>
    </div>
  );
}

export default ViewGeneratedImage;
