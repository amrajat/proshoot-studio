"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Sparkles, Download, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import SectionParaHeading from "@/components/shared/section-para-heading";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "../ui/badge";
export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "Upload Your Images",
      description:
        "Upload 10-20 selfies with varied expressions and angles. Use a plain background for best results.",
      icon: <Upload className="w-6 h-6 text-destructive" />,
      image: "/how-it-works.png",
    },
    {
      title: "AI Magic Happens",
      description:
        "Our advanced AI analyzes your photos and generates a diverse set of professional headshots.",
      icon: <Sparkles className="w-6 h-6 text-destructive" />,
      image: "/how-it-works.png",
    },
    {
      title: "Download & Use",
      description:
        "Choose your favorite AI-generated headshots. Perfect for LinkedIn, company websites, or personal branding!",
      icon: <Download className="w-6 h-6 text-destructive" />,
      image: "/how-it-works.png",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-secondary to-background py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <SectionParaHeading
          badgeText={"How It Works"}
          title={"Choose Our AI Headshots?"}
        >
          Transform your selfies into professional headshots with our
          cutting-edge AI technology.
        </SectionParaHeading>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="flex"
            >
              <Card
                className={`flex flex-col cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  activeStep === index ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setActiveStep(index)}
              >
                <CardHeader className="flex-grow">
                  <div className="flex items-center gap-4 mb-4">
                    <Badge className="px-4 py-0.8 text-lg font-bold">
                      {index + 1}
                    </Badge>
                    <CardTitle className="text-2xl">{step.title}</CardTitle>
                  </div>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="relative h-48 bg-gray-200 rounded-md overflow-hidden group">
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
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
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
          {/* <p className="mt-4 text-sm text-muted-foreground">
            No credit card required | 100% satisfaction guaranteed
          </p> */}
        </motion.div>
      </div>
    </section>
  );
}
