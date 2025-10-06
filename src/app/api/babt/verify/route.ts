import { NextRequest, NextResponse } from 'next/server';
import { verifyBABTOwnership, verifyBABTSignature } from '@/lib/babt-validation';
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
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        resetIn,
        message: `Too many verification requests. Try again in ${resetIn} seconds.`
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': verificationRateLimiter['maxRequests'].toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime!.toString(),
          'Retry-After': resetIn.toString()
        }
      }
    );
  }
  try {
    const body = await request.json();
    const { walletAddress, signedMessage, contractAddress, rpcUrl } = body;

    // Validate required fields
    if (!walletAddress) {
      const response = NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
      addCORSHeaders(response, request);
      return response;
    }

    // If signed message is provided, verify it first
    if (signedMessage) {
      const isSignatureValid = await verifyBABTSignature(walletAddress, signedMessage);
      if (!isSignatureValid) {
        const response = NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
        addCORSHeaders(response, request);
        return response;
      }
    }

    // Verify BABT ownership
    const verificationResult = await verifyBABTOwnership(
      walletAddress,
      contractAddress,
      rpcUrl
    );

    // Return verification result
    const response = NextResponse.json({
      success: true,
      hasBABT: verificationResult.hasBABT,
      tokenIds: verificationResult.tokenIds,
      contractName: verificationResult.contractName,
      contractSymbol: verificationResult.contractSymbol,
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
    console.error('BABT verification error:', error);
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