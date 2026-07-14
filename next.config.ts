import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_API_URL || "https://api.anandhu-kannan.in"}/api/:path*`,
      },
      {
        source: "/invoices/:path*",
        destination: `${process.env.BACKEND_API_URL || "https://api.anandhu-kannan.in"}/invoices/:path*`,
      },
    ];
  },
};

export default nextConfig;
