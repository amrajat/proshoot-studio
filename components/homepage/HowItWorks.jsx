"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Sparkles, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SectionParaHeading from "@/components/shared/section-para-heading";
export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "Upload Your Images",
      description:
        "Upload 10-20 selfies with varied expressions and angles. Use a plain background for best results.",
      icon: <Upload className="w-6 h-6 text-destructive" />,
      image: "/examples/ai-portrait-1.jpg?height=200&width=300",
    },
    {
      title: "AI Magic Happens",
      description:
        "Our advanced AI analyzes your photos and generates a diverse set of professional headshots.",
      icon: <Sparkles className="w-6 h-6 text-destructive" />,
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      title: "Download & Use",
      description:
        "Choose your favorite AI-generated headshots. Perfect for LinkedIn, company websites, or personal branding!",
      icon: <Download className="w-6 h-6 text-destructive" />,
      image: "/placeholder.svg?height=200&width=300",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-secondary to-background py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <SectionParaHeading
          badgeText={"How It Works"}
          title={"hy Choose Our AI Headshots?"}
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
                    <div className="bg-gradient-to-br from-primary to-muted text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-md">
                      {index + 1}
                    </div>
                    <CardTitle className="text-2xl">{step.title}</CardTitle>
                  </div>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="relative h-48 bg-gray-200 dark:bg-gray-800 rounded-md overflow-hidden group">
                    <img
                      src={step.image}
                      alt={`Step ${index + 1}`}
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
          <Button size="lg" variant={"destructive"}>
            Get Started Now
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required | 100% satisfaction guaranteed
          </p>
        </motion.div>
      </div>
    </section>
  );
}
