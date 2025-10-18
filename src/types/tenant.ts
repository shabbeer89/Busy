export interface Tenant {
  id: string
  name: string
  slug: string
  status: 'active' | 'inactive' | 'suspended'
  settings: TenantSettings
  subscription: TenantSubscription
  created_at: string
  updated_at: string
}

export interface TenantSettings {
  branding: {
    logo?: string
    primary_color: string
    secondary_color: string
    accent_color: string
  }
  features: {
    ai_recommendations: boolean
    advanced_analytics: boolean
    custom_branding: boolean
    api_access: boolean
  }
  limits: {
    max_users: number
    max_projects: number
    storage_limit: number
  }
}

export interface TenantSubscription {
  plan: 'free' | 'starter' | 'professional' | 'enterprise'
  status: 'active' | 'past_due' | 'cancelled' | 'trialing'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
}

export interface TenantContextType {
  currentTenant: Tenant | null
  tenants: Tenant[]
  isLoading: boolean
  switchTenant: (tenantId: string) => Promise<void>
  createTenant: (data: CreateTenantData) => Promise<Tenant>
  updateTenant: (tenantId: string, data: UpdateTenantData) => Promise<Tenant>
  deleteTenant: (tenantId: string) => Promise<void>
}

export interface CreateTenantData {
  name: string
  slug: string
  settings?: Partial<TenantSettings>
  subscription?: Partial<TenantSubscription>
}

export interface UpdateTenantData {
  name?: string
  slug?: string
  status?: 'active' | 'inactive' | 'suspended'
  settings?: Partial<TenantSettings>
  subscription?: Partial<TenantSubscription>
}