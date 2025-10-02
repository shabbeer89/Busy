"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { useAuth } from "@/hooks/use-auth";
import { CreateUserData } from "@/types";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { signUp, isLoading } = useAuth();

  const handleRegister = async (data: CreateUserData) => {
    setError(null);

    const result = await signUp(data);

    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join BusinessMatch</h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <AuthForm mode="register" onSubmit={handleRegister} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}