import { getBaseUrlFromEnv } from "@/lib/env";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
    sitemap: `${getBaseUrlFromEnv()}/sitemap.xml`,
  };
}
