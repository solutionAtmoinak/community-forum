import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // experimental: {
  //   optimizeCss: false,
  // },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Wildcard for any domain
      },
      {
        protocol: 'http',
        hostname: '**', // If you also need http
      }
    ],
  },
};

export default nextConfig;
