"use client";
import Image from "next/image";
import SectionParaHeading from "@/components/shared/section-para-heading";

const companyLogos = [
  { name: "Byte Dance", src: "/companies/bytedance.svg" },
  {
    name: "Dell Technologies",
    src: "/companies/dell.svg",
  },
  {
    name: "JP Morgan Chase",
    src: "/companies/jpmorgan.svg",
  },
  { name: "Meta", src: "/companies/meta.svg" },
  {
    name: "Mozilla Firefox",
    src: "/companies/mozilla.svg",
  },
  { name: "Open AI", src: "/companies/openai.svg" },
  { name: "Vercel", src: "/companies/vercel.svg" },
  { name: "Retool", src: "/companies/retool.svg" },
];

export default function TrustedByCompanies() {
  return (
    <section className="relative bg-gradient-to-b from-secondary to-background py-16 sm:py-24">
      <div className="container mx-auto py-8 px-4">
        <SectionParaHeading
          badgeText={"Trusted"}
          title={"Trusted by Employees of Top Companies Worldwide"}
        >
          Our AI headshot generator has been trusted by professionals globally.
          Join thousands who have enhanced their online image with high-quality,
          AI-generated headshots.
        </SectionParaHeading>
        <div className="flex flex-wrap justify-center items-center gap-8 mb-16">
          {companyLogos.map((logo, index) => (
            <Image
              key={index}
              src={logo.src}
              alt={`As seen on ${logo.name}`}
              width={120}
              height={30}
              className="opacity-50 hover:opacity-100 transition-opacity duration-300"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
