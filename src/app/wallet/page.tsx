"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { WalletConnect, useWallet } from "@/components/wallet/wallet-connect";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, AnimatedCard } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { SidebarLayout } from "@/components/navigation/sidebar";
import { animations } from "@/lib/animations";
import { CheckCircle, XCircle, AlertCircle, Clock, Shield, Wallet as WalletIcon, Check } from "lucide-react";

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
  const [babtValidation, setBabtValidation] = useState<{
    step: number;
    isValid: boolean;
    isLoading: boolean;
    error?: string;
    completedSteps: number[];
  }>({
    step: 0,
    isValid: false,
    isLoading: false,
    completedSteps: []
  });

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

  // BABT Validation Steps
  const babtValidationSteps = [
    {
      id: 1,
      title: "Connect Binance Account",
      description: "Link your Binance account to verify ownership",
      icon: <WalletIcon className="w-5 h-5" />
    },
    {
      id: 2,
      title: "Verify BABT Ownership",
      description: "Confirm you own a valid BABT token",
      icon: <Shield className="w-5 h-5" />
    },
    {
      id: 3,
      title: "Validate Token Authenticity",
      description: "Verify token metadata and authenticity",
      icon: <CheckCircle className="w-5 h-5" />
    },
    {
      id: 4,
      title: "Complete Verification",
      description: "Finalize the validation process",
      icon: <Check className="w-5 h-5" />
    }
  ];

  const handleBABTValidation = async (step: number) => {
    if (!isConnected || !wallet) {
      setBabtValidation(prev => ({
        ...prev,
        error: "Please connect your wallet first"
      }));
      return;
    }

    setBabtValidation(prev => ({
      ...prev,
      step,
      isLoading: true,
      error: undefined
    }));

    try {
      // Step 1: Connect Binance Account
      if (step === 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
        setBabtValidation(prev => ({
          ...prev,
          step: 2,
          completedSteps: [...prev.completedSteps, 1],
          isLoading: false
        }));
      }

      // Step 2: Verify BABT Ownership
      else if (step === 2) {
        // Simulate BABT token verification
        await new Promise(resolve => setTimeout(resolve, 3000));

        // For demo, randomly succeed/fail to show both states
        const isValidToken = Math.random() > 0.3;

        if (isValidToken) {
          setBabtValidation(prev => ({
            ...prev,
            step: 3,
            completedSteps: [...prev.completedSteps, 2],
            isLoading: false
          }));
        } else {
          setBabtValidation(prev => ({
            ...prev,
            isLoading: false,
            error: "No valid BABT token found in your wallet"
          }));
        }
      }

      // Step 3: Validate Token Authenticity
      else if (step === 3) {
        await new Promise(resolve => setTimeout(resolve, 2500));

        setBabtValidation(prev => ({
          ...prev,
          step: 4,
          completedSteps: [...prev.completedSteps, 3],
          isLoading: false
        }));
      }

      // Step 4: Complete Verification
      else if (step === 4) {
        await new Promise(resolve => setTimeout(resolve, 1500));

        setBabtValidation(prev => ({
          ...prev,
          step: 5,
          completedSteps: [...prev.completedSteps, 4],
          isValid: true,
          isLoading: false
        }));
      }

    } catch (error: any) {
      setBabtValidation(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "Validation failed"
      }));
    }
  };

  const resetBABTValidation = () => {
    setBabtValidation({
      step: 0,
      isValid: false,
      isLoading: false,
      completedSteps: []
    });
  };

  const BABTValidationSection = ({ isConnected, wallet, validation, onValidate }: {
    isConnected: boolean;
    wallet: any;
    validation: typeof babtValidation;
    onValidate: (step: number) => void;
  }) => {
    if (!isConnected || !wallet) {
      return (
        <AnimatedCard className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              Binance Account Bound Token
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Connect your wallet to validate your BABT token.
              </div>
              <div className="text-xs text-gray-500">
                BABT (Binance Account Bound Token) verification required for enhanced security.
              </div>
            </div>
          </CardContent>
        </AnimatedCard>
      );
    }

    return (
      <AnimatedCard className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            BABT Validation {validation.isValid && <CheckCircle className="w-5 h-5 text-green-400" />}
          </CardTitle>
          <CardDescription>
            Verify your Binance Account Bound Token for enhanced security and KYC compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Display */}
          {validation.error && (
            <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <XCircle className="w-4 h-4" />
                <span className="text-sm">{validation.error}</span>
              </div>
            </div>
          )}

          {/* Validation Steps */}
          <div className="space-y-4">
            {babtValidationSteps.map((step) => {
              const isCompleted = validation.completedSteps.includes(step.id);
              const isCurrent = validation.step === step.id;
              const isPending = step.id > validation.step;

              return (
                <div key={step.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isCompleted ? 'bg-green-900/20 text-green-400' :
                    isCurrent && validation.isLoading ? 'bg-blue-900/20 text-blue-400 animate-pulse' :
                    isCurrent ? 'bg-blue-900/20 text-blue-400' :
                    'bg-gray-900/20 text-gray-400'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : step.icon}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${isCompleted ? 'text-green-400' : isCurrent ? 'text-blue-400' : 'text-gray-300'}`}>
                      {step.title}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {step.description}
                    </div>
                    {isCurrent && (
                      <div className="mt-2">
                        <Button
                          size="sm"
                          onClick={() => onValidate(step.id)}
                          disabled={validation.isLoading}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {validation.isLoading ? (
                            <>
                              <Clock className="w-4 h-4 mr-2 animate-spin" />
                              Validating...
                            </>
                          ) : (
                            'Start Validation'
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-gray-400">
                {validation.completedSteps.length} / {babtValidationSteps.length} steps
              </span>
            </div>
            <Progress
              value={(validation.completedSteps.length / babtValidationSteps.length) * 100}
              className="h-2"
            />
          </div>

          {/* Validation Result */}
          {validation.isValid && (
            <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <div>
                  <div className="font-medium">BABT Validation Successful!</div>
                  <div className="text-sm text-green-300">
                    Your Binance Account Bound Token has been verified. You now have enhanced access to premium features.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reset Button */}
          {validation.step > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetBABTValidation}
              className="w-full"
            >
              Reset Validation
            </Button>
          )}

          {/* Info Section */}
          <div className="p-3 bg-blue-900/10 border border-blue-800 rounded-lg">
            <div className="text-sm text-blue-300">
              <div className="font-medium mb-1">Why validate BABT?</div>
              <ul className="text-xs space-y-1 text-blue-200">
                <li>• Enhanced security for your investments</li>
                <li>• Access to premium investment opportunities</li>
                <li>• KYC compliance verification</li>
                <li>• Priority support and features</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </AnimatedCard>
    );
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
              <AnimatedCard className={`mt-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${animations.cardHover} dark:bg-slate-800 dark:border-slate-700`}>
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
              </AnimatedCard>
            )}

            {/* Binance Account Bound Token Validation */}
            <BABTValidationSection
              isConnected={isConnected}
              wallet={wallet}
              validation={babtValidation}
              onValidate={handleBABTValidation}
            />
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
                <AnimatedCard>
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
                </AnimatedCard>
              </TabsContent>

              <TabsContent value="investments" className="space-y-6">
                <Card className="">
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
                  <Card className="">
                    <CardHeader>
                      <CardTitle>Monthly Volume</CardTitle>
                    </CardHeader>
                    <CardContent className="bg-slate-800 dark:bg-slate-800 border-slate-700">
                      <div className="text-3xl font-bold text-blue-400 mb-2">2.3 ETH</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">≈ $5,750 USD</div>
                    </CardContent>
                  </Card>

                  <Card className="">
                    <CardHeader>
                      <CardTitle>Success Rate</CardTitle>
                    </CardHeader>
                    <CardContent className="bg-slate-800 dark:bg-slate-800 border-slate-700">
                      <div className="text-3xl font-bold text-green-400 mb-2">100%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">All transactions confirmed</div>
                    </CardContent>
                  </Card>

                  <Card className="">
                    <CardHeader>
                      <CardTitle>Total Invested</CardTitle>
                    </CardHeader>
                    <CardContent className="bg-slate-800 dark:bg-slate-800 border-slate-700">
                      <div className="text-3xl font-bold text-purple-400 mb-2">0.5 ETH</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">1 active investment</div>
                    </CardContent>
                  </Card>

                  <Card className="">
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