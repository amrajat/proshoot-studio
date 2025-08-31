import { getBaseUrlFromEnv } from "@/lib/env";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
    // No sitemap for protected app - marketing site handles SEO
    sitemap: null,
  };
}
