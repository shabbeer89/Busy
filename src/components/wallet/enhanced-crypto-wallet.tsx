"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useCryptoPayments } from '@/hooks/use-crypto-payments'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Wallet,
  Copy,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  CreditCard,
  Smartphone
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EnhancedCryptoWalletProps {
  matchId?: string
  amount?: number
  onPaymentComplete?: (transaction: any) => void
  className?: string
}

export function EnhancedCryptoWallet({
  matchId,
  amount,
  onPaymentComplete,
  className
}: EnhancedCryptoWalletProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('connect')
  const [paymentStep, setPaymentStep] = useState<'amount' | 'method' | 'processing' | 'complete'>('amount')

  const {
    connectedWallet,
    currentNetwork,
    paymentData,
    transactionHistory,
    loadingHistory,
    walletError,
    paymentError,
    transactionError,
    connectWallet,
    generatePayment,
    createTransaction,
    fetchTransactionHistory,
    calculateFees,
    switchNetwork,
    supportedNetworks,
  } = useCryptoPayments()

  // Load transaction history on mount
  useEffect(() => {
    if (user) {
      fetchTransactionHistory()
    }
  }, [user, fetchTransactionHistory])

  const handleConnectWallet = async () => {
    try {
      await connectWallet('BSC')
      setActiveTab('pay')
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  const handleCreateTransaction = async () => {
    if (!matchId || !amount || !connectedWallet) return

    try {
      setPaymentStep('processing')
      const transaction = await createTransaction({
        match_id: matchId,
        amount,
        payment_method: 'crypto',
        wallet_address: connectedWallet,
      })

      setPaymentStep('complete')
      onPaymentComplete?.(transaction)
    } catch (error) {
      console.error('Failed to create transaction:', error)
      setPaymentStep('method')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground mb-4">Please sign in to access crypto wallet features</p>
          <Button asChild>
            <a href="/auth/login">Sign In</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Crypto Wallet
          </CardTitle>
          <CardDescription>
            Connect your wallet to make secure cryptocurrency payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="connect">Connect</TabsTrigger>
              <TabsTrigger value="pay" disabled={!connectedWallet}>Pay</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="connect" className="space-y-4">
              <div className="text-center py-8">
                <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
                <p className="text-muted-foreground mb-6">
                  Connect your Web3 wallet to make cryptocurrency payments
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={handleConnectWallet}
                    className="w-full"
                    size="lg"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect MetaMask
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => switchNetwork('ETHEREUM')}
                      disabled={!connectedWallet}
                    >
                      Ethereum
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => switchNetwork('BSC')}
                      disabled={!connectedWallet}
                    >
                      BSC
                    </Button>
                  </div>
                </div>

                {walletError && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{walletError}</AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>

            <TabsContent value="pay" className="space-y-4">
              {connectedWallet ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        Wallet Connected
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700 dark:text-green-300">
                        {formatAddress(connectedWallet)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(connectedWallet)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {amount && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2">Payment Amount</h3>
                        <div className="text-3xl font-bold text-primary">
                          {formatCurrency(amount)}
                        </div>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">Fee Breakdown</h4>
                        {(() => {
                          const fees = calculateFees(amount, 'crypto')
                          return (
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Amount:</span>
                                <span>{formatCurrency(amount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Platform Fee (2.9%):</span>
                                <span>{formatCurrency(fees.platformFee)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Network Fee:</span>
                                <span>{formatCurrency(fees.networkFee)}</span>
                              </div>
                              <div className="flex justify-between font-semibold border-t pt-2">
                                <span>Total:</span>
                                <span>{formatCurrency(fees.total)}</span>
                              </div>
                            </div>
                          )
                        })()}
                      </div>

                      <Button
                        onClick={handleCreateTransaction}
                        className="w-full"
                        size="lg"
                        disabled={paymentStep === 'processing'}
                      >
                        {paymentStep === 'processing' ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing Payment...
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-4 h-4 mr-2" />
                            Confirm Payment
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Please connect your wallet to proceed with payment</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Transaction History</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchTransactionHistory()}
                  disabled={loadingHistory}
                >
                  {loadingHistory ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {loadingHistory ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-muted rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : transactionHistory && transactionHistory.length > 0 ? (
                <div className="space-y-3">
                  {transactionHistory.map((transaction: any) => (
                    <Card key={transaction.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center",
                              transaction.status === 'completed'
                                ? "bg-green-100 text-green-600"
                                : transaction.status === 'pending'
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-red-100 text-red-600"
                            )}>
                              {transaction.status === 'completed' ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : transaction.status === 'pending' ? (
                                <Clock className="w-4 h-4" />
                              ) : (
                                <AlertCircle className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">
                                {formatCurrency(transaction.amount)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(transaction.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={
                              transaction.status === 'completed' ? 'default' :
                              transaction.status === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {transaction.status}
                            </Badge>
                            {transaction.crypto_tx_hash && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-1"
                                onClick={() => window.open(
                                  `https://bscscan.com/tx/${transaction.crypto_tx_hash}`,
                                  '_blank'
                                )}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions yet</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Network Info */}
      {connectedWallet && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Network:</span>
                <Badge variant="outline">{currentNetwork}</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Wallet: {formatAddress(connectedWallet)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}