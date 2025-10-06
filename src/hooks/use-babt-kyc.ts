import { useState, useCallback } from 'react';
import { connectWalletWithBABTVerification, COMMON_SBT_ADDRESSES } from '@/lib/babt-validation';

interface BABTKYCState {
  isLoading: boolean;
  hasBABT: boolean;
  tokenIds: string[];
  contractName?: string;
  contractSymbol?: string;
  signedMessage?: string;
  error?: string;
  address?: string;
}

interface BABTKYCResult {
  hasBABT: boolean;
  tokenIds: string[];
  contractName?: string;
  contractSymbol?: string;
  signedMessage?: string;
  address?: string;
  error?: string;
}

export function useBABTKYC() {
  const [state, setState] = useState<BABTKYCState>({
    isLoading: false,
    hasBABT: false,
    tokenIds: []
  });

  const verifyBABT = useCallback(async (
    walletAddress: string,
    contractAddress: string = COMMON_SBT_ADDRESSES.BABT_BSC
  ): Promise<BABTKYCResult> => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      // Call the API endpoint for server-side verification
      const response = await fetch('/api/babt/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          contractAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      const result: BABTKYCResult = {
        hasBABT: data.hasBABT,
        tokenIds: data.tokenIds || [],
        contractName: data.contractName,
        contractSymbol: data.contractSymbol,
        signedMessage: data.signedMessage,
        address: walletAddress,
      };

      setState({
        ...result,
        isLoading: false
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'BABT verification failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        hasBABT: false,
        tokenIds: []
      }));

      return {
        hasBABT: false,
        tokenIds: [],
        error: errorMessage
      };
    }
  }, []);

  const connectAndVerifyBABT = useCallback(async (
    contractAddress?: string
  ): Promise<{ address: string | null; result: BABTKYCResult }> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: undefined }));

      // Connect wallet with signature
      const connectionResult = await connectWalletWithBABTVerification();

      if (!connectionResult.address) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: connectionResult.error || 'Failed to connect wallet'
        }));
        return { address: null, result: { hasBABT: false, tokenIds: [] } };
      }

      if (!connectionResult.signedMessage) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Signature required for BABT verification'
        }));
        return {
          address: connectionResult.address,
          result: { hasBABT: false, tokenIds: [] }
        };
      }

      // Verify signature on server
      const signatureResponse = await fetch('/api/babt/verify-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: connectionResult.address,
          signedMessage: connectionResult.signedMessage,
        }),
      });

      if (!signatureResponse.ok) {
        const errorData = await signatureResponse.json();
        throw new Error(errorData.error || 'Signature verification failed');
      }

      // Now verify BABT ownership
      const babtResult = await verifyBABT(connectionResult.address, contractAddress);

      setState({
        ...babtResult,
        isLoading: false,
        signedMessage: connectionResult.signedMessage,
        address: connectionResult.address
      });

      return {
        address: connectionResult.address,
        result: {
          ...babtResult,
          signedMessage: connectionResult.signedMessage,
          address: connectionResult.address
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'BABT verification failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        hasBABT: false,
        tokenIds: []
      }));

      return { address: null, result: { hasBABT: false, tokenIds: [], error: errorMessage } };
    }
  }, [verifyBABT]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      hasBABT: false,
      tokenIds: []
    });
  }, []);

  return {
    ...state,
    verifyBABT,
    connectAndVerifyBABT,
    reset,
  };
}