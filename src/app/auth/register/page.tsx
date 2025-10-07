"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProgressiveSignupForm } from "@/components/auth/progressive-signup-form";
import { OTPVerification } from "@/components/auth/otp-verification";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { useAuth } from "@/hooks/use-auth";
import { CreateUserData } from "@/types";

type SignupStep = "form" | "otp" | "social";

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState<SignupStep>("form");
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<CreateUserData | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const router = useRouter();
  const { signUp, verifyPhoneNumber, isLoading } = useAuth();

  const handleSignupSubmit = async (data: CreateUserData) => {
    setError(null);
    setUserData(data);

    // If phone number is provided, go to OTP verification
    if (data.phoneNumber) {
      setPhoneNumber(data.phoneNumber);
      setCurrentStep("otp");
    } else {
      // If no phone number, complete registration directly
      const result = await signUp(data);

      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error || "Registration failed");
      }
    }
  };

  const handleOTPVerification = async (otp: string) => {
    if (!userData || !userData.phoneNumber) return false;

    // First verify the OTP
    const verificationResult = await verifyPhoneNumber(userData.phoneNumber, otp);

    if (verificationResult.success) {
      // OTP is valid, now complete registration
      const signupResult = await signUp({
        ...userData,
        phoneVerified: true // Mark phone as verified in user data
      });

      if (signupResult.success) {
        router.push("/dashboard");
        return true;
      } else {
        setError(signupResult.error || "Registration failed");
        return false;
      }
    } else {
      setError(verificationResult.error || "OTP verification failed");
      return false;
    }
  };

  const handleBackToForm = () => {
    setCurrentStep("form");
    setError(null);
  };

  const handleSocialSignup = () => {
    // Social login will handle the authentication flow
    setCurrentStep("social");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Join BusinessMatch</h1>
          <p className="text-gray-600 dark:text-gray-300">Create your account to get started</p>
        </div>

        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded">
              {error}
            </div>
          )}

          {currentStep === "form" && (
            <>
              <ProgressiveSignupForm onSubmit={handleSignupSubmit} isLoading={isLoading} />

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-500">Or</span>
                  </div>
                </div>

                <div className="mt-6">
                  <SocialLoginButtons callbackUrl="/dashboard" />
                </div>
              </div>
            </>
          )}

          {currentStep === "otp" && (
            <OTPVerification
              phoneNumber={phoneNumber}
              onVerify={handleOTPVerification}
              onBack={handleBackToForm}
              isLoading={isLoading}
            />
          )}

          {currentStep === "social" && (
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Continue with Social Login</h2>
              <SocialLoginButtons callbackUrl="/dashboard" />
              <button
                onClick={() => setCurrentStep("form")}
                className="mt-4 text-gray-600 hover:text-gray-800 text-sm"
              >
                ← Back to signup form
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}