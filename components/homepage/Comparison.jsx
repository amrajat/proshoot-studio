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
import Image from "next/image";

export default function Comparison() {
  const features = {
    better: [
      {
        title: "Ultra-Realistic, Professional Headshots",
        description:
          "Our AI-generated headshots are designed with precision to deliver high-quality, lifelike photos that rival traditional photography.",
        icon: CheckCircle2,
      },
      {
        title: "Advanced Face-Matching Technology",
        description:
          "Our AI algorithms ensure consistent identity and high resemblance across all headshots, providing unmatched quality.",
        icon: CheckCircle2,
      },
      {
        title: "Robust Data Privacy and Protection",
        description:
          "Your data is safeguarded with enterprise-level security, ensuring the utmost protection of your personal information.",
        icon: CheckCircle2,
      },
      {
        title: "Satisfaction Guaranteed or Your Money Back",
        description:
          "We stand by our quality. If you're not satisfied, we offer options for re-edits or a full refund.",
        icon: CheckCircle2,
      },
      {
        title: "24/7 Support from Real People",
        description:
          "Our dedicated team is here to help whenever you need it, with prompt, human-centered customer support.",
        icon: CheckCircle2,
      },
    ],
    alternatives: [
      {
        title: "Low-Quality, Artificial Appearance",
        description:
          "Other providers often deliver headshots that look obviously AI-generated, lacking natural realism.",
        icon: XCircle,
      },
      {
        title: "Inconsistent Identity Across Photos",
        description:
          "Some services produce random, inconsistent results, making it hard to achieve a cohesive professional look.",
        icon: AlertCircle,
      },
      {
        title: "Minimal Data Security Measures",
        description:
          "Basic security protocols leave your personal information vulnerable, risking data privacy.",
        icon: ShieldAlert,
      },
      {
        title: "Complicated Refund Policies",
        description:
          "Many alternatives have strict and complex refund policies, making it difficult to claim a guaranteed refund.",
        icon: XCircle,
      },
      {
        title: "Slow, Automated Customer Support",
        description:
          "Long wait times and automated responses can leave you without the support you need, when you need it.",
        icon: Clock,
      },
    ],
  };

  return (
    <section className="bg-gradient-to-b from-secondary to-background py-16 sm:py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionParaHeading
          badgeText={"comparison"}
          title={"Why Choose Proshoot AI Headshot Generator?"}
        >
          Build your online presence with ProShoot's AI Headshot Generator.
          Eliminate the hassle and costs of booking a professional photographer
          while still getting impeccable results. Our best AI headshot generator
          provides high-quality and tailor-made headshot Photos that are
          suitable for LinkedIn, CVs, as well as personal branding. Take
          headshots the advanced way, today.
        </SectionParaHeading>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Proshoot Column */}
          <div>
            <Card className="relative h-full overflow-hidden bg-primary/5 border-primary/10">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
              <CardContent className="p-6">
                <div className="mb-8">
                  <div className="flex gap-1 items-center mb-2">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                    <h3 className="text-2xl font-bold text-primary">
                      Proshoot.co{" "}
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    Proshoot Professional AI Headshots Generator.
                  </p>
                </div>

                <div className="grid gap-6">
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-lg overflow-hidden bg-gray-100 hover:scale-105 transition-transform"
                      >
                        <Image
                          width={300}
                          height={300}
                          src={`/examples/ai-portrait-${i}.jpg`}
                          alt={`Professional headshot example ${i}`}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-6">
                    {features.better.map((feature) => (
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
                      Known Alternatives
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    Common Issues with Other Solutions.
                  </p>
                </div>

                <div className="grid gap-6">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      "alternatives-1.jpg",
                      "alternatives-2.jpg",
                      "alternatives-3.jpg",
                    ].map((i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-lg overflow-hidden"
                      >
                        <Image
                          width={300}
                          height={300}
                          src={`/${i}`}
                          alt={`Alternative headshot example ${i}`}
                          className="w-full h-full object-cover aspect-square opacity-80 object-top"
                        />
                      </div>
                    ))}
                  </div>

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
