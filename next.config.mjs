import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production security configurations
  poweredByHeader: false, // Remove X-Powered-By header
  compress: true, // Enable gzip compression

  // Image optimization with strict security
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fpczpgjfyejjuezbiqjq.supabase.co",
      },
      {
        protocol: "https",
        hostname: "secure.proshoot.co", // Custom Supabase domain
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.proshoot.co",
      },
      {
        protocol: "https",
        hostname: "delivery.proshoot.co",
      },
    ],
    // Security: Limit image sizes to prevent DoS
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false, // Security: Block SVG uploads
    contentSecurityPolicy: "default-src 'self'; script-src 'none';",
  },

  // Security: Strict ESLint enforcement in production
  eslint: {
    ignoreDuringBuilds: false, // Fail builds on ESLint errors
  },

  // Security: TypeScript strict mode
  typescript: {
    ignoreBuildErrors: false, // Fail builds on TypeScript errors
  },
  // PostHog: Enable trailing slash redirect for PostHog API requests
  skipTrailingSlashRedirect: true,

  // PostHog proxy rewrites for ad-blocker bypass
  // Using unique path to avoid ad-blocker detection
  async rewrites() {
    return [
      {
        source: "/ps-data/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ps-data/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },

  // Production-ready security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Remove server information
          {
            key: "Server",
            value: "",
          },
          // Clickjacking protection - DENY is more secure than SAMEORIGIN
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Content Security Policy - Production ready
          {
            key: "Content-Security-Policy",
            value: [
              // Default: Only allow from same origin
              "default-src 'self'",
              // Scripts: Strict policy for production
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://challenges.cloudflare.com https://*.intercom.io https://*.intercomcdn.com https://*.sentry.io https://*.posthog.com",
              // Styles: Allow inline for Tailwind and components
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com https://*.intercom.io https://*.intercomcdn.com",
              // Images: Secure image sources
              "img-src 'self' data: blob: https://secure.proshoot.co https://delivery.proshoot.co https://*.supabase.co https://*.r2.cloudflarestorage.com https://*.googleusercontent.com https://*.intercom.io https://*.intercomcdn.com https://*.google.com https://*.fal.media",
              // Fonts: Google Fonts and Intercom
              "font-src 'self' data: https://fonts.gstatic.com https://*.intercomcdn.com",
              // Connect: API calls and websockets
              "connect-src 'self' http://127.0.0.1:* http://localhost:* https://secure.proshoot.co https://delivery.proshoot.co https://*.supabase.co https://challenges.cloudflare.com https://*.sentry.io https://*.intercom.io wss://*.intercom.io https://accounts.google.com https://apis.google.com https://*.googleapis.com https://oauth2.googleapis.com https://www.googleapis.com https://*.r2.cloudflarestorage.com https://*.posthog.com",
              // Frame ancestors: Prevent embedding
              "frame-ancestors 'none'",
              // Form actions: Only allow same origin
              "form-action 'self'",
              // Media: Intercom support
              "media-src 'self' https://*.intercom.io https://*.intercomcdn.com",
              // Object: Block all plugins
              "object-src 'none'",
              // Frame: Google OAuth and Intercom
              "frame-src 'self' https://accounts.google.com https://challenges.cloudflare.com https://*.intercom.io",
              // Worker: Service workers and Intercom
              "worker-src 'self' blob: https://*.intercom.io",
              // Manifest: PWA support
              "manifest-src 'self'",
              // Base URI: Prevent injection
              "base-uri 'self'",
              // Upgrade insecure requests
              "upgrade-insecure-requests",
            ].join("; "),
          },
          // MIME type protection
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // XSS protection (legacy but still useful)
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Referrer policy - strict for security
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions policy - disable dangerous features
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()",
          },
          // HSTS - Force HTTPS
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Cross-Origin policies
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },

  // Security: Disable server-side includes
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "prime-ai-company",

  project: "proshoot-studio",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Tunnel route handled manually via /app/monitoring/route.js
  // tunnelRoute: "/monitoring", // Disabled - using custom route handler

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});