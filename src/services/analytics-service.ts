"use client";

import { createClient } from '@/lib/supabase-client';

// Create supabase client instance
const supabase = createClient();

export interface AnalyticsData {
  userActivity: {
    daily: { date: string; users: number; sessions: number; }[];
    weekly: { week: string; users: number; sessions: number; }[];
    monthly: { month: string; users: number; sessions: number; }[];
  };
  tenantMetrics: {
    tenantId: string;
    name: string;
    users: number;
    revenue: number;
    growth: number;
    activity: number;
  }[];
  revenueData: {
    daily: { date: string; revenue: number; transactions: number; }[];
    monthly: { month: string; revenue: number; transactions: number; }[];
    byTenant: { tenantId: string; name: string; revenue: number; }[];
  };
  systemMetrics: {
    apiCalls: { date: string; calls: number; errors: number; }[];
    responseTimes: { date: string; avgResponseTime: number; p95: number; }[];
    errorRates: { date: string; errors: number; rate: number; }[];
  };
  geographicData: {
    country: string;
    users: number;
    percentage: number;
  }[];
  featureUsage: {
    feature: string;
    usage: number;
    users: number;
    trend: 'up' | 'down' | 'stable';
  }[];
}

export interface DateRange {
  from: Date;
  to: Date;
}

class AnalyticsService {
  // Get comprehensive analytics data
  async getAnalyticsData(dateRange?: DateRange): Promise<AnalyticsData> {
    try {
      // In a real implementation, these would be actual database queries
      // For now, we'll generate realistic mock data based on real database state

      const { data: users } = await supabase.from('users').select('id, created_at');
      const { data: tenants } = await supabase.from('tenants').select('id, name, status');

      const totalUsers = users?.length || 0;
      const totalTenants = tenants?.length || 0;

      // Generate user activity data
      const userActivity = this.generateUserActivityData(totalUsers, dateRange);

      // Generate tenant metrics
      const tenantMetrics = this.generateTenantMetricsData(tenants || [], dateRange);

      // Generate revenue data
      const revenueData = this.generateRevenueData(tenantMetrics, dateRange);

      // Generate system metrics
      const systemMetrics = this.generateSystemMetricsData(dateRange);

      // Generate geographic data
      const geographicData = this.generateGeographicData();

      // Generate feature usage data
      const featureUsage = this.generateFeatureUsageData();

      return {
        userActivity,
        tenantMetrics,
        revenueData,
        systemMetrics,
        geographicData,
        featureUsage
      };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      return this.getMockAnalyticsData();
    }
  }

  // Get user activity analytics
  async getUserActivityAnalytics(dateRange?: DateRange) {
    try {
      // In a real implementation, this would query analytics_events table
      const { data: events } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('timestamp', dateRange?.from.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .lte('timestamp', dateRange?.to.toISOString() || new Date().toISOString());

      // Process events data
      const dailyData = this.processUserActivityEvents(events || []);

      return dailyData;
    } catch (error) {
      console.error('Error fetching user activity analytics:', error);
      return this.getMockUserActivityData();
    }
  }

  // Get tenant performance analytics
  async getTenantAnalytics() {
    try {
      const { data: tenants } = await supabase.from('tenants').select('*');
      const { data: users } = await supabase.from('users').select('tenant_id');

      // Process tenant performance data
      const tenantAnalytics = (tenants || []).map((tenant: any) => {
        const tenantUsers = users?.filter((u: any) => u.tenant_id === tenant.id).length || 0;

        return {
          tenantId: tenant.id,
          name: tenant.name,
          status: tenant.status,
          users: tenantUsers,
          // Mock additional metrics
          revenue: Math.floor(Math.random() * 10000) + 1000,
          growth: Math.floor(Math.random() * 50) - 25, // -25% to +25%
          activity: Math.floor(Math.random() * 1000) + 100
        };
      });

      return tenantAnalytics;
    } catch (error) {
      console.error('Error fetching tenant analytics:', error);
      return [];
    }
  }

  // Get revenue analytics
  async getRevenueAnalytics(dateRange?: DateRange) {
    try {
      // In a real implementation, this would query transactions table
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .gte('created_at', dateRange?.from.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .lte('created_at', dateRange?.to.toISOString() || new Date().toISOString());

      // Process revenue data
      const revenueByDay = this.processRevenueData(transactions || []);

      return revenueByDay;
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      return this.getMockRevenueData();
    }
  }

  // Helper methods for generating realistic mock data
  private generateUserActivityData(totalUsers: number, dateRange?: DateRange) {
    const days = dateRange ?
      Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (24 * 60 * 60 * 1000)) :
      30;

    const daily = [];
    const weekly = [];
    const monthly = [];

    // Generate daily data
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const users = Math.floor(totalUsers * (0.1 + Math.random() * 0.3));
      const sessions = users * (1 + Math.random());

      daily.push({
        date: date.toISOString().split('T')[0],
        users,
        sessions: Math.floor(sessions)
      });
    }

    // Generate weekly data
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);
      const weekUsers = Math.floor(totalUsers * (0.3 + Math.random() * 0.4));
      const weekSessions = weekUsers * (2 + Math.random() * 3);

      weekly.push({
        week: weekStart.toISOString().split('T')[0],
        users: weekUsers,
        sessions: Math.floor(weekSessions)
      });
    }

    // Generate monthly data
    for (let i = 11; i >= 0; i--) {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      const monthUsers = Math.floor(totalUsers * (0.5 + Math.random() * 0.3));
      const monthSessions = monthUsers * (3 + Math.random() * 4);

      monthly.push({
        month: month.toISOString().slice(0, 7),
        users: monthUsers,
        sessions: Math.floor(monthSessions)
      });
    }

    return { daily, weekly, monthly };
  }

  private generateTenantMetricsData(tenants: any[], dateRange?: DateRange) {
    return tenants.map(tenant => ({
      tenantId: tenant.id,
      name: tenant.name,
      users: Math.floor(Math.random() * 100) + 10,
      revenue: Math.floor(Math.random() * 10000) + 1000,
      growth: Math.floor(Math.random() * 50) - 25,
      activity: Math.floor(Math.random() * 1000) + 100
    }));
  }

  private generateRevenueData(tenantMetrics: any[], dateRange?: DateRange) {
    const days = dateRange ?
      Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (24 * 60 * 60 * 1000)) :
      30;

    const daily = [];
    const monthly = [];
    const byTenant = tenantMetrics.map(tenant => ({
      tenantId: tenant.tenantId,
      name: tenant.name,
      revenue: tenant.revenue
    }));

    // Generate daily revenue data
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const baseRevenue = byTenant.reduce((sum, tenant) => sum + tenant.revenue, 0) / 30;
      const revenue = baseRevenue * (0.7 + Math.random() * 0.6);
      const transactions = Math.floor(revenue / 100) + Math.floor(Math.random() * 10);

      daily.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(revenue),
        transactions
      });
    }

    // Generate monthly revenue data
    for (let i = 11; i >= 0; i--) {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      const monthRevenue = byTenant.reduce((sum, tenant) => sum + tenant.revenue, 0) * (0.8 + Math.random() * 0.4);

      monthly.push({
        month: month.toISOString().slice(0, 7),
        revenue: Math.floor(monthRevenue),
        transactions: Math.floor(monthRevenue / 50)
      });
    }

    return { daily, monthly, byTenant };
  }

  private generateSystemMetricsData(dateRange?: DateRange) {
    const days = dateRange ?
      Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (24 * 60 * 60 * 1000)) :
      30;

    const apiCalls = [];
    const responseTimes = [];
    const errorRates = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);

      // API calls data
      const calls = Math.floor(1000 + Math.random() * 2000);
      const errors = Math.floor(calls * (0.01 + Math.random() * 0.02));

      apiCalls.push({
        date: date.toISOString().split('T')[0],
        calls,
        errors
      });

      // Response times data
      const avgResponseTime = 100 + Math.random() * 200;
      const p95 = avgResponseTime + Math.random() * 100;

      responseTimes.push({
        date: date.toISOString().split('T')[0],
        avgResponseTime: Math.floor(avgResponseTime),
        p95: Math.floor(p95)
      });

      // Error rates data
      errorRates.push({
        date: date.toISOString().split('T')[0],
        errors,
        rate: Math.floor((errors / calls) * 10000) / 100 // Convert to percentage
      });
    }

    return { apiCalls, responseTimes, errorRates };
  }

  private generateGeographicData() {
    return [
      { country: 'United States', users: 1250, percentage: 35.2 },
      { country: 'United Kingdom', users: 890, percentage: 25.1 },
      { country: 'Canada', users: 445, percentage: 12.5 },
      { country: 'Germany', users: 334, percentage: 9.4 },
      { country: 'France', users: 278, percentage: 7.8 },
      { country: 'Australia', users: 178, percentage: 5.0 },
      { country: 'Others', users: 178, percentage: 5.0 }
    ];
  }

  private generateFeatureUsageData() {
    return [
      { feature: 'Video Calling', usage: 1250, users: 445, trend: 'up' as const },
      { feature: 'Crypto Payments', usage: 890, users: 334, trend: 'stable' as const },
      { feature: 'BABT Verification', usage: 1567, users: 623, trend: 'up' as const },
      { feature: 'Advanced Analytics', usage: 445, users: 178, trend: 'down' as const },
      { feature: 'AI Matching', usage: 2341, users: 891, trend: 'up' as const }
    ];
  }

  private processUserActivityEvents(events: any[]) {
    // Process events into daily activity data
    const dailyData: { [key: string]: { users: number; sessions: number } } = {};

    events.forEach(event => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { users: 0, sessions: 0 };
      }

      if (event.event_type === 'user_login' || event.event_type === 'session_start') {
        dailyData[date].users += 1;
      }
      if (event.event_type === 'session_start') {
        dailyData[date].sessions += 1;
      }
    });

    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      ...data
    }));
  }

  private processRevenueData(transactions: any[]) {
    const dailyData: { [key: string]: { revenue: number; transactions: number } } = {};

    transactions.forEach(transaction => {
      const date = new Date(transaction.created_at).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { revenue: 0, transactions: 0 };
      }

      dailyData[date].revenue += transaction.amount || 0;
      dailyData[date].transactions += 1;
    });

    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      ...data
    }));
  }

  // Fallback mock data methods
  private getMockAnalyticsData(): AnalyticsData {
    return {
      userActivity: { daily: [], weekly: [], monthly: [] },
      tenantMetrics: [],
      revenueData: { daily: [], monthly: [], byTenant: [] },
      systemMetrics: { apiCalls: [], responseTimes: [], errorRates: [] },
      geographicData: [],
      featureUsage: []
    };
  }

  private getMockUserActivityData() {
    return Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      users: Math.floor(100 + Math.random() * 200),
      sessions: Math.floor(150 + Math.random() * 300)
    })).reverse();
  }

  private getMockRevenueData() {
    return Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      revenue: Math.floor(1000 + Math.random() * 5000),
      transactions: Math.floor(10 + Math.random() * 50)
    })).reverse();
  }
}

export const analyticsService = new AnalyticsService();