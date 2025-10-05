"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { useAuth } from "@/hooks/use-auth";
import { CreateUserData } from "@/types";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { signIn, isLoading } = useAuth();

  const handleLogin = async (data: CreateUserData) => {
    setError(null);

    const result = await signIn(data.email, data.password);

    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600">Sign in to your BusinessMatch account</p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <AuthForm mode="login" onSubmit={handleLogin} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}