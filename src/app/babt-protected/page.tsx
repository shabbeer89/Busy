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
              <CardDescription className="text-slate-300">Please sign in to access this page</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Enhanced Header with Navigation */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/wallet">
                <Button variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Wallet
                </Button>
              </Link>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/20 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5" />
              <div className="relative p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                        <Shield className="w-10 h-10" />
                      </div>
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-sm">
                        BABT Verification Center
                      </h1>
                      <p className="text-slate-200 text-lg mb-3">
                        Complete BABT verification center with all verification methods and tools
                      </p>
                    </div>
                  </div>

                  <Link href="/wallet">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                      <Wallet className="w-4 h-4 mr-2" />
                      Open Wallet
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Main Verification Component */}
          <BABTVerificationFlow
            mode="full"
            showTitle={false}
          />

          {/* Single Source of Truth - Verification Methods */}
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-slate-800/80 border-slate-600 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <CheckCircle className="w-5 h-5 text-blue-400" />
                Complete Verification Methods Guide
              </CardTitle>
              <CardDescription className="text-slate-300">
                Single source of truth for all BABT verification methods - this is the only place you need for complete verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-slate-800/80 border-slate-600 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-12 h-12 bg-blue-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-blue-400 font-bold text-lg">1</span>
                      </div>
                      <div className="font-bold text-white">Binance OAuth</div>
                    </div>
                    <div className="text-blue-400 mb-4 font-medium">
                      🔗 Direct Binance Account Verification (Recommended)
                    </div>
                    <div className="space-y-2 text-sm text-slate-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-blue-400" />
                        Most secure verification method
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-blue-400" />
                        No wallet connection needed
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-blue-400" />
                        Direct Binance account linking
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-blue-400" />
                        Recommended for new users
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-slate-700/70 border border-slate-600 rounded text-xs">
                      <strong className="text-slate-200">Best for:</strong>
                      <span className="text-slate-300"> Users who want the simplest, most secure verification</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-slate-800/80 border-slate-600 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-12 h-12 bg-purple-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-purple-400 font-bold text-lg">2</span>
                      </div>
                      <div className="font-bold text-white">Wallet Linking</div>
                    </div>
                    <div className="text-purple-400 mb-4 font-medium">
                      ⛓️ Link Web3 Wallet to Binance Account
                    </div>
                    <div className="space-y-2 text-sm text-slate-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-purple-400" />
                        Requires MetaMask wallet
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-purple-400" />
                        Links wallet to Binance account
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-purple-400" />
                        Good for DeFi integration
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-purple-400" />
                        Signature-based verification
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-slate-700/70 border border-slate-600 rounded text-xs">
                      <strong className="text-slate-200">Best for:</strong>
                      <span className="text-slate-300"> Users active in DeFi and Web3 ecosystems</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-slate-800/80 border-slate-600 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-12 h-12 bg-green-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-green-400 font-bold text-lg">3</span>
                      </div>
                      <div className="font-bold text-white">On-Chain Validation</div>
                    </div>
                    <div className="text-green-400 mb-4 font-medium">
                      🏛️ Direct Blockchain Token Verification
                    </div>
                    <div className="space-y-2 text-sm text-slate-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        Direct blockchain verification
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        Works with any Web3 wallet
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        Most decentralized approach
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        Advanced token validation
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-slate-700/70 border border-slate-600 rounded text-xs">
                      <strong className="text-slate-200">Best for:</strong>
                      <span className="text-slate-300"> Advanced users who prefer blockchain-native verification</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Important Notice */}
              <div className="mt-6 p-4 bg-slate-700/70 border border-slate-600 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-white mb-2">
                      Single Source of Truth
                    </div>
                    <div className="text-sm text-slate-300">
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
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600/20 via-blue-600/20 to-purple-600/20 border border-white/20 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 via-blue-600/5 to-purple-600/5" />
            <div className="relative">
              <Card className="bg-transparent border-0 shadow-none">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center shadow-lg">
                      <Wallet className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-center text-white text-2xl font-bold">
                    🌈 NFT/Token Validator
                  </CardTitle>
                  <CardTitle className="text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 text-xl font-semibold mb-2">
                    Advanced Multi-Chain Verification
                  </CardTitle>
                  <CardDescription className="text-center text-slate-200 text-lg">
                    Advanced on-chain BABT token validation for Web3 users who prefer blockchain-native verification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="p-4 bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-400/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">🖼️</span>
                        </div>
                        <div className="font-bold text-green-300">ERC-721</div>
                      </div>
                      <div className="text-sm text-green-200">NFT Tokens</div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-400/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">🎭</span>
                        </div>
                        <div className="font-bold text-blue-300">ERC-1155</div>
                      </div>
                      <div className="text-sm text-blue-200">Multi-Tokens</div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/30 border border-purple-400/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">💰</span>
                        </div>
                        <div className="font-bold text-purple-300">ERC-20</div>
                      </div>
                      <div className="text-sm text-purple-200">Fungible Tokens</div>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-slate-800/90 to-slate-700/90 border border-slate-600/50 rounded-xl mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-bold">🔧</span>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white">Technical Validation Hub</div>
                        <div className="text-sm text-slate-300">Direct blockchain verification of BABT token ownership</div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-300">
                      Professional-grade validation tool supporting all major token standards across multiple EVM chains.
                      Perfect for advanced users who need comprehensive blockchain-native verification.
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-400/30 rounded-xl">
                    <BABTValidator />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Benefits Section */}
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-slate-800/80 border-slate-600 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Why Complete BABT Verification?</CardTitle>
              <CardDescription className="text-slate-300">
                Unlock exclusive features and enhanced security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2 p-4 bg-slate-700/70 border border-slate-600 rounded-lg">
                  <div className="font-medium text-blue-400">🔐 Enhanced Security</div>
                  <div className="text-sm text-slate-300">
                    Multi-factor authentication and advanced security features for your account
                  </div>
                </div>

                <div className="space-y-2 p-4 bg-slate-700/70 border border-slate-600 rounded-lg">
                  <div className="font-medium text-green-400">💎 Premium Access</div>
                  <div className="text-sm text-slate-300">
                    Exclusive investment opportunities and early access to new features
                  </div>
                </div>

                <div className="space-y-2 p-4 bg-slate-700/70 border border-slate-600 rounded-lg">
                  <div className="font-medium text-purple-400">🏆 Priority Support</div>
                  <div className="text-sm text-slate-300">
                    Dedicated customer support and faster response times for verified users
                  </div>
                </div>

                <div className="space-y-2 p-4 bg-slate-700/70 border border-slate-600 rounded-lg">
                  <div className="font-medium text-orange-400">🎁 Special Rewards</div>
                  <div className="text-sm text-slate-300">
                    Exclusive rewards, bonuses, and benefits for BABT verified users
                  </div>
                </div>

                <div className="space-y-2 p-4 bg-slate-700/70 border border-slate-600 rounded-lg">
                  <div className="font-medium text-teal-400">📊 Advanced Analytics</div>
                  <div className="text-sm text-slate-300">
                    Detailed portfolio insights and advanced investment analytics
                  </div>
                </div>

                <div className="space-y-2 p-4 bg-slate-700/70 border border-slate-600 rounded-lg">
                  <div className="font-medium text-indigo-400">🔗 DeFi Integration</div>
                  <div className="text-sm text-slate-300">
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