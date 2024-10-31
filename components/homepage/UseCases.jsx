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
    description:
      "Stand out on platforms like LinkedIn, Facebook, and Instagram with a professional AI-generated headshot that captures your best self.",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "teams",
    title: "Team Pages",
    description:
      "Create cohesive and professional team pages with AI-generated headshots that maintain a consistent style across your entire organization.",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "business-cards",
    title: "Business Cards",
    description:
      "Elevate your business cards with a striking AI-generated headshot that leaves a lasting impression on potential clients and partners.",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "cv-resumes",
    title: "CV & Resumes",
    description:
      "Enhance your CV or resume with a professional AI-generated headshot that helps you stand out to potential employers.",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "email-signatures",
    title: "Email Signatures",
    description:
      "Add a personal touch to your email communications with an AI-generated headshot in your signature, fostering better connections.",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "personal-branding",
    title: "Personal Branding",
    description:
      "Establish a strong personal brand across all your online platforms with consistent, high-quality AI-generated headshots.",
    image: "/placeholder.svg?height=400&width=600",
  },
];

export default function UseCases() {
  const [activeTab, setActiveTab] = useState(useCasesArray[0].id);

  return (
    <section className="relative bg-gradient-to-b from-secondary to-background py-16 sm:py-24">
      <div className="container mx-auto py-8 px-4">
        <SectionParaHeading
          badgeText={"Use cases"}
          title={"Use Your AI Headshots everywhere, on the internet!"}
        >
          use your ai generated professional headhots everywhere on the
          internet, whenever you want, however you want.
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
                          {useCase.title}
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
