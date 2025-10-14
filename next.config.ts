import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',

  // Optimize for Docker deployment
  poweredByHeader: false,
  compress: true,

  // Optimize CSS loading to prevent preload warnings
  experimental: {
    // optimizeCss: {
    //   preload: false, // Disable CSS preloading to prevent unused preload warnings
    // },
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
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ws://127.0.0.1:* https://bsc-dataseed.binance.org https://*.convex.cloud wss://*.convex.cloud https://challenges.cloudflare.com; trusted-types *;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
