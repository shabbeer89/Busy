"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { signIn } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Layout, Button, CustomInput } from "@/components/responsive/layout";
import { Loader2, Lock, Eye, EyeOff, User } from "lucide-react";
import CloudflareTurnstile from "@/components/auth/cloudflare-turnstile";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const urlError = searchParams.get("error");

  // Handle URL error parameters
  useEffect(() => {
    if (urlError) {
      let errorMessage = "An error occurred during authentication.";

      switch (urlError) {
        case "google":
          errorMessage = "Google authentication failed. Please try again or use a different sign-in method.";
          break;
        case "linkedin":
          errorMessage = "LinkedIn authentication failed. Please try again or use a different sign-in method.";
          break;
        case "oauth":
          errorMessage = "OAuth authentication failed. Please try again.";
          break;
        case "configuration":
          errorMessage = "Authentication configuration error. Please contact support.";
          break;
        case "access_denied":
          errorMessage = "Access was denied. Please try again or use a different sign-in method.";
          break;
        case "server_error":
          errorMessage = "Server error occurred. Please try again later.";
          break;
        default:
          errorMessage = `Authentication error: ${urlError}`;
      }

      setError(errorMessage);
    }
  }, [urlError]);

  // Check if user is already authenticated - handled by NextAuth and providers

  const handleTurnstileVerify = (token: string) => {
    setTurnstileToken(token);
    setTurnstileError(null);
  };

  const handleTurnstileError = (error: string) => {
    setTurnstileError(error);
    setTurnstileToken(null);
  };

  const handleTurnstileExpire = () => {
    setTurnstileToken(null);
  };

  const handleSocialLogin = async (provider: 'google' | 'linkedin') => {
    setError(null);
    setIsLoading(true);

    try {
      await signIn(provider, {
        callbackUrl: redirectTo,
        redirect: false,
      }).then((result) => {
        if (result?.error) {
          if (result.error === 'Configuration') {
            setError(`${provider} authentication is not configured yet. Please use email/password login or contact support.`);
          } else {
            setError(`${provider} authentication failed: ${result.error}`);
          }
        } else if (result?.url) {
          router.push(result.url);
        } else {
          router.push(redirectTo);
        }
      });
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Check if turnstile is required and verified
    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken) {
      setError("Please complete the security verification");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        // Create or update user profile in our users table
        await fetch("/api/auth/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: data.user.email,
            name: data.user.user_metadata?.name || username || data.user.email?.split("@")[0] || "User",
            user_type: "creator", // Default, can be changed in profile
          }),
        });

        router.push(redirectTo);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <Layout>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="mx-auto shadow-lg border-border">
            <CardHeader className="space-y-1 text-center pb-2">
              <CardTitle className="text-3xl font-semibold text-foreground">Sign In</CardTitle>
              <div className="text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <a
                  href="/auth/register"
                  className="font-bold text-lg text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200 px-2 py-1 rounded-md hover:bg-blue-50"
                >
                  Sign Up
                </a>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {turnstileToken && (
                <div className="flex items-center justify-center space-x-2 p-3 bg-green-900 text-white rounded-md">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Success!</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs bg-orange-600 px-1.5 py-0.5 rounded text-white font-bold">cloudflare</span>
                    <span className="text-xs text-gray-300">Privacy • Terms</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-foreground">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <CustomInput
                      type="text"
                      placeholder="e.g. johndoe"
                      value={username}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                      className="pl-10 h-12 text-base"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                    <a href="#" className="text-sm text-primary hover:text-primary/80">
                      Forgot your password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <CustomInput
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 text-base"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 h-5 w-5 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                {/* Cloudflare Turnstile */}
                <div className="space-y-2">
                  {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
                    <CloudflareTurnstile
                      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                      onVerify={handleTurnstileVerify}
                      onError={handleTurnstileError}
                      onExpire={handleTurnstileExpire}
                      theme="auto"
                    />
                  ) : (
                    <div className="flex justify-center p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        Security verification unavailable. Please proceed with login.
                      </p>
                    </div>
                  )}
                  {turnstileError && (
                    <Alert variant="destructive">
                      <AlertDescription>{turnstileError}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                  />
                  <Label htmlFor="remember" className="ml-2 text-sm text-foreground">
                    Remember & Auto Login
                  </Label>
                </div>

                {/* Social Login Buttons */}
                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      onClick={() => handleSocialLogin("google")}
                      disabled={isLoading}
                      className="h-12 border-border hover:bg-accent hover:text-accent-foreground font-medium"
                    >
                      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
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
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      onClick={() => handleSocialLogin("linkedin")}
                      disabled={isLoading}
                      className="h-12 border-border hover:bg-accent hover:text-accent-foreground font-medium"
                    >
                      <svg className="mr-2 h-5 w-5" fill="#0077B5" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </Button>
                  </div>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  disabled={isLoading || (Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) && !turnstileToken)}
                  className="h-14 font-bold text-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "LOGIN"
                  )}
                </Button>
              </form>


            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
