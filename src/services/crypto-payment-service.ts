import { ethers } from 'ethers'
import { createClient } from '@/lib/supabase-client'

// Supported networks
export const SUPPORTED_NETWORKS = {
  BSC: {
    chainId: '0x38', // 56 in hex
    chainName: 'Binance Smart Chain',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com/'],
  },
  ETHEREUM: {
    chainId: '0x1', // 1 in hex
    chainName: 'Ethereum Mainnet',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.infura.io/v3/YOUR_INFURA_KEY'],
    blockExplorerUrls: ['https://etherscan.io/'],
  },
  POLYGON: {
    chainId: '0x89', // 137 in hex
    chainName: 'Polygon Mainnet',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com/'],
  },
} as const

export type NetworkKey = keyof typeof SUPPORTED_NETWORKS

// Payment service class
export class CryptoPaymentService {
  private supabase = createClient()

  // Connect to wallet and switch network
  async connectWallet(network: NetworkKey = 'BSC'): Promise<string | null> {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      throw new Error('MetaMask not installed')
    }

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum)

      // Request account access
      const accounts = await provider.send('eth_requestAccounts', [])
      const address = accounts[0]

      // Switch to desired network
      await this.switchNetwork(network)

      return address
    } catch (error) {
      console.error('Error connecting wallet:', error)
      throw error
    }
  }

  // Switch to specific network
  async switchNetwork(network: NetworkKey): Promise<void> {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      throw new Error('MetaMask not installed')
    }

    const networkConfig = SUPPORTED_NETWORKS[network]

    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig.chainId }],
      })
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig],
          })
        } catch (addError) {
          throw new Error('Failed to add network to MetaMask')
        }
      } else {
        throw switchError
      }
    }
  }

  // Generate payment address/QR code data
  async generatePaymentData(params: {
    amount: number
    currency: string
    recipientAddress: string
    network: NetworkKey
    memo?: string
  }): Promise<{
    paymentAddress: string
    qrCodeData: string
    estimatedGas: string
    networkFee: string
  }> {
    const { amount, currency, recipientAddress, network, memo } = params

    // In production, this would interact with your backend to generate a unique payment address
    // For now, we'll use the provided recipient address

    const qrCodeData = memo
      ? `${recipientAddress}?amount=${amount}&memo=${memo}`
      : `${recipientAddress}?amount=${amount}`

    return {
      paymentAddress: recipientAddress,
      qrCodeData,
      estimatedGas: '0.001', // Mock gas estimate
      networkFee: '0.001', // Mock network fee
    }
  }

  // Monitor transaction status
  async monitorTransaction(txHash: string, network: NetworkKey = 'BSC'): Promise<{
    status: 'pending' | 'confirmed' | 'failed'
    confirmations: number
    blockNumber?: number
    gasUsed?: string
    gasPrice?: string
  }> {
    try {
      const provider = new ethers.JsonRpcProvider(SUPPORTED_NETWORKS[network].rpcUrls[0])
      const receipt = await provider.getTransactionReceipt(txHash)

      if (!receipt) {
        return {
          status: 'pending',
          confirmations: 0,
        }
      }

      if (receipt.status === 1) {
        return {
          status: 'confirmed',
          confirmations: 1, // Simplified
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          gasPrice: receipt.gasPrice.toString(),
        }
      } else {
        return {
          status: 'failed',
          confirmations: 0,
        }
      }
    } catch (error) {
      console.error('Error monitoring transaction:', error)
      throw error
    }
  }

  // Process transaction completion
  async processTransactionCompletion(
    transactionId: string,
    txHash: string,
    status: 'confirmed' | 'failed'
  ): Promise<void> {
    try {
      const { error } = await (this.supabase as any)
        .from('transactions')
        .update({
          status,
          crypto_tx_hash: txHash,
          confirmed_at: status === 'confirmed' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error updating transaction:', error)
      throw error
    }
  }

  // Get transaction history for a user
  async getTransactionHistory(
    userId: string,
    userType: 'creator' | 'investor',
    limit: number = 20
  ): Promise<any[]> {
    try {
      const column = userType === 'investor' ? 'investor_id' : 'creator_id'

      const { data: transactions, error } = await (this.supabase as any)
        .from('transactions')
        .select(`
          *,
          match:matches!transactions_match_id_fkey(
            id,
            idea_id,
            offer_id
          )
        `)
        .eq(column, userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        throw error
      }

      return transactions || []
    } catch (error) {
      console.error('Error fetching transaction history:', error)
      return []
    }
  }

  // Calculate transaction fees
  calculateFees(amount: number, paymentMethod: 'crypto' | 'bank_transfer'): {
    networkFee: number
    platformFee: number
    total: number
  } {
    const platformFeeRate = 0.029 // 2.9% platform fee
    const networkFee = paymentMethod === 'crypto' ? 0.001 : 0 // Network fee in respective currency

    const platformFee = amount * platformFeeRate
    const total = amount + platformFee + networkFee

    return {
      networkFee,
      platformFee,
      total,
    }
  }
}

// Export singleton instance
export const cryptoPaymentService = new CryptoPaymentService()