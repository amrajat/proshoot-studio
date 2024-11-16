"use client";

import { useState } from "react";
import { Upload, Sparkles, Download, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import SectionParaHeading from "@/components/shared/section-para-heading";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "Upload Your Images",
      description:
        "Select and upload your best everyday photos to create your headshots.",
      icon: <Upload className="w-6 h-6 text-destructive" />,
      image: "/how-it-works.png",
    },
    {
      title: "AI Magic Happens",
      description:
        "Our AI works its magic, creating a professional-grade headshot photo.",
      icon: <Sparkles className="w-6 h-6 text-destructive" />,
      image: "/how-it-works.png",
    },
    {
      title: "Download & Use",
      description:
        "Your professional headshots are available for download instantly.",
      icon: <Download className="w-6 h-6 text-destructive" />,
      image: "/how-it-works.png",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-secondary to-background py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <SectionParaHeading
          badgeText={"How It Works"}
          title={"How Proshoot Change Your Selfie into a Professional Headshot"}
        >
          Save time and money with ProShoot's AI Headshot Generator. Eliminate
          the inconvenience that comes with conventional photo shoots. In a
          matter of minutes rather than hours create professional and quality
          headshots.
        </SectionParaHeading>

        <div className="flex flex-col lg:flex-row gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex">
              <Card
                className={`flex-1 flex flex-col cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  activeStep === index ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setActiveStep(index)}
              >
                <CardHeader className="flex-grow flex flex-col justify-between">
                  <div className="flex items-center gap-4 mb-4">
                    <Badge className="px-4 py-0.8 text-lg font-bold">
                      {index + 1}
                    </Badge>
                    <CardTitle className="text-2xl">{step.title}</CardTitle>
                  </div>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardHeader>
                <CardContent className="pt-4 flex-shrink-0">
                  <div className="relative h-48 lg:h-64 bg-gray-200 rounded-md overflow-hidden group">
                    <Image
                      src={step.image}
                      alt={`Step ${index + 1}`}
                      fill
                      style={{ objectFit: "cover" }}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-background bg-opacity-50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-muted p-3 rounded-full">
                        {step.icon}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/dashboard"
            className={buttonVariants({
              variant: "destructive",
              size: "lg",
            })}
          >
            Generate AI Headshots
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
