import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Image as ImageIcon, ShieldCheck } from "lucide-react";
import Heading from "@/components/shared/heading";

function BottomCTA() {
  const stats = [
    {
      icon: ShieldCheck,
      title: "Privacy First",
      description: "to Protect your data",
    },
    { title: "7000+", description: "Happy Customers" },
    { icon: ImageIcon, title: "400K+", description: "Headshots Generated" },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-primary/10 py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-5xl mx-auto overflow-hidden">
          <CardContent className="p-6 sm:p-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  {stat.icon ? (
                    <stat.icon className="mx-auto h-10 w-10 text-primary" />
                  ) : (
                    <div className="flex justify-center items-center -space-x-4">
                      {[1, 2, 3].map((i) => (
                        <Image
                          key={i}
                          width={48}
                          height={48}
                          className="relative inline-block h-12 w-12 rounded-full border-2 border-white object-cover"
                          src={`/avatar-${i}.jpg`}
                          alt={`Avatar ${i}`}
                        />
                      ))}
                    </div>
                  )}
                  <h3 className="mt-4 text-2xl font-bold">{stat.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-16 text-center">
          <Heading as="h2" variant="hero">
            get your <span className="text-primary">AI Headshots</span>
          </Heading>
          <p className="mt-4 text-lg text-muted-foreground">
            Elevate your professional image with our cutting-edge AI technology.
          </p>
          <Badge variant="outline" className="mt-6">
            <ShieldCheck className="size-4 mr-2 text-success" />
            100% Money Back Guarantee
          </Badge>
          <div className="mt-8">
            <Button asChild className="h-12 px-10">
              <Link
                href="/dashboard/studio"
                className="inline-flex items-center"
              >
                Create AI Headshots
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BottomCTA;
