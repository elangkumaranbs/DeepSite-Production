import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // todo: active this before deployment in production.
  // basePath: '/deepsite',
  // assetPrefix: '/deepsite',
  // async redirects() {
  //   return [
  //     {
  //       source: '/',
  //       destination: '/deepsite',
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
