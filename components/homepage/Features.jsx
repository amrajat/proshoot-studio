import { cn } from "@/lib/utils";
import {
  Sparkles,
  Camera,
  CheckCircle,
  Image as ImageIcon,
  Globe,
  Clock,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { useMemo } from "react";

export default function Features() {
  const features = useMemo(
    () => [
      {
        title: "Highest Resemblance",
        description:
          "Our advanced AI algorithms ensure that your AI-generated headshots are a true reflection of you, preserving your distinctive features and personality.",
        icon: <Sparkles className="text-primary" aria-hidden="true" />,
      },
      {
        title: "Sharp Realistic",
        description:
          "Experience the sharpest, most realistic headshots. Our technology delivers high-resolution headshot photos with exceptional detail.",
        icon: <Camera className="text-primary" aria-hidden="true" />,
      },
      {
        title: "No Deformation",
        description:
          "Say goodbye to unnatural deformations. Our best AI Headshot generator meticulously preserves your facial features, ensuring a natural and authentic look.",
        icon: <CheckCircle className="text-primary" aria-hidden="true" />,
      },
      {
        title: "High Resolution",
        description:
          "Whether you need headshots for LinkedIn, a resume, or a personal branding website, our high-resolution AI business Photo will impress.",
        icon: <ImageIcon className="text-primary" aria-hidden="true" />,
      },
      {
        title: "Maintains Ethnicity",
        description:
          "Our AI respects and preserves your cultural identity, ensuring your business headshots accurately represent you.",
        icon: <Globe className="text-primary" aria-hidden="true" />,
      },
      {
        title: "Fast & Affordable",
        description:
          "Get your AI professional headshots in as little as 2 hours. No more waiting weeks for a traditional photoshoot, at a fraction of the cost.",
        icon: <Clock className="text-primary" aria-hidden="true" />,
      },
      {
        title: "Money Back Guarantee",
        description:
          "We take pride in the reliability of AI-generated headshots. This is the reason why we offer a full money-back guarantee.",
        icon: <ShieldCheck className="text-primary" aria-hidden="true" />,
      },
      {
        title: "Many Variations",
        description:
          "Explore a vast array of styles, backgrounds, and lighting options to create business headshots that perfectly align with your brand.",
        icon: <Layers className="text-primary" aria-hidden="true" />,
      },
    ],
    []
  );

  return (
    <section className="bg-gradient-to-b from-secondary to-background py-8 sm:py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tighter lg:leading-[1.1] text-center mb-4">
          Effortless, Instant Professional Headshots
        </h2>
        <p className="text-base sm:text-lg font-light text-foreground mb-8 text-center max-w-4xl mx-auto">
          Our AI Professional Business Headshots Generator is a testament to
          this ongoing innovation. By harnessing the power of AI, we deliver
          high-quality, AI professional headshots tailored to your unique needs.
          As AI improves, so does our ability to create even more realistic and
          stunning business headshots.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 relative z-10 py-10 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Feature key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

const Feature = ({ title, description, icon, index }) => {
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
