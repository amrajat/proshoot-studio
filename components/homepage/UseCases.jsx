"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import SectionParaHeading from "@/components/shared/section-para-heading";

const useCasesArray = [
  {
    id: "social-media",
    title: "Social Media",
    heading: "Boost your social media presence.",
    description:
      "Create a unique business portrait to wear on social networks such as LinkedIn, Facebook, and Instagram that leaves an impact.",
    image: "/linkedin.png",
  },
  {
    id: "teams",
    title: "Team Pages",
    heading: "Consistent company headshots",
    description:
      "Create cohesive and professional team pages with AI-generated company headshots that maintain a consistent style across your entire organization.",
    image: "/team-page.png",
  },
  {
    id: "cv-resumes",
    title: "CV & Resumes",
    heading: "New possibilities for employment.",
    description:
      "Boost your cv or resume with a professional ai generated headshot that will help you impress your future employers.",
    image: "/cv-resume.png",
  },
  {
    id: "email-signatures",
    title: "Email Signatures",
    heading: "Professional emails and business cards.",
    description:
      "Add a personal touch to your email communications and foster stronger connections with an AI business headshot in your signature.",
    image: "/email-sign.png",
  },
  {
    id: "personal-branding",
    title: "Personal Branding",
    heading: "Personal branding and online presence.",
    description:
      "Establish a strong personal brand across all your online platforms with consistent, high-quality Professional business headshots.",
    image: "/tweet.png",
  },
];

export default function UseCases() {
  const [activeTab, setActiveTab] = useState(useCasesArray[0].id);

  return (
    <section className="relative bg-gradient-to-b from-secondary to-background py-16 sm:py-24">
      <div className="container mx-auto py-8 px-4">
        <SectionParaHeading
          badgeText={"Use cases"}
          title={"Upgrade Your Professional Presence"}
        >
          Upgrade your professional presence with our AI headshot generator.
          Instantly create high-quality, realistic headshots that reflect your
          true personality, ready to enhance your presence across LinkedIn,
          resumes, email signatures, and more. No waiting, no hassle, just a
          perfect headshot in no time.
        </SectionParaHeading>
        <Tabs
          defaultValue={useCasesArray[0].id}
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="flex flex-wrap justify-center gap-2 mb-24 md:mb-16 lg:mb-8 bg-transparent text-primary">
            {useCasesArray.map((useCase) => (
              <TabsTrigger
                key={useCase.id}
                value={useCase.id}
                className="px-3 py-2 text-sm sm:text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {useCase.title}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="grid gap-8">
            {useCasesArray.map((useCase) => (
              <TabsContent
                key={useCase.id}
                value={useCase.id}
                className="outline-none"
              >
                <Card className="shadow-none rounded">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-1/2">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                          <Image
                            src={useCase.image}
                            alt={useCase.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                      </div>
                      <div className="w-full md:w-1/2 flex flex-col justify-center">
                        <h3 className="text-2xl font-semibold mb-4">
                          {useCase.heading}
                        </h3>
                        <p className="text-muted-foreground">
                          {useCase.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </section>
  );
}
