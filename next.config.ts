import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Desabilita localStorage no servidor (Node v25 tem localStorage experimental quebrado)
      config.resolve.alias = {
        ...config.resolve.alias,
      };
    }
    return config;
  },
};

export default withPWA({
  dest: "public",
  register: true,
  sw: "sw.js",
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
