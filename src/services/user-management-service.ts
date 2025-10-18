"use client";

import { createClient } from '../lib/supabase-client';

// Create supabase client instance
const supabase = createClient();

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  avatar?: string;
  userType: 'creator' | 'investor' | 'admin' | 'super_admin';
  role: 'super_admin' | 'admin' | 'moderator' | 'user';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  isVerified: boolean;
  phoneVerified: boolean;
  tenantId?: string;
  tenantName?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;

  // Enhanced fields for cross-tenant administration
  managedTenants?: string[];
  permissions?: string[];
  restrictions?: {
    maxTenants?: number;
    allowedActions?: string[];
    ipRestrictions?: string[];
    timeRestrictions?: { start: string; end: string; timezone: string; }[];
  };
  activity?: {
    loginCount: number;
    lastActivity: string;
    sessionDuration: number;
    failedAttempts: number;
  };
  metadata?: Record<string, any>;
}

export interface TenantUserSummary {
  tenantId: string;
  tenantName: string;
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  adminUsers: number;
  recentActivity: number;
  growthRate: number;
}

export interface UserActivityReport {
  userId: string;
  userName: string;
  tenantId?: string;
  activities: {
    date: string;
    loginCount: number;
    actionsPerformed: number;
    sessionDuration: number;
    ipAddresses: string[];
    locations: string[];
  }[];
  summary: {
    totalLogins: number;
    totalActions: number;
    averageSessionTime: number;
    uniqueIPs: number;
    riskScore: number;
  };
}

export interface CrossTenantOperation {
  id: string;
  operation: 'bulk_status_change' | 'bulk_role_assign' | 'bulk_tenant_assign' | 'bulk_permissions_update';
  targetUsers: string[];
  targetTenants: string[];
  parameters: Record<string, any>;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  initiatedBy: string;
  initiatedAt: string;
  completedAt?: string;
  results?: {
    successCount: number;
    failureCount: number;
    errors: string[];
  };
}

class UserManagementService {
  // Get all users with cross-tenant view
  async getUsers(filters: {
    tenantId?: string;
    status?: string;
    role?: string;
    userType?: string;
    searchTerm?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<AdminUser[]> {
    try {
      // Use mock data for now since database schema may not be applied yet
      return this.getMockUsers(filters);
    } catch (error) {
      console.error('Error fetching users:', error);
      return this.getMockUsers(filters);
    }
  }

  // Get comprehensive user statistics across all tenants
  async getUserStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    unverifiedUsers: number;
    recentRegistrations: number;
    usersByRole: Record<string, number>;
    usersByTenant: TenantUserSummary[];
    growthRate: number;
  }> {
    try {
      const users = await this.getUsers();
      const tenants = await this.getTenantSummaries();

      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.status === 'active').length;
      const suspendedUsers = users.filter(u => u.status === 'suspended').length;
      const unverifiedUsers = users.filter(u => !u.isVerified).length;

      // Calculate recent registrations (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentRegistrations = users.filter(u => new Date(u.createdAt) > thirtyDaysAgo).length;

      // Calculate users by role
      const usersByRole = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate growth rate (vs last month)
      const lastMonth = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      const thisMonthUsers = users.filter(u => new Date(u.createdAt) > thirtyDaysAgo).length;
      const lastMonthUsers = users.filter(u => {
        const createdDate = new Date(u.createdAt);
        return createdDate > lastMonth && createdDate <= thirtyDaysAgo;
      }).length;

      const growthRate = lastMonthUsers > 0 ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 : 0;

      return {
        totalUsers,
        activeUsers,
        suspendedUsers,
        unverifiedUsers,
        recentRegistrations,
        usersByRole,
        usersByTenant: tenants,
        growthRate
      };
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        suspendedUsers: 0,
        unverifiedUsers: 0,
        recentRegistrations: 0,
        usersByRole: {},
        usersByTenant: [],
        growthRate: 0
      };
    }
  }

  // Get tenant user summaries for cross-tenant overview
  async getTenantSummaries(): Promise<TenantUserSummary[]> {
    try {
      // Use mock data for now since database schema may not be applied yet
      return this.getMockTenantSummaries();
    } catch (error) {
      console.error('Error fetching tenant summaries:', error);
      return this.getMockTenantSummaries();
    }
  }

  // Bulk operations for cross-tenant administration
  async bulkUpdateUsers(userIds: string[], updates: {
    status?: 'active' | 'inactive' | 'suspended';
    role?: 'super_admin' | 'admin' | 'moderator' | 'user';
    tenantId?: string;
    permissions?: string[];
    restrictions?: any;
  }): Promise<{
    success: boolean;
    updatedCount: number;
    errors: string[];
  }> {
    try {
      const errors: string[] = [];

      // Process each user update
      for (const userId of userIds) {
        try {
          const updateData: any = {};
          if (updates.status) updateData.status = updates.status;
          if (updates.role) updateData.role = updates.role;
          if (updates.tenantId) updateData.tenant_id = updates.tenantId;
          if (updates.permissions) updateData.permissions = updates.permissions;
          if (updates.restrictions) updateData.restrictions = updates.restrictions;

          updateData.updated_at = new Date().toISOString();

          // Use mock update for now since database schema may not be applied yet
          console.log(`Updating user ${userId}:`, updateData);

          // Simulate successful update for mock data
        } catch (error) {
          errors.push(`Error updating user ${userId}: ${error}`);
        }
      }

      return {
        success: errors.length === 0,
        updatedCount: userIds.length - errors.length,
        errors
      };
    } catch (error) {
      console.error('Error in bulk user update:', error);
      return {
        success: false,
        updatedCount: 0,
        errors: [`Bulk update failed: ${error}`]
      };
    }
  }

  // Get user activity report for specific user
  async getUserActivityReport(userId: string, timeRange: string = '30d'): Promise<UserActivityReport | null> {
    try {
      // Use mock data for now since database schema may not be applied yet
      return this.getMockUserActivityReport(userId);
    } catch (error) {
      console.error('Error generating user activity report:', error);
      return this.getMockUserActivityReport(userId);
    }
  }

  // Create new user with cross-tenant assignment
  async createUser(userData: {
    email: string;
    name: string;
    phoneNumber?: string;
    userType: 'creator' | 'investor' | 'admin' | 'super_admin';
    role?: 'super_admin' | 'admin' | 'moderator' | 'user';
    tenantId?: string;
    permissions?: string[];
    sendWelcomeEmail?: boolean;
  }): Promise<AdminUser | null> {
    try {
      const newUser: AdminUser = {
        id: `user_${Date.now()}`,
        email: userData.email,
        name: userData.name,
        phoneNumber: userData.phoneNumber,
        userType: userData.userType,
        role: userData.role || 'user',
        status: 'active',
        isVerified: false,
        phoneVerified: false,
        tenantId: userData.tenantId,
        permissions: userData.permissions || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        managedTenants: [],
        restrictions: {},
        activity: {
          loginCount: 0,
          lastActivity: new Date().toISOString(),
          sessionDuration: 0,
          failedAttempts: 0
        },
        metadata: {}
      };

      // In a real implementation, this would save to the database
      console.log('Creating user:', newUser);

      // Send welcome email if requested
      if (userData.sendWelcomeEmail) {
        await this.sendWelcomeEmail(newUser);
      }

      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  // Update user with enhanced cross-tenant features
  async updateUser(userId: string, updates: {
    name?: string;
    email?: string;
    phoneNumber?: string;
    role?: 'super_admin' | 'admin' | 'moderator' | 'user';
    status?: 'active' | 'inactive' | 'suspended';
    tenantId?: string;
    permissions?: string[];
    restrictions?: any;
    metadata?: Record<string, any>;
  }): Promise<AdminUser | null> {
    try {
      // In a real implementation, this would update the user in the database
      console.log(`Updating user ${userId}:`, updates);

      // Return updated user object
      return null; // Would return the updated user from database
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  // Delete user (soft delete with cross-tenant cleanup)
  async deleteUser(userId: string): Promise<boolean> {
    try {
      // In a real implementation, this would soft delete the user and clean up cross-tenant references
      console.log(`Soft deleting user ${userId}`);

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // Get users by tenant with activity summary
  async getUsersByTenant(tenantId: string): Promise<{
    users: AdminUser[];
    summary: {
      totalUsers: number;
      activeUsers: number;
      newThisMonth: number;
      topActiveUsers: AdminUser[];
    };
  }> {
    try {
      const users = await this.getUsers({ tenantId });
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.status === 'active').length;
      const newThisMonth = users.filter(u => new Date(u.createdAt) > thirtyDaysAgo).length;

      // Sort by activity (mock implementation - would use real activity data)
      const topActiveUsers = users
        .sort((a, b) => (b.activity?.loginCount || 0) - (a.activity?.loginCount || 0))
        .slice(0, 5);

      return {
        users,
        summary: {
          totalUsers,
          activeUsers,
          newThisMonth,
          topActiveUsers
        }
      };
    } catch (error) {
      console.error('Error fetching users by tenant:', error);
      return {
        users: [],
        summary: {
          totalUsers: 0,
          activeUsers: 0,
          newThisMonth: 0,
          topActiveUsers: []
        }
      };
    }
  }

  // Cross-tenant user assignment
  async assignUserToTenants(userId: string, tenantIds: string[]): Promise<boolean> {
    try {
      // In a real implementation, this would update user-tenant relationships
      console.log(`Assigning user ${userId} to tenants:`, tenantIds);

      return true;
    } catch (error) {
      console.error('Error assigning user to tenants:', error);
      return false;
    }
  }

  // Private helper methods
  private getMockUsers(filters: any = {}): AdminUser[] {
    const mockUsers: AdminUser[] = [
      {
        id: 'user_001',
        email: 'john.doe@techventures.com',
        name: 'John Doe',
        phoneNumber: '+1-555-0101',
        userType: 'creator',
        role: 'admin',
        status: 'active',
        isVerified: true,
        phoneVerified: true,
        tenantId: 'tenant1',
        tenantName: 'TechVentures Inc.',
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        managedTenants: ['tenant1', 'tenant2'],
        permissions: ['user_management', 'tenant_admin', 'analytics_view'],
        restrictions: {
          maxTenants: 3,
          allowedActions: ['read', 'write', 'admin']
        },
        activity: {
          loginCount: 45,
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          sessionDuration: 3600,
          failedAttempts: 2
        }
      },
      {
        id: 'user_002',
        email: 'sarah.manager@greenenergy.com',
        name: 'Sarah Manager',
        userType: 'investor',
        role: 'user',
        status: 'active',
        isVerified: true,
        phoneVerified: false,
        tenantId: 'tenant2',
        tenantName: 'GreenEnergy Solutions',
        lastLogin: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        managedTenants: ['tenant2'],
        permissions: ['investment_view', 'project_view'],
        activity: {
          loginCount: 23,
          lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          sessionDuration: 1800,
          failedAttempts: 0
        }
      },
      {
        id: 'user_003',
        email: 'mike.developer@demo.com',
        name: 'Mike Developer',
        userType: 'creator',
        role: 'moderator',
        status: 'suspended',
        isVerified: true,
        phoneVerified: true,
        tenantId: 'tenant3',
        tenantName: 'Demo Tenant',
        lastLogin: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        managedTenants: ['tenant3'],
        permissions: ['project_create', 'user_view'],
        restrictions: {
          maxTenants: 1,
          allowedActions: ['read', 'write']
        },
        activity: {
          loginCount: 12,
          lastActivity: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          sessionDuration: 900,
          failedAttempts: 5
        }
      }
    ];

    // Apply filters to mock data
    let filteredUsers = mockUsers;

    if (filters.tenantId) {
      filteredUsers = filteredUsers.filter(user => user.tenantId === filters.tenantId);
    }

    if (filters.status) {
      filteredUsers = filteredUsers.filter(user => user.status === filters.status);
    }

    if (filters.role) {
      filteredUsers = filteredUsers.filter(user => user.role === filters.role);
    }

    if (filters.userType) {
      filteredUsers = filteredUsers.filter(user => user.userType === filters.userType);
    }

    if (filters.searchTerm) {
      filteredUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.searchTerm!.toLowerCase())
      );
    }

    if (filters.limit) {
      filteredUsers = filteredUsers.slice(0, filters.limit);
    }

    return filteredUsers;
  }

  private getMockTenantSummaries(): TenantUserSummary[] {
    return [
      {
        tenantId: 'tenant1',
        tenantName: 'TechVentures Inc.',
        totalUsers: 45,
        activeUsers: 42,
        suspendedUsers: 2,
        adminUsers: 5,
        recentActivity: 38,
        growthRate: 15.2
      },
      {
        tenantId: 'tenant2',
        tenantName: 'GreenEnergy Solutions',
        totalUsers: 23,
        activeUsers: 21,
        suspendedUsers: 1,
        adminUsers: 2,
        recentActivity: 19,
        growthRate: 8.7
      },
      {
        tenantId: 'tenant3',
        tenantName: 'Demo Tenant',
        totalUsers: 12,
        activeUsers: 8,
        suspendedUsers: 3,
        adminUsers: 1,
        recentActivity: 5,
        growthRate: -12.5
      }
    ];
  }

  private getMockUserActivityReport(userId: string): UserActivityReport | null {
    return {
      userId,
      userName: 'John Doe',
      activities: [
        {
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          loginCount: 5,
          actionsPerformed: 23,
          sessionDuration: 7200,
          ipAddresses: ['192.168.1.100', '10.0.1.50'],
          locations: ['New York, US', 'San Francisco, US']
        },
        {
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          loginCount: 3,
          actionsPerformed: 18,
          sessionDuration: 5400,
          ipAddresses: ['192.168.1.100'],
          locations: ['New York, US']
        }
      ],
      summary: {
        totalLogins: 8,
        totalActions: 41,
        averageSessionTime: 6300,
        uniqueIPs: 2,
        riskScore: 15
      }
    };
  }

  private calculateRiskScore(logs: any[]): number {
    // Calculate risk score based on login patterns, IP changes, etc.
    let riskScore = 0;

    // Factor in failed login attempts
    const failedLogins = logs.filter(log => log.action === 'failed_login_attempt').length;
    riskScore += failedLogins * 10;

    // Factor in IP address diversity
    const uniqueIPs = new Set(logs.map(log => log.ip_address).filter(Boolean)).size;
    if (uniqueIPs > 3) {
      riskScore += (uniqueIPs - 3) * 5;
    }

    // Factor in unusual timing (logins at odd hours)
    const unusualHours = logs.filter(log => {
      const hour = new Date(log.timestamp).getHours();
      return hour < 6 || hour > 22;
    }).length;
    riskScore += unusualHours * 3;

    return Math.min(riskScore, 100);
  }

  private async sendWelcomeEmail(user: AdminUser): Promise<boolean> {
    try {
      // In a real implementation, this would send a welcome email
      console.log(`Sending welcome email to ${user.email}`);
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }
}

export const userManagementService = new UserManagementService();