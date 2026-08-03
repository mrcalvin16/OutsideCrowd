import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The legacy lint backlog is tracked separately during launch hardening.
  // TypeScript errors remain blocking in both Next builds and CI.
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.convex.cloud",
      },
    ],
  },
};

export default nextConfig;
