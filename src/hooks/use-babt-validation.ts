import { useState, useCallback } from 'react';
import { validateNFTOwnership, validateContractAddress, detectContractType, connectWallet, COMMON_SBT_ADDRESSES, isContractAddress } from '@/lib/babt-validation';
import type { NFTValidationResult } from '@/types';

interface NFTValidationState extends NFTValidationResult {
  isLoading: boolean;
  customContractAddress?: string;
  tokenId?: string;
}

export function useNFTValidation() {
  const [state, setState] = useState<NFTValidationState>({
    hasTokens: false,
    balance: '0',
    contractType: 'UNKNOWN',
    isLoading: false
  });

  const validate = useCallback(async (
    walletAddress: string,
    contractAddress: string = COMMON_SBT_ADDRESSES.BABT_BSC,
    tokenId?: string,
    rpcUrl?: string
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      // First validate the contract address format
      if (!validateContractAddress(contractAddress)) {
        setState({
          hasTokens: false,
          balance: '0',
          contractType: 'UNKNOWN',
          isLoading: false,
          error: 'Invalid contract address format'
        });
        return;
      }

      const result = await validateNFTOwnership(walletAddress, contractAddress, tokenId, rpcUrl);

      setState({
        ...result,
        isLoading: false,
        customContractAddress: contractAddress,
        tokenId
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Validation failed'
      }));
    }
  }, []);

  const validateContract = useCallback(async (contractAddress: string, rpcUrl?: string) => {
    try {
      // Use the new validation function that provides detailed error messages
      const addressValidation = validateContractAddress(contractAddress);
      if (!addressValidation.isValid) {
        return {
          isValid: false,
          error: addressValidation.error || 'Invalid contract address format'
        };
      }

      // First check if it's actually a contract
      const isContract = await isContractAddress(contractAddress, rpcUrl);

      if (!isContract) {
        return {
          isValid: false,
          error: 'Address does not contain contract code. Please verify this is a deployed smart contract address.'
        };
      }

      const contractType = await detectContractType(contractAddress, rpcUrl);

      return {
        isValid: contractType !== 'UNKNOWN',
        contractType,
        error: contractType === 'UNKNOWN' ? 'Contract does not implement ERC-721, ERC-1155, or ERC-20 interface' : undefined
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Contract validation failed'
      };
    }
  }, []);

  const connectAndValidate = useCallback(async (
    contractAddress?: string,
    tokenId?: string,
    rpcUrl?: string
  ) => {
    try {
      const walletAddress = await connectWallet();
      if (walletAddress) {
        await validate(walletAddress, contractAddress, tokenId, rpcUrl);
        return walletAddress;
      }
      return null;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
      return null;
    }
  }, [validate]);

  const reset = useCallback(() => {
    setState({
      hasTokens: false,
      balance: '0',
      contractType: 'UNKNOWN',
      isLoading: false
    });
  }, []);

  return {
    ...state,
    validate,
    validateContract,
    connectAndValidate,
    reset,
  };
}