import { Button } from "@/components/ui/button";
import Logo from "@/components/homepage/Logo";
import Link from "next/link";
import StarRatings from "@/components/shared/star-ratings";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import FooterCTA from "@/components/homepage/FooterCTA";

const footerLinks = [
  {
    section: "Free Tools",
    links: ["Pricing", "Blog", "Affiliate", "Examples"],
  },
  {
    section: "Resources",
    links: ["Pricing", "Blog", "Affiliate", "Examples"],
  },
  {
    section: "Helpful Links",
    links: ["Pricing", "Blog", "Affiliate", "Examples"],
  },
  {
    section: "Legals",
    links: [
      "Terms & Conditions",
      "Privacy Policy",
      "Disclaimer",
      "Refund Policy",
      "Fair Usage Policy",
      "Sub Processors",
    ],
  },
  {
    section: "Company",
    links: ["Pricing", "Blog", "Affiliate", "Examples"],
  },
  {
    section: "Special Categories",
    links: ["NGOs", "Education", "Influencer", "Reviewer SaaS/AI/Other"],
  },
];

export default function Footer() {
  return (
    <>
      <FooterCTA />
      <footer className="bg-gradient-to-b from-secondary to-background py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-center mb-12 space-y-6 lg:space-y-0">
            <div className="flex flex-col items-center md:flex-row md:justify-center gap-4">
              <Logo />
              <StarRatings />
              <div className="flex -space-x-2">
                {[1, 2, 3].map((avatar, i) => (
                  <Avatar
                    key={i}
                    className="w-8 h-8 border-2 border-background"
                  >
                    <AvatarImage
                      src={`/avatar-${avatar}.jpg`}
                      alt={`User avatar ${i + 1}`}
                    />
                    <AvatarFallback>U{i + 1}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Trusted by{" "}
                <span className="font-bold">7,000+ happy customers</span>
              </p>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold lg:max-w-2xl leading-tight tracking-tighter text-center md:text-4xl lg:leading-[1.1]">
              Improve your personal brand. Today!
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {footerLinks.map((section, index) => (
              <div key={index} className="flex flex-col justify-self-start">
                <h4 className="text-lg font-bold mb-4 leading-tight lg:leading-[1.1] h-10 flex items-center">
                  {section.section}
                </h4>
                <div className="flex flex-col gap-y-2">
                  {section.links.map((link, linkIndex) => (
                    <Button
                      key={linkIndex}
                      variant={"link"}
                      className="px-0 justify-start"
                      asChild
                    >
                      <Link href="/login">{link}</Link>
                    </Button>

                    // <Link

                    //   href={"/"}
                    //   className="text-md font-light text-foreground"
                    // >
                    //   {link}
                    // </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
