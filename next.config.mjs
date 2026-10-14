import path from "path";
import { fileURLToPath } from "url";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {(phase: string) => import("next").NextConfig} */
const nextConfig = (phase) => ({
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      {
        source: "/reset-password",
        destination: "/user/reset-password",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:3001/api/v1/:path*",
        // destination: "https://donation.api.sagsio.com/api/v1/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "http://localhost:3001/uploads/:path*",
        // destination: "https://donation.api.sagsio.com/uploads/:path*",
      },
    ];
  },
  images: {
    // Dev only: uploads come from the local API (localhost), which Next blocks as a private IP.
    // Uses `phase`, not NODE_ENV, because this machine has NODE_ENV=production set globally.
    dangerouslyAllowLocalIP: phase === PHASE_DEVELOPMENT_SERVER,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
      },
      {
        protocol: "https",
        hostname: "donation.api.sagsio.com",
      },
    ],
  },
});

export default nextConfig;
