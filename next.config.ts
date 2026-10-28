import type { NextConfig } from "next";

// Site statique (dossier out/), hébergeable tel quel sur Vercel.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
