"use client";

import Image from "next/image";
import { Check, X, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="w-full space-y-6 py-2 px-4 sm:px-6">
      <div
        className="space-y-4 rounded-xl bg-muted/30 ring-1 ring-muted-foreground/15 p-4 sm:p-5"
        role="note"
        aria-label="Photo upload recommendations"
      >
        <p className="text-muted-foreground text-sm sm:text-base">
          To get the best possible results, it's essential to follow these guidelines closely. While some tips are flexible, the
          <span className="font-medium underline text-foreground"> 5 key recommendations below must be followed</span>—otherwise, you’ll miss out on the best outcomes.
          The closer you stick to these guidelines, the better your results will be.
        </p>
        <div className="inline-flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 text-destructive px-2.5 py-1 text-xs font-medium">
          Highly recommended: follow these 5 points at least
        </div>
        <ol className="list-decimal ps-4 space-y-2.5 text-sm md:text-base">
          <li>Variation is key—avoid similar or identical images or same day photos.</li>
          <li>Upload 8-20 high-quality close-ups and upper-body shots with different outfits, expressions, and backgrounds.</li>
          <li>Ensure your photos are clear, sharp, and well-lit.</li>
          <li>Avoid full-body shots, group photos, blurry or out-of-focus images, and small faces.</li>
          <li>Include some half-body images to capture proportions accurately.</li>
        </ol>
      </div>

      <div className="space-y-6">
        <Card className="rounded-xl bg-background ring-1 ring-muted-foreground/15 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
              <Check className="text-success h-5 w-5 sm:h-6 sm:w-6" />
              Follow
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {followGuidelines.map((item) => (
                <GuidelineItem key={item.id} item={item} isCorrect={true} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl bg-background ring-1 ring-muted-foreground/15 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
              <X className="text-red-600 h-5 w-5 sm:h-6 sm:w-6" />
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
        } ring-1 ring-muted-foreground/10 shadow-xs transition-shadow duration-200 hover:shadow-sm bg-muted/20`}
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
