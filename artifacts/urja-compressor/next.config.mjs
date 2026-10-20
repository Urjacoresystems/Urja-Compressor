import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

export default {
  reactStrictMode: true,
  turbopack: {},
  output: "standalone",
  // Monorepo root, so the standalone server always lands at
  // .next/standalone/artifacts/urja-compressor/server.js
  outputFileTracingRoot: path.join(here, "../../"),
  allowedDevOrigins: ["127.0.0.1", "**.replit.dev"],
};
