import { NextRequest, NextResponse } from 'next/server';
import { verifyBABTSignature } from '@/lib/babt-validation';
import { verificationRateLimiter, getClientIP } from '@/lib/rate-limiter';
import { apiCORSMiddleware, addCORSHeaders } from '@/lib/cors';

export async function POST(request: NextRequest) {
  // Apply CORS middleware
  const corsResponse = apiCORSMiddleware(request);
  if (corsResponse && corsResponse.status === 200) {
    return corsResponse; // Preflight request
  }

  // Apply rate limiting
  const clientIP = getClientIP(request);
  const rateLimitResult = verificationRateLimiter.isRateLimited(clientIP);

  if (!rateLimitResult.allowed) {
    const resetIn = Math.ceil((rateLimitResult.resetTime! - Date.now()) / 1000);
    const response = NextResponse.json(
      {
        error: 'Rate limit exceeded',
        resetIn,
        message: `Too many verification requests. Try again in ${resetIn} seconds.`
      },
      { status: 429 }
    );

    // Add CORS headers even to error responses
    addCORSHeaders(response, request);

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', verificationRateLimiter['maxRequests'].toString());
    response.headers.set('X-RateLimit-Remaining', '0');
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime!.toString());
    response.headers.set('Retry-After', resetIn.toString());

    return response;
  }
  try {
    const body = await request.json();
    const { address, signedMessage, originalMessage } = body;

    // Validate required fields
    if (!address || !signedMessage) {
      const response = NextResponse.json(
        { error: 'Address and signed message are required' },
        { status: 400 }
      );
      addCORSHeaders(response, request);
      return response;
    }

    // Verify signature
    const isValid = await verifyBABTSignature(address, signedMessage, originalMessage);

    if (!isValid) {
      const response = NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
      addCORSHeaders(response, request);
      return response;
    }

    const response = NextResponse.json({
      success: true,
      isValid: true,
      address: address,
      timestamp: new Date().toISOString()
    });

    // Add CORS headers to successful response
    addCORSHeaders(response, request);

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', verificationRateLimiter['maxRequests'].toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining?.toString() || '0');
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime!.toString());

    return response;

  } catch (error) {
    console.error('Signature verification error:', error);
    const response = NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
    addCORSHeaders(response, request);
    return response;
  }
}