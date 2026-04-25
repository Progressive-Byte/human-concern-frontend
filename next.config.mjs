/** @type {import('next').NextConfig} */
const nextConfig = {
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
        destination: "https://donation.api.sagsio.com/api/v1/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "donation.api.sagsio.com",
      },
    ],
  },
};

export default nextConfig;
