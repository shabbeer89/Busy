"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  Plus,
  Settings,
  Users,
  Globe,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Activity,
  Database,
  Server,
  Wifi,
  AlertCircle,
  Info,
  Ban,
  Check,
  X
} from 'lucide-react';
import AdminLayout from '../layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  securityService,
  SecurityEvent,
  AccessControlRule,
  SecurityPolicy,
  SecurityStats
} from '@/services/security-service';
import { AdminSecuritySkeleton } from '@/components/ui/skeleton';

interface SecurityMetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  status: 'good' | 'warning' | 'critical';
  icon: React.ElementType;
  description?: string;
}

function SecurityMetricCard({ title, value, change, status, icon: Icon, description }: SecurityMetricCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
    }
  };

  const getTrendIcon = () => {
    if (change === undefined) return null;
    return change > 0 ? (
      <TrendingUp className="w-3 h-3 text-red-500" />
    ) : (
      <TrendingDown className="w-3 h-3 text-green-500" />
    );
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {value}
            </p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">
                {description}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${getStatusColor()}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        {change !== undefined && (
          <div className="mt-4 flex items-center text-sm">
            {getTrendIcon()}
            <span className={`font-medium ml-1 ${
              change > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span className="text-gray-400 ml-2">vs last week</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SecurityPage() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [accessRules, setAccessRules] = useState<AccessControlRule[]>([]);
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([]);
  const [securityStats, setSecurityStats] = useState<SecurityStats | null>(null);
  const [dashboardSummary, setDashboardSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateRuleDialog, setShowCreateRuleDialog] = useState(false);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      const [events, rules, policies, stats, summary] = await Promise.all([
        securityService.getSecurityEvents(),
        securityService.getAccessControlRules(),
        securityService.getSecurityPolicies(),
        securityService.getSecurityStats(),
        securityService.getSecurityDashboardSummary()
      ]);

      setSecurityEvents(events);
      setAccessRules(rules);
      setSecurityPolicies(policies);
      setSecurityStats(stats);
      setDashboardSummary(summary);
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventStatusUpdate = async (eventId: string, status: SecurityEvent['status'], resolution?: string) => {
    try {
      const success = await securityService.updateSecurityEventStatus(eventId, status, resolution);
      if (success) {
        // Update local state
        setSecurityEvents(prev => prev.map(event =>
          event.id === eventId
            ? { ...event, status, resolution, resolvedAt: new Date().toISOString() }
            : event
        ));
        await loadSecurityData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to update event status:', error);
    }
  };

  const filteredEvents = securityEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.sourceIp.includes(searchTerm);

    const matchesSeverity = severityFilter === 'all' || event.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'investigating': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'false_positive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
        <AdminSecuritySkeleton />
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security Center</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Monitor threats, manage access controls, and ensure compliance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadSecurityData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setShowCreateRuleDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </div>

        {/* Security Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SecurityMetricCard
            title="Security Score"
            value={`${dashboardSummary?.securityScore || 100}%`}
            status={dashboardSummary?.securityScore >= 80 ? 'good' : dashboardSummary?.securityScore >= 60 ? 'warning' : 'critical'}
            icon={Shield}
            description="Overall security posture"
          />
          <SecurityMetricCard
            title="Active Threats"
            value={dashboardSummary?.criticalAlerts || 0}
            change={dashboardSummary?.criticalAlerts > 5 ? 15 : -10}
            status={dashboardSummary?.criticalAlerts > 0 ? 'critical' : 'good'}
            icon={AlertTriangle}
            description="Require immediate attention"
          />
          <SecurityMetricCard
            title="Under Investigation"
            value={dashboardSummary?.activeInvestigations || 0}
            status={dashboardSummary?.activeInvestigations > 0 ? 'warning' : 'good'}
            icon={Activity}
            description="Security incidents being analyzed"
          />
          <SecurityMetricCard
            title="Blocked Attempts"
            value={dashboardSummary?.blockedAttempts || 0}
            change={5}
            status="good"
            icon={Ban}
            description="Unauthorized access prevented"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Security Events */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Security Events ({filteredEvents.length})
              </CardTitle>
              <CardDescription>
                Real-time security events and threat monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {filteredEvents.slice(0, 10).map((event) => (
                  <div key={event.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      event.severity === 'critical' ? 'bg-red-500' :
                      event.severity === 'high' ? 'bg-orange-500' :
                      event.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {event.title}
                        </h4>
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                        <Badge className={`text-xs ${event.riskScore >= 80 ? 'bg-red-100 text-red-800' : event.riskScore >= 60 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                          Risk: {event.riskScore}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {event.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>IP: {event.sourceIp}</span>
                        {event.location && <span>{event.location}</span>}
                        {event.userName && <span>User: {event.userName}</span>}
                        <span>{new Date(event.timestamp).toLocaleString()}</span>
                      </div>

                      {event.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                            View Technical Details
                          </summary>
                          <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(event.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {event.status === 'active' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEventStatusUpdate(event.id, 'investigating')}
                          >
                            Investigate
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEventStatusUpdate(event.id, 'false_positive')}
                          >
                            False Positive
                          </Button>
                        </>
                      )}
                      {event.status === 'investigating' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            const resolution = prompt('Enter resolution notes:');
                            if (resolution) {
                              handleEventStatusUpdate(event.id, 'resolved', resolution);
                            }
                          }}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {filteredEvents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <p>No security events found</p>
                    <p className="text-sm">All systems secure</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Access Control Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Access Control Rules
              </CardTitle>
              <CardDescription>
                Manage IP restrictions and access policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accessRules.map((rule) => (
                  <div key={rule.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {rule.name}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge className={rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={(checked) => {
                            // Update rule status
                            console.log(`Toggle rule ${rule.id} to ${checked}`);
                          }}
                        />
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {rule.description}
                    </p>

                    <div className="text-xs text-gray-500">
                      <div>Type: {rule.type.replace('_', ' ')}</div>
                      <div>Created: {new Date(rule.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowCreateRuleDialog(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Rule
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Policies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Security Policies
            </CardTitle>
            <CardDescription>
              Configure authentication, authorization, and data protection policies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {securityPolicies.map((policy) => (
                <div key={policy.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {policy.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge className={policy.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {policy.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {policy.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    {policy.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Password Length:</span>
                      <p className="text-gray-600">{policy.rules.passwordMinLength} characters</p>
                    </div>
                    <div>
                      <span className="font-medium">Session Timeout:</span>
                      <p className="text-gray-600">{policy.rules.sessionTimeout / 60} minutes</p>
                    </div>
                    <div>
                      <span className="font-medium">MFA Required:</span>
                      <p className="text-gray-600">{policy.rules.requireMfa ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Max Login Attempts:</span>
                      <p className="text-gray-600">{policy.rules.maxLoginAttempts}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Applies to: {policy.appliesToTenants.join(', ')}</span>
                      <Button size="sm" variant="outline">
                        Edit Policy
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Threat Intelligence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Threat Intelligence
            </CardTitle>
            <CardDescription>
              Latest threat indicators and attack patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dashboardSummary?.topThreats.map((threat: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                      {threat.name.replace('_', ' ')}
                    </h4>
                    <Badge className={
                      threat.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      threat.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {threat.severity}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {threat.count}
                  </div>
                  <p className="text-sm text-gray-600">
                    occurrences detected
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Rule Dialog */}
      <Dialog open={showCreateRuleDialog} onOpenChange={setShowCreateRuleDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Access Control Rule</DialogTitle>
            <DialogDescription>
              Add a new rule to control access to your platform
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="ruleName">Rule Name</Label>
              <Input id="ruleName" placeholder="Enter rule name" />
            </div>

            <div>
              <Label htmlFor="ruleType">Rule Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select rule type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ip_whitelist">IP Whitelist</SelectItem>
                  <SelectItem value="ip_blacklist">IP Blacklist</SelectItem>
                  <SelectItem value="time_restriction">Time Restriction</SelectItem>
                  <SelectItem value="location_restriction">Location Restriction</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ruleDescription">Description</Label>
              <Textarea id="ruleDescription" placeholder="Describe what this rule does" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateRuleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowCreateRuleDialog(false)}>
              Create Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}