import { ethers } from 'ethers';

// ERC-721 ABI for generic NFT validation
export const ERC721_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function supportsInterface(bytes4 interfaceId) view returns (bool)"
];

// ERC-1155 ABI for multi-token contracts
export const ERC1155_ABI = [
  "function balanceOf(address owner, uint256 id) view returns (uint256)",
  "function balanceOfBatch(address[] owners, uint256[] ids) view returns (uint256[])",
  "function uri(uint256 id) view returns (string)",
  "function supportsInterface(bytes4 interfaceId) view returns (bool)"
];

// ERC-20 ABI for fungible tokens
export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

// Interface IDs
export const INTERFACE_IDS = {
  ERC721: "0x80ac58cd",
  ERC1155: "0xd9b67a26",
  ERC20: "0x36372b07"
};

// Format address with proper checksum
export function formatAddressWithChecksum(address: string): string {
  try {
    // First check if it's already a valid address
    if (ethers.isAddress(address)) {
      return address; // Already properly formatted
    }

    // Try to format it with proper checksum
    return ethers.getAddress(address);
  } catch (error) {
    throw new Error(`Invalid address format: ${address}`);
  }
}

// Check if address needs checksum correction
export function needsChecksumCorrection(address: string): boolean {
  try {
    if (!address || typeof address !== 'string') return false;

    const cleanAddress = address.replace('0x', '');
    if (cleanAddress.length !== 40) return false;

    // Check if it contains only valid hex characters
    if (!/^[a-fA-F0-9]{40}$/.test(cleanAddress)) return false;

    // If it has mixed case, check if checksum is valid
    const hasUpperCase = /[A-F]/.test(cleanAddress);
    const hasLowerCase = /[a-f]/.test(cleanAddress);

    if (hasUpperCase && hasLowerCase) {
      // Already has mixed case, validate checksum
      return !ethers.isAddress(address);
    }

    // If it has no mixed case, it needs checksum
    return true;
  } catch {
    return false;
  }
}

// Validate Ethereum address with better error reporting
export function validateEthereumAddress(address: string): { isValid: boolean; formatted?: string; error?: string } {
  try {
    if (!address || typeof address !== 'string') {
      return { isValid: false, error: 'Address is required' };
    }

    const cleanAddress = address.replace('0x', '');

    // Check length
    if (cleanAddress.length !== 40) {
      return { isValid: false, error: `Invalid length: expected 40 characters, got ${cleanAddress.length}` };
    }

    // Check characters
    if (!/^[a-fA-F0-9]{40}$/.test(cleanAddress)) {
      return { isValid: false, error: 'Address contains invalid characters (only hex characters allowed)' };
    }

    // Try to format with proper checksum
    try {
      const formatted = ethers.getAddress(address);
      return { isValid: true, formatted };
    } catch (checksumError) {
      return { isValid: false, error: 'Invalid address checksum' };
    }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Address validation failed'
    };
  }
}

// Check if address contains contract code
export async function isContractAddress(
  address: string,
  rpcUrl: string = 'https://bsc-dataseed.binance.org/'
): Promise<boolean> {
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const code = await provider.getCode(address);
    return code !== '0x';
  } catch (error) {
    console.error('Error checking if address is contract:', error);
    return false;
  }
}

// Common Soulbound Token (SBT) contract addresses for reference
export const COMMON_SBT_ADDRESSES = {
  BABT_BSC: '0x2B09d47D550061f995A3b5C6AF942065c1306Ef0',
  BABT_TESTNET: '0x2B09d47D550061f995A3b5C6AF942065c1306Ef0', // Same for testnet
} as const;

// Validate contract address format and checksum
export function validateContractAddress(address: string): { isValid: boolean; error?: string } {
  try {
    // Use the improved validation function
    return validateEthereumAddress(address);
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Address validation failed'
    };
  }
}

// Detect contract type (ERC-721, ERC-1155, or ERC-20)
export async function detectContractType(
  contractAddress: string,
  rpcUrl: string = 'https://bsc-dataseed.binance.org/'
): Promise<'ERC721' | 'ERC1155' | 'ERC20' | 'UNKNOWN'> {
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Check ERC-721 interface
    try {
      const erc721Contract = new ethers.Contract(contractAddress, ERC721_ABI, provider);
      const isERC721 = await erc721Contract.supportsInterface(INTERFACE_IDS.ERC721);
      if (isERC721) return 'ERC721';
    } catch (error) {
      // Continue to check other interfaces
    }

    // Check ERC-1155 interface
    try {
      const erc1155Contract = new ethers.Contract(contractAddress, ERC1155_ABI, provider);
      const isERC1155 = await erc1155Contract.supportsInterface(INTERFACE_IDS.ERC1155);
      if (isERC1155) return 'ERC1155';
    } catch (error) {
      // Continue to check ERC-20
    }

    // Check ERC-20 interface (basic detection)
    try {
      const erc20Contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);

      // Try to call some basic ERC-20 functions
      try {
        await erc20Contract.name();
        await erc20Contract.symbol();
        await erc20Contract.totalSupply();
        return 'ERC20';
      } catch (error) {
        // Not an ERC-20 contract
      }
    } catch (error) {
      // Continue
    }

    return 'UNKNOWN';
  } catch (error) {
    console.error('Error detecting contract type:', error);
    return 'UNKNOWN';
  }
}

// Generic NFT/SBT validation function
export async function validateNFTOwnership(
  walletAddress: string,
  contractAddress: string,
  tokenId?: string, // For ERC-1155 specific token validation
  rpcUrl: string = 'https://bsc-dataseed.binance.org/'
): Promise<{
  hasTokens: boolean;
  balance: string;
  contractType: 'ERC721' | 'ERC1155' | 'UNKNOWN';
  tokenIds?: string[];
  contractName?: string;
  contractSymbol?: string;
  error?: string;
}> {
  try {
    // Validate contract address
    const addressValidation = validateContractAddress(contractAddress);
    if (!addressValidation.isValid) {
      return {
        hasTokens: false,
        balance: '0',
        contractType: 'UNKNOWN',
        error: addressValidation.error || 'Invalid contract address format'
      };
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // First check if address contains contract code
    const isContract = await isContractAddress(contractAddress, rpcUrl);
    if (!isContract) {
      return {
        hasTokens: false,
        balance: '0',
        contractType: 'UNKNOWN',
        error: 'Address does not contain contract code. Please verify this is a deployed smart contract address.'
      };
    }

    // Detect contract type
    const contractType = await detectContractType(contractAddress, rpcUrl);

    if (contractType === 'UNKNOWN') {
      return {
        hasTokens: false,
        balance: '0',
        contractType: 'UNKNOWN',
        error: 'Contract does not implement ERC-721, ERC-1155, or ERC-20 interface. Please verify this is a token contract.'
      };
    }

    if (contractType === 'ERC721') {
      // ERC-721 validation
      const contract = new ethers.Contract(contractAddress, ERC721_ABI, provider);

      try {
        // Get contract name and symbol
        const name = await contract.name();
        const symbol = await contract.symbol();

        // Check balance
        const balance = await contract.balanceOf(walletAddress);

        if (balance > 0) {
          // Get token IDs owned by the address
          const tokenIds = [];
          for (let i = 0; i < balance; i++) {
            try {
              const tokenId = await contract.tokenOfOwnerByIndex(walletAddress, i);
              tokenIds.push(tokenId.toString());
            } catch (error) {
              break; // Stop if we can't get more tokens
            }
          }

          return {
            hasTokens: true,
            balance: balance.toString(),
            contractType: 'ERC721',
            tokenIds,
            contractName: name,
            contractSymbol: symbol
          };
        } else {
          return {
            hasTokens: false,
            balance: '0',
            contractType: 'ERC721',
            contractName: name,
            contractSymbol: symbol
          };
        }
      } catch (error) {
        return {
          hasTokens: false,
          balance: '0',
          contractType: 'ERC721',
          error: 'Failed to query ERC-721 contract'
        };
      }
    } else if (contractType === 'ERC1155') {
      // ERC-1155 validation
      const contract = new ethers.Contract(contractAddress, ERC1155_ABI, provider);

      try {
        // For ERC-1155, we need a specific token ID to check
        if (!tokenId) {
          return {
            hasTokens: false,
            balance: '0',
            contractType: 'ERC1155',
            error: 'Token ID required for ERC-1155 validation'
          };
        }

        // Get contract URI (name/symbol not standard in ERC-1155)
        let uri = '';
        try {
          uri = await contract.uri(tokenId);
        } catch (error) {
          // URI might not be implemented
        }

        // Check balance for specific token
        const balance = await contract.balanceOf(walletAddress, tokenId);

        return {
          hasTokens: balance > 0,
          balance: balance.toString(),
          contractType: 'ERC1155',
          contractName: uri || 'ERC-1155 Token',
          contractSymbol: tokenId
        };
      } catch (error) {
        return {
          hasTokens: false,
          balance: '0',
          contractType: 'ERC1155',
          error: 'Failed to query ERC-1155 contract'
        };
      }
    }

    return {
      hasTokens: false,
      balance: '0',
      contractType: 'UNKNOWN',
      error: 'Contract type not supported. Currently supports ERC-721 (NFTs), ERC-1155 (Multi-tokens), and ERC-20 (Fungible tokens).'
    };

  } catch (error) {
    console.error('Error validating NFT ownership:', error);
    return {
      hasTokens: false,
      balance: '0',
      contractType: 'UNKNOWN',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Wallet connection helper
export async function connectWallet(): Promise<string | null> {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      return accounts[0];
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return null;
    }
  }
  return null;
}

// Enhanced wallet connection with message signing for BABT verification
export async function connectWalletWithBABTVerification(): Promise<{
  address: string | null;
  signedMessage?: string;
  originalMessage?: string;
  error?: string;
}> {
  try {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      return { address: null, error: 'MetaMask not installed' };
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();

    // Request account access
    const accounts = await provider.send('eth_requestAccounts', []);
    const address = accounts[0];

    if (!address) {
      return { address: null, error: 'No wallet address received' };
    }

    // Create verification message for BABT authentication
    const timestamp = Date.now();
    const message = `BABT Verification Request

Wallet Address: ${address}
Timestamp: ${timestamp}

Please sign this message to prove ownership of your wallet and verify your BABT status.

This request will not trigger any blockchain transaction or cost any gas fees.`;

    // Request signature
    const signedMessage = await signer.signMessage(message);

    return {
      address,
      signedMessage,
      originalMessage: message,
      error: undefined
    };
  } catch (error: any) {
    console.error('Error in BABT wallet connection:', error);

    // Handle user rejection
    if (error.code === 4001 || error.message?.includes('User rejected')) {
      return { address: null, error: 'User rejected the request' };
    }

    if (error.code === -32002) {
      return { address: null, error: 'Connection request already pending. Check MetaMask.' };
    }

    return {
      address: null,
      error: error.message || 'Failed to connect wallet'
    };
  }
}

// Verify signature for BABT authentication
export async function verifyBABTSignature(
  address: string,
  signedMessage: string,
  originalMessage?: string
): Promise<boolean> {
  try {
    // If original message is provided, use it directly
    if (originalMessage) {
      const recoveredAddress = ethers.verifyMessage(originalMessage, signedMessage);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    }

    // If no original message, try to verify against a pattern
    // This handles cases where the signature was created in a different session
    const messagePattern = `BABT Verification Request

Wallet Address: ${address}
Timestamp:`;

    try {
      // Try to verify with the current timestamp pattern
      const currentMessage = `BABT Verification Request

Wallet Address: ${address}
Timestamp: ${Date.now()}

Please sign this message to prove ownership of your wallet and verify your BABT status.

This request will not trigger any blockchain transaction or cost any gas fees.`;

      const recoveredAddress = ethers.verifyMessage(currentMessage, signedMessage);

      // If the recovered address matches, the signature is valid
      if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
        return true;
      }
    } catch (error) {
      // If verification fails with current message, try a more flexible approach
    }

    // Fallback: try to extract timestamp from signature and verify
    // This is a more complex approach that handles signatures created with different timestamps
    try {
      // For now, we'll use a reasonable time window (last 24 hours)
      const now = Date.now();
      const timeWindow = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      // Try a few recent timestamps
      for (let offset = 0; offset < timeWindow; offset += 60 * 60 * 1000) { // Check every hour
        const testTimestamp = now - offset;
        const testMessage = `BABT Verification Request

Wallet Address: ${address}
Timestamp: ${testTimestamp}

Please sign this message to prove ownership of your wallet and verify your BABT status.

This request will not trigger any blockchain transaction or cost any gas fees.`;

        try {
          const recoveredAddress = ethers.verifyMessage(testMessage, signedMessage);
          if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
            return true;
          }
        } catch (error) {
          // Continue trying other timestamps
        }
      }
    } catch (error) {
      console.error('Error in timestamp-based verification:', error);
    }

    return false;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

// BABT-specific verification function
export async function verifyBABTOwnership(
  walletAddress: string,
  contractAddress: string = COMMON_SBT_ADDRESSES.BABT_BSC,
  rpcUrl: string = 'https://bsc-dataseed.binance.org/'
): Promise<{
  hasBABT: boolean;
  tokenIds: string[];
  contractName?: string;
  contractSymbol?: string;
  error?: string;
}> {
  try {
    const result = await validateNFTOwnership(walletAddress, contractAddress, undefined, rpcUrl);

    if (result.error) {
      return {
        hasBABT: false,
        tokenIds: [],
        error: result.error
      };
    }

    return {
      hasBABT: result.hasTokens,
      tokenIds: result.tokenIds || [],
      contractName: result.contractName,
      contractSymbol: result.contractSymbol
    };
  } catch (error) {
    console.error('Error verifying BABT ownership:', error);
    return {
      hasBABT: false,
      tokenIds: [],
      error: error instanceof Error ? error.message : 'Verification failed'
    };
  }
}

// Legacy BABT validation function (for backward compatibility)
export async function validateBABT(
  walletAddress: string,
  contractAddress?: string,
  rpcUrl: string = 'https://bsc-dataseed.binance.org/'
): Promise<boolean> {
  const result = await validateNFTOwnership(
    walletAddress,
    contractAddress || COMMON_SBT_ADDRESSES.BABT_BSC,
    undefined,
    rpcUrl
  );
  return result.hasTokens;
}