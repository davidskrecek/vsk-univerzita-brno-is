import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
  // Allow loading Next.js dev resources from mobile/LAN and ngrok tunnels.
  // This only affects `next dev`, not production deploys.
  allowedDevOrigins: [
    "10.5.0.2",
    "192.168.0.35",
    "localhost",
    "127.0.0.1",
    "*.ngrok-free.dev",
    "*.ngrok.app",
  ],
};

export default nextConfig;
