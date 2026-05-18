import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'}/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/orders',
        destination: '/consumer/orders',
        permanent: true,
      },
      {
        source: '/products',
        destination: '/consumer/products',
        permanent: true,
      },
      {
        source: '/cart',
        destination: '/consumer/cart',
        permanent: true,
      },
      {
        source: '/checkout',
        destination: '/consumer/checkout',
        permanent: true,
      },
      {
        source: '/profile',
        destination: '/consumer/profile',
        permanent: true,
      }
    ];
  }
};

export default nextConfig;
