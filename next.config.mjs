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
        hostname: "sdbooth2-production.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "api.astria.ai",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
