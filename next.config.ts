import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Allow loading Next.js dev resources from mobile/LAN and ngrok tunnels.
  // This only affects `next dev`, not production deploys.
  allowedDevOrigins: [
    "192.168.0.35",
    "*.ngrok-free.dev",
    "*.ngrok.app",
  ],
};

export default nextConfig;
