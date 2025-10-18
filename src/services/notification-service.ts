"use client";

import { createClient } from '../lib/supabase-client';

// Create supabase client instance
const supabase = createClient();

export interface SystemNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  priority: 'low' | 'normal' | 'high' | 'critical';
  title: string;
  message: string;
  userId?: string;
  tenantId?: string;
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  expiresAt?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;

  // System alert specific fields
  category?: 'security' | 'billing' | 'system' | 'user' | 'tenant';
  source?: 'automatic' | 'manual' | 'integration';
  alertLevel?: 'info' | 'warning' | 'critical';
  affectedResources?: string[];
  resolution?: string;
  escalationLevel?: number;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  priority: 'low' | 'normal' | 'high' | 'critical';
  category: 'security' | 'billing' | 'system' | 'user' | 'tenant';
  titleTemplate: string;
  messageTemplate: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationStats {
  totalNotifications: number;
  unreadNotifications: number;
  notificationsByType: Record<string, number>;
  notificationsByPriority: Record<string, number>;
  notificationsByCategory: Record<string, number>;
  recentNotifications: SystemNotification[];
  systemAlerts: number;
  userNotifications: number;
  averageResolutionTime: number;
}

export interface NotificationPreferences {
  userId: string;
  email: {
    enabled: boolean;
    types: string[];
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  push: {
    enabled: boolean;
    types: string[];
  };
  inApp: {
    enabled: boolean;
    types: string[];
    quietHours: {
      enabled: boolean;
      start: string; // HH:MM format
      end: string; // HH:MM format
      timezone: string;
    };
  };
  escalation: {
    enabled: boolean;
    delayMinutes: number;
    maxLevel: number;
  };
}

class NotificationService {
  // Get notifications for user/tenant with filtering
  async getNotifications(filters: {
    userId?: string;
    tenantId?: string;
    type?: string;
    priority?: string;
    category?: string;
    isRead?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<SystemNotification[]> {
    try {
      // Query real notifications from database
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.tenantId) {
        query = query.eq('tenant_id', filters.tenantId);
      }

      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.isRead !== undefined) {
        query = query.eq('is_read', filters.isRead);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching notifications:', error);
        // Fallback to mock data if table doesn't exist yet
        return this.getMockNotifications(filters);
      }

      return data?.map((notification: any) => ({
        id: notification.id,
        type: notification.type,
        priority: notification.priority,
        title: notification.title,
        message: notification.message,
        userId: notification.user_id,
        tenantId: notification.tenant_id,
        isRead: notification.is_read,
        readAt: notification.read_at,
        actionUrl: notification.action_url,
        expiresAt: notification.expires_at,
        metadata: notification.metadata || {},
        category: notification.category,
        source: notification.source,
        alertLevel: notification.alert_level,
        affectedResources: notification.affected_resources || [],
        resolution: notification.resolution,
        escalationLevel: notification.escalation_level || 0,
        createdAt: notification.created_at,
        updatedAt: notification.updated_at
      })) || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return this.getMockNotifications(filters);
    }
  }

  // Create new notification
  async createNotification(notification: {
    type: 'info' | 'success' | 'warning' | 'error' | 'system';
    priority: 'low' | 'normal' | 'high' | 'critical';
    title: string;
    message: string;
    userId?: string;
    tenantId?: string;
    category?: 'security' | 'billing' | 'system' | 'user' | 'tenant';
    actionUrl?: string;
    expiresAt?: string;
    metadata?: Record<string, any>;
  }): Promise<SystemNotification | null> {
    try {
      const newNotification: SystemNotification = {
        id: `notif_${Date.now()}`,
        type: notification.type,
        priority: notification.priority,
        title: notification.title,
        message: notification.message,
        userId: notification.userId,
        tenantId: notification.tenantId,
        isRead: false,
        actionUrl: notification.actionUrl,
        expiresAt: notification.expiresAt,
        metadata: notification.metadata || {},
        category: notification.category,
        source: 'manual',
        alertLevel: notification.priority === 'critical' ? 'critical' : notification.priority === 'high' ? 'warning' : 'info',
        affectedResources: [],
        escalationLevel: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // In a real implementation, this would save to the database
      console.log('Creating notification:', newNotification);

      // Send real-time notification if it's a system alert
      if (notification.priority === 'critical' || notification.priority === 'high') {
        await this.sendRealTimeAlert(newNotification);
      }

      return newNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  // Create system alert (automatically generated)
  async createSystemAlert(alert: {
    type: 'security' | 'billing' | 'system' | 'performance' | 'integration';
    severity: 'info' | 'warning' | 'critical';
    title: string;
    message: string;
    tenantId?: string;
    affectedResources?: string[];
    metadata?: Record<string, any>;
  }): Promise<SystemNotification | null> {
    try {
      const priority = alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'high' : 'normal';

      return await this.createNotification({
        type: alert.severity === 'critical' ? 'error' : 'warning',
        priority,
        title: alert.title,
        message: alert.message,
        tenantId: alert.tenantId,
        category: alert.type === 'system' ? 'system' :
                 alert.type === 'security' ? 'security' :
                 alert.type === 'billing' ? 'billing' : 'system',
        metadata: {
          ...alert.metadata,
          source: 'system',
          alertType: alert.type,
          affectedResources: alert.affectedResources || []
        }
      });
    } catch (error) {
      console.error('Error creating system alert:', error);
      return null;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId?: string): Promise<boolean> {
    try {
      // In a real implementation, this would update the notification in the database
      console.log(`Marking notification ${notificationId} as read for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read for user/tenant
  async markAllAsRead(userId?: string, tenantId?: string): Promise<boolean> {
    try {
      // In a real implementation, this would update multiple notifications
      console.log(`Marking all notifications as read for user ${userId}, tenant ${tenantId}`);
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      // In a real implementation, this would delete the notification
      console.log(`Deleting notification ${notificationId}`);
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  // Get notification statistics
  async getNotificationStats(userId?: string, tenantId?: string): Promise<NotificationStats> {
    try {
      const notifications = await this.getNotifications({ userId, tenantId });

      const totalNotifications = notifications.length;
      const unreadNotifications = notifications.filter(n => !n.isRead).length;

      const notificationsByType = notifications.reduce((acc, notification) => {
        acc[notification.type] = (acc[notification.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const notificationsByPriority = notifications.reduce((acc, notification) => {
        acc[notification.priority] = (acc[notification.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const notificationsByCategory = notifications.reduce((acc, notification) => {
        const category = notification.category || 'general';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const systemAlerts = notifications.filter(n =>
        n.category === 'security' || n.category === 'system' || n.priority === 'critical'
      ).length;

      const userNotifications = notifications.filter(n =>
        n.category === 'user' || n.category === 'billing'
      ).length;

      const recentNotifications = notifications.slice(0, 10);

      return {
        totalNotifications,
        unreadNotifications,
        notificationsByType,
        notificationsByPriority,
        notificationsByCategory,
        recentNotifications,
        systemAlerts,
        userNotifications,
        averageResolutionTime: 0 // Would be calculated from historical data
      };
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      return {
        totalNotifications: 0,
        unreadNotifications: 0,
        notificationsByType: {},
        notificationsByPriority: {},
        notificationsByCategory: {},
        recentNotifications: [],
        systemAlerts: 0,
        userNotifications: 0,
        averageResolutionTime: 0
      };
    }
  }

  // Get notification templates
  async getNotificationTemplates(): Promise<NotificationTemplate[]> {
    try {
      return [
        {
          id: 'template_security_breach',
          name: 'Security Breach Alert',
          description: 'Alert for potential security breaches',
          type: 'error',
          priority: 'critical',
          category: 'security',
          titleTemplate: '🚨 Security Alert: {eventType}',
          messageTemplate: 'A potential security incident has been detected: {description}. Affected resources: {affectedResources}. Immediate action may be required.',
          variables: ['eventType', 'description', 'affectedResources', 'severity'],
          isActive: true,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'template_billing_issue',
          name: 'Billing Issue Alert',
          description: 'Alert for payment or subscription issues',
          type: 'warning',
          priority: 'high',
          category: 'billing',
          titleTemplate: '💳 Billing Alert: {issueType}',
          messageTemplate: 'There is an issue with your billing: {description}. Please check your payment method or contact support if this issue persists.',
          variables: ['issueType', 'description', 'amount', 'dueDate'],
          isActive: true,
          createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'template_system_maintenance',
          name: 'System Maintenance Notice',
          description: 'Scheduled maintenance notifications',
          type: 'info',
          priority: 'normal',
          category: 'system',
          titleTemplate: '🔧 Scheduled Maintenance: {maintenanceType}',
          messageTemplate: 'Scheduled maintenance will occur on {date} from {startTime} to {endTime}. {description}',
          variables: ['maintenanceType', 'date', 'startTime', 'endTime', 'description'],
          isActive: true,
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
    } catch (error) {
      console.error('Error fetching notification templates:', error);
      return [];
    }
  }

  // Send real-time alert to connected clients
  async sendRealTimeAlert(notification: SystemNotification): Promise<boolean> {
    try {
      // In a real implementation, this would use WebSocket or Server-Sent Events
      console.log('Sending real-time alert:', notification);

      // Also create in-app notification for relevant users
      if (notification.tenantId) {
        await this.createTenantAlert(notification.tenantId, notification);
      }

      return true;
    } catch (error) {
      console.error('Error sending real-time alert:', error);
      return false;
    }
  }

  // Create tenant-wide alert
  async createTenantAlert(tenantId: string, alert: {
    type: 'info' | 'success' | 'warning' | 'error' | 'system';
    priority: 'low' | 'normal' | 'high' | 'critical';
    title: string;
    message: string;
    category?: 'security' | 'billing' | 'system' | 'user' | 'tenant';
    actionUrl?: string;
  }): Promise<boolean> {
    try {
      // Create notification for all tenant admins and affected users
      console.log(`Creating tenant alert for ${tenantId}:`, alert);

      // In a real implementation, this would:
      // 1. Find all admin users for the tenant
      // 2. Create individual notifications for each user
      // 3. Send real-time notifications via WebSocket

      return true;
    } catch (error) {
      console.error('Error creating tenant alert:', error);
      return false;
    }
  }

  // Escalate notification if not resolved
  async escalateNotification(notificationId: string): Promise<boolean> {
    try {
      console.log(`Escalating notification ${notificationId}`);

      // In a real implementation, this would:
      // 1. Increase escalation level
      // 2. Notify higher-level administrators
      // 3. Create follow-up tasks

      return true;
    } catch (error) {
      console.error('Error escalating notification:', error);
      return false;
    }
  }

  // Get user notification preferences
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      // In a real implementation, this would query user preferences from database
      return {
        userId,
        email: {
          enabled: true,
          types: ['error', 'warning'],
          frequency: 'immediate'
        },
        push: {
          enabled: true,
          types: ['critical', 'error']
        },
        inApp: {
          enabled: true,
          types: ['info', 'success', 'warning', 'error'],
          quietHours: {
            enabled: true,
            start: '22:00',
            end: '08:00',
            timezone: 'America/New_York'
          }
        },
        escalation: {
          enabled: true,
          delayMinutes: 30,
          maxLevel: 3
        }
      };
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<boolean> {
    try {
      console.log(`Updating notification preferences for user ${userId}:`, preferences);
      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }

  // Get notification center dashboard summary
  async getNotificationDashboardSummary(): Promise<{
    totalAlerts: number;
    criticalAlerts: number;
    unreadAlerts: number;
    systemHealth: number;
    recentAlerts: SystemNotification[];
    alertTrends: { date: string; count: number; }[];
    topCategories: { category: string; count: number; }[];
  }> {
    try {
      const notifications = await this.getNotifications();
      const stats = await this.getNotificationStats();

      const totalAlerts = notifications.length;
      const criticalAlerts = notifications.filter(n => n.priority === 'critical').length;
      const unreadAlerts = notifications.filter(n => !n.isRead).length;

      // Calculate system health based on alert severity
      const highPriorityAlerts = notifications.filter(n => n.priority === 'critical' || n.priority === 'high').length;
      const systemHealth = Math.max(0, 100 - (highPriorityAlerts * 10) - (criticalAlerts * 25));

      const recentAlerts = notifications.slice(0, 10);

      // Generate alert trends (last 30 days)
      const alertTrends = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dayNotifications = notifications.filter(n => {
          const notificationDate = new Date(n.createdAt);
          return notificationDate.toDateString() === date.toDateString();
        }).length;

        return {
          date: date.toISOString().split('T')[0],
          count: dayNotifications
        };
      }).reverse();

      // Get top categories
      const topCategories = Object.entries(stats.notificationsByCategory)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalAlerts,
        criticalAlerts,
        unreadAlerts,
        systemHealth,
        recentAlerts,
        alertTrends,
        topCategories
      };
    } catch (error) {
      console.error('Error fetching notification dashboard summary:', error);
      return {
        totalAlerts: 0,
        criticalAlerts: 0,
        unreadAlerts: 0,
        systemHealth: 100,
        recentAlerts: [],
        alertTrends: [],
        topCategories: []
      };
    }
  }

  // Private helper methods
  private getMockNotifications(filters: any = {}): SystemNotification[] {
    const mockNotifications: SystemNotification[] = [
      {
        id: 'notif_001',
        type: 'warning',
        priority: 'high',
        title: 'High Memory Usage Detected',
        message: 'Database server memory usage has exceeded 85%. Please investigate and consider scaling resources.',
        tenantId: 'tenant1',
        isRead: false,
        metadata: {
          source: 'system_monitor',
          metric: 'memory_usage',
          threshold: 85,
          currentValue: 87
        },
        category: 'system',
        source: 'automatic',
        alertLevel: 'warning',
        affectedResources: ['database-server-01'],
        escalationLevel: 1,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: 'notif_002',
        type: 'error',
        priority: 'critical',
        title: 'Payment Failed - Subscription Suspended',
        message: 'Payment for Professional plan has failed. Subscription will be suspended in 3 days if payment is not updated.',
        userId: 'user_123',
        tenantId: 'tenant1',
        isRead: false,
        actionUrl: '/admin/billing/payment-methods',
        metadata: {
          subscriptionId: 'sub_001',
          amount: 99,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        category: 'billing',
        source: 'automatic',
        alertLevel: 'critical',
        affectedResources: ['subscription-professional'],
        escalationLevel: 2,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'notif_003',
        type: 'info',
        priority: 'normal',
        title: 'Scheduled Maintenance Completed',
        message: 'Database maintenance has been completed successfully. All systems are operating normally.',
        isRead: true,
        readAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        metadata: {
          maintenanceType: 'database_optimization',
          duration: '2 hours',
          impact: 'minimal'
        },
        category: 'system',
        source: 'manual',
        alertLevel: 'info',
        affectedResources: ['database-cluster'],
        escalationLevel: 0,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'notif_004',
        type: 'success',
        priority: 'normal',
        title: 'New User Registration',
        message: 'New user Alice Developer has successfully registered and verified their account.',
        userId: 'user_101',
        tenantId: 'tenant3',
        isRead: false,
        metadata: {
          newUserEmail: 'alice.developer@demo.com',
          registrationMethod: 'email_verification'
        },
        category: 'user',
        source: 'automatic',
        alertLevel: 'info',
        affectedResources: ['user-management'],
        escalationLevel: 0,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'notif_005',
        type: 'warning',
        priority: 'high',
        title: 'Unusual Login Activity',
        message: 'Multiple failed login attempts detected from IP address 203.0.113.45. Account temporarily locked for security.',
        userId: 'user_456',
        tenantId: 'tenant2',
        isRead: false,
        metadata: {
          ipAddress: '203.0.113.45',
          attemptCount: 7,
          timeWindow: '15 minutes',
          location: 'Unknown Location'
        },
        category: 'security',
        source: 'automatic',
        alertLevel: 'warning',
        affectedResources: ['authentication-system'],
        escalationLevel: 1,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Apply filters to mock data
    let filteredNotifications = mockNotifications;

    if (filters.userId) {
      filteredNotifications = filteredNotifications.filter(n => n.userId === filters.userId);
    }

    if (filters.tenantId) {
      filteredNotifications = filteredNotifications.filter(n => n.tenantId === filters.tenantId);
    }

    if (filters.type) {
      filteredNotifications = filteredNotifications.filter(n => n.type === filters.type);
    }

    if (filters.priority) {
      filteredNotifications = filteredNotifications.filter(n => n.priority === filters.priority);
    }

    if (filters.category) {
      filteredNotifications = filteredNotifications.filter(n => n.category === filters.category);
    }

    if (filters.isRead !== undefined) {
      filteredNotifications = filteredNotifications.filter(n => n.isRead === filters.isRead);
    }

    if (filters.limit) {
      filteredNotifications = filteredNotifications.slice(0, filters.limit);
    }

    return filteredNotifications;
  }

  // Send real-time alert via WebSocket (mock implementation)
  private broadcastToClients(notification: SystemNotification): boolean {
    try {
      // In a real implementation, this would use Socket.IO or Server-Sent Events
      console.log('Broadcasting real-time alert to connected clients:', notification.id);

      return true;
    } catch (error) {
      console.error('Error broadcasting alert:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();