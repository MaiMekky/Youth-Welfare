import type { NextConfig } from "next";

const API_HOST = process.env.NEXT_PUBLIC_API_HOST || "localhost";
const API_PORT = process.env.NEXT_PUBLIC_API_PORT || "8000";
const API_PROTOCOL = process.env.NEXT_PUBLIC_API_PROTOCOL || "http";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 85, 90, 95, 100],
    remotePatterns: [
      // Production/Staging - Internal API server
      {
        protocol: API_PROTOCOL as "http" | "https",
        hostname: API_HOST,
        port: API_PORT,
        pathname: '/media/**',
      },
      // Development - localhost
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
      // Production - Public IP (for direct access if needed)
      {
        protocol: 'http',
        hostname: '193.227.34.82',
        port: '8000',
        pathname: '/media/**',
      },
    ],
  },
};

export default nextConfig;