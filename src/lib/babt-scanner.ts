"use client";

export interface BABTokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  contractCreator: string;
  creationDate: string;
  isVerified: boolean;
  description?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    telegram?: string;
    discord?: string;
  };
}

export interface TokenBalance {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  balance: string;
  decimals: number;
  usdValue?: string;
  logoURI?: string;
}

export interface WalletPortfolio {
  address: string;
  bnbBalance: string;
  bnbValue: string;
  tokenBalances: TokenBalance[];
  totalValue: string;
  tokenCount: number;
}

export interface SmartContractInfo {
  address: string;
  isContract: boolean;
  bytecode: string;
  sourceCode?: string;
  abi?: any[];
  contractName?: string;
  compilerVersion?: string;
  optimization?: boolean;
  runs?: number;
  constructorArguments?: string;
  libraries?: Record<string, string>;
  license?: string;
}

/**
 * BABT Scanner Service - Updated for Etherscan API V2
 *
 * This service has been migrated from BscScan API v1 to Etherscan API V2
 * which provides unified access to 50+ EVM chains with a single API key.
 *
 * Key improvements in API V2:
 * - Single API key for multiple chains
 * - Enhanced rate limits and reliability
 * - Improved response formats
 * - Better documentation and support
 */
export class BABTScannerService {
   private readonly ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY || 'demo';
   private readonly BSC_BASE_URL = 'https://api.bscscan.com/api'; // Legacy V1 endpoint
   private readonly ETHERSCAN_BASE_URL = 'https://api.etherscan.io/v2/api'; // New V2 endpoint

   // Chain ID for BSC in Etherscan API V2
   private readonly BSC_CHAIN_ID = '56';

   // Whitelist of known BABT contract addresses
   private readonly BABT_CONTRACT_WHITELIST = [
     '0x2B09d47D550061f995A3b5C6AF7d13f3a81E9C23', // Official Binance BABT (BSC)
     '0x1c7e83f8c58165c518e2ff2d1c7e4b5d4b6e6a5', // Alternative BABT
     '0x3a6d8ca21d1cf76f653a67577fa0d27453350dd', // Test BABT
   ];

  /**
   * Scan and analyze a BAB token contract
   */
  async scanBABToken(contractAddress: string): Promise<BABTokenInfo> {
    try {
      // Verify it's a valid BAB token contract
      const isBABT = await this.verifyBABTContract(contractAddress);
      if (!isBABT) {
        throw new Error('Address is not a valid BAB token contract');
      }

      // Get contract information using Etherscan API V2
      const [basicInfo, sourceCode] = await Promise.all([
        this.getTokenBasicInfo(contractAddress),
        this.getContractSourceCode(contractAddress)
      ]);

      return {
        address: contractAddress,
        name: basicInfo.name || 'Unknown',
        symbol: basicInfo.symbol || 'UNKNOWN',
        decimals: basicInfo.decimals || 18,
        totalSupply: basicInfo.totalSupply || '0',
        contractCreator: basicInfo.contractCreator || 'Unknown',
        creationDate: basicInfo.creationDate || 'Unknown',
        isVerified: !!sourceCode,
        description: await this.getTokenDescription(contractAddress),
        website: await this.getTokenWebsite(contractAddress),
        socialLinks: await this.getTokenSocialLinks(contractAddress)
      };
    } catch (error) {
      console.error('Error scanning BAB token:', error);
      throw new Error(`Failed to scan BAB token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
    * Get wallet portfolio including BAB tokens
    */
  async getWalletPortfolio(walletAddress: string): Promise<WalletPortfolio> {
    try {
      const [bnbBalance, tokenBalances] = await Promise.all([
        this.getBNBBalance(walletAddress),
        this.getTokenBalances(walletAddress)
      ]);

      const bnbValue = await this.getBNBPrice() * parseFloat(bnbBalance);
      const totalTokenValue = tokenBalances.reduce((sum, token) =>
        sum + (parseFloat(token.usdValue || '0')), 0
      );

      return {
        address: walletAddress,
        bnbBalance,
        bnbValue: `$${bnbValue.toFixed(2)}`,
        tokenBalances,
        totalValue: `$${(bnbValue + totalTokenValue).toFixed(2)}`,
        tokenCount: tokenBalances.length
      };
    } catch (error) {
      console.error('Error getting wallet portfolio:', error);
      throw new Error(`Failed to get wallet portfolio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
    * Analyze smart contract for BAB token characteristics
    */
  async analyzeSmartContract(contractAddress: string): Promise<SmartContractInfo> {
    try {
      const [isContract, bytecode] = await Promise.all([
        this.isContractAddress(contractAddress),
        this.getContractBytecode(contractAddress)
      ]);

      if (!isContract) {
        throw new Error('Address is not a smart contract');
      }

      const sourceCode = await this.getContractSourceCode(contractAddress);

      return {
        address: contractAddress,
        isContract: true,
        bytecode,
        sourceCode,
        abi: sourceCode ? await this.extractABI(sourceCode) : undefined,
        contractName: sourceCode ? await this.extractContractName(sourceCode) : undefined,
        compilerVersion: sourceCode ? await this.extractCompilerVersion(sourceCode) : undefined,
        optimization: sourceCode ? await this.extractOptimization(sourceCode) : undefined,
        constructorArguments: sourceCode ? await this.extractConstructorArgs(sourceCode) : undefined,
        libraries: sourceCode ? await this.extractLibraries(sourceCode) : undefined,
        license: sourceCode ? await this.extractLicense(sourceCode) : undefined
      };
    } catch (error) {
      console.error('Error analyzing smart contract:', error);
      throw new Error(`Failed to analyze smart contract: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
    * Verify if contract is a BAB token
    */
   private async verifyBABTContract(contractAddress: string): Promise<boolean> {
     try {
       // First, check if contract is in our whitelist
       if (this.BABT_CONTRACT_WHITELIST.includes(contractAddress.toLowerCase())) {
         console.log('✅ Address found in whitelist:', contractAddress);
         return true;
       }

       // If not in whitelist, verify it's a valid contract first
       console.log('🔍 Checking if address is a contract:', contractAddress);
       const isContract = await this.isContractAddress(contractAddress);

       if (!isContract) {
         console.log('❌ Address is not a contract:', contractAddress);
         return false;
       }

       // Then check source code for BAB token characteristics using Etherscan API V2
       const response = await fetch(
         `${this.ETHERSCAN_BASE_URL}?chainId=${this.BSC_CHAIN_ID}&module=contract&action=getsourcecode&address=${contractAddress}&apikey=${this.ETHERSCAN_API_KEY}`
       );
       const data = await response.json();

       if (data.status === '1' && data.result && data.result.length > 0) {
         const sourceCode = data.result[0].SourceCode || '';
         return this.checkBABTCharacteristics(sourceCode);
       }

       // Fallback to BSCScan V1 if V2 fails
       const fallbackResponse = await fetch(
         `${this.BSC_BASE_URL}?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${this.ETHERSCAN_API_KEY}`
       );
       const fallbackData = await fallbackResponse.json();

       if (fallbackData.status === '1' && fallbackData.result[0]) {
         const sourceCode = fallbackData.result[0].SourceCode || '';
         return this.checkBABTCharacteristics(sourceCode);
       }

       // If no source code available, assume it's not a BABT contract
       return false;
     } catch (error) {
       console.error('Error verifying BABT contract:', error);
       return false;
     }
   }

  /**
   * Check if source code contains BAB token characteristics
   */
  private checkBABTCharacteristics(sourceCode: string): boolean {
    // If source code is empty or not available, we can't verify characteristics
    if (!sourceCode || sourceCode.trim() === '') {
      return false;
    }

    const babtIndicators = [
      'BABT',
      'babt',
      'Binance Account Bound',
      'Account Bound Token',
      'Soulbound',
      'SBT',
      'Non-transferable',
      'Binance Smart Chain',
      'BSC',
      'Account Bound',
      'bound token',
      'binance',
      'soul bound',
      'non transferable'
    ];

    const lowerSource = sourceCode.toLowerCase();
    return babtIndicators.some(indicator => lowerSource.includes(indicator.toLowerCase()));
  }

  /**
   * Get basic token information
   */
  private async getTokenBasicInfo(contractAddress: string): Promise<Partial<BABTokenInfo>> {
    try {
      // Use Etherscan API V2 for BSC (chainId: 56)
      const response = await fetch(
        `${this.ETHERSCAN_BASE_URL}?chainId=${this.BSC_CHAIN_ID}&module=token&action=tokeninfo&contractaddress=${contractAddress}&apikey=${this.ETHERSCAN_API_KEY}`
      );
      const data = await response.json();

      if (data.status === '1' && data.result && data.result.length > 0) {
        const token = data.result[0];
        return {
          address: contractAddress,
          name: token.name || 'Unknown',
          symbol: token.symbol || 'UNKNOWN',
          decimals: parseInt(token.decimals || '18'),
          totalSupply: token.totalSupply || '0'
        };
      }

      // Fallback to BSCScan V1 API if V2 fails
      const fallbackResponse = await fetch(
        `${this.BSC_BASE_URL}?module=token&action=tokeninfo&contractaddress=${contractAddress}&apikey=${this.ETHERSCAN_API_KEY}`
      );
      const fallbackData = await fallbackResponse.json();

      if (fallbackData.status === '1' && fallbackData.result) {
        const token = fallbackData.result;
        return {
          address: contractAddress,
          name: token.name || 'Unknown',
          symbol: token.symbol || 'UNKNOWN',
          decimals: parseInt(token.decimals || '18'),
          totalSupply: token.totalSupply || '0'
        };
      }

      // Final fallback to contract info
      return await this.getContractInfo(contractAddress);
    } catch (error) {
      console.error('Error getting token basic info:', error);
      throw error;
    }
  }

  /**
   * Get contract information
   */
  private async getContractInfo(contractAddress: string): Promise<Partial<BABTokenInfo>> {
    try {
      const response = await fetch(
        `${this.BSC_BASE_URL}?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${this.ETHERSCAN_API_KEY}`
      );
      const data = await response.json();

      if (data.status === '1' && data.result[0]) {
        const contract = data.result[0];
        return {
          address: contractAddress,
          contractCreator: contract.ContractCreator || 'Unknown',
          creationDate: await this.getContractCreationDate(contractAddress)
        };
      }

      return {
        address: contractAddress,
        contractCreator: 'Unknown',
        creationDate: 'Unknown'
      };
    } catch (error) {
      console.error('Error getting contract info:', error);
      throw error;
    }
  }

  /**
   * Get BNB balance for address
   */
  private async getBNBBalance(address: string): Promise<string> {
    try {
      // Use Etherscan API V2 for BSC
      const response = await fetch(
        `${this.ETHERSCAN_BASE_URL}?chainId=${this.BSC_CHAIN_ID}&module=account&action=balance&address=${address}&apikey=${this.ETHERSCAN_API_KEY}`
      );
      const data = await response.json();

      if (data.status === '1') {
        return (parseInt(data.result) / 1e18).toFixed(4);
      }

      // Fallback to BSCScan V1
      const fallbackResponse = await fetch(
        `${this.BSC_BASE_URL}?module=account&action=balance&address=${address}&apikey=${this.ETHERSCAN_API_KEY}`
      );
      const fallbackData = await fallbackResponse.json();

      if (fallbackData.status === '1') {
        return (parseInt(fallbackData.result) / 1e18).toFixed(4);
      }
      return '0';
    } catch (error) {
      console.error('Error getting BNB balance:', error);
      return '0';
    }
  }

  /**
   * Get token balances for address
   */
  private async getTokenBalances(address: string): Promise<TokenBalance[]> {
    try {
      // Use Etherscan API V2 for BSC
      const response = await fetch(
        `${this.ETHERSCAN_BASE_URL}?chainId=${this.BSC_CHAIN_ID}&module=account&action=tokentx&address=${address}&startblock=0&endblock=999999999&sort=desc&apikey=${this.ETHERSCAN_API_KEY}`
      );
      const data = await response.json();

      if (data.status === '1' && data.result) {
        // Process token transactions to extract unique tokens and balances
        const tokenMap = new Map<string, any>();

        for (const tx of data.result.slice(0, 100)) { // Limit to recent 100 transactions
          const tokenAddress = tx.contractAddress;
          if (!tokenMap.has(tokenAddress)) {
            tokenMap.set(tokenAddress, {
              tokenAddress,
              tokenName: tx.tokenName,
              tokenSymbol: tx.tokenSymbol,
              balance: '0',
              decimals: parseInt(tx.tokenDecimal || '18')
            });
          }
        }

        // Get current balances for each token
        const balances: any[] = [];
        for (const [tokenAddress, tokenInfo] of tokenMap) {
          try {
            const balance = await this.getTokenBalance(address, tokenAddress);
            if (parseFloat(balance) > 0) {
              balances.push({
                ...tokenInfo,
                balance,
                usdValue: await this.getTokenPrice(tokenAddress, balance)
              });
            }
          } catch (error) {
            console.warn(`Error getting balance for token ${tokenAddress}:`, error);
          }
        }

        return balances;
      }

      // Fallback to BSCScan V1
      const fallbackResponse = await fetch(
        `${this.BSC_BASE_URL}?module=account&action=tokentx&address=${address}&startblock=0&endblock=999999999&sort=desc&apikey=${this.ETHERSCAN_API_KEY}`
      );
      const fallbackData = await fallbackResponse.json();

      if (fallbackData.status === '1' && fallbackData.result) {
        const tokenMap = new Map<string, any>();

        for (const tx of fallbackData.result.slice(0, 100)) {
          const tokenAddress = tx.contractAddress;
          if (!tokenMap.has(tokenAddress)) {
            tokenMap.set(tokenAddress, {
              tokenAddress,
              tokenName: tx.tokenName,
              tokenSymbol: tx.tokenSymbol,
              balance: '0',
              decimals: parseInt(tx.tokenDecimal || '18')
            });
          }
        }

        const balances: any[] = [];
        for (const [tokenAddress, tokenInfo] of tokenMap) {
          try {
            const balance = await this.getTokenBalance(address, tokenAddress);
            if (parseFloat(balance) > 0) {
              balances.push({
                ...tokenInfo,
                balance,
                usdValue: await this.getTokenPrice(tokenAddress, balance)
              });
            }
          } catch (error) {
            console.warn(`Error getting balance for token ${tokenAddress}:`, error);
          }
        }

        return balances;
      }
      return [];
    } catch (error) {
      console.error('Error getting token balances:', error);
      return [];
    }
  }

  /**
   * Get token balance for specific token
   */
  private async getTokenBalance(walletAddress: string, tokenAddress: string): Promise<string> {
    try {
      // Use Etherscan API V2 for BSC
      const response = await fetch(
        `${this.ETHERSCAN_BASE_URL}?chainId=${this.BSC_CHAIN_ID}&module=account&action=tokenbalance&contractaddress=${tokenAddress}&address=${walletAddress}&apikey=${this.ETHERSCAN_API_KEY}`
      );
      const data = await response.json();

      if (data.status === '1') {
        // Get token decimals to format balance correctly
        const decimals = await this.getTokenDecimals(tokenAddress);
        const balance = parseInt(data.result) / Math.pow(10, decimals);
        return balance.toFixed(4);
      }

      // Fallback to BSCScan V1
      const fallbackResponse = await fetch(
        `${this.BSC_BASE_URL}?module=account&action=tokenbalance&contractaddress=${tokenAddress}&address=${walletAddress}&apikey=${this.ETHERSCAN_API_KEY}`
      );
      const fallbackData = await fallbackResponse.json();

      if (fallbackData.status === '1') {
        const decimals = await this.getTokenDecimals(tokenAddress);
        const balance = parseInt(fallbackData.result) / Math.pow(10, decimals);
        return balance.toFixed(4);
      }
      return '0';
    } catch (error) {
      console.error('Error getting token balance:', error);
      return '0';
    }
  }

  /**
   * Get token decimals
   */
  private async getTokenDecimals(tokenAddress: string): Promise<number> {
    try {
      // Use Etherscan API V2 for BSC
      const response = await fetch(
        `${this.ETHERSCAN_BASE_URL}?chainId=${this.BSC_CHAIN_ID}&module=token&action=tokeninfo&contractaddress=${tokenAddress}&apikey=${this.ETHERSCAN_API_KEY}`
      );
      const data = await response.json();

      if (data.status === '1' && data.result && data.result.length > 0) {
        return parseInt(data.result[0].decimals || '18');
      }

      // Fallback to BSCScan V1
      const fallbackResponse = await fetch(
        `${this.BSC_BASE_URL}?module=token&action=tokeninfo&contractaddress=${tokenAddress}&apikey=${this.ETHERSCAN_API_KEY}`
      );
      const fallbackData = await fallbackResponse.json();

      if (fallbackData.status === '1' && fallbackData.result) {
        return parseInt(fallbackData.result.decimals || '18');
      }
      return 18;
    } catch (error) {
      console.error('Error getting token decimals:', error);
      return 18;
    }
  }

  /**
   * Get current BNB price in USD
   */
  private async getBNBPrice(): Promise<number> {
    try {
      const response = await fetch(
        'https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT'
      );
      const data = await response.json();

      return parseFloat(data.price || '300'); // Default to $300 if API fails
    } catch (error) {
      console.error('Error getting BNB price:', error);
      return 300; // Default fallback price
    }
  }

  /**
   * Get token price in USD
   */
  private async getTokenPrice(tokenAddress: string, balance: string): Promise<string> {
    try {
      // For now, return estimated value based on token type
      // In production, you'd want to integrate with price APIs like CoinGecko
      const estimatedPrice = await this.estimateTokenValue(tokenAddress);
      return (parseFloat(balance) * estimatedPrice).toFixed(2);
    } catch (error) {
      console.error('Error getting token price:', error);
      return '0';
    }
  }

  /**
   * Estimate token value based on various factors
   */
  private async estimateTokenValue(tokenAddress: string): Promise<number> {
    // This is a simplified estimation - in production you'd use real price data
    const response = await fetch(
      `${this.BSC_BASE_URL}?module=token&action=tokeninfo&contractaddress=${tokenAddress}&apikey=${this.ETHERSCAN_API_KEY}`
    );
    const data = await response.json();

    if (data.status === '1' && data.result) {
      const token = data.result;
      // Basic estimation based on token properties
      if (token.symbol === 'BABT' || token.name?.includes('BAB')) {
        return 50; // Estimated BAB token value
      }
      // Add more sophisticated pricing logic here
    }

    return 1; // Default estimation
  }

  /**
   * Get contract bytecode
   */
  private async getContractBytecode(address: string): Promise<string> {
    try {
      // Use Etherscan API V2 for BSC
      const response = await fetch(
        `${this.ETHERSCAN_BASE_URL}?chainId=${this.BSC_CHAIN_ID}&module=proxy&action=eth_getCode&address=${address}&apikey=${this.ETHERSCAN_API_KEY}`
      );
      const data = await response.json();
      return data.result || '';
    } catch (error) {
      console.error('Error getting contract bytecode:', error);
      return '';
    }
  }

  /**
   * Get contract source code
   */
  private async getContractSourceCode(address: string): Promise<string> {
    try {
      // Use Etherscan API V2 for BSC
      const response = await fetch(
        `${this.ETHERSCAN_BASE_URL}?chainId=${this.BSC_CHAIN_ID}&module=contract&action=getsourcecode&address=${address}&apikey=${this.ETHERSCAN_API_KEY}`
      );
      const data = await response.json();

      if (data.status === '1' && data.result && data.result.length > 0) {
        return data.result[0].SourceCode || '';
      }

      // Fallback to BSCScan V1 API if V2 fails
      const fallbackResponse = await fetch(
        `${this.BSC_BASE_URL}?module=contract&action=getsourcecode&address=${address}&apikey=${this.ETHERSCAN_API_KEY}`
      );
      const fallbackData = await fallbackResponse.json();

      if (fallbackData.status === '1' && fallbackData.result[0]) {
        return fallbackData.result[0].SourceCode || '';
      }
      return '';
    } catch (error) {
      console.error('Error getting contract source code:', error);
      return '';
    }
  }

  /**
   * Check if address is a contract
   */
  private async isContractAddress(address: string): Promise<boolean> {
    try {
      // Use Etherscan API V2 for BSC
      const response = await fetch(
        `${this.ETHERSCAN_BASE_URL}?chainId=${this.BSC_CHAIN_ID}&module=proxy&action=eth_getCode&address=${address}&apikey=${this.ETHERSCAN_API_KEY}`
      );
      const data = await response.json();

      if (data.result && data.result !== '0x') {
        console.log('✅ Address is a valid contract:', address);
        return true;
      }

      // Fallback to BSCScan V1 API if V2 fails
      const fallbackResponse = await fetch(
        `${this.BSC_BASE_URL}?module=proxy&action=eth_getCode&address=${address}&apikey=${this.ETHERSCAN_API_KEY}`
      );
      const fallbackData = await fallbackResponse.json();

      if (fallbackData.result && fallbackData.result !== '0x') {
        console.log('✅ Address is a valid contract (V1 fallback):', address);
        return true;
      }

      console.log('❌ Address is not a contract or not found:', address, data);
      return false;
    } catch (error) {
      console.error('Error checking if address is contract:', error);
      return false;
    }
  }

  /**
   * Get contract creation date
   */
  private async getContractCreationDate(address: string): Promise<string> {
    try {
      const response = await fetch(
        `${this.BSC_BASE_URL}?module=contract&action=getcontractcreation&contractaddresses=${address}&apikey=${this.ETHERSCAN_API_KEY}`
      );
      const data = await response.json();

      if (data.status === '1' && data.result[0]) {
        return data.result[0].txHash || 'Unknown';
      }
      return 'Unknown';
    } catch (error) {
      console.error('Error getting contract creation date:', error);
      return 'Unknown';
    }
  }

  /**
   * Extract ABI from source code
   */
  private async extractABI(sourceCode: string): Promise<any[]> {
    try {
      // This is a simplified ABI extraction
      // In production, you'd want more sophisticated parsing
      const abiMatch = sourceCode.match(/\[[\s\S]*\]/);
      if (abiMatch) {
        return JSON.parse(abiMatch[0]);
      }
      return [];
    } catch (error) {
      console.error('Error extracting ABI:', error);
      return [];
    }
  }

  /**
   * Extract contract name from source code
   */
  private async extractContractName(sourceCode: string): Promise<string> {
    try {
      const nameMatch = sourceCode.match(/contract\s+(\w+)/);
      return nameMatch ? nameMatch[1] : 'Unknown';
    } catch (error) {
      console.error('Error extracting contract name:', error);
      return 'Unknown';
    }
  }

  /**
   * Extract compiler version from source code
   */
  private async extractCompilerVersion(sourceCode: string): Promise<string> {
    try {
      const versionMatch = sourceCode.match(/pragma solidity\s+[\^\~]*([^;]+);/);
      return versionMatch ? versionMatch[1] : 'Unknown';
    } catch (error) {
      console.error('Error extracting compiler version:', error);
      return 'Unknown';
    }
  }

  /**
   * Extract optimization settings
   */
  private async extractOptimization(sourceCode: string): Promise<boolean> {
    try {
      return sourceCode.toLowerCase().includes('optimizer') || sourceCode.toLowerCase().includes('optimization');
    } catch (error) {
      console.error('Error extracting optimization:', error);
      return false;
    }
  }

  /**
   * Extract constructor arguments
   */
  private async extractConstructorArgs(sourceCode: string): Promise<string> {
    try {
      const constructorMatch = sourceCode.match(/constructor\s*\(([^)]*)\)/);
      return constructorMatch ? constructorMatch[1] : '';
    } catch (error) {
      console.error('Error extracting constructor args:', error);
      return '';
    }
  }

  /**
   * Extract libraries
   */
  private async extractLibraries(sourceCode: string): Promise<Record<string, string>> {
    try {
      const libraries: Record<string, string> = {};
      const libraryMatches = sourceCode.match(/library\s+(\w+)/g);
      if (libraryMatches) {
        libraryMatches.forEach(match => {
          const libName = match.replace('library ', '');
          libraries[libName] = '0x0000000000000000000000000000000000000000'; // Placeholder
        });
      }
      return libraries;
    } catch (error) {
      console.error('Error extracting libraries:', error);
      return {};
    }
  }

  /**
   * Extract license information
   */
  private async extractLicense(sourceCode: string): Promise<string> {
    try {
      const licenseMatch = sourceCode.match(/\/\/\s*SPDX-License-Identifier:\s*([^\n]+)/);
      return licenseMatch ? licenseMatch[1] : 'Unknown';
    } catch (error) {
      console.error('Error extracting license:', error);
      return 'Unknown';
    }
  }

  /**
   * Get token description (placeholder - would need additional API)
   */
  private async getTokenDescription(contractAddress: string): Promise<string> {
    // This would typically come from token metadata APIs
    return 'Binance Account Bound Token (BABT) - A soulbound token representing verified Binance user identity.';
  }

  /**
   * Get token website (placeholder - would need additional API)
   */
  private async getTokenWebsite(contractAddress: string): Promise<string> {
    // This would typically come from token metadata APIs
    return 'https://www.binance.com/en/support/announcement/binance-account-bound-babt-token';
  }

  /**
   * Get token social links (placeholder - would need additional API)
   */
  private async getTokenSocialLinks(contractAddress: string): Promise<{ twitter?: string; telegram?: string; discord?: string }> {
    return {
      twitter: 'https://twitter.com/binance',
      telegram: 'https://t.me/binance_announcements'
    };
  }
}

// Export singleton instance
export const babtScanner = new BABTScannerService();