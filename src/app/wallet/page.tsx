"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { CryptoWallet, InvestmentTransaction } from "@/components/wallet/crypto-wallet";
import { VideoCallButton } from "@/components/video/video-calling";
import { BABTValidator } from "@/components/wallet/babt-validator";
import { BABTVerificationFlow } from "@/components/wallet/babt-verification-flow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { SidebarLayout } from "@/components/navigation/sidebar";
import { ArrowUpRight, ArrowDownLeft, Activity, Plus, Shield, AlertCircle, ExternalLink } from "lucide-react";

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
  const { user, isLoading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<string>("0.0000");
  const [isLoading, setIsLoading] = useState(true);
  const [contractToolsExpanded, setContractToolsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("wallet");
  const [toolsExpanded, setToolsExpanded] = useState(false);
  const [babtExpanded, setBabtExpanded] = useState(false);

  useEffect(() => {
    // Mock transaction history for demo
    const mockTransactions: Transaction[] = [
      {
        id: "1",
        type: "investment",
        amount: 0.5,
        currency: "ETH",
        to: "0x742d35Cc6634C0532925a3b8D0C8B7b0B0C8B7b0",
        from: "0x123456789abcdef123456789abcdef123456789a",
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
        to: "0x123456789abcdef123456789abcdef123456789a",
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
        from: "0x123456789abcdef123456789abcdef123456789a",
        status: "pending",
        timestamp: Date.now() - 3600000, // 1 hour ago
        description: "Gas fee for transaction",
      },
    ];

    setTransactions(mockTransactions);
    setIsLoading(false);
  }, []);

  if (authLoading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

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
              <VideoCallButton
                conversationId="demo-conversation"
                otherUserName="Demo User"
                variant="outline"
              />
            </div>
          </div>


          {/* Clean Tabs */}
          <Tabs defaultValue="wallet" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger value="wallet" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Crypto Wallet
              </TabsTrigger>
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

            <TabsContent value="wallet" className="space-y-6">
              <CryptoWallet />
            </TabsContent>

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
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Sample Investment Opportunity */}
               <InvestmentTransaction
                 matchId="sample-match-1"
                 amount={0.5}
                 recipientAddress="0x742d35Cc6634C0532925a3b8D0C8B7b0B0C8B7b0"
                 onTransactionComplete={(txHash) => {
                   console.log('Investment completed:', txHash)
                 }}
               />

               {/* Investment History */}
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
             </div>
           </TabsContent>

           <TabsContent value="babt" className="space-y-6">
             {/* BABT Verification Status */}
             <BABTVerificationFlow mode="status" showStartButton={true} />

             {/* Verification Actions */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Quick Verification Start */}
               <Card className="border-0 shadow-sm">
                 <CardContent className="p-6">
                   <div className="space-y-4">
                     <div className="flex items-center gap-2">
                       <Shield className="w-5 h-5 text-blue-500" />
                       <h3 className="font-medium">Start Verification</h3>
                     </div>
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                       Begin the BABT verification process with guided steps.
                     </p>
                     <Link href="/babt-protected" className="block">
                       <Button className="w-full bg-blue-600 hover:bg-blue-700">
                         <Shield className="w-4 h-4 mr-2" />
                         Verify BABT
                       </Button>
                     </Link>
                   </div>
                 </CardContent>
               </Card>

               {/* Access Full Verification Center */}
               <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                 <CardContent className="p-6">
                   <div className="space-y-4">
                     <div className="flex items-center gap-2">
                       <ExternalLink className="w-5 h-5 text-purple-500" />
                       <h3 className="font-medium">Verification Center</h3>
                     </div>
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                       Access all verification methods, advanced tools, and detailed guides.
                     </p>
                     <Link href="/babt-protected" className="block">
                       <Button variant="outline" className="w-full">
                         <ExternalLink className="w-4 h-4 mr-2" />
                         Open Full Center
                       </Button>
                     </Link>
                   </div>
                 </CardContent>
               </Card>
             </div>
           </TabsContent>
         </Tabs>
       </div>
     </div>
   </SidebarLayout>
 );
}