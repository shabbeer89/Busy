"use client"

import { useState, useEffect, useCallback } from 'react'

export interface NotificationPreferences {
  matches: boolean
  messages: boolean
  opportunities: boolean
  recommendations: boolean
  marketing: boolean
  sound: boolean
  desktop: boolean
  mobile: boolean
}

export interface NotificationItem {
  id: string
  type: 'match' | 'message' | 'opportunity' | 'recommendation' | 'system'
  title: string
  body: string
  icon?: string
  image?: string
  data?: any
  timestamp: number
  read: boolean
  urgent?: boolean
}

export function useNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    matches: true,
    messages: true,
    opportunities: true,
    recommendations: true,
    marketing: false,
    sound: true,
    desktop: true,
    mobile: true,
  })

  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  // Check browser support
  useEffect(() => {
    const supported = 'Notification' in window
    setIsSupported(supported)

    if (supported) {
      setHasPermission(Notification.permission === 'granted')
    }
  }, [])

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('notification-preferences')
      if (stored) {
        setPreferences(prev => ({ ...prev, ...JSON.parse(stored) }))
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error)
    }
  }, [])

  // Save preferences to localStorage
  const savePreferences = useCallback((newPreferences: Partial<NotificationPreferences>) => {
    const updated = { ...preferences, ...newPreferences }
    setPreferences(updated)

    try {
      localStorage.setItem('notification-preferences', JSON.stringify(updated))
    } catch (error) {
      console.error('Error saving notification preferences:', error)
    }
  }, [preferences])

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false

    try {
      const permission = await Notification.requestPermission()
      const granted = permission === 'granted'

      setHasPermission(granted)
      return granted
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }, [isSupported])

  // Show notification
  const showNotification = useCallback(async (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    if (!hasPermission || !preferences[notification.type === 'match' ? 'matches' : notification.type === 'message' ? 'messages' : notification.type === 'opportunity' ? 'opportunities' : 'recommendations']) {
      return
    }

    const fullNotification: NotificationItem = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false,
    }

    // Add to notifications list
    setNotifications(prev => [fullNotification, ...prev.slice(0, 19)]) // Keep only 20 recent notifications

    // Show browser notification
    if (isSupported && Notification.permission === 'granted') {
      try {
        const browserNotification = new Notification(notification.title, {
          body: notification.body,
          icon: notification.icon || '/icons/notification-icon.png',
          tag: fullNotification.id,
          requireInteraction: notification.urgent || false,
          silent: !preferences.sound,
        })

        // Handle click
        browserNotification.onclick = () => {
          markAsRead(fullNotification.id)
          handleNotificationClick(notification.type, notification.data)
          browserNotification.close()
        }

        // Auto-close after 5 seconds unless urgent
        if (!notification.urgent) {
          setTimeout(() => {
            browserNotification.close()
          }, 5000)
        }
      } catch (error) {
        console.error('Error showing notification:', error)
      }
    }
  }, [hasPermission, preferences, isSupported])

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    )
  }, [])

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    )
  }, [])

  // Clear notification
  const clearNotification = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    )
  }, [])

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Handle notification click navigation
  const handleNotificationClick = useCallback((type: string, data?: any) => {
    switch (type) {
      case 'match':
        window.location.href = '/matches'
        break
      case 'message':
        window.location.href = '/messages'
        break
      case 'opportunity':
        window.location.href = '/ideas'
        break
      case 'recommendation':
        window.location.href = '/dashboard'
        break
      default:
        window.location.href = '/dashboard'
    }
  }, [])

  // Convenience methods for different notification types
  const notifyMatch = useCallback((matchData: { title: string; description: string; matchId: string }) => {
    showNotification({
      type: 'match',
      title: 'New Match Found! 🎯',
      body: matchData.title,
      data: { matchId: matchData.matchId },
      urgent: false,
    })
  }, [showNotification])

  const notifyMessage = useCallback((messageData: { sender: string; content: string; conversationId: string }) => {
    showNotification({
      type: 'message',
      title: `New message from ${messageData.sender}`,
      body: messageData.content,
      data: { conversationId: messageData.conversationId },
      urgent: false,
    })
  }, [showNotification])

  const notifyOpportunity = useCallback((opportunityData: { title: string; description: string; ideaId: string }) => {
    showNotification({
      type: 'opportunity',
      title: 'New Investment Opportunity 💡',
      body: opportunityData.title,
      data: { ideaId: opportunityData.ideaId },
      urgent: false,
    })
  }, [showNotification])

  const notifyRecommendation = useCallback((recommendationData: { title: string; reason: string }) => {
    showNotification({
      type: 'recommendation',
      title: 'AI Recommendation Available 🤖',
      body: recommendationData.title,
      data: { reason: recommendationData.reason },
      urgent: false,
    })
  }, [showNotification])

  return {
    // State
    isSupported,
    hasPermission,
    preferences,
    notifications,

    // Actions
    requestPermission,
    savePreferences,
    showNotification,

    // Convenience methods
    notifyMatch,
    notifyMessage,
    notifyOpportunity,
    notifyRecommendation,

    // Notification management
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,

    // Computed values
    unreadCount: notifications.filter(n => !n.read).length,
    recentNotifications: notifications.slice(0, 5),
  }
}