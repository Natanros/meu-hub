import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Excluir @huggingface/transformers do bundle do servidor (muito grande)
      config.externals = config.externals || [];
      config.externals.push({
        '@huggingface/transformers': '@huggingface/transformers',
      });
    }
    return config;
  },
  // Configuração experimental para reduzir tamanho de serverless functions
  experimental: {
    serverComponentsExternalPackages: ['@huggingface/transformers'],
  },
};

export default withPWA({
  dest: "public",
  register: true,
  sw: "sw.js",
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
