import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fpczpgjfyejjuezbiqjq.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
    ],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    // ignoreDuringBuilds: true,
  },
  // async rewrites() {
  //   return [
  //     {
  //       source: "/fp/track",
  //       destination: "https://t.firstpromoter.com/tr",
  //     },
  //     {
  //       source: "/fp/details",
  //       destination: "https://t.firstpromoter.com/get_details",
  //     },
  //     {
  //       source: "/ingest/static/:path*",
  //       destination: "https://us-assets.i.posthog.com/static/:path*",
  //     },
  //     {
  //       source: "/ingest/:path*",
  //       destination: "https://us.i.posthog.com/:path*",
  //     },
  //     {
  //       source: "/ingest/decide",
  //       destination: "https://us.i.posthog.com/decide",
  //     },
  //     // Sentry rewrites
  //     {
  //       source: "/monitoring/api/:path*",
  //       destination: "https://o4507332139089920.ingest.us.sentry.io/:path*",
  //     },
  //   ];
  // },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
  // async headers() {
  //   return [
  //     {
  //       source: "/:path*",
  //       headers: [
  //         // Clickjacking protection
  //         {
  //           key: "X-Frame-Options",
  //           value: "SAMEORIGIN",
  //         },
  //         {
  //           //FIXME: This is temporary, we need to add the CSP back in, also remove the repliate related thing coz we do't need it
  //           key: "Content-Security-Policy",
  //           value: [
  //             // Default fallback - only allow from same origin
  //             "default-src 'self'",
  //             // Scripts - allow specific trusted domains and inline scripts needed for Next.js and Intercom
  //             "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.intercom.io https://*.intercomcdn.com",
  //             // Styles - needed for Next.js, Tailwind and Intercom
  //             "style-src 'self' 'unsafe-inline' https://*.intercom.io https://*.intercomcdn.com",
  //             // Images - allow self, data URLs, blob URLs and your remote patterns
  //             "img-src 'self' data: blob: https://*.supabase.co https://*.replicate.com https://replicate.delivery https://*.intercom.io https://*.intercomcdn.com https://*.google.com",
  //             // Fonts
  //             "font-src 'self' data: https://*.intercomcdn.com",
  //             // Connect (for API calls, websockets)
  //             "connect-src 'self' https://*.posthog.com https://*.sentry.io https://*.supabase.co https://*.intercom.io wss://*.intercom.io",
  //             // Frame ancestors - protect against clickjacking
  //             "frame-ancestors 'self'",
  //             // Form actions
  //             "form-action 'self'",
  //             // Media
  //             "media-src 'self' https://*.intercom.io https://*.intercomcdn.com",
  //             // Object sources (PDFs, plugins)
  //             "object-src 'none'",
  //             // Frame sources for embedded content
  //             "frame-src 'self' https://*.intercom.io https://*.google.com",
  //             // Worker sources for web workers and service workers
  //             "worker-src 'self' blob: https://*.intercom.io",
  //             // Manifest
  //             "manifest-src 'self'",
  //           ].join("; "),
  //         },
  //         // Protection against MIME type confusion attacks
  //         {
  //           key: "X-Content-Type-Options",
  //           value: "nosniff",
  //         },
  //         // XSS protection
  //         {
  //           key: "X-XSS-Protection",
  //           value: "1; mode=block",
  //         },
  //         // Control how much referrer information should be included with requests
  //         {
  //           key: "Referrer-Policy",
  //           value: "strict-origin-when-cross-origin",
  //         },
  //         // Control which browser features can be used
  //         {
  //           key: "Permissions-Policy",
  //           value:
  //             "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  //         },
  //         // HTTP Strict Transport Security
  //         {
  //           key: "Strict-Transport-Security",
  //           value: "max-age=63072000; includeSubDomains; preload",
  //         },
  //       ],
  //     },
  //   ];
  // },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: "prime-ai-company",
  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring/api",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});
