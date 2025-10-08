"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  Crown,
  Star,
  CheckCircle,
  AlertCircle,
  Loader2,
  Wallet,
  ExternalLink,
  Copy,
  RefreshCw,
  Clock,
  Info,
  AlertTriangle
} from 'lucide-react';

type VerificationMode = 'full' | 'status' | 'minimal';

interface BABTVerificationFlowProps {
  mode?: VerificationMode;
  onVerificationComplete?: (data: any) => void;
  showTitle?: boolean;
  compact?: boolean;
  showStartButton?: boolean;
}

interface BABTVerificationState {
  step: 'initial' | 'connecting' | 'oauth' | 'wallet' | 'verifying' | 'success' | 'error';
  isLoading: boolean;
  error: string | null;
  verificationData: {
    address?: string;
    tokenIds?: string[];
    method?: string;
    verifiedAt?: string;
  } | null;
}

export function BABTVerificationFlow({
  mode = 'full',
  onVerificationComplete,
  showTitle = true,
  compact = false,
  showStartButton = false
}: BABTVerificationFlowProps) {
  const { user, isLoading } = useAuth();
  const [state, setState] = useState<BABTVerificationState>({
    step: 'initial',
    isLoading: false,
    error: null,
    verificationData: null,
  });

  const [oauthCode, setOauthCode] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [signature, setSignature] = useState('');

  // Check existing verification on mount
  useEffect(() => {
    const checkExistingVerification = async () => {
      const stored = localStorage.getItem('babt_verification');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          const verificationData = {
            address: data.walletAddress || data.binanceUserId,
            tokenIds: data.babtTokenIds || [],
            method: data.method || 'binance_oauth',
            verifiedAt: data.verifiedAt,
          };

          setState(prev => ({
            ...prev,
            step: 'success',
            verificationData,
          }));

          if (onVerificationComplete) {
            onVerificationComplete(verificationData);
          }
        } catch {
          localStorage.removeItem('babt_verification');
        }
      }
    };

    if (user && !isLoading) {
      checkExistingVerification();
    }
  }, [user, onVerificationComplete]);

  const resetVerification = () => {
    setState({
      step: 'initial',
      isLoading: false,
      error: null,
      verificationData: null,
    });
    setOauthCode('');
    setWalletAddress('');
    setSignature('');
    localStorage.removeItem('babt_verification');
  };

  const startBinanceOAuth = async () => {
    setState(prev => ({ ...prev, step: 'connecting', isLoading: true, error: null }));

    try {
      const response = await fetch('/api/babt/comprehensive-verify', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 503) {
          setState(prev => ({
            ...prev,
            step: 'error',
            isLoading: false,
            error: `Binance OAuth is not configured on this server.

To enable Binance OAuth verification:

1. Create a Binance developer application at https://developers.binance.com/
2. Get your Client ID and Client Secret from the Binance developer dashboard
3. Set these environment variables in your .env.local file:
   - BINANCE_CLIENT_ID=your_actual_client_id
   - BINANCE_CLIENT_SECRET=your_actual_client_secret
   - BINANCE_REDIRECT_URI=http://localhost:3000/api/babt/callback

Alternatively, you can use the "Link Web3 Wallet" option below for verification.`
          }));
          return;
        }
        throw new Error(data.message || 'Failed to generate OAuth URL');
      }

      if (data.success && data.authUrl) {
        window.open(data.authUrl, '_blank', 'width=600,height=800');
        setState(prev => ({ ...prev, step: 'oauth', isLoading: false }));
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        step: 'error',
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to start OAuth'
      }));
    }
  };

  const completeOAuthVerification = async () => {
    if (!oauthCode.trim()) return;

    setState(prev => ({ ...prev, step: 'verifying', isLoading: true, error: null }));

    try {
      const response = await fetch('/api/babt/comprehensive-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          binanceAuthCode: oauthCode.trim(),
          verificationMethod: 'binance_oauth',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Wallet verification failed');
      }

      if (data.success && data.verification?.isValid) {
        const verificationData = {
          address: data.verification.walletAddress || data.verification.binanceUserId,
          tokenIds: data.verification.babtTokenIds || [],
          method: data.verification.method,
          verifiedAt: new Date().toISOString(),
        };

        setState(prev => ({
          ...prev,
          step: 'success',
          isLoading: false,
          verificationData,
        }));

        localStorage.setItem('babt_verification', JSON.stringify({
          ...data.verification,
          verifiedAt: verificationData.verifiedAt,
        }));

        if (onVerificationComplete) {
          onVerificationComplete(verificationData);
        }
      } else {
        throw new Error(data.verification?.error || 'OAuth verification failed');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        step: 'error',
        isLoading: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      }));
    }
  };

  const verifyWalletLinking = async () => {
    if (!walletAddress.trim() || !signature.trim()) return;

    setState(prev => ({ ...prev, step: 'verifying', isLoading: true, error: null }));

    try {
      const response = await fetch('/api/babt/comprehensive-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          walletAddress: walletAddress.trim(),
          signature: signature.trim(),
          verificationMethod: 'wallet_signature',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error(`Binance OAuth is not configured on this server.

To enable Binance OAuth verification:

1. Create a Binance developer application at https://developers.binance.com/
2. Get your Client ID and Client Secret from the Binance developer dashboard
3. Set these environment variables in your .env.local file:
   - BINANCE_CLIENT_ID=your_actual_client_id
   - BINANCE_CLIENT_SECRET=your_actual_client_secret
   - BINANCE_REDIRECT_URI=http://localhost:3000/api/babt/callback

Alternatively, you can use the "Link Web3 Wallet" option for verification.`);
        }
        throw new Error(data.message || 'Verification failed');
      }

      if (data.success && data.verification?.isValid) {
        const verificationData = {
          address: data.verification.walletAddress,
          tokenIds: data.verification.babtTokenIds || [],
          method: data.verification.method,
          verifiedAt: new Date().toISOString(),
        };

        setState(prev => ({
          ...prev,
          step: 'success',
          isLoading: false,
          verificationData,
        }));

        localStorage.setItem('babt_verification', JSON.stringify({
          ...data.verification,
          verifiedAt: verificationData.verifiedAt,
        }));

        if (onVerificationComplete) {
          onVerificationComplete(verificationData);
        }
      } else {
        throw new Error(data.verification?.error || 'Wallet verification failed');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        step: 'error',
        isLoading: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      }));
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Minimal mode - just status badge
  if (mode === 'minimal') {
    if (state.step === 'success' && state.verificationData) {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="w-3 h-3 mr-1" />
          BABT Verified
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        Not Verified
      </Badge>
    );
  }

  // Status mode - compact verification status
  if (mode === 'status') {
    if (state.step === 'success' && state.verificationData) {
      return (
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  BABT Verified
                </span>
              </div>
              <Button onClick={resetVerification} variant="ghost" size="sm">
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
            {state.verificationData.address && (
              <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                {state.verificationData.address.slice(0, 6)}...{state.verificationData.address.slice(-4)}
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              BABT Verification Required
            </span>
          </div>
          {showStartButton && (
            <Button
              onClick={() => setState(prev => ({ ...prev, step: 'initial' }))}
              className="w-full mt-2"
              size="sm"
            >
              <Shield className="w-3 h-3 mr-1" />
              Verify BABT
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full mode - complete verification interface
  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>Please sign in to access BABT verification</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className={compact ? "space-y-4" : "max-w-2xl mx-auto"}>
      {showTitle && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-blue-600" />
            BABT Verification
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Verify your Binance BABT to access exclusive features
          </p>
        </div>
      )}

      {state.step === 'success' && state.verificationData ? (
        /* Success State */
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                  Verification Successful!
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  You now have access to BABT-protected features
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Verification Flow */
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="w-6 h-6 text-blue-500" />
              Verify Your BABT
            </CardTitle>
            <CardDescription>
              Choose your preferred verification method below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {state.step === 'initial' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <Button
                    onClick={startBinanceOAuth}
                    disabled={state.isLoading}
                    className="h-20 flex-col gap-2 bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <ExternalLink className="w-6 h-6" />
                    Connect Binance Account
                  </Button>

                  <Button
                    onClick={() => setState(prev => ({ ...prev, step: 'wallet' }))}
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    size="lg"
                  >
                    <Wallet className="w-6 h-6" />
                    Link Web3 Wallet
                  </Button>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>What is BABT?</strong><br />
                    Binance Account Bound Token (BABT) is a Soulbound Token that serves as proof of KYC verification on Binance.
                  </div>
                </div>
              </div>
            )}

            {state.step === 'connecting' && (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
                <div className="font-medium text-gray-900 dark:text-white">Connecting to Binance...</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Complete the authorization in the popup window
                </div>
              </div>
            )}

            {state.step === 'oauth' && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="font-medium text-gray-900 dark:text-white mb-2">
                    Binance OAuth Complete
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Paste the authorization code from Binance below
                  </div>
                </div>

                <Input
                  placeholder="Enter authorization code from Binance"
                  value={oauthCode}
                  onChange={(e) => setOauthCode(e.target.value)}
                />

                <div className="flex gap-3">
                  <Button
                    onClick={() => setState(prev => ({ ...prev, step: 'initial' }))}
                    variant="outline"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={completeOAuthVerification}
                    disabled={state.isLoading || !oauthCode.trim()}
                    className="flex-1"
                  >
                    {state.isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Complete Verification'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {state.step === 'wallet' && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="font-medium text-gray-900 dark:text-white mb-2">
                    Link Your Wallet
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Connect your Web3 wallet with BABT tokens
                  </div>
                </div>

                <Input
                  placeholder="Your wallet address (0x...)"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                />

                <Input
                  placeholder="Signature (from MetaMask)"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                />

                <div className="flex gap-3">
                  <Button
                    onClick={() => setState(prev => ({ ...prev, step: 'initial' }))}
                    variant="outline"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={verifyWalletLinking}
                    disabled={state.isLoading || !walletAddress.trim() || !signature.trim()}
                    className="flex-1"
                  >
                    {state.isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Wallet'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {state.step === 'verifying' && (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
                <div className="font-medium text-gray-900 dark:text-white">Verifying BABT Ownership...</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  This may take a few moments
                </div>
              </div>
            )}

            {state.step === 'error' && state.error && (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-red-800 dark:text-red-200">Verification Failed</div>
                      <div className="text-sm text-red-700 dark:text-red-300 mt-1">{state.error}</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={resetVerification}
                    variant="outline"
                    className="flex-1"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Information Panel - only in full mode */}
      {mode === 'full' && (
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <div className="font-medium text-gray-900 dark:text-white mb-3">Verification Methods:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <ExternalLink className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Binance OAuth</div>
                    <div className="text-xs">Direct verification via Binance account</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Wallet className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Wallet Linking</div>
                    <div className="text-xs">Link Web3 wallet with BABT tokens</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}