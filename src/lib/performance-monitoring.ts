// Performance Monitoring System
// Real-time performance tracking and optimization

import * as React from "react";

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags: Record<string, string>;
  tenantId?: string;
}

export interface PerformanceThreshold {
  metric: string;
  warning: number;
  critical: number;
  unit: string;
}

export interface PerformanceReport {
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    average: Record<string, number>;
    peak: Record<string, number>;
    p95: Record<string, number>;
    p99: Record<string, number>;
  };
  alerts: PerformanceAlert[];
  recommendations: string[];
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'critical';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: Date;
  tenantId?: string;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private alerts: PerformanceAlert[] = [];
  private thresholds: Map<string, PerformanceThreshold> = new Map();
  private maxMetricsInMemory = 50000;
  private alertCallbacks: ((alert: PerformanceAlert) => void)[] = [];

  private constructor() {
    this.initializeDefaultThresholds();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Record a performance metric
  recordMetric(
    name: string,
    value: number,
    unit: string = 'ms',
    tags: Record<string, string> = {},
    tenantId?: string
  ): void {
    const metric: PerformanceMetric = {
      id: this.generateId(),
      name,
      value,
      unit,
      timestamp: new Date(),
      tags,
      tenantId,
    };

    this.metrics.unshift(metric);

    // Keep memory usage in check
    if (this.metrics.length > this.maxMetricsInMemory) {
      this.metrics = this.metrics.slice(0, this.maxMetricsInMemory);
    }

    // Check thresholds and generate alerts
    this.checkThresholds(metric);
  }

  // Set performance threshold
  setThreshold(metric: string, threshold: PerformanceThreshold): void {
    this.thresholds.set(metric, threshold);
  }

  // Get current metrics
  getMetrics(
    name?: string,
    tenantId?: string,
    since?: Date,
    limit: number = 1000
  ): PerformanceMetric[] {
    let results = [...this.metrics];

    if (name) {
      results = results.filter(m => m.name === name);
    }

    if (tenantId) {
      results = results.filter(m => m.tenantId === tenantId);
    }

    if (since) {
      results = results.filter(m => m.timestamp >= since);
    }

    return results.slice(0, limit);
  }

  // Get performance statistics
  getStats(
    name: string,
    tenantId?: string,
    since?: Date
  ): {
    count: number;
    average: number;
    median: number;
    p95: number;
    p99: number;
    min: number;
    max: number;
  } {
    const metrics = this.getMetrics(name, tenantId, since);
    if (metrics.length === 0) {
      return { count: 0, average: 0, median: 0, p95: 0, p99: 0, min: 0, max: 0 };
    }

    const values = metrics.map(m => m.value).sort((a, b) => a - b);
    const count = values.length;
    const average = values.reduce((sum, val) => sum + val, 0) / count;
    const median = values[Math.floor(count / 2)];
    const p95 = values[Math.floor(count * 0.95)];
    const p99 = values[Math.floor(count * 0.99)];
    const min = values[0];
    const max = values[count - 1];

    return { count, average, median, p95, p99, min, max };
  }

  // Generate performance report
  generateReport(
    tenantId?: string,
    hours: number = 24
  ): PerformanceReport {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - hours * 60 * 60 * 1000);

    const metrics = this.getMetrics(undefined, tenantId, startDate);

    // Group metrics by name
    const metricsByName = metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = [];
      }
      acc[metric.name].push(metric.value);
      return acc;
    }, {} as Record<string, number[]>);

    // Calculate statistics for each metric
    const average: Record<string, number> = {};
    const peak: Record<string, number> = {};
    const p95: Record<string, number> = {};
    const p99: Record<string, number> = {};

    Object.entries(metricsByName).forEach(([name, values]) => {
      const sorted = values.sort((a, b) => a - b);
      average[name] = values.reduce((sum, val) => sum + val, 0) / values.length;
      peak[name] = Math.max(...values);
      p95[name] = sorted[Math.floor(sorted.length * 0.95)];
      p99[name] = sorted[Math.floor(sorted.length * 0.99)];
    });

    // Get recent alerts
    const recentAlerts = this.alerts.filter(
      alert => alert.timestamp >= startDate &&
               (!tenantId || alert.tenantId === tenantId)
    );

    const recommendations = this.generateRecommendations(metrics, recentAlerts);

    return {
      period: { start: startDate, end: endDate },
      metrics: { average, peak, p95, p99 },
      alerts: recentAlerts,
      recommendations,
    };
  }

  // Subscribe to performance alerts
  onAlert(callback: (alert: PerformanceAlert) => void): () => void {
    this.alertCallbacks.push(callback);
    return () => {
      const index = this.alertCallbacks.indexOf(callback);
      if (index > -1) {
        this.alertCallbacks.splice(index, 1);
      }
    };
  }

  // Get current alerts
  getAlerts(tenantId?: string, limit: number = 100): PerformanceAlert[] {
    return this.alerts
      .filter(alert => !tenantId || alert.tenantId === tenantId)
      .slice(0, limit);
  }

  // Clear old data
  clearOldData(olderThanHours: number = 24 * 7): void {
    const cutoffDate = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp >= cutoffDate);
    this.alerts = this.alerts.filter(a => a.timestamp >= cutoffDate);
  }

  // Initialize default thresholds
  private initializeDefaultThresholds(): void {
    this.setThreshold('response_time', { metric: 'response_time', warning: 1000, critical: 5000, unit: 'ms' });
    this.setThreshold('error_rate', { metric: 'error_rate', warning: 0.05, critical: 0.10, unit: '%' });
    this.setThreshold('cpu_usage', { metric: 'cpu_usage', warning: 80, critical: 95, unit: '%' });
    this.setThreshold('memory_usage', { metric: 'memory_usage', warning: 85, critical: 95, unit: '%' });
    this.setThreshold('database_query_time', { metric: 'database_query_time', warning: 500, critical: 2000, unit: 'ms' });
  }

  // Check thresholds and generate alerts
  private checkThresholds(metric: PerformanceMetric): void {
    const threshold = this.thresholds.get(metric.name);
    if (!threshold) return;

    let alertType: 'warning' | 'critical' | null = null;
    if (metric.value >= threshold.critical) {
      alertType = 'critical';
    } else if (metric.value >= threshold.warning) {
      alertType = 'warning';
    }

    if (alertType) {
      const alert: PerformanceAlert = {
        id: this.generateId(),
        type: alertType,
        metric: metric.name,
        value: metric.value,
        threshold: alertType === 'critical' ? threshold.critical : threshold.warning,
        message: `${metric.name} is ${alertType}: ${metric.value}${metric.unit} (threshold: ${alertType === 'critical' ? threshold.critical : threshold.warning}${metric.unit})`,
        timestamp: new Date(),
        tenantId: metric.tenantId,
      };

      this.alerts.unshift(alert);
      // Keep only recent alerts
      this.alerts = this.alerts.slice(0, 1000);

      // Notify subscribers
      this.alertCallbacks.forEach(callback => {
        try {
          callback(alert);
        } catch (error) {
          console.error('Error in performance alert callback:', error);
        }
      });
    }
  }

  // Generate performance recommendations
  private generateRecommendations(metrics: PerformanceMetric[], alerts: PerformanceAlert[]): string[] {
    const recommendations: string[] = [];

    // Check for high response times
    const highResponseTimes = metrics.filter(m => m.name === 'response_time' && m.value > 2000);
    if (highResponseTimes.length > 0) {
      recommendations.push('Consider implementing response caching for frequently accessed endpoints');
      recommendations.push('Review database queries for potential optimization opportunities');
    }

    // Check for high error rates
    const highErrorRates = metrics.filter(m => m.name === 'error_rate' && m.value > 0.05);
    if (highErrorRates.length > 0) {
      recommendations.push('Investigate error patterns and implement better error handling');
      recommendations.push('Add comprehensive logging for debugging error scenarios');
    }

    // Check for high CPU/memory usage
    const highCpuUsage = metrics.filter(m => m.name === 'cpu_usage' && m.value > 90);
    if (highCpuUsage.length > 0) {
      recommendations.push('Consider horizontal scaling or optimizing resource-intensive operations');
    }

    // Check for database performance issues
    const slowQueries = metrics.filter(m => m.name === 'database_query_time' && m.value > 1000);
    if (slowQueries.length > 0) {
      recommendations.push('Add database indexes for frequently queried columns');
      recommendations.push('Consider implementing database query result caching');
    }

    // General recommendations based on alerts
    if (alerts.length > 0) {
      recommendations.push('Set up automated monitoring alerts for critical metrics');
      recommendations.push('Implement performance budgets and monitoring in CI/CD pipeline');
    }

    return recommendations;
  }

  // Generate unique ID
  private generateId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Global performance monitor instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Performance monitoring hooks
export function usePerformanceMonitoring() {
  const recordMetric = (
    name: string,
    value: number,
    unit?: string,
    tags?: Record<string, string>,
    tenantId?: string
  ) => {
    performanceMonitor.recordMetric(name, value, unit, tags, tenantId);
  };

  const getMetrics = (
    name?: string,
    tenantId?: string,
    since?: Date,
    limit?: number
  ) => {
    return performanceMonitor.getMetrics(name, tenantId, since, limit);
  };

  const getStats = (name: string, tenantId?: string, since?: Date) => {
    return performanceMonitor.getStats(name, tenantId, since);
  };

  const onAlert = (callback: (alert: PerformanceAlert) => void) => {
    return performanceMonitor.onAlert(callback);
  };

  return {
    recordMetric,
    getMetrics,
    getStats,
    onAlert,
  };
}

// Page load performance tracking
export function trackPageLoad(tenantId?: string): void {
  if (typeof window === 'undefined') return;

  // Use Performance API if available
  if ('performance' in window && 'getEntriesByType' in performance) {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        performanceMonitor.recordMetric(
          'page_load_time',
          navigation.loadEventEnd - navigation.fetchStart,
          'ms',
          { page: window.location.pathname },
          tenantId
        );
      }
    });
  }
}

// API call performance tracking
export function trackApiCall(
  url: string,
  method: string,
  duration: number,
  status: number,
  tenantId?: string
): void {
  performanceMonitor.recordMetric(
    'api_response_time',
    duration,
    'ms',
    { url, method, status: status.toString() },
    tenantId
  );

  // Track error rate
  if (status >= 400) {
    performanceMonitor.recordMetric(
      'api_error_rate',
      1,
      'count',
      { url, method, status: status.toString() },
      tenantId
    );
  }
}

// Database query performance tracking
export function trackDatabaseQuery(
  query: string,
  duration: number,
  tenantId?: string
): void {
  performanceMonitor.recordMetric(
    'database_query_time',
    duration,
    'ms',
    { query: query.substring(0, 100) }, // Truncate long queries
    tenantId
  );
}

// React component performance tracking
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string,
  tenantId?: string
) {
  const WrappedComponent = (props: P) => {
    const startTime = performance.now();

    React.useEffect(() => {
      const duration = performance.now() - startTime;
      performanceMonitor.recordMetric(
        'component_render_time',
        duration,
        'ms',
        { component: componentName },
        tenantId
      );
    });

    return React.createElement(Component, props);
  };

  // Set display name for debugging
  WrappedComponent.displayName = `withPerformanceTracking(${componentName})`;

  return WrappedComponent;
}