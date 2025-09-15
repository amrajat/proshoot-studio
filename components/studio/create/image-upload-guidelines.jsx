"use client";

import { Card, CardContent } from "@/components/ui/card";

const guidelinesSections = [
  {
    id: "must-follow",
    title: "Must follow",
    textColor: "text-emerald-800",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    badgeColor: "bg-emerald-100 text-emerald-800",
    items: [
      {
        text: "Upload photos with variety: different outfits, lighting, times of day, and backgrounds",
        isCritical: true
      },
      {
        text: "When cropping after upload, select from head to half-body to keep face and body proportions accurate",
        isCritical: true
      },
      {
        text: "Don't worry about image quality. Upload at least 2 good photos; the rest can be average. Variety matters more than quality",
        isCritical: false
      }
    ]
  },
  {
    id: "must-avoid",
    title: "Must avoid",
    textColor: "text-red-800",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    badgeColor: "bg-red-100 text-red-800",
    items: [
      {
        text: "Many similar shots (same outfit, background, or lighting)",
        isCritical: false
      },
      {
        text: "Edited, filtered, or AI-generated images",
        isCritical: false
      },
      {
        text: "Blurry or out-of-focus photos",
        isCritical: false
      },
      {
        text: "Heavy makeup or overly processed images",
        isCritical: false
      },
      {
        text: "Other people in the frame",
        isCritical: false
      }
    ]
  },
  {
    id: "workable",
    title: "Workable",
    textColor: "text-amber-800",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    badgeColor: "bg-amber-100 text-amber-800",
    items: [
      {
        text: "If variety is limited, you may include 1–2 images with hats, sunglasses, or AirPods — but not many",
        isCritical: false
      }
    ]
  }
];

const GuidelineItem = ({ item, textColor }) => {
  return (
    <li className="flex items-start gap-2">
      <div className="flex-1 min-w-0">
        <p className={`${textColor} text-sm leading-relaxed`}>
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
          className={`text-sm sm:text-base font-semibold ${section.textColor} mb-2`}
        >
          {section.title}
        </h3>
        
        <ul 
          className="space-y-2"
          role="list"
          aria-label={`${section.title} guidelines`}
        >
          {section.items.map((item, index) => (
            <GuidelineItem 
              key={index} 
              item={item} 
              textColor={section.textColor}
            />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default function ImageUploadGuidelines() {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Header Section */}
      <header 
        className="mb-4"
        role="banner"
      >
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-3 sm:p-4">
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              Our AI works well even with low-quality photos, as long as your uploads have enough variety. 
              Follow these guidelines to get the best results from your photo session.
            </p>
          </CardContent>
        </Card>
      </header>

      {/* Guidelines Sections */}
      <main>
        <div className="grid gap-3">
          {guidelinesSections.map((section) => (
            <GuidelineSection key={section.id} section={section} />
          ))}
        </div>
      </main>

      {/* Footer Note */}
      <footer className="mt-4">
        <Card className="bg-gray-50 border-gray-200">
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

