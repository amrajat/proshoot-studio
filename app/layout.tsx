import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import PrelineScript from "@/components/PrelineScript";
import CookieBanner from "@/components/CookieBanner";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], display: "swap" });

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
      <body className={inter.className + " antialiased" + " min-h-screen"}>
        {children}
        <CookieBanner />
        <Analytics />
        <SpeedInsights />
      </body>
      <PrelineScript />
      <Script id="ls-affiliate">{`window.lemonSqueezyAffiliateConfig = { store: "proshoot" }`}</Script>
      <Script id="ls-affiliate">{`window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-8XCVHBFX54');`}</Script>
      <Script src="https://lmsqueezy.com/affiliate.js" defer></Script>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-8XCVHBFX54"
        defer
      ></Script>
    </html>
  );
}
