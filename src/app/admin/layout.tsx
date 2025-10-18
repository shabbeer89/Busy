"use client";

import { useAuth } from '@/hooks/use-auth';
import { usePermissions, UserRole, Permission } from '@/lib/permissions';
import { SidebarLayout } from '@/components/navigation/sidebar';
import { ImpersonationBanner } from '@/components/admin/impersonation-banner';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth();

  // Mock impersonation state - in real app this would come from context/state
  const [impersonatedUser, setImpersonatedUser] = useState<{
    id: string;
    name: string;
    email: string;
    tenantName?: string;
  } | null>(null);

  // Check if user has admin permissions
  // The user object contains userType from custom users table via auth hook
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

  // Get role from user's userType (from custom users table)
  const userRole = user ? getUserRoleFromUserType(user.userType || 'user', user.email) : UserRole.USER;
  const permissions = usePermissions(userRole);
  const isSuperAdmin = permissions.isSuperAdmin();
  const isTenantAdmin = permissions.isTenantAdmin();

  if (!user) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-300">Please sign in to access admin panel.</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!isSuperAdmin && !isTenantAdmin) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-red-600">
                <AlertCircle className="w-6 h-6" />
                Access Denied
              </CardTitle>
              <CardDescription>
                You don't have permission to access the admin panel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                Required: Super Admin or Tenant Admin role
              </p>
            </CardContent>
          </Card>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout isAdmin={true}>
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Impersonation Banner */}
          {impersonatedUser && (
            <ImpersonationBanner
              impersonatedUser={impersonatedUser}
              onStopImpersonation={() => setImpersonatedUser(null)}
            />
          )}

          {/* Admin Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isSuperAdmin ? 'Super Admin Panel' : 'Tenant Admin Panel'}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  {isSuperAdmin
                    ? 'Manage system-wide settings, tenants, and platform features'
                    : 'Manage tenant settings, users, and features'
                  }
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 capitalize">
                    {user.userType?.replace('_', ' ') || 'user'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Content */}
          {children}
        </div>
      </div>
    </SidebarLayout>
  );
}