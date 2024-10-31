"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import SectionParaHeading from "@/components/shared/section-para-heading";

export default function PhotographyCompared() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const features = {
    better: [
      {
        title: "Highest Resemblance",
        description:
          "Professional-grade headshots indistinguishable from real photos.",
        icon: CheckCircle2,
      },
      {
        title: "Ultra-Realistic",
        description:
          "Generates ultra-realistic headshots without harsh up-scalers.",
        icon: CheckCircle2,
      },
      {
        title: "Very affordable",
        description: "Get high-quality headshots that don't cost a fortune.",
        icon: CheckCircle2,
      },
      {
        title: "Guaranteed results",
        description: "Option to redo, AI edits and Human Edits included.",
        icon: CheckCircle2,
      },
      {
        title: "Ready within 2 Hours",
        description: "Fast delivery in under two hours.",
        icon: CheckCircle2,
      },
      {
        title: "Money Back Guarantee",
        description: "Guaranteed satisfaction or full refund.",
        icon: CheckCircle2,
      },
      {
        title: "Many Variations",
        description:
          "Offers diverse styles, poses, clothes, and grooming options.",
        icon: CheckCircle2,
      },
    ],
    alternatives: [
      {
        title: "Expensive",
        description: "Inconsistent quality with visible artifacts.",
        icon: XCircle,
      },
      {
        title: "Takes longer",
        description:
          "Unreliable face matching leading to inconsistent results.",
        icon: AlertCircle,
      },
      {
        title: "Limited styles",
        description: "Basic security measures putting your data at risk.",
        icon: ShieldAlert,
      },
      {
        title: "Limited poses",
        description: "Complex refund processes with multiple conditions.",
        icon: XCircle,
      },
      {
        title: "Limited clothing options",
        description: "Fewer choices for outfits and accessories.",
        icon: Clock,
      },
      {
        title: "No money-back guarantee",
        description: "Lack of assurance for customer satisfaction.",
        icon: XCircle,
      },
    ],
  };

  return (
    <section
      ref={ref}
      className="bg-gradient-to-b from-secondary to-background py-16 sm:py-24"
    >
      <div className="max-w-7xl mx-auto">
        <SectionParaHeading
          badgeText={"AI vs Traditional Photography"}
          title={"Let's see who wins?"}
        >
          See how our professional AI headshot generator is making big financial
          disruptions in the photography market by producing ultra-realistic
          images at the fraction of the cost.
        </SectionParaHeading>

        <div className="grid md:grid-cols-2 gap-8">
          {/* BetterPic Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
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
                    Professional AI Headshot Generation
                  </p>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-6">
                    {features.better.map((feature, i) => (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                        className="flex gap-4"
                      >
                        <feature.icon className="w-6 h-6 text-primary shrink-0" />
                        <div>
                          <h4 className="font-semibold mb-1">
                            {feature.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Alternatives Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
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
                    {features.alternatives.map((feature, i) => (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                        className="flex gap-4"
                      >
                        <feature.icon className="w-6 h-6 text-destructive shrink-0" />
                        <div>
                          <h4 className="font-semibold mb-1">
                            {feature.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
