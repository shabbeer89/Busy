import { NextRequest, NextResponse } from 'next/server';
import { requireBABT, setBABTCookies, clearBABTCookies } from '@/lib/auth-middleware';

// Example of a BABT-protected API route
export async function GET(request: NextRequest) {
  try {
    // Require BABT verification (default: at least 1 BABT token)
    const { user, response } = await requireBABT(request, 1);

    if (!user) {
      // Response already created by requireBABT
      return response!;
    }

    // User has valid BABT verification
    return NextResponse.json({
      success: true,
      message: 'Access granted to BABT-protected content',
      user: {
        walletAddress: user.walletAddress,
        hasBABT: user.hasBABT,
        tokenCount: user.tokenIds.length,
        tokenIds: user.tokenIds
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Protected route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Example of setting BABT authentication
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, signedMessage } = body;

    if (!walletAddress || !signedMessage) {
      return NextResponse.json(
        { error: 'Wallet address and signed message required' },
        { status: 400 }
      );
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'BABT authentication set'
    });

    // Set secure cookies
    setBABTCookies(walletAddress, signedMessage, response);

    return response;
  } catch (error) {
    console.error('Set BABT auth error:', error);
    return NextResponse.json(
      { error: 'Failed to set authentication' },
      { status: 500 }
    );
  }
}

// Example of clearing BABT authentication
export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'BABT authentication cleared'
    });

    clearBABTCookies(response);
    return response;
  } catch (error) {
    console.error('Clear BABT auth error:', error);
    return NextResponse.json(
      { error: 'Failed to clear authentication' },
      { status: 500 }
    );
  }
}