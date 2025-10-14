"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import Image from "next/image";

const guidelinesSections = [
  {
    id: "must-follow",
    title: "Must follow",
    type: "success",
    textColor: "text-emerald-800",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    badgeColor: "bg-emerald-100 text-emerald-800",
    iconColor: "text-emerald-600",
    items: [
      {
        text: "Photos with variety: different outfits, lighting, times of day, and backgrounds.",
        isCritical: true
      },
      {
        text: "When cropping after upload, keep waist-up photo in selection area or AI will make you skinner.",
        isCritical: true
      },
      {
        text: "You can upload total 10 photos (4 waist-up and 6 close-ups) for best results.",
        isCritical: true
      },
      {
        text: "Same hairstyle and beard.",
        isCritical: true
      },
      {
        text: "Looking directly at the camera. No silly faces.",
        isCritical: true
      }
    ]
  },
  {
    id: "must-avoid",
    title: "Must avoid",
    type: "error",
    textColor: "text-red-800",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    badgeColor: "bg-red-100 text-red-800",
    iconColor: "text-red-600",
    items: [
      {
        text: "Similar photos (same outfit, background, or lighting).",
        isCritical: false
      },
      {
        text: "Edited, filtered, or AI-generated photos.",
        isCritical: false
      },
      {
        text: "Blurry or out-of-focus photos.",
        isCritical: false
      },
      {
        text: "Heavy makeup or overly processed photos.",
        isCritical: false
      },
      {
        text: "Other people in the frame.",
        isCritical: false
      }
      ,
      {
        text: "Old photos of you where your face appearance is not consistent .",
        isCritical: false
      }
    ]
  },
  {
    id: "workable",
    title: "Workable",
    type: "info",
    textColor: "text-amber-800",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    badgeColor: "bg-amber-100 text-amber-800",
    iconColor: "text-amber-600",
    items: [
      {
        text: "If variety is limited, you may include 1–2 photos with hats, sunglasses, or AirPods — but not many.",
        isCritical: false
      }
    ]
  }
];

const GuidelineIcon = ({ type }) => {
  if (type === "success") {
    return <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" aria-hidden="true" />;
  }
  if (type === "error") {
    return <XCircle className="w-5 h-5 flex-shrink-0 text-red-600" aria-hidden="true" />;
  }
  return <Info className="w-5 h-5 flex-shrink-0 text-amber-600" aria-hidden="true" />;
};

const GuidelineItem = ({ item, textColor, type }) => {
  return (
    <li className="flex items-start gap-2 sm:gap-3">
      <GuidelineIcon type={type} />
      <div className="flex-1 min-w-0">
        <p className={`${textColor} text-xs sm:text-sm leading-relaxed`}>
          {item.text}
        </p>
      </div>
    </li>
  );
};

const GuidelineSection = ({ section }) => {
  return (
    <Card 
      className={`${section.bgColor} ${section.borderColor} border transition-all duration-200`}
      role="region"
      aria-labelledby={`${section.id}-heading`}
    >
      <CardContent className="p-3 sm:p-4">
        <h3 
          id={`${section.id}-heading`}
          className={`text-sm sm:text-base font-semibold ${section.textColor} mb-3`}
        >
          {section.title}
        </h3>
        
        <ul 
          className="space-y-2 sm:space-y-3"
          role="list"
          aria-label={`${section.title} guidelines`}
        >
          {section.items.map((item, index) => (
            <GuidelineItem 
              key={index} 
              item={item} 
              textColor={section.textColor}
              type={section.type}
            />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

const ExampleImagesSection = () => {
  return (
    <section 
      className="mt-4"
      role="region"
      aria-labelledby="example-images-heading"
    >
      <Card className="bg-emerald-50 border-emerald-200">
        <CardContent className="p-3 sm:p-4">
          <h3 
            id="example-images-heading"
            className="text-sm sm:text-base font-semibold text-emerald-900 mb-3"
          >
            Example Photos (What to Upload)
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
            {Array.from({ length: 10 }).map((_, index) => (
              <div 
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-emerald-200 hover:border-emerald-400 transition-all duration-200"
                role="img"
                aria-label={`Example image ${index + 1}`}
              >
                <Image
                  src={`/images/photo-guidelines/${index + 1}.jpeg`}
                  alt={`Example image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                />
              </div>
            ))}
          </div>
          
          <p className="text-xs sm:text-sm text-emerald-800 mt-3 leading-relaxed">
            Upload a mix of waist-up and close-up photos with different outfits, backgrounds, and lighting for best results.
          </p>
        </CardContent>
      </Card>
    </section>
  );
};

export default function ImageUploadGuidelines() {
  return (
    <div 
      className="w-full max-w-4xl mx-auto p-3 sm:p-4"
      role="main"
      aria-label="Image upload guidelines"
    >
      {/* Header Section */}
      <header 
        className="mb-3 sm:mb-4"
        role="banner"
      >
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed font-medium">
              Please follow these guidelines to get the best results from your photo session.
            </p>
          </CardContent>
        </Card>
      </header>

      {/* Example Images Section - Show first on mobile for better UX */}
      <ExampleImagesSection />

      {/* Guidelines Sections */}
      <main className="mt-3 sm:mt-4">
        <div className="grid gap-2 sm:gap-3">
          {guidelinesSections.map((section) => (
            <GuidelineSection key={section.id} section={section} />
          ))}
        </div>
      </main>

      {/* Footer Note */}
      <footer className="mt-3 sm:mt-4 mb-2">
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-3 text-center">
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              <strong className="text-gray-900">Pro tip:</strong> Variety matters more than quality. 
              Even average photos work great if they show different outfits, lighting, times of day, and backgrounds.
            </p>
          </CardContent>
        </Card>
      </footer>
    </div>
  );
}

