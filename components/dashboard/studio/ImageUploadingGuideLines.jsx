import Image from "next/image";
import { HiCheck, HiXMark } from "react-icons/hi2";
import { LuBadgeCheck, LuBadgeAlert } from "react-icons/lu";

function ImageUploadingGuideLines() {
  return (
    <>
      <div
        className="bg-blue-50 border-t-4 border-blue-600 p-4 mb-2 rounded"
        role="alert"
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="inline-flex justify-center items-center size-8 rounded border-4 border-blue-100 bg-blue-600 text-white shadow-sm   ">
              <LuBadgeCheck className="flex-shrink-0 size-4" />
            </span>
          </div>
          <div className="ms-3">
            <h3 className="font-semibold  mb-2">Follow</h3>

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
          <div className="relative rounded overflow-hidden">
            <span className="absolute right-1 top-1 inline-flex justify-center items-center size-4 rounded border-2 border-blue-100 bg-blue-600 text-white shadow-sm   ">
              <HiCheck className="flex-shrink-0 size-2" />
            </span>
            <Image
              alt="image uploading guidlines"
              src="/image-uploading-guidelines/follow/follow-1.jpg"
              width={98}
              height={98}
            />
          </div>
          <div className="relative rounded overflow-hidden">
            <span className="absolute right-1 top-1 inline-flex justify-center items-center size-4 rounded border-2 border-blue-100 bg-blue-600 text-white shadow-sm   ">
              <HiCheck className="flex-shrink-0 size-2" />
            </span>
            <Image
              alt="image uploading guidlines"
              src="/image-uploading-guidelines/follow/follow-2.jpg"
              width={98}
              height={98}
            />
          </div>
          <div className="relative rounded overflow-hidden">
            <span className="absolute right-1 top-1 inline-flex justify-center items-center size-4 rounded border-2 border-blue-100 bg-blue-600 text-white shadow-sm   ">
              <HiCheck className="flex-shrink-0 size-2" />
            </span>
            <Image
              alt="image uploading guidlines"
              src="/image-uploading-guidelines/follow/follow-3.jpg"
              width={98}
              height={98}
            />
          </div>
          <div className="relative rounded overflow-hidden">
            <span className="absolute right-1 top-1 inline-flex justify-center items-center size-4 rounded border-2 border-blue-100 bg-blue-600 text-white shadow-sm   ">
              <HiCheck className="flex-shrink-0 size-2" />
            </span>
            <Image
              alt="image uploading guidlines"
              src="/image-uploading-guidelines/follow/follow-4.jpg"
              width={98}
              height={98}
            />
          </div>
          <div className="relative rounded overflow-hidden">
            <span className="absolute right-1 top-1 inline-flex justify-center items-center size-4 rounded border-2 border-blue-100 bg-blue-600 text-white shadow-sm   ">
              <HiCheck className="flex-shrink-0 size-2" />
            </span>
            <Image
              alt="image uploading guidlines"
              src="/image-uploading-guidelines/follow/follow-5.jpg"
              width={98}
              height={98}
            />
          </div>
          <div className="relative rounded overflow-hidden">
            <span className="absolute right-1 top-1 inline-flex justify-center items-center size-4 rounded border-2 border-blue-100 bg-blue-600 text-white shadow-sm   ">
              <HiCheck className="flex-shrink-0 size-2" />
            </span>
            <Image
              alt="image uploading guidlines"
              src="/image-uploading-guidelines/follow/follow-6.jpg"
              width={98}
              height={98}
            />
          </div>
        </div>
      </div>
      <div
        className="bg-red-50 border-t-4 border-red-500 p-4 rounded"
        role="alert"
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="inline-flex justify-center items-center size-8 rounded border-4 border-red-100 bg-red-600 text-white shadow-sm   ">
              <LuBadgeAlert className="flex-shrink-0 size-4" />
            </span>
          </div>
          <div className="ms-3">
            <h3 className="font-semibold  mb-2">Avoid</h3>
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
          <div className="relative rounded overflow-hidden">
            <span className="absolute right-1 top-1 inline-flex justify-center items-center size-4 rounded border-2 border-red-100 bg-red-600 text-white shadow-sm   ">
              <HiXMark className="flex-shrink-0 size-2" />
            </span>
            <Image
              alt="image uploading guidlines"
              src="/image-uploading-guidelines/avoid/avoid-1.jpg"
              width={98}
              height={98}
            />
          </div>
          <div className="relative rounded overflow-hidden">
            <span className="absolute right-1 top-1 inline-flex justify-center items-center size-4 rounded border-2 border-red-100 bg-red-600 text-white shadow-sm   ">
              <HiXMark className="flex-shrink-0 size-2" />
            </span>
            <Image
              alt="image uploading guidlines"
              src="/image-uploading-guidelines/avoid/avoid-2.jpg"
              width={98}
              height={98}
            />
          </div>
          <div className="relative rounded overflow-hidden">
            <span className="absolute right-1 top-1 inline-flex justify-center items-center size-4 rounded border-2 border-red-100 bg-red-600 text-white shadow-sm   ">
              <HiXMark className="flex-shrink-0 size-2" />
            </span>
            <Image
              alt="image uploading guidlines"
              src="/image-uploading-guidelines/avoid/avoid-3.jpg"
              width={98}
              height={98}
            />
          </div>
          <div className="relative rounded overflow-hidden">
            <span className="absolute right-1 top-1 inline-flex justify-center items-center size-4 rounded border-2 border-red-100 bg-red-600 text-white shadow-sm   ">
              <HiXMark className="flex-shrink-0 size-2" />
            </span>
            <Image
              alt="image uploading guidlines"
              src="/image-uploading-guidelines/avoid/avoid-4.jpg"
              width={98}
              height={98}
            />
          </div>
          <div className="relative rounded overflow-hidden">
            <span className="absolute right-1 top-1 inline-flex justify-center items-center size-4 rounded border-2 border-red-100 bg-red-600 text-white shadow-sm   ">
              <HiXMark className="flex-shrink-0 size-2" />
            </span>
            <Image
              alt="image uploading guidlines"
              src="/image-uploading-guidelines/avoid/avoid-5.jpg"
              width={98}
              height={98}
            />
          </div>
          <div className="relative rounded overflow-hidden">
            <span className="absolute right-1 top-1 inline-flex justify-center items-center size-4 rounded border-2 border-red-100 bg-red-600 text-white shadow-sm   ">
              <HiXMark className="flex-shrink-0 size-2" />
            </span>
            <Image
              alt="image uploading guidlines"
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
