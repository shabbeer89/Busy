"use client"

export interface OfflineData {
  matches: any[]
  ideas: any[]
  messages: any[]
  userProfile: any
  timestamp: number
  version: string
}

export interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  lastSync: number | null
  pendingChanges: number
  error: string | null
}

export class OfflineManager {
  private dbName = 'StrategicPartnershipDB'
  private dbVersion = 1
  private db: IDBDatabase | null = null
  private syncInProgress = false
  private isBrowser: boolean

  constructor() {
    // Check if we're in a browser environment
    this.isBrowser = typeof window !== 'undefined' && typeof indexedDB !== 'undefined'

    if (this.isBrowser) {
      this.initializeDB()
      this.setupOnlineStatusListener()
    }
  }

  private async initializeDB(): Promise<void> {
    if (!this.isBrowser) {
      console.warn('OfflineManager: IndexedDB not available in this environment')
      return
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores for different data types
        if (!db.objectStoreNames.contains('matches')) {
          const matchesStore = db.createObjectStore('matches', { keyPath: 'id' })
          matchesStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        if (!db.objectStoreNames.contains('ideas')) {
          const ideasStore = db.createObjectStore('ideas', { keyPath: 'id' })
          ideasStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        if (!db.objectStoreNames.contains('messages')) {
          const messagesStore = db.createObjectStore('messages', { keyPath: 'id' })
          messagesStore.createIndex('conversationId', 'conversationId', { unique: false })
          messagesStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        if (!db.objectStoreNames.contains('userProfile')) {
          db.createObjectStore('userProfile', { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains('pendingChanges')) {
          const pendingStore = db.createObjectStore('pendingChanges', { keyPath: 'id', autoIncrement: true })
          pendingStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        if (!db.objectStoreNames.contains('syncStatus')) {
          db.createObjectStore('syncStatus', { keyPath: 'key' })
        }
      }
    })
  }

  private setupOnlineStatusListener(): void {
    if (!this.isBrowser) {
      return // Don't set up listeners if not in browser environment
    }

    // Listen for online/offline status changes
    window.addEventListener('online', () => {
      console.log('🔌 Back online - starting sync...')
      this.syncWhenOnline()
    })

    window.addEventListener('offline', () => {
      console.log('📴 Gone offline - enabling offline mode')
    })
  }

  // Check if browser is online
  isOnline(): boolean {
    if (!this.isBrowser) {
      return true // Assume online if not in browser environment
    }
    return navigator.onLine
  }

  // Store data for offline access
  async storeData<T>(storeName: string, data: T | T[]): Promise<void> {
    if (!this.isBrowser) {
      console.warn(`OfflineManager: Cannot store data in ${storeName} - not in browser environment`)
      return
    }

    if (!this.db) await this.initializeDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)

      if (Array.isArray(data)) {
        data.forEach(item => {
          store.put({ ...item, timestamp: Date.now() })
        })
      } else {
        store.put({ ...data, timestamp: Date.now() })
      }
    })
  }

  // Retrieve data from offline storage
  async getData<T>(storeName: string, id?: string): Promise<T | T[]> {
    if (!this.isBrowser) {
      console.warn(`OfflineManager: Cannot get data from ${storeName} - not in browser environment`)
      return id ? null as T : [] as T[]
    }

    if (!this.db) await this.initializeDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)

      if (id) {
        const request = store.get(id)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      } else {
        const request = store.getAll()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      }
    })
  }

  // Store user profile for offline access
  async storeUserProfile(profile: any): Promise<void> {
    await this.storeData('userProfile', { id: 'current', ...profile })
  }

  // Get user profile from offline storage
  async getUserProfile(): Promise<any> {
    try {
      return await this.getData('userProfile', 'current')
    } catch {
      return null
    }
  }

  // Store matches for offline access
  async storeMatches(matches: any[]): Promise<void> {
    await this.storeData('matches', matches)
  }

  // Get matches from offline storage
  async getMatches(): Promise<any[]> {
    try {
      return await this.getData('matches')
    } catch {
      return []
    }
  }

  // Store ideas for offline access
  async storeIdeas(ideas: any[]): Promise<void> {
    await this.storeData('ideas', ideas)
  }

  // Get ideas from offline storage
  async getIdeas(): Promise<any[]> {
    try {
      return await this.getData('ideas')
    } catch {
      return []
    }
  }

  // Store messages for offline access
  async storeMessages(messages: any[]): Promise<void> {
    await this.storeData('messages', messages)
  }

  // Get messages from offline storage
  async getMessages(): Promise<any[]> {
    try {
      return await this.getData('messages')
    } catch {
      return []
    }
  }

  // Store pending changes for later sync
  async storePendingChange(change: {
    type: 'create' | 'update' | 'delete'
    table: string
    data: any
    timestamp: number
  }): Promise<void> {
    await this.storeData('pendingChanges', change)
  }

  // Get all pending changes
  async getPendingChanges(): Promise<any[]> {
    try {
      return await this.getData('pendingChanges')
    } catch {
      return []
    }
  }

  // Clear pending changes after successful sync
  async clearPendingChanges(): Promise<void> {
    if (!this.isBrowser) {
      console.warn('OfflineManager: Cannot clear pending changes - not in browser environment')
      return
    }

    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingChanges'], 'readwrite')
      const store = transaction.objectStore('pendingChanges')
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Sync data when coming back online
  async syncWhenOnline(): Promise<void> {
    if (!this.isOnline() || this.syncInProgress) return

    this.syncInProgress = true
    console.log('🔄 Starting background sync...')

    try {
      const pendingChanges = await this.getPendingChanges()

      if (pendingChanges.length > 0) {
        console.log(`📡 Syncing ${pendingChanges.length} pending changes...`)

        // In a real implementation, this would sync with your backend
        // For now, we'll just clear the pending changes as a demonstration
        await this.clearPendingChanges()

        console.log('✅ Background sync completed')
      }

      // Refresh cached data if needed
      await this.refreshCachedData()

    } catch (error) {
      console.error('❌ Background sync failed:', error)
    } finally {
      this.syncInProgress = false
    }
  }

  private async refreshCachedData(): Promise<void> {
    // In a real implementation, this would fetch fresh data from the API
    // and update the offline cache
    console.log('🔄 Refreshing cached data...')
  }

  // Get sync status
  async getSyncStatus(): Promise<SyncStatus> {
    const pendingChanges = await this.getPendingChanges()

    return {
      isOnline: this.isOnline(),
      isSyncing: this.syncInProgress,
      lastSync: await this.getLastSyncTime(),
      pendingChanges: pendingChanges.length,
      error: null,
    }
  }

  private async getLastSyncTime(): Promise<number | null> {
    try {
      const status = await this.getData('syncStatus', 'lastSync') as any
      return status?.timestamp || null
    } catch {
      return null
    }
  }

  async setLastSyncTime(): Promise<void> {
    await this.storeData('syncStatus', {
      key: 'lastSync',
      timestamp: Date.now()
    })
  }

  // Cache management
  async clearCache(storeName?: string): Promise<void> {
    if (!this.isBrowser) {
      console.warn('OfflineManager: Cannot clear cache - not in browser environment')
      return
    }

    if (!this.db) return

    const storesToClear = storeName ? [storeName] : ['matches', 'ideas', 'messages', 'userProfile']

    await Promise.all(
      storesToClear.map(storeName =>
        new Promise<void>((resolve, reject) => {
          const transaction = this.db!.transaction([storeName], 'readwrite')
          const store = transaction.objectStore(storeName)
          const request = store.clear()

          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        })
      )
    )
  }

  // Get storage usage information
  async getStorageInfo(): Promise<{
    used: number
    available: number
    percentage: number
  }> {
    if (!this.isBrowser) {
      console.warn('OfflineManager: Cannot get storage info - not in browser environment')
      return { used: 0, available: 0, percentage: 0 }
    }

    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate()
        const used = estimate.usage || 0
        const quota = estimate.quota || 0
        const available = quota - used
        const percentage = quota > 0 ? (used / quota) * 100 : 0

        return { used, available, percentage }
      } catch {
        // Fallback for browsers that don't support storage estimation
        return { used: 0, available: 0, percentage: 0 }
      }
    }

    return { used: 0, available: 0, percentage: 0 }
  }

  // Cleanup old cached data
  async cleanupOldData(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.isBrowser) {
      console.warn('OfflineManager: Cannot cleanup old data - not in browser environment')
      return
    }

    if (!this.db) return

    const cutoffTime = Date.now() - maxAge

    const stores = ['matches', 'ideas', 'messages']

    await Promise.all(
      stores.map(storeName =>
        new Promise<void>((resolve, reject) => {
          const transaction = this.db!.transaction([storeName], 'readwrite')
          const store = transaction.objectStore(storeName)
          const index = store.index('timestamp')
          const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime))

          request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result
            if (cursor) {
              cursor.delete()
              cursor.continue()
            }
          }

          transaction.oncomplete = () => resolve()
          transaction.onerror = () => reject(transaction.error)
        })
      )
    )
  }
}

// Export singleton instance
export const offlineManager = new OfflineManager()