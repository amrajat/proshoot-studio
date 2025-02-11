import type { Metadata } from "next";

import "./globals.css";
import { GeistSans } from "geist/font/sans";

import CookieBanner from "@/components/CookieBanner";
import Script from "next/script";
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
        <Script id="firstpromoter-inline" strategy="afterInteractive">
          {`
          (function(w){
            w.fpr=w.fpr||function(){
              w.fpr.q = w.fpr.q||[];
              w.fpr.q[arguments[0]=='set'?'unshift':'push'](arguments);
            };
          })(window);
          fpr("init", {cid:"vx2r56ks"}); 
          fpr("click");
        `}
        </Script>

        {/* First Promoter External Script */}
        <Script
          src="https://cdn.firstpromoter.com/fpr.js"
          strategy="afterInteractive"
          async
        />
        <body
          className={GeistSans.className + " antialiased" + " min-h-screen"}
        >
          {children}
          <CookieBanner />
        </body>
      </CSPostHogProvider>
    </html>
  );
}
