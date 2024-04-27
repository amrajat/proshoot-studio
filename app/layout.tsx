import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

import PrelineScript from "@/components/PrelineScript";

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
      <body className={inter.className + " antialiased" + " min-h-screen"}>
        {children}
        <Analytics />
      </body>
      <PrelineScript />
    </html>
  );
}
