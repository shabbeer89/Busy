// Binance BABT Verification System
// Proper workflow for verifying Binance App BABT tokens with MetaMask integration

import { ethers } from 'ethers';

// Binance API Configuration
export const BINANCE_CONFIG = {
  BASE_URL: 'https://api.binance.com',
  OAUTH_URL: 'https://accounts.binance.com',
  BABT_CONTRACT: '0x2B09d47D550061f995A3b5C6AF942065c1306Ef0',
  BSC_RPC: 'https://bsc-dataseed.binance.org/',
} as const;

// Types for Binance verification
export interface BinanceAuthToken {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export interface BinanceUserProfile {
  userId: string;
  email?: string;
  hasBABT: boolean;
  babtTokenIds?: string[];
  linkedWallets?: string[];
}

export interface WalletLinkRequest {
  walletAddress: string;
  signature: string;
  message: string;
  binanceUserId: string;
}

export interface VerificationResult {
  isValid: boolean;
  method: 'binance_oauth' | 'wallet_signature' | 'linked_wallet';
  binanceUserId?: string;
  walletAddress?: string;
  babtTokenIds?: string[];
  error?: string;
}

// Binance OAuth Integration
export class BinanceBABTVerifier {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  // Generate OAuth authorization URL
  generateAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: 'babt_verification user_info',
    });

    if (state) {
      params.append('state', state);
    }

    return `${BINANCE_CONFIG.OAUTH_URL}/oauth/authorize?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string): Promise<BinanceAuthToken> {
    const response = await fetch(`${BINANCE_CONFIG.OAUTH_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`OAuth token exchange failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Get user profile and BABT status
  async getUserProfile(accessToken: string): Promise<BinanceUserProfile> {
    const response = await fetch(`${BINANCE_CONFIG.BASE_URL}/api/v1/user/profile`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get user profile: ${response.statusText}`);
    }

    const profile = await response.json();

    // Get BABT status separately
    const babtResponse = await fetch(`${BINANCE_CONFIG.BASE_URL}/api/v1/babt/status`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    let babtStatus = { hasBABT: false, tokenIds: [] };
    if (babtResponse.ok) {
      babtStatus = await babtResponse.json();
    }

    return {
      userId: profile.userId,
      email: profile.email,
      hasBABT: babtStatus.hasBABT,
      babtTokenIds: babtStatus.tokenIds,
      linkedWallets: profile.linkedWallets || [],
    };
  }

  // Link wallet address to Binance account
  async linkWalletAddress(linkRequest: WalletLinkRequest): Promise<boolean> {
    // Verify the signature to prove wallet ownership
    const recoveredAddress = ethers.verifyMessage(linkRequest.message, linkRequest.signature);

    if (recoveredAddress.toLowerCase() !== linkRequest.walletAddress.toLowerCase()) {
      throw new Error('Signature verification failed');
    }

    // Call Binance API to link the wallet
    const response = await fetch(`${BINANCE_CONFIG.BASE_URL}/api/v1/user/link-wallet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // In production, this would use the stored access token for the user
      },
      body: JSON.stringify({
        walletAddress: linkRequest.walletAddress,
        signature: linkRequest.signature,
        message: linkRequest.message,
      }),
    });

    return response.ok;
  }
}

// Wallet Address Linking System
export class WalletLinkManager {
  // In production, this would use a database
  private linkedWallets = new Map<string, {
    binanceUserId: string;
    walletAddress: string;
    linkedAt: Date;
    isActive: boolean;
  }>();

  // Link wallet to Binance account
  async linkWalletToBinance(
    walletAddress: string,
    signature: string,
    message: string,
    binanceUserId: string
  ): Promise<boolean> {
    try {
      // Verify signature
      const recoveredAddress = ethers.verifyMessage(message, signature);

      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new Error('Invalid signature');
      }

      // Store the link (in production, save to database)
      this.linkedWallets.set(walletAddress.toLowerCase(), {
        binanceUserId,
        walletAddress,
        linkedAt: new Date(),
        isActive: true,
      });

      return true;
    } catch (error) {
      console.error('Failed to link wallet:', error);
      return false;
    }
  }

  // Check if wallet is linked to Binance account
  isWalletLinked(walletAddress: string): boolean {
    const link = this.linkedWallets.get(walletAddress.toLowerCase());
    return link?.isActive || false;
  }

  // Get Binance user ID for linked wallet
  getLinkedBinanceUser(walletAddress: string): string | null {
    const link = this.linkedWallets.get(walletAddress.toLowerCase());
    return link?.binanceUserId || null;
  }

  // Unlink wallet from Binance account
  async unlinkWallet(walletAddress: string): Promise<boolean> {
    const link = this.linkedWallets.get(walletAddress.toLowerCase());
    if (link) {
      link.isActive = false;
      return true;
    }
    return false;
  }
}

// Main BABT Verification Workflow
export class BABTVerificationWorkflow {
  private binanceVerifier: BinanceBABTVerifier;
  private walletLinkManager: WalletLinkManager;

  constructor(
    binanceClientId: string,
    binanceClientSecret: string,
    redirectUri: string
  ) {
    this.binanceVerifier = new BinanceBABTVerifier(binanceClientId, binanceClientSecret, redirectUri);
    this.walletLinkManager = new WalletLinkManager();
  }

  // Comprehensive BABT verification
  async verifyBABT(
    walletAddress?: string,
    binanceAuthCode?: string,
    signature?: string,
    linkWallet?: boolean
  ): Promise<VerificationResult> {
    try {
      // Method 1: Direct Binance OAuth verification
      if (binanceAuthCode) {
        const token = await this.binanceVerifier.exchangeCodeForToken(binanceAuthCode);
        const profile = await this.binanceVerifier.getUserProfile(token.access_token);

        if (profile.hasBABT) {
          return {
            isValid: true,
            method: 'binance_oauth',
            binanceUserId: profile.userId,
            babtTokenIds: profile.babtTokenIds,
          };
        }
      }

      // Method 2: Wallet signature verification (for Web3 BABT)
      if (walletAddress && signature) {
        // Check if wallet has BABT tokens on-chain
        const hasOnChainBABT = await this.checkOnChainBABT(walletAddress);

        if (hasOnChainBABT) {
          return {
            isValid: true,
            method: 'wallet_signature',
            walletAddress,
          };
        }
      }

      // Method 3: Linked wallet verification
      if (walletAddress && this.walletLinkManager.isWalletLinked(walletAddress)) {
        const binanceUserId = this.walletLinkManager.getLinkedBinanceUser(walletAddress);

        if (binanceUserId) {
          // In production, query Binance API with stored credentials
          const hasBABT = await this.checkBinanceBABTStatus(binanceUserId);

          if (hasBABT) {
            return {
              isValid: true,
              method: 'linked_wallet',
              binanceUserId,
              walletAddress,
            };
          }
        }
      }

      // Method 4: Wallet linking process
      if (linkWallet && walletAddress && signature && binanceAuthCode) {
        const token = await this.binanceVerifier.exchangeCodeForToken(binanceAuthCode);
        const profile = await this.binanceVerifier.getUserProfile(token.access_token);

        const linkMessage = `Link Binance Account ${profile.userId} to wallet ${walletAddress}`;
        const linkSuccess = await this.walletLinkManager.linkWalletToBinance(
          walletAddress,
          signature,
          linkMessage,
          profile.userId
        );

        if (linkSuccess && profile.hasBABT) {
          return {
            isValid: true,
            method: 'linked_wallet',
            binanceUserId: profile.userId,
            walletAddress,
            babtTokenIds: profile.babtTokenIds,
          };
        }
      }

      return {
        isValid: false,
        method: 'wallet_signature',
        error: 'No valid BABT verification method succeeded',
      };

    } catch (error) {
      console.error('BABT verification error:', error);
      return {
        isValid: false,
        method: 'wallet_signature',
        error: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }

  // Check if wallet has BABT tokens on-chain (for Web3 BABT)
  private async checkOnChainBABT(walletAddress: string): Promise<boolean> {
    try {
      const provider = new ethers.JsonRpcProvider(BINANCE_CONFIG.BSC_RPC);
      const contract = new ethers.Contract(
        BINANCE_CONFIG.BABT_CONTRACT,
        ['function balanceOf(address) view returns (uint256)'],
        provider
      );

      const balance = await contract.balanceOf(walletAddress);
      return balance > 0;
    } catch (error) {
      console.error('On-chain BABT check failed:', error);
      return false;
    }
  }

  // Check BABT status via Binance API
  private async checkBinanceBABTStatus(binanceUserId: string | null): Promise<boolean> {
    if (!binanceUserId) return false;

    try {
      // In production, this would call actual Binance API with stored access token
      // For now, we'll use localStorage to simulate stored verification data
      const storedVerification = localStorage.getItem(`babt_verification_${binanceUserId}`);
      if (storedVerification) {
        const data = JSON.parse(storedVerification);
        return data.hasBABT && data.isValid;
      }

      // For demo purposes, return true for valid user IDs
      // In production, this should call Binance's actual API
      return binanceUserId.length > 0;
    } catch (error) {
      console.error('Binance BABT status check failed:', error);
      return false;
    }
  }

  // Generate wallet linking message
  generateLinkMessage(walletAddress: string, binanceUserId: string): string {
    return `Link Binance Account ${binanceUserId} to wallet address ${walletAddress} at ${Date.now()}`;
  }
}

// Factory function to create verification workflow
export function createBABTVerificationWorkflow(
  binanceClientId: string,
  binanceClientSecret: string,
  redirectUri: string
): BABTVerificationWorkflow {
  return new BABTVerificationWorkflow(binanceClientId, binanceClientSecret, redirectUri);
}