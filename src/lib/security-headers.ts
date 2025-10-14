// Security headers middleware for Next.js API routes
import { NextRequest, NextResponse } from 'next/server';

export interface SecurityHeadersConfig {
  contentSecurityPolicy?: string;
  xFrameOptions?: 'DENY' | 'SAMEORIGIN';
  xContentTypeOptions?: 'nosniff';
  referrerPolicy?: 'strict-origin-when-cross-origin' | 'no-referrer' | 'same-origin';
  permissionsPolicy?: string;
}

const DEFAULT_SECURITY_HEADERS: SecurityHeadersConfig = {
  contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ws://127.0.0.1:* https://bsc-dataseed.binance.org https://*.convex.cloud wss://*.convex.cloud https://challenges.cloudflare.com; trusted-types *;",
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
  referrerPolicy: 'strict-origin-when-cross-origin',
  permissionsPolicy: 'camera=(), microphone=(), geolocation=()'
};

export function createSecurityHeadersMiddleware(config: SecurityHeadersConfig = {}) {
  const mergedConfig = { ...DEFAULT_SECURITY_HEADERS, ...config };

  return function securityHeadersMiddleware(request: NextRequest) {
    const response = NextResponse.next();

    // Content Security Policy
    if (mergedConfig.contentSecurityPolicy) {
      response.headers.set('Content-Security-Policy', mergedConfig.contentSecurityPolicy);
    }

    // X-Frame-Options
    if (mergedConfig.xFrameOptions) {
      response.headers.set('X-Frame-Options', mergedConfig.xFrameOptions);
    }

    // X-Content-Type-Options
    if (mergedConfig.xContentTypeOptions) {
      response.headers.set('X-Content-Type-Options', mergedConfig.xContentTypeOptions);
    }

    // Referrer Policy
    if (mergedConfig.referrerPolicy) {
      response.headers.set('Referrer-Policy', mergedConfig.referrerPolicy);
    }

    // Permissions Policy (formerly Feature Policy)
    if (mergedConfig.permissionsPolicy) {
      response.headers.set('Permissions-Policy', mergedConfig.permissionsPolicy);
    }

    // Additional security headers
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    return response;
  };
}

// Pre-configured middleware for different route types
export const apiSecurityHeaders = createSecurityHeadersMiddleware({
  contentSecurityPolicy: "default-src 'self'; connect-src 'self' ws://127.0.0.1:* https://bsc-dataseed.binance.org https://*.convex.cloud wss://*.convex.cloud; script-src 'self'; trusted-types *;",
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
  referrerPolicy: 'strict-origin-when-cross-origin'
});

export const pageSecurityHeaders = createSecurityHeadersMiddleware({
  contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' ws://127.0.0.1:* https://bsc-dataseed.binance.org https://*.convex.cloud wss://*.convex.cloud https://challenges.cloudflare.com; trusted-types *;",
  xFrameOptions: 'SAMEORIGIN',
  xContentTypeOptions: 'nosniff',
  referrerPolicy: 'strict-origin-when-cross-origin',
  permissionsPolicy: 'camera=(), microphone=(), geolocation=(), payment=()'
});