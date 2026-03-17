import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['172.20.10.5', '192.168.*', '10.*', '172.*'],
};

export default nextConfig;
