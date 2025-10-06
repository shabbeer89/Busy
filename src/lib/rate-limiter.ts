// Rate limiting utility for API endpoints
import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class MemoryRateLimiter {
  private requests = new Map<string, RateLimitEntry>();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60 * 1000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  private getKey(identifier: string): string {
    return `rl_${identifier}`;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  isRateLimited(identifier: string): { allowed: boolean; resetTime?: number; remaining?: number } {
    const key = this.getKey(identifier);
    const now = Date.now();
    const entry = this.requests.get(key);

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      const resetTime = now + this.windowMs;
      this.requests.set(key, { count: 1, resetTime });
      return {
        allowed: true,
        resetTime,
        remaining: this.maxRequests - 1
      };
    }

    if (entry.count >= this.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        resetTime: entry.resetTime,
        remaining: 0
      };
    }

    // Increment counter
    entry.count++;
    this.requests.set(key, entry);

    return {
      allowed: true,
      resetTime: entry.resetTime,
      remaining: this.maxRequests - entry.count
    };
  }
}

// Create rate limiter instances for different purposes
export const apiRateLimiter = new MemoryRateLimiter(60 * 1000, 30); // 30 requests per minute for general API
export const authRateLimiter = new MemoryRateLimiter(15 * 60 * 1000, 5); // 5 auth attempts per 15 minutes
export const verificationRateLimiter = new MemoryRateLimiter(5 * 60 * 1000, 10); // 10 verifications per 5 minutes

// Rate limiting middleware function
export function createRateLimitMiddleware(
  rateLimiter: MemoryRateLimiter,
  getIdentifier: (request: NextRequest) => string
) {
  return async function rateLimitMiddleware(request: NextRequest) {
    const identifier = getIdentifier(request);
    const result = rateLimiter.isRateLimited(identifier);

    if (!result.allowed) {
      const resetIn = Math.ceil((result.resetTime! - Date.now()) / 1000);

      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          resetIn,
          message: `Too many requests. Try again in ${resetIn} seconds.`
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimiter['maxRequests'].toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetTime!.toString(),
            'Retry-After': resetIn.toString()
          }
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', rateLimiter['maxRequests'].toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining?.toString() || '0');
    response.headers.set('X-RateLimit-Reset', result.resetTime!.toString());

    return response;
  };
}

// Helper function to get client IP address
export function getClientIP(request: NextRequest): string {
  // Try different headers for IP address
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const clientIP = request.headers.get('x-client-ip');
  if (clientIP) {
    return clientIP;
  }

  // Fallback for local development
  return '127.0.0.1';
}

// Helper function to get wallet address from request
export function getWalletFromRequest(request: NextRequest): string | null {
  // Try to get wallet address from headers or body
  const walletHeader = request.headers.get('x-wallet-address');
  if (walletHeader) {
    return walletHeader;
  }

  // For POST requests, try to extract from body
  if (request.method === 'POST') {
    try {
      // Note: In a real implementation, you'd want to properly parse the body
      // This is a simplified version
      return null;
    } catch {
      return null;
    }
  }

  return null;
}