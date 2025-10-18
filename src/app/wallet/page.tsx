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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-slate-300">Loading...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!user) {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <Card className="w-full max-w-md bg-slate-800/80 border-slate-600 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-white">Access Denied</CardTitle>
              <CardDescription className="text-slate-300">Please sign in to access your wallet.</CardDescription>
            </CardHeader>
          </Card>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Enhanced Header with Gradient Background */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/20 backdrop-blur-sm mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5" />
            <div className="relative p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                      💰
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-sm">
                      Crypto Wallet Dashboard
                    </h1>
                    <p className="text-slate-200 text-lg mb-3">
                      Manage your crypto assets, track investments, and access advanced features
                    </p>
                  </div>
                </div>

                <VideoCallButton
                  conversationId="demo-conversation"
                  otherUserName="Demo User"
                  variant="outline"
                />
              </div>
            </div>
          </div>


          {/* Enhanced Colorful Tabs */}
          <Tabs defaultValue="wallet" className="w-full">
            <div className="relative overflow-hidden rounded-2xl bg-slate-800/80 border border-slate-600 backdrop-blur-sm p-2 mb-8">
              <TabsList className="grid w-full grid-cols-4 bg-transparent">
                <TabsTrigger
                  value="wallet"
                  className="flex items-center gap-2 data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400 text-slate-300 hover:text-white transition-all"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Crypto Wallet</span>
                  <span className="sm:hidden">Wallet</span>
                </TabsTrigger>
                <TabsTrigger
                  value="transactions"
                  className="flex items-center gap-2 data-[state=active]:bg-green-600/20 data-[state=active]:text-green-400 text-slate-300 hover:text-white transition-all"
                >
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:inline">Transactions</span>
                  <span className="sm:hidden">Txns</span>
                </TabsTrigger>
                <TabsTrigger
                  value="portfolio"
                  className="flex items-center gap-2 data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400 text-slate-300 hover:text-white transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Portfolio</span>
                  <span className="sm:hidden">Port</span>
                </TabsTrigger>
                <TabsTrigger
                  value="babt"
                  className="flex items-center gap-2 data-[state=active]:bg-orange-600/20 data-[state=active]:text-orange-400 text-slate-300 hover:text-white transition-all"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">BABT</span>
                  <span className="sm:hidden">BABT</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="wallet" className="space-y-6">
              <CryptoWallet />
            </TabsContent>

            <TabsContent value="transactions" className="space-y-6">
             <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-slate-800/80 border-slate-600 backdrop-blur-sm">
               <CardContent className="p-8">
                 <div className="text-center py-12">
                   <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Activity className="w-8 h-8 text-white" />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2">No Transactions Yet</h3>
                   <p className="text-slate-300 mb-6">
                     Your crypto transactions will appear here once you start trading
                   </p>
                   <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                     Start Trading
                   </Button>
                 </div>
               </CardContent>
             </Card>
            </TabsContent>

           <TabsContent value="portfolio" className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Sample Investment Opportunity */}
               <div className="p-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-400/30 rounded-xl">
                 <InvestmentTransaction
                   matchId="sample-match-1"
                   amount={0.5}
                   recipientAddress="0x742d35Cc6634C0532925a3b8D0C8B7b0B0C8B7b0"
                   onTransactionComplete={(txHash) => {
                     console.log('Investment completed:', txHash)
                   }}
                 />
               </div>

               {/* Investment History */}
               <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-slate-800/80 border-slate-600 backdrop-blur-sm">
                 <CardContent className="p-8">
                   <div className="text-center py-12">
                     <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Plus className="w-8 h-8 text-white" />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-2">No Investments Yet</h3>
                     <p className="text-slate-300 mb-6">
                       Start investing in promising projects and innovative ideas
                     </p>
                     <Link href="/offers">
                       <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
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
             <div className="p-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-400/30 rounded-xl">
               <BABTVerificationFlow mode="status" showStartButton={true} />
             </div>

             {/* Enhanced Verification Actions */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Quick Verification Start */}
               <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-slate-800/80 border-slate-600 backdrop-blur-sm">
                 <CardContent className="p-6">
                   <div className="space-y-4">
                     <div className="flex items-center gap-3">
                       <div className="w-12 h-12 bg-blue-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                         <Shield className="w-6 h-6 text-blue-400" />
                       </div>
                       <div>
                         <h3 className="font-bold text-white">Start Verification</h3>
                         <p className="text-sm text-slate-300">Begin with guided steps</p>
                       </div>
                     </div>
                     <p className="text-sm text-slate-300">
                       Quick and easy BABT verification process with step-by-step guidance.
                     </p>
                     <Link href="/babt-protected" className="block">
                       <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                         <Shield className="w-4 h-4 mr-2" />
                         Verify BABT
                       </Button>
                     </Link>
                   </div>
                 </CardContent>
               </Card>

               {/* Access Full Verification Center */}
               <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-slate-800/80 border-slate-600 backdrop-blur-sm">
                 <CardContent className="p-6">
                   <div className="space-y-4">
                     <div className="flex items-center gap-3">
                       <div className="w-12 h-12 bg-purple-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                         <ExternalLink className="w-6 h-6 text-purple-400" />
                       </div>
                       <div>
                         <h3 className="font-bold text-white">Full Center</h3>
                         <p className="text-sm text-slate-300">Complete verification hub</p>
                       </div>
                     </div>
                     <p className="text-sm text-slate-300">
                       Access all verification methods, advanced tools, and comprehensive guides.
                     </p>
                     <Link href="/babt-protected" className="block">
                       <Button variant="outline" className="w-full border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white">
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