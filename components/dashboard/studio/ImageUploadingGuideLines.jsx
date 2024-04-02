import { LuBadgeCheck, LuBadgeAlert } from "react-icons/lu";

function ImageUploadingGuideLines() {
  return (
    <>
      <div
        className="bg-blue-50 border-t-4 border-blue-500 p-4 dark:bg-blue-800/30 mb-2"
        role="alert"
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="inline-flex justify-center items-center size-8 rounded-full border-4 border-blue-100 bg-blue-200 text-blue-800 dark:border-blue-900 dark:bg-blue-800 dark:text-blue-400">
              <LuBadgeCheck className="flex-shrink-0 size-4" />
            </span>
          </div>
          <div className="ms-3">
            <h3 className="text-gray-800 font-semibold dark:text-white mb-2">
              Follow
            </h3>

            <ul
              role="list"
              className="marker:text-blue-600 list-disc ps-4 space-y-2 text-sm text-gray-600 dark:text-gray-400"
            >
              <li>
                Please upload at least 15 photos of your subject. We require 5
                full-body shots, 5 medium shots, and 5 close-ups to produce
                realistic images. However, you may submit at least 3 images to
                fine-tune the model.
              </li>
              <li>
                Vary the poses, background, and lighting for each picture.
              </li>
              <li>Use photos from different days to avoid repetition.</li>
            </ul>
          </div>
        </div>
      </div>
      <div
        className="bg-red-50 border-t-4 border-red-500 p-4 dark:bg-red-800/30"
        role="alert"
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="inline-flex justify-center items-center size-8 rounded-full border-4 border-red-100 bg-red-200 text-red-800 dark:border-red-900 dark:bg-red-800 dark:text-red-400">
              <LuBadgeAlert className="flex-shrink-0 size-4" />
            </span>
          </div>
          <div className="ms-3">
            <h3 className="text-gray-800 font-semibold dark:text-white mb-2">
              Avoid
            </h3>
            <ul
              role="list"
              className="marker:text-red-600 list-disc ps-4 space-y-2 text-sm text-gray-600 dark:text-gray-400"
            >
              <li>
                Avoid using photos taken at the same time of day or with the
                same background.
              </li>
              <li>
                Please do not upload funny faces or any photos with other
                people/objects.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default ImageUploadingGuideLines;
