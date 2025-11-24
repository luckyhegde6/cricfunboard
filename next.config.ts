import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pino", "pino-pretty", "thread-stream"],
  // Empty turbopack config to silence the warning
  turbopack: {},
};

export default nextConfig;
