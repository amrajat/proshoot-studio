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
    ],
  },
};

export default nextConfig;
