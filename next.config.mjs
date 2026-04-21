/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "donation.api.sagsio.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: "https://donation.api.sagsio.com/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
