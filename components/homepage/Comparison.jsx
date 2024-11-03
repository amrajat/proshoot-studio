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
import Image from "next/image";

export default function Comparison() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const features = {
    better: [
      {
        title: "Studio 4K quality, hyper-realistic",
        description:
          "Professional-grade photos indistinguishable from traditional photography",
        icon: CheckCircle2,
      },
      {
        title: "Integrated face-matching protocol",
        description:
          "Advanced AI ensures consistent identity across all generated photos",
        icon: CheckCircle2,
      },
      {
        title: "Strict data protection policies",
        description:
          "Enterprise-level security protecting your personal information",
        icon: CheckCircle2,
      },
      {
        title: "Guaranteed results",
        description: "Option to redo, AI edits and Human Edits included",
        icon: CheckCircle2,
      },
      {
        title: "Quick, perceptive customer service",
        description: "24/7 support with real human assistance",
        icon: CheckCircle2,
      },
    ],
    alternatives: [
      {
        title: "Low-quality, obviously AI generated",
        description: "Inconsistent quality with visible artifacts",
        icon: XCircle,
      },
      {
        title: "Randomly generated faces",
        description: "Unreliable face matching leading to inconsistent results",
        icon: AlertCircle,
      },
      {
        title: "Low-level data safety",
        description: "Basic security measures putting your data at risk",
        icon: ShieldAlert,
      },
      {
        title: "Issues with 'guaranteed' money-back",
        description: "Complex refund processes with multiple conditions",
        icon: XCircle,
      },
      {
        title: "Long waiting periods, lack of real help",
        description: "Automated responses and delayed support",
        icon: Clock,
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
          badgeText={"comparison"}
          title={"Why Choose Our AI Headshots?"}
        >
          See how our professional AI headshot generator stands out from the
          competition.
        </SectionParaHeading>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Proshoot Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="relative h-full overflow-hidden bg-primary/5 border-primary/10">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
              <CardContent className="p-6">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-primary mb-2">
                    Proshoot.co
                  </h3>
                  <p className="text-muted-foreground">
                    Professional AI Headshot Generation
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
                  <h3 className="text-2xl font-bold text-muted-foreground mb-2">
                    Known Alternatives
                  </h3>
                  <p className="text-muted-foreground">
                    Common Issues with Other Solutions
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
