// Comprehensive BABT Verification API
// Supports multiple verification methods: Binance OAuth, wallet linking, and signature verification

import { NextRequest, NextResponse } from 'next/server';
import {
  createBABTVerificationWorkflow,
  WalletLinkRequest,
  VerificationResult
} from '@/lib/binance-babt-verification';
import { verificationRateLimiter, getClientIP } from '@/lib/rate-limiter';
import { apiCORSMiddleware, addCORSHeaders } from '@/lib/cors';

// Initialize the verification workflow
// In production, these would come from environment variables
const babtVerifier = createBABTVerificationWorkflow(
  process.env.BINANCE_CLIENT_ID || 'your-binance-client-id',
  process.env.BINANCE_CLIENT_SECRET || 'your-binance-client-secret',
  process.env.BINANCE_REDIRECT_URI || 'http://localhost:3000/api/babt/callback'
);

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
    const {
      walletAddress,
      binanceAuthCode,
      signature,
      linkWallet = false,
      verificationMethod = 'auto'
    } = body;

    // Comprehensive verification
    const result: VerificationResult = await babtVerifier.verifyBABT(
      walletAddress,
      binanceAuthCode,
      signature,
      linkWallet
    );

    // Return verification result
    const response = NextResponse.json({
      success: result.isValid,
      verification: {
        method: result.method,
        isValid: result.isValid,
        binanceUserId: result.binanceUserId,
        walletAddress: result.walletAddress,
        babtTokenIds: result.babtTokenIds,
        error: result.error,
      },
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
    console.error('Comprehensive BABT verification error:', error);
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

// GET endpoint to generate Binance OAuth URL
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state') || 'babt_verification';

    const authUrl = babtVerifier['binanceVerifier'].generateAuthUrl(state);

    const response = NextResponse.json({
      success: true,
      authUrl,
      state,
      timestamp: new Date().toISOString()
    });

    // Add CORS headers
    addCORSHeaders(response, request);

    return response;

  } catch (error) {
    console.error('OAuth URL generation error:', error);
    const response = NextResponse.json(
      {
        error: 'Failed to generate authorization URL',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
    addCORSHeaders(response, request);
    return response;
  }
}