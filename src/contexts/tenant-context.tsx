"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Tenant, TenantContextType, CreateTenantData, UpdateTenantData } from '@/types/tenant'
import { createClient } from '@/lib/supabase-client'
import { useAuth } from '@/hooks/use-auth'

interface TenantProviderProps {
  children: React.ReactNode
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

export function TenantProvider({ children }: TenantProviderProps) {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  // Load tenants for the current user
  const loadTenants = useCallback(async () => {
    if (!user) {
      setTenants([])
      setCurrentTenant(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      // For now, we'll create a demo tenant for each user
      // In production, this would fetch from a tenants table
      const demoTenant: Tenant = {
        id: `tenant_${user.id}`,
        name: `${user.name}'s Organization`,
        slug: `${user.name.toLowerCase().replace(/\s+/g, '-')}-org`,
        status: 'active',
        settings: {
          branding: {
            primary_color: '#3B82F6',
            secondary_color: '#1E40AF',
            accent_color: '#60A5FA',
          },
          features: {
            ai_recommendations: true,
            advanced_analytics: false,
            custom_branding: false,
            api_access: false,
          },
          limits: {
            max_users: 10,
            max_projects: 100,
            storage_limit: 1000000, // 1MB in bytes
          },
        },
        subscription: {
          plan: 'free',
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          cancel_at_period_end: false,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setTenants([demoTenant])
      setCurrentTenant(demoTenant)
    } catch (error) {
      console.error('Error loading tenants:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Load tenants when user changes
  useEffect(() => {
    loadTenants()
  }, [loadTenants])

  // Switch to a different tenant
  const switchTenant = useCallback(async (tenantId: string) => {
    setIsLoading(true)
    try {
      const tenant = tenants.find(t => t.id === tenantId)
      if (tenant) {
        setCurrentTenant(tenant)
        // Store current tenant in localStorage for persistence
        localStorage.setItem('currentTenantId', tenantId)
      }
    } catch (error) {
      console.error('Error switching tenant:', error)
    } finally {
      setIsLoading(false)
    }
  }, [tenants])

  // Create a new tenant
  const createTenant = useCallback(async (data: CreateTenantData): Promise<Tenant> => {
    if (!user) {
      throw new Error('User must be authenticated to create a tenant')
    }

    setIsLoading(true)
    try {
      const newTenant: Tenant = {
        id: `tenant_${Date.now()}`,
        name: data.name,
        slug: data.slug,
        status: 'active',
        settings: {
          branding: {
            primary_color: '#3B82F6',
            secondary_color: '#1E40AF',
            accent_color: '#60A5FA',
          },
          features: {
            ai_recommendations: false,
            advanced_analytics: false,
            custom_branding: false,
            api_access: false,
          },
          limits: {
            max_users: 5,
            max_projects: 50,
            storage_limit: 500000,
          },
          ...data.settings,
        },
        subscription: {
          plan: 'free',
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancel_at_period_end: false,
          ...data.subscription,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setTenants(prev => [...prev, newTenant])

      // If this is the first tenant, make it current
      if (tenants.length === 0) {
        setCurrentTenant(newTenant)
        localStorage.setItem('currentTenantId', newTenant.id)
      }

      return newTenant
    } catch (error) {
      console.error('Error creating tenant:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [user, tenants.length])

  // Update an existing tenant
  const updateTenant = useCallback(async (tenantId: string, data: UpdateTenantData): Promise<Tenant> => {
    setIsLoading(true)
    try {
      const updatedTenants = tenants.map(tenant => {
        if (tenant.id === tenantId) {
          return {
            ...tenant,
            ...data,
            settings: data.settings ? { ...tenant.settings, ...data.settings } : tenant.settings,
            subscription: data.subscription ? { ...tenant.subscription, ...data.subscription } : tenant.subscription,
            updated_at: new Date().toISOString(),
          } as Tenant
        }
        return tenant
      })

      setTenants(updatedTenants)

      const updatedTenant = updatedTenants.find(t => t.id === tenantId)
      if (!updatedTenant) {
        throw new Error('Tenant not found')
      }

      // Update current tenant if it's the one being updated
      if (currentTenant?.id === tenantId) {
        setCurrentTenant(updatedTenant)
      }

      return updatedTenant
    } catch (error) {
      console.error('Error updating tenant:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [tenants, currentTenant])

  // Delete a tenant
  const deleteTenant = useCallback(async (tenantId: string) => {
    setIsLoading(true)
    try {
      setTenants(prev => prev.filter(t => t.id !== tenantId))

      // If the deleted tenant was current, switch to the first available tenant
      if (currentTenant?.id === tenantId) {
        const remainingTenants = tenants.filter(t => t.id !== tenantId)
        if (remainingTenants.length > 0) {
          setCurrentTenant(remainingTenants[0])
          localStorage.setItem('currentTenantId', remainingTenants[0].id)
        } else {
          setCurrentTenant(null)
          localStorage.removeItem('currentTenantId')
        }
      }
    } catch (error) {
      console.error('Error deleting tenant:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [currentTenant, tenants])

  // Load current tenant from localStorage on mount
  useEffect(() => {
    const savedTenantId = localStorage.getItem('currentTenantId')
    if (savedTenantId && tenants.length > 0) {
      const savedTenant = tenants.find(t => t.id === savedTenantId)
      if (savedTenant) {
        setCurrentTenant(savedTenant)
      }
    }
  }, [tenants])

  const value: TenantContextType = {
    currentTenant,
    tenants,
    isLoading,
    switchTenant,
    createTenant,
    updateTenant,
    deleteTenant,
  }

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}