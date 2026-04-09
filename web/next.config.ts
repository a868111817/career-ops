import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
  // Required for monorepo: tells Next.js the tracing root is the repo root (one level up from web/)
  // Without this, files like ../modes/*.md and ../cv.md aren't bundled into Vercel functions
  outputFileTracingRoot: path.resolve(__dirname, ".."),
  outputFileTracingIncludes: {
    "/*": [
      "../cv.md",
      "../fonts/**/*",
      "../modes/**/*",
      "../templates/**/*",
      "../config/profile.yml",
      "../config/profile.example.yml",
    ],
  },
};

export default nextConfig;
