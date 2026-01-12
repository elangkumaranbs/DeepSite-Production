import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/deepsite",
        permanent: true,
        basePath: false,
      },
    ];
  },
  experimental: {
    globalNotFound: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "huggingface.co",
      },
    ],
  },
};

export default nextConfig;
