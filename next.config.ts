import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["next-intl"],
  experimental: {
    optimizePackageImports: ["next-intl"],
  },
};

export default nextConfig;
