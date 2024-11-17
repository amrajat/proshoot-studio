import type { Metadata } from "next";

import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "@/components/ui/toaster";

import CookieBanner from "@/components/CookieBanner";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL(`${process.env.URL}`),
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth min-h-screen">
      <body className={GeistSans.className + " antialiased" + " min-h-screen"}>
        {children}
        <Toaster />
        <CookieBanner />
        <Analytics />
        <SpeedInsights />
      </body>
      <Script id="ls-affiliate">{`window.lemonSqueezyAffiliateConfig = { store: "proshoot" }`}</Script>
      <Script id="google-analytics">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-8XCVHBFX54');`}</Script>
      <Script src="https://lmsqueezy.com/affiliate.js" defer></Script>
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-8XCVHBFX54"
      ></Script>
    </html>
  );
}
