"use client";

import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Camera, Shield, Users } from "lucide-react";
import StarRatings from "@/components/shared/star-ratings";

export default function FooterCTA() {
  const [headshots, setHeadshots] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    controls.start("visible");
  }, [controls]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeadshots((prev) => Math.min(prev + 123, 40000));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-secondary to-background">
      <div className="container mx-auto px-4 md:px-6">
        <Card className="w-full overflow-hidden">
          <CardContent className="p-6 sm:p-10">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={controls}
              className="grid gap-8 md:grid-cols-2 items-center"
            >
              <motion.div variants={itemVariants} className="space-y-6">
                <Badge
                  variant="secondary"
                  className="px-3 py-1 text-sm font-medium"
                >
                  AI-Powered Perfection
                </Badge>
                <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]">
                  Get Your AI Headshots Today!
                </h2>
                <p className="text-lg font-light">
                  Join thousands of professionals who've boosted their online
                  presence with our AI headshot generator.
                </p>
                <Button size="lg" className="w-full sm:w-auto">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Create Your Perfect Headshot
                </Button>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="grid gap-4 sm:grid-cols-2"
              >
                <div className="bg-primary/20 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                  <Users className="h-10 w-10 mb-2" aria-hidden="true" />
                  <h3 className="text-2xl font-bold">1,000+</h3>
                  <p className="text-muted-foreground">Happy Customers</p>
                </div>
                <div className="bg-primary/20 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                  <Camera className="h-10 w-10 mb-2" aria-hidden="true" />
                  <h3 className="text-2xl font-bold">
                    {headshots.toLocaleString()}+
                  </h3>
                  <p className="text-muted-foreground">Headshots Generated</p>
                </div>
                <div className="bg-primary/20 rounded-lg p-4 flex flex-col items-center justify-center text-center sm:col-span-2">
                  <div className="flex items-center mb-2">
                    <StarRatings />
                  </div>
                  <p className="text-lg font-semibold">
                    Highly Rated by Our Users
                  </p>
                </div>
              </motion.div>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="mt-8 pt-6 border-t border-primary/30 flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" aria-hidden="true" />
                <span className="text-sm font-medium">
                  100% Privacy Guaranteed
                </span>
              </div>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                See How It Works
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
