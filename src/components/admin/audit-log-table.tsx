"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Download, Eye } from 'lucide-react';

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

interface AuditLogTableProps {
  logs: AuditLogEntry[];
  onViewDetails?: (log: AuditLogEntry) => void;
  onExport?: (filters: AuditLogFilters) => void;
  showTenantColumn?: boolean;
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

export function AuditLogTable({
  logs,
  onViewDetails,
  onExport,
  showTenantColumn = false
}: AuditLogTableProps) {
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredLogs = logs.filter(log => {
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!log.userName.toLowerCase().includes(searchLower) &&
          !log.action.toLowerCase().includes(searchLower) &&
          !log.resource.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Filters
    if (filters.userId && log.userId !== filters.userId) return false;
    if (filters.action && log.action !== filters.action) return false;
    if (filters.resource && log.resource !== filters.resource) return false;
    if (filters.severity && log.severity !== filters.severity) return false;
    if (filters.tenantId && log.tenantId !== filters.tenantId) return false;

    // Date filters
    if (filters.dateFrom) {
      const logDate = new Date(log.timestamp);
      const fromDate = new Date(filters.dateFrom);
      if (logDate < fromDate) return false;
    }
    if (filters.dateTo) {
      const logDate = new Date(log.timestamp);
      const toDate = new Date(filters.dateTo);
      if (logDate > toDate) return false;
    }

    return true;
  });

  const uniqueActions = [...new Set(logs.map(log => log.action))];
  const uniqueResources = [...new Set(logs.map(log => log.resource))];
  const uniqueSeverities = [...new Set(logs.map(log => log.severity))];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Audit Logs
        </CardTitle>
        <CardDescription>
          System activity and user actions log
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select
            value={filters.action || ''}
            onValueChange={(value) => setFilters(prev => ({ ...prev, action: value || undefined }))}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Actions</SelectItem>
              {uniqueActions.map(action => (
                <SelectItem key={action} value={action}>{action}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.severity || ''}
            onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value || undefined }))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Levels</SelectItem>
              {uniqueSeverities.map(severity => (
                <SelectItem key={severity} value={severity}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getSeverityColor(severity)}`} />
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {showTenantColumn && (
            <Input
              type="date"
              placeholder="From date"
              value={filters.dateFrom || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="w-[140px]"
            />
          )}

          <Input
            type="date"
            placeholder="To date"
            value={filters.dateTo || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
            className="w-[140px]"
          />

          {onExport && (
            <Button
              variant="outline"
              onClick={() => onExport(filters)}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                {showTenantColumn && <TableHead>Tenant</TableHead>}
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm">
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>
                      <div className="font-medium">{log.userName}</div>
                      <div className="text-gray-500 text-xs">{log.userId}</div>
                    </div>
                  </TableCell>
                  {showTenantColumn && (
                    <TableCell className="text-sm">
                      {log.tenantName || 'N/A'}
                    </TableCell>
                  )}
                  <TableCell className="text-sm font-medium">{log.action}</TableCell>
                  <TableCell className="text-sm">
                    <div>
                      {log.resource}
                      {log.resourceId && (
                        <div className="text-gray-500 text-xs">{log.resourceId}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${getSeverityColor(log.severity)} text-white border-none`}
                    >
                      {log.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-mono">{log.ipAddress}</TableCell>
                  <TableCell>
                    {onViewDetails && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(log)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No audit logs found matching your filters.
          </div>
        )}
      </CardContent>
    </Card>
  );
}