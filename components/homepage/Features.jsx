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
import SectionParaHeading from "../shared/section-para-heading";

export default function Features() {
  const features = useMemo(
    () => [
      {
        title: "Highest Resemblance",
        description:
          "Our AI fine-tuning techniques preserve your true identity without relying on harsh upscaling that creates artifacts or a waxy, plastic-like appearance.",
        icon: <Sparkles className="text-primary" aria-hidden="true" />,
      },
      {
        title: "Sharp Realistic",
        description:
          "Our advanced AI pipeline ensures no deformations or artifacts, delivering sharp, detailed, professional-grade headshots.",
        icon: <Camera className="text-primary" aria-hidden="true" />,
      },
      {
        title: "No Deformation",
        description:
          "Our AI meticulously preserves your facial features, ensuring a natural and authentic appearance.",
        icon: <CheckCircle className="text-primary" aria-hidden="true" />,
      },
      {
        title: "High Resolution",
        description:
          "Whether you need headshots for LinkedIn, a resume, or personal branding, our high-resolution images will look great everywhere.",
        icon: <ImageIcon className="text-primary" aria-hidden="true" />,
      },
      {
        title: "Maintains Ethnicity",
        description:
          "Our AI respects and preserves your cultural identity, ensuring your ai headshots accurately represent you.",
        icon: <Globe className="text-primary" aria-hidden="true" />,
      },
      {
        title: "Fast & Affordable",
        description:
          "Get your professional headshots in as little as 2 hours, no more waiting weeks for a traditional photoshoot, and at a fraction of the cost.",
        icon: <Clock className="text-primary" aria-hidden="true" />,
      },
      {
        title: "Many Variations",
        description:
          "Explore a wide variety of styles, outfits, backgrounds, and lighting options to create professional headshots that perfectly match your needs/brand.",
        icon: <Layers className="text-primary" aria-hidden="true" />,
      },
      {
        title: "Money Back Guarantee",
        description:
          "We're confident you'll love your AI-generated headshots. If not, we'll refund you the full amount.",
        icon: <ShieldCheck className="text-primary" aria-hidden="true" />,
      },
    ],
    []
  );

  return (
    <section className="bg-gradient-to-b from-secondary to-background py-8 sm:py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionParaHeading
          badgeText={"One time fee"}
          title={"Effortless, Instant Professional Headshots"}
        >
          Every person is unique, and so are their headshots. That's why we
          avoid harsh upscaling, which can make your face look obviously
          "AI-generated". The more an image is upscaled, the more it loses your
          distinct features. Our focus is on preserving your authentic look and
          true identity, delivering headshots that resemble your face exactly,
          without any deformations or artifacts.
        </SectionParaHeading>

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
