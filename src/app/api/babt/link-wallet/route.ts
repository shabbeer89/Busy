// Wallet Linking API for Binance BABT Verification
// Links MetaMask wallet address to Binance account for BABT verification

import { NextRequest, NextResponse } from 'next/server';
import { createBABTVerificationWorkflow, WalletLinkRequest } from '@/lib/binance-babt-verification';
import { verificationRateLimiter, getClientIP } from '@/lib/rate-limiter';
import { apiCORSMiddleware, addCORSHeaders } from '@/lib/cors';

// Initialize the verification workflow
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
        message: `Too many wallet linking requests. Try again in ${resetIn} seconds.`
      },
      { status: 429 }
    );

    addCORSHeaders(response, request);
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
      signature,
      message,
      binanceAuthCode,
    } = body;

    // Validate required fields
    if (!walletAddress || !signature || !binanceAuthCode) {
      const response = NextResponse.json(
        {
          error: 'Missing required fields',
          message: 'walletAddress, signature, and binanceAuthCode are required'
        },
        { status: 400 }
      );
      addCORSHeaders(response, request);
      return response;
    }

    // Verify the Binance auth code and get user profile
    const token = await babtVerifier['binanceVerifier'].exchangeCodeForToken(binanceAuthCode);
    const profile = await babtVerifier['binanceVerifier'].getUserProfile(token.access_token);

    if (!profile.hasBABT) {
      const response = NextResponse.json(
        {
          error: 'No BABT found',
          message: 'Your Binance account does not have BABT tokens'
        },
        { status: 403 }
      );
      addCORSHeaders(response, request);
      return response;
    }

    // Link the wallet address to Binance account
    const linkMessage = babtVerifier.generateLinkMessage(walletAddress, profile.userId);
    const linkSuccess = await babtVerifier['walletLinkManager'].linkWalletToBinance(
      walletAddress,
      signature,
      linkMessage,
      profile.userId
    );

    if (!linkSuccess) {
      const response = NextResponse.json(
        {
          error: 'Wallet linking failed',
          message: 'Failed to link wallet address to Binance account'
        },
        { status: 400 }
      );
      addCORSHeaders(response, request);
      return response;
    }

    // Return successful linking result
    const response = NextResponse.json({
      success: true,
      linked: {
        walletAddress,
        binanceUserId: profile.userId,
        hasBABT: true,
        babtTokenIds: profile.babtTokenIds,
        linkedAt: new Date().toISOString(),
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
    console.error('Wallet linking error:', error);
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

// GET endpoint to check if wallet is linked
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      const response = NextResponse.json(
        {
          error: 'Wallet address required',
          message: 'Please provide walletAddress as query parameter'
        },
        { status: 400 }
      );
      addCORSHeaders(response, request);
      return response;
    }

    const isLinked = babtVerifier['walletLinkManager'].isWalletLinked(walletAddress);
    const binanceUserId = babtVerifier['walletLinkManager'].getLinkedBinanceUser(walletAddress);

    const response = NextResponse.json({
      success: true,
      linked: {
        walletAddress,
        isLinked,
        binanceUserId,
        timestamp: new Date().toISOString(),
      }
    });

    // Add CORS headers
    addCORSHeaders(response, request);

    return response;

  } catch (error) {
    console.error('Wallet link check error:', error);
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