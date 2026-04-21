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
};

export default nextConfig;
