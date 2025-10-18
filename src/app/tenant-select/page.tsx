"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTenant } from "@/contexts/tenant-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/responsive/layout";
import { Building2, ArrowRight, Loader2 } from "lucide-react";

export default function TenantSelectPage() {
  const { tenants, isLoading, selectTenant } = useTenant();
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  const router = useRouter();

  const handleTenantSelect = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    selectTenant(tenantId);
    // Redirect to login page with tenant context
    router.push("/auth/login");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading organizations...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="mx-auto shadow-lg border-border">
            <CardHeader className="space-y-1 text-center pb-6">
              <div className="flex justify-center mb-4">
                <Building2 className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-3xl font-semibold text-foreground">
                Select Organization
              </CardTitle>
              <CardDescription className="text-base">
                Choose the organization you want to access
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {tenants.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No organizations available at this time.
                  </p>
                  <Button
                    onClick={() => router.push("/")}
                    variant="outline"
                  >
                    Go Home
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {tenants.map((tenant) => (
                    <Card
                      key={tenant.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                        selectedTenantId === tenant.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => handleTenantSelect(tenant.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {tenant.settings?.branding?.logo ? (
                              <img
                                src={tenant.settings.branding.logo}
                                alt={`${tenant.name} logo`}
                                className="h-10 w-10 rounded-md object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-primary" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-semibold text-foreground">
                                {tenant.settings?.branding?.name || tenant.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {tenant.slug}
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="text-center pt-4">
                <Button
                  onClick={() => router.push("/auth/login")}
                  variant="ghost"
                  size="sm"
                >
                  Skip organization selection
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}