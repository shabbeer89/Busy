// Comprehensive Binance BABT Verification Hook
// Provides complete workflow for verifying Binance App BABT tokens

import { useState, useCallback } from 'react';
import {
  createBABTVerificationWorkflow,
  VerificationResult
} from '@/lib/binance-babt-verification';

export interface BABTVerificationState {
  isLoading: boolean;
  isVerified: boolean;
  verificationMethod: string | null;
  binanceUserId?: string;
  walletAddress?: string;
  babtTokenIds?: string[];
  error?: string;
  oAuthUrl?: string;
  linkRequired: boolean;
}

export interface BinanceBABTVerificationHook extends BABTVerificationState {
  // Actions
  startOAuthVerification: () => string;
  completeOAuthVerification: (authCode: string) => Promise<VerificationResult>;
  verifyWalletLinking: (walletAddress: string, signature: string) => Promise<VerificationResult>;
  linkWalletToBinance: (walletAddress: string, signature: string, authCode: string) => Promise<VerificationResult>;
  reset: () => void;
}

export function useBinanceBABTVerification(
  binanceClientId?: string,
  binanceClientSecret?: string,
  redirectUri?: string
): BinanceBABTVerificationHook {
  const [state, setState] = useState<BABTVerificationState>({
    isLoading: false,
    isVerified: false,
    verificationMethod: null,
    linkRequired: false,
  });

  // Create verification workflow
  const verificationWorkflow = createBABTVerificationWorkflow(
    binanceClientId || process.env.NEXT_PUBLIC_BINANCE_CLIENT_ID || 'your-binance-client-id',
    binanceClientSecret || process.env.BINANCE_CLIENT_SECRET || 'your-binance-client-secret',
    redirectUri || process.env.BINANCE_REDIRECT_URI || 'http://localhost:3000/api/babt/oauth/callback'
  );

  // Start OAuth verification process
  const startOAuthVerification = useCallback((): string => {
    const state = `babt_verification_${Date.now()}`;
    const authUrl = verificationWorkflow['binanceVerifier'].generateAuthUrl(state);

    setState(prev => ({
      ...prev,
      oAuthUrl: authUrl,
      error: undefined,
    }));

    return authUrl;
  }, [verificationWorkflow]);

  // Complete OAuth verification with auth code
  const completeOAuthVerification = useCallback(async (authCode: string): Promise<VerificationResult> => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const result = await verificationWorkflow.verifyBABT(
        undefined, // No wallet address for OAuth method
        authCode,
        undefined, // No signature for OAuth method
        false      // No wallet linking for OAuth method
      );

      if (result.isValid) {
        setState({
          isLoading: false,
          isVerified: true,
          verificationMethod: result.method,
          binanceUserId: result.binanceUserId,
          babtTokenIds: result.babtTokenIds,
          linkRequired: false,
        });
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isVerified: false,
          error: result.error || 'OAuth verification failed',
          linkRequired: true,
        }));
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'OAuth verification failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        linkRequired: true,
      }));

      return {
        isValid: false,
        method: 'binance_oauth',
        error: errorMessage,
      };
    }
  }, [verificationWorkflow]);

  // Verify wallet linking (for already linked wallets)
  const verifyWalletLinking = useCallback(async (
    walletAddress: string,
    signature: string
  ): Promise<VerificationResult> => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const result = await verificationWorkflow.verifyBABT(
        walletAddress,
        undefined, // No OAuth code for linked wallet verification
        signature,
        false      // No wallet linking for verification
      );

      if (result.isValid) {
        setState({
          isLoading: false,
          isVerified: true,
          verificationMethod: result.method,
          binanceUserId: result.binanceUserId,
          walletAddress: result.walletAddress,
          babtTokenIds: result.babtTokenIds,
          linkRequired: false,
        });
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isVerified: false,
          error: result.error || 'Wallet verification failed',
          linkRequired: true,
        }));
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Wallet verification failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        linkRequired: true,
      }));

      return {
        isValid: false,
        method: 'wallet_signature',
        error: errorMessage,
      };
    }
  }, [verificationWorkflow]);

  // Link wallet to Binance account
  const linkWalletToBinance = useCallback(async (
    walletAddress: string,
    signature: string,
    authCode: string
  ): Promise<VerificationResult> => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const result = await verificationWorkflow.verifyBABT(
        walletAddress,
        authCode,
        signature,
        true // Enable wallet linking
      );

      if (result.isValid) {
        setState({
          isLoading: false,
          isVerified: true,
          verificationMethod: result.method,
          binanceUserId: result.binanceUserId,
          walletAddress: result.walletAddress,
          babtTokenIds: result.babtTokenIds,
          linkRequired: false,
        });
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isVerified: false,
          error: result.error || 'Wallet linking failed',
          linkRequired: true,
        }));
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Wallet linking failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        linkRequired: true,
      }));

      return {
        isValid: false,
        method: 'linked_wallet',
        error: errorMessage,
      };
    }
  }, [verificationWorkflow]);

  // Reset verification state
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isVerified: false,
      verificationMethod: null,
      linkRequired: false,
    });
  }, []);

  return {
    ...state,
    startOAuthVerification,
    completeOAuthVerification,
    verifyWalletLinking,
    linkWalletToBinance,
    reset,
  };
}