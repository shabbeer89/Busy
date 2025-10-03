"use client";

import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Connect Ideas with Investment
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              The premier platform for connecting innovative business ideas with the right investors through intelligent matching algorithms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Start as Creator
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Start as Investor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
               Why Choose BusinessMatch?
             </h2>
             <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
               Our intelligent platform makes it easy to find the perfect match between innovative ideas and investment opportunities.
             </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Matching</h3>
              <p className="text-gray-600">
                Our advanced algorithm matches business ideas with investors based on multiple compatibility factors.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Payments</h3>
              <p className="text-gray-600">
                Integrated crypto payment system ensures secure and transparent transactions between parties.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Updates</h3>
              <p className="text-gray-600">
                Get instant notifications when new matches are found or when opportunities arise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="py-24 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
               Explore Our Platform
             </h2>
             <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
               Discover all the powerful features that make BusinessMatch the premier platform for connecting ideas with investment.
             </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Link href="/offers" className="group">
              <Card className="h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <CardTitle className="text-xl">Browse Investment Offers</CardTitle>
                  <CardDescription>
                    Explore active investment opportunities from verified investors across multiple industries and funding stages.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full">View All Offers</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/ideas" className="group">
              <Card className="h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <CardTitle className="text-xl">Discover Business Ideas</CardTitle>
                  <CardDescription>
                    Browse innovative business ideas from entrepreneurs, each with detailed funding requirements and growth potential.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full">Explore Ideas</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/matches" className="group">
              <Card className="h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <CardTitle className="text-xl">View Your Matches</CardTitle>
                  <CardDescription>
                    See your personalized matches between business ideas and investment offers, complete with compatibility scores.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full">Check Matches</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/analytics" className="group">
              <Card className="h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <CardTitle className="text-xl">Platform Analytics</CardTitle>
                  <CardDescription>
                    Explore detailed analytics about platform activity, user engagement, and market trends.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full">View Analytics</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/messages" className="group">
              <Card className="h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-200 transition-colors">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <CardTitle className="text-xl">Messages</CardTitle>
                  <CardDescription>
                    Communicate directly with matched users to discuss opportunities and negotiate deals.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full">Open Messages</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/profile" className="group">
              <Card className="h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-pink-200 transition-colors">
                    <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <CardTitle className="text-xl">Profile Management</CardTitle>
                  <CardDescription>
                    Manage your profile, view activity history, and track your platform engagement.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full">Manage Profile</Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
             Ready to Get Started?
           </h2>
           <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
             Join our platform today and discover the perfect match for your business idea or investment opportunity.
           </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg">Create Account</Button>
            </Link>
            <Link href="/offers">
              <Button size="lg" variant="outline">Browse Offers</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">BusinessMatch</h3>
            <p className="text-gray-400 mb-4">
              Connecting innovative ideas with smart investment opportunities.
            </p>
            <p className="text-gray-500">
              © 2024 BusinessMatch. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
