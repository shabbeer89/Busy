"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Briefcase,
  Lightbulb,
  Users,
  MessageSquare,
  Heart,
  Wallet,
  BarChart3,
  Settings,
  User,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, signOut } = useAuth();

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      current: pathname.startsWith("/dashboard"),
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
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      current: pathname.startsWith("/profile"),
      hasSubmenu: true,
      submenu: [
        {
          name: "View Profile",
          href: "/profile",
          icon: User,
        },
        {
          name: "Settings",
          href: "/settings",
          icon: Settings,
        },
      ],
    },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center border-b px-4 border-slate-700">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white">
            <span className="text-sm font-bold">BM</span>
          </div>
          {isExpanded && (
            <span className="text-xl font-bold text-white">
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
          const hasSubmenu = item.hasSubmenu && isExpanded;

          return (
            <div key={item.name}>
              {/* Main navigation item */}
              <div
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-slate-700 text-blue-300"
                    : "text-gray-300 hover:bg-slate-700 hover:text-white",
                  isExpanded ? (hasSubmenu ? "justify-between" : "justify-start") : "justify-center"
                )}
                onClick={() => {
                  if (hasSubmenu) {
                    setIsProfileExpanded(!isProfileExpanded);
                  }
                }}
              >
                <Link href={item.href} className="flex items-center flex-1">
                  <Icon className={cn("h-5 w-5 flex-shrink-0", isExpanded ? "mr-3" : "")} />
                  {isExpanded && (
                    <span className="truncate">{item.name}</span>
                  )}
                  {!isExpanded && (
                    <div className="absolute left-full ml-6 hidden rounded-md bg-slate-800 px-2 py-1 text-xs text-white group-hover:block">
                      {item.name}
                    </div>
                  )}
                </Link>
                {hasSubmenu && isExpanded && (
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isProfileExpanded ? "rotate-180" : ""
                    )}
                  />
                )}
              </div>

              {/* Profile submenu */}
              {hasSubmenu && isProfileExpanded && isExpanded && (
                <div className="ml-4 space-y-1">
                  {item.submenu?.map((subItem) => {
                    const SubIcon = subItem.icon;
                    return (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={cn(
                          "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                          pathname.startsWith(subItem.href)
                            ? "bg-slate-600 text-blue-300"
                            : "text-gray-400 hover:bg-slate-700 hover:text-white"
                        )}
                      >
                        <SubIcon className="h-4 w-4 mr-3 flex-shrink-0" />
                        <span className="truncate">{subItem.name}</span>
                      </Link>
                    );
                  })}
                  {/* Logout button */}
                  <button
                    onClick={signOut}
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 text-gray-400 hover:bg-slate-700 hover:text-white w-full text-left"
                  >
                    <LogOut className="h-4 w-4 mr-3 flex-shrink-0" />
                    <span className="truncate">Logout</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Section */}
      {isAuthenticated && user && (
        <div className="border-t border-slate-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-600">
              <span className="text-sm font-medium text-gray-300">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            {isExpanded && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {user.userType}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

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
          "fixed inset-y-0 left-0 z-20 bg-slate-900 shadow-lg transition-all duration-300 border-r border-slate-700",
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
          <div className="fixed inset-y-0 left-0 z-20 w-64 bg-slate-900 shadow-xl lg:hidden">
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
    <div className="min-h-screen bg-slate-900">
      <Sidebar />
      <div className="lg:pl-20">
        {children}
      </div>
    </div>
  );
}