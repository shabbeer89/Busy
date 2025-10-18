"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Server,
  Database,
  Globe,
  HardDrive,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Cpu,
  MemoryStick,
  Wifi
} from 'lucide-react';
import AdminLayout from '../layout';
import { adminService, SystemHealth } from '@/services/admin-service';
import { AdminMonitoringSkeleton } from '@/components/ui/skeleton';

interface MetricCard {
  title: string;
  value: string | number;
  unit?: string;
  status: 'healthy' | 'warning' | 'error';
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon: React.ElementType;
  description?: string;
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  component: string;
}

export default function MonitoringPage() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadSystemHealth();

    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadSystemHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadSystemHealth = async () => {
    try {
      setLoading(true);
      const health = await adminService.getSystemHealth();
      setSystemHealth(health);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load system health:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  // Mock alerts data
  const alerts: SystemAlert[] = [
    {
      id: '1',
      type: 'warning',
      title: 'High Memory Usage',
      message: 'Database server memory usage is above 85%',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      component: 'Database'
    },
    {
      id: '2',
      type: 'error',
      title: 'API Endpoint Down',
      message: 'User authentication service is not responding',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      component: 'API'
    },
    {
      id: '3',
      type: 'info',
      title: 'Scheduled Maintenance',
      message: 'Database backup completed successfully',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      component: 'Database'
    }
  ];

  const metrics: MetricCard[] = systemHealth ? [
    {
      title: 'Database Status',
      value: systemHealth.database.status,
      status: systemHealth.database.status,
      trend: systemHealth.database.responseTime > 100 ? 'up' : 'stable',
      trendValue: `${systemHealth.database.responseTime}ms`,
      icon: Database,
      description: `${systemHealth.database.connections} active connections`
    },
    {
      title: 'API Status',
      value: systemHealth.api.status,
      status: systemHealth.api.status,
      trend: systemHealth.api.responseTime > 200 ? 'up' : 'stable',
      trendValue: `${systemHealth.api.responseTime}ms`,
      icon: Globe,
      description: `${systemHealth.api.uptime}% uptime`
    },
    {
      title: 'Storage Usage',
      value: `${systemHealth.storage.usage * 100}`,
      unit: '%',
      status: systemHealth.storage.status,
      trend: systemHealth.storage.usage > 0.8 ? 'up' : 'stable',
      trendValue: `${systemHealth.storage.totalSpace}GB total`,
      icon: HardDrive,
      description: `${(systemHealth.storage.usage * systemHealth.storage.totalSpace).toFixed(1)}GB used`
    },
    {
      title: 'Feature Status',
      value: systemHealth.features.status,
      status: systemHealth.features.status,
      trend: 'stable',
      trendValue: `${systemHealth.features.enabledFeatures}/${systemHealth.features.totalFeatures}`,
      icon: Zap,
      description: 'Features operational'
    }
  ] : [];

  if (loading) {
    return (
        <AdminMonitoringSkeleton />
    );
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Monitoring</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Real-time system health and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <Button variant="outline" onClick={loadSystemHealth}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {metric.title}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {metric.value}
                        {metric.unit}
                      </p>
                      {getStatusIcon(metric.status)}
                    </div>
                    {metric.description && (
                      <p className="text-xs text-gray-500 mt-1">
                        {metric.description}
                      </p>
                    )}
                  </div>
                  <metric.icon className={`w-8 h-8 ${
                    metric.status === 'healthy' ? 'text-green-500' :
                    metric.status === 'warning' ? 'text-yellow-500' :
                    'text-red-500'
                  }`} />
                </div>
                {metric.trend && (
                  <div className="mt-4 flex items-center text-sm">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                    ) : metric.trend === 'down' ? (
                      <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <Activity className="w-4 h-4 text-gray-500 mr-1" />
                    )}
                    <span className={`font-medium ${
                      metric.trend === 'up' ? 'text-red-600' :
                      metric.trend === 'down' ? 'text-green-600' :
                      'text-gray-600'
                    }`}>
                      {metric.trendValue}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Resources */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                System Resources
              </CardTitle>
              <CardDescription>
                Real-time resource utilization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* CPU Usage */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      CPU Usage
                    </span>
                    <span className="text-sm text-gray-600">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>

                {/* Memory Usage */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <MemoryStick className="w-4 h-4" />
                      Memory Usage
                    </span>
                    <span className="text-sm text-gray-600">72%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                </div>

                {/* Disk Usage */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <HardDrive className="w-4 h-4" />
                      Disk Usage
                    </span>
                    <span className="text-sm text-gray-600">58%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '58%' }}></div>
                  </div>
                </div>

                {/* Network I/O */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Wifi className="w-4 h-4" />
                      Network I/O
                    </span>
                    <span className="text-sm text-gray-600">234 MB/s</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Current user activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Active</span>
                  <span className="text-2xl font-bold text-green-600">1,247</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Hour</span>
                  <span className="text-lg font-semibold text-blue-600">89</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Peak Today</span>
                  <span className="text-lg font-semibold text-purple-600">2,341</span>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-xs text-gray-500 mb-2">Top Tenant Activity</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>TechVentures Inc.</span>
                      <span className="font-medium">342 users</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>GreenEnergy Solutions</span>
                      <span className="font-medium">189 users</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>FinTech Innovations</span>
                      <span className="font-medium">156 users</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              System Alerts
            </CardTitle>
            <CardDescription>
              Recent system alerts and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    alert.type === 'error' ? 'bg-red-500' :
                    alert.type === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {alert.title}
                      </p>
                      <Badge className={getStatusColor(alert.type)}>
                        {alert.component}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>

            {alerts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <p>No active alerts</p>
                <p className="text-sm">All systems are running normally</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}