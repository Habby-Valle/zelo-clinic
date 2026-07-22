import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  // Permite acessar o dev server via túnel (ngrok) sem bloquear assets/HMR
  allowedDevOrigins: ["fracture-mumbo-sacrament.ngrok-free.dev"],
};

export default nextConfig;
