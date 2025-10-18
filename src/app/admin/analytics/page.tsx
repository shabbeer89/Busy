"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Globe,
  Download,
  RefreshCw,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import AdminLayout from '../layout';
import { analyticsService, AnalyticsData, DateRange } from '@/services/analytics-service';
import { AdminAnalyticsSkeleton } from '@/components/ui/skeleton';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'stable';
}

function MetricCard({ title, value, change, changeLabel, icon: Icon, trend }: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="w-4 h-4 text-green-600" />;
      case 'down':
        return <ArrowDownRight className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
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
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 mt-2 ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className="text-sm font-medium">
                  {change > 0 ? '+' : ''}{change}%
                </span>
                <span className="text-sm text-gray-600">
                  {changeLabel || 'vs last period'}
                </span>
              </div>
            )}
          </div>
          <Icon className="w-8 h-8 text-blue-600" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [timeRange, setTimeRange] = useState<string>('30d');

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getAnalyticsData(dateRange);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    const now = new Date();
    let from = new Date();

    switch (range) {
      case '7d':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    setDateRange({ from, to: now });
  };

  if (loading) {
    return (
        <AdminAnalyticsSkeleton ></AdminAnalyticsSkeleton>
    );
  }

  if (!analyticsData) {
    return (
    
        <div className="text-center py-8">
          <p className="text-red-600">Failed to load analytics data</p>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Comprehensive insights into platform performance and user activity
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadAnalyticsData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Users"
            value={analyticsData.tenantMetrics.reduce((sum, tenant) => sum + tenant.users, 0)}
            change={12.5}
            changeLabel="vs last month"
            icon={Users}
            trend="up"
          />
          <MetricCard
            title="Total Revenue"
            value={`$${analyticsData.revenueData.byTenant.reduce((sum, tenant) => sum + tenant.revenue, 0).toLocaleString()}`}
            change={8.2}
            changeLabel="vs last month"
            icon={DollarSign}
            trend="up"
          />
          <MetricCard
            title="Active Sessions"
            value={analyticsData.userActivity.daily.slice(-1)[0]?.sessions || 0}
            change={-2.1}
            changeLabel="vs yesterday"
            icon={Activity}
            trend="down"
          />
          <MetricCard
            title="API Calls"
            value={analyticsData.systemMetrics.apiCalls.slice(-1)[0]?.calls || 0}
            change={15.3}
            changeLabel="vs last week"
            icon={BarChart3}
            trend="up"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                User Activity Trends
              </CardTitle>
              <CardDescription>
                Daily active users and sessions over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.userActivity.daily.slice(-7).map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(day.date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-600">
                        {day.users} users • {day.sessions} sessions
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(day.users / Math.max(...analyticsData.userActivity.daily.map(d => d.users))) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white w-8">
                        {day.users}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Tenants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top Performing Tenants
              </CardTitle>
              <CardDescription>
                Tenants with highest activity and growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.tenantMetrics
                  .sort((a, b) => b.activity - a.activity)
                  .slice(0, 5)
                  .map((tenant, index) => (
                    <div key={tenant.tenantId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {tenant.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {tenant.users} users • ${tenant.revenue.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`flex items-center gap-1 text-sm ${
                          tenant.growth >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {tenant.growth >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {Math.abs(tenant.growth)}%
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Geographic Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Geographic Distribution
              </CardTitle>
              <CardDescription>
                User distribution by country
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.geographicData.map((country) => (
                  <div key={country.country} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {country.country}
                      </div>
                      <div className="text-xs text-gray-600">
                        {country.users.toLocaleString()} users
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {country.percentage}%
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-1 dark:bg-gray-700 mt-1">
                        <div
                          className="bg-green-600 h-1 rounded-full"
                          style={{ width: `${country.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Feature Usage Analytics */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Feature Usage Analytics
              </CardTitle>
              <CardDescription>
                Most popular features and usage trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analyticsData.featureUsage.map((feature) => (
                  <div key={feature.feature} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {feature.feature}
                      </h4>
                      <div className={`flex items-center gap-1 ${
                        feature.trend === 'up' ? 'text-green-600' :
                        feature.trend === 'down' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {feature.trend === 'up' ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : feature.trend === 'down' ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : (
                          <Minus className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Usage Count:</span>
                        <span className="font-medium">{feature.usage.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Active Users:</span>
                        <span className="font-medium">{feature.users.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div
                          className={`h-2 rounded-full ${
                            feature.trend === 'up' ? 'bg-green-600' :
                            feature.trend === 'down' ? 'bg-red-600' :
                            'bg-blue-600'
                          }`}
                          style={{ width: `${(feature.users / Math.max(...analyticsData.featureUsage.map(f => f.users))) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Revenue Analytics
            </CardTitle>
            <CardDescription>
              Revenue trends and tenant contributions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Revenue Trend */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  Daily Revenue Trend (Last 7 Days)
                </h4>
                <div className="grid grid-cols-7 gap-2">
                  {analyticsData.revenueData.daily.slice(-7).map((day, index) => (
                    <div key={day.date} className="text-center">
                      <div className="text-xs text-gray-600 mb-1">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="flex items-end justify-center h-16">
                        <div
                          className="bg-green-600 rounded-t min-w-[20px]"
                          style={{
                            height: `${(day.revenue / Math.max(...analyticsData.revenueData.daily.map(d => d.revenue))) * 100}%`,
                            minHeight: '4px'
                          }}
                          title={`$${day.revenue.toLocaleString()} • ${day.transactions} transactions`}
                        ></div>
                      </div>
                      <div className="text-xs font-medium text-gray-900 dark:text-white mt-1">
                        ${day.revenue.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Revenue Tenants */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  Top Revenue Generating Tenants
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analyticsData.revenueData.byTenant
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 3)
                    .map((tenant, index) => (
                      <div key={tenant.tenantId} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {tenant.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              Revenue generated
                            </div>
                          </div>
                        </div>
                        <div className="text-xl font-bold text-green-600">
                          ${tenant.revenue.toLocaleString()}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}