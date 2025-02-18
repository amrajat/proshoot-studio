"use client";

import Image from "next/image";
import { Check, X, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Heading from "@/components/shared/heading";

const followGuidelines = [
  {
    id: 1,
    title: "Clear Frontal Face",
    image: "/image-uploading-guidelines/follow/follow-1.jpg",
    description: [
      "Variety is the key, range of outfits and backgrounds.",
      "Upload photos taken from a good distance, ideally an arms-length away.",
    ],
  },
  {
    id: 2,
    title: "Plain Background",
    image: "/image-uploading-guidelines/follow/follow-2.jpg",
    description: [
      "Your face is focus of photo, free from background distractions.",
      "Upload photos, ideally from the chest or waist up.",
    ],
  },
  {
    id: 3,
    title: "Multiple Photos",
    image: "/image-uploading-guidelines/follow/follow-3.jpg",
    description: [
      "Upload high-quality, well-lit photos with a clear frontal view.",
    ],
  },
  {
    id: 4,
    title: "High Resolution",
    image: "/image-uploading-guidelines/follow/follow-4.jpg",
    description: [
      "Use images taken with a professional camera or a good smartphone.",
    ],
  },
];

const avoidGuidelines = [
  {
    id: 5,
    title: "Same Day Photos",
    image: "/image-uploading-guidelines/avoid/avoid-1.jpg",
    description: [
      "Do not upload multiple similar photos with the same outfit or taken in the same setting.",
      // "Ensure images are high-quality & sharp, no blurriness, poor lighting, or noise.",
      // "Avoid full-body shots.",
    ],
  },
  {
    id: 6,
    title: "Accessories",
    image: "/image-uploading-guidelines/avoid/avoid-2.jpg",
    description: [
      "Do not use edited, AI-generated images.",
      "No black-and-white or instagram type filtered images.",
      "Face must be frontal, directly looking at camera.",
      "Do not include other people or faces in your image.",
    ],
  },
  {
    id: 7,
    title: "Filters",
    image: "/image-uploading-guidelines/avoid/avoid-3.jpg",
    description: [
      "Avoid wearing heavy makeup.",
      "Do not upload blurry, out-of-focus, or low-quality images.",
      "Avoid low-quality images.",
      // "Upload recent photos from the last six months that accurately reflect your current facial features.",
      "Natural angle, ideally from the front at eye level. Ensure your face is fully visible—avoid extreme angles, cropped framing, or poses that distort your facial proportions.",
    ],
  },
  {
    id: 8,
    title: "AI-Generated Photos",
    image: "/image-uploading-guidelines/avoid/avoid-4.jpg",
    description: [
      "Avoid exaggerated or unusual facial expressions.",
      // "Avoid any background noise if possible.",
      "Not too far from the camera, ideally an arms-length away.",
      "Do not wear hats, sunglasses, AirPods, or any other accessories that obstruct your face.",
      "Must avoid full-body shots.",
    ],
  },
];

export default function ImageUploadingGuideLines() {
  return (
    <>
      <Heading as="h5" variant={"title"}>
        TL;DR Version
      </Heading>
      <ul className="marker:text-primary list-disc ps-4 space-y-2 text-sm">
        <li>
          Upload 8-12 (best range) high-quality upper-body photos with different
          outfits and backgrounds.
        </li>
        <li>Variation is key—avoid similar or identical images.</li>
        <li>Ensure your photos are clear, sharp, and well-lit.</li>
        <li>
          Avoid full-body shots, group photos, blurry or out-of-focus images,
          and small faces.
        </li>
        <li>
          Just 5-6 high-quality images can work wonders, while even one
          poor-quality image can negatively impact the entire training.
        </li>
      </ul>
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <Card className="rounded shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Check className="mr-2 text-success" />
              Follow
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {followGuidelines.map((item) => (
                <GuidelineItem key={item.id} item={item} isCorrect={true} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <X className="mr-2 text-red-600" />
              Avoid
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {avoidGuidelines.map((item) => (
                <GuidelineItem key={item.id} item={item} isCorrect={false} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function GuidelineItem({ item, isCorrect }) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className={`relative aspect-square rounded-lg overflow-hidden group border-2 ${
          isCorrect ? "border-success" : "border-red-600"
        }`}
      >
        <Image
          src={item.image}
          alt={item.title}
          layout="fill"
          objectFit="cover"
          quality={100}
        />
      </div>
      <ul
        className={`${
          isCorrect ? "marker:text-success" : "marker:text-red-600 text-red-600"
        } list-disc ps-4 space-y-2 text-sm`}
      >
        {item.description.map((point, index) => (
          <li key={index}>{point}</li>
        ))}
      </ul>
    </div>
  );
}
