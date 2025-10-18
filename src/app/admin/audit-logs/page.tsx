"use client";

import { useState } from 'react';
import { AuditLogTable } from '@/components/admin/audit-log-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Filter } from 'lucide-react';
import AdminLayout from '../layout';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  tenantId?: string;
  tenantName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface AuditLogFilters {
  userId?: string;
  action?: string;
  resource?: string;
  severity?: string;
  dateFrom?: string;
  dateTo?: string;
  tenantId?: string;
}

export default function AuditLogsPage() {
  // Mock audit log data
  const mockAuditLogs: AuditLogEntry[] = [
    {
      id: '1',
      timestamp: '2024-01-15T10:30:00Z',
      userId: 'user_123',
      userName: 'John Doe',
      tenantId: 'techventures',
      tenantName: 'TechVentures Inc.',
      action: 'login',
      resource: 'authentication',
      resourceId: 'session_456',
      details: { method: 'password', successful: true },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      severity: 'low',
    },
    {
      id: '2',
      timestamp: '2024-01-15T10:25:00Z',
      userId: 'user_456',
      userName: 'Jane Smith',
      tenantId: 'greenenergy',
      tenantName: 'GreenEnergy Solutions',
      action: 'feature_toggle',
      resource: 'feature_flags',
      resourceId: 'video-calling',
      details: { oldValue: false, newValue: true, feature: 'video-calling' },
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      severity: 'medium',
    },
    {
      id: '3',
      timestamp: '2024-01-15T10:20:00Z',
      userId: 'admin_789',
      userName: 'Admin User',
      action: 'tenant_suspend',
      resource: 'tenants',
      resourceId: 'fintech-innovations',
      details: { reason: 'payment_failure', previousStatus: 'active', newStatus: 'suspended' },
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      severity: 'high',
    },
    {
      id: '4',
      timestamp: '2024-01-15T10:15:00Z',
      userId: 'user_101',
      userName: 'Bob Wilson',
      tenantId: 'techventures',
      tenantName: 'TechVentures Inc.',
      action: 'profile_update',
      resource: 'users',
      resourceId: 'user_101',
      details: { fields: ['bio', 'website'], ipAddress: '192.168.1.102' },
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      severity: 'low',
    },
    {
      id: '5',
      timestamp: '2024-01-15T10:10:00Z',
      userId: 'user_202',
      userName: 'Alice Brown',
      tenantId: 'fintech',
      tenantName: 'FinTech Innovations',
      action: 'investment_create',
      resource: 'investments',
      resourceId: 'investment_789',
      details: { amount: 50000, currency: 'USD', projectId: 'project_123' },
      ipAddress: '192.168.1.103',
      userAgent: 'Mozilla/5.0 (Android 13; Mobile) AppleWebKit/537.36',
      severity: 'medium',
    },
  ];

  const handleViewDetails = (log: AuditLogEntry) => {
    console.log('View audit log details:', log);
    // Show detailed modal or navigate to detail page
  };

  const handleExport = (filters: AuditLogFilters) => {
    console.log('Export audit logs with filters:', filters);
    // Export filtered logs as CSV/JSON
  };

  const getSeverityStats = () => {
    const stats = { low: 0, medium: 0, high: 0, critical: 0 };
    mockAuditLogs.forEach(log => {
      stats[log.severity]++;
    });
    return stats;
  };

  const getActionStats = () => {
    const actionCounts: Record<string, number> = {};
    mockAuditLogs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });
    return Object.entries(actionCounts).sort(([,a], [,b]) => b - a);
  };

  const severityStats = getSeverityStats();
  const actionStats = getActionStats();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Monitor system activity and user actions
            </p>
          </div>
          <Button onClick={() => handleExport({})} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export All
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">{mockAuditLogs.length}</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Events</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-red-600">{severityStats.critical}</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Critical Events</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-orange-600">{severityStats.high}</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">High Severity</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">
                {mockAuditLogs.filter(log => {
                  const logDate = new Date(log.timestamp);
                  const today = new Date();
                  return logDate.toDateString() === today.toDateString();
                }).length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Today</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Most Common Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {actionStats.slice(0, 4).map(([action, count]) => (
                <div key={action} className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{count}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                    {action.replace('_', ' ')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <AuditLogTable
          logs={mockAuditLogs}
          onViewDetails={handleViewDetails}
          onExport={handleExport}
          showTenantColumn={true}
        />

        {/* Audit Log Information */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Log Information</CardTitle>
            <CardDescription>
              Understanding the audit logging system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Severity Levels</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Low: Routine user actions (login, profile updates)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span>Medium: Feature changes, business transactions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span>High: Admin actions, tenant modifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Critical: Security events, data breaches</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Retention Policy</h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <p>• Audit logs are retained for 7 years</p>
                  <p>• Logs are encrypted at rest</p>
                  <p>• Access is logged and monitored</p>
                  <p>• Regular backups are performed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}