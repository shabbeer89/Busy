"use client"

// Simple wallet utilities for basic Web3 integration
export interface WalletInfo {
  address: string
  chainId: number
  balance: string
  connected: boolean
  provider: string
}

export interface TransactionRequest {
  to: string
  value?: string
  data?: string
  gasLimit?: string
  gasPrice?: string
}

// Wallet utility functions
export const walletUtils = {
  // Check if browser has Web3 support
  hasWeb3Support: (): boolean => {
    return typeof window !== 'undefined' && !!(window as any).ethereum
  },

  // Connect to MetaMask or other Web3 wallet
  connectWallet: async (): Promise<WalletInfo | null> => {
    try {
      if (!walletUtils.hasWeb3Support()) {
        throw new Error('No Web3 wallet detected. Please install MetaMask.')
      }

      const ethereum = (window as any).ethereum

      // Request account access
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      const address = accounts[0]

      // Get balance
      const balanceHex = await ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      })

      const balance = (parseInt(balanceHex, 16) / 1e18).toFixed(4)

      // Get chain ID
      const chainIdHex = await ethereum.request({ method: 'eth_chainId' })
      const chainId = parseInt(chainIdHex, 16)

      return {
        address,
        chainId,
        balance,
        connected: true,
        provider: 'metamask',
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      return null
    }
  },

  // Send transaction
  sendTransaction: async (transaction: TransactionRequest): Promise<string | null> => {
    try {
      if (!walletUtils.hasWeb3Support()) {
        throw new Error('No wallet connected')
      }

      const ethereum = (window as any).ethereum

      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          to: transaction.to,
          value: transaction.value ? `0x${(parseFloat(transaction.value) * 1e18).toString(16)}` : undefined,
          data: transaction.data,
          gas: transaction.gasLimit || '0x5208', // 21000 gas
        }],
      })

      return txHash
    } catch (error) {
      console.error('Failed to send transaction:', error)
      return null
    }
  },

  // Sign message
  signMessage: async (message: string): Promise<string | null> => {
    try {
      if (!walletUtils.hasWeb3Support()) {
        throw new Error('No wallet connected')
      }

      const ethereum = (window as any).ethereum
      const accounts = await ethereum.request({ method: 'eth_accounts' })

      if (accounts.length === 0) {
        throw new Error('No accounts connected')
      }

      const signature = await ethereum.request({
        method: 'personal_sign',
        params: [message, accounts[0]],
      })

      return signature
    } catch (error) {
      console.error('Failed to sign message:', error)
      return null
    }
  },

  // Switch network
  switchNetwork: async (chainId: number): Promise<boolean> => {
    try {
      if (!walletUtils.hasWeb3Support()) {
        return false
      }

      const ethereum = (window as any).ethereum

      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      })

      return true
    } catch (error) {
      console.error('Failed to switch network:', error)
      return false
    }
  },

  // Get supported networks
  getSupportedNetworks: () => [
    {
      id: 1,
      name: 'Ethereum',
      symbol: 'ETH',
      rpcUrl: process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/your_project_id'
    },
    {
      id: 137,
      name: 'Polygon',
      symbol: 'MATIC',
      rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon-mainnet.infura.io/v3/your_project_id'
    },
    {
      id: 56,
      name: 'BSC',
      symbol: 'BNB',
      rpcUrl: process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed.binance.org/'
    },
  ],
}