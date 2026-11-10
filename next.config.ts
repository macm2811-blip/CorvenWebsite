import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  async redirects() {
    return [
      {
        source: "/demo/etsa",
        destination: "/demo/etsa/index.html",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

