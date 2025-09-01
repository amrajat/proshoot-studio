import { Metadata } from "next";

/**
 * Route-specific metadata configuration
 */
const routeMetadata: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Dashboard",
    description: "Professional AI headshot generation dashboard",
  },
  "/auth": {
    title: "Login",
    description: "login to create your professional ai headshots.",
  },
  "/studio": {
    title: "Studio",
    description: "Manage your AI headshot studios and view generation progress",
  },
  "/studio/create": {
    title: "Create Studio",
    description:
      "Create a new AI headshot studio with custom settings and preferences",
  },
  "/billing": {
    title: "Billing",
    description:
      "Manage your billing information, subscription, and payment methods",
  },
  "/buy": {
    title: "Buy Credits",
    description:
      "Purchase credits for AI headshot generation and studio creation",
  },
  "/backgrounds": {
    title: "Background Preferences",
    description:
      "Manage background options and restrictions for your organization",
  },
  "/clothing": {
    title: "Clothing Preferences",
    description:
      "Manage clothing options and restrictions for your organization",
  },
};

/**
 * Dynamic route patterns for metadata matching
 */
const dynamicRoutePatterns = [
  {
    pattern: /^\/studio\/[^/]+$/,
    metadata: {
      title: "Headshots",
      description:
        "View and manage your AI headshot studio details and generated images",
    },
  },
];

/**
 * Generate metadata for a given pathname
 */
export function generateMetadata(pathname: string): Metadata {
  // First check exact route matches
  let route = routeMetadata[pathname];

  // If no exact match, check dynamic route patterns
  if (!route) {
    const matchedPattern = dynamicRoutePatterns.find((pattern) =>
      pattern.pattern.test(pathname)
    );
    route = matchedPattern?.metadata || routeMetadata["/"];
  }

  return {
    title: route.title,
    description: route.description,
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
      nocache: true,
    },
  };
}
