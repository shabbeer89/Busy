"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SidebarLayout } from "@/components/navigation/sidebar";
import { Search, ExternalLink, Copy, CheckCircle, AlertCircle, Wallet, TrendingUp, Activity, FileText, Zap, Coins, Info, ArrowUpRight } from "lucide-react";

interface TokenInfo {
  address: string;
  overview: {
    balance: string;
    value: string;
    tokenHoldings: string;
    tokenCount: number;
  };
  moreInfo: {
    privateNameTags: string[];
    contractCreator: string;
    creatorAddress: string;
    createdDate: string;
    tokenTracker: string;
  };
  multichainInfo: {
    totalValue: string;
    addressesFound: number;
    chains: Array<{
      name: string;
      balance: string;
      percentage: string;
      count: number;
    }>;
  };
}

export default function ScanTokenPage() {
  const [contractAddress, setContractAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Mock data matching the blockchain explorer interface
  const mockTokenInfo: TokenInfo = {
    address: "0x742d35Cc6634C0532925a3b8D0C8B7b0B0C8B7b0",
    overview: {
      balance: "0 BNB",
      value: "$0.00",
      tokenHoldings: "$61,043.72 (121 Tokens)",
      tokenCount: 121,
    },
    moreInfo: {
      privateNameTags: [],
      contractCreator: "Binance: Deployer 4",
      creatorAddress: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",
      createdDate: "3 yrs 42 days ago",
      tokenTracker: "Binance Account Bound To...(BABT)",
    },
    multichainInfo: {
      totalValue: "$63,202.64 (Multichain Portfolio)",
      addressesFound: 5,
      chains: [
        { name: "BNB Chain", balance: "$61,043", percentage: "97%", count: 27 },
        { name: "opBNB", balance: "$1,595", percentage: "3%", count: 1 },
        { name: "Ethereum", balance: "$511", percentage: "1%", count: 4 },
        { name: "Polygon", balance: "$31", percentage: "<1%", count: 2 },
        { name: "Arbitrum One", balance: "$17", percentage: "<1%", count: 1 },
        { name: "Optimism", balance: "$6", percentage: "<1%", count: 2 },
      ],
    },
  };

  const handleScan = async () => {
    if (!contractAddress.trim()) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setTokenInfo(mockTokenInfo);
      setIsLoading(false);
    }, 1000);
  };

  const copyToClipboard = async () => {
    if (tokenInfo) {
      await navigator.clipboard.writeText(tokenInfo.address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
              <Search className="w-8 h-8 text-blue-600" />
              Scan Token
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Analyze Binance Account Bound (BAB) tokens and smart contracts
            </p>
          </div>

          {/* Contract Address Input */}
          <Card className="mb-8 border-0 shadow-sm bg-gray-50 dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contract Address
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleScan}
                    disabled={isLoading || !contractAddress.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? "Scanning..." : "Scan Token"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Token Information Display */}
          {tokenInfo && (
            <>
              {/* Contract Address Header */}
              <Card className="mb-6 border-0 shadow-sm bg-gray-50 dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Coins className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-mono text-sm text-gray-600 dark:text-gray-400">
                          Contract Address
                        </div>
                        <div className="font-mono text-lg font-semibold text-gray-900 dark:text-white">
                          {formatAddress(tokenInfo.address)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={copyToClipboard}>
                        {copiedAddress ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Three Main Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Overview */}
                <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-800">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-gray-900 dark:text-white">Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                        <Coins className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">BNB BALANCE</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {tokenInfo.overview.balance}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">BNB VALUE</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {tokenInfo.overview.value}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">TOKEN HOLDINGS</div>
                        <div className="font-semibold text-blue-600 dark:text-blue-400">
                          {tokenInfo.overview.tokenHoldings}
                        </div>
                        <Badge variant="outline" className="mt-1">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {tokenInfo.overview.tokenCount} Tokens
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* More Info */}
                <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-800">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-gray-900 dark:text-white">More Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">PRIVATE NAME TAGS</div>
                      <div className="flex gap-2 flex-wrap">
                        {tokenInfo.moreInfo.privateNameTags.length > 0 ? (
                          tokenInfo.moreInfo.privateNameTags.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              + {tag}
                            </Badge>
                          ))
                        ) : (
                          <Button variant="outline" size="sm">
                            + Add
                          </Button>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">CONTRACT CREATOR</div>
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {tokenInfo.moreInfo.contractCreator}
                        </div>
                        <div className="font-mono text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {formatAddress(tokenInfo.moreInfo.creatorAddress)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {tokenInfo.moreInfo.createdDate}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">TOKEN TRACKER</div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                          <Zap className="w-3 h-3 text-yellow-600" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {tokenInfo.moreInfo.tokenTracker}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Multichain Info */}
                <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-800">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-gray-900 dark:text-white">Multichain Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                        <Activity className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {tokenInfo.multichainInfo.totalValue}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {tokenInfo.multichainInfo.addressesFound} addresses found via{" "}
                        <Badge variant="outline">Blockscan</Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Multichain Portfolio | 34 Chains
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {tokenInfo.multichainInfo.chains.map((chain, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                {chain.name} ({chain.count})
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {chain.balance} ({chain.percentage})
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                        ↓ Show 28 more chains
                      </div>
                      <div className="text-xs text-gray-500">
                        Last updated: less than 1 sec ago
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Information Tabs */}
              <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-800">
                <Tabs defaultValue="transactions" className="w-full">
                  <CardHeader className="pb-4">
                    <TabsList className="grid w-full grid-cols-7 bg-white dark:bg-gray-700">
                      <TabsTrigger value="transactions" className="flex items-center gap-1 text-xs">
                        <Activity className="w-3 h-3" />
                        Transactions
                      </TabsTrigger>
                      <TabsTrigger value="token-transfers" className="flex items-center gap-1 text-xs">
                        <ArrowUpRight className="w-3 h-3" />
                        Token Transfers (BEP-20)
                      </TabsTrigger>
                      <TabsTrigger value="nft-transfers" className="flex items-center gap-1 text-xs">
                        <FileText className="w-3 h-3" />
                        NFT Transfers
                      </TabsTrigger>
                      <TabsTrigger value="contract" className="flex items-center gap-1 text-xs">
                        <FileText className="w-3 h-3" />
                        Contract
                      </TabsTrigger>
                      <TabsTrigger value="events" className="flex items-center gap-1 text-xs">
                        <Zap className="w-3 h-3" />
                        Events
                      </TabsTrigger>
                      <TabsTrigger value="assets" className="flex items-center gap-1 text-xs">
                        <Coins className="w-3 h-3" />
                        Assets
                      </TabsTrigger>
                      <TabsTrigger value="info" className="flex items-center gap-1 text-xs">
                        <Info className="w-3 h-3" />
                        Info
                      </TabsTrigger>
                    </TabsList>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <TabsContent value="transactions" className="space-y-4">
                      <div className="text-center py-8">
                        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Transaction history will appear here</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="token-transfers" className="space-y-4">
                      <div className="text-center py-8">
                        <ArrowUpRight className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Token transfers will appear here</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="nft-transfers" className="space-y-4">
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">NFT transfers will appear here</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="contract" className="space-y-4">
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Contract details will appear here</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="events" className="space-y-4">
                      <div className="text-center py-8">
                        <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Contract events will appear here</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="assets" className="space-y-4">
                      <div className="text-center py-8">
                        <Coins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Assets will appear here</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="info" className="space-y-4">
                      <div className="text-center py-8">
                        <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Additional information will appear here</p>
                      </div>
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>
            </>
          )}

          {/* Empty State */}
          {!tokenInfo && (
            <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-800">
              <CardContent className="p-12 text-center">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Enter a Contract Address</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Paste a Binance Smart Chain contract address above to analyze BAB token information
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}