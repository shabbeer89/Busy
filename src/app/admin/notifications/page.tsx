"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Bell,
  BellRing,
  Search,
  Filter,
  Plus,
  Settings,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Shield,
  CreditCard,
  Server,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  TrendingUp,
  TrendingDown
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
  notificationService,
  SystemNotification,
  NotificationTemplate,
  NotificationStats
} from '@/services/notification-service';
import { AdminNotificationsSkeleton } from '@/components/ui/skeleton';

interface NotificationCardProps {
  notification: SystemNotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetails: (notification: SystemNotification) => void;
}

function NotificationCard({ notification, onMarkAsRead, onDelete, onViewDetails }: NotificationCardProps) {
  const getTypeIcon = () => {
    switch (notification.type) {
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'security': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'billing': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'system': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'user': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'tenant': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className={`transition-all ${!notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            {getTypeIcon()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium text-gray-900 dark:text-white truncate">
                {notification.title}
              </h4>
              <Badge className={getPriorityColor(notification.priority)}>
                {notification.priority}
              </Badge>
              {notification.category && (
                <Badge className={getCategoryColor(notification.category)}>
                  {notification.category}
                </Badge>
              )}
              {notification.escalationLevel && notification.escalationLevel > 0 && (
                <Badge variant="outline">
                  Level {notification.escalationLevel}
                </Badge>
              )}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
              {notification.message}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
                {notification.tenantId && (
                  <span className="flex items-center gap-1">
                    <Server className="w-3 h-3" />
                    Tenant: {notification.tenantId}
                  </span>
                )}
                {notification.affectedResources && notification.affectedResources.length > 0 && (
                  <span>{notification.affectedResources.length} resources affected</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!notification.isRead && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Mark Read
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onViewDetails(notification)}
                >
                  Details
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(notification.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);

  useEffect(() => {
    loadNotificationData();
  }, []);

  const loadNotificationData = async () => {
    try {
      setLoading(true);
      const [notificationsData, templatesData, statsData] = await Promise.all([
        notificationService.getNotifications(),
        notificationService.getNotificationTemplates(),
        notificationService.getNotificationStats()
      ]);

      setNotifications(notificationsData);
      setTemplates(templatesData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load notification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const success = await notificationService.markAsRead(notificationId);
      if (success) {
        setNotifications(prev => prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        ));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const success = await notificationService.deleteNotification(notificationId);
      if (success) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const success = await notificationService.markAllAsRead();
      if (success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleViewDetails = (notification: SystemNotification) => {
    console.log('View notification details:', notification);
    // TODO: Show detailed modal with full notification information
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || notification.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' ||
                          (statusFilter === 'read' && notification.isRead) ||
                          (statusFilter === 'unread' && !notification.isRead);

    return matchesSearch && matchesType && matchesPriority && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
        <AdminNotificationsSkeleton />
    );
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Center</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Manage system alerts, notifications, and communication preferences
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <Eye className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
            <Button variant="outline" onClick={loadNotificationData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setShowCreateTemplate(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">{stats?.totalNotifications || 0}</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Notifications</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-red-600">{stats?.unreadNotifications || 0}</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Unread</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-orange-600">{stats?.systemAlerts || 0}</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">System Alerts</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-purple-600">{stats?.userNotifications || 0}</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">User Notifications</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">
                {stats?.notificationsByType?.success || 0}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Success Messages</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-yellow-600">
                {(stats?.notificationsByPriority?.high || 0) + (stats?.notificationsByPriority?.critical || 0)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">High Priority</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Notifications List */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                System Notifications ({filteredNotifications.length})
              </CardTitle>
              <CardDescription>
                Real-time system alerts and user notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="mb-6 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search notifications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notifications List */}
              <div className="space-y-4">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No notifications found</p>
                    <p className="text-sm">All systems running smoothly</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDeleteNotification}
                      onViewDetails={handleViewDetails}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notification Templates & Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Templates & Settings
              </CardTitle>
              <CardDescription>
                Manage notification templates and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Active Templates */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Active Templates</h4>
                <div className="space-y-3">
                  {templates.filter(t => t.isActive).map((template) => (
                    <div key={template.id} className="p-3 border rounded-lg">
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        {template.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {template.description}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`text-xs ${template.priority === 'critical' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                          {template.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Shield className="w-4 h-4 mr-2" />
                  Security Alert Settings
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Billing Notifications
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  User Preferences
                </Button>
              </div>

              {/* System Health Indicator */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    System Health
                  </span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  All notification systems operational
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notification Categories Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Categories</CardTitle>
            <CardDescription>
              Breakdown of notifications by category and priority
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(stats?.notificationsByCategory || {}).map(([category, count]) => (
                <div key={category} className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{count}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                    {category.replace('_', ' ')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Alert Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              System Alert Rules
            </CardTitle>
            <CardDescription>
              Automatic notification triggers and escalation rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Security Alerts</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Failed login attempts (5+)</span>
                    <Badge className="bg-red-100 text-red-800">Critical</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Unusual access patterns</span>
                    <Badge className="bg-orange-100 text-orange-800">High</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Policy violations</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">System Alerts</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>High resource usage</span>
                    <Badge className="bg-orange-100 text-orange-800">High</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Service unavailable</span>
                    <Badge className="bg-red-100 text-red-800">Critical</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Scheduled maintenance</span>
                    <Badge className="bg-blue-100 text-blue-800">Info</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}