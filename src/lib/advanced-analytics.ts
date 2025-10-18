// Advanced Analytics & Reporting System
// Comprehensive business intelligence for multi-tenant platform

export interface AnalyticsEvent {
  id: string;
  event: string;
  userId: string;
  tenantId?: string;
  sessionId: string;
  timestamp: Date;
  properties: Record<string, any>;
  userAgent: string;
  ipAddress: string;
  referrer?: string;
  url: string;
}

export interface AnalyticsMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  dimensions: Record<string, string>;
  tenantId?: string;
}

export interface AnalyticsReport {
  period: {
    start: Date;
    end: Date;
  };
  tenantId?: string;
  metrics: {
    userEngagement: {
      dau: number; // Daily Active Users
      mau: number; // Monthly Active Users
      sessionDuration: number;
      bounceRate: number;
      pageViews: number;
    };
    businessMetrics: {
      ideasCreated: number;
      offersCreated: number;
      matchesMade: number;
      dealsClosed: number;
      revenueGenerated: number;
      conversionRate: number;
    };
    technicalMetrics: {
      errorRate: number;
      responseTime: number;
      uptime: number;
      apiCalls: number;
    };
  };
  trends: {
    userGrowth: number;
    revenueGrowth: number;
    engagementGrowth: number;
  };
  insights: AnalyticsInsight[];
  recommendations: string[];
}

export interface AnalyticsInsight {
  type: 'opportunity' | 'warning' | 'success' | 'info';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  data: any;
}

export interface FunnelAnalysis {
  steps: {
    name: string;
    users: number;
    conversionRate: number;
  }[];
  overallConversion: number;
  dropOffPoints: string[];
}

export class AdvancedAnalytics {
  private static instance: AdvancedAnalytics;
  private events: AnalyticsEvent[] = [];
  private metrics: AnalyticsMetric[] = [];
  private maxDataInMemory = 100000;

  private constructor() {}

  static getInstance(): AdvancedAnalytics {
    if (!AdvancedAnalytics.instance) {
      AdvancedAnalytics.instance = new AdvancedAnalytics();
    }
    return AdvancedAnalytics.instance;
  }

  // Track user event
  trackEvent(
    event: string,
    userId: string,
    tenantId: string | undefined,
    properties: Record<string, any> = {},
    context: {
      sessionId: string;
      userAgent: string;
      ipAddress: string;
      referrer?: string;
      url: string;
    }
  ): void {
    const analyticsEvent: AnalyticsEvent = {
      id: this.generateId(),
      event,
      userId,
      tenantId,
      sessionId: context.sessionId,
      timestamp: new Date(),
      properties,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      referrer: context.referrer,
      url: context.url,
    };

    this.events.unshift(analyticsEvent);

    // Keep memory usage in check
    if (this.events.length > this.maxDataInMemory) {
      this.events = this.events.slice(0, this.maxDataInMemory);
    }

    // Real-time processing for critical events
    this.processRealTimeEvent(analyticsEvent);
  }

  // Record business metric
  recordMetric(
    name: string,
    value: number,
    unit: string,
    dimensions: Record<string, string>,
    tenantId?: string
  ): void {
    const metric: AnalyticsMetric = {
      name,
      value,
      unit,
      timestamp: new Date(),
      dimensions,
      tenantId,
    };

    this.metrics.unshift(metric);

    // Keep memory usage in check
    if (this.metrics.length > this.maxDataInMemory) {
      this.metrics = this.metrics.slice(0, this.maxDataInMemory);
    }
  }

  // Generate comprehensive analytics report
  generateReport(
    tenantId?: string,
    days: number = 30
  ): AnalyticsReport {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const periodEvents = this.events.filter(
      event => event.timestamp >= startDate &&
               event.timestamp <= endDate &&
               (!tenantId || event.tenantId === tenantId)
    );

    const periodMetrics = this.metrics.filter(
      metric => metric.timestamp >= startDate &&
                metric.timestamp <= endDate &&
                (!tenantId || metric.tenantId === tenantId)
    );

    // Calculate user engagement metrics
    const userEngagement = this.calculateUserEngagement(periodEvents, startDate, endDate);

    // Calculate business metrics
    const businessMetrics = this.calculateBusinessMetrics(periodEvents, periodMetrics);

    // Calculate technical metrics
    const technicalMetrics = this.calculateTechnicalMetrics(periodMetrics);

    // Calculate trends
    const previousPeriodEvents = this.events.filter(
      event => {
        const prevEnd = startDate;
        const prevStart = new Date(prevEnd.getTime() - days * 24 * 60 * 60 * 1000);
        return event.timestamp >= prevStart &&
               event.timestamp <= prevEnd &&
               (!tenantId || event.tenantId === tenantId);
      }
    );

    const trends = this.calculateTrends(periodEvents, previousPeriodEvents);

    // Generate insights
    const insights = this.generateInsights(periodEvents, businessMetrics, trends);

    // Generate recommendations
    const recommendations = this.generateRecommendations(insights, businessMetrics);

    return {
      period: { start: startDate, end: endDate },
      tenantId,
      metrics: {
        userEngagement,
        businessMetrics,
        technicalMetrics,
      },
      trends,
      insights,
      recommendations,
    };
  }

  // Analyze user conversion funnel
  analyzeFunnel(
    tenantId: string | undefined,
    steps: string[],
    days: number = 30
  ): FunnelAnalysis {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const events = this.events.filter(
      event => event.timestamp >= startDate &&
               event.timestamp <= endDate &&
               (!tenantId || event.tenantId === tenantId)
    );

    const funnelSteps = steps.map(step => {
      const users = new Set(
        events
          .filter(event => event.event === step)
          .map(event => event.userId)
      ).size;

      return {
        name: step,
        users,
        conversionRate: 0, // Will be calculated below
      };
    });

    // Calculate conversion rates
    for (let i = 0; i < funnelSteps.length; i++) {
      if (i === 0) {
        funnelSteps[i].conversionRate = 1; // First step is 100%
      } else {
        const previousUsers = funnelSteps[i - 1].users;
        funnelSteps[i].conversionRate = previousUsers > 0 ? funnelSteps[i].users / previousUsers : 0;
      }
    }

    const overallConversion = funnelSteps.length > 0 ? funnelSteps[funnelSteps.length - 1].conversionRate : 0;

    // Identify drop-off points
    const dropOffPoints = funnelSteps
      .slice(1)
      .filter(step => step.conversionRate < 0.5)
      .map(step => step.name);

    return {
      steps: funnelSteps,
      overallConversion,
      dropOffPoints,
    };
  }

  // Get user segmentation
  getUserSegments(tenantId?: string, days: number = 30): Record<string, number> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const events = this.events.filter(
      event => event.timestamp >= startDate &&
               event.timestamp <= endDate &&
               (!tenantId || event.tenantId === tenantId)
    );

    const userActivity = events.reduce((acc, event) => {
      if (!acc[event.userId]) {
        acc[event.userId] = { events: 0, lastActivity: event.timestamp };
      }
      acc[event.userId].events++;
      if (event.timestamp > acc[event.userId].lastActivity) {
        acc[event.userId].lastActivity = event.timestamp;
      }
      return acc;
    }, {} as Record<string, { events: number; lastActivity: Date }>);

    // Segment users
    const segments = {
      highly_active: 0, // > 50 events
      active: 0,         // 10-50 events
      casual: 0,         // 1-9 events
      inactive: 0,       // 0 events (from user base)
    };

    Object.values(userActivity).forEach(activity => {
      if (activity.events > 50) segments.highly_active++;
      else if (activity.events > 10) segments.active++;
      else if (activity.events > 0) segments.casual++;
    });

    return segments;
  }

  // Export analytics data
  exportData(
    tenantId?: string,
    format: 'json' | 'csv' = 'json',
    includeEvents: boolean = true,
    includeMetrics: boolean = true,
    days: number = 30
  ): string {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const data = {
      exportDate: new Date(),
      period: { start: startDate, end: endDate },
      tenantId,
      events: includeEvents ? this.events.filter(
        event => event.timestamp >= startDate &&
                 event.timestamp <= endDate &&
                 (!tenantId || event.tenantId === tenantId)
      ) : [],
      metrics: includeMetrics ? this.metrics.filter(
        metric => metric.timestamp >= startDate &&
                  metric.timestamp <= endDate &&
                  (!tenantId || metric.tenantId === tenantId)
      ) : [],
    };

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = [];

      // Events CSV
      if (includeEvents && data.events.length > 0) {
        csvData.push('# Events');
        const eventHeaders = Object.keys(data.events[0]).join(',');
        csvData.push(eventHeaders);
        data.events.forEach(event => {
          const values = Object.values(event).map(val =>
            typeof val === 'object' ? JSON.stringify(val) : String(val)
          );
          csvData.push(values.join(','));
        });
      }

      return csvData.join('\n');
    }

    return JSON.stringify(data, null, 2);
  }

  // Private methods
  private calculateUserEngagement(events: AnalyticsEvent[], startDate: Date, endDate: Date) {
    const uniqueUsers = new Set(events.map(e => e.userId));
    const sessions = new Set(events.map(e => e.sessionId));

    // Calculate daily active users (rough estimate)
    const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const dau = Math.round(uniqueUsers.size / daysInPeriod);

    // Monthly active users (estimate based on period)
    const mau = uniqueUsers.size;

    // Average session duration (mock calculation)
    const sessionDuration = 180; // 3 minutes average

    // Bounce rate (users with only 1 event)
    const userEventCounts = events.reduce((acc, event) => {
      acc[event.userId] = (acc[event.userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bouncedUsers = Object.values(userEventCounts).filter(count => count === 1).length;
    const bounceRate = uniqueUsers.size > 0 ? bouncedUsers / uniqueUsers.size : 0;

    const pageViews = events.filter(e => e.event === 'page_view').length;

    return {
      dau,
      mau,
      sessionDuration,
      bounceRate,
      pageViews,
    };
  }

  private calculateBusinessMetrics(events: AnalyticsEvent[], metrics: AnalyticsMetric[]) {
    const ideasCreated = events.filter(e => e.event === 'idea_created').length;
    const offersCreated = events.filter(e => e.event === 'offer_created').length;
    const matchesMade = events.filter(e => e.event === 'match_created').length;
    const dealsClosed = events.filter(e => e.event === 'deal_closed').length;

    const revenueMetrics = metrics.filter(m => m.name === 'revenue');
    const revenueGenerated = revenueMetrics.reduce((sum, m) => sum + m.value, 0);

    const conversionRate = matchesMade > 0 ? dealsClosed / matchesMade : 0;

    return {
      ideasCreated,
      offersCreated,
      matchesMade,
      dealsClosed,
      revenueGenerated,
      conversionRate,
    };
  }

  private calculateTechnicalMetrics(metrics: AnalyticsMetric[]) {
    const errorMetrics = metrics.filter(m => m.name.includes('error'));
    const errorRate = errorMetrics.length > 0
      ? errorMetrics.reduce((sum, m) => sum + m.value, 0) / errorMetrics.length
      : 0;

    const responseTimeMetrics = metrics.filter(m => m.name.includes('response_time'));
    const responseTime = responseTimeMetrics.length > 0
      ? responseTimeMetrics.reduce((sum, m) => sum + m.value, 0) / responseTimeMetrics.length
      : 0;

    // Mock uptime calculation
    const uptime = 0.995; // 99.5%

    const apiCallMetrics = metrics.filter(m => m.name.includes('api_call'));
    const apiCalls = apiCallMetrics.reduce((sum, m) => sum + m.value, 0);

    return {
      errorRate,
      responseTime,
      uptime,
      apiCalls,
    };
  }

  private calculateTrends(currentEvents: AnalyticsEvent[], previousEvents: AnalyticsEvent[]) {
    const currentUsers = new Set(currentEvents.map(e => e.userId)).size;
    const previousUsers = new Set(previousEvents.map(e => e.userId)).size;

    const userGrowth = previousUsers > 0 ? (currentUsers - previousUsers) / previousUsers : 0;

    // Mock revenue and engagement growth
    const revenueGrowth = 0.12; // 12%
    const engagementGrowth = 0.08; // 8%

    return {
      userGrowth,
      revenueGrowth,
      engagementGrowth,
    };
  }

  private generateInsights(
    events: AnalyticsEvent[],
    businessMetrics: any,
    trends: any
  ): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];

    // User growth insight
    if (trends.userGrowth > 0.1) {
      insights.push({
        type: 'success',
        title: 'Strong User Growth',
        description: `User base grew by ${(trends.userGrowth * 100).toFixed(1)}% compared to last period`,
        impact: 'high',
        confidence: 0.95,
        data: { growth: trends.userGrowth },
      });
    }

    // Low conversion insight
    if (businessMetrics.conversionRate < 0.1) {
      insights.push({
        type: 'warning',
        title: 'Low Conversion Rate',
        description: `Only ${(businessMetrics.conversionRate * 100).toFixed(1)}% of matches convert to deals`,
        impact: 'high',
        confidence: 0.88,
        data: { conversionRate: businessMetrics.conversionRate },
      });
    }

    // High engagement insight
    const highEngagementEvents = events.filter(e =>
      ['match_created', 'message_sent', 'video_call_started'].includes(e.event)
    );
    if (highEngagementEvents.length > events.length * 0.3) {
      insights.push({
        type: 'opportunity',
        title: 'High User Engagement',
        description: 'Users are actively engaging with matching and communication features',
        impact: 'medium',
        confidence: 0.82,
        data: { engagementRate: highEngagementEvents.length / events.length },
      });
    }

    return insights;
  }

  private generateRecommendations(insights: AnalyticsInsight[], businessMetrics: any): string[] {
    const recommendations: string[] = [];

    const lowConversionInsight = insights.find(i => i.title === 'Low Conversion Rate');
    if (lowConversionInsight) {
      recommendations.push('Improve the matching algorithm to ensure higher quality matches');
      recommendations.push('Provide better negotiation tools and templates');
      recommendations.push('Offer deal closing assistance or legal templates');
    }

    if (businessMetrics.dealsClosed < 5) {
      recommendations.push('Focus on lead generation and marketing to increase deal flow');
    }

    if (businessMetrics.ideasCreated > businessMetrics.offersCreated * 2) {
      recommendations.push('Attract more investors to balance the platform supply/demand');
    }

    return recommendations;
  }

  private processRealTimeEvent(event: AnalyticsEvent): void {
    // Real-time processing for critical business events
    if (['deal_closed', 'user_registered', 'match_created'].includes(event.event)) {
      // Could trigger real-time alerts, notifications, or automated actions
      console.log('Real-time event processed:', event.event);
    }
  }

  private generateId(): string {
    return `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Clear old data to manage memory
  clearOldData(olderThanDays: number = 90): void {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    this.events = this.events.filter(e => e.timestamp >= cutoffDate);
    this.metrics = this.metrics.filter(m => m.timestamp >= cutoffDate);
  }
}

// Global analytics instance
export const advancedAnalytics = AdvancedAnalytics.getInstance();

// Analytics tracking hooks
export function useAnalytics() {
  const trackEvent = (
    event: string,
    userId: string,
    tenantId: string | undefined,
    properties: Record<string, any>,
    context: {
      sessionId: string;
      userAgent: string;
      ipAddress: string;
      referrer?: string;
      url: string;
    }
  ) => {
    advancedAnalytics.trackEvent(event, userId, tenantId, properties, context);
  };

  const recordMetric = (
    name: string,
    value: number,
    unit: string,
    dimensions: Record<string, string>,
    tenantId?: string
  ) => {
    advancedAnalytics.recordMetric(name, value, unit, dimensions, tenantId);
  };

  return {
    trackEvent,
    recordMetric,
  };
}