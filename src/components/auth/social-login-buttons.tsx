"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

interface SocialLoginButtonsProps {
  callbackUrl?: string;
}

export function SocialLoginButtons({ callbackUrl = "/dashboard" }: SocialLoginButtonsProps) {
  const [isLoading, setIsLoading] = useState<{ google: boolean; linkedin: boolean }>({
    google: false,
    linkedin: false,
  });

  const [isClient, setIsClient] = useState(false);

  // Fix hydration error by ensuring client-side only rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(prev => ({ ...prev, google: true }));
    try {
      const result = await signIn("google", {
        callbackUrl,
        redirect: false
      });

      if (result?.error) {
        console.error("Google sign-in error:", result.error);
        // You could show a toast notification here
        alert(`Google sign-in failed: ${result.error}`);
      } else {
        console.log("Google sign-in successful");
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      alert("Google sign-in failed. Please try again.");
    } finally {
      setIsLoading(prev => ({ ...prev, google: false }));
    }
  };

  const handleLinkedInSignIn = async () => {
    setIsLoading(prev => ({ ...prev, linkedin: true }));
    try {
      const result = await signIn("linkedin", {
        callbackUrl,
        redirect: false
      });

      if (result?.error) {
        console.error("LinkedIn sign-in error:", result.error);
        alert(`LinkedIn sign-in failed: ${result.error}`);
      } else {
        console.log("LinkedIn sign-in successful");
      }
    } catch (error) {
      console.error("LinkedIn sign-in error:", error);
      alert("LinkedIn sign-in failed. Please try again.");
    } finally {
      setIsLoading(prev => ({ ...prev, linkedin: false }));
    }
  };

  // Prevent hydration error by not rendering until client-side
  if (!isClient) {
    return (
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">Or continue with</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="w-full h-10 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse" />
          <div className="w-full h-10 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={isLoading.google}
          className="w-full flex items-center justify-center gap-2"
        >
          {isLoading.google ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={handleLinkedInSignIn}
          disabled={isLoading.linkedin}
          className="w-full flex items-center justify-center gap-2"
        >
          {isLoading.linkedin ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
