import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rotaryindia.org',
      },
      {
        protocol: 'http',
        hostname: 'rotaryindia.org',
      },
    ],
  },
};

export default nextConfig;
