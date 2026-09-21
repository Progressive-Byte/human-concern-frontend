import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
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
        // destination: "http://localhost:3001/api/v1/:path*",
        destination: "https://donation.api.sagsio.com/api/v1/:path*",
      },
      {
        source: "/uploads/:path*",
        // destination: "http://localhost:3001/uploads/:path*",
        destination: "https://donation.api.sagsio.com/uploads/:path*",
      },
    ];
  },
  images: {
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
};

export default nextConfig;
