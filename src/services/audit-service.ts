"use client";

import { createClient } from '../lib/supabase-client';

// Create supabase client instance
const supabase = createClient();

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId?: string;
  userName: string;
  tenantId?: string;
  tenantName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  sessionId?: string;
  location?: string;
  riskScore?: number;
  createdAt: string;
}

export interface AuditFilters {
  userId?: string;
  tenantId?: string;
  action?: string;
  resource?: string;
  severity?: string;
  dateFrom?: string;
  dateTo?: string;
  riskScore?: number;
  limit?: number;
}

export interface AuditStats {
  totalLogs: number;
  logsBySeverity: Record<string, number>;
  logsByAction: Record<string, number>;
  logsByResource: Record<string, number>;
  logsByTenant: Record<string, number>;
  highRiskEvents: number;
  failedLogins: number;
  suspiciousActivities: number;
  recentActivity: AuditLogEntry[];
}

class AuditService {
  // Get audit logs with filtering
  async getAuditLogs(filters: AuditFilters = {}): Promise<AuditLogEntry[]> {
    try {
      // Query real audit logs from database
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      // Apply filters
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.tenantId) {
        query = query.eq('tenant_id', filters.tenantId);
      }

      if (filters.action) {
        query = query.eq('action', filters.action);
      }

      if (filters.resource) {
        query = query.eq('resource', filters.resource);
      }

      if (filters.severity) {
        query = query.eq('severity', filters.severity);
      }

      if (filters.dateFrom) {
        query = query.gte('timestamp', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('timestamp', filters.dateTo);
      }

      if (filters.riskScore) {
        query = query.gte('risk_score', filters.riskScore);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching audit logs:', error);
        // Fallback to mock data if table doesn't exist yet
        return this.getMockAuditLogs(filters);
      }

      return data?.map((log: any) => ({
        id: log.id,
        timestamp: log.timestamp,
        userId: log.user_id,
        userName: log.user_name,
        tenantId: log.tenant_id,
        tenantName: log.tenant_name,
        action: log.action,
        resource: log.resource,
        resourceId: log.resource_id,
        details: log.details,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        severity: log.severity,
        sessionId: log.session_id,
        location: log.location,
        riskScore: log.risk_score,
        createdAt: log.created_at
      })) || [];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return this.getMockAuditLogs(filters);
    }
  }

  // Fallback method for when audit_logs table doesn't exist yet
  private getMockAuditLogs(filters: AuditFilters = {}): AuditLogEntry[] {
    const mockLogs: AuditLogEntry[] = [
      {
        id: 'audit_001',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        userId: 'user_123',
        userName: 'John Doe',
        tenantId: 'tenant1',
        tenantName: 'Default Tenant',
        action: 'user_login',
        resource: 'authentication',
        details: {
          method: 'email_password',
          success: true,
          mfaVerified: true
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'low',
        sessionId: 'sess_abc123',
        location: 'New York, US',
        riskScore: 10,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'audit_002',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        userId: 'user_456',
        userName: 'Sarah Manager',
        tenantId: 'tenant2',
        tenantName: 'Demo Tenant',
        action: 'failed_login_attempt',
        resource: 'authentication',
        details: {
          method: 'email_password',
          reason: 'invalid_password',
          attemptCount: 3
        },
        ipAddress: '203.0.113.45',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
        severity: 'medium',
        sessionId: 'sess_def456',
        location: 'Unknown Location',
        riskScore: 65,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'audit_003',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        userId: 'user_789',
        userName: 'Mike Developer',
        tenantId: 'tenant1',
        tenantName: 'Default Tenant',
        action: 'tenant_settings_updated',
        resource: 'tenant_configuration',
        resourceId: 'tenant1',
        details: {
          changes: {
            branding_primary_color: '#007bff → #6f42c1',
            features_ai_recommendations: 'false to true'
          },
          reason: 'Updated branding and enabled AI features'
        },
        ipAddress: '10.0.1.50',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
        severity: 'high',
        sessionId: 'sess_ghi789',
        location: 'San Francisco, US',
        riskScore: 75,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'audit_004',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        userId: 'user_101',
        userName: 'Alice Developer',
        tenantId: 'tenant3',
        tenantName: 'Enterprise Tenant',
        action: 'user_created',
        resource: 'user_management',
        resourceId: 'user_999',
        details: {
          newUser: {
            email: 'newuser@example.com',
            role: 'investor',
            verificationStatus: 'pending'
          }
        },
        ipAddress: '172.16.0.25',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        severity: 'medium',
        sessionId: 'sess_jkl101',
        location: 'Austin, US',
        riskScore: 45,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'audit_005',
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        userId: 'user_202',
        userName: 'Bob Admin',
        tenantId: 'tenant1',
        tenantName: 'Default Tenant',
        action: 'security_policy_changed',
        resource: 'security_settings',
        details: {
          policy: 'password_policy',
          changes: {
            minLength: '8 → 12',
            requireSpecialChars: 'false → true',
            maxAge: '90 → 60'
          }
        },
        ipAddress: '192.168.1.200',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'critical',
        sessionId: 'sess_mno202',
        location: 'New York, US',
        riskScore: 90,
        createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Apply filters
    let filteredLogs = mockLogs;

    if (filters.userId) {
      filteredLogs = filteredLogs.filter((log: AuditLogEntry) => log.userId === filters.userId);
    }

    if (filters.tenantId) {
      filteredLogs = filteredLogs.filter((log: AuditLogEntry) => log.tenantId === filters.tenantId);
    }

    if (filters.action) {
      filteredLogs = filteredLogs.filter((log: AuditLogEntry) => log.action === filters.action);
    }

    if (filters.resource) {
      filteredLogs = filteredLogs.filter((log: AuditLogEntry) => log.resource === filters.resource);
    }

    if (filters.severity) {
      filteredLogs = filteredLogs.filter((log: AuditLogEntry) => log.severity === filters.severity);
    }

    if (filters.dateFrom) {
      filteredLogs = filteredLogs.filter((log: AuditLogEntry) => log.timestamp >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      filteredLogs = filteredLogs.filter((log: AuditLogEntry) => log.timestamp <= filters.dateTo!);
    }

    if (filters.riskScore) {
      filteredLogs = filteredLogs.filter((log: AuditLogEntry) => (log.riskScore || 0) >= filters.riskScore!);
    }

    if (filters.limit) {
      filteredLogs = filteredLogs.slice(0, filters.limit);
    }

    return filteredLogs;
  }

  // Get comprehensive audit statistics
  async getAuditStats(timeRange: string = '24h'): Promise<AuditStats> {
    try {
      const logs = await this.getAuditLogs();

      const totalLogs = logs.length;

      // Calculate distribution by severity
      const logsBySeverity = logs.reduce((acc: Record<string, number>, log: AuditLogEntry) => {
        acc[log.severity] = (acc[log.severity] || 0) + 1;
        return acc;
      }, {});

      // Calculate distribution by action
      const logsByAction = logs.reduce((acc: Record<string, number>, log: AuditLogEntry) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {});

      // Calculate distribution by resource
      const logsByResource = logs.reduce((acc: Record<string, number>, log: AuditLogEntry) => {
        acc[log.resource] = (acc[log.resource] || 0) + 1;
        return acc;
      }, {});

      // Calculate distribution by tenant
      const logsByTenant = logs.reduce((acc: Record<string, number>, log: AuditLogEntry) => {
        const tenantKey = log.tenantName || log.tenantId || 'Unknown';
        acc[tenantKey] = (acc[tenantKey] || 0) + 1;
        return acc;
      }, {});

      const highRiskEvents = logs.filter((log: AuditLogEntry) => (log.riskScore || 0) >= 70).length;
      const failedLogins = logs.filter((log: AuditLogEntry) => log.action === 'failed_login_attempt').length;
      const suspiciousActivities = logs.filter((log: AuditLogEntry) =>
        log.action.includes('suspicious') || log.action.includes('breach') || log.action.includes('attack')
      ).length;

      const recentActivity = logs.slice(0, 10);

      return {
        totalLogs,
        logsBySeverity,
        logsByAction,
        logsByResource,
        logsByTenant,
        highRiskEvents,
        failedLogins,
        suspiciousActivities,
        recentActivity
      };
    } catch (error) {
      console.error('Error fetching audit stats:', error);
      return {
        totalLogs: 0,
        logsBySeverity: {},
        logsByAction: {},
        logsByResource: {},
        logsByTenant: {},
        highRiskEvents: 0,
        failedLogins: 0,
        suspiciousActivities: 0,
        recentActivity: []
      };
    }
  }

  // Export audit logs to CSV format
  async exportAuditLogs(filters: AuditFilters, format: 'csv' | 'json' = 'csv'): Promise<string> {
    try {
      const logs = await this.getAuditLogs(filters);

      if (format === 'json') {
        return JSON.stringify(logs, null, 2);
      }

      // CSV format
      const headers = [
        'Timestamp',
        'User',
        'Tenant',
        'Action',
        'Resource',
        'Severity',
        'Risk Score',
        'IP Address',
        'Location',
        'Details'
      ];

      const csvRows = [
        headers.join(','),
        ...logs.map((log: AuditLogEntry) => [
          log.timestamp,
          log.userName,
          log.tenantName || '',
          log.action,
          log.resource,
          log.severity,
          log.riskScore || '',
          log.ipAddress || '',
          log.location || '',
          JSON.stringify(log.details).replace(/"/g, '""')
        ].map(field => `"${field}"`).join(','))
      ];

      return csvRows.join('\n');
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      throw new Error('Failed to export audit logs');
    }
  }

  // Get filter options for UI
  async getFilterOptions(): Promise<{
    actions: string[];
    resources: string[];
    severities: string[];
    users: { id: string; name: string; }[];
    tenants: { id: string; name: string; }[];
    ipAddresses: string[];
  }> {
    try {
      const logs = await this.getAuditLogs();

      const actions = Array.from(new Set(logs.map((log: AuditLogEntry) => log.action)));
      const resources = Array.from(new Set(logs.map((log: AuditLogEntry) => log.resource)));
      const severities = Array.from(new Set(logs.map((log: AuditLogEntry) => log.severity)));
      const ipAddresses = Array.from(new Set(logs.map((log: AuditLogEntry) => log.ipAddress).filter((ip): ip is string => Boolean(ip))));

      const users = logs.reduce((acc: { id: string; name: string; }[], log: AuditLogEntry) => {
        if (log.userId && !acc.find(u => u.id === log.userId)) {
          acc.push({ id: log.userId, name: log.userName });
        }
        return acc;
      }, []);

      const tenants = logs.reduce((acc: { id: string; name: string; }[], log: AuditLogEntry) => {
        if (log.tenantId && !acc.find(t => t.id === log.tenantId)) {
          acc.push({ id: log.tenantId, name: log.tenantName || log.tenantId });
        }
        return acc;
      }, []);

      return {
        actions,
        resources,
        severities,
        users,
        tenants,
        ipAddresses
      };
    } catch (error) {
      console.error('Error fetching filter options:', error);
      return {
        actions: [],
        resources: [],
        severities: [],
        users: [],
        tenants: [],
        ipAddresses: []
      };
    }
  }

  // Get specific audit log by ID
  async getAuditLogById(id: string): Promise<AuditLogEntry | null> {
    try {
      const logs = await this.getAuditLogs();
      return logs.find((log: AuditLogEntry) => log.id === id) || null;
    } catch (error) {
      console.error('Error fetching audit log by ID:', error);
      return null;
    }
  }

  // Get user activity timeline
  async getUserActivityTimeline(userId: string, dateRange?: { from: Date; to: Date }): Promise<AuditLogEntry[]> {
    return this.getAuditLogs({
      userId,
      dateFrom: dateRange?.from?.toISOString(),
      dateTo: dateRange?.to?.toISOString()
    });
  }

  // Get tenant activity summary
  async getTenantActivitySummary(tenantId: string): Promise<{
    totalActivities: number;
    uniqueUsers: number;
    highRiskEvents: number;
    recentActivities: AuditLogEntry[];
  }> {
    const logs = await this.getAuditLogs({ tenantId });
    const uniqueUsers = new Set(logs.map((log: AuditLogEntry) => log.userId)).size;
    const highRiskEvents = logs.filter((log: AuditLogEntry) => (log.riskScore || 0) >= 70).length;
    const recentActivities = logs.slice(0, 20);

    return {
      totalActivities: logs.length,
      uniqueUsers,
      highRiskEvents,
      recentActivities
    };
  }

  // Private helper method to convert logs to CSV format
  private convertToCSV(logs: AuditLogEntry[]): string {
    const headers = [
      'Timestamp',
      'User',
      'Tenant',
      'Action',
      'Resource',
      'Severity',
      'Risk Score',
      'IP Address',
      'Location',
      'Details'
    ];

    const csvRows = [
      headers.join(','),
      ...logs.map((log: AuditLogEntry) => [
        log.timestamp,
        log.userName,
        log.tenantName || '',
        log.action,
        log.resource,
        log.severity,
        log.riskScore || '',
        log.ipAddress || '',
        log.location || '',
        JSON.stringify(log.details).replace(/"/g, '""')
      ].map(field => `"${field}"`).join(','))
    ];

    return csvRows.join('\n');
  }
}

export const auditService = new AuditService();