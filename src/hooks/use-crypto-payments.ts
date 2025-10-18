"use client"

import { useState, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { cryptoPaymentService, SUPPORTED_NETWORKS, NetworkKey } from '@/services/crypto-payment-service'
import { useAsyncOperation } from '@/hooks/use-async-operation'

interface PaymentData {
  paymentAddress: string
  qrCodeData: string
  estimatedGas: string
  networkFee: string
}

interface TransactionData {
  id: string
  matchId: string
  investorId: string
  creatorId: string
  amount: number
  currency: string
  status: string
  paymentMethod: string
  walletAddress?: string
  cryptoTxHash?: string
  createdAt: string
  confirmedAt?: string
}

export function useCryptoPayments() {
  const { user } = useAuth()
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)
  const [currentNetwork, setCurrentNetwork] = useState<NetworkKey>('BSC')

  // Connect wallet operation
  const {
    data: walletAddress,
    loading: connectingWallet,
    error: walletError,
    execute: executeWalletConnection
  } = useAsyncOperation(
    async (network: NetworkKey) => {
      const address = await cryptoPaymentService.connectWallet(network)
      setConnectedWallet(address)
      setCurrentNetwork(network)
      return address
    }
  )

  // Generate payment data operation
  const {
    data: paymentData,
    loading: generatingPayment,
    error: paymentError,
    execute: executePaymentGeneration
  } = useAsyncOperation(
    async (params: {
      amount: number
      currency: string
      recipientAddress: string
      network: NetworkKey
      memo?: string
    }) => {
      return await cryptoPaymentService.generatePaymentData(params)
    }
  )

  // Monitor transaction operation
  const {
    data: transactionStatus,
    loading: monitoringTransaction,
    error: monitoringError,
    execute: executeTransactionMonitoring
  } = useAsyncOperation(
    async (txHash: string, network: NetworkKey = 'BSC') => {
      return await cryptoPaymentService.monitorTransaction(txHash, network)
    }
  )

  // Create transaction operation
  const {
    data: newTransaction,
    loading: creatingTransaction,
    error: transactionError,
    execute: executeTransactionCreation
  } = useAsyncOperation(
    async (transactionData: {
      match_id: string
      amount: number
      currency?: string
      payment_method: 'crypto' | 'bank_transfer'
      wallet_address?: string
    }) => {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create transaction')
      }

      const result = await response.json()
      return result.data
    }
  )

  // Get transaction history
  const {
    data: transactionHistory,
    loading: loadingHistory,
    error: historyError,
    execute: executeFetchHistory
  } = useAsyncOperation(
    async (limit = 20) => {
      if (!user) throw new Error('User not authenticated')
      return await cryptoPaymentService.getTransactionHistory(
        user.id,
        user.userType,
        limit
      )
    }
  )

  // Connect wallet
  const connectWallet = useCallback(async (network: NetworkKey = 'BSC') => {
    return await executeWalletConnection(network)
  }, [executeWalletConnection])

  // Generate payment data
  const generatePayment = useCallback(async (params: {
    amount: number
    currency: string
    recipientAddress: string
    network: NetworkKey
    memo?: string
  }) => {
    return await executePaymentGeneration(params)
  }, [executePaymentGeneration])

  // Monitor transaction
  const monitorTransaction = useCallback(async (txHash: string, network: NetworkKey = 'BSC') => {
    return await executeTransactionMonitoring(txHash, network)
  }, [executeTransactionMonitoring])

  // Create transaction
  const createTransaction = useCallback(async (transactionData: {
    match_id: string
    amount: number
    currency?: string
    payment_method: 'crypto' | 'bank_transfer'
    wallet_address?: string
  }) => {
    return await executeTransactionCreation(transactionData)
  }, [executeTransactionCreation])

  // Fetch transaction history
  const fetchTransactionHistory = useCallback(async (limit?: number) => {
    return await executeFetchHistory(limit)
  }, [executeFetchHistory])

  // Calculate fees
  const calculateFees = useCallback((
    amount: number,
    paymentMethod: 'crypto' | 'bank_transfer'
  ) => {
    return cryptoPaymentService.calculateFees(amount, paymentMethod)
  }, [])

  // Switch network
  const switchNetwork = useCallback(async (network: NetworkKey) => {
    if (!connectedWallet) {
      throw new Error('Wallet not connected')
    }
    await cryptoPaymentService.switchNetwork(network)
    setCurrentNetwork(network)
  }, [connectedWallet])

  return {
    // State
    connectedWallet,
    currentNetwork,
    walletAddress,
    paymentData,
    transactionStatus,
    newTransaction,
    transactionHistory,

    // Loading states
    connectingWallet,
    generatingPayment,
    monitoringTransaction,
    creatingTransaction,
    loadingHistory,

    // Errors
    walletError,
    paymentError,
    monitoringError,
    transactionError,
    historyError,

    // Actions
    connectWallet,
    generatePayment,
    monitorTransaction,
    createTransaction,
    fetchTransactionHistory,
    calculateFees,
    switchNetwork,

    // Utilities
    supportedNetworks: SUPPORTED_NETWORKS,
  }
}