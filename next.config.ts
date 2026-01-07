import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // basePath: "/deepsite",
  // assetPrefix: "/deepsite",
  // async redirects() {
  //   return [
  //     {
  //       source: "/",
  //       destination: "/deepsite",
  //       permanent: true,
  //       basePath: false,
  //     },
  //   ];
  // },
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
