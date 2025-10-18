"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useScrollAnimationAdvanced,
  useStaggeredAnimation,
  useCounterAnimation,
  useParallaxScroll,
  useScrollReveal,
  useAdvancedStaggeredAnimation,
  useFloatingAnimation,
  useStickyHeaderAnimation
} from "@/lib/animations";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [currentStat, setCurrentStat] = useState(0);

  // Scroll animation refs and hooks
  const heroBadgeRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const heroButtonsRef = useRef<HTMLDivElement>(null);
  const heroStatsRef = useRef<HTMLDivElement>(null);

  // Enhanced animation hooks with better initial load handling
  const heroBadgeAnimation = useScrollAnimationAdvanced({ threshold: 0.1, delay: 100, triggerOnce: true });
  const heroTitleAnimation = useScrollAnimationAdvanced({ threshold: 0.05, delay: 200, triggerOnce: true });
  const heroSubtitleAnimation = useScrollAnimationAdvanced({ threshold: 0.05, delay: 300, triggerOnce: true });
  const heroButtonsAnimation = useScrollAnimationAdvanced({ threshold: 0.05, delay: 400, triggerOnce: true });
  const heroStatsAnimation = useScrollAnimationAdvanced({ threshold: 0.1, delay: 500, triggerOnce: true });

  // Parallax scrolling elements
  const parallaxBg1Ref = useRef<HTMLDivElement>(null);
  const parallaxBg2Ref = useRef<HTMLDivElement>(null);
  const parallaxBg1 = useParallaxScroll(0.3);
  const parallaxBg2 = useParallaxScroll(0.5);

  // Floating animation elements
  const floatingElement1Ref = useRef<HTMLDivElement>(null);
  const floatingElement2Ref = useRef<HTMLDivElement>(null);
  const floating1 = useFloatingAnimation({ intensity: 15, speed: 0.001, scrollMultiplier: 0.2 });
  const floating2 = useFloatingAnimation({ intensity: 12, speed: 0.0015, scrollMultiplier: 0.15 });

  // Sticky header animation
  const stickyHeader = useStickyHeaderAnimation({ threshold: 50, backgroundOpacity: 0.95 });

  // Enhanced scroll reveal animations for sections
  const heroReveal = useScrollReveal({ direction: 'up', distance: 50, delay: 100 });
  const problemReveal = useScrollReveal({ direction: 'left', distance: 40, delay: 200 });
  const solutionReveal = useScrollReveal({ direction: 'right', distance: 40, delay: 400 });
  const featuresReveal = useScrollReveal({ direction: 'up', distance: 60, delay: 100 });
  const successReveal = useScrollReveal({ direction: 'scale', distance: 30, delay: 200 });

  // Advanced staggered animations
  const featuresStaggerAdvanced = useAdvancedStaggeredAnimation({
    itemCount: 4,
    staggerDelay: 150,
    direction: 'up',
    distance: 40,
    threshold: 0.2
  });

  // Section animation refs
  const problemSectionRef = useRef<HTMLDivElement>(null);
  const solutionSectionRef = useRef<HTMLDivElement>(null);
  const featuresSectionRef = useRef<HTMLDivElement>(null);
  const processSectionRef = useRef<HTMLDivElement>(null);
  const successSectionRef = useRef<HTMLDivElement>(null);
  const pricingSectionRef = useRef<HTMLDivElement>(null);
  const ctaSectionRef = useRef<HTMLDivElement>(null);

  const problemAnimation = useScrollAnimationAdvanced({ threshold: 0.2, delay: 200 });
  const solutionAnimation = useScrollAnimationAdvanced({ threshold: 0.2, delay: 400 });
  const featuresAnimation = useScrollAnimationAdvanced({ threshold: 0.2, delay: 200 });
  const processAnimation = useScrollAnimationAdvanced({ threshold: 0.2, delay: 300 });
  const successAnimation = useScrollAnimationAdvanced({ threshold: 0.2, delay: 200 });
  const pricingAnimation = useScrollAnimationAdvanced({ threshold: 0.2, delay: 200 });
  const ctaAnimation = useScrollAnimationAdvanced({ threshold: 0.2, delay: 200 });

  // Enhanced staggered animations for cards and features
  const featuresStagger = useAdvancedStaggeredAnimation({
    itemCount: 4,
    staggerDelay: 150,
    direction: 'up',
    distance: 30,
    threshold: 0.1
  });
  const processStagger = useAdvancedStaggeredAnimation({
    itemCount: 4,
    staggerDelay: 200,
    direction: 'up',
    distance: 25,
    threshold: 0.1
  });
  const successStagger = useAdvancedStaggeredAnimation({
    itemCount: 3,
    staggerDelay: 250,
    direction: 'up',
    distance: 20,
    threshold: 0.1
  });

  // Set element refs for animation hooks with improved initial load handling
  useEffect(() => {
    // Use setTimeout to ensure DOM is fully rendered before setting refs
    const timer = setTimeout(() => {
      heroBadgeAnimation.setElementRef(heroBadgeRef.current);
      heroTitleAnimation.setElementRef(heroTitleRef.current);
      heroSubtitleAnimation.setElementRef(heroSubtitleRef.current);
      heroButtonsAnimation.setElementRef(heroButtonsRef.current);
      heroStatsAnimation.setElementRef(heroStatsRef.current);

      problemAnimation.setElementRef(problemSectionRef.current);
      solutionAnimation.setElementRef(solutionSectionRef.current);
      featuresAnimation.setElementRef(featuresSectionRef.current);
      processAnimation.setElementRef(processSectionRef.current);
      successAnimation.setElementRef(successSectionRef.current);
      pricingAnimation.setElementRef(pricingSectionRef.current);
      ctaAnimation.setElementRef(ctaSectionRef.current);

      // Set parallax element refs
      parallaxBg1.setElementRef(parallaxBg1Ref.current);
      parallaxBg2.setElementRef(parallaxBg2Ref.current);

      // Set floating element refs
      floating1.setElementRef(floatingElement1Ref.current);
      floating2.setElementRef(floatingElement2Ref.current);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Platform statistics with animations
  const platformStats = [
    { label: "Active Entrepreneurs", value: "12,847", icon: "🚀" },
    { label: "Investors", value: "3,291", icon: "💼" },
    { label: "Successful Matches", value: "8,634", icon: "🤝" },
    { label: "Total Investment", value: "$127M", icon: "📈" }
  ];

  const features = [
    {
      icon: "🎯",
      title: "AI-Powered Matching",
      description: "Our intelligent algorithm analyzes 50+ factors to find your perfect investment match",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: "🔒",
      title: "Multi-Tenant Security",
      description: "Enterprise-grade isolation with complete data separation per organization",
      color: "from-green-500 to-green-600"
    },
    {
      icon: "⚡",
      title: "Real-Time Everything",
      description: "Live updates, instant messaging, and real-time investment tracking",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: "📊",
      title: "Advanced Analytics",
      description: "Comprehensive insights and performance tracking per tenant",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const investmentProcess = [
    {
      step: "01",
      title: "Create Your Profile",
      description: "Entrepreneurs: Showcase your business idea with detailed financials and growth projections. Investors: Define your investment criteria and preferences.",
      icon: "👤"
    },
    {
      step: "02",
      title: "AI Matching Engine",
      description: "Our intelligent algorithm matches entrepreneurs with compatible investors based on industry, stage, geography, and investment criteria.",
      icon: "🧠"
    },
    {
      step: "03",
      title: "Due Diligence Tools",
      description: "Access comprehensive due diligence tools, document sharing, and virtual data rooms for secure information exchange.",
      icon: "🔍"
    },
    {
      step: "04",
      title: "Secure Transactions",
      description: "Complete investments through our integrated crypto wallet system with smart contract automation and legal compliance.",
      icon: "🔐"
    }
  ];

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  // Animate statistics counter - only start after authentication check is complete
  useEffect(() => {
    if (!isLoading) {
      const interval = setInterval(() => {
        setCurrentStat((prev) => (prev + 1) % platformStats.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  // Fallback mechanism to ensure animations trigger on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      // Force animations to be visible after a short delay to ensure content displays
      const elements = [
        heroBadgeRef.current,
        heroTitleRef.current,
        heroSubtitleRef.current,
        heroButtonsRef.current,
        heroStatsRef.current,
        problemSectionRef.current,
        solutionSectionRef.current,
        featuresSectionRef.current
      ];

      // Ensure all elements are visible initially
      elements.forEach(element => {
        if (element) {
          const rect = element.getBoundingClientRect();
          const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

          // If element is in viewport but animations haven't triggered, force scroll
          if (isVisible) {
            window.scrollTo({ top: window.scrollY + 1, behavior: 'smooth' });
            setTimeout(() => {
              window.scrollTo({ top: window.scrollY - 1, behavior: 'smooth' });
            }, 100);
          }
        }
      });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Show loading while checking authentication (but don't block content display)
  if (isLoading && typeof window !== 'undefined') {
    // Still show the homepage content while checking auth in background
  }

  // Redirect authenticated users to dashboard
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 scroll-smooth">
      <Navigation />

      {/* Hero Section */}
     <section className="relative overflow-hidden bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm scroll-mt-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/40 to-slate-900"></div>

        {/* Parallax Background Elements */}
        <div
          ref={parallaxBg1Ref}
          className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
          style={{
            transform: `translateY(${parallaxBg1.offset}px)`,
            transition: 'transform 0.1s linear'
          }}
        ></div>
        <div
          ref={parallaxBg2Ref}
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          style={{
            transform: `translateY(${parallaxBg2.offset}px)`,
            transition: 'transform 0.1s linear'
          }}
        ></div>

        {/* Floating Animation Elements */}
        <div
          ref={floatingElement1Ref}
          className="absolute top-32 right-32 w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-xl"
          style={{
            transform: `translate(${floating1.position.x}px, ${floating1.position.y}px)`,
            transition: 'transform 0.1s linear'
          }}
        ></div>
        <div
          ref={floatingElement2Ref}
          className="absolute bottom-32 left-32 w-12 h-12 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-xl"
          style={{
            transform: `translate(${floating2.position.x}px, ${floating2.position.y}px)`,
            transition: 'transform 0.1s linear'
          }}
        ></div>

        {/* Additional floating geometric shapes */}
        <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-blue-400/30 rotate-45 animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-purple-400/40 rounded-full animate-bounce"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <div
              ref={heroBadgeRef}
              className={`inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-6 py-2 mb-8 transition-all duration-700 ${
                heroBadgeAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-100'
              }`}
            >
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-300 font-medium">🔥 Multi-Tenant Investment Platform</span>
            </div>

            <h1
              ref={heroTitleRef}
              className={`text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent leading-tight transition-all duration-700 ${
                heroTitleAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-100'
              }`}
            >
              Connect Entrepreneurs
              <span className="block text-blue-400">with Smart Investors</span>
            </h1>

            <p
              ref={heroSubtitleRef}
              className={`text-xl md:text-2xl mb-12 max-w-4xl mx-auto text-slate-300 leading-relaxed transition-all duration-700 ${
                heroSubtitleAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-100'
              }`}
            >
              The intelligent platform that bridges visionary entrepreneurs with strategic investors through AI-powered matching,
              real-time collaboration, and enterprise-grade security.
            </p>

            <div
              ref={heroButtonsRef}
              className={`flex flex-col sm:flex-row gap-6 justify-center mb-16 transition-all duration-700 ${
                heroButtonsAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-100'
              }`}
            >
              <Link href="/auth/register">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-10 py-4 text-lg shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105">
                  🚀 Start Your Journey
                </Button>
              </Link>
              <Link href="#platform">
                <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white hover:text-slate-800 font-semibold px-10 py-4 text-lg backdrop-blur-sm transition-all duration-300 hover:scale-105">
                  Explore Platform
                </Button>
              </Link>
            </div>

            {/* Animated Statistics with Enhanced Effects */}
            <div
              ref={heroStatsRef}
              className={`grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto transition-all duration-700 ${
                heroStatsAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-100'
              }`}
            >
              {platformStats.map((stat, index) => (
                <div
                  key={index}
                  className={`text-center transform transition-all duration-500 hover:scale-105 hover:text-blue-400 ${
                    index === currentStat ? 'scale-110 text-blue-400' : 'scale-100 text-slate-400'
                  }`}
                >
                  <div className="text-3xl mb-2 animate-bounce">{stat.icon}</div>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1 transition-all duration-300 hover:text-blue-300">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-400 transition-colors duration-300 hover:text-slate-300">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-32 bg-slate-800/30 backdrop-blur-sm scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div
              ref={problemSectionRef}
              className={`transition-all duration-700 ${
                problemAnimation.isVisible ? 'opacity-100 translate-x-0' : 'opacity-100'
              }`}
            >
              <h2 className={`text-4xl md:text-5xl font-bold text-white mb-8 transition-all duration-500 ${
                problemAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-100'
              }`}>
                The Investment Gap is
                <span className={`block text-red-400 transition-all duration-500 delay-200 ${
                  problemAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-100'
                }`}>Real</span>
              </h2>
              <div className="space-y-6 text-lg text-slate-300">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-400 text-sm">❌</span>
                  </div>
                  <div>
                    <strong className="text-white">Entrepreneurs</strong> struggle to find the right investors who understand their vision and market potential.
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-400 text-sm">❌</span>
                  </div>
                  <div>
                    <strong className="text-white">Investors</strong> waste time reviewing mismatched opportunities that don't fit their criteria.
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-400 text-sm">❌</span>
                  </div>
                  <div>
                    <strong className="text-white">Traditional platforms</strong> lack the intelligence and security needed for serious investments.
                  </div>
                </div>
              </div>
            </div>

            <div
              ref={solutionSectionRef}
              className={`relative transition-all duration-700 ${
                solutionAnimation.isVisible ? 'opacity-100 translate-x-0' : 'opacity-100'
              }`}
            >
              <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-3xl p-8 border border-green-400/30 backdrop-blur-sm hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500 hover:scale-[1.02]">
                <h3 className="text-3xl font-bold text-white mb-6">Our Solution</h3>
                <div className="space-y-4 text-slate-300">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span>AI-powered matching with 95% compatibility accuracy</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span>Enterprise-grade security with multi-tenant isolation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span>Real-time collaboration and due diligence tools</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span>Integrated crypto wallet for secure transactions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section id="platform" className="py-32 bg-slate-800/50 backdrop-blur-sm scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Enterprise-Grade Investment Platform
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Built for serious entrepreneurs and professional investors who demand the highest standards in security, intelligence, and performance.
            </p>
          </div>

          <div
            ref={featuresSectionRef}
            className={`grid md:grid-cols-2 gap-8 mb-20 transition-all duration-700 ${
              featuresAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-100'
            }`}
          >
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 ${
                  featuresStaggerAdvanced.visibleItems.has(index) ? 'opacity-100 translate-y-0' : 'opacity-100'
                }`}
                style={{
                  transitionDelay: featuresStaggerAdvanced.visibleItems.has(index) ? `${index * 150}ms` : '0ms',
                  transitionDuration: '600ms'
                }}
              >
                <CardHeader className="text-center pb-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{feature.icon}</span>
                  </div>
                  <CardTitle className="text-2xl text-white mb-4 group-hover:text-blue-300 transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-slate-300 text-lg leading-relaxed group-hover:text-slate-200 transition-colors duration-300">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Investment Process */}
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-3xl p-12 border border-blue-400/30 backdrop-blur-sm">
            <h3 className="text-3xl font-bold text-white text-center mb-12">Your Investment Journey</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {investmentProcess.map((step, index) => (
                <div key={index} className="text-center group">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl">{step.icon}</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {step.step}
                    </div>
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-3">{step.title}</h4>
                  <p className="text-slate-300 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-32 bg-slate-800/30 backdrop-blur-sm relative">
        {/* Additional floating elements for success section */}
        <div className="absolute top-16 right-16 w-8 h-8 bg-green-400/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-6 h-6 bg-blue-400/20 rotate-12 animate-bounce"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold text-white mb-6 transition-all duration-700 ${
              successAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              Success Stories That Inspire
            </h2>
            <p className={`text-xl text-slate-300 max-w-3xl mx-auto transition-all duration-700 delay-200 ${
              successAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}>
              Real entrepreneurs and investors who found their perfect match on our platform.
            </p>
          </div>

          <div className={`grid md:grid-cols-3 gap-8 mb-16 transition-all duration-700 delay-400 ${
            successAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}>
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] group">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold">S</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold group-hover:text-green-300 transition-colors duration-300">Sarah Chen</h4>
                    <p className="text-slate-400">Founder, TechStart Inc.</p>
                  </div>
                </div>
                <CardDescription className="text-slate-300 text-lg group-hover:text-slate-200 transition-colors duration-300">
                  "Found my lead investor within 2 weeks of joining. The AI matching was incredibly accurate - they understood our fintech vision perfectly and provided not just capital, but strategic guidance."
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] group">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold">M</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold group-hover:text-blue-300 transition-colors duration-300">Michael Rodriguez</h4>
                    <p className="text-slate-400">Angel Investor</p>
                  </div>
                </div>
                <CardDescription className="text-slate-300 text-lg group-hover:text-slate-200 transition-colors duration-300">
                  "The quality of entrepreneurs on this platform is exceptional. The due diligence tools saved me weeks of work, and the matching algorithm found opportunities I would have never discovered otherwise."
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] group">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold">A</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold group-hover:text-purple-300 transition-colors duration-300">Amara Okafor</h4>
                    <p className="text-slate-400">CEO, GreenTech Solutions</p>
                  </div>
                </div>
                <CardDescription className="text-slate-300 text-lg group-hover:text-slate-200 transition-colors duration-300">
                  "Raised $2.5M in Series A funding through connections made on this platform. The real-time collaboration features made the entire process seamless and professional."
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Live Activity Feed */}
          <div className="bg-slate-900/50 rounded-2xl p-8 border border-slate-700">
            <h3 className="text-2xl font-bold text-white text-center mb-8">Live Platform Activity</h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-green-900/20 rounded-xl p-6 border border-green-500/30">
                <div className="text-3xl font-bold text-green-400 mb-2">247</div>
                <div className="text-slate-300">Active Entrepreneurs</div>
              </div>
              <div className="bg-blue-900/20 rounded-xl p-6 border border-blue-500/30">
                <div className="text-3xl font-bold text-blue-400 mb-2">89</div>
                <div className="text-slate-300">New Matches Today</div>
              </div>
              <div className="bg-purple-900/20 rounded-xl p-6 border border-purple-500/30">
                <div className="text-3xl font-bold text-purple-400 mb-2">$1.2M</div>
                <div className="text-slate-300">Invested This Week</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-slate-800/50 backdrop-blur-sm scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold text-white mb-6 transition-all duration-700 ${
              pricingAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              Investment-Focused Pricing
            </h2>
            <p className={`text-xl text-slate-300 max-w-3xl mx-auto transition-all duration-700 delay-200 ${
              pricingAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}>
              Choose the plan that matches your investment goals and scale your success.
            </p>
          </div>

          <div className={`grid md:grid-cols-3 gap-8 max-w-6xl mx-auto transition-all duration-700 delay-400 ${
            pricingAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}>
            {/* Starter Plan */}
            <Card className="relative hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader className="text-center pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <span className="text-2xl">🌱</span>
                </div>
                <CardTitle className="text-2xl text-white">Starter</CardTitle>
                <div className="text-4xl font-bold text-white mt-4">$0</div>
                <p className="text-slate-400">Perfect for exploring opportunities</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-green-400">✓</span>
                    <span className="text-slate-300">10 profile views per day</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-400">✓</span>
                    <span className="text-slate-300">Basic matching algorithm</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-400">✓</span>
                    <span className="text-slate-300">Standard due diligence tools</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-400">✓</span>
                    <span className="text-slate-300">Community support</span>
                  </div>
                </div>
                <Link href="/auth/register" className="w-full">
                  <Button className="w-full mt-6" variant="outline">
                    Get Started Free
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="relative hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-blue-500 bg-slate-800/50 border-blue-500 backdrop-blur-sm">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <CardHeader className="text-center pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <span className="text-2xl">⭐</span>
                </div>
                <CardTitle className="text-2xl text-white">Professional</CardTitle>
                <div className="text-4xl font-bold text-white mt-4">
                  $49<span className="text-lg text-slate-400">/month</span>
                </div>
                <p className="text-slate-400">For serious entrepreneurs & investors</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-400">✓</span>
                    <span className="text-slate-300">Unlimited profile access</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-blue-400">✓</span>
                    <span className="text-slate-300">AI-powered matching engine</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-blue-400">✓</span>
                    <span className="text-slate-300">Advanced due diligence suite</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-blue-400">✓</span>
                    <span className="text-slate-300">Priority investor access</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-blue-400">✓</span>
                    <span className="text-slate-300">Real-time collaboration tools</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-blue-400">✓</span>
                    <span className="text-slate-300">Priority support</span>
                  </div>
                </div>
                <Link href="/auth/register" className="w-full">
                  <Button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                    Start Professional
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="relative hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader className="text-center pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <span className="text-2xl">🏢</span>
                </div>
                <CardTitle className="text-2xl text-white">Enterprise</CardTitle>
                <div className="text-4xl font-bold text-white mt-4">
                  $199<span className="text-lg text-slate-400">/month</span>
                </div>
                <p className="text-slate-400">For organizations and funds</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-purple-400">✓</span>
                    <span className="text-slate-300">Everything in Professional</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-purple-400">✓</span>
                    <span className="text-slate-300">Multi-tenant organization</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-purple-400">✓</span>
                    <span className="text-slate-300">White-label customization</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-purple-400">✓</span>
                    <span className="text-slate-300">Advanced analytics dashboard</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-purple-400">✓</span>
                    <span className="text-slate-300">Dedicated account manager</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-purple-400">✓</span>
                    <span className="text-slate-300">Custom integrations</span>
                  </div>
                </div>
                <Link href="/auth/register" className="w-full">
                  <Button className="w-full mt-6" variant="outline">
                    Contact Sales
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className={`text-4xl md:text-5xl font-bold text-white mb-6 transition-all duration-700 ${
            ctaAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Ready to Transform Your Investment Journey?
          </h2>
          <p className={`text-xl text-slate-300 mb-12 leading-relaxed transition-all duration-700 delay-200 ${
            ctaAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}>
            Join thousands of entrepreneurs and investors who have already discovered their perfect match.
            Start building valuable connections today.
          </p>
          <div className={`flex flex-col sm:flex-row gap-6 justify-center transition-all duration-700 delay-400 ${
            ctaAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}>
            <Link href="/auth/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-12 py-4 text-lg shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105">
                🚀 Join the Platform
              </Button>
            </Link>
            <Link href="#platform">
              <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white hover:text-slate-800 font-semibold px-12 py-4 text-lg backdrop-blur-sm transition-all duration-300 hover:scale-105">
                Learn More
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className={`mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center transition-all duration-700 delay-600 ${
            ctaAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div>
              <div className="text-2xl font-bold text-blue-400 mb-1">99.9%</div>
              <div className="text-slate-400">Uptime</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400 mb-1">256-bit</div>
              <div className="text-slate-400">Encryption</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400 mb-1">SOC 2</div>
              <div className="text-slate-400">Compliant</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400 mb-1">24/7</div>
              <div className="text-slate-400">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900/50 backdrop-blur-sm text-white py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Strategic Partnership Platform
              </h3>
              <p className="text-slate-400 mb-6 max-w-lg leading-relaxed">
                The intelligent platform connecting entrepreneurs with smart investors through AI-powered matching,
                real-time collaboration, and enterprise-grade security.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">System Online</span>
                </div>
                <div className="text-slate-500">•</div>
                <div className="text-slate-400 text-sm">
                  {platformStats.reduce((acc, stat) => acc + parseInt(stat.value.replace(/[^0-9]/g, '')), 0).toLocaleString()}+ Active Users
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Platform</h4>
              <div className="space-y-2">
                <Link href="#platform" className="block text-slate-400 hover:text-white transition-colors">Features</Link>
                <Link href="#pricing" className="block text-slate-400 hover:text-white transition-colors">Pricing</Link>
                <Link href="/matches" className="block text-slate-400 hover:text-white transition-colors">Find Matches</Link>
                <Link href="/analytics" className="block text-slate-400 hover:text-white transition-colors">Analytics</Link>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
              <div className="space-y-2">
                <Link href="/help" className="block text-slate-400 hover:text-white transition-colors">Help Center</Link>
                <Link href="/contact" className="block text-slate-400 hover:text-white transition-colors">Contact Us</Link>
                <Link href="/security" className="block text-slate-400 hover:text-white transition-colors">Security</Link>
                <Link href="/privacy" className="block text-slate-400 hover:text-white transition-colors">Privacy</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-500">
                © 2024 Strategic Partnership Platform. Building meaningful investment connections.
              </p>
              <div className="flex items-center gap-6">
                <Link href="/terms" className="text-slate-400 hover:text-white transition-colors text-sm">Terms</Link>
                <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors text-sm">Privacy</Link>
                <Link href="/cookies" className="text-slate-400 hover:text-white transition-colors text-sm">Cookies</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
