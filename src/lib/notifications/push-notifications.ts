"use client"

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

export interface NotificationData {
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

export class PushNotificationManager {
  private registration: ServiceWorkerRegistration | null = null
  private preferences: NotificationPreferences = {
    matches: true,
    messages: true,
    opportunities: true,
    recommendations: true,
    marketing: false,
    sound: true,
    desktop: true,
    mobile: true,
  }

  constructor() {
    this.initializeNotificationSystem()
  }

  private async initializeNotificationSystem() {
    if ('serviceWorker' in navigator) {
      try {
        // Register service worker for push notifications
        this.registration = await navigator.serviceWorker.register('/sw.js')

        // Load user preferences
        await this.loadNotificationPreferences()

        console.log('🔔 Push notification system initialized')
      } catch (error) {
        console.error('Failed to initialize push notifications:', error)
      }
    }
  }

  private async loadNotificationPreferences() {
    try {
      // Load preferences from localStorage or user profile
      const stored = localStorage.getItem('notification-preferences')
      if (stored) {
        this.preferences = { ...this.preferences, ...JSON.parse(stored) }
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error)
    }
  }

  async saveNotificationPreferences(preferences: Partial<NotificationPreferences>) {
    this.preferences = { ...this.preferences, ...preferences }

    try {
      localStorage.setItem('notification-preferences', JSON.stringify(this.preferences))

      // In a real app, also save to backend
      // await supabase.from('user_preferences').upsert({
      //   user_id: currentUser.id,
      //   notification_preferences: this.preferences
      // })

      console.log('🔔 Notification preferences saved')
    } catch (error) {
      console.error('Error saving notification preferences:', error)
    }
  }

  getNotificationPreferences(): NotificationPreferences {
    return { ...this.preferences }
  }

  async requestPermission(): Promise<boolean> {
    try {
      if (!('Notification' in window)) {
        console.warn('Browser does not support notifications')
        return false
      }

      const permission = await Notification.requestPermission()

      if (permission === 'granted') {
        console.log('🔔 Notification permission granted')
        return true
      } else {
        console.log('❌ Notification permission denied')
        return false
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }

  async subscribeToPushNotifications(): Promise<boolean> {
    try {
      if (!this.registration) {
        console.warn('Service worker not registered')
        return false
      }

      const permissionGranted = await this.requestPermission()
      if (!permissionGranted) {
        return false
      }

      // Create subscription for push notifications
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        )
      })

      // Send subscription to backend
      await this.sendSubscriptionToBackend(subscription)

      console.log('🔔 Push notifications subscribed')
      return true
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      return false
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  private async sendSubscriptionToBackend(subscription: PushSubscription) {
    try {
      // In a real app, send to your backend
      console.log('📡 Push subscription:', subscription)

      // Example backend call:
      // await supabase.from('push_subscriptions').upsert({
      //   user_id: currentUser.id,
      //   subscription: subscription.toJSON(),
      //   created_at: new Date().toISOString()
      // })
    } catch (error) {
      console.error('Error sending subscription to backend:', error)
    }
  }

  async showNotification(notification: NotificationData): Promise<void> {
    try {
      // Check if notification type is enabled
      if (!this.isNotificationTypeEnabled(notification.type)) {
        return
      }

      // Check if browser notifications are supported and permitted
      if (!('Notification' in window) || Notification.permission !== 'granted') {
        console.warn('Notifications not supported or permitted')
        return
      }

      // Show browser notification
      const browserNotification = new Notification(notification.title, {
        body: notification.body,
        icon: notification.icon || '/icons/notification-icon.png',
        image: notification.image,
        tag: notification.id,
        requireInteraction: notification.urgent || false,
        silent: !this.preferences.sound,
        data: notification.data,
      })

      // Handle notification click
      browserNotification.onclick = () => {
        // Mark as read and navigate to relevant page
        this.markNotificationAsRead(notification.id)

        // Navigate based on notification type
        this.handleNotificationClick(notification)

        browserNotification.close()
      }

      // Auto-close after 5 seconds unless urgent
      if (!notification.urgent) {
        setTimeout(() => {
          browserNotification.close()
        }, 5000)
      }

      console.log('🔔 Notification shown:', notification.title)
    } catch (error) {
      console.error('Error showing notification:', error)
    }
  }

  private isNotificationTypeEnabled(type: string): boolean {
    switch (type) {
      case 'match':
        return this.preferences.matches
      case 'message':
        return this.preferences.messages
      case 'opportunity':
        return this.preferences.opportunities
      case 'recommendation':
        return this.preferences.recommendations
      case 'system':
        return this.preferences.marketing
      default:
        return false
    }
  }

  private handleNotificationClick(notification: NotificationData) {
    // Navigate to appropriate page based on notification type
    switch (notification.type) {
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
  }

  private markNotificationAsRead(notificationId: string) {
    // In a real app, update the notification status in backend
    console.log('📖 Notification marked as read:', notificationId)
  }

  // Convenience methods for different notification types
  async notifyMatch(matchData: { title: string; description: string; matchId: string }) {
    await this.showNotification({
      id: `match_${Date.now()}`,
      type: 'match',
      title: 'New Match Found! 🎯',
      body: matchData.title,
      data: { matchId: matchData.matchId },
      timestamp: Date.now(),
      read: false,
      urgent: false,
    })
  }

  async notifyMessage(messageData: { sender: string; content: string; conversationId: string }) {
    await this.showNotification({
      id: `message_${Date.now()}`,
      type: 'message',
      title: `New message from ${messageData.sender}`,
      body: messageData.content,
      data: { conversationId: messageData.conversationId },
      timestamp: Date.now(),
      read: false,
      urgent: false,
    })
  }

  async notifyOpportunity(opportunityData: { title: string; description: string; ideaId: string }) {
    await this.showNotification({
      id: `opportunity_${Date.now()}`,
      type: 'opportunity',
      title: 'New Investment Opportunity 💡',
      body: opportunityData.title,
      data: { ideaId: opportunityData.ideaId },
      timestamp: Date.now(),
      read: false,
      urgent: false,
    })
  }

  async notifyRecommendation(recommendationData: { title: string; reason: string }) {
    await this.showNotification({
      id: `recommendation_${Date.now()}`,
      type: 'recommendation',
      title: 'AI Recommendation Available 🤖',
      body: recommendationData.title,
      data: { reason: recommendationData.reason },
      timestamp: Date.now(),
      read: false,
      urgent: false,
    })
  }

  // Check if notifications are supported and permitted
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator
  }

  hasPermission(): boolean {
    return Notification.permission === 'granted'
  }

  isEnabled(): boolean {
    return this.isSupported() && this.hasPermission()
  }
}

// Export singleton instance
export const notificationManager = new PushNotificationManager()