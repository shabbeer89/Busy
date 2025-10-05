"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WalletInfo {
  address: string;
  chainId: number;
  balance: string;
  provider: string;
}

interface WalletConnectProps {
  onWalletConnected?: (wallet: WalletInfo) => void;
  onWalletDisconnected?: () => void;
  className?: string;
}

export function WalletConnect({ onWalletConnected, onWalletDisconnected, className }: WalletConnectProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if wallet is already connected on component mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          await connectWallet();
        }
      } catch (err) {
        console.error("Error checking wallet connection:", err);
      }
    }
  };

  const connectWallet = async (providerParam?: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      const provider = providerParam || "metamask";

      if (!provider || provider === "") {
        throw new Error("No wallet provider specified");
      }

      let accounts: string[] = [];

      if (provider === "metamask") {
        if (!(window as any).ethereum) {
          setError("MetaMask not detected. Please install MetaMask to continue.");
          return;
        }
        accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts"
        });
      } else {
        throw new Error(`Unsupported wallet provider: ${provider}`);
      }

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const chainId = await (window as any).ethereum.request({ method: "eth_chainId" });

      // Get balance
      const balance = await (window as any).ethereum.request({
        method: "eth_getBalance",
        params: [accounts[0], "latest"]
      });

      const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);

      const walletInfo: WalletInfo = {
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        balance: balanceInEth.toFixed(4),
        provider: provider
      };

      setWallet(walletInfo);
      setIsConnected(true);
      onWalletConnected?.(walletInfo);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setIsConnected(false);
    onWalletDisconnected?.();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 1: return "Ethereum Mainnet";
      case 5: return "Goerli Testnet";
      case 11155111: return "Sepolia Testnet";
      case 137: return "Polygon Mainnet";
      case 80001: return "Polygon Mumbai";
      default: return `Chain ID: ${chainId}`;
    }
  };

  if (!isConnected || !wallet) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Connect Wallet
          </CardTitle>
          <CardDescription>
            Connect your crypto wallet to make investments and track transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={() => connectWallet()}
              disabled={isConnecting}
              className="w-full"
              size="lg"
            >
              {isConnecting ? "Connecting..." : "Connect MetaMask"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  More wallets coming soon
                </span>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>New to crypto wallets?</p>
              <a
                href="https://metamask.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Learn more about MetaMask
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Wallet Connected
        </CardTitle>
        <CardDescription>
          Your crypto wallet is connected and ready for transactions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Address:</span>
            <Badge variant="outline" className="font-mono">
              {formatAddress(wallet.address)}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Network:</span>
            <Badge variant="secondary">
              {getNetworkName(wallet.chainId)}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Balance:</span>
            <span className="font-semibold">
              {wallet.balance} ETH
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Provider:</span>
            <Badge variant="outline" className="capitalize">
              {wallet.provider}
            </Badge>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={disconnectWallet}
          className="w-full"
        >
          Disconnect Wallet
        </Button>
      </CardContent>
    </Card>
  );
}

// Hook for wallet connection state
export function useWallet() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = async (providerParam: string = "metamask") => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts"
        });

        const chainId = await (window as any).ethereum.request({ method: "eth_chainId" });

        const balance = await (window as any).ethereum.request({
          method: "eth_getBalance",
          params: [accounts[0], "latest"]
        });

        const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);

        const walletInfo: WalletInfo = {
          address: accounts[0],
          chainId: parseInt(chainId, 16),
          balance: balanceInEth.toFixed(4),
          provider: providerParam
        };

        setWallet(walletInfo);
        setIsConnected(true);
        return walletInfo;
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to connect wallet");
      }
    } else {
      throw new Error("MetaMask not detected. Please install MetaMask to continue.");
    }
  };

  const disconnect = () => {
    setWallet(null);
    setIsConnected(false);
  };

  return {
    wallet,
    isConnected,
    connect,
    disconnect,
  };
}