"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, ArrowLeft } from "lucide-react";

interface OTPVerificationProps {
  phoneNumber: string;
  onVerify: (otp: string) => Promise<boolean>;
  onBack: () => void;
  isLoading?: boolean;
}

interface OTPVerifyResult {
  success: boolean;
  error?: string;
}

export function OTPVerification({
  phoneNumber,
  onVerify,
  onBack,
  isLoading = false
}: OTPVerificationProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    const success = await onVerify(otp);
    if (!success) {
      setError("Invalid OTP. Please try again.");
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      if (response.ok) {
        setCountdown(30);
        setCanResend(false);
        setOtp("");
        setError("");
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
          <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Verify Your Phone</h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
          We've sent a 6-digit code to<br />
          <span className="font-medium text-gray-900 dark:text-white">{phoneNumber}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter Verification Code
          </label>
          <Input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className={`text-center text-2xl font-mono tracking-widest bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 ${error ? "border-red-500" : ""}`}
            maxLength={6}
          />
          {error && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{error}</p>}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || otp.length !== 6}
        >
          {isLoading ? "Verifying..." : "Verify Code"}
        </Button>

        <div className="text-center">
          {canResend ? (
            <button
              type="button"
              onClick={handleResendOTP}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              Resend Code
            </button>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Resend code in {countdown}s
            </p>
          )}
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to edit phone number
          </button>
        </div>
      </form>
    </div>
  );
}
