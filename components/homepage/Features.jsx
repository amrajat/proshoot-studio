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
        description: "Generate headshot images with close likeness to you.",
        icon: <Sparkles className="text-primary" aria-hidden="true" />,
      },
      {
        title: "Sharp Realistic",
        description:
          "Generates ultra-realistic headshots without using harsh up-scalers that result in a plastic-like appearance.",
        icon: <Camera className="text-primary" aria-hidden="true" />,
      },
      {
        title: "No Deformation",
        description: "Ensures no distortions in your features.",
        icon: <CheckCircle className="text-primary" aria-hidden="true" />,
      },
      {
        title: "High Resolution",
        description:
          "Generates crisp, high-quality images. Read our faqs for better understanding headshot quality.",
        icon: <ImageIcon className="text-primary" aria-hidden="true" />,
      },
      {
        title: "Maintains Ethnicity",
        description:
          "Preserves your unique ethnic features. Read about our reddit contest to improve our ethnicity maintain feature.",
        icon: <Globe className="text-primary" aria-hidden="true" />,
      },
      {
        title: "Ready within 2 Hours",
        description:
          "Fast delivery in under two hours. Read more in faqs for better understanding.",
        icon: <Clock className="text-primary" aria-hidden="true" />,
      },
      {
        title: "Money Back Guarantee",
        description:
          "Guaranteed satisfaction or full refund. Please refer to our refund policy for better transparency.",
        icon: <ShieldCheck className="text-primary" aria-hidden="true" />,
      },
      {
        title: "Many Variations",
        description:
          "Offers diverse styles, poses, clothes, grooming hair styles and more options.",
        icon: <Layers className="text-primary" aria-hidden="true" />,
      },
    ],
    []
  );

  return (
    <section className="bg-gradient-to-b from-secondary to-background py-8 sm:py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tighter lg:leading-[1.1] text-center mb-4">
          AI is Improving Every Day, and so are We.
        </h2>
        <p className="text-base sm:text-lg font-light text-foreground mb-8 text-center max-w-4xl mx-auto">
          Although AI is still in a developing phase, which it will always be
          due to its learning nature, we continuously upgrade our image
          generation models. This allows us to provide realistic professional
          headshots with the highest level of resemblance available today.
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
