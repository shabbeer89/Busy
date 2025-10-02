"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/components/wallet/wallet-connect";

interface CryptoPaymentProps {
  recipientAddress: string;
  amount: number;
  description?: string;
  onPaymentSuccess?: (txHash: string) => void;
  onPaymentError?: (error: string) => void;
}

export function CryptoPayment({
  recipientAddress,
  amount,
  description = "Investment payment",
  onPaymentSuccess,
  onPaymentError
}: CryptoPaymentProps) {
  const { wallet, isConnected } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [gasEstimate, setGasEstimate] = useState<string>("");

  const estimateGas = async () => {
    if (!isConnected || !wallet) return;

    try {
      // Estimate gas for the transaction
      const gasEstimate = await (window as any).ethereum.request({
        method: "eth_estimateGas",
        params: [{
          from: wallet.address,
          to: recipientAddress,
          value: (amount * Math.pow(10, 18)).toString(16), // Convert to wei
        }]
      });

      const gasPrice = await (window as any).ethereum.request({
        method: "eth_gasPrice"
      });

      const gasCost = (parseInt(gasEstimate, 16) * parseInt(gasPrice, 16)) / Math.pow(10, 18);
      setGasEstimate(gasCost.toFixed(6));
    } catch (error) {
      console.error("Gas estimation failed:", error);
      setGasEstimate("0.001"); // Fallback estimate
    }
  };

  const processPayment = async () => {
    if (!isConnected || !wallet) {
      onPaymentError?.("Wallet not connected");
      return;
    }

    setIsProcessing(true);

    try {
      // Send transaction
      const transactionHash = await (window as any).ethereum.request({
        method: "eth_sendTransaction",
        params: [{
          from: wallet.address,
          to: recipientAddress,
          value: (amount * Math.pow(10, 18)).toString(16), // Convert ETH to wei
          gas: "21000", // Standard gas limit for ETH transfer
        }]
      });

      setTxHash(transactionHash);
      onPaymentSuccess?.(transactionHash);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Transaction failed";
      onPaymentError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isConnected || !wallet) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Wallet Required
          </CardTitle>
          <CardDescription>
            Connect your crypto wallet to make payments
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Crypto Payment
        </CardTitle>
        <CardDescription>
          Send cryptocurrency for your investment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Summary */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700">Amount:</span>
            <span className="font-semibold">{amount} ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700">Recipient:</span>
            <Badge variant="outline" className="font-mono">
              {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700">Description:</span>
            <span className="text-sm">{description}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700">Est. Gas Fee:</span>
            <span className="text-sm">{gasEstimate || "..."} ETH</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>{amount + parseFloat(gasEstimate || "0")} ETH</span>
            </div>
          </div>
        </div>

        {/* Transaction Status */}
        {txHash && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Transaction Sent!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Transaction hash: <code className="font-mono">{txHash}</code>
            </p>
            <a
              href={`https://etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline mt-2 inline-block"
            >
              View on Etherscan →
            </a>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!txHash && (
            <>
              <Button
                variant="outline"
                onClick={estimateGas}
                className="flex-1"
              >
                Estimate Gas
              </Button>
              <Button
                onClick={processPayment}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? "Processing..." : `Pay ${amount} ETH`}
              </Button>
            </>
          )}
          {txHash && (
            <Button variant="outline" className="w-full">
              Make Another Payment
            </Button>
          )}
        </div>

        {/* Wallet Balance Warning */}
        {wallet && parseFloat(wallet.balance) < amount + parseFloat(gasEstimate || "0.01") && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <p className="text-sm text-red-800">
              ⚠️ Insufficient balance. You need at least {amount + parseFloat(gasEstimate || "0.01")} ETH for this transaction.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Hook for crypto payments
export function useCryptoPayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendPayment = async (
    recipientAddress: string,
    amount: number,
    description?: string
  ): Promise<string | null> => {
    setIsProcessing(true);
    setError(null);
    setTxHash(null);

    try {
      if (typeof window === "undefined" || !(window as any).ethereum) {
        throw new Error("MetaMask not detected");
      }

      // Get current wallet address
      const accounts = await (window as any).ethereum.request({
        method: "eth_accounts"
      });

      if (accounts.length === 0) {
        throw new Error("No wallet connected");
      }

      // Send transaction
      const transactionHash = await (window as any).ethereum.request({
        method: "eth_sendTransaction",
        params: [{
          from: accounts[0],
          to: recipientAddress,
          value: (amount * Math.pow(10, 18)).toString(16), // Convert to wei
          gas: "21000",
        }]
      });

      setTxHash(transactionHash);
      return transactionHash;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    sendPayment,
    isProcessing,
    txHash,
    error,
  };
}