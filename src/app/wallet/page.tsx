"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { WalletConnect, useWallet } from "@/components/wallet/wallet-connect";
import { BABTValidator } from "@/components/wallet/babt-validator";
import { BinanceBABTVerifier } from "@/components/wallet/binance-babt-verifier";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { SidebarLayout } from "@/components/navigation/sidebar";
import { ArrowUpRight, ArrowDownLeft, Activity, Plus, Shield, AlertCircle } from "lucide-react";

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
  const [contractToolsExpanded, setContractToolsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("transactions");
  const [toolsExpanded, setToolsExpanded] = useState(false);
  const [babtExpanded, setBabtExpanded] = useState(false);

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
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Clean Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Wallet</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your crypto assets</p>
              </div>
              <WalletConnect />
            </div>
          </div>

          {/* Essential Balance & Actions */}
          {isConnected && wallet && (
            <Card className="mb-8 border-0 shadow-sm bg-gray-50 dark:bg-gray-800">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Balance</p>
                    <div className="text-4xl font-bold text-gray-900 dark:text-white">
                      {balance} <span className="text-xl text-blue-600">ETH</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      ≈ ${(parseFloat(balance) * 2500).toLocaleString()} USD
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Send
                    </Button>
                    <Button size="lg" variant="outline">
                      <ArrowDownLeft className="w-4 h-4 mr-2" />
                      Receive
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Clean Tabs */}
          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger value="transactions" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Transactions
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Portfolio
              </TabsTrigger>
              <TabsTrigger value="babt" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                BABT Verification
              </TabsTrigger>
            </TabsList>

           <TabsContent value="transactions" className="space-y-6">
             <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-800">
               <CardContent className="p-8">
                 <div className="text-center py-12">
                   <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                   <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No transactions yet</h3>
                   <p className="text-gray-600 dark:text-gray-400">
                     Your crypto transactions will appear here
                   </p>
                 </div>
               </CardContent>
             </Card>
           </TabsContent>

           <TabsContent value="portfolio" className="space-y-6">
             <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-800">
               <CardContent className="p-8">
                 <div className="text-center py-12">
                   <Plus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                   <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No investments yet</h3>
                   <p className="text-gray-600 dark:text-gray-400 mb-6">
                     Start investing in promising projects and ideas
                   </p>
                   <Link href="/offers">
                     <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                       <Plus className="w-4 h-4 mr-2" />
                       Explore Opportunities
                     </Button>
                   </Link>
                 </div>
               </CardContent>
             </Card>
           </TabsContent>

           <TabsContent value="babt" className="space-y-6">
             {/* Clear Explanation */}
             <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <AlertCircle className="h-5 w-5 text-blue-500" />
                   Choose Your BABT Verification Method
                 </CardTitle>
                 <CardDescription>
                   Different verification methods for different BABT types
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="grid md:grid-cols-2 gap-4 text-sm">
                   <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                     <div className="font-medium text-blue-600 dark:text-blue-400 mb-2">🔗 Binance App BABT</div>
                     <div className="text-gray-600 dark:text-gray-300 mb-3">
                       BABT tokens from Binance mobile/web app
                     </div>
                     <div className="text-xs text-gray-500">
                       • Requires Binance OAuth<br/>
                       • No wallet signature needed<br/>
                       • Links to Binance account
                     </div>
                   </div>
                   <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                     <div className="font-medium text-purple-600 dark:text-purple-400 mb-2">⛓️ Web3 BABT Tokens</div>
                     <div className="text-gray-600 dark:text-gray-300 mb-3">
                       BABT tokens on blockchain (on-chain)
                     </div>
                     <div className="text-xs text-gray-500">
                       • Requires wallet connection<br/>
                       • Checks on-chain ownership<br/>
                       • MetaMask signature needed
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>

             {/* Binance BABT Verifier */}
             <div className="space-y-3">
               <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                 <Shield className="h-5 w-5 text-blue-500" />
                 Binance BABT Verifier (Recommended)
               </h3>
               <BinanceBABTVerifier />
             </div>

             {/* Separator */}
             <div className="relative">
               <div className="absolute inset-0 flex items-center">
                 <span className="w-full border-t" />
               </div>
               <div className="relative flex justify-center text-xs uppercase">
                 <span className="bg-white dark:bg-gray-900 px-2 text-muted-foreground">
                   Alternative Method
                 </span>
               </div>
             </div>

             {/* Legacy BABT Validator */}
             <div className="space-y-3">
               <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                 <AlertCircle className="h-5 w-5 text-orange-500" />
                 Web3 Token Validator (Legacy)
               </h3>
               <BABTValidator />
             </div>
           </TabsContent>
         </Tabs>
       </div>
     </div>
   </SidebarLayout>
 );
}