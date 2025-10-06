/**
 * BABT Protected Page
 *
 * This page provides exclusive content and features for users who have verified
 * their Binance BABT (Binance Account Bound Token) ownership.
 *
 * Updated to use the new Binance BABT verification system that supports:
 * - Binance OAuth authentication (for Binance App BABT users)
 * - Wallet address linking (for Web3 BABT users)
 * - Comprehensive verification without requiring MetaMask for Binance users
 */

"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { BinanceBABTVerifier } from '@/components/wallet/binance-babt-verifier';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarLayout } from '@/components/navigation/sidebar';
import { Shield, Lock, Unlock, Crown, Star, CheckCircle, AlertCircle } from 'lucide-react';

export default function BABTProtectedPage() {
  const { user } = useAuth();
  const [isBABTVerified, setIsBABTVerified] = useState(false);
  const [babtData, setBABTData] = useState<{
    address: string;
    tokenIds: string[];
  } | null>(null);

  // Check if user has BABT verification using new comprehensive API
  useEffect(() => {
    const checkBABTStatus = async () => {
      try {
        // Check if user has stored verification data in localStorage
        const storedVerification = localStorage.getItem('babt_verification');

        if (storedVerification) {
          const verificationData = JSON.parse(storedVerification);
          setIsBABTVerified(true);
          setBABTData({
            address: verificationData.walletAddress || verificationData.binanceUserId,
            tokenIds: verificationData.babtTokenIds || []
          });
          return;
        }

        // If no stored data, check via API
        const response = await fetch('/api/babt/comprehensive-verify', {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.verification?.isValid) {
            setIsBABTVerified(true);
            setBABTData({
              address: data.verification.walletAddress || data.verification.binanceUserId,
              tokenIds: data.verification.babtTokenIds || []
            });

            // Store verification data for future use
            localStorage.setItem('babt_verification', JSON.stringify(data.verification));
          }
        }
      } catch (error) {
        console.error('Error checking BABT status:', error);
      }
    };

    if (user) {
      checkBABTStatus();
    }
  }, [user]);

  const handleVerificationComplete = async (result: {
    hasBABT: boolean;
    walletAddress?: string;
    binanceUserId?: string;
    babtTokenIds?: string[];
  }) => {
    if (result.hasBABT) {
      setIsBABTVerified(true);
      setBABTData({
        address: result.walletAddress || result.binanceUserId || 'Verified User',
        tokenIds: result.babtTokenIds || []
      });

      // Store verification data for future use
      const verificationData = {
        walletAddress: result.walletAddress,
        binanceUserId: result.binanceUserId,
        babtTokenIds: result.babtTokenIds,
        verifiedAt: new Date().toISOString()
      };
      localStorage.setItem('babt_verification', JSON.stringify(verificationData));
    }
  };

  const handleVerificationReset = () => {
    setIsBABTVerified(false);
    setBABTData(null);
    localStorage.removeItem('babt_verification');
  };

  if (!user) {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                Please sign in to access this page
              </CardDescription>
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-blue-600" />
              BABT Protected Area
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Exclusive content and features for BABT-verified users
            </p>
          </div>

          {isBABTVerified && babtData ? (
            /* Verified User Content */
            <div className="space-y-8">
              {/* Welcome Message */}
              <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <Crown className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                        Welcome, Verified User!
                      </h3>
                      <p className="text-green-700 dark:text-green-300">
                        You have access to exclusive BABT-protected features
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Exclusive Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Feature 1 */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      Premium Investments
                    </CardTitle>
                    <CardDescription>
                      Access to exclusive investment opportunities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Get early access to high-quality investment opportunities that are only available to verified users.
                    </p>
                    <Button className="w-full">
                      View Premium Offers
                    </Button>
                  </CardContent>
                </Card>

                {/* Feature 2 */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-500" />
                      Enhanced Security
                    </CardTitle>
                    <CardDescription>
                      Advanced security features and protection
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Your BABT verification provides enhanced account security and fraud protection.
                    </p>
                    <Button variant="outline" className="w-full">
                      Security Settings
                    </Button>
                  </CardContent>
                </Card>

                {/* Feature 3 */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-purple-500" />
                      VIP Support
                    </CardTitle>
                    <CardDescription>
                      Priority customer support and assistance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Get priority support from our dedicated team for all your questions and needs.
                    </p>
                    <Button variant="outline" className="w-full">
                      Contact Support
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Verification Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Your BABT Verification
                  </CardTitle>
                  <CardDescription>
                    Your current verification status and details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Verification Type</div>
                        <div className="font-mono text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-2 rounded">
                          Binance BABT Verified
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Account</div>
                        <div className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                          {babtData.address}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">BABT Tokens</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {babtData.tokenIds.length > 0 ? babtData.tokenIds.length : 'Verified'}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Verification Status</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-green-600 font-medium">Active & Valid</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Crown className="w-5 h-5 text-yellow-500" />
                        <span className="font-medium text-green-800 dark:text-green-200">Premium Access</span>
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                        <div>• Exclusive investment opportunities</div>
                        <div>• Enhanced security features</div>
                        <div>• Priority customer support</div>
                        <div>• Special rewards and benefits</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Verified on {new Date().toLocaleDateString()}</span>
                      <Button
                        onClick={handleVerificationReset}
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                      >
                        Refresh Status
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* BABT Verification Required */
            <div className="space-y-6">
              <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <AlertCircle className="h-6 w-6 text-blue-500" />
                    BABT Verification Required
                  </CardTitle>
                  <CardDescription>
                    Verify your Binance BABT tokens to access exclusive content and features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Connect your Binance account or link your wallet to verify your BABT ownership
                    </p>
                  </div>

                  <BinanceBABTVerifier />

                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                      Why verify your BABT?
                    </div>
                    <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      <div>• Access exclusive investment opportunities</div>
                      <div>• Enhanced account security and protection</div>
                      <div>• Priority customer support</div>
                      <div>• Special rewards and benefits</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reset Button */}
              <div className="text-center">
                <Button
                  onClick={handleVerificationReset}
                  variant="outline"
                  size="sm"
                >
                  Reset Verification
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}