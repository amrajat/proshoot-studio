"use client";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import SectionParaHeading from "@/components/shared/section-para-heading";

const pricingPlans = [
  {
    name: "Basic",
    price: 29,
    description: "Start your online presence",
    features: [
      "40 AI-generated Headshots",
      "10 Unique Clothing Options",
      "10 Unique Backgrounds",
      "Ready within 2 Hours",
      "Money Back Guarantee",
    ],
  },
  {
    name: "Standard",
    price: 39,
    description: "Ideal for professionals seeking variety",
    features: [
      "60 AI-generated Headshots",
      "15 Unique Clothing Options",
      "15 Unique Backgrounds",
      "Ready within 2 Hours",
      "Money Back Guarantee",
    ],
  },
  {
    name: "Premium",
    price: 49,
    description: "Best value for growing online presence",
    features: [
      "80 AI-generated Headshots",
      "20 Unique Clothing Options",
      "20 Unique Backgrounds",
      "Ready within 2 Hours",
      "Money Back Guarantee",
    ],
    popular: true,
  },
  {
    name: "Pro",
    price: 59,
    description: "Ultimate package for seasoned professionals",
    features: [
      "100 AI-generated Headshots",
      "25 Unique Clothing Options",
      "25 Unique Backgrounds",
      "Ready within 1 Hour",
      "Money Back Guarantee",
    ],
  },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="relative bg-gradient-to-b from-secondary/40 to-background py-16 sm:py-24 px-4 overflow-hidden"
    >
      <div className="container mx-auto">
        <SectionParaHeading
          badgeText={"One time fee"}
          title={"Simple, One-Time Payment"}
        >
          No recurring payments or hidden charges. You have complete ownership
          and commercial rights to your images, allowing you to use them freely
          without any restrictions.
        </SectionParaHeading>

        <div className="mt-6 md:mt-12 grid sm:grid-cols-2 lg:grid-cols-2 min-[1170px]:grid-cols-4 gap-3 md:gap-6 lg:gap-3 xl:gap-6 lg:items-center">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
              className={`flex flex-col text-center rounded-xl ${
                plan.popular
                  ? "border-2 border-primary shadow-xl relative z-10 bg-card/50 backdrop-blur-sm"
                  : "border-2 hover:border-primary/50"
              }`}
            >
              <CardHeader>
                {plan.popular && (
                  <Badge
                    variant="secondary"
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs uppercase font-semibold w-auto self-center bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    Most Popular
                  </Badge>
                )}
                <CardTitle className="text-xl font-bold mb-4 text-foreground/90">
                  {plan.name}
                </CardTitle>
                <div className="font-bold text-3xl md:text-4xl xl:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                  ${plan.price}
                  <span className="text-sm font-normal text-muted-foreground">
                    /person
                  </span>
                </div>
                <CardDescription className="text-muted-foreground/90 font-medium">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow text-sm">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle2 className="size-4 flex-shrink-0 mt-0.5 text-primary/90 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link
                  href="/auth"
                  className={`w-full ${buttonVariants({
                    variant: plan.popular ? "default" : "default",
                  })}`}
                >
                  Generate Headshots
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center relative z-10">
          <h3 className="text-2xl font-bold leading-tight tracking-tighter md:text-3xl lg:leading-[1.1] text-center mb-4 lowercase">
            Love It or Get Your Money Back
          </h3>
          <p className="font-light text-foreground max-w-2xl mx-auto">
            Love your AI headshots or get a full refund, our 7-days money-back
            guarantee ensures a risk-free experience.
          </p>
        </div>
      </div>
    </section>
  );
}
