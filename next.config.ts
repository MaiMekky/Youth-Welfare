import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Prevent Next.js build from failing due to lint warnings.
    ignoreDuringBuilds: true,
  },
  images: {
    qualities: [75, 85, 90, 95, 100],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
    ],
  },
};

export default nextConfig;