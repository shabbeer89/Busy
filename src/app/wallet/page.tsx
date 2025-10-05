"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { WalletConnect, useWallet } from "@/components/wallet/wallet-connect";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { SidebarLayout } from "@/components/navigation/sidebar";
import { animations } from "@/lib/animations";

interface Transaction {
  id: string;
  type: "sent" | "received" | "investment";
  amount: number;
  currency: string;
  to: string;
  from: string;
  status: "pending" | "confirmed" | "completed" | "failed";
  timestamp: number;
  txHash?: string;
  description?: string;
}
export default function WalletPage() {
  const { user } = useAuth();
  const { wallet, isConnected } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<string>("0.0000");
  const [isLoading, setIsLoading] = useState(true);
  const [validationStatus, setValidationStatus] = useState<string>("Not Validated");

  const validateToken = async () => {
    if (!isConnected) {
      setValidationStatus("Connect to MetaMask");
      return;
    }

    try {
      // Get user's MetaMask address
      const accounts = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      });
      const address = accounts[0];

      // Simulate token ownership verification
      const isValid = Math.random() < 0.5;

      setValidationStatus(isValid ? "Token Validated" : "Invalid Token");
    } catch (error: any) {
      setValidationStatus(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    // Mock wallet data
    if (isConnected && wallet) {
      setBalance(wallet.balance);

      // Mock transaction history
      const mockTransactions: Transaction[] = [
        {
          id: "1",
          type: "investment",
          amount: 0.5,
          currency: "ETH",
          to: "0x742d35Cc6634C0532925a3b8D0C8B7b0B0C8B7b0",
          from: wallet.address,
          status: "completed",
          timestamp: Date.now() - 86400000 * 2, // 2 days ago
          txHash: "0x123456789abcdef",
          description: "Investment in AI Assistant Project",
        },
        {
          id: "2",
          type: "received",
          amount: 1.2,
          currency: "ETH",
          to: wallet.address,
          from: "0x8ba1f109551bD4328030123f8841e9a1b2d2c",
          status: "completed",
          timestamp: Date.now() - 86400000 * 5, // 5 days ago
          txHash: "0xabcdef123456789",
          description: "Refund from cancelled project",
        },
        {
          id: "3",
          type: "sent",
          amount: 0.1,
          currency: "ETH",
          to: "0x742d35Cc6634C0532925a3b8D0C8B7b0B0C8B7b0",
          from: wallet.address,
          status: "pending",
          timestamp: Date.now() - 3600000, // 1 hour ago
          description: "Gas fee for transaction",
        },
      ];

      setTransactions(mockTransactions);
    }
    setIsLoading(false);
  }, [isConnected, wallet]);

  if (!user) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Please sign in to access your wallet.</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(4)} ETH`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "pending": return "secondary";
      case "failed": return "destructive";
      default: return "outline";
    }
  };

  return (
          <SidebarLayout>
    
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Crypto Wallet</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your cryptocurrency wallet and investment transactions
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Wallet Connection & Balance */}
          <div className="lg:col-span-1">
            <WalletConnect />

            {isConnected && wallet && (
              <Card className={`mt-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${animations.cardHover} dark:bg-slate-800 dark:border-slate-700`}>
                <CardHeader>
                  <CardTitle>Wallet Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {balance} ETH
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      ≈ ${(parseFloat(balance) * 2500).toLocaleString()} USD
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Button className="w-full" size="sm">
                      Send Crypto
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      Receive Crypto
                    </Button>
                    <Link href="/matches">
                      <Button variant="outline" className="w-full" size="sm">
                        Make Investment
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Binance Account Bound Token Validation */}
            {isConnected && wallet ? (
              <Card className={`mt-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${animations.cardHover} dark:bg-slate-800 dark:border-slate-700`}>
                <CardHeader>
                  <CardTitle>Binance Account Bound Token</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <Button onClick={validateToken} className="w-full" size="sm">
                      Validate Token
                    </Button>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      Status: {validationStatus}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className={`mt-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${animations.cardHover} dark:bg-slate-800 dark:border-slate-700`}>
                <CardHeader>
                  <CardTitle>Binance Account Bound Token</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      Connect to MetaMask to validate your token.
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Transaction History & Activity */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="transactions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="investments">Investments</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="transactions" className="space-y-6">
                <Card className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${animations.cardHover} dark:bg-slate-800 dark:border-slate-700`}>
                  <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>
                      All your crypto transactions and transfers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                              <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                            </div>
                            <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                          </div>
                        ))}
                      </div>
                    ) : transactions.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600 dark:text-gray-300">No transactions yet</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Your crypto transactions will appear here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {transactions.map((tx) => (
                          <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-800 border-slate-700">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                tx.type === "sent" ? "bg-red-100" :
                                tx.type === "received" ? "bg-green-100" :
                                "bg-blue-100"
                              }`}>
                                {tx.type === "sent" && (
                                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                  </svg>
                                )}
                                {tx.type === "received" && (
                                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5l9 18-9-2-9 2 9-18z" />
                                  </svg>
                                )}
                                {tx.type === "investment" && (
                                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                )}
                              </div>
                              <div>
                                <div className="font-medium capitalize text-gray-900 dark:text-white">{tx.type}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                  {tx.description || `${tx.type === "sent" ? "To" : "From"} ${formatAddress(tx.type === "sent" ? tx.to : tx.from)}`}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatDate(tx.timestamp)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-semibold ${tx.type === "received" ? "text-green-600" : tx.type === "sent" ? "text-red-600" : "text-blue-600"}`}>
                                {tx.type === "received" ? "+" : "-"}{formatCurrency(tx.amount)}
                              </div>
                              <Badge variant={getStatusColor(tx.status)} className="text-xs">
                                {tx.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="investments" className="space-y-6">
                <Card className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${animations.cardHover} dark:bg-slate-800 dark:border-slate-700`}>
                  <CardHeader>
                    <CardTitle>Investment Portfolio</CardTitle>
                    <CardDescription>
                      Track your investments in various projects
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-gray-600 dark:text-gray-300">No investments yet</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Your project investments will appear here
                      </p>
                      <Link href="/offers">
                        <Button className="mt-4">Browse Investment Opportunities</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${animations.cardHover} dark:bg-slate-800 dark:border-slate-700`}>
                    <CardHeader>
                      <CardTitle>Monthly Volume</CardTitle>
                    </CardHeader>
                    <CardContent className="bg-slate-800 dark:bg-slate-800 border-slate-700">
                      <div className="text-3xl font-bold text-blue-400 mb-2">2.3 ETH</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">≈ $5,750 USD</div>
                    </CardContent>
                  </Card>

                  <Card className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${animations.cardHover} dark:bg-slate-800 dark:border-slate-700`}>
                    <CardHeader>
                      <CardTitle>Success Rate</CardTitle>
                    </CardHeader>
                    <CardContent className="bg-slate-800 dark:bg-slate-800 border-slate-700">
                      <div className="text-3xl font-bold text-green-400 mb-2">100%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">All transactions confirmed</div>
                    </CardContent>
                  </Card>

                  <Card className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${animations.cardHover} dark:bg-slate-800 dark:border-slate-700`}>
                    <CardHeader>
                      <CardTitle>Total Invested</CardTitle>
                    </CardHeader>
                    <CardContent className="bg-slate-800 dark:bg-slate-800 border-slate-700">
                      <div className="text-3xl font-bold text-purple-400 mb-2">0.5 ETH</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">1 active investment</div>
                    </CardContent>
                  </Card>

                  <Card className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${animations.cardHover} dark:bg-slate-800 dark:border-slate-700`}>
                    <CardHeader>
                      <CardTitle>Gas Fees</CardTitle>
                    </CardHeader>
                    <CardContent className="bg-slate-800 dark:bg-slate-800 border-slate-700">
                      <div className="text-3xl font-bold text-orange-400 mb-2">0.03 ETH</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Average per transaction</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
          </SidebarLayout>
  );
}