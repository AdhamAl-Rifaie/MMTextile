import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: "150mb",
    serverActions: {
      bodySizeLimit: "150mb"
    }
  }
};

export default nextConfig;
