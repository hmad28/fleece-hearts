import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Package internal monorepo dikirim sebagai source TS.
  transpilePackages: ["@fh/types", "@fh/shared", "@fh/validation"],
  poweredByHeader: false,
};

export default nextConfig;
