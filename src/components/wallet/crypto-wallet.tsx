"use client"

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Layout } from '@/components/responsive/layout'
import { cn } from '@/lib/utils'
import { walletUtils, type WalletInfo } from '@/lib/crypto/wallet-manager'
import {
  Wallet,
  Copy,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Shield,
  Zap,
} from 'lucide-react'

interface CryptoWalletProps {
  className?: string
}

interface WalletState {
  connected: boolean
  address: string | null
  chainId: number | null
  balance: string | null
  provider: string
  isLoading: boolean
  error: string | null
}

export function CryptoWallet({ className }: CryptoWalletProps) {
  const [walletState, setWalletState] = useState<WalletState>({
    connected: false,
    address: null,
    balance: null,
    chainId: null,
    provider: 'none',
    isLoading: false,
    error: null,
  })

  const [showFullAddress, setShowFullAddress] = useState(false)

  // Check if browser has Web3 support
  const hasWeb3Support = walletUtils.hasWeb3Support()

  const connectWallet = async () => {
    if (!hasWeb3Support) {
      setWalletState(prev => ({
        ...prev,
        provider: 'none',
        error: 'No Web3 wallet detected. Please install MetaMask or another Web3 wallet.'
      }))
      return
    }

    setWalletState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const walletInfo = await walletUtils.connectWallet()

      if (walletInfo) {
        setWalletState({
          connected: walletInfo.connected,
          address: walletInfo.address,
          balance: walletInfo.balance,
          chainId: walletInfo.chainId,
          provider: walletInfo.provider,
          isLoading: false,
          error: null,
        })
      } else {
        throw new Error('Failed to connect wallet')
      }

    } catch (error) {
      console.error('Failed to connect wallet:', error)
      setWalletState(prev => ({
        ...prev,
        provider: 'none',
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to connect wallet'
      }))
    }
  }

  const disconnectWallet = () => {
    setWalletState({
      connected: false,
      address: null,
      balance: null,
      chainId: null,
      provider: 'none',
      isLoading: false,
      error: null,
    })
  }

  const copyAddress = async () => {
    if (walletState.address) {
      try {
        await navigator.clipboard.writeText(walletState.address)
        // You could show a toast notification here
      } catch (error) {
        console.error('Failed to copy address:', error)
      }
    }
  }

  const formatAddress = (address: string) => {
    if (showFullAddress || address.length <= 10) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getNetworkName = (chainId: number) => {
    const networks: Record<number, string> = {
      1: 'Ethereum',
      137: 'Polygon',
      56: 'BSC',
      80001: 'Mumbai (Polygon Testnet)',
    }
    return networks[chainId] || `Chain ID: ${chainId}`
  }

  const getNetworkColor = (chainId: number) => {
    switch (chainId) {
      case 1: return 'text-blue-400 bg-blue-900/20'
      case 137: return 'text-purple-400 bg-purple-900/20'
      case 56: return 'text-yellow-400 bg-yellow-900/20'
      default: return 'text-gray-400 bg-gray-900/20'
    }
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20 border border-blue-400/30 backdrop-blur-sm ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-indigo-600/5" />
      <div className="relative">
        <Card className="bg-transparent border-0 shadow-none">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Wallet className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-center text-white text-2xl font-bold">
              🌐 Crypto Wallet Hub
            </CardTitle>
            <CardDescription className="text-center text-slate-200 text-lg">
              Connect your Web3 wallet to make secure cryptocurrency investments
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
                    {/* Enhanced Wallet Connection Status */}
                    <div className={`flex items-center justify-between p-6 rounded-xl border-2 transition-all ${
                      walletState.connected
                        ? 'bg-gradient-to-r from-green-900/20 to-green-800/20 border-green-400/30'
                        : 'bg-gradient-to-r from-orange-900/20 to-orange-800/20 border-orange-400/30'
                    }`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              walletState.connected
                ? 'bg-green-500 shadow-green-500/30'
                : 'bg-orange-500 shadow-orange-500/30'
            } shadow-lg`}>
              {walletState.connected ? (
                <CheckCircle className="h-6 w-6 text-white" />
              ) : (
                <AlertCircle className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <p className="font-bold text-lg text-white">
                {walletState.connected ? '✅ Wallet Connected' : '⚠️ Wallet Not Connected'}
              </p>
              <p className={`text-sm ${
                walletState.connected ? 'text-green-200' : 'text-orange-200'
              }`}>
                {walletState.connected
                  ? '🔐 Ready for secure transactions'
                  : '🔗 Connect your wallet to start investing'
                }
              </p>
            </div>
          </div>

          {!walletState.connected && hasWeb3Support && (
            <Button
              onClick={connectWallet}
              disabled={walletState.isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              {walletState.isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </>
              )}
            </Button>
          )}
</div>
          {/* Enhanced Wallet Info */}
          {walletState.connected && walletState.address && (
          <div className="space-y-6">
            {/* Wallet Address */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-white">💳 Wallet Address</label>
              <div className="flex items-center gap-2 p-4 bg-slate-800/50 border border-slate-600 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <code className="flex-1 text-sm font-mono text-slate-200">
                  {formatAddress(walletState.address)}
                </code>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFullAddress(!showFullAddress)}
                    className="px-2 text-slate-300 hover:text-white hover:bg-slate-700"
                  >
                    {showFullAddress ? '🙈' : '👁️'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    className="px-2 text-slate-300 hover:text-white hover:bg-slate-700"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`https://etherscan.io/address/${walletState.address}`, '_blank')}
                    className="px-2 text-slate-300 hover:text-white hover:bg-slate-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Enhanced Network Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/50 border border-slate-600 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">🌐</span>
                  </div>
                  <label className="text-sm font-bold text-white">Network</label>
                </div>
                <Badge className={`${getNetworkColor(walletState.chainId || 0)} text-white border-0`}>
                  {getNetworkName(walletState.chainId || 0)}
                </Badge>
              </div>

              <div className="p-4 bg-slate-800/50 border border-slate-600 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <label className="text-sm font-bold text-white">Balance</label>
                </div>
                <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  {walletState.balance} ETH
                </div>
              </div>
            </div>

            {/* Enhanced Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="flex items-center gap-2 p-4 bg-slate-800/50 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white transition-all">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 text-white" />
                </div>
                View Portfolio
              </Button>
              <Button variant="outline" className="flex items-center gap-2 p-4 bg-slate-800/50 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white transition-all">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                  <DollarSign className="w-3 h-3 text-white" />
                </div>
                Make Investment
              </Button>
            </div>

            {/* Security Features */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security Features
              </h4>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Hardware wallet compatible</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Multi-signature support</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Secure transaction signing</span>
                </div>
              </div>
            </div>

            {/* Disconnect Button */}
            <Button
              variant="outline"
              onClick={disconnectWallet}
              className="w-full"
            >
              Disconnect Wallet
            </Button>
          </div>
        )}

        {/* Error Display */}
        {walletState.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {walletState.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Setup Instructions */}
        {!hasWeb3Support && (
          <div className="space-y-4">
            <div className="text-center">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">Web3 Wallet Required</h3>
              <p className="text-sm text-muted-foreground mb-4">
                To make cryptocurrency investments, you'll need a Web3 wallet like MetaMask.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={() => window.open('https://metamask.io/download/', '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
                Install MetaMask
              </Button>

              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={() => window.open('https://wallet.coinbase.com/', '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
                Install Coinbase Wallet
              </Button>
            </div>
          </div>
        )}

        {/* Wallet Benefits */}
        {walletState.connected && (
          <div className="space-y-3 pt-4 border-t border-border">
            <h4 className="font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Investment Benefits
            </h4>

            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Direct blockchain transactions</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Real-time transaction confirmations</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Multi-chain investment support</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Transparent transaction history</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </div>
    </div>
  )
}

// Investment Transaction Component
interface InvestmentTransactionProps {
  matchId: string
  amount: number
  recipientAddress: string
  onTransactionComplete?: (txHash: string) => void
  className?: string
}

export function InvestmentTransaction({
  matchId,
  amount,
  recipientAddress,
  onTransactionComplete,
  className
}: InvestmentTransactionProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const processInvestment = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const ethereum = (window as any).ethereum

        // Request transaction
        const transactionHash = await ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            to: recipientAddress,
            value: `0x${(amount * 1e18).toString(16)}`, // Convert ETH to Wei
            gas: '0x5208', // 21000 gas
          }],
        })

        setTxHash(transactionHash)
        onTransactionComplete?.(transactionHash)
      } else {
        throw new Error('No wallet connected')
      }
    } catch (error) {
      console.error('Investment transaction failed:', error)
      setError(error instanceof Error ? error.message : 'Transaction failed')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className={className}>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Investment Transaction</h3>
          <Badge variant="outline">
            {amount} ETH
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-medium">{amount} ETH</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Recipient:</span>
            <span className="font-mono text-xs">
              {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Network:</span>
            <span className="font-medium">Ethereum</span>
          </div>
        </div>

        {txHash && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Transaction successful!
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`https://etherscan.io/tx/${txHash}`, '_blank')}
                className="mt-2 text-xs"
              >
                View on Etherscan
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={processInvestment}
          disabled={isProcessing || !!txHash}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Processing Investment...
            </>
          ) : txHash ? (
            'Investment Complete'
          ) : (
            <>
              <DollarSign className="h-4 w-4 mr-2" />
              Confirm Investment
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
