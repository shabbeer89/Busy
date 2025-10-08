/**
 * BABT Protected Page - Enhanced Single Page Verification
 *
 * This page provides a comprehensive BABT verification experience using
 * the shared verification component in full mode for detailed setup flow.
 */

"use client";

import { useAuth } from '@/hooks/use-auth';
import { BABTVerificationFlow } from '@/components/wallet/babt-verification-flow';
import { BABTValidator } from '@/components/wallet/babt-validator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarLayout } from '@/components/navigation/sidebar';
import { Shield, ArrowLeft, Wallet, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function BABTProtectedPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
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
        <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>Please sign in to access this page</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Enhanced Header with Navigation */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/wallet">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Wallet
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
                  <Shield className="w-8 h-8 text-blue-600" />
                  BABT Verification Center
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete BABT verification center with all verification methods and tools
                </p>
              </div>

              <Link href="/wallet">
                <Button variant="outline">
                  <Wallet className="w-4 h-4 mr-2" />
                  Open Wallet
                </Button>
              </Link>
            </div>
          </div>

          {/* Main Verification Component */}
          <BABTVerificationFlow
            mode="full"
            showTitle={false}
          />

          {/* Single Source of Truth - Verification Methods */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                Complete Verification Methods Guide
              </CardTitle>
              <CardDescription>
                Single source of truth for all BABT verification methods - this is the only place you need for complete verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    <div className="font-bold text-blue-800 dark:text-blue-200">Binance OAuth</div>
                  </div>
                  <div className="text-blue-700 dark:text-blue-300 mb-4 font-medium">
                    🔗 Direct Binance Account Verification (Recommended)
                  </div>
                  <div className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Most secure verification method
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      No wallet connection needed
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Direct Binance account linking
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Recommended for new users
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-200 dark:bg-blue-800/30 rounded text-xs">
                    <strong>Best for:</strong> Users who want the simplest, most secure verification
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    <div className="font-bold text-purple-800 dark:text-purple-200">Wallet Linking</div>
                  </div>
                  <div className="text-purple-700 dark:text-purple-300 mb-4 font-medium">
                    ⛓️ Link Web3 Wallet to Binance Account
                  </div>
                  <div className="space-y-2 text-sm text-purple-600 dark:text-purple-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Requires MetaMask wallet
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Links wallet to Binance account
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Good for DeFi integration
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Signature-based verification
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-purple-200 dark:bg-purple-800/30 rounded text-xs">
                    <strong>Best for:</strong> Users active in DeFi and Web3 ecosystems
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                    <div className="font-bold text-green-800 dark:text-green-200">On-Chain Validation</div>
                  </div>
                  <div className="text-green-700 dark:text-green-300 mb-4 font-medium">
                    🏛️ Direct Blockchain Token Verification
                  </div>
                  <div className="space-y-2 text-sm text-green-600 dark:text-green-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Direct blockchain verification
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Works with any Web3 wallet
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Most decentralized approach
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Advanced token validation
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-green-200 dark:bg-green-800/30 rounded text-xs">
                    <strong>Best for:</strong> Advanced users who prefer blockchain-native verification
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                      Single Source of Truth
                    </div>
                    <div className="text-sm text-amber-700 dark:text-amber-300">
                      This page contains the complete and authoritative information about all BABT verification methods.
                      The wallet page shows only verification status and quick access - all detailed verification
                      processes and methods are consolidated here to avoid confusion and duplication.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* NFT Token Validator Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-green-500" />
                NFT/Token Validator (Advanced)
              </CardTitle>
              <CardDescription>
                Advanced on-chain BABT token validation for Web3 users who prefer blockchain-native verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    🔧 Technical Validation Tool
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    This validator supports ERC-721 (NFTs), ERC-1155 (Multi-tokens), and ERC-20 (Fungible tokens).
                    Use this for direct blockchain verification of BABT token ownership.
                  </div>
                </div>

                <BABTValidator />
              </div>
            </CardContent>
          </Card>

          {/* Benefits Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Why Complete BABT Verification?</CardTitle>
              <CardDescription>
                Unlock exclusive features and enhanced security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="font-medium text-blue-600 dark:text-blue-400">🔐 Enhanced Security</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Multi-factor authentication and advanced security features for your account
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-medium text-green-600 dark:text-green-400">💎 Premium Access</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Exclusive investment opportunities and early access to new features
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-medium text-purple-600 dark:text-purple-400">🏆 Priority Support</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Dedicated customer support and faster response times for verified users
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-medium text-orange-600 dark:text-orange-400">🎁 Special Rewards</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Exclusive rewards, bonuses, and benefits for BABT verified users
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-medium text-teal-600 dark:text-teal-400">📊 Advanced Analytics</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Detailed portfolio insights and advanced investment analytics
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-medium text-indigo-600 dark:text-indigo-400">🔗 DeFi Integration</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Seamless integration with DeFi protocols and yield farming opportunities
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}