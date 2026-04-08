import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
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
