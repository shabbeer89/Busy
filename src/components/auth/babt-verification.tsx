"use client";

import { useState } from 'react';
import { useBABTKYC } from '@/hooks/use-babt-kyc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  CheckCircle,
  XCircle,
  Wallet,
  Loader2,
  AlertCircle,
  ExternalLink,
  Copy,
  RefreshCw,
  Clock,
  Coins
} from 'lucide-react';
import { COMMON_SBT_ADDRESSES } from '@/lib/babt-validation';

interface BABTVerificationProps {
  onVerificationComplete?: (result: {
    hasBABT: boolean;
    address: string;
    tokenIds: string[];
  }) => void;
  onVerificationFailed?: (error: string) => void;
  requiredTokenCount?: number;
}

export function BABTVerification({
  onVerificationComplete,
  onVerificationFailed,
  requiredTokenCount = 1
}: BABTVerificationProps) {
  const {
    isLoading,
    hasBABT,
    tokenIds,
    contractName,
    contractSymbol,
    signedMessage,
    error,
    address,
    verifyBABT,
    connectAndVerifyBABT,
    reset,
  } = useBABTKYC();

  const [step, setStep] = useState<'connect' | 'verify' | 'complete'>('connect');

  const handleConnectAndVerify = async () => {
    try {
      const result = await connectAndVerifyBABT();

      if (result.address && result.result.hasBABT) {
        setStep('complete');
        onVerificationComplete?.({
          hasBABT: true,
          address: result.address,
          tokenIds: result.result.tokenIds
        });
      } else {
        setStep('verify');
        onVerificationFailed?.(result.result.error || 'Verification failed');
      }
    } catch (err) {
      setStep('verify');
      onVerificationFailed?.(err instanceof Error ? err.message : 'Connection failed');
    }
  };

  const handleManualVerification = async () => {
    // This would require manual address input - for now redirect to connect flow
    await handleConnectAndVerify();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900 dark:text-white">
            BABT Verification Required
          </CardTitle>
          <CardDescription className="text-lg">
            Verify your Binance Account Bound Token to access this feature
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={step} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connect" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Connect
          </TabsTrigger>
          <TabsTrigger value="verify" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Verify
          </TabsTrigger>
          <TabsTrigger value="complete" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Complete
          </TabsTrigger>
        </TabsList>

        {/* Connect Step */}
        <TabsContent value="connect" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Connect Your Wallet
              </CardTitle>
              <CardDescription>
                Connect your Web3 wallet to verify BABT ownership
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={handleConnectAndVerify}
                  disabled={isLoading}
                  className="h-20 flex-col gap-2 bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-6 h-6" />
                      Connect & Verify BABT
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleManualVerification}
                  disabled={isLoading}
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  size="lg"
                >
                  <Shield className="w-6 h-6" />
                  Manual Verification
                </Button>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                      What is BABT?
                    </div>
                    <div className="text-blue-700 dark:text-blue-300">
                      Binance Account Bound Token (BABT) is a Soulbound Token that serves as proof of KYC verification on Binance.
                      It cannot be transferred and represents your verified identity across Web3 applications.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verify Step */}
        <TabsContent value="verify" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-yellow-600" />
                Verification In Progress
              </CardTitle>
              <CardDescription>
                Checking BABT ownership on Binance Smart Chain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Verifying BABT Ownership</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        This may take a few moments...
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-red-800 dark:text-red-200">Verification Failed</div>
                      <div className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</div>
                    </div>
                  </div>
                </div>
              )}

              {!isLoading && !error && (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="font-medium text-gray-900 dark:text-white mb-2">Ready to Verify</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Click the button above to start BABT verification
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Complete Step */}
        <TabsContent value="complete" className="space-y-6">
          {hasBABT && (
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <CheckCircle className="w-5 h-5" />
                  BABT Verification Successful
                </CardTitle>
                <CardDescription>
                  Your Binance Account Bound Token has been verified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Wallet Address</div>
                      <div className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded flex items-center justify-between">
                        <span>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'N/A'}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => address && copyToClipboard(address)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Token Balance</div>
                      <div className="text-2xl font-bold text-green-600">{tokenIds.length} BABT</div>
                    </div>

                    {contractName && (
                      <div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Contract</div>
                        <div className="text-sm text-gray-900 dark:text-white">{contractName}</div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-200">Access Granted</span>
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300">
                        You now have access to BABT-protected features and content.
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                        View on Blockchain
                      </div>
                      <a
                        href={`https://bscscan.com/address/${COMMON_SBT_ADDRESSES.BABT_BSC}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View BABT Contract on BSCScan
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={reset} variant="outline" className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Verify Different Address
                  </Button>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    Continue to Application
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Requirements Info */}
      <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-lg">Verification Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Wallet className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">Web3 Wallet</div>
                <div className="text-gray-600 dark:text-gray-400">MetaMask or compatible</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="font-medium">BABT Token</div>
                <div className="text-gray-600 dark:text-gray-400">Binance Account Bound Token</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Coins className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="font-medium">BSC Network</div>
                <div className="text-gray-600 dark:text-gray-400">Binance Smart Chain</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}