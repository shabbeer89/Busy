"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navigation() {
  const { user, isAuthenticated, signOut } = useAuth();

  const handleLogout = () => {
    signOut();
  };

  return (
    <nav className="border-b bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              BusinessMatch
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <span className="text-gray-700 dark:text-gray-200">
                  Welcome, {user?.name || "User"}
                </span>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}