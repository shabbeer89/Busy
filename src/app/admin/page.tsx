"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Building,
  Settings,
  TrendingUp,
  Shield,
  FileText,
  Activity,
  DollarSign,
  Eye,
  ChevronRight
} from 'lucide-react';
import AdminLayout from './layout';
import Link from 'next/link';

export default function AdminDashboardPage() {
  // Mock stats data
  const stats = {
    totalTenants: 15,
    activeTenants: 12,
    totalUsers: 2847,
    totalRevenue: 89250,
    systemHealth: 98.5,
    activeFeatures: 8,
    criticalEvents: 0,
    pendingTasks: 3,
  };

  const recentActivities = [
    {
      id: '1',
      type: 'tenant_created',
      message: 'New tenant "HealthTech Solutions" was created',
      timestamp: '2 hours ago',
      severity: 'info',
    },
    {
      id: '2',
      type: 'feature_enabled',
      message: 'BABT verification enabled for TechVentures Inc.',
      timestamp: '4 hours ago',
      severity: 'success',
    },
    {
      id: '3',
      type: 'security_alert',
      message: 'Multiple failed login attempts detected',
      timestamp: '6 hours ago',
      severity: 'warning',
    },
    {
      id: '4',
      type: 'system_update',
      message: 'System backup completed successfully',
      timestamp: '1 day ago',
      severity: 'success',
    },
  ];

  const topTenants = [
    { name: 'TechVentures Inc.', users: 245, revenue: 12500, growth: 15.3 },
    { name: 'GreenEnergy Solutions', users: 89, revenue: 3200, growth: 8.7 },
    { name: 'FinTech Innovations', users: 156, revenue: 8900, growth: 12.4 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome back, Super Admin</h1>
          <p className="text-blue-100 mb-4">
            Monitor and manage your multi-tenant platform
          </p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              System Health: {stats.systemHealth}%
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Tenants</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalTenants}</p>
                </div>
                <Building className="w-8 h-8 text-blue-500" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600 font-medium">{stats.activeTenants} active</span>
                <span className="text-gray-400 mx-2">•</span>
                <span className="text-gray-600">{stats.totalTenants - stats.activeTenants} inactive</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Users</p>
                  <p className="text-3xl font-bold text-green-600">{stats.totalUsers.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                Across all tenants
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-purple-600">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-500" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+12.5%</span>
                <span className="text-gray-400 ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">System Status</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.systemHealth}%</p>
                </div>
                <Shield className="w-8 h-8 text-orange-500" />
              </div>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                {stats.criticalEvents} critical issues
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/tenants">
                <Button variant="outline" className="w-full justify-start">
                  <Building className="w-4 h-4 mr-2" />
                  Manage Tenants
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Button>
              </Link>

              <Link href="/admin/features">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Feature Management
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Button>
              </Link>

              <Link href="/admin/audit-logs">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  View Audit Logs
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Button>
              </Link>

              <Link href="/admin/analytics">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  System Analytics
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system events and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.severity === 'success' ? 'bg-green-500' :
                      activity.severity === 'warning' ? 'bg-yellow-500' :
                      activity.severity === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link href="/admin/audit-logs">
                  <Button variant="ghost" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    View All Activity
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Tenants */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Tenants</CardTitle>
            <CardDescription>Tenants with highest growth and revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topTenants.map((tenant, index) => (
                <div key={tenant.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{tenant.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{tenant.users} users</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      ${tenant.revenue.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-green-600">+{tenant.growth}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Active Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.activeFeatures}</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Features enabled across platform
              </p>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  All systems operational
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Pending Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 mb-2">{stats.pendingTasks}</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Items requiring attention
              </p>
              <div className="mt-4">
                <Button variant="outline" size="sm">
                  Review Tasks
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Security Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">Secure</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                No security incidents today
              </p>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  All clear
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}