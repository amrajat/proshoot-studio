import Header from "@/components/layout/Header";
import Footer from "@/components/homepage/Footer";
import Link from "next/link";
import SectionParaHeading from "@/components/shared/section-para-heading";
import { buttonVariants, Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  TrendingUp,
  Megaphone,
  MapPin,
  CreditCard,
} from "lucide-react";
import { useMemo } from "react";

export const metadata = {
  title: "Affiliate",
  description:
    "Earn money promoting AI headshots! Join Proshoot.co's affiliate program & share the future of professional portraits.",
};

function Affiliate() {
  const benefits = useMemo(
    () => [
      {
        title: "High-Demand Product",
        description:
          "We provide cutting-edge AI headshot generation, a highly sought-after service.",
        icon: <TrendingUp className="text-primary" aria-hidden="true" />,
      },
      {
        title: "Easy to Promote",
        description:
          "Share your unique affiliate link with your audience and watch your commissions grow.",
        icon: <Megaphone className="text-primary" aria-hidden="true" />,
      },
      {
        title: "Real-time Tracking",
        description:
          "Monitor your performance and earnings through our user-friendly dashboard.",
        icon: <MapPin className="text-primary" aria-hidden="true" />,
      },
      {
        title: "Fast Payouts",
        description:
          "We make sure you get paid quickly and easily through your preferred method.",
        icon: <CreditCard className="text-primary" aria-hidden="true" />,
      },
    ],
    []
  );
  return (
    <>
      <Header />
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Gradients */}
        <div
          aria-hidden="true"
          className="flex absolute -top-96 start-1/2 transform -translate-x-1/2"
        >
          <div className="bg-gradient-to-r from-violet-300/50 to-purple-100 blur-3xl w-[25rem] h-[44rem] rotate-[-60deg] transform -translate-x-[10rem]  " />
          <div className="bg-gradient-to-tl from-blue-50 via-blue-100 to-blue-50 blur-3xl w-[90rem] h-[50rem] roundeds origin-top-left -rotate-12 -translate-x-[15rem]   " />
        </div>
        {/* End Gradients */}
        <div className="relative">
          <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
            <SectionParaHeading
              badgeText={"Affiliates"}
              title={"earn up to $17.70 on each sale!"}
            >
              Join the Proshoot.co Affiliate Program and earn a generous 30%
              commission on every successful sale you refer.
            </SectionParaHeading>
            <div className="max-w-4xl text-center mx-auto">
              <Link
                href="https://proshoot.firstpromoter.com"
                className={buttonVariants({
                  variant: "destructive",
                  size: "lg",
                })}
              >
                Join the Program
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              {/* <Button variant={"destructive"} size={"lg"}>
                Coming Soon!
              </Button> */}
            </div>
          </div>
        </div>
        {/* Icon Blocks */}
        <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 relative z-10 py-10 max-w-7xl mx-auto">
            {benefits.map((benefit, index) => (
              <Benefit key={benefit.title} {...benefit} index={index} />
            ))}
          </div>
        </div>
        {/* End Icon Blocks */}
      </div>
      {/* End Hero */}

      <Footer />
    </>
  );
}

export default Affiliate;

const Benefit = ({ title, description, icon, index }) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r lg:border-border py-6 sm:py-8 lg:py-10 relative group/feature",
        (index === 0 || index === 4) && "lg:border-l",
        index < 4 && "lg:border-b"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-background to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-background to-transparent pointer-events-none" />
      )}
      <div
        className="mb-4 relative z-10 px-6 sm:px-8 lg:px-10"
        aria-hidden="true"
      >
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2 relative z-10 px-6 sm:px-8 lg:px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-background group-hover/feature:bg-primary transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block">
          {title}
        </span>
      </h3>
      <p className="text-sm max-w-xs relative z-10 px-6 sm:px-8 lg:px-10">
        {description}
      </p>
    </div>
  );
};
