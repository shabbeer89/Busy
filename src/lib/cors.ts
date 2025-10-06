// CORS configuration for Next.js API routes
import { NextRequest, NextResponse } from 'next/server';

export interface CORSConfig {
  origins: string[];
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

const DEFAULT_CORS_CONFIG: CORSConfig = {
  origins: process.env.NODE_ENV === 'production'
    ? ['https://yourdomain.com'] // Replace with your actual domain
    : ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-wallet-address', 'x-signed-message'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

export function createCORSMiddleware(config: Partial<CORSConfig> = {}) {
  const mergedConfig = { ...DEFAULT_CORS_CONFIG, ...config };

  return function corsMiddleware(request: NextRequest) {
    const origin = request.headers.get('origin');
    const requestMethod = request.method;

    // Handle preflight requests
    if (requestMethod === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 });

      // Check if origin is allowed
      if (origin && mergedConfig.origins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      } else if (mergedConfig.origins.includes('*')) {
        response.headers.set('Access-Control-Allow-Origin', '*');
      }

      // Set other CORS headers
      if (mergedConfig.methods) {
        response.headers.set('Access-Control-Allow-Methods', mergedConfig.methods.join(', '));
      }

      if (mergedConfig.allowedHeaders) {
        response.headers.set('Access-Control-Allow-Headers', mergedConfig.allowedHeaders.join(', '));
      }

      if (mergedConfig.credentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }

      if (mergedConfig.maxAge) {
        response.headers.set('Access-Control-Max-Age', mergedConfig.maxAge.toString());
      }

      return response;
    }

    // For non-OPTIONS requests, return null to indicate no CORS preflight needed
    // The calling route handler should add CORS headers to its response
    return null;
  };
}

// Helper function to add CORS headers to API responses
export function addCORSHeaders(response: NextResponse, request: NextRequest, config: Partial<CORSConfig> = {}) {
  const mergedConfig = { ...DEFAULT_CORS_CONFIG, ...config };
  const origin = request.headers.get('origin');

  // Check if origin is allowed
  if (origin && mergedConfig.origins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (mergedConfig.origins.includes('*')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  if (mergedConfig.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
}

// Pre-configured CORS middleware for different route types
export const apiCORSMiddleware = createCORSMiddleware({
  origins: process.env.NODE_ENV === 'production'
    ? ['https://yourdomain.com'] // Replace with your actual domain
    : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-wallet-address', 'x-signed-message'],
  credentials: true,
  maxAge: 86400
});

// Helper function to check if request is from allowed origin
export function isOriginAllowed(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) return false;
  if (allowedOrigins.includes('*')) return true;
  return allowedOrigins.includes(origin);
}