"use client"

import { useState, useEffect, useCallback } from 'react'
import { offlineManager, type SyncStatus, type OfflineData } from '@/lib/offline/offline-manager'

export function useOffline() {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined'

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: isBrowser ? navigator.onLine : true,
    isSyncing: false,
    lastSync: null,
    pendingChanges: 0,
    error: null,
  })

  const [offlineData, setOfflineData] = useState<OfflineData>({
    matches: [],
    ideas: [],
    messages: [],
    userProfile: null,
    timestamp: Date.now(),
    version: '1.0',
  })

  // Update online status
  useEffect(() => {
    if (!isBrowser) return

    const updateOnlineStatus = () => {
      const newStatus = {
        ...syncStatus,
        isOnline: navigator.onLine,
      }
      setSyncStatus(newStatus)

      // Trigger sync when coming back online
      if (navigator.onLine) {
        syncWhenOnline()
      }
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [syncStatus, isBrowser])

  // Load offline data on mount
  useEffect(() => {
    loadOfflineData()
    loadSyncStatus()
  }, [])

  const loadOfflineData = useCallback(async () => {
    try {
      const [matches, ideas, messages, userProfile] = await Promise.all([
        offlineManager.getMatches(),
        offlineManager.getIdeas(),
        offlineManager.getMessages(),
        offlineManager.getUserProfile(),
      ])

      setOfflineData({
        matches,
        ideas,
        messages,
        userProfile,
        timestamp: Date.now(),
        version: '1.0',
      })
    } catch (error) {
      console.error('Error loading offline data:', error)
    }
  }, [])

  const loadSyncStatus = useCallback(async () => {
    try {
      const status = await offlineManager.getSyncStatus()
      setSyncStatus(status)
    } catch (error) {
      console.error('Error loading sync status:', error)
    }
  }, [])

  const syncWhenOnline = useCallback(async () => {
    if (!isBrowser || !navigator.onLine) return

    setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }))

    try {
      await offlineManager.syncWhenOnline()
      await loadSyncStatus()
      await loadOfflineData()
    } catch (error) {
      console.error('Error during sync:', error)
      setSyncStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sync failed',
        isSyncing: false
      }))
    }
  }, [loadSyncStatus, loadOfflineData, isBrowser])

  const storeDataOffline = useCallback(async (
    type: 'matches' | 'ideas' | 'messages' | 'userProfile',
    data: any
  ) => {
    try {
      switch (type) {
        case 'matches':
          await offlineManager.storeMatches(Array.isArray(data) ? data : [data])
          break
        case 'ideas':
          await offlineManager.storeIdeas(Array.isArray(data) ? data : [data])
          break
        case 'messages':
          await offlineManager.storeMessages(Array.isArray(data) ? data : [data])
          break
        case 'userProfile':
          await offlineManager.storeUserProfile(data)
          break
      }

      // Store pending change for later sync
      await offlineManager.storePendingChange({
        type: 'update',
        table: type,
        data,
        timestamp: Date.now(),
      })

      await loadOfflineData()
      await loadSyncStatus()
    } catch (error) {
      console.error('Error storing data offline:', error)
    }
  }, [loadOfflineData, loadSyncStatus])

  const getOfflineData = useCallback(async (type: 'matches' | 'ideas' | 'messages' | 'userProfile') => {
    try {
      switch (type) {
        case 'matches':
          return await offlineManager.getMatches()
        case 'ideas':
          return await offlineManager.getIdeas()
        case 'messages':
          return await offlineManager.getMessages()
        case 'userProfile':
          return await offlineManager.getUserProfile()
        default:
          return null
      }
    } catch (error) {
      console.error('Error getting offline data:', error)
      return null
    }
  }, [])

  const clearOfflineData = useCallback(async (type?: string) => {
    try {
      if (type) {
        await offlineManager.clearCache(type)
      } else {
        await offlineManager.clearCache()
      }
      await loadOfflineData()
    } catch (error) {
      console.error('Error clearing offline data:', error)
    }
  }, [loadOfflineData])

  const getStorageInfo = useCallback(async () => {
    return await offlineManager.getStorageInfo()
  }, [])

  const cleanupOldData = useCallback(async (maxAgeDays: number = 7) => {
    try {
      await offlineManager.cleanupOldData(maxAgeDays * 24 * 60 * 60 * 1000)
      await loadOfflineData()
    } catch (error) {
      console.error('Error cleaning up old data:', error)
    }
  }, [loadOfflineData])

  return {
    // Status
    isOnline: syncStatus.isOnline,
    isOffline: !syncStatus.isOnline,
    isSyncing: syncStatus.isSyncing,
    syncStatus,

    // Data
    offlineData,
    matches: offlineData.matches,
    ideas: offlineData.ideas,
    messages: offlineData.messages,
    userProfile: offlineData.userProfile,

    // Actions
    storeDataOffline,
    getOfflineData,
    syncWhenOnline,
    clearOfflineData,
    getStorageInfo,
    cleanupOldData,

    // Utility
    refreshData: loadOfflineData,
    refreshStatus: loadSyncStatus,
  }
}