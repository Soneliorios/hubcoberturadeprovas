import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite o carregamento dos assets de dev via IPs locais (só afeta o dev).
  allowedDevOrigins: ["127.0.0.1", "172.17.80.1", "54.232.189.113"],
};

export default nextConfig;
