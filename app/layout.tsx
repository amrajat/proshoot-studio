import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import PrelineScript from "@/components/PrelineScript";
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
    "Create high-quality, professional headshots in seconds using Proshoot.co's cutting-edge AI technology. Save time and money, get the perfect headshot every time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <Script src="//cdn.trackdesk.com/tracking.js" />
      <Script id="trackdesk-email-tracking">
        {`(function(t,d,k){(t[k]=t[k]||[]).push(d);t[d]=t[d]||t[k].f||function(){(t[d].q=t[d].q||[]).push(arguments)}})
      (window,"trackdesk","TrackdeskObject");
      trackdesk('proshoot', 'click');`}
      </Script>
      <body className={inter.className + " antialiased" + " min-h-screen"}>
        {children}
        {/* <Analytics /> */}
        {/* <SpeedInsights /> */}
      </body>
      <PrelineScript />
    </html>
  );
}
