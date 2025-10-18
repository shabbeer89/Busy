"use client";

import React, { useState, useEffect } from 'react';
import { AuditLogTable } from '@/components/admin/audit-log-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Download,
  Filter,
  Search,
  RefreshCw,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  Users,
  Activity,
  Calendar,
  Clock
} from 'lucide-react';
import AdminLayout from '../layout';
import {
  auditService,
  AuditLogEntry,
  AuditFilters,
  AuditStats
} from '@/services/audit-service';

// Using interfaces from audit service

export default function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditStats, setAuditStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [tenantFilter, setTenantFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<number>(0);
  const [showSecurityOnly, setShowSecurityOnly] = useState(false);

  useEffect(() => {
    loadAuditData();
  }, []);

  const loadAuditData = async () => {
    try {
      setLoading(true);
      const [logs, stats] = await Promise.all([
        auditService.getAuditLogs(),
        auditService.getAuditStats()
      ]);
      setAuditLogs(logs);
      setAuditStats(stats);
    } catch (error) {
      console.error('Failed to load audit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (log: AuditLogEntry) => {
    console.log('View audit log details:', log);
    // TODO: Show detailed modal with full log information
  };

  const handleExport = async (filters: AuditFilters) => {
    try {
      const exportData = await auditService.exportAuditLogs(filters, 'csv');
      // Create and download file
      const blob = new Blob([exportData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export audit logs:', error);
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesTenant = tenantFilter === 'all' || log.tenantId === tenantFilter;
    const matchesRisk = (log.riskScore || 0) >= riskFilter;
    const matchesSecurity = !showSecurityOnly || (log.riskScore || 0) >= 60;

    return matchesSearch && matchesSeverity && matchesAction && matchesTenant && matchesRisk && matchesSecurity;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRiskColor = (riskScore?: number) => {
    if (!riskScore) return 'text-gray-500';
    if (riskScore >= 80) return 'text-red-600';
    if (riskScore >= 60) return 'text-orange-600';
    if (riskScore >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

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

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Events</p>
                  <p className="text-3xl font-bold text-blue-600">{auditStats?.totalLogs || 0}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+12.5%</span>
                <span className="text-gray-400 ml-2">vs last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">High Risk Events</p>
                  <p className="text-3xl font-bold text-red-600">{auditStats?.highRiskEvents || 0}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-gray-600">Requires attention</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Failed Logins</p>
                  <p className="text-3xl font-bold text-orange-600">{auditStats?.failedLogins || 0}</p>
                </div>
                <Shield className="w-8 h-8 text-orange-500" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-gray-600">Security monitoring</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Suspicious Activities</p>
                  <p className="text-3xl font-bold text-purple-600">{auditStats?.suspiciousActivities || 0}</p>
                </div>
                <Info className="w-8 h-8 text-purple-500" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-gray-600">Anomaly detection</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filtering */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search audit logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Actions</option>
                {Object.keys(auditStats?.logsByAction || {}).map(action => (
                  <option key={action} value={action}>
                    {action.replace('_', ' ')}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="securityOnly"
                  checked={showSecurityOnly}
                  onChange={(e) => setShowSecurityOnly(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="securityOnly" className="text-sm text-gray-600">
                  Security Events Only
                </label>
              </div>

              <Button variant="outline" onClick={loadAuditData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Action Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(auditStats?.logsByAction || {})
                .sort(([,a], [,b]) => b - a)
                .slice(0, 4)
                .map(([action, count]) => (
                  <div key={action} className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{count}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                      {action.replace('_', ' ')}
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Audit Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Audit Log Entries ({filteredLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No audit logs found matching your criteria.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLogs.slice(0, 50).map((log) => (
                  <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      log.severity === 'critical' ? 'bg-red-500' :
                      log.severity === 'high' ? 'bg-orange-500' :
                      log.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {log.userName}
                        </span>
                        <Badge className={getSeverityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                        {log.riskScore && (
                          <Badge className={getRiskColor(log.riskScore)}>
                            Risk: {log.riskScore}
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {log.action.replace('_', ' ')} • {log.resource}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                        <span>IP: {log.ipAddress}</span>
                        {log.location && <span>{log.location}</span>}
                        {log.tenantName && <span>Tenant: {log.tenantName}</span>}
                      </div>

                      {log.details && Object.keys(log.details).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                            View Details
                          </summary>
                          <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(log)}
                    >
                      Details
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {auditStats?.highRiskEvents || 0}
                </div>
                <p className="text-sm text-gray-600">High Risk Events</p>
                <p className="text-xs text-gray-500 mt-1">Events requiring immediate attention</p>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {auditStats?.failedLogins || 0}
                </div>
                <p className="text-sm text-gray-600">Failed Login Attempts</p>
                <p className="text-xs text-gray-500 mt-1">Potential security threats</p>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {auditStats?.suspiciousActivities || 0}
                </div>
                <p className="text-sm text-gray-600">Suspicious Activities</p>
                <p className="text-xs text-gray-500 mt-1">Anomalous behavior detected</p>
              </div>
            </div>
          </CardContent>
        </Card>

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