import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',

  // Optimize for Docker deployment
  poweredByHeader: false,
  compress: true,

  // Optimize CSS loading to prevent preload warnings
  experimental: {
    optimizeCss: {
      preload: false, // Disable CSS preloading to prevent unused preload warnings
    },
  },

  // Disable ESLint during build to avoid build failures
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
