"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { MobileCard } from '@/components/responsive/mobile-layout'
import { useOffline } from '@/hooks/use-offline'
import { cn } from '@/lib/utils'
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Cloud,
  CloudOff,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
} from 'lucide-react'

interface OfflineIndicatorProps {
  className?: string
  showDetails?: boolean
}

export function OfflineIndicator({ className, showDetails = false }: OfflineIndicatorProps) {
  const {
    isOnline,
    isOffline,
    isSyncing,
    syncStatus,
    offlineData,
    syncWhenOnline,
    getStorageInfo,
    clearOfflineData,
  } = useOffline()

  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    available: 0,
    percentage: 0,
  })

  const [showStorageDetails, setShowStorageDetails] = useState(false)

  useEffect(() => {
    const loadStorageInfo = async () => {
      const info = await getStorageInfo()
      setStorageInfo(info)
    }
    loadStorageInfo()
  }, [getStorageInfo])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  if (!showDetails && isOnline) {
    return null
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Connection Status */}
      <MobileCard>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <div className="flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <WifiOff className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium">Offline</span>
                </div>
              )}

              {isSyncing && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Syncing
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isOnline && !isSyncing && syncStatus.pendingChanges > 0 && (
                <Button
                  onClick={syncWhenOnline}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <Upload className="h-3 w-3" />
                  Sync ({syncStatus.pendingChanges})
                </Button>
              )}

              {isOffline && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Offline Mode
                </Badge>
              )}
            </div>
          </div>

          {/* Sync Status Details */}
          {showDetails && (
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={cn(
                    "font-medium",
                    isOnline ? "text-green-600" : "text-red-600"
                  )}>
                    {isOnline ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pending Changes:</span>
                  <span className="font-medium">{syncStatus.pendingChanges}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last Sync:</span>
                  <span className="font-medium">
                    {syncStatus.lastSync
                      ? new Date(syncStatus.lastSync).toLocaleTimeString()
                      : 'Never'
                    }
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Data Cached:</span>
                  <span className="font-medium">
                    {(offlineData.matches.length + offlineData.ideas.length + offlineData.messages.length)} items
                  </span>
                </div>
              </div>

              {/* Storage Information */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Storage Used:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowStorageDetails(!showStorageDetails)}
                    className="text-xs"
                  >
                    {formatBytes(storageInfo.used)} / {formatBytes(storageInfo.available + storageInfo.used)}
                  </Button>
                </div>

                <Progress value={storageInfo.percentage} className="h-2" />

                {showStorageDetails && (
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div className="text-center">
                      <div className="font-medium">{formatBytes(storageInfo.used)}</div>
                      <div>Used</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{formatBytes(storageInfo.available)}</div>
                      <div>Available</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{storageInfo.percentage.toFixed(1)}%</div>
                      <div>Full</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Offline Actions */}
              {isOffline && (
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={syncWhenOnline}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Cloud className="h-3 w-3 mr-2" />
                    Sync When Online
                  </Button>
                  <Button
                    onClick={() => clearOfflineData()}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Database className="h-3 w-3 mr-2" />
                    Clear Cache
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </MobileCard>

      {/* Offline Mode Benefits */}
      {isOffline && (
        <MobileCard>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm mb-1">Offline Mode Active</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  You can still access your cached data and make changes that will sync when you're back online.
                </p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span>View cached matches and ideas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span>Read messages offline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span>Changes saved for later sync</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </MobileCard>
      )}

      {/* Sync Error */}
      {syncStatus.error && (
        <MobileCard>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm text-red-600 dark:text-red-400">
                  Sync Error
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {syncStatus.error}
                </p>
                <Button
                  onClick={syncWhenOnline}
                  size="sm"
                  variant="outline"
                  className="mt-2"
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Retry Sync
                </Button>
              </div>
            </div>
          </CardContent>
        </MobileCard>
      )}
    </div>
  )
}

// Floating Offline Indicator for Navigation
interface FloatingOfflineIndicatorProps {
  className?: string
}

export function FloatingOfflineIndicator({ className }: FloatingOfflineIndicatorProps) {
  const { isOnline, isSyncing, syncStatus } = useOffline()

  if (isOnline && !isSyncing) return null

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50",
      className
    )}>
      <Card className="shadow-lg border-2 border-orange-200 dark:border-orange-800">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            {isSyncing ? (
              <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <div className="text-sm">
              <div className="font-medium">
                {isSyncing ? 'Syncing...' : 'Offline'}
              </div>
              {syncStatus.pendingChanges > 0 && (
                <div className="text-xs text-muted-foreground">
                  {syncStatus.pendingChanges} changes pending
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}