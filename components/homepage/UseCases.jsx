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
    heading:
      "Boost Your Social Media Presence with Proshoot's AI Headshots Generator.",
    description:
      "Create a unique business portrait to wear on social networks such as LinkedIn, Facebook, and Instagram that leaves an impact.",
    image: "/placeholder.svg",
  },
  {
    id: "teams",
    title: "Team Pages",
    heading: "Unify Your Team with Consistent Proshoot's Company Headshots.",
    description:
      "Create cohesive and professional team pages with AI-generated company headshots that maintain a consistent style across your entire organization.",
    image: "/placeholder.svg",
  },
  {
    id: "business-cards",
    title: "Business Cards",
    heading:
      "Make a Memorable First Impression with Business headshots on Cards.",
    description:
      "Elevate your business cards with a stunning AI-generated headshot that captures your professional AI business photo.",
    image: "/placeholder.svg",
  },
  {
    id: "cv-resumes",
    title: "CV & Resumes",
    heading:
      "Get New Possibilities for Employment with Proshoot's AI-Based Headshots.",
    description:
      "Boost your cv or resume with a professional ai generated headshot that will help you impress your future employers.",
    image: "/placeholder.svg",
  },
  {
    id: "email-signatures",
    title: "Email Signatures",
    heading:
      "Transform Your Email Signature with Proshoot's AI Headshots Generator.",
    description:
      "Add a personal touch to your email communications and foster stronger connections with an AI business headshot in your signature.",
    image: "/placeholder.svg",
  },
  {
    id: "personal-branding",
    title: "Personal Branding",
    heading:
      "Build a Strong Personal Brand with Proshoot's AI-Powered Headshots.",
    description:
      "Establish a strong personal brand across all your online platforms with consistent, high-quality Professional business headshots.",
    image: "/placeholder.svg",
  },
];

export default function UseCases() {
  const [activeTab, setActiveTab] = useState(useCasesArray[0].id);

  return (
    <section className="relative bg-gradient-to-b from-secondary to-background py-16 sm:py-24">
      <div className="container mx-auto py-8 px-4">
        <SectionParaHeading
          badgeText={"Use cases"}
          title={
            "How you can use your AI Generated Headshots Everywhere on the Internet"
          }
        >
          Use your AI Professional Headshots everywhere on the internet,
          whenever you want you can create AI business headshot photo and upload
          it on different social media platforms, resumes, Email signatures, and
          business cards let's see what it looks like.
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
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-1/2">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                          <Image
                            src={useCase.image}
                            alt={useCase.title}
                            layout="fill"
                            objectFit="cover"
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
