"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, AnimatedCard } from "@/components/ui/card";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Static platform statistics for demo
  const realtimeStats = { onlineUsers: 247 };

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Redirect authenticated users to dashboard
  if (isAuthenticated) {
    return null;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 text-white relative overflow-hidden backdrop-blur-sm border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Build Strong Business Relationships
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto">
              Connect with entrepreneurs, investors, and mentors who share your goals and passions. Our intelligent matching algorithm finds the perfect business partners for lasting partnerships.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/auth/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8">
                  Join BusinessMatch
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Live indicator */}
            <div className="flex items-center justify-center gap-2 text-green-300">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">{realtimeStats?.onlineUsers || 0} entrepreneurs online now</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
               How BusinessMatch Works
             </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
               Our intelligent matching algorithm connects you with the right business partners based on compatibility and shared interests.
             </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Geo-Location</h3>
              <p className="text-gray-300 leading-relaxed">
                Connect with entrepreneurs and investors in your area for easier collaboration and local partnerships.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Shared Passions</h3>
              <p className="text-gray-300 leading-relaxed">
                Choose from 150+ hobbies and interests to find partners who share your values and work ethic.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Business Interests</h3>
              <p className="text-gray-300 leading-relaxed">
                Priority matching with entrepreneurs from your business sector for faster growth through shared knowledge.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Mutual Goals</h3>
              <p className="text-gray-300 leading-relaxed">
                Whether you're looking for investors, partnerships, or mentorship - find people with aligned objectives.
              </p>
            </div>
          </div>

          {/* Real-time indicator */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-green-900/20 border border-green-500/30 rounded-full px-6 py-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 font-medium">Real-time availability - See who's open to cooperation right now</span>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="py-24 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
               What You Can Achieve
             </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
               Join a community of entrepreneurs building meaningful business relationships and discovering new opportunities together.
             </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Link href="/matches" className="group">
              <AnimatedCard className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group-hover:scale-105 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <CardTitle className="text-xl text-white">Find Partners</CardTitle>
                  <CardDescription className="text-slate-300">
                    Discover entrepreneurs looking for partnerships, investments, or mentorship opportunities in your area.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full">Find Matches</Button>
                </CardContent>
              </AnimatedCard>
            </Link>

            <Link href="/messages" className="group">
              <AnimatedCard className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group-hover:scale-105 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <CardTitle className="text-xl text-white">Start Conversations</CardTitle>
                  <CardDescription className="text-slate-300">
                    Connect instantly with matched entrepreneurs who are currently available for business discussions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full">Send Messages</Button>
                </CardContent>
              </AnimatedCard>
            </Link>

            <Link href="/profile" className="group">
              <AnimatedCard className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group-hover:scale-105 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <CardTitle className="text-xl text-white">Build Your Profile</CardTitle>
                  <CardDescription className="text-slate-300">
                    Create a comprehensive profile highlighting your business interests, goals, and what you're looking for in partnerships.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full">Create Profile</Button>
                </CardContent>
              </AnimatedCard>
            </Link>

            <Link href="/analytics" className="group">
              <AnimatedCard className="h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105 dark:bg-slate-800 dark:border-slate-700">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">Track Progress</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Monitor your networking success, track connections made, and analyze your business relationship growth.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full">View Analytics</Button>
                </CardContent>
              </AnimatedCard>
            </Link>

            <Link href="#pricing" className="group">
              <AnimatedCard className="h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105 dark:bg-slate-800 dark:border-slate-700">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">Business Events</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Stay updated with local business events, networking meetups, and industry conferences in your area.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full">View Events</Button>
                </CardContent>
              </AnimatedCard>
            </Link>

            <Link href="/wallet" className="group">
              <AnimatedCard className="h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105 dark:bg-slate-800 dark:border-slate-700">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">Secure Transactions</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Handle investments and payments securely through our integrated crypto wallet system.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full">Manage Wallet</Button>
                </CardContent>
              </AnimatedCard>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-800/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
               Choose Your Plan
             </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
               Start building valuable business relationships today with our flexible pricing options.
             </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <AnimatedCard className="relative hover:shadow-lg transition-all duration-300 dark:bg-slate-800 dark:border-slate-700">
              <CardHeader className="text-center pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <CardTitle className="text-2xl text-gray-900 dark:text-white">Free</CardTitle>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mt-4">$0</div>
                <p className="text-gray-600 dark:text-gray-300">Perfect for getting started</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">20 daily profile views</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">Basic messaging</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">Business events calendar</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">Location-based matching</span>
                  </div>
                </div>
                <Link href="/auth/register" className="w-full">
                  <Button className="w-full mt-6" variant="outline">
                    Get Started Free
                  </Button>
                </Link>
              </CardContent>
            </AnimatedCard>

            {/* Premium Plan */}
            <AnimatedCard className="relative hover:shadow-lg transition-all duration-300 border-2 border-blue-500 dark:bg-slate-800 dark:border-blue-500">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <CardHeader className="text-center pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <CardTitle className="text-2xl text-gray-900 dark:text-white">Premium</CardTitle>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mt-4">
                  $6.99<span className="text-lg text-gray-600 dark:text-gray-400">/week</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">Unlimited access to opportunities</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">Unlimited profile views</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">Access to 1000+ entrepreneurs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">Advanced matching algorithm</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">Social Capital networking tools</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">Priority support</span>
                  </div>
                </div>
                <Link href="/auth/register" className="w-full">
                  <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700">
                    Start Premium Trial
                  </Button>
                </Link>
              </CardContent>
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
             Ready to Build Strong Business Relationships?
           </h2>
            <p className="text-xl text-slate-300 mb-8">
             Join BusinessMatch today and connect with entrepreneurs who share your vision and goals.
           </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-slate-800 hover:bg-gray-100">
                Join Now - It's Free!
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-slate-800">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900/50 backdrop-blur-sm text-white py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">BusinessMatch</h3>
            <p className="text-slate-400 mb-4 max-w-2xl mx-auto">
              The intelligent platform for building strong business relationships through shared goals, interests, and mutual growth opportunities.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-6">
              <Link href="#features" className="text-gray-400 hover:text-white transition-colors">Features</Link>
              <Link href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link>
              <Link href="/matches" className="text-gray-400 hover:text-white transition-colors">Find Partners</Link>
              <Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors">Sign In</Link>
            </div>
            <p className="text-gray-500">
              © 2024 BusinessMatch. Building meaningful business connections.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
