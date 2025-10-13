"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Layout } from '@/components/responsive/layout'
import { useNotifications } from '@/hooks/use-notifications'
import { cn } from '@/lib/utils'
import {
  Bell,
  BellOff,
  Settings,
  Trash2,
  Check,
  CheckCheck,
  AlertCircle,
  MessageSquare,
  Target,
  Lightbulb,
  Info,
  Volume2,
  VolumeX,
  Monitor,
  Smartphone,
} from 'lucide-react'

interface NotificationCenterProps {
  className?: string
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const {
    isSupported,
    hasPermission,
    preferences,
    notifications,
    requestPermission,
    savePreferences,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    unreadCount,
    recentNotifications,
  } = useNotifications()

  const [showPreferences, setShowPreferences] = useState(false)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <Target className="h-4 w-4 text-blue-500" />
      case 'message':
        return <MessageSquare className="h-4 w-4 text-green-500" />
      case 'opportunity':
        return <Lightbulb className="h-4 w-4 text-yellow-500" />
      case 'recommendation':
        return <Info className="h-4 w-4 text-purple-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp

    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return new Date(timestamp).toLocaleDateString()
  }

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <BellOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">Notifications Not Supported</h3>
          <p className="text-sm text-muted-foreground">
            Your browser doesn't support push notifications.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications
          </h2>
          <p className="text-muted-foreground">
            Manage your notification preferences and view recent alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={hasPermission ? "default" : "secondary"}>
            {hasPermission ? 'Enabled' : 'Disabled'}
          </Badge>

          {!hasPermission && (
            <Button onClick={requestPermission} size="sm">
              Enable Notifications
            </Button>
          )}
        </div>
      </div>

      {/* Notification Preferences */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreferences(!showPreferences)}
            >
              {showPreferences ? 'Hide' : 'Show'} Settings
            </Button>
          </div>
        </CardHeader>

        {showPreferences && (
          <CardContent className="space-y-6">
            {/* Notification Types */}
            <div className="space-y-4">
              <h4 className="font-medium">Notification Types</h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">New Matches</span>
                  </div>
                  <Switch
                    checked={preferences.matches}
                    onCheckedChange={(checked) => savePreferences({ matches: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Messages</span>
                  </div>
                  <Switch
                    checked={preferences.messages}
                    onCheckedChange={(checked) => savePreferences({ messages: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Investment Opportunities</span>
                  </div>
                  <Switch
                    checked={preferences.opportunities}
                    onCheckedChange={(checked) => savePreferences({ opportunities: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">AI Recommendations</span>
                  </div>
                  <Switch
                    checked={preferences.recommendations}
                    onCheckedChange={(checked) => savePreferences({ recommendations: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Marketing Updates</span>
                  </div>
                  <Switch
                    checked={preferences.marketing}
                    onCheckedChange={(checked) => savePreferences({ marketing: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Delivery Preferences */}
            <div className="space-y-4">
              <h4 className="font-medium">Delivery Options</h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Sound Notifications</span>
                  </div>
                  <Switch
                    checked={preferences.sound}
                    onCheckedChange={(checked) => savePreferences({ sound: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Desktop Notifications</span>
                  </div>
                  <Switch
                    checked={preferences.desktop}
                    onCheckedChange={(checked) => savePreferences({ desktop: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Mobile Notifications</span>
                  </div>
                  <Switch
                    checked={preferences.mobile}
                    onCheckedChange={(checked) => savePreferences({ mobile: checked })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Notifications</CardTitle>
              <CardDescription>
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All notifications read'}
              </CardDescription>
            </div>

            {notifications.length > 0 && (
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={markAllAsRead}>
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Mark All Read
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={clearAllNotifications}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No notifications yet</h3>
              <p className="text-sm text-muted-foreground">
                Notifications about matches, messages, and opportunities will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                    !notification.read
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                      : "bg-muted/30 border-border"
                  )}
                >
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.body}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>

                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="px-2"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearNotification(notification.id)}
                      className="px-2"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}

              {notifications.length > 10 && (
                <div className="text-center pt-4">
                  <Button variant="outline">
                    View All Notifications
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
            <div className="text-sm text-muted-foreground">Unread</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{notifications.length}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {notifications.filter(n => n.type === 'match').length}
            </div>
            <div className="text-sm text-muted-foreground">Matches</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {notifications.filter(n => n.type === 'message').length}
            </div>
            <div className="text-sm text-muted-foreground">Messages</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Notification Bell Component for Navigation
interface NotificationBellProps {
  onClick?: () => void
  className?: string
}

export function NotificationBell({ onClick, className }: NotificationBellProps) {
  const { hasPermission, unreadCount } = useNotifications()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn("relative", className)}
    >
      {hasPermission ? (
        <Bell className="h-5 w-5" />
      ) : (
        <BellOff className="h-5 w-5" />
      )}

      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  )
}

// Test Notification Button (for development)
export function TestNotificationButton() {
  const { showNotification, notifyMatch, notifyMessage, notifyOpportunity } = useNotifications()

  const sendTestNotification = () => {
    notifyMatch({
      title: 'Test Match Found',
      description: 'AI-powered healthcare platform',
      matchId: 'test-match-1'
    })
  }

  return (
    <Button onClick={sendTestNotification} variant="outline" size="sm">
      Test Notification
    </Button>
  )
}
