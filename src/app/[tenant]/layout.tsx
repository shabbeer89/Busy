"use client";

import { useTenant } from "@/contexts/tenant-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Navigation } from "@/components/navigation";

interface TenantLayoutProps {
  children: React.ReactNode;
  params: {
    tenant: string;
  };
}

export default function TenantLayout({ children, params }: TenantLayoutProps) {
  const { tenant, isLoading, selectTenant } = useTenant();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // If no tenant is selected but we have a tenant slug in URL, try to select it
      if (!tenant && params.tenant) {
        // This will be handled by the TenantProvider's useEffect
        return;
      }

      // If tenant is selected but doesn't match URL slug, redirect
      if (tenant && tenant.slug !== params.tenant) {
        router.replace(`/${tenant.slug}`);
        return;
      }

      // If no tenant selected and no tenant in URL, redirect to tenant selection
      if (!tenant && !params.tenant) {
        router.replace('/tenant-select');
        return;
      }
    }
  }, [tenant, params.tenant, isLoading, router]);

  // Show loading while tenant context is being established
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading organization...</p>
        </div>
      </div>
    );
  }

  // If no tenant context, redirect will happen in useEffect
  if (!tenant) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}