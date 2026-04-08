import type { NextConfig } from "next";

const HOST = process.env.NEXT_PUBLIC_HOST || "193.227.34.82";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 85, 90, 95, 100],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: HOST,
        port: '8000',
        pathname: '/media/**',
      },
      // keep localhost for development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
    ],
  },
};

export default nextConfig;