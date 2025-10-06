// Comprehensive Binance BABT Verification Component
// Provides complete workflow for verifying Binance App BABT tokens

'use client';

import { useState } from 'react';
import { useBinanceBABTVerification } from '@/hooks/use-binance-babt-verification';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Using a simple alert div instead since Alert component may not exist
import {
  Loader2,
  Wallet,
  CheckCircle,
  XCircle,
  Link,
  ExternalLink,
  Info,
  AlertTriangle,
  Shield,
  Clock
} from 'lucide-react';

export function BinanceBABTVerifier() {
  const {
    isLoading,
    isVerified,
    verificationMethod,
    binanceUserId,
    walletAddress,
    babtTokenIds,
    error,
    oAuthUrl,
    linkRequired,
    startOAuthVerification,
    completeOAuthVerification,
    verifyWalletLinking,
    linkWalletToBinance,
    reset,
  } = useBinanceBABTVerification();

  const [authCode, setAuthCode] = useState('');
  const [manualWalletAddress, setManualWalletAddress] = useState('');
  const [signature, setSignature] = useState('');
  const [activeTab, setActiveTab] = useState('oauth');

  const handleStartOAuth = () => {
    const url = startOAuthVerification();
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleCompleteOAuth = async () => {
    if (authCode.trim()) {
      await completeOAuthVerification(authCode.trim());
    }
  };

  const handleWalletLinking = async () => {
    if (manualWalletAddress.trim() && signature.trim()) {
      await verifyWalletLinking(manualWalletAddress.trim(), signature.trim());
    }
  };

  const handleWalletLinkingWithOAuth = async () => {
    if (manualWalletAddress.trim() && signature.trim() && authCode.trim()) {
      await linkWalletToBinance(
        manualWalletAddress.trim(),
        signature.trim(),
        authCode.trim()
      );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Binance BABT Verifier
          </div>
          <Badge variant={isVerified ? "default" : "secondary"}>
            {isVerified ? "Verified" : "Not Verified"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Comprehensive verification for Binance App BABT tokens with MetaMask integration
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Verification Status */}
        {isVerified && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <Badge variant="default" className="bg-green-500">
                BABT Verified via {verificationMethod}
              </Badge>
            </div>

            <div className="text-sm space-y-1 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              {binanceUserId && <div>Binance User ID: {binanceUserId}</div>}
              {walletAddress && <div>Linked Wallet: {walletAddress}</div>}
              {babtTokenIds && babtTokenIds.length > 0 && (
                <div>BABT Token IDs: {babtTokenIds.join(', ')}</div>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Link Required Notice */}
        {linkRequired && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              <p className="text-sm text-blue-600">
                Wallet linking required. Please connect your MetaMask wallet to your Binance account.
              </p>
            </div>
          </div>
        )}

        {/* Verification Methods */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="oauth">Binance OAuth</TabsTrigger>
            <TabsTrigger value="wallet">Wallet Linking</TabsTrigger>
          </TabsList>

          {/* Binance OAuth Tab */}
          <TabsContent value="oauth" className="space-y-4">
            <div className="space-y-3">
              <div className="text-sm font-medium">Step 1: Connect Binance Account</div>
              <Button
                onClick={handleStartOAuth}
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Connect Binance Account
                  </>
                )}
              </Button>

              {oAuthUrl && (
                <div className="text-xs text-muted-foreground">
                  Opens Binance OAuth in new window
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="text-sm font-medium">Step 2: Enter Authorization Code</div>
              <Input
                placeholder="Paste authorization code from Binance"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
              />
              <Button
                onClick={handleCompleteOAuth}
                disabled={isLoading || !authCode.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Complete Verification'
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Wallet Linking Tab */}
          <TabsContent value="wallet" className="space-y-4">
            <div className="space-y-3">
              <div className="text-sm font-medium">Step 1: Connect MetaMask Wallet</div>
              <Button
                onClick={() => setManualWalletAddress('0x...')} // This would connect to MetaMask
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Connect MetaMask
              </Button>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-medium">Step 2: Sign Message</div>
              <Input
                placeholder="Wallet address from MetaMask"
                value={manualWalletAddress}
                onChange={(e) => setManualWalletAddress(e.target.value)}
              />
              <Input
                placeholder="Signature from MetaMask"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleWalletLinking}
                disabled={isLoading || !manualWalletAddress.trim() || !signature.trim()}
                variant="outline"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Linked Wallet'
                )}
              </Button>

              <Button
                onClick={handleWalletLinkingWithOAuth}
                disabled={isLoading || !manualWalletAddress.trim() || !signature.trim() || !authCode.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Linking...
                  </>
                ) : (
                  <>
                    <Link className="mr-2 h-4 w-4" />
                    Link & Verify
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Information Panel */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Verification Methods
          </div>
          <div className="space-y-2 text-xs text-blue-700 dark:text-blue-300">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span><strong>Binance OAuth:</strong> Direct verification via Binance account</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span><strong>Wallet Linking:</strong> Link MetaMask to Binance account</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span><strong>On-chain Verification:</strong> Check BABT tokens on blockchain</span>
            </div>
          </div>
        </div>

        {/* Network Requirements */}
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            Requirements
          </div>
          <div className="space-y-1 text-xs text-yellow-700 dark:text-yellow-300">
            <div>🔗 Binance account with BABT tokens</div>
            <div>🦊 MetaMask wallet (for wallet linking)</div>
            <div>⛓️ Binance Smart Chain network</div>
          </div>
        </div>

        {/* Reset Button */}
        {(isVerified || error) && (
          <Button
            onClick={reset}
            variant="ghost"
            className="w-full"
          >
            Reset Verification
          </Button>
        )}

        {/* API Endpoints Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="font-medium">Available API Endpoints:</div>
          <div>• <code>GET /api/babt/comprehensive-verify</code> - Generate OAuth URL</div>
          <div>• <code>POST /api/babt/comprehensive-verify</code> - Verify BABT</div>
          <div>• <code>POST /api/babt/link-wallet</code> - Link wallet to Binance</div>
          <div>• <code>GET /api/babt/link-wallet</code> - Check wallet link status</div>
        </div>
      </CardContent>
    </Card>
  );
}