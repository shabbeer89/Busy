// Audit Trail System
// Comprehensive activity logging with tenant isolation

export enum AuditEvent {
  // Authentication Events
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_REGISTER = 'user_register',
  PASSWORD_RESET = 'password_reset',
  PASSWORD_CHANGE = 'password_change',

  // Profile Events
  PROFILE_UPDATE = 'profile_update',
  PROFILE_VIEW = 'profile_view',

  // Business Events
  IDEA_CREATE = 'idea_create',
  IDEA_UPDATE = 'idea_update',
  IDEA_DELETE = 'idea_delete',
  IDEA_PUBLISH = 'idea_publish',
  IDEA_VIEW = 'idea_view',

  OFFER_CREATE = 'offer_create',
  OFFER_UPDATE = 'offer_update',
  OFFER_DELETE = 'offer_delete',
  OFFER_VIEW = 'offer_view',

  // Matching Events
  MATCH_CREATE = 'match_create',
  MATCH_VIEW = 'match_view',
  MATCH_CONTACT = 'match_contact',
  MATCH_NEGOTIATE = 'match_negotiate',
  MATCH_COMPLETE = 'match_complete',
  MATCH_REJECT = 'match_reject',

  // Messaging Events
  MESSAGE_SEND = 'message_send',
  MESSAGE_READ = 'message_read',
  FILE_SHARE = 'file_share',

  // Video Call Events
  VIDEO_CALL_START = 'video_call_start',
  VIDEO_CALL_END = 'video_call_end',
  SCREEN_SHARE_START = 'screen_share_start',
  SCREEN_SHARE_END = 'screen_share_end',

  // Transaction Events
  TRANSACTION_INITIATE = 'transaction_initiate',
  TRANSACTION_CONFIRM = 'transaction_confirm',
  TRANSACTION_COMPLETE = 'transaction_complete',
  TRANSACTION_CANCEL = 'transaction_cancel',
  TRANSACTION_REFUND = 'transaction_refund',

  // Admin Events
  TENANT_CREATE = 'tenant_create',
  TENANT_UPDATE = 'tenant_update',
  TENANT_DELETE = 'tenant_delete',
  TENANT_SUSPEND = 'tenant_suspend',
  TENANT_ACTIVATE = 'tenant_activate',

  USER_CREATE = 'user_create',
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
  USER_SUSPEND = 'user_suspend',
  USER_ACTIVATE = 'user_activate',

  FEATURE_ENABLE = 'feature_enable',
  FEATURE_DISABLE = 'feature_disable',
  FEATURE_CONFIG_UPDATE = 'feature_config_update',

  // Security Events
  FAILED_LOGIN = 'failed_login',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  PERMISSION_DENIED = 'permission_denied',
  DATA_EXPORT = 'data_export',
  SETTINGS_CHANGE = 'settings_change',

  // System Events
  SYSTEM_BACKUP = 'system_backup',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  ERROR_OCCURRED = 'error_occurred',
  PERFORMANCE_ISSUE = 'performance_issue',
}

export enum AuditSeverity {
  LOW = 'low',         // Routine user actions
  MEDIUM = 'medium',   // Business transactions, feature changes
  HIGH = 'high',       // Admin actions, tenant modifications
  CRITICAL = 'critical', // Security breaches, data corruption
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userRole: string;
  tenantId?: string;
  tenantName?: string;
  event: AuditEvent;
  resource: string;
  resourceId?: string;
  action: string;
  details: Record<string, any>;
  severity: AuditSeverity;
  ipAddress: string;
  userAgent: string;
  sessionId?: string;
  success: boolean;
  errorMessage?: string;
  metadata: {
    requestId?: string;
    duration?: number;
    userAgentParsed?: {
      browser: string;
      os: string;
      device: string;
    };
  };
}

export interface AuditQuery {
  userId?: string;
  tenantId?: string;
  event?: AuditEvent;
  resource?: string;
  severity?: AuditSeverity;
  dateFrom?: Date;
  dateTo?: Date;
  success?: boolean;
  limit?: number;
  offset?: number;
}

export interface AuditStats {
  totalEvents: number;
  eventsBySeverity: Record<AuditSeverity, number>;
  eventsByEvent: Record<string, number>;
  recentActivity: AuditLogEntry[];
  topUsers: Array<{ userId: string; userName: string; count: number }>;
  topResources: Array<{ resource: string; count: number }>;
}

export class AuditLogger {
  private static instance: AuditLogger;
  private logs: AuditLogEntry[] = [];
  private maxLogsInMemory = 10000; // Keep last 10k logs in memory

  private constructor() {}

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  // Log an audit event
  async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    const auditEntry: AuditLogEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date(),
      metadata: {
        ...entry.metadata,
        userAgentParsed: this.parseUserAgent(entry.userAgent),
      },
    };

    // Add to in-memory store
    this.logs.unshift(auditEntry);

    // Keep only recent logs in memory
    if (this.logs.length > this.maxLogsInMemory) {
      this.logs = this.logs.slice(0, this.maxLogsInMemory);
    }

    // In production, this would write to database/file/queue
    console.log('Audit Log:', auditEntry);

    // Check for security alerts
    await this.checkSecurityAlerts(auditEntry);
  }

  // Query audit logs
  query(query: AuditQuery): AuditLogEntry[] {
    let results = [...this.logs];

    if (query.userId) {
      results = results.filter(log => log.userId === query.userId);
    }

    if (query.tenantId) {
      results = results.filter(log => log.tenantId === query.tenantId);
    }

    if (query.event) {
      results = results.filter(log => log.event === query.event);
    }

    if (query.resource) {
      results = results.filter(log => log.resource === query.resource);
    }

    if (query.severity) {
      results = results.filter(log => log.severity === query.severity);
    }

    if (query.dateFrom) {
      results = results.filter(log => log.timestamp >= query.dateFrom!);
    }

    if (query.dateTo) {
      results = results.filter(log => log.timestamp <= query.dateTo!);
    }

    if (query.success !== undefined) {
      results = results.filter(log => log.success === query.success);
    }

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    results = results.slice(offset, offset + limit);

    return results;
  }

  // Get audit statistics
  getStats(query?: AuditQuery): AuditStats {
    const logs = query ? this.query(query) : this.logs;

    const eventsBySeverity = logs.reduce((acc, log) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, {} as Record<AuditSeverity, number>);

    const eventsByEvent = logs.reduce((acc, log) => {
      acc[log.event] = (acc[log.event] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const userCounts = logs.reduce((acc, log) => {
      const key = log.userId;
      if (!acc[key]) {
        acc[key] = { userId: log.userId, userName: log.userName, count: 0 };
      }
      acc[key].count++;
      return acc;
    }, {} as Record<string, { userId: string; userName: string; count: number }>);

    const resourceCounts = logs.reduce((acc, log) => {
      const key = log.resource;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEvents: logs.length,
      eventsBySeverity: {
        [AuditSeverity.LOW]: eventsBySeverity[AuditSeverity.LOW] || 0,
        [AuditSeverity.MEDIUM]: eventsBySeverity[AuditSeverity.MEDIUM] || 0,
        [AuditSeverity.HIGH]: eventsBySeverity[AuditSeverity.HIGH] || 0,
        [AuditSeverity.CRITICAL]: eventsBySeverity[AuditSeverity.CRITICAL] || 0,
      },
      eventsByEvent,
      recentActivity: logs.slice(0, 10),
      topUsers: Object.values(userCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      topResources: Object.entries(resourceCounts)
        .map(([resource, count]) => ({ resource, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    };
  }

  // Check for security alerts
  private async checkSecurityAlerts(entry: AuditLogEntry): Promise<void> {
    // Failed login attempts
    if (entry.event === AuditEvent.FAILED_LOGIN) {
      const recentFailedLogins = this.query({
        userId: entry.userId,
        event: AuditEvent.FAILED_LOGIN,
        dateFrom: new Date(Date.now() - 15 * 60 * 1000), // Last 15 minutes
      });

      if (recentFailedLogins.length >= 5) {
        await this.log({
          ...entry,
          event: AuditEvent.SUSPICIOUS_ACTIVITY,
          severity: AuditSeverity.HIGH,
          action: 'multiple_failed_logins',
          details: {
            failedAttempts: recentFailedLogins.length,
            timeWindow: '15 minutes',
          },
        });
      }
    }

    // Permission denied
    if (entry.event === AuditEvent.PERMISSION_DENIED && !entry.success) {
      // Could implement rate limiting or account lockout logic
    }

    // Critical events
    if (entry.severity === AuditSeverity.CRITICAL) {
      // Send immediate alerts to admins
      console.warn('Critical audit event:', entry);
    }
  }

  // Parse user agent string
  private parseUserAgent(userAgent: string): { browser: string; os: string; device: string } {
    // Simple user agent parsing - in production use a proper library
    const browser = userAgent.includes('Chrome') ? 'Chrome' :
                   userAgent.includes('Firefox') ? 'Firefox' :
                   userAgent.includes('Safari') ? 'Safari' :
                   userAgent.includes('Edge') ? 'Edge' : 'Unknown';

    const os = userAgent.includes('Windows') ? 'Windows' :
              userAgent.includes('Mac') ? 'macOS' :
              userAgent.includes('Linux') ? 'Linux' :
              userAgent.includes('Android') ? 'Android' :
              userAgent.includes('iOS') ? 'iOS' : 'Unknown';

    const device = userAgent.includes('Mobile') ? 'Mobile' :
                  userAgent.includes('Tablet') ? 'Tablet' : 'Desktop';

    return { browser, os, device };
  }

  // Generate unique ID for audit entries
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Export audit logs (for compliance/archiving)
  exportLogs(query?: AuditQuery, format: 'json' | 'csv' = 'json'): string {
    const logs = this.query(query || {});

    if (format === 'csv') {
      const headers = ['id', 'timestamp', 'userId', 'userName', 'tenantId', 'event', 'resource', 'severity', 'success'];
      const csvData = logs.map(log => [
        log.id,
        log.timestamp.toISOString(),
        log.userId,
        log.userName,
        log.tenantId || '',
        log.event,
        log.resource,
        log.severity,
        log.success.toString(),
      ]);

      return [headers, ...csvData].map(row => row.join(',')).join('\n');
    }

    return JSON.stringify(logs, null, 2);
  }

  // Clear old logs (for memory management)
  clearOldLogs(olderThanDays: number = 30): void {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    this.logs = this.logs.filter(log => log.timestamp >= cutoffDate);
  }
}

// Global audit logger instance
export const auditLogger = AuditLogger.getInstance();

// Convenience functions for common audit events
export const audit = {
  userLogin: (userId: string, userName: string, ipAddress: string, userAgent: string, success: boolean, tenantId?: string) =>
    auditLogger.log({
      userId,
      userName,
      userRole: 'user',
      tenantId,
      event: AuditEvent.USER_LOGIN,
      resource: 'authentication',
      action: 'login',
      details: {},
      severity: AuditSeverity.LOW,
      ipAddress,
      userAgent,
      success,
      metadata: {},
    }),

  userLogout: (userId: string, userName: string, ipAddress: string, userAgent: string, tenantId?: string) =>
    auditLogger.log({
      userId,
      userName,
      userRole: 'user',
      tenantId,
      event: AuditEvent.USER_LOGOUT,
      resource: 'authentication',
      action: 'logout',
      details: {},
      severity: AuditSeverity.LOW,
      ipAddress,
      userAgent,
      success: true,
      metadata: {},
    }),

  businessAction: (
    userId: string,
    userName: string,
    event: AuditEvent,
    resource: string,
    resourceId: string,
    action: string,
    details: Record<string, any>,
    ipAddress: string,
    userAgent: string,
    severity: AuditSeverity = AuditSeverity.MEDIUM,
    tenantId?: string
  ) =>
    auditLogger.log({
      userId,
      userName,
      userRole: 'user',
      tenantId,
      event,
      resource,
      resourceId,
      action,
      details,
      severity,
      ipAddress,
      userAgent,
      success: true,
      metadata: {},
    }),

  adminAction: (
    adminId: string,
    adminName: string,
    event: AuditEvent,
    resource: string,
    resourceId: string,
    action: string,
    details: Record<string, any>,
    ipAddress: string,
    userAgent: string
  ) =>
    auditLogger.log({
      userId: adminId,
      userName: adminName,
      userRole: 'admin',
      event,
      resource,
      resourceId,
      action,
      details,
      severity: AuditSeverity.HIGH,
      ipAddress,
      userAgent,
      success: true,
      metadata: {},
    }),

  securityEvent: (
    userId: string,
    userName: string,
    event: AuditEvent,
    details: Record<string, any>,
    severity: AuditSeverity,
    ipAddress: string,
    userAgent: string
  ) =>
    auditLogger.log({
      userId,
      userName,
      userRole: 'user',
      event,
      resource: 'security',
      action: event.replace('_', ' '),
      details,
      severity,
      ipAddress,
      userAgent,
      success: false,
      metadata: {},
    }),
};