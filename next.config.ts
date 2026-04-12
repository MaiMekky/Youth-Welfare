import type { NextConfig } from "next";

const API_HOST = process.env.NEXT_PUBLIC_API_HOST || "localhost";
const API_PORT = process.env.NEXT_PUBLIC_API_PORT || "8000";
const API_PROTOCOL = process.env.NEXT_PUBLIC_API_PROTOCOL || "http";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      // Dynamic from .env (production/staging)
      {
        protocol: API_PROTOCOL as "http" | "https",
        hostname: API_HOST,
        port: API_PORT,
        pathname: "/media/**",
      },
      // Development - localhost
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/media/**",
      },
      // Production - Public IP
      {
        protocol: "http",
        hostname: "193.227.34.82",
        port: "",
        pathname: "/media/**",
      },
      // Production - Internal IP
      {
        protocol: "http",
        hostname: "172.1.50.81",
        port: "",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;