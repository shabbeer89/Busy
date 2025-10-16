import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',

  // Optimize for Docker deployment
  poweredByHeader: false,
  compress: true,

  // Webpack optimization for font files to prevent preload warnings
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Handle font files to prevent preload warnings
      config.module.rules.push({
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'static/media/[name].[hash].[ext]',
        },
      });
    }
    return config;
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
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com chrome-extension://* moz-extension://* safari-extension://*; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: chrome-extension://* moz-extension://* safari-extension://*; font-src 'self' data:; connect-src 'self' ws://127.0.0.1:* wss://127.0.0.1:* https://bsc-dataseed.binance.org https://api.bscscan.com https://*.convex.cloud wss://*.convex.cloud https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com; object-src 'none'; frame-ancestors 'self' https://accounts.google.com https://www.linkedin.com; trusted-types *;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
