import Image from "next/image";
import { LuBadgeCheck, LuBadgeAlert } from "react-icons/lu";

function ImageUploadingGuideLines() {
  return (
    <>
      <div
        className="bg-blue-50 border-t-4 border-blue-500 p-4 dark:bg-blue-800/30 mb-2 text-gray-800
        dark:text-gray-200"
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
              className="marker:text-blue-600 list-disc ps-4 space-y-2 text-sm"
            >
              <li>
                Please upload at-least 10 (recommended but not required) camera
                facing photos taken on different time and place if possible.
                However, you may submit at least 3 images to fine-tune the
                model.
              </li>
              <li>
                Images ideally cropped to a 1:1 aspect ratio but not required.
              </li>
              <li>
                Vary the poses, background, and lighting for each picture so
                each picture should introduce new information about the person.
              </li>
              <li>Use photos from different days to avoid repetition.</li>
              <li>
                It is also important to always use a new background for every
                image.
              </li>
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
              className="marker:text-red-600 list-disc ps-4 space-y-2 text-sm"
            >
              <li>
                Avoid uploading pictures taken at the same hour or day because
                using multiple pictures with the same object will make the model
                learn the object as well as part of the subject
              </li>

              <li>
                Please do not upload funny or weird faces or any photos with
                other people/objects (hats, goggles, or any other accessories).
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default ImageUploadingGuideLines;
