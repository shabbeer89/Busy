"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Home,
  Briefcase,
  Lightbulb,
  Users,
  MessageSquare,
  Heart,
  Wallet,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const navigationItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      current: pathname === "/",
    },
    {
      name: "Offers",
      href: "/offers",
      icon: Briefcase,
      current: pathname.startsWith("/offers"),
    },
    {
      name: "Ideas",
      href: "/ideas",
      icon: Lightbulb,
      current: pathname.startsWith("/ideas"),
    },
    {
      name: "Matches",
      href: "/matches",
      icon: Users,
      current: pathname.startsWith("/matches"),
    },
    {
      name: "Messages",
      href: "/messages",
      icon: MessageSquare,
      current: pathname.startsWith("/messages"),
    },
    {
      name: "Favorites",
      href: "/favorites",
      icon: Heart,
      current: pathname.startsWith("/favorites"),
    },
    {
      name: "Wallet",
      href: "/wallet",
      icon: Wallet,
      current: pathname.startsWith("/wallet"),
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      current: pathname.startsWith("/analytics"),
    },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <span className="text-sm font-bold">BM</span>
          </div>
          {isExpanded && (
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              BusinessMatch
            </span>
          )}
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1 p-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.current;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-white",
                isExpanded ? "justify-start" : "justify-center"
              )}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0", isExpanded ? "mr-3" : "")} />
              {isExpanded && (
                <span className="truncate">{item.name}</span>
              )}
              {!isExpanded && (
                <div className="absolute left-full ml-6 hidden rounded-md bg-gray-900 px-2 py-1 text-xs text-white group-hover:block dark:bg-gray-700">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      {isAuthenticated && user && (
        <div className="border-t p-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            {isExpanded && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user.userType}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Theme Toggle */}
      <div className="border-t p-4">
        <div className={cn("flex items-center", isExpanded ? "justify-start" : "justify-center")}>
          <ThemeToggle />
          {isExpanded && (
            <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
              Theme
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-4 z-40"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Desktop Sidebar Toggle */}
      <div className="hidden lg:block">
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-4 z-30"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-20 bg-white shadow-lg transition-all duration-300 dark:bg-slate-900 dark:border-r dark:border-slate-700",
          isExpanded ? "w-64" : "w-16",
          "hidden lg:block"
        )}
      >
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 z-10 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-20 w-64 bg-white shadow-xl dark:bg-slate-900 lg:hidden">
            <SidebarContent />
          </div>
        </>
      )}

      {/* Sidebar Spacer */}
      <div
        className={cn(
          "transition-all duration-300",
          isExpanded ? "lg:ml-64" : "lg:ml-16"
        )}
      />
    </>
  );
}

// Layout wrapper component that includes the sidebar
export function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Sidebar />
      <div className="lg:pl-20">
        {children}
      </div>
    </div>
  );
}