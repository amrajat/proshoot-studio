"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import SectionParaHeading from "@/components/shared/section-para-heading";

export default function Component() {
  const features = {
    proshoot: [
      {
        title: "Available Instantly",
        description:
          "Get AI-generated professional headshots delivered in minutes, ready for immediate use across all platforms.",
        icon: CheckCircle2,
      },
      {
        title: "Consistent, High-Quality Output",
        description:
          "Enjoy high-resolution headshots that capture realism and professionalism without the high costs of a traditional photoshoot.",
        icon: CheckCircle2,
      },
      {
        title: "Fast Results with No Waiting",
        description:
          "Experience quick AI processing with options for re-dos, so you're never left waiting for quality headshots.",
        icon: CheckCircle2,
      },
      {
        title: "Multiple Styles and Backgrounds",
        description:
          "Choose from diverse styles and backgrounds to match your professional or personal branding, all with fast delivery.",
        icon: CheckCircle2,
      },
      {
        title: "Money-Back Guarantee",
        description:
          "We're confident in our AI headshot generator. If you're not satisfied, receive a full refund.",
        icon: CheckCircle2,
      },
      {
        title: "Affordable and Accessible for Everyone",
        description:
          "Enjoy professional-quality headshots at an accessible price, with a range of styles, poses, and customization options.",
        icon: CheckCircle2,
      },
    ],
    alternatives: [
      {
        title: "Requires Scheduling and Booking",
        description:
          "Traditional photoshoots require advance booking and come with unpredictable waiting times.",
        icon: XCircle,
      },
      {
        title: "Quality Varies Based on Photographer",
        description:
          "Results depend heavily on the photographer, leading to inconsistent quality across headshots.",
        icon: AlertCircle,
      },
      {
        title: "Waiting Times for Edited Photos",
        description:
          "Edits and final delivery can take days or even weeks, causing delays and potential disruptions.",
        icon: ShieldAlert,
      },
      {
        title: "Limited to One or Two Backgrounds Per Shoot",
        description:
          "Conventional photoshoots offer minimal background variety, limiting the versatility of your headshots.",
        icon: XCircle,
      },
      {
        title: "No Money-Back Guarantee",
        description:
          "Traditional services may not offer refunds, leaving you at risk if you're not satisfied with the results.",
        icon: XCircle,
      },
      {
        title: "Higher Costs, Especially for Multiple Poses",
        description:
          "Adding different poses, outfits, or backgrounds increases costs in traditional photoshoots.",
        icon: Clock,
      },
    ],
  };

  return (
    <section className="bg-gradient-to-b from-secondary to-background py-16 sm:py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionParaHeading
          badgeText={"AI vs Traditional Photography"}
          title={
            "Why AI Headshot Generator is more popular than Traditional Photography?"
          }
        >
          See how our AI Professional Headshot Generator is making big financial
          disruptions in the photography market by producing ultra-realistic
          headshot photos at a fraction of the cost of traditional photography.
        </SectionParaHeading>

        <div className="grid md:grid-cols-2 gap-8">
          {/* proshootPic Column */}
          <div>
            <Card className="relative h-full overflow-hidden bg-primary/5 border-primary/10">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
              <CardContent className="p-6">
                <div className="mb-8">
                  <div className="flex gap-1 items-center mb-2">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                    <h3 className="text-2xl font-bold text-primary">
                      AI based Studio{" "}
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    Professional Headshots using Proshoot AI headshot generator.
                  </p>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-6">
                    {features.proshoot.map((feature) => (
                      <div key={feature.title} className="flex gap-4">
                        <feature.icon className="w-6 h-6 text-primary shrink-0" />
                        <div>
                          <h4 className="font-semibold mb-1">
                            {feature.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alternatives Column */}
          <div>
            <Card className="h-full border-muted bg-muted/5">
              <CardContent className="p-6">
                <div className="mb-8">
                  <div className="flex gap-1 items-center mb-2">
                    <XCircle
                      className="w-6 h-6 text-destructive shrink-0"
                      aria-hidden="true"
                    />
                    <h3 className="text-2xl font-bold text-muted-foreground">
                      Traditional Photography
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    The conventional way to get professional headshots.
                  </p>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-6">
                    {features.alternatives.map((feature) => (
                      <div key={feature.title} className="flex gap-4">
                        <feature.icon className="w-6 h-6 text-destructive shrink-0" />
                        <div>
                          <h4 className="font-semibold mb-1">
                            {feature.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
