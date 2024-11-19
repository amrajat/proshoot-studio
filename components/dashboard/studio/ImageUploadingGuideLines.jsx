import Image from "next/image";
import { BadgeCheck, BadgeAlert, Check, X } from "lucide-react";

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
              <BadgeCheck className="flex-shrink-0 size-4" />
            </span>
          </div>
          <div className="ms-3">
            <h3 className="font-semibold  mb-2">Follow</h3>

            <ul
              role="list"
              className="marker:text-blue-600 list-disc ps-4 space-y-2 text-sm"
            >
              <li>
                Clear and frontal face in good lighting and Remember good input
                = good output.
              </li>
              <li>
                Use plain backgrounds if possible without any background noise.
              </li>
              <li>
                Please upload at-least 10 camera facing photos taken on
                different time and place if possible.
              </li>
              <li>Use photos from different days to avoid repetition.</li>
              <li>
                Use high resolution professional camera or smartphone photos
                minimum face size 1024*1024 pixels.
              </li>
            </ul>
          </div>
        </div>
        <div className="flex w-full flex-wrap gap-2 mt-4 justify-center">
          <div className="relative rounded overflow-hidden">
            <span className="absolute right-1 top-1 inline-flex justify-center items-center size-4 rounded border-2 border-blue-100 bg-blue-600 text-white shadow-sm   ">
              <Check className="flex-shrink-0 size-2" />
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
              <Check className="flex-shrink-0 size-2" />
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
              <Check className="flex-shrink-0 size-2" />
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
              <Check className="flex-shrink-0 size-2" />
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
              <Check className="flex-shrink-0 size-2" />
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
              <Check className="flex-shrink-0 size-2" />
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
              <BadgeAlert className="flex-shrink-0 size-4" />
            </span>
          </div>
          <div className="ms-3">
            <h3 className="font-semibold  mb-2">Avoid</h3>
            <ul
              role="list"
              className="marker:text-red-600 list-disc ps-4 space-y-2 text-sm"
            >
              <li>
                Avoid uploading images taken at the same day because using
                multiple images with the same object will make the model learn
                the object as well as part of the subject.
              </li>

              <li>
                Please do not upload funny or weird faces or any photos with
                other people/objects (hats, masks, sun glasses, or any other
                accessories).
              </li>
              <li>
                Avoid face/color filters; they make your photos look fake and
                avoid blurry or low-quality photos.
              </li>
              <li>
                Don’t upload AI-generated photos and make sure your face is
                clear, not-pixelated and isn’t cut off in the photo.
              </li>
              <li>
                Avoid clothing, jewelry, or makeup you don’t usually wear and
                don’t use angled selfies or photos with face distortions.
              </li>
              <li>
                Avoid uploading many similar photos with the same outfit. Use a
                variety instead.
              </li>
            </ul>
          </div>
        </div>
        <div className="flex w-full flex-wrap gap-2 mt-4 justify-center">
          <div className="relative rounded overflow-hidden">
            <span className="absolute right-1 top-1 inline-flex justify-center items-center size-4 rounded border-2 border-red-100 bg-red-600 text-white shadow-sm   ">
              <X className="flex-shrink-0 size-2" />
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
              <X className="flex-shrink-0 size-2" />
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
              <X className="flex-shrink-0 size-2" />
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
              <X className="flex-shrink-0 size-2" />
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
              <X className="flex-shrink-0 size-2" />
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
              <X className="flex-shrink-0 size-2" />
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
