import Image from "next/image";
import { HiCheck, HiXMark } from "react-icons/hi2";
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
                Please upload at-least 10 camera facing photos taken on
                different time and place if possible.
              </li>
              <li>
                Vary the poses, background, and lighting for each picture so
                each picture should introduce new information about the person.
              </li>
              <li>Use photos from different days to avoid repetition.</li>
            </ul>
          </div>
        </div>
        <div className="flex w-full flex-wrap gap-2 mt-4 justify-center">
          <div className="relative rounded-lg overflow-hidden">
            <span className="absolute right-1 top-1 inline-flex justify-center items-center size-4 rounded-full border-2 border-green-100 bg-green-200 text-green-800 dark:border-green-900 dark:bg-green-800 dark:text-green-400">
              <HiCheck className="flex-shrink-0 size-2" />
            </span>
            <Image
              alt=""
              src="/image-uploading-guidelines/follow/follow-1.jpg"
              width={98}
              height={98}
            />
          </div>
          <div className="relative rounded-lg overflow-hidden">
            <span className="absolute right-1 top-1 inline-flex justify-center items-center size-4 rounded-full border-2 border-green-100 bg-green-200 text-green-800 dark:border-green-900 dark:bg-green-800 dark:text-green-400">
              <HiCheck className="flex-shrink-0 size-2" />
            </span>
            <Image
              alt=""
              src="/image-uploading-guidelines/follow/follow-2.jpg"
              width={98}
              height={98}
            />
          </div>
          <div className="relative rounded-lg overflow-hidden">
            <span className="absolute right-1 top-1 inline-flex justify-center items-center size-4 rounded-full border-2 border-green-100 bg-green-200 text-green-800 dark:border-green-900 dark:bg-green-800 dark:text-green-400">
              <HiCheck className="flex-shrink-0 size-2" />
            </span>
            <Image
              alt=""
              src="/image-uploading-guidelines/follow/follow-3.jpg"
              width={98}
              height={98}
            />
          </div>
          <div className="relative rounded-lg overflow-hidden">
            <span className="absolute right-1 top-1 inline-flex justify-center items-center size-4 rounded-full border-2 border-green-100 bg-green-200 text-green-800 dark:border-green-900 dark:bg-green-800 dark:text-green-400">
              <HiCheck className="flex-shrink-0 size-2" />
            </span>
            <Image
              alt=""
              src="/image-uploading-guidelines/follow/follow-4.jpg"
              width={98}
              height={98}
            />
          </div>
          <div className="relative rounded-lg overflow-hidden">
            <span className="absolute right-1 top-1 inline-flex justify-center items-center size-4 rounded-full border-2 border-green-100 bg-green-200 text-green-800 dark:border-green-900 dark:bg-green-800 dark:text-green-400">
              <HiCheck className="flex-shrink-0 size-2" />
            </span>
            <Image
              alt=""
              src="/image-uploading-guidelines/follow/follow-5.jpg"
              width={98}
              height={98}
            />
          </div>
          <div className="relative rounded-lg overflow-hidden">
            <span className="absolute right-1 top-1 inline-flex justify-center items-center size-4 rounded-full border-2 border-green-100 bg-green-200 text-green-800 dark:border-green-900 dark:bg-green-800 dark:text-green-400">
              <HiCheck className="flex-shrink-0 size-2" />
            </span>
            <Image
              alt=""
              src="/image-uploading-guidelines/follow/follow-6.jpg"
              width={98}
              height={98}
            />
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
                other people/objects (hats, masks, sun glasses, or any other
                accessories).
              </li>
              <li>Please avoid side view images.</li>
            </ul>
          </div>
        </div>
        <div className="flex w-full flex-wrap gap-2 mt-4 justify-center">
          <div className="relative rounded-lg overflow-hidden">
            <span className="absolute right-1 top-1 inline-flex justify-center items-center size-4 rounded-full border-2 border-red-100 bg-red-200 text-red-800 dark:border-red-900 dark:bg-red-800 dark:text-red-400">
              <HiXMark className="flex-shrink-0 size-2" />
            </span>
            <Image
              alt=""
              src="/image-uploading-guidelines/avoid/avoid-1.jpg"
              width={98}
              height={98}
            />
          </div>
          <div className="relative rounded-lg overflow-hidden">
            <span className="absolute right-1 top-1 inline-flex justify-center items-center size-4 rounded-full border-2 border-red-100 bg-red-200 text-red-800 dark:border-red-900 dark:bg-red-800 dark:text-red-400">
              <HiXMark className="flex-shrink-0 size-2" />
            </span>
            <Image
              alt=""
              src="/image-uploading-guidelines/avoid/avoid-2.jpg"
              width={98}
              height={98}
            />
          </div>
          <div className="relative rounded-lg overflow-hidden">
            <span className="absolute right-1 top-1 inline-flex justify-center items-center size-4 rounded-full border-2 border-red-100 bg-red-200 text-red-800 dark:border-red-900 dark:bg-red-800 dark:text-red-400">
              <HiXMark className="flex-shrink-0 size-2" />
            </span>
            <Image
              alt=""
              src="/image-uploading-guidelines/avoid/avoid-3.jpg"
              width={98}
              height={98}
            />
          </div>
          <div className="relative rounded-lg overflow-hidden">
            <span className="absolute right-1 top-1 inline-flex justify-center items-center size-4 rounded-full border-2 border-red-100 bg-red-200 text-red-800 dark:border-red-900 dark:bg-red-800 dark:text-red-400">
              <HiXMark className="flex-shrink-0 size-2" />
            </span>
            <Image
              alt=""
              src="/image-uploading-guidelines/avoid/avoid-4.jpg"
              width={98}
              height={98}
            />
          </div>
          <div className="relative rounded-lg overflow-hidden">
            <span className="absolute right-1 top-1 inline-flex justify-center items-center size-4 rounded-full border-2 border-red-100 bg-red-200 text-red-800 dark:border-red-900 dark:bg-red-800 dark:text-red-400">
              <HiXMark className="flex-shrink-0 size-2" />
            </span>
            <Image
              alt=""
              src="/image-uploading-guidelines/avoid/avoid-5.jpg"
              width={98}
              height={98}
            />
          </div>
          <div className="relative rounded-lg overflow-hidden">
            <span className="absolute right-1 top-1 inline-flex justify-center items-center size-4 rounded-full border-2 border-red-100 bg-red-200 text-red-800 dark:border-red-900 dark:bg-red-800 dark:text-red-400">
              <HiXMark className="flex-shrink-0 size-2" />
            </span>
            <Image
              alt=""
              src="/image-uploading-guidelines/avoid/avoid-6.jpg"
              width={98}
              height={98}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default ImageUploadingGuideLines;
