"use client";

import Image from "next/image";
import { Check, X, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const followGuidelines = [
  {
    id: 1,
    title: "Clear Frontal Face",
    image: "/image-uploading-guidelines/follow/follow-1.jpg",
    description: ["Range of outfits and backgrounds."],
  },
  {
    id: 2,
    title: "Plain Background",
    image: "/image-uploading-guidelines/follow/follow-2.jpg",
    description: ["Your Face is focus of photo without any background noise."],
  },
  {
    id: 3,
    title: "Multiple Photos",
    image: "/image-uploading-guidelines/follow/follow-3.jpg",
    description: [
      "Large, high-resolution clear frontal face in good lighting (min. 1024x1024 pixels).",
    ],
  },
  {
    id: 4,
    title: "High Resolution",
    image: "/image-uploading-guidelines/follow/follow-4.jpg",
    description: [
      "Photos taken with a professional camera/good camera smartphone not any random selfies.",
    ],
  },
];

const avoidGuidelines = [
  {
    id: 5,
    title: "Same Day Photos",
    image: "/image-uploading-guidelines/avoid/avoid-1.jpg",
    description: [
      "Avoid using multiple similar photos from the same outfit and/or same background, as the AI needs diverse samples to function properly. Using several similar images will limit the AI's ability to learn your appearance. The AI functions better with diverse sample photos.",
    ],
  },
  {
    id: 6,
    title: "Accessories",
    image: "/image-uploading-guidelines/avoid/avoid-2.jpg",
    description: [
      "Do not use post processed images or any edited images.",
      "Using Instagram face filters will make your AI-generated photos look overly plastic. Stay away from black and white or sepia filters, as they can cause discoloration of your skin.",
      "Your face must be directly looking at camera, face must be frontal.",
      "Don not include other people/face in your image, otherwise AI will also learn their face.",
    ],
  },
  {
    id: 7,
    title: "Filters",
    image: "/image-uploading-guidelines/avoid/avoid-3.jpg",
    description: [
      "Please do not submit wedding photos, as makeup and clothing from weddings do not translate well.",
      "Do not upload blurry/distorted/pixelated images.",
      "Do not use any AI-generated image or any artifacts in your images.",
      "Ensure your face is fully visible—avoid angles that may make your head look stretched, or framing that cuts off your face or prevents you from looking directly at the camera.",
    ],
  },
  {
    id: 8,
    title: "AI-Generated Photos",
    image: "/image-uploading-guidelines/avoid/avoid-4.jpg",
    description: [
      "Aim for natural expressions. Avoid showing sadness, anger, surprise, or any unusual facial expressions you do not want in your photoshoot.",
      "Avoid any background noise if possible.",
      "Please do not wear hats, sunglasses, AirPods, or other headphones, as they will appear in your headshots.",
      "Too far: Ensure your face is large enough in the photo (no smaller than 1024x1024 pixels) to avoid blurry or grainy results.",
    ],
  },
];

export default function ImageUploadingGuideLines() {
  return (
    <>
      <ul className="marker:text-primary list-disc ps-4 space-y-2 text-sm">
        <li>
          Avoid using multiple similar photos from the same outfit, as the AI
          needs diverse samples to function properly. Using several similar
          images will limit the AI's ability to learn your appearance.
        </li>
        <li>
          The results of our AI Headshots depend on how well you choose your
          sample photos, so select them carefully and take your time to collect
          good photos.
        </li>
        <li>
          Do not upload photos with Instagram or TikTok filters, artistic
          editing, post-processing, AI-generated or any other artifacts. The AI
          will exaggerate any filters, creating an "Obvious AI-generated".
        </li>
        <li>
          Existing professional headshots are great to use, as long as they
          don't have any filters or post-processing.
        </li>
        <li>
          Follow these guidelines to be eligible for refunds if the generated
          images do not meet your expectations.
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
