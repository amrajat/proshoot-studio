import type { Metadata } from "next";

import "./globals.css";
import { GeistSans } from "geist/font/sans";

// import FirstPromoterScript from "@/components/services/first-promoter";
// import { PostHogProvider } from "@/components/services/posthog";
import { SidebarProvider } from "@/context/SidebarContext";
import GoogleOneTapComponent from "@/app/auth/components/google-one-tap";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.URL || "http://localhost:3000"),
  title: {
    default: "Proshoot.co: Generate Professional Headshots with AI.",
    template: "%s - Proshoot.co AI Portraits",
  },
  alternates: { canonical: "./" },
  description:
    "Create high-quality, professional AI headshots in seconds using Proshoot.co's cutting-edge AI technology. Save time and money, get the perfect AI headshot.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth min-h-screen">
      {/* <PostHogProvider> */}
      {/* <FirstPromoterScript /> */}
      <body className={GeistSans.className + " antialiased" + " min-h-screen"}>
        <GoogleOneTapComponent />
        <SidebarProvider>{children}</SidebarProvider>
        <Toaster
          closeButton
          position="bottom-right"
          richColors
          toastOptions={{
            style: {
              boxShadow: "none",
            },
            classNames: {
              toast: "bg-background text-foreground border border-border",
              success: "!bg-success !text-success-foreground !border-success",
              error:
                "!bg-destructive !text-destructive-foreground !border-destructive",
              warning: "!bg-accent !text-accent-foreground !border-accent",
              info: "!bg-primary !text-primary-foreground !border-primary",
              closeButton:
                "!bg-destructive !text-destructive-foreground !border-destructive",
            },
          }}
        />
      </body>
      {/* </PostHogProvider> */}
    </html>
  );
}
