"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, AnimatedCard } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, ExternalLink, Copy, CheckCircle, AlertCircle } from "lucide-react";
import { animations } from "@/lib/animations";

interface ContractInfo {
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

interface ContractInfoProps {
  contractAddress?: string;
  onContractAddressChange?: (address: string) => void;
}

export function ContractInfo({ contractAddress, onContractAddressChange }: ContractInfoProps) {
  const [address, setAddress] = useState(contractAddress || "");
  const [isLoading, setIsLoading] = useState(false);
  const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Mock data for demonstration
  const mockContractInfo: ContractInfo = {
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

  const handleSearch = async () => {
    if (!address.trim()) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setContractInfo(mockContractInfo);
      onContractAddressChange?.(address);
      setIsLoading(false);
    }, 1000);
  };

  const copyToClipboard = async () => {
    if (contractInfo) {
      await navigator.clipboard.writeText(contractInfo.address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      {/* Contract Address Search */}
      <AnimatedCard className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${animations.cardHover} dark:bg-slate-800 dark:border-slate-700`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Contract Information Lookup
          </CardTitle>
          <CardDescription>
            Enter a contract address to view detailed information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor="contract-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contract Address
              </label>
              <Input
                id="contract-address"
                placeholder="0x..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={isLoading || !address.trim()}>
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>
        </CardContent>
      </AnimatedCard>

      {/* Contract Information Display */}
      {contractInfo && (
        <>
          {/* Overview Section */}
          <AnimatedCard className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${animations.cardHover} dark:bg-slate-800 dark:border-slate-700`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Overview</CardTitle>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                    {formatAddress(contractInfo.address)}
                  </code>
                  <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                    {copiedAddress ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">BNB BALANCE</div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">B</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {contractInfo.overview.balance}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">BNB VALUE</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {contractInfo.overview.value}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">TOKEN HOLDINGS</div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-blue-600">
                      {contractInfo.overview.tokenHoldings}
                    </span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {contractInfo.overview.tokenCount} Tokens
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          {/* More Info and Multichain Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* More Info */}
            <AnimatedCard className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${animations.cardHover} dark:bg-slate-800 dark:border-slate-700`}>
              <CardHeader>
                <CardTitle>More Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">PRIVATE NAME TAGS</div>
                  <div className="flex gap-2 flex-wrap">
                    {contractInfo.moreInfo.privateNameTags.length > 0 ? (
                      contractInfo.moreInfo.privateNameTags.map((tag, index) => (
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
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">CONTRACT CREATOR</div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {contractInfo.moreInfo.contractCreator}
                    </span>
                    <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                      {formatAddress(contractInfo.moreInfo.creatorAddress)}
                    </code>
                    <span className="text-xs text-gray-500">
                      {contractInfo.moreInfo.createdDate}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">TOKEN TRACKER</div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">🎯</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {contractInfo.moreInfo.tokenTracker}
                    </span>
                  </div>
                </div>
              </CardContent>
            </AnimatedCard>

            {/* Multichain Info */}
            <AnimatedCard className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${animations.cardHover} dark:bg-slate-800 dark:border-slate-700`}>
              <CardHeader>
                <CardTitle>Multichain Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">🌐</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {contractInfo.multichainInfo.totalValue}
                  </span>
                </div>

                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {contractInfo.multichainInfo.addressesFound} addresses found via{" "}
                    <Badge variant="outline">Blockscan</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Multichain Portfolio | 34 Chains
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {contractInfo.multichainInfo.chains.map((chain, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700 rounded">
                        <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-xs font-medium text-gray-900 dark:text-white">
                            {chain.name} ({chain.count})
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">
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
            </AnimatedCard>
          </div>

          {/* Detailed Tabs */}
          <AnimatedCard className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${animations.cardHover} dark:bg-slate-800 dark:border-slate-700`}>
            <Tabs defaultValue="transactions" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="token-transfers">Token Transfers (BEP-20)</TabsTrigger>
                <TabsTrigger value="nft-transfers">NFT Transfers</TabsTrigger>
                <TabsTrigger value="contract">Contract</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="assets">Assets</TabsTrigger>
                <TabsTrigger value="info">Info</TabsTrigger>
              </TabsList>

              <TabsContent value="transactions" className="space-y-4">
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-300">Transaction history will appear here</p>
                  </div>
                </CardContent>
              </TabsContent>

              <TabsContent value="token-transfers" className="space-y-4">
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-300">Token transfers will appear here</p>
                  </div>
                </CardContent>
              </TabsContent>

              <TabsContent value="nft-transfers" className="space-y-4">
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-300">NFT transfers will appear here</p>
                  </div>
                </CardContent>
              </TabsContent>

              <TabsContent value="contract" className="space-y-4">
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-300">Contract details will appear here</p>
                  </div>
                </CardContent>
              </TabsContent>

              <TabsContent value="events" className="space-y-4">
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-300">Contract events will appear here</p>
                  </div>
                </CardContent>
              </TabsContent>

              <TabsContent value="assets" className="space-y-4">
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-300">Assets will appear here</p>
                  </div>
                </CardContent>
              </TabsContent>

              <TabsContent value="info" className="space-y-4">
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-300">Additional information will appear here</p>
                  </div>
                </CardContent>
              </TabsContent>
            </Tabs>
          </AnimatedCard>
        </>
      )}
    </div>
  );
}