import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.prismic.io",
        // narrow to your repo (optional but safer):
        pathname: "/lunim-v3/**",
      },
    ],
  },
};

export default nextConfig;
