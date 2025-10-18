"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions, UserRole } from "@/lib/permissions";
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
   LogOut,
   Search,
   ShieldCheck,
   Building,
   FileText,
   Activity,
   TrendingUp,
   Zap
 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
   className?: string;
   isAdmin?: boolean;
}

export function Sidebar({ className, isAdmin = false }: SidebarProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isProfileExpanded, setIsProfileExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, signOut } = useAuth();
 
   // Get user role for display
   const getUserRoleFromUserType = (userType: string, email?: string): UserRole => {
     // Special case: treat test@example.com as super admin for development
     if (email === 'test@example.com') {
       return UserRole.SUPER_ADMIN;
     }
 
     switch (userType) {
       case 'super_admin':
         return UserRole.SUPER_ADMIN;
       case 'tenant_admin':
         return UserRole.TENANT_ADMIN;
       case 'creator':
         return UserRole.CREATOR;
       case 'investor':
         return UserRole.INVESTOR;
       default:
         return UserRole.USER;
     }
   };
 
   const userRole = user ? getUserRoleFromUserType(user.userType || 'user', user.email) : UserRole.USER;
   const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
   const isTenantAdmin = userRole === UserRole.TENANT_ADMIN;

  const navigationItems = isAdmin ? [
    // Admin Navigation Items - Complete admin panel
    {
      name: "Admin Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      current: pathname === "/admin",
    },
    {
      name: "User Management",
      href: "/admin/users",
      icon: Users,
      current: pathname === "/admin/users",
    },
    {
      name: "Tenant Management",
      href: "/admin/tenants",
      icon: Building,
      current: pathname === "/admin/tenants",
    },
    {
      name: "Platform Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      current: pathname === "/admin/analytics",
    },
    {
      name: "System Monitoring",
      href: "/admin/monitoring",
      icon: Activity,
      current: pathname === "/admin/monitoring",
    },
    {
      name: "Security Center",
      href: "/admin/security",
      icon: ShieldCheck,
      current: pathname === "/admin/security",
    },
    {
      name: "Feature Toggles",
      href: "/admin/features",
      icon: Zap,
      current: pathname === "/admin/features",
    },
    {
      name: "Configuration",
      href: "/admin/config",
      icon: Settings,
      current: pathname === "/admin/config",
    },
    {
      name: "Notifications",
      href: "/admin/notifications",
      icon: TrendingUp,
      current: pathname === "/admin/notifications",
    },
    {
      name: "Audit Logs",
      href: "/admin/audit-logs",
      icon: FileText,
      current: pathname === "/admin/audit-logs",
    },
  ] : [
    // Regular User Navigation Items
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
      name: "Scan Token",
      href: "/scan-token",
      icon: Search,
      current: pathname.startsWith("/scan-token"),
    },
    {
      name: "BABT Protected",
      href: "/babt-protected",
      icon: Wallet,
      current: pathname.startsWith("/babt-protected"),
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
      <div className="flex h-16 items-center border-b px-4 border-white/10 bg-gradient-to-r from-white/5 to-white/10">
        <Link href="/dashboard" className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 text-white shadow-xl border-2 border-white/20">
            <span className="text-base font-bold">🚀</span>
          </div>
          {isExpanded && (
            <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
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
                  "group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-300 cursor-pointer transform hover:scale-105",
                  isActive
                    ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-300 border border-blue-500/30 shadow-lg"
                    : "text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 hover:text-white hover:border-slate-500/50",
                  isExpanded ? (hasSubmenu ? "justify-between" : "justify-start") : "justify-center"
                )}
                onClick={() => {
                  if (hasSubmenu) {
                    setIsProfileExpanded(!isProfileExpanded);
                  }
                }}
              >
                <Link href={item.href} className="flex items-center flex-1">
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-400",
                    (isExpanded || isHovered) ? "mr-3" : ""
                  )} />
                  {(isExpanded || isHovered) && (
                    <span className="truncate">{item.name}</span>
                  )}
                  {!isExpanded && !isHovered && (
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
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Section */}
        {isAuthenticated && user && (
          <div className="border-t border-slate-600/50 p-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 border-2 border-white/20 shadow-lg">
                  <span className="text-sm font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                {(isExpanded || isHovered) && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-400 capitalize">
                      {isSuperAdmin ? 'Super Admin' : isTenantAdmin ? 'Tenant Admin' : user.userType?.replace('_', ' ') || 'user'}
                    </p>
                  </div>
                )}
              </div>

              {/* Logout button - always visible */}
              <button
                onClick={async () => {
                  await signOut();
                  router.push('/');
                }}
                className={cn(
                  "group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-300 text-slate-400 hover:bg-gradient-to-r hover:from-red-600/20 hover:to-red-700/20 hover:text-red-300 hover:border-red-500/30 w-full text-left border border-transparent hover:border",
                  (!isExpanded && !isHovered) ? "justify-center" : "justify-start"
                )}
                title="Logout"
              >
                <LogOut className={cn("h-4 w-4 flex-shrink-0", (isExpanded || isHovered) ? "mr-3" : "")} />
                {(isExpanded || isHovered) && <span className="truncate">Logout</span>}
              </button>
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

      {/* Desktop Sidebar - Only show on lg screens and up */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-20 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl transition-all duration-300 border-r border-slate-600/50 hidden lg:block",
          (isExpanded || isHovered) ? "w-64" : "w-16"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay - Only show on screens smaller than lg */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 z-10 bg-black/60 backdrop-blur-sm block lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-20 w-64 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl block lg:hidden">
            <SidebarContent />
          </div>
        </>
      )}

      {/* Sidebar Spacer */}
      <div
        className={cn(
          "transition-all duration-300",
          (isExpanded || isHovered) ? "lg:ml-64" : "lg:ml-16"
        )}
      />
    </>
  );
}

// Layout wrapper component that includes the sidebar
export function SidebarLayout({ children, isAdmin = false }: { children: React.ReactNode; isAdmin?: boolean }) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Sidebar isAdmin={isAdmin} />
        <div className={cn(
          "transition-all duration-300 relative min-h-screen"
        )}>
          <div className="min-h-screen">
            {children}
          </div>
        </div>
      </div>
    );
}
