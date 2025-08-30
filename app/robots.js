import { getBaseUrlFromEnv } from "@/lib/env";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/dashboard/",
    },
    sitemap: `${getBaseUrlFromEnv()}/sitemap.xml`,
  };
}
