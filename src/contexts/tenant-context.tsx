"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSession } from 'next-auth/react';
import { createClient } from '@/lib/supabase-client';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive' | 'suspended';
  settings?: {
    branding?: {
      primaryColor?: string;
      logo?: string;
      name?: string;
    };
    features?: Record<string, boolean>;
  };
  created_at: string;
  updated_at: string;
}

interface TenantContextType {
  tenant: Tenant | null;
  tenants: Tenant[];
  isLoading: boolean;
  setTenant: (tenant: Tenant | null) => void;
  loadTenants: () => Promise<void>;
  selectTenant: (tenantId: string) => void;
  clearTenant: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tenant from localStorage or URL on mount
  useEffect(() => {
    const loadInitialTenant = async () => {
      try {
        await loadTenants(); // Load tenants first

        const storedTenantId = localStorage.getItem('selectedTenantId');
        const urlTenantSlug = window.location.pathname.split('/')[1]; // Get tenant slug from URL

        if (urlTenantSlug && urlTenantSlug !== 'admin' && urlTenantSlug !== 'auth') {
          // Load tenant by slug from URL
          const urlTenant = tenants.find(t => t.slug === urlTenantSlug);
          if (urlTenant) {
            setTenant(urlTenant);
          }
        } else if (storedTenantId) {
          // Load tenant by ID from storage
          const storedTenant = tenants.find(t => t.id === storedTenantId);
          if (storedTenant) {
            setTenant(storedTenant);
          }
        }
      } catch (error) {
        console.error('Error loading initial tenant:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialTenant();
  }, []); // Remove dependency to prevent infinite re-renders

  // Separate effect to handle tenant selection when tenants are loaded
  useEffect(() => {
    if (tenants.length > 0 && !tenant && !isLoading) {
      const storedTenantId = localStorage.getItem('selectedTenantId');
      const urlTenantSlug = window.location.pathname.split('/')[1];

      if (urlTenantSlug && urlTenantSlug !== 'admin' && urlTenantSlug !== 'auth') {
        const urlTenant = tenants.find(t => t.slug === urlTenantSlug);
        if (urlTenant) {
          setTenant(urlTenant);
        }
      } else if (storedTenantId) {
        const storedTenant = tenants.find(t => t.id === storedTenantId);
        if (storedTenant) {
          setTenant(storedTenant);
        }
      }
    }
  }, [tenants, tenant, isLoading]);

  const loadTenants = async () => {
    try {
      const response = await fetch('/api/tenants/load', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to load tenants:', errorData);

        // If database is not configured, show helpful message
        if (response.status === 503) {
          console.warn('Database not configured:', errorData.details);
        }

        return;
      }

      const data = await response.json();
      setTenants(data || []);
    } catch (error) {
      console.error('Error loading tenants:', error);
    }
  };

  const selectTenant = (tenantId: string) => {
    const selectedTenant = tenants.find(t => t.id === tenantId);
    if (selectedTenant) {
      setTenant(selectedTenant);
      localStorage.setItem('selectedTenantId', tenantId);
    }
  };

  const clearTenant = () => {
    setTenant(null);
    localStorage.removeItem('selectedTenantId');
  };

  const value: TenantContextType = {
    tenant,
    tenants,
    isLoading,
    setTenant,
    loadTenants,
    selectTenant,
    clearTenant,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};
