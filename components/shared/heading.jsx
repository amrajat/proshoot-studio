import React from "react";
import { cn } from "@/lib/utils";

const headingSizes = {
  big: "text-4xl md:text-5xl lg:text-6xl",
  small: "text-2xl md:text-3xl lg:text-4xl",
};

const headingWeights = {
  light: "font-light",
  normal: "font-normal",
  semibold: "font-semibold",
  bold: "font-bold",
};

const headingAlignments = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const headingVariants = {
  default: "text-3xl font-semibold",
  hero: "text-4xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]",
  title: "text-4xl font-bold text-primary",
  subtitle: "text-2xl font-medium text-muted-foreground",
  muted: "text-sm text-muted-foreground",
  lead: "text-xl text-muted-foreground",
  small: "text-sm font-medium",
  tiny: "text-xs font-medium",
};

export default function Heading({
  children,
  as = "h2",
  size,
  weight,
  align,
  lineHeight,
  letterSpacing,
  variant,
  className,
  ...props
}) {
  const HeadingTag = as;

  const classes = cn(
    variant && headingVariants[variant],
    size && headingSizes[size],
    weight && headingWeights[weight],
    align && headingAlignments[align],
    lineHeight && `leading-${lineHeight}`,
    letterSpacing && `tracking-${letterSpacing}`,
    className
  );

  return (
    <HeadingTag className={classes} {...props}>
      {children}
    </HeadingTag>
  );
}
