import { Button } from "@/components/ui/button";
import Logo from "@/components/homepage/Logo";
import Link from "next/link";
import StarRatings from "@/components/shared/star-ratings";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import FooterCTA from "@/components/homepage/FooterCTA";

const footerLinks = [
  // {
  //   section: "Free Tools",
  //   links: [
  //     { title: "Pricing", href: "/pricing" },
  //     { title: "Blog", href: "/blog" },
  //     { title: "Affiliate", href: "/affiliate" },
  //     { title: "Examples", href: "/examples" },
  //   ],
  // },
  // {
  //   section: "Resources",
  //   links: [
  //     { title: "Pricing", href: "/pricing" },
  //     { title: "Blog", href: "/blog" },
  //     { title: "Affiliate", href: "/affiliate" },
  //     { title: "Examples", href: "/examples" },
  //   ],
  // },
  {
    section: "Helpful Links",
    links: [
      { title: "Pricing", href: "/#pricing" },
      { title: "Blog", href: "/blog" },
      { title: "Affiliate", href: "/affiliate" },
      { title: "Examples", href: "/free-ai-headshot-generator-examples" },
    ],
  },
  {
    section: "Legals",
    links: [
      { title: "Terms & Conditions", href: "/legal#terms" },
      { title: "Privacy Policy", href: "/legal#privacy" },
      { title: "Disclaimer", href: "/legal#disclaimer" },
      { title: "Refund Policy", href: "/legal#refund" },
      { title: "Fair Usage Policy", href: "/legal#fair-usage" },
      { title: "Sub Processors", href: "/legal#sub-processors" },
    ],
  },
  {
    section: "Company",
    links: [
      { title: "About Us", href: "/about" },
      { title: "Contact", href: "/contact" },
    ],
  },
  {
    section: "Special Categories",
    links: [
      { title: "NGOs", href: "/free-ai-portrait-generator" },
      { title: "Education", href: "/free-ai-portrait-generator" },
      { title: "Influencer", href: "/free-ai-portrait-generator" },
      { title: "Reviewer SaaS/AI/Other", href: "/free-ai-portrait-generator" },
    ],
  },
];

export default function Footer() {
  return (
    <>
      <FooterCTA />
      <footer className="bg-foreground py-16 px-4 sm:px-6 lg:px-8 text-muted-foreground">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-center mb-12 space-y-6 lg:space-y-0">
            <div className="flex flex-col items-center md:flex-row md:justify-center gap-4">
              <Logo type="white" />
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
              <p className="text-sm text-center">
                Trusted by{" "}
                <span className="font-bold">7,000+ happy customers</span>
              </p>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold lg:max-w-2xl leading-tight tracking-tighter text-center md:text-4xl lg:leading-[1.1] text-primary">
              grow your online presence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {footerLinks.map((section, index) => (
              <div key={index} className="flex flex-col justify-self-start">
                <h4 className="text-lg font-bold mb-4 leading-tight lg:leading-[1.1] h-10 flex items-center text-primary">
                  {section.section}
                </h4>
                <div className="flex flex-col gap-y-2">
                  {section.links.map((link, linkIndex) => (
                    <Button
                      key={linkIndex}
                      variant="link"
                      className="px-0 justify-start text-muted-foreground hover:text-primary"
                      asChild
                    >
                      <Link href={link.href}>{link.title}</Link>
                    </Button>
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
