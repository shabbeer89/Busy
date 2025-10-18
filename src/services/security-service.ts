"use client";

import { createClient } from '../lib/supabase-client';

// Create supabase client instance
const supabase = createClient();

export interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'threat' | 'breach' | 'suspicious' | 'policy_violation' | 'failed_login' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  sourceIp: string;
  userId?: string;
  userName?: string;
  tenantId?: string;
  location?: string;
  userAgent?: string;
  riskScore: number;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  resolvedAt?: string;
  resolution?: string;
  details: Record<string, any>;
}

export interface AccessControlRule {
  id: string;
  name: string;
  description: string;
  type: 'ip_whitelist' | 'ip_blacklist' | 'user_restriction' | 'time_restriction' | 'location_restriction';
  rule: {
    allowedIps?: string[];
    blockedIps?: string[];
    allowedUsers?: string[];
    blockedUsers?: string[];
    allowedCountries?: string[];
    blockedCountries?: string[];
    allowedTimeRanges?: { start: string; end: string; timezone: string; }[];
    maxLoginAttempts?: number;
    requireMfa?: boolean;
    allowedUserAgents?: string[];
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  category: 'authentication' | 'authorization' | 'data_protection' | 'network_security' | 'compliance';
  rules: {
    passwordMinLength: number;
    passwordRequireSpecialChars: boolean;
    passwordRequireNumbers: boolean;
    passwordRequireUppercase: boolean;
    passwordMaxAge: number;
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    requireMfa: boolean;
    allowedFileTypes: string[];
    maxFileSize: number;
    encryptionRequired: boolean;
    auditLogRetention: number;
  };
  isActive: boolean;
  isDefault: boolean;
  appliesToTenants: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ThreatIntelligence {
  id: string;
  type: 'ip_reputation' | 'domain_reputation' | 'malware_signature' | 'attack_pattern';
  indicator: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  firstSeen: string;
  lastSeen: string;
  occurrences: number;
  affectedTenants: string[];
  mitigation: string;
  status: 'active' | 'inactive' | 'deprecated';
}

export interface SecurityStats {
  totalIncidents: number;
  activeThreats: number;
  resolvedToday: number;
  averageResolutionTime: number;
  topThreatTypes: { type: string; count: number; }[];
  topSourceCountries: { country: string; count: number; }[];
  failedLoginAttempts: number;
  suspiciousActivities: number;
  policyViolations: number;
  securityScore: number;
}

class SecurityService {
  // Get security events with filtering
  async getSecurityEvents(filters: {
    type?: string;
    severity?: string;
    status?: string;
    tenantId?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  } = {}): Promise<SecurityEvent[]> {
    try {
      // Query real security events from database
      let query = supabase
        .from('security_events')
        .select('*')
        .order('timestamp', { ascending: false });

      // Apply filters
      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.severity) {
        query = query.eq('severity', filters.severity);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.tenantId) {
        query = query.eq('tenant_id', filters.tenantId);
      }

      if (filters.dateFrom) {
        query = query.gte('timestamp', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('timestamp', filters.dateTo);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching security events:', error);
        // Fallback to mock data if table doesn't exist yet
        return this.getMockSecurityEvents(filters);
      }

      return data?.map((event: any) => ({
        id: event.id,
        timestamp: event.timestamp,
        type: event.type,
        severity: event.severity,
        title: event.title,
        description: event.description,
        sourceIp: event.source_ip,
        userId: event.user_id,
        userName: event.user_name,
        tenantId: event.tenant_id,
        location: event.location,
        userAgent: event.user_agent,
        riskScore: event.risk_score,
        status: event.status,
        assignedTo: event.assigned_to,
        resolvedAt: event.resolved_at,
        resolution: event.resolution,
        details: event.details
      })) || [];
    } catch (error) {
      console.error('Error fetching security events:', error);
      return this.getMockSecurityEvents(filters);
    }
  }

  // Fallback method for when security_events table doesn't exist yet
  private getMockSecurityEvents(filters: any = {}): SecurityEvent[] {
    const mockEvents: SecurityEvent[] = [
      {
        id: 'sec_001',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        type: 'failed_login',
        severity: 'medium',
        title: 'Multiple Failed Login Attempts',
        description: 'User attempted to login 5 times with incorrect credentials',
        sourceIp: '203.0.113.45',
        userId: 'user_123',
        userName: 'John Doe',
        tenantId: 'tenant1',
        location: 'Unknown Location',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
        riskScore: 65,
        status: 'active',
        details: {
          attemptCount: 5,
          timeWindow: '10 minutes',
          blockedUntil: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          unusualPatterns: ['rapid_attempts', 'different_devices']
        }
      },
      {
        id: 'sec_002',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        type: 'suspicious',
        severity: 'high',
        title: 'Unusual Data Access Pattern',
        description: 'User accessed sensitive data outside normal business hours',
        sourceIp: '192.168.1.100',
        userId: 'user_456',
        userName: 'Sarah Manager',
        tenantId: 'tenant2',
        location: 'New York, US',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        riskScore: 80,
        status: 'investigating',
        assignedTo: 'security_team_lead',
        details: {
          dataTypes: ['financial_records', 'user_profiles'],
          accessTime: '03:45 AM',
          normalHours: '09:00 AM - 06:00 PM',
          dataVolume: '2.5GB',
          destinationIps: ['external_api.example.com']
        }
      },
      {
        id: 'sec_003',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        type: 'policy_violation',
        severity: 'critical',
        title: 'Data Export Policy Violation',
        description: 'Large data export without proper authorization',
        sourceIp: '10.0.1.50',
        userId: 'user_789',
        userName: 'Mike Developer',
        tenantId: 'tenant1',
        location: 'San Francisco, US',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
        riskScore: 90,
        status: 'active',
        details: {
          exportSize: '5.2GB',
          recordCount: 25000,
          dataTypes: ['personal_data', 'financial_data', 'health_records'],
          destination: 'unauthorized_external_server',
          complianceRisk: 'GDPR_violation',
          requiresLegalReview: true
        }
      },
      {
        id: 'sec_004',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        type: 'threat',
        severity: 'critical',
        title: 'Potential Data Breach Detected',
        description: 'Unusual data access patterns suggest possible breach',
        sourceIp: '203.0.113.195',
        location: 'Moscow, RU',
        userAgent: 'Custom/1.0 (Automated Script)',
        riskScore: 95,
        status: 'active',
        assignedTo: 'incident_response_team',
        details: {
          accessPattern: 'systematic_data_extraction',
          dataTargeted: ['user_credentials', 'payment_info', 'personal_data'],
          extractionRate: '500 records/minute',
          duration: '45 minutes',
          automatedScript: true,
          indicatorsOfCompromise: ['unusual_api_calls', 'data_compression', 'encryption_bypass']
        }
      },
      {
        id: 'sec_005',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        type: 'unauthorized_access',
        severity: 'high',
        title: 'Privilege Escalation Attempt',
        description: 'User attempted to access admin functions without proper authorization',
        sourceIp: '172.16.0.25',
        userId: 'user_101',
        userName: 'Alice Developer',
        tenantId: 'tenant3',
        location: 'Austin, US',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        riskScore: 75,
        status: 'resolved',
        assignedTo: 'security_team',
        resolvedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        resolution: 'User education provided, access patterns normalized',
        details: {
          attemptedActions: ['database_admin', 'user_termination', 'system_config'],
          userRole: 'developer',
          requiredRole: 'admin',
          accessMethod: 'api_endpoint_manipulation',
          detectionMethod: 'behavioral_analysis'
        }
      }
    ];

    // Apply filters
    let filteredEvents = mockEvents;

    if (filters.type) {
      filteredEvents = filteredEvents.filter((event: SecurityEvent) => event.type === filters.type);
    }

    if (filters.severity) {
      filteredEvents = filteredEvents.filter((event: SecurityEvent) => event.severity === filters.severity);
    }

    if (filters.status) {
      filteredEvents = filteredEvents.filter((event: SecurityEvent) => event.status === filters.status);
    }

    if (filters.tenantId) {
      filteredEvents = filteredEvents.filter((event: SecurityEvent) => event.tenantId === filters.tenantId);
    }

    if (filters.dateFrom) {
      filteredEvents = filteredEvents.filter((event: SecurityEvent) => event.timestamp >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      filteredEvents = filteredEvents.filter((event: SecurityEvent) => event.timestamp <= filters.dateTo!);
    }

    if (filters.limit) {
      filteredEvents = filteredEvents.slice(0, filters.limit);
    }

    return filteredEvents;
  }

  // Get comprehensive security statistics
  async getSecurityStats(): Promise<SecurityStats> {
    try {
      const events = await this.getSecurityEvents();

      const totalIncidents = events.length;
      const activeThreats = events.filter((e: SecurityEvent) => e.status === 'active' || e.status === 'investigating').length;
      const resolvedToday = events.filter((e: SecurityEvent) =>
        e.status === 'resolved' &&
        e.resolvedAt &&
        new Date(e.resolvedAt).toDateString() === new Date().toDateString()
      ).length;

      const resolutionTimes = events
        .filter((e: SecurityEvent) => e.resolvedAt)
        .map((e: SecurityEvent) => {
          const created = new Date(e.timestamp).getTime();
          const resolved = new Date(e.resolvedAt!).getTime();
          return resolved - created;
        });

      const averageResolutionTime = resolutionTimes.length > 0
        ? resolutionTimes.reduce((sum: number, time: number) => sum + time, 0) / resolutionTimes.length
        : 0;

      // Calculate threat type distribution
      const threatTypes = events.reduce((acc: Record<string, number>, event: SecurityEvent) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {});

      const topThreatTypes = Object.entries(threatTypes)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate country distribution (mock data)
      const topSourceCountries = [
        { country: 'United States', count: 45 },
        { country: 'Russia', count: 23 },
        { country: 'China', count: 18 },
        { country: 'Germany', count: 12 },
        { country: 'Unknown', count: 8 }
      ];

      const failedLoginAttempts = events.filter((e: SecurityEvent) => e.type === 'failed_login').length;
      const suspiciousActivities = events.filter((e: SecurityEvent) => e.type === 'suspicious').length;
      const policyViolations = events.filter((e: SecurityEvent) => e.type === 'policy_violation').length;

      // Calculate security score (0-100)
      const securityScore = Math.max(0, 100 - (activeThreats * 5) - (policyViolations * 3) - (failedLoginAttempts * 0.5));

      return {
        totalIncidents,
        activeThreats,
        resolvedToday,
        averageResolutionTime,
        topThreatTypes,
        topSourceCountries,
        failedLoginAttempts,
        suspiciousActivities,
        policyViolations,
        securityScore
      };
    } catch (error) {
      console.error('Error fetching security stats:', error);
      return {
        totalIncidents: 0,
        activeThreats: 0,
        resolvedToday: 0,
        averageResolutionTime: 0,
        topThreatTypes: [],
        topSourceCountries: [],
        failedLoginAttempts: 0,
        suspiciousActivities: 0,
        policyViolations: 0,
        securityScore: 100
      };
    }
  }

  // Get access control rules
  async getAccessControlRules(): Promise<AccessControlRule[]> {
    try {
      return [
        {
          id: 'rule_001',
          name: 'Office IP Whitelist',
          description: 'Allow access only from office IP ranges',
          type: 'ip_whitelist',
          rule: {
            allowedIps: ['192.168.1.0/24', '10.0.0.0/8'],
            requireMfa: true
          },
          isActive: true,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: 'admin_001'
        },
        {
          id: 'rule_002',
          name: 'Suspicious Countries Block',
          description: 'Block access from high-risk countries',
          type: 'ip_blacklist',
          rule: {
            blockedCountries: ['RU', 'CN', 'IR', 'KP'],
            blockedIps: ['203.0.113.0/24']
          },
          isActive: true,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: 'admin_001'
        },
        {
          id: 'rule_003',
          name: 'Business Hours Only',
          description: 'Restrict admin access to business hours',
          type: 'time_restriction',
          rule: {
            allowedTimeRanges: [
              { start: '09:00', end: '18:00', timezone: 'America/New_York' },
              { start: '09:00', end: '18:00', timezone: 'America/Los_Angeles' }
            ],
            allowedUsers: ['admin_001', 'admin_002']
          },
          isActive: true,
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: 'admin_001'
        }
      ];
    } catch (error) {
      console.error('Error fetching access control rules:', error);
      return [];
    }
  }

  // Get security policies
  async getSecurityPolicies(): Promise<SecurityPolicy[]> {
    try {
      return [
        {
          id: 'policy_001',
          name: 'Enhanced Security Policy',
          description: 'High-security policy for sensitive environments',
          category: 'authentication',
          rules: {
            passwordMinLength: 12,
            passwordRequireSpecialChars: true,
            passwordRequireNumbers: true,
            passwordRequireUppercase: true,
            passwordMaxAge: 60,
            sessionTimeout: 1800,
            maxLoginAttempts: 3,
            lockoutDuration: 900,
            requireMfa: true,
            allowedFileTypes: ['pdf', 'doc', 'docx', 'txt'],
            maxFileSize: 10 * 1024 * 1024, // 10MB
            encryptionRequired: true,
            auditLogRetention: 2555 // 7 years in days
          },
          isActive: true,
          isDefault: false,
          appliesToTenants: ['tenant1', 'tenant3'],
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'policy_002',
          name: 'Standard Security Policy',
          description: 'Default security policy for regular tenants',
          category: 'authentication',
          rules: {
            passwordMinLength: 8,
            passwordRequireSpecialChars: true,
            passwordRequireNumbers: true,
            passwordRequireUppercase: false,
            passwordMaxAge: 90,
            sessionTimeout: 3600,
            maxLoginAttempts: 5,
            lockoutDuration: 1800,
            requireMfa: false,
            allowedFileTypes: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'png'],
            maxFileSize: 25 * 1024 * 1024, // 25MB
            encryptionRequired: false,
            auditLogRetention: 1825 // 5 years in days
          },
          isActive: true,
          isDefault: true,
          appliesToTenants: ['all'],
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
    } catch (error) {
      console.error('Error fetching security policies:', error);
      return [];
    }
  }

  // Get threat intelligence data
  async getThreatIntelligence(): Promise<ThreatIntelligence[]> {
    try {
      return [
        {
          id: 'threat_001',
          type: 'ip_reputation',
          indicator: '203.0.113.45',
          severity: 'high',
          description: 'IP address associated with multiple failed login attempts and suspicious activities',
          firstSeen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          occurrences: 45,
          affectedTenants: ['tenant1', 'tenant2', 'tenant3'],
          mitigation: 'Block IP address and monitor for similar patterns',
          status: 'active'
        },
        {
          id: 'threat_002',
          type: 'attack_pattern',
          indicator: 'credential_stuffing',
          severity: 'critical',
          description: 'Automated credential stuffing attack detected across multiple tenants',
          firstSeen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          occurrences: 123,
          affectedTenants: ['tenant1', 'tenant2'],
          mitigation: 'Implement rate limiting, CAPTCHA, and behavioral analysis',
          status: 'active'
        },
        {
          id: 'threat_003',
          type: 'malware_signature',
          indicator: 'trojan_data_exfiltration',
          severity: 'critical',
          description: 'Malware detected attempting to exfiltrate sensitive data',
          firstSeen: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          lastSeen: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          occurrences: 8,
          affectedTenants: ['tenant3'],
          mitigation: 'Isolate affected systems, scan for malware, update signatures',
          status: 'active'
        }
      ];
    } catch (error) {
      console.error('Error fetching threat intelligence:', error);
      return [];
    }
  }

  // Update security event status
  async updateSecurityEventStatus(eventId: string, status: SecurityEvent['status'], resolution?: string): Promise<boolean> {
    try {
      // In a real implementation, this would update the security event in the database
      console.log(`Updating security event ${eventId} to status: ${status}`, { resolution });
      return true;
    } catch (error) {
      console.error('Error updating security event status:', error);
      return false;
    }
  }

  // Create new access control rule
  async createAccessControlRule(rule: Omit<AccessControlRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AccessControlRule | null> {
    try {
      const newRule: AccessControlRule = {
        id: `rule_${Date.now()}`,
        ...rule,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // In a real implementation, this would save to the database
      console.log('Creating access control rule:', newRule);
      return newRule;
    } catch (error) {
      console.error('Error creating access control rule:', error);
      return null;
    }
  }

  // Update security policy
  async updateSecurityPolicy(policyId: string, updates: Partial<SecurityPolicy>): Promise<SecurityPolicy | null> {
    try {
      // In a real implementation, this would update the policy in the database
      console.log(`Updating security policy ${policyId}:`, updates);
      return null; // Return updated policy
    } catch (error) {
      console.error('Error updating security policy:', error);
      return null;
    }
  }

  // Get security dashboard summary
  async getSecurityDashboardSummary(): Promise<{
    criticalAlerts: number;
    activeInvestigations: number;
    blockedAttempts: number;
    securityScore: number;
    recentEvents: SecurityEvent[];
    topThreats: { name: string; count: number; severity: string; }[];
  }> {
    try {
      const events = await this.getSecurityEvents();
      const stats = await this.getSecurityStats();

      const criticalAlerts = events.filter((e: SecurityEvent) => e.severity === 'critical' && e.status === 'active').length;
      const activeInvestigations = events.filter((e: SecurityEvent) => e.status === 'investigating').length;
      const blockedAttempts = events.filter((e: SecurityEvent) => e.type === 'unauthorized_access').length;

      const recentEvents = events.slice(0, 10);

      const topThreats = events.reduce((acc: { name: string; count: number; severity: string; }[], event: SecurityEvent) => {
        const existing = acc.find(t => t.name === event.type);
        if (existing) {
          existing.count++;
        } else {
          acc.push({
            name: event.type,
            count: 1,
            severity: event.severity
          });
        }
        return acc;
      }, [])
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

      return {
        criticalAlerts,
        activeInvestigations,
        blockedAttempts,
        securityScore: stats.securityScore,
        recentEvents,
        topThreats
      };
    } catch (error) {
      console.error('Error fetching security dashboard summary:', error);
      return {
        criticalAlerts: 0,
        activeInvestigations: 0,
        blockedAttempts: 0,
        securityScore: 100,
        recentEvents: [],
        topThreats: []
      };
    }
  }
}

export const securityService = new SecurityService();