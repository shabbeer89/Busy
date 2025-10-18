"use client";

import React, { useState, useEffect } from 'react';
import { AuditLogTable } from '@/components/admin/audit-log-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { AdminAuditLogsSkeleton } from '@/components/ui/skeleton';

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
      <div className="space-y-8">
        {/* Header Section - Dashboard Style */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white">Audit Logs</h2>
            <p className="text-slate-300">Monitor system activity and security events</p>
          </div>
          <Button
            onClick={() => handleExport({})}
            className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-300 hover:from-blue-500/30 hover:to-purple-500/30 hover:text-blue-200 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
          >
            <Download className="w-5 h-5 mr-2" />
            Export All
          </Button>
        </div>

        {/* Stats Cards - Dashboard Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:scale-105 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-300">📈 Total Events</p>
                  <p className="text-4xl font-bold text-white">{auditStats?.totalLogs || 0}</p>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-full">
                  <Activity className="w-10 h-10 text-blue-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm bg-gradient-to-r from-emerald-400/20 to-green-400/20 px-3 py-2 rounded-full">
                <TrendingUp className="w-4 h-4 text-emerald-300 mr-2" />
                <span className="text-emerald-300 font-medium">+12.5%</span>
                <span className="text-white/70 ml-2">vs last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 hover:scale-105 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-300">⚠️ High Risk Events</p>
                  <p className="text-4xl font-bold text-white">{auditStats?.highRiskEvents || 0}</p>
                </div>
                <div className="bg-red-500/20 p-3 rounded-full">
                  <AlertTriangle className="w-10 h-10 text-red-400" />
                </div>
              </div>
              <div className="mt-4 text-sm text-white/70 bg-white/10 px-3 py-2 rounded-full text-center">
                Requires attention
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/20 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 hover:scale-105 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-300">🔐 Failed Logins</p>
                  <p className="text-4xl font-bold text-white">{auditStats?.failedLogins || 0}</p>
                </div>
                <div className="bg-orange-500/20 p-3 rounded-full">
                  <Shield className="w-10 h-10 text-orange-400" />
                </div>
              </div>
              <div className="mt-4 text-sm text-white/70 bg-white/10 px-3 py-2 rounded-full text-center">
                Security monitoring
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-300">🔍 Suspicious Activities</p>
                  <p className="text-4xl font-bold text-white">{auditStats?.suspiciousActivities || 0}</p>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-full">
                  <Info className="w-10 h-10 text-purple-400" />
                </div>
              </div>
              <div className="mt-4 text-sm text-white/70 bg-white/10 px-3 py-2 rounded-full text-center">
                Anomaly detection
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section - Dashboard Style */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/30 hover:border-slate-500/50 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-6 items-center">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="Search audit logs by user, action, or resource..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:bg-slate-700/50 focus:border-blue-500/50 transition-all duration-300"
                  />
                </div>
              </div>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:bg-slate-700/50 focus:border-blue-500/50 transition-all duration-300"
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
                className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:bg-slate-700/50 focus:border-blue-500/50 transition-all duration-300"
              >
                <option value="all">All Actions</option>
                {Object.keys(auditStats?.logsByAction || {}).map(action => (
                  <option key={action} value={action}>
                    {action.replace('_', ' ')}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-3 bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-600">
                <input
                  type="checkbox"
                  id="securityOnly"
                  checked={showSecurityOnly}
                  onChange={(e) => setShowSecurityOnly(e.target.checked)}
                  className="rounded border-slate-600 bg-slate-800 text-blue-400 focus:ring-blue-300"
                />
                <label htmlFor="securityOnly" className="text-sm text-white font-medium">
                  Security Events Only
                </label>
              </div>

              <Button
                variant="outline"
                onClick={loadAuditData}
                className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50 hover:border-blue-500/50 transition-all duration-300"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Distribution - Dashboard Style */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/30 hover:border-slate-500/50 transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              📊 Action Distribution
            </CardTitle>
            <CardDescription className="text-slate-300">Most common audit events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(auditStats?.logsByAction || {})
                .sort(([,a], [,b]) => b - a)
                .slice(0, 4)
                .map(([action, count]) => (
                  <div key={action} className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-xl p-4 hover:from-white/10 hover:to-white/15 hover:border-white/20 transition-all duration-300 text-center">
                    <div className="text-2xl font-bold text-white mb-2">{count}</div>
                    <p className="text-sm text-slate-300 capitalize">
                      {action.replace('_', ' ')}
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Table - Dashboard Style */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/30 hover:border-slate-500/50 transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <Activity className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-white flex items-center gap-2">
                    📋 Audit Log Entries
                  </CardTitle>
                  <CardDescription className="text-slate-300">Recent system activities and events</CardDescription>
                </div>
              </div>

              <div className="text-sm text-slate-400">
                {filteredLogs.length} entries
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-16">
                  <Activity className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <div className="text-slate-400 text-lg mb-2">No audit logs found</div>
                  <div className="text-slate-500">Try adjusting your search criteria</div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300 font-medium">Severity</TableHead>
                      <TableHead className="text-slate-300 font-medium">User</TableHead>
                      <TableHead className="text-slate-300 font-medium">Action</TableHead>
                      <TableHead className="text-slate-300 font-medium">Resource</TableHead>
                      <TableHead className="text-slate-300 font-medium">Timestamp</TableHead>
                      <TableHead className="text-slate-300 font-medium">IP Address</TableHead>
                      <TableHead className="text-slate-300 font-medium">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.slice(0, 50).map((log, index) => (
                      <TableRow key={log.id} className={`border-slate-700 hover:bg-slate-800/50 transition-colors ${index % 2 === 0 ? 'bg-slate-800/20' : ''}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              log.severity === 'critical' ? 'bg-red-500' :
                              log.severity === 'high' ? 'bg-orange-500' :
                              log.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`} />
                            <Badge className={`${getSeverityColor(log.severity)} border-0 text-xs`}>
                              {log.severity}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-white">{log.userName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-slate-300">{log.action.replace('_', ' ')}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-slate-300">{log.resource}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-400">
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-400">{log.ipAddress}</div>
                          {log.location && (
                            <div className="text-xs text-slate-500">{log.location}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(log)}
                            className="text-slate-400 hover:text-white hover:bg-slate-700"
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Overview - Dashboard Style */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/30 hover:border-slate-500/50 transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              🛡️ Security Overview
            </CardTitle>
            <CardDescription className="text-slate-300">Critical security metrics and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl p-6 border border-red-500/30 text-center">
                <div className="text-4xl font-bold text-white mb-2">
                  {auditStats?.highRiskEvents || 0}
                </div>
                <p className="text-white/80 text-sm font-medium mb-1">High Risk Events</p>
                <p className="text-red-200 text-xs">Events requiring immediate attention</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-xl p-6 border border-orange-500/30 text-center">
                <div className="text-4xl font-bold text-white mb-2">
                  {auditStats?.failedLogins || 0}
                </div>
                <p className="text-white/80 text-sm font-medium mb-1">Failed Login Attempts</p>
                <p className="text-orange-200 text-xs">Potential security threats</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30 text-center">
                <div className="text-4xl font-bold text-white mb-2">
                  {auditStats?.suspiciousActivities || 0}
                </div>
                <p className="text-white/80 text-sm font-medium mb-1">Suspicious Activities</p>
                <p className="text-purple-200 text-xs">Anomalous behavior detected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Log Information - Dashboard Style */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/30 hover:border-slate-500/50 transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              ℹ️ Audit Log Information
            </CardTitle>
            <CardDescription className="text-slate-300">Understanding the audit logging system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-white mb-4 text-lg">Severity Levels</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                    <div className="w-4 h-4 rounded-full bg-green-400"></div>
                    <span className="text-white/90">Low: Routine user actions (login, profile updates)</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                    <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                    <span className="text-white/90">Medium: Feature changes, business transactions</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                    <div className="w-4 h-4 rounded-full bg-orange-400"></div>
                    <span className="text-white/90">High: Admin actions, tenant modifications</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                    <div className="w-4 h-4 rounded-full bg-red-400"></div>
                    <span className="text-white/90">Critical: Security events, data breaches</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-4 text-lg">Retention Policy</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                    <span className="text-white/90">Audit logs are retained for 7 years</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                    <span className="text-white/90">Logs are encrypted at rest</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                    <span className="text-white/90">Access is logged and monitored</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                    <span className="text-white/90">Regular backups are performed</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}