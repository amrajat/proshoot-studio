"use client";
import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Menu,
  Image as ImageIcon,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import StarRatings from "@/components/shared/star-ratings";
import Logo from "@/components/homepage/Logo";

const headshots = [
  {
    title: "LinkedIn Headshots",
    href: "#",
    description: "Boost your Linkedin Profile with Linkedin Headshots",
  },
  {
    title: "Model Headshots",
    href: "#",
    description: "Become Eye-Cating Model with Model Headshots.",
  },
  {
    title: "Realtor Headshots",
    href: "#",
    description: "Best Realtor Headshots for home buyer and seller.",
  },
  {
    title: "Executive Headshots",
    href: "#",
    description: "Make Executive Headshots for Leaders.",
  },
  {
    title: "Medical Headshots",
    href: "#",
    description: "Get Your Quick Medical Headshots Now.",
  },
  {
    title: "Corporate Headshots",
    href: "#",
    description: "Create High - Quality Corporate Headshots.",
  },
  {
    title: "Actor Headshots",
    href: "#",
    description: "Become Inspiring with Actor Headshots.",
  },
  {
    title: "Eras Headshots",
    href: "#",
    description: "Your Go to Professional ERAS Headshot.",
  },
];

export default function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <>
      <div className="pt-2 hidden lg:block pb-2.5 border-b border-border bg-background">
        <div className="container sm:px-3 lg:px-4 mx-auto">
          <div className="grid justify-center md:grid-cols-3 md:justify-between md:items-center gap-2">
            <div className="flex items-center gap-1 text-center md:text-start md:order-2 md:flex md:justify-start md:items-center">
              <StarRatings size="size-2" />
              <p className="me-5 inline-block text-xs font-medium">
                Trusted by 7000+ Awesome Folks.
              </p>
            </div>
            <div className="flex items-center gap-1 text-center md:text-start md:order-2 md:flex md:justify-center md:items-center">
              <CheckCircle2 className="size-4 text-success" />
              <p className="me-5 inline-block text-xs font-medium">
                Money Back Guarantee.
              </p>
            </div>
            <div className="flex items-center gap-1 text-center md:text-start md:order-2 md:flex md:justify-end md:items-center">
              <ImageIcon className="size-4 text-success" />
              <p className="me-5 inline-block text-xs font-medium">
                Generated 400000+ Professional Headshots.
              </p>
            </div>
          </div>
        </div>
      </div>
      <nav className="border-b border-muted">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold">
                <Logo />
              </Link>
            </div>
            <div className="hidden lg:block">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Link href="/" legacyBehavior passHref>
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
                        Home
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  {/* <NavigationMenuItem>
                    <Link href="/company-headshots" legacyBehavior passHref>
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
                        Company Headshots
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem> */}
                  <NavigationMenuItem>
                    <Link href="/#pricing" legacyBehavior passHref>
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
                        Pricing
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link
                      // href="/ai-generated-headshots-reviews"
                      href="free-ai-headshot-generator-examples"
                      legacyBehavior
                      passHref
                    >
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
                        Reviews & Examples
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/contact" legacyBehavior passHref>
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
                        Contact
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/#faqs" legacyBehavior passHref>
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
                        FAQs
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  {/* <NavigationMenuItem>
                    <NavigationMenuTrigger>Headshot Type</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {headshots.map((component) => (
                          <ListItem
                            key={component.title}
                            title={component.title}
                            href={
                              "/headshot-type/" +
                              component.title.replaceAll(" ", "-").toLowerCase()
                            }
                          >
                            {component.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem> */}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
            <div className="hidden lg:block">
              <Link
                href="/auth"
                className={buttonVariants({
                  variant: "destructive",
                  size: "lg",
                })}
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <MobileNavItem href="/" title="Home" />
              {/* <MobileNavItem
                href="/company-headshots"
                title="Company Headshots"
              /> */}
              <MobileNavItem href="/#pricing" title="Pricing" />
              <MobileNavItem
                // href="/ai-generated-headshots-reviews"
                href="free-ai-headshot-generator-examples"
                title="Reviews & Examples"
              />
              <MobileNavItem href="/contact" title="Contact" />
              <MobileNavItem href="/#faqs" title="FAQs" />

              {/* <MobileNavItem href="#" title="Headshot Type">
                {headshots.map((component) => (
                  <MobileNavSubItem
                    key={component.title}
                    href={
                      "/headshot-type/" +
                      component.title.replaceAll(" ", "-").toLowerCase()
                    }
                    title={component.title}
                  />
                ))}
              </MobileNavItem> */}
            </div>
            <div className="pt-4 pb-3 border-t border-accent">
              <div className="px-2">
                <Button variant="destructive" className="w-full">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

const ListItem = React.forwardRef(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </a>
        </NavigationMenuLink>
      </li>
    );
  }
);
ListItem.displayName = "ListItem";

const MobileNavItem = ({ href, title, children }) => (
  <div>
    <Link
      href={href}
      className="block px-3 py-2 rounded-md text-base font-medium hover:text-primary/75"
    >
      {title}
    </Link>
    {children && <div className="ml-4 mt-2 space-y-2">{children}</div>}
  </div>
);

const MobileNavSubItem = ({ href, title }) => (
  <Link
    href={href}
    className="block px-3 py-2 rounded-md text-sm hover:text-primary/75"
  >
    {title}
  </Link>
);
