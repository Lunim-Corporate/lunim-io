import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.prismic.io",
        pathname: "/lunim-v3/**",
      },
    ],
    qualities: [85, 90],
  },

  async redirects() {
    return [
      {
        source: "/:path*/case-studies",
        destination: "/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
