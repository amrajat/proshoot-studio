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
    title: "Close-up Shots",
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
    ],
  },
  {
    id: 6,
    title: "Group Photos",
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
    title: "Blurry, Low quality, Filters",
    image: "/image-uploading-guidelines/avoid/avoid-3.jpg",
    description: [
      "Avoid wearing heavy makeup.",
      "Do not upload blurry, out-of-focus, or low-quality images.",
      "Avoid low-quality images.",
      "Natural angle, ideally from the front at eye level. Ensure your face is fully visible—avoid extreme angles, cropped framing, or poses that distort your facial proportions.",
    ],
  },
  {
    id: 8,
    title: "AI-Generated, Small Faces",
    image: "/image-uploading-guidelines/avoid/avoid-4.jpg",
    description: [
      "Avoid exaggerated or unusual facial expressions.",
      "Not too far from the camera, ideally an arms-length away.",
      "Do not wear hats, sunglasses, AirPods, or any other accessories that obstruct your face.",
      "Must avoid full-body shots.",
    ],
  },
];

export default function ImageUploadingGuideLines() {
  return (
    <div className="w-full space-y-6 py-2">
      <div className="space-y-4">
        <p className="text-muted-foreground">
          These guidelines aren't strict rules—just tips to help you get the
          best results! The closer you follow them, the better.
        </p>
        <p className="text-destructive font-bold">
          Highly Recommended, Follow these 5 points at least.
        </p>
        <ul className="marker:text-primary list-disc ps-4 space-y-3 text-sm md:text-base">
          <li>
            Upload 8-20 high-quality close-ups, upper-body shots with different
            outfits and backgrounds.
          </li>
          <li>
            Variation is key—avoid similar or identical images or same day
            photos.
          </li>
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
      </div>

      <div className="space-y-6">
        <Card className="rounded shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
              <Check className="mr-2 text-success h-5 w-5 sm:h-6 sm:w-6" />
              Follow
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {followGuidelines.map((item) => (
                <GuidelineItem key={item.id} item={item} isCorrect={true} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
              <X className="mr-2 text-red-600 h-5 w-5 sm:h-6 sm:w-6" />
              Avoid
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {avoidGuidelines.map((item) => (
                <GuidelineItem key={item.id} item={item} isCorrect={false} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function GuidelineItem({ item, isCorrect }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-1">
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            isCorrect ? "bg-success" : "bg-red-600"
          }`}
        ></div>
        <h4 className="font-medium text-sm sm:text-base">{item.title}</h4>
      </div>
      <div
        className={`relative aspect-square rounded-lg overflow-hidden group border-2 ${
          isCorrect ? "border-success" : "border-red-600"
        }`}
      >
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover"
          quality={90}
        />
      </div>
      <ul
        className={`${
          isCorrect ? "marker:text-success" : "marker:text-red-600 text-red-600"
        } list-disc ps-4 space-y-1.5 text-xs sm:text-sm`}
      >
        {item.description.map((point, index) => (
          <li key={index}>{point}</li>
        ))}
      </ul>
    </div>
  );
}
