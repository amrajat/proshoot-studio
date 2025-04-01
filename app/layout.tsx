import type { Metadata } from "next";

import "./globals.css";
import { GeistSans } from "geist/font/sans";

import CookieBanner from "@/components/CookieBanner";
import IntercomMessenger from "@/components/IntercomMessenger";
import FirstPromoterScript from "@/components/FirstPromoterScript";
import { CSPostHogProvider } from "./providers";

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
      <CSPostHogProvider>
        <FirstPromoterScript />
        <body
          className={GeistSans.className + " antialiased" + " min-h-screen"}
        >
          {children}
          <CookieBanner />
        </body>
      </CSPostHogProvider>
      <IntercomMessenger />
    </html>
  );
}
