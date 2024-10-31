import { Button } from "@/components/ui/button";
import Logo from "@/components/homepage/Logo";
import Link from "next/link";
import StarRatings from "@/components/shared/star-ratings";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import FooterCTA from "@/components/homepage/FooterCTA";

export default function Footer() {
  return (
    <>
      <FooterCTA />
      <footer className="bg-gradient-to-b from-secondary to-background py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12">
            <div className="flex gap-4 self-center items-center">
              <Logo />
              <StarRatings />
              <div className="flex flex-col items-center justify-center space-y-2 md:flex-row md:space-x-2 md:space-y-0">
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
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 lg:mb-0 lg:max-w-2xl leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]">
              improve your personal brand.today!
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M23 3.01006C22.0424 3.68553 20.9821 4.20217 19.86 4.54006C19.2577 3.84757 18.4573 3.35675 17.567 3.13398C16.6767 2.91122 15.7395 2.96725 14.8821 3.29451C14.0247 3.62177 13.2884 4.20446 12.773 4.96377C12.2575 5.72309 11.9877 6.62239 12 7.54006V8.54006C10.2426 8.58562 8.50127 8.19587 6.93101 7.4055C5.36074 6.61513 4.01032 5.44869 3 4.01006C3 4.01006 -1 13.0101 8 17.0101C5.94053 18.408 3.48716 19.109 1 19.0101C10 24.0101 21 19.0101 21 7.51006C20.9991 7.23151 20.9723 6.95365 20.92 6.68006C21.9406 5.67355 22.6608 4.40277 23 3.01006Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Stay in the pulse</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
                      fill="currentColor"
                    />
                  </svg>
                  <span>Chat with peers and other trades</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.54 6.42C22.4212 5.94541 22.1793 5.51057 21.8387 5.15941C21.4981 4.80824 21.0708 4.55318 20.6 4.42C18.88 4 12 4 12 4C12 4 5.12 4 3.4 4.46C2.92925 4.59318 2.50187 4.84824 2.16134 5.19941C1.82081 5.55057 1.57887 5.98541 1.46 6.46C1.14522 8.20556 0.991243 9.97631 1 11.75C0.988786 13.537 1.14277 15.3213 1.46 17.08C1.59096 17.5398 1.83831 17.9581 2.17817 18.2945C2.51803 18.6308 2.93883 18.8738 3.4 19C5.12 19.46 12 19.46 12 19.46C12 19.46 18.88 19.46 20.6 19C21.0708 18.8668 21.4981 18.6118 21.8387 18.2606C22.1793 17.9094 22.4212 17.4746 22.54 17C22.8524 15.2676 23.0063 13.5103 23 11.75C23.0112 9.96295 22.8572 8.1787 22.54 6.42Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.75 15.02L15.5 11.75L9.75 8.48001V15.02Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Subscribe for tutorials</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold leading-tight tracking-tighter lg:leading-[1.1] mb-4">
                Helpful Links
              </h4>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground"
              >
                Pricing
              </Link>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground"
              >
                Blog
              </Link>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground"
              >
                Affiliate
              </Link>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground mb-6"
              >
                Examples
              </Link>

              <h4 className="text-lg font-bold leading-tight tracking-tighter lg:leading-[1.1] mb-4">
                Free Tools
              </h4>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground"
              >
                Pricing
              </Link>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground"
              >
                Blog
              </Link>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground"
              >
                Affiliate
              </Link>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground mb-6"
              >
                Examples
              </Link>

              <h4 className="text-lg font-bold leading-tight tracking-tighter lg:leading-[1.1] mb-4">
                Resources
              </h4>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground"
              >
                Pricing
              </Link>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground"
              >
                Blog
              </Link>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground"
              >
                Affiliate
              </Link>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground mb-6"
              >
                Examples
              </Link>
            </div>

            <div>
              <h4 className="text-lg font-bold leading-tight tracking-tighter lg:leading-[1.1] mb-4">
                Legals
              </h4>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground"
              >
                Terms & Conditions
              </Link>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground"
              >
                Privacy Policy
              </Link>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground"
              >
                Disclaimer
              </Link>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground"
              >
                Refund Policy
              </Link>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground"
              >
                Fair Usage Policy
              </Link>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground mb-6"
              >
                Sub Processors
              </Link>
              <h4 className="text-lg font-bold leading-tight tracking-tighter lg:leading-[1.1] mb-4">
                Headshot Type
              </h4>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground"
              >
                Pricing
              </Link>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground"
              >
                Blog
              </Link>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground"
              >
                Affiliate
              </Link>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground mb-6"
              >
                Examples
              </Link>
            </div>

            <div>
              <h4 className="text-lg font-bold leading-tight tracking-tighter lg:leading-[1.1] mb-4">
                Company
              </h4>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground"
              >
                Pricing
              </Link>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground"
              >
                Blog
              </Link>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground"
              >
                Affiliate
              </Link>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground mb-6"
              >
                Examples
              </Link>
              <h4 className="text-lg font-bold leading-tight tracking-tighter lg:leading-[1.1] mb-4">
                Special Categories
              </h4>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground"
              >
                NGOs
              </Link>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground"
              >
                Education
              </Link>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground"
              >
                Influencer
              </Link>
              <Link
                href={"/"}
                className="block text-md font-light text-foreground mb-6"
              >
                Reviewer SaaS/AI/Other
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
