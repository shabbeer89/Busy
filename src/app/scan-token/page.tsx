"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SidebarLayout } from "@/components/navigation/sidebar";
import { babtScanner, BABTokenInfo, WalletPortfolio, SmartContractInfo } from "@/lib/babt-scanner";
import { Search, ExternalLink, Copy, CheckCircle, AlertCircle, Wallet, TrendingUp, Activity, FileText, Zap, Coins, Info, ArrowUpRight, Loader2 } from "lucide-react";

interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  contractCreator: string;
  creationDate: string;
  isVerified: boolean;
  description?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    telegram?: string;
    discord?: string;
  };
}

export default function ScanTokenPage() {
  const [contractAddress, setContractAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<BABTokenInfo | null>(null);
  const [walletPortfolio, setWalletPortfolio] = useState<WalletPortfolio | null>(null);
  const [contractInfo, setContractInfo] = useState<SmartContractInfo | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!contractAddress.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // First, try to get wallet portfolio if it's a wallet address
      const isContract = await babtScanner.analyzeSmartContract(contractAddress);

      if (isContract.isContract) {
        // It's a smart contract - scan as BAB token
        const babTokenInfo = await babtScanner.scanBABToken(contractAddress);
        setTokenInfo(babTokenInfo);
        setContractInfo(isContract);
      } else {
        // It's a wallet address - get portfolio
        const portfolio = await babtScanner.getWalletPortfolio(contractAddress);
        setWalletPortfolio(portfolio);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Scan error:', err);
    } finally {
      setIsLoading(false);
    }
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
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
              <Search className="w-8 h-8 text-blue-400" />
              Scan Token
            </h1>
            <p className="text-slate-300">
              Analyze Binance Account Bound (BAB) tokens and smart contracts
            </p>
          </div>

          {/* Contract Address Input */}
          <Card className="mb-8 border-0 shadow-sm bg-slate-800/50 border-slate-600">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Contract or Wallet Address
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-600 rounded-lg bg-slate-700 text-white font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleScan}
                    disabled={isLoading || !contractAddress.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Scan
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* BAB Token Information Display */}
          {tokenInfo && (
            <>
              {/* Contract Address Header */}
              <Card className="mb-6 border-0 shadow-sm bg-slate-800/50 border-slate-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-900/20 rounded-full flex items-center justify-center">
                        <Coins className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="font-mono text-sm text-slate-400">
                          Contract Address
                        </div>
                        <div className="font-mono text-lg font-semibold text-white">
                          {formatAddress(tokenInfo.address)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={copyToClipboard} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        {copiedAddress ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Token Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Token Overview */}
                <Card className="border-0 shadow-sm bg-slate-800/50 border-slate-600">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-white">Token Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-slate-400 mb-1">Name</div>
                        <div className="font-semibold text-white">{tokenInfo.name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400 mb-1">Symbol</div>
                        <div className="font-semibold text-white">{tokenInfo.symbol}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400 mb-1">Decimals</div>
                        <div className="font-semibold text-white">{tokenInfo.decimals}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400 mb-1">Total Supply</div>
                        <div className="font-semibold text-white">{tokenInfo.totalSupply}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-slate-400 mb-2">Contract Creator</div>
                      <div className="font-medium text-white">{tokenInfo.contractCreator}</div>
                      <div className="text-xs text-slate-400 mt-1">Created: {tokenInfo.creationDate}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={tokenInfo.isVerified ? 'bg-green-900/20 text-green-400' : 'bg-orange-900/20 text-orange-400'}>
                        {tokenInfo.isVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                      {tokenInfo.symbol === 'BABT' && (
                        <Badge className="bg-blue-900/20 text-blue-400">
                          Soulbound Token
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Token Metadata */}
                <Card className="border-0 shadow-sm bg-slate-800/50 border-slate-600">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-white">Token Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {tokenInfo.description && (
                      <div>
                        <div className="text-sm text-slate-400 mb-2">Description</div>
                        <div className="text-sm text-slate-300">{tokenInfo.description}</div>
                      </div>
                    )}

                    {tokenInfo.website && (
                      <div>
                        <div className="text-sm text-slate-400 mb-2">Website</div>
                        <a href={tokenInfo.website} target="_blank" rel="noopener noreferrer"
                           className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
                          {tokenInfo.website}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {tokenInfo.socialLinks && (
                      <div>
                        <div className="text-sm text-slate-400 mb-2">Social Links</div>
                        <div className="flex gap-2">
                          {tokenInfo.socialLinks.twitter && (
                            <a href={tokenInfo.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                               className="text-blue-400 hover:text-blue-300">
                              Twitter
                            </a>
                          )}
                          {tokenInfo.socialLinks.telegram && (
                            <a href={tokenInfo.socialLinks.telegram} target="_blank" rel="noopener noreferrer"
                               className="text-blue-400 hover:text-blue-300">
                              Telegram
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Contract Analysis */}
              {contractInfo && (
                <Card className="mb-6 border-0 shadow-sm bg-slate-800/50 border-slate-600">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-white">Contract Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="text-sm text-slate-400">Contract Name</div>
                        <div className="font-medium text-white">{contractInfo.contractName || 'Unknown'}</div>
                      </div>
                      <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="text-sm text-slate-400">Compiler</div>
                        <div className="font-medium text-white text-xs">{contractInfo.compilerVersion || 'Unknown'}</div>
                      </div>
                      <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="text-sm text-slate-400">Optimization</div>
                        <div className="font-medium text-white">{contractInfo.optimization ? 'Yes' : 'No'}</div>
                      </div>
                      <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="text-sm text-slate-400">License</div>
                        <div className="font-medium text-white text-xs">{contractInfo.license || 'Unknown'}</div>
                      </div>
                    </div>

                    {contractInfo.sourceCode && (
                      <div>
                        <div className="text-sm text-slate-400 mb-2">Source Code Available</div>
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-600">
                          <pre className="text-xs text-slate-300 overflow-x-auto">
                            {contractInfo.sourceCode.slice(0, 500)}...
                          </pre>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Wallet Portfolio Display */}
              {walletPortfolio && (
                <Card className="mb-6 border-0 shadow-sm bg-slate-800/50 border-slate-600">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-white">Wallet Portfolio</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="text-lg font-bold text-white">{walletPortfolio.bnbBalance}</div>
                        <div className="text-sm text-slate-400">BNB Balance</div>
                      </div>
                      <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="text-lg font-bold text-green-400">{walletPortfolio.bnbValue}</div>
                        <div className="text-sm text-slate-400">BNB Value</div>
                      </div>
                      <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="text-lg font-bold text-blue-400">{walletPortfolio.totalValue}</div>
                        <div className="text-sm text-slate-400">Total Value</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-slate-400 mb-3">
                        Token Holdings ({walletPortfolio.tokenCount} tokens)
                      </div>
                      <div className="space-y-2">
                        {walletPortfolio.tokenBalances.slice(0, 5).map((token, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-700/70 rounded-lg border border-slate-600">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-blue-900/20 rounded-full flex items-center justify-center">
                                <Coins className="w-3 h-3 text-blue-400" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white">{token.tokenSymbol}</div>
                                <div className="text-xs text-slate-400">{token.balance} tokens</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-green-400">{token.usdValue || '$0.00'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contract Details Tabs */}
              <Card className="border-0 shadow-sm bg-slate-800/50 border-slate-600">
                <Tabs defaultValue="contract" className="w-full">
                  <CardHeader className="pb-4">
                    <TabsList className="grid w-full grid-cols-4 bg-slate-700">
                      <TabsTrigger value="contract" className="flex items-center gap-1 text-xs text-slate-300">
                        <FileText className="w-3 h-3" />
                        Contract
                      </TabsTrigger>
                      <TabsTrigger value="transactions" className="flex items-center gap-1 text-xs text-slate-300">
                        <Activity className="w-3 h-3" />
                        Transactions
                      </TabsTrigger>
                      <TabsTrigger value="analysis" className="flex items-center gap-1 text-xs text-slate-300">
                        <TrendingUp className="w-3 h-3" />
                        Analysis
                      </TabsTrigger>
                      <TabsTrigger value="security" className="flex items-center gap-1 text-xs text-slate-300">
                        <Zap className="w-3 h-3" />
                        Security
                      </TabsTrigger>
                    </TabsList>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <TabsContent value="contract" className="space-y-4">
                      {contractInfo ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-slate-400 mb-1">Contract Name</div>
                              <div className="font-medium text-white">{contractInfo.contractName || 'Unknown'}</div>
                            </div>
                            <div>
                              <div className="text-sm text-slate-400 mb-1">Compiler Version</div>
                              <div className="font-medium text-white">{contractInfo.compilerVersion || 'Unknown'}</div>
                            </div>
                            <div>
                              <div className="text-sm text-slate-400 mb-1">Optimization</div>
                              <div className="font-medium text-white">{contractInfo.optimization ? 'Enabled' : 'Disabled'}</div>
                            </div>
                            <div>
                              <div className="text-sm text-slate-400 mb-1">License</div>
                              <div className="font-medium text-white">{contractInfo.license || 'Unknown'}</div>
                            </div>
                          </div>

                          {contractInfo.sourceCode && (
                            <div>
                              <div className="text-sm text-slate-400 mb-2">Contract Source Code</div>
                              <div className="bg-slate-900 p-3 rounded-lg border border-slate-600 max-h-64 overflow-y-auto">
                                <pre className="text-xs text-slate-300">
                                  {contractInfo.sourceCode.slice(0, 2000)}...
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                          <p className="text-slate-400">No contract information available</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="transactions" className="space-y-4">
                      <div className="text-center py-8">
                        <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-400">Transaction history will be available in the full version</p>
                        <p className="text-xs text-slate-500 mt-2">Integration with BscScan API required</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="analysis" className="space-y-4">
                      <div className="text-center py-8">
                        <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-400">Advanced analysis features coming soon</p>
                        <p className="text-xs text-slate-500 mt-2">Contract vulnerability scanning, gas optimization analysis</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="security" className="space-y-4">
                      <div className="text-center py-8">
                        <Zap className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-400">Security audit features coming soon</p>
                        <p className="text-xs text-slate-500 mt-2">Reentrancy checks, access control verification</p>
                      </div>
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>
            </>
          )}

          {/* Empty State */}
          {!tokenInfo && !walletPortfolio && !isLoading && (
            <Card className="border-0 shadow-sm bg-slate-800/50 border-slate-600">
              <CardContent className="p-12 text-center">
                <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">Enter Address to Scan</h3>
                <p className="text-slate-400">
                  Enter a Binance Smart Chain contract address or wallet address above to analyze BAB tokens and smart contracts
                </p>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isLoading && (
            <Card className="border-0 shadow-sm bg-slate-800/50 border-slate-600">
              <CardContent className="p-12 text-center">
                <Loader2 className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">Scanning...</h3>
                <p className="text-slate-400">
                  Analyzing blockchain data and contract information
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}