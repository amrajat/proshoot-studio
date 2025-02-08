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
    description: "Perfect for individuals starting their online presence",
    features: [
      "40 AI-generated Headshots",
      "10 Unique Clothing Options",
      "10 Unique Backgrounds",
      "Ready within 2 Hours",
      "Money Back Guarantee",
      "1 Studio Redo",
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
      "1 Studio Redo",
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
      "1 Studio Redo",
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
      "1 Studio Redo",
    ],
  },
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    // <section className="py-16 px-4 bg-background">
    <section
      id="pricing"
      className="relative bg-gradient-to-b from-secondary to-background py-16 sm:py-24 px-4"
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

        {/* <div className="flex justify-center items-center space-x-4 mb-8">
          <span
            className={`text-sm font-medium ${
              !isAnnual ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Individuals
          </span>
          <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
          <span
            className={`text-sm font-medium ${
              isAnnual ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Teams{" "} */}
        {/* {
              <Badge variant="outline" className="ml-2">
                {isAnnual && "minimum team of 10 people."}
              </Badge>
            } */}
        {/* </span> */}
        {/* </div> */}

        <div className="mt-6 md:mt-12 grid sm:grid-cols-2 lg:grid-cols-2 min-[1170px]:grid-cols-4 gap-3 md:gap-6 lg:gap-3 xl:gap-6 lg:items-center">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
              className={`flex flex-col text-center rounded ${
                plan.popular ? "border-2 border-primary shadow-lg" : ""
              }`}
            >
              <CardHeader>
                {plan.popular && (
                  <Badge className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded text-xs uppercase font-semibold w-auto self-center">
                    Most Popular
                  </Badge>
                )}
                <CardTitle className="text-lg mb-4">{plan.name}</CardTitle>
                <div className="font-bold text-3xl md:text-4xl xl:text-5xl">
                  ${isAnnual ? "$" : plan.price}
                  <span className="text-sm font-normal text-muted-foreground">
                    {isAnnual ? "/person" : "/session"}
                  </span>
                </div>
                <CardDescription className="text-accent-foreground">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow text-sm">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle2 className="size-4 flex-shrink-0 mt-0.5 text-primary mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link
                  href="/auth"
                  className={`w-full border-primary ${buttonVariants({
                    variant: plan.popular ? "default" : "outline",
                  })}`}
                >
                  {isAnnual ? "Contact Us" : "Get Started"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
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
