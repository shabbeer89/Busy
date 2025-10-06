import { NextRequest, NextResponse } from 'next/server';
import { verifyBABTSignature } from './babt-validation';

// In-memory store for BABT verification status (in production, use database)
const babtVerificationCache = new Map<string, {
  hasBABT: boolean;
  tokenIds: string[];
  verifiedAt: Date;
  expiresAt: Date;
}>();

// Cache duration: 24 hours
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export interface AuthenticatedUser {
  walletAddress: string;
  hasBABT: boolean;
  tokenIds: string[];
  signedMessage?: string;
  userId?: string;
}

// Verify if user has valid BABT verification
export async function verifyBABTStatus(
  walletAddress: string,
  signedMessage?: string
): Promise<{ hasBABT: boolean; tokenIds: string[]; error?: string }> {
  try {
    // Check cache first
    const cached = babtVerificationCache.get(walletAddress);
    if (cached && cached.expiresAt > new Date()) {
      return {
        hasBABT: cached.hasBABT,
        tokenIds: cached.tokenIds
      };
    }

    // If signed message provided, verify it
    if (signedMessage) {
      const isValidSignature = await verifyBABTSignature(walletAddress, signedMessage);
      if (!isValidSignature) {
        return {
          hasBABT: false,
          tokenIds: [],
          error: 'Invalid signature'
        };
      }
    }

    // Call verification API (in production, implement direct blockchain call)
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/babt/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress,
        signedMessage,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        hasBABT: false,
        tokenIds: [],
        error: errorData.error || 'Verification failed'
      };
    }

    const data = await response.json();

    // Cache the result
    babtVerificationCache.set(walletAddress, {
      hasBABT: data.hasBABT,
      tokenIds: data.tokenIds || [],
      verifiedAt: new Date(),
      expiresAt: new Date(Date.now() + CACHE_DURATION)
    });

    return {
      hasBABT: data.hasBABT,
      tokenIds: data.tokenIds || []
    };
  } catch (error) {
    console.error('Error verifying BABT status:', error);
    return {
      hasBABT: false,
      tokenIds: [],
      error: 'Verification service unavailable'
    };
  }
}

// Middleware function for protecting routes that require BABT
export async function requireBABT(
  request: NextRequest,
  requiredTokenCount: number = 1
): Promise<{ user: AuthenticatedUser | null; response?: NextResponse }> {
  try {
    // Get wallet address and signature from headers or cookies
    const walletAddress = request.headers.get('x-wallet-address') ||
                         request.cookies.get('babt-wallet-address')?.value;

    const signedMessage = request.headers.get('x-signed-message') ||
                         request.cookies.get('babt-signed-message')?.value;

    if (!walletAddress) {
      return {
        user: null,
        response: NextResponse.json(
          { error: 'Wallet address required' },
          { status: 401 }
        )
      };
    }

    // Verify BABT status
    const babtStatus = await verifyBABTStatus(walletAddress, signedMessage || undefined);

    if (babtStatus.error) {
      return {
        user: null,
        response: NextResponse.json(
          { error: 'BABT verification failed', details: babtStatus.error },
          { status: 403 }
        )
      };
    }

    // Check if user has required number of BABT tokens
    if (!babtStatus.hasBABT || babtStatus.tokenIds.length < requiredTokenCount) {
      return {
        user: null,
        response: NextResponse.json(
          {
            error: 'BABT verification required',
            required: requiredTokenCount,
            current: babtStatus.tokenIds.length
          },
          { status: 403 }
        )
      };
    }

    const user: AuthenticatedUser = {
      walletAddress,
      hasBABT: true,
      tokenIds: babtStatus.tokenIds,
      signedMessage
    };

    return { user };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return {
      user: null,
      response: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      )
    };
  }
}

// Helper function to set BABT authentication cookies
export function setBABTCookies(
  walletAddress: string,
  signedMessage: string,
  response: NextResponse
) {
  response.cookies.set('babt-wallet-address', walletAddress, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: CACHE_DURATION / 1000
  });

  response.cookies.set('babt-signed-message', signedMessage, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: CACHE_DURATION / 1000
  });
}

// Helper function to clear BABT authentication cookies
export function clearBABTCookies(response: NextResponse) {
  response.cookies.set('babt-wallet-address', '', { maxAge: 0 });
  response.cookies.set('babt-signed-message', '', { maxAge: 0 });
}