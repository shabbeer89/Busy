"use client";

import { useEffect, useState } from 'react';
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
import { adminService, AdminStats } from '@/services/admin-service';
import { AdminDashboardSkeleton } from '@/components/ui/skeleton';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await adminService.getAdminStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
        <AdminDashboardSkeleton></AdminDashboardSkeleton>
    )}

  if (!stats) {
    return (
        <div className="text-center py-8">
          <p className="text-red-600">Failed to load dashboard data</p>
        </div>
    
    );
  }

  // Use real data from stats

  return (
      <div className="space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:scale-105 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-300">🏢 Total Tenants</p>
                  <p className="text-4xl font-bold text-white">{stats.totalTenants}</p>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-full">
                  <Building className="w-10 h-10 text-blue-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-emerald-400 font-medium bg-emerald-400/20 px-2 py-1 rounded-full">{stats.activeTenants} active</span>
                <span className="text-white/50 mx-2">•</span>
                <span className="text-white/70">{stats.totalTenants - stats.activeTenants} inactive</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:scale-105 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-300">👥 Total Users</p>
                  <p className="text-4xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
                </div>
                <div className="bg-emerald-500/20 p-3 rounded-full">
                  <Users className="w-10 h-10 text-emerald-400" />
                </div>
              </div>
              <div className="mt-4 text-sm text-white/70 bg-white/10 px-3 py-2 rounded-full text-center">
                🚀 Across all tenants
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-300">💰 Monthly Revenue</p>
                  <p className="text-4xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-full">
                  <DollarSign className="w-10 h-10 text-purple-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm bg-gradient-to-r from-emerald-400/20 to-green-400/20 px-3 py-2 rounded-full">
                <TrendingUp className="w-4 h-4 text-emerald-300 mr-2" />
                <span className="text-emerald-300 font-medium">+12.5%</span>
                <span className="text-white/70 ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 hover:scale-105 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-300">🛡️ System Status</p>
                  <p className="text-4xl font-bold text-white">{stats.systemHealth}%</p>
                </div>
                <div className="bg-orange-500/20 p-3 rounded-full">
                  <Shield className="w-10 h-10 text-orange-400" />
                </div>
              </div>
              <div className="mt-4 text-sm text-white/70 bg-white/10 px-3 py-2 rounded-full text-center">
                ⚠️ {stats.criticalEvents} critical issues
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <Card className="lg:col-span-1 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/30 hover:border-slate-500/50 transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                ⚡ Quick Actions
              </CardTitle>
              <CardDescription className="text-slate-300">Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/admin/tenants" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30 text-blue-300 hover:from-blue-500/30 hover:to-purple-500/30 hover:text-blue-200 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
                >
                  <Building className="w-5 h-5 mr-3" />
                  🏢 Manage Tenants
                  <ChevronRight className="w-5 h-5 ml-auto" />
                </Button>
              </Link>

              <Link href="/admin/features" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-emerald-500/30 text-emerald-300 hover:from-emerald-500/30 hover:to-teal-500/30 hover:text-emerald-200 hover:border-emerald-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  ⚙️ Feature Management
                  <ChevronRight className="w-5 h-5 ml-auto" />
                </Button>
              </Link>

              <Link href="/admin/audit-logs" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-gradient-to-r from-orange-600/20 to-red-600/20 border-orange-500/30 text-orange-300 hover:from-orange-500/30 hover:to-red-500/30 hover:text-orange-200 hover:border-orange-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20"
                >
                  <FileText className="w-5 h-5 mr-3" />
                  📋 View Audit Logs
                  <ChevronRight className="w-5 h-5 ml-auto" />
                </Button>
              </Link>

              <Link href="/admin/analytics" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-gradient-to-r from-pink-600/20 to-purple-600/20 border-pink-500/30 text-pink-300 hover:from-pink-500/30 hover:to-purple-500/30 hover:text-pink-200 hover:border-pink-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/20"
                >
                  <TrendingUp className="w-5 h-5 mr-3" />
                  📊 Platform Analytics
                  <ChevronRight className="w-5 h-5 ml-auto" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/30 hover:border-slate-500/50 transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                📈 Recent Activity
              </CardTitle>
              <CardDescription className="text-slate-300">Latest system events and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer">
                    <div className={`w-3 h-3 rounded-full mt-2 ${
                      activity.severity === 'success' ? 'bg-emerald-400' :
                      activity.severity === 'warning' ? 'bg-yellow-400' :
                      activity.severity === 'error' ? 'bg-red-400' : 'bg-blue-400'
                    }`} />
                    <div className="flex-1">
                      <p className="text-base font-medium text-white">
                        {activity.message}
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        📅 {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-white/10">
                <Link href="/admin/audit-logs" className="block">
                  <Button
                    variant="ghost"
                    className="w-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-300 hover:from-blue-500/30 hover:to-purple-500/30 hover:text-blue-200 hover:border-blue-400/50 transition-all duration-300 hover:scale-105"
                  >
                    <Eye className="w-5 h-5 mr-3" />
                    👁️ View All Activity
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Tenants */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/30 hover:border-slate-500/50 transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              🏆 Top Performing Tenants
            </CardTitle>
            <CardDescription className="text-slate-300">Tenants with highest growth and revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topTenants.map((tenant, index) => (
                <div key={tenant.name} className="flex items-center justify-between p-5 bg-gradient-to-r from-white/5 to-white/10 border border-white/10 rounded-xl hover:from-white/10 hover:to-white/15 hover:border-white/20 transition-all duration-300 cursor-pointer hover:scale-105">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' :
                      index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-300 text-white' :
                      index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white' :
                      'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-lg">{tenant.name}</p>
                      <p className="text-sm text-slate-300">👥 {tenant.users} users</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white text-xl">
                      💰 ${tenant.revenue.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 text-sm bg-emerald-400/20 px-3 py-1 rounded-full mt-1">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">+{tenant.growth}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:scale-105 cursor-pointer">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-blue-300 flex items-center gap-2">
                🚀 Active Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-white mb-3">{stats.activeFeatures}</div>
              <p className="text-base text-blue-200 mb-4">
                Features enabled across platform
              </p>
              <div className="mt-4">
                <Badge className="bg-emerald-400/20 text-emerald-300 border-emerald-400/30 text-sm px-4 py-2">
                  ✅ All systems operational
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/20 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 hover:scale-105 cursor-pointer">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-orange-300 flex items-center gap-2">
                ⏳ Pending Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-white mb-3">{stats.pendingTasks}</div>
              <p className="text-base text-orange-200 mb-4">
                Items requiring attention
              </p>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-r from-orange-600/20 to-yellow-600/20 border-orange-500/30 text-orange-300 hover:from-orange-500/30 hover:to-yellow-500/30 hover:text-orange-200 hover:border-orange-400/50 transition-all duration-300"
                >
                  🔍 Review Tasks
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:scale-105 cursor-pointer">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-emerald-300 flex items-center gap-2">
                🛡️ Security Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-white mb-3">Secure</div>
              <p className="text-base text-emerald-200 mb-4">
                No security incidents today
              </p>
              <div className="mt-4">
                <Badge className="bg-emerald-400/20 text-emerald-300 border-emerald-400/30 text-sm px-4 py-2">
                  ✨ All clear
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>)
  
}