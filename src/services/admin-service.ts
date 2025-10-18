"use client";

import { createClient } from '@/lib/supabase-client';

// Create supabase client instance
const supabase = createClient();

export interface AdminStats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  totalRevenue: number;
  systemHealth: number;
  activeFeatures: number;
  criticalEvents: number;
  pendingTasks: number;
  recentActivities: ActivityLog[];
  topTenants: TopTenant[];
}

export interface ActivityLog {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  tenantId?: string;
  userId?: string;
}

export interface TopTenant {
  id: string;
  name: string;
  users: number;
  revenue: number;
  growth: number;
  status: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
  settings: Record<string, any>;
  subscription?: {
    plan: string;
    status: string;
    expiresAt?: string;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId?: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'suspended';
  permissions: string[];
}

export interface SystemHealth {
  database: {
    status: 'healthy' | 'warning' | 'error';
    responseTime: number;
    connections: number;
  };
  api: {
    status: 'healthy' | 'warning' | 'error';
    responseTime: number;
    uptime: number;
  };
  storage: {
    status: 'healthy' | 'warning' | 'error';
    usage: number;
    totalSpace: number;
  };
  features: {
    status: 'healthy' | 'warning' | 'error';
    enabledFeatures: number;
    totalFeatures: number;
  };
}

class AdminService {
  // Dashboard Statistics
  async getAdminStats(): Promise<AdminStats> {
    try {
      // Use mock data for now since database schema may not be applied yet
      const totalTenants = 15;
      const activeTenants = 12;
      const totalUsers = 2847;

      // Calculate top tenants (mock data for now since we don't have revenue data)
      const topTenants: TopTenant[] = [
        {
          id: 'tenant1',
          name: 'TechVentures Inc.',
          users: 150,
          revenue: 2500,
          growth: 15,
          status: 'active'
        },
        {
          id: 'tenant2',
          name: 'GreenEnergy Solutions',
          users: 89,
          revenue: 1800,
          growth: 8,
          status: 'active'
        },
        {
          id: 'tenant3',
          name: 'Demo Tenant',
          users: 45,
          revenue: 0,
          growth: -5,
          status: 'active'
        }
      ];

      // Mock activities since audit_logs table doesn't exist in schema
      const recentActivities: ActivityLog[] = [
        {
          id: '1',
          type: 'tenant_created',
          message: 'New tenant "StartupCorp" was created',
          timestamp: new Date().toISOString(),
          severity: 'success'
        },
        {
          id: '2',
          type: 'user_signup',
          message: 'New user "john.doe@example.com" registered',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          severity: 'info'
        }
      ];

      return {
        totalTenants,
        activeTenants,
        totalUsers,
        totalRevenue: topTenants.reduce((sum, tenant) => sum + tenant.revenue, 0),
        systemHealth: 98.5,
        activeFeatures: 8,
        criticalEvents: 0,
        pendingTasks: 3,
        recentActivities,
        topTenants
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return this.getMockAdminStats();
    }
  }

  // Tenant Management
  async getTenants(): Promise<Tenant[]> {
    try {
      // Use mock data for now since database schema may not be applied yet
      return [
        {
          id: 'tenant1',
          name: 'TechVentures Inc.',
          slug: 'techventures',
          domain: 'techventures.com',
          status: 'active',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          settings: {
            branding: {
              primary_color: '#007bff',
              secondary_color: '#6c757d',
              accent_color: '#28a745'
            },
            features: {
              ai_recommendations: true,
              advanced_analytics: true,
              custom_branding: true,
              api_access: true
            }
          },
          subscription: {
            plan: 'Professional',
            status: 'active',
            expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
          }
        },
        {
          id: 'tenant2',
          name: 'GreenEnergy Solutions',
          slug: 'greenenergy',
          domain: 'greenenergy.example.com',
          status: 'active',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          settings: {
            branding: {
              primary_color: '#28a745',
              secondary_color: '#6c757d',
              accent_color: '#007bff'
            },
            features: {
              ai_recommendations: false,
              advanced_analytics: false,
              custom_branding: false,
              api_access: false
            }
          },
          subscription: {
            plan: 'Starter',
            status: 'trialing',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        }
      ];
    } catch (error) {
      console.error('Error fetching tenants:', error);
      return [];
    }
  }

  async createTenant(tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant | null> {
    try {
      // Use mock data for now since database schema may not be applied yet
      console.log('Creating tenant:', tenant);

      const newTenant: Tenant = {
        id: `tenant_${Date.now()}`,
        name: tenant.name,
        slug: tenant.slug,
        domain: undefined,
        status: tenant.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: tenant.settings || {},
        subscription: {
          plan: 'basic',
          status: 'active'
        }
      };

      return newTenant;
    } catch (error) {
      console.error('Error creating tenant:', error);
      return null;
    }
  }

  async updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant | null> {
    try {
      // Use mock data for now since database schema may not be applied yet
      console.log('Updating tenant:', id, updates);

      const updatedTenant: Tenant = {
        id,
        name: updates.name || 'Updated Tenant',
        slug: updates.slug || 'updated-tenant',
        domain: undefined,
        status: updates.status || 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: updates.settings || {},
        subscription: {
          plan: 'basic',
          status: 'active'
        }
      };

      return updatedTenant;
    } catch (error) {
      console.error('Error updating tenant:', error);
      return null;
    }
  }

  async deleteTenant(id: string): Promise<boolean> {
    try {
      // Use mock data for now since database schema may not be applied yet
      console.log('Deleting tenant:', id);
      return true;
    } catch (error) {
      console.error('Error deleting tenant:', error);
      return false;
    }
  }

  // User Management
  async getUsers(tenantId?: string): Promise<AdminUser[]> {
    try {
      // For now, return mock data since the users table schema doesn't match AdminUser interface
      // In a real implementation, you'd need to adapt the schema or create a view
      return [
        {
          id: '1',
          email: 'admin@example.com',
          name: 'Super Admin',
          role: 'super_admin',
          tenantId: tenantId,
          lastLogin: new Date().toISOString(),
          status: 'active',
          permissions: ['all']
        }
      ];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  // System Health Monitoring
  async getSystemHealth(): Promise<SystemHealth> {
    try {
      // Test database connection
      const dbStart = Date.now();
      const { error: dbError } = await supabase.from('tenants').select('count').limit(1);
      const dbResponseTime = Date.now() - dbStart;

      // Test API endpoints
      const apiStart = Date.now();
      // TODO: Test actual API endpoints
      const apiResponseTime = Date.now() - apiStart;

      // Get storage usage (mock for now)
      const storageUsage = 0.7; // 70%

      return {
        database: {
          status: dbError ? 'error' : 'healthy',
          responseTime: dbResponseTime,
          connections: 10 // TODO: Get from actual DB metrics
        },
        api: {
          status: 'healthy',
          responseTime: apiResponseTime,
          uptime: 99.9 // TODO: Calculate from actual metrics
        },
        storage: {
          status: storageUsage > 0.9 ? 'warning' : 'healthy',
          usage: storageUsage,
          totalSpace: 100 // GB (mock)
        },
        features: {
          status: 'healthy',
          enabledFeatures: 8,
          totalFeatures: 10
        }
      };
    } catch (error) {
      console.error('Error fetching system health:', error);
      return {
        database: { status: 'error', responseTime: 0, connections: 0 },
        api: { status: 'error', responseTime: 0, uptime: 0 },
        storage: { status: 'error', usage: 0, totalSpace: 0 },
        features: { status: 'error', enabledFeatures: 0, totalFeatures: 0 }
      };
    }
  }

  // Helper methods
  private generateActivityMessage(activity: any): string {
    const messages: Record<string, string> = {
      'tenant_created': `New tenant "${activity.details?.tenantName || 'Unknown'}" was created`,
      'user_login': `User ${activity.details?.userName || 'Unknown'} logged in`,
      'feature_enabled': `Feature ${activity.details?.featureName || 'Unknown'} was enabled`,
      'security_alert': 'Security alert triggered',
      'system_backup': 'System backup completed'
    };

    return messages[activity.action] || `Activity: ${activity.action}`;
  }

  private mapSeverity(severity: string): ActivityLog['severity'] {
    const mapping: Record<string, ActivityLog['severity']> = {
      'critical': 'error',
      'high': 'warning',
      'medium': 'warning',
      'low': 'info',
      'success': 'success'
    };

    return mapping[severity] || 'info';
  }

  private getMockAdminStats(): AdminStats {
    return {
      totalTenants: 15,
      activeTenants: 12,
      totalUsers: 2847,
      totalRevenue: 89250,
      systemHealth: 98.5,
      activeFeatures: 8,
      criticalEvents: 0,
      pendingTasks: 3,
      recentActivities: [],
      topTenants: []
    };
  }
}

export const adminService = new AdminService();