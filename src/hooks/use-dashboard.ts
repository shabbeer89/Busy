"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useTenant } from '@/contexts/tenant-context'
import { dashboardService, DashboardStats, PlatformStats } from '@/services/dashboard-service'
import { createClient } from '@/lib/supabase-client'

interface UseDashboardProps {
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useDashboard({
  autoRefresh = true,
  refreshInterval = 5 * 60 * 1000, // 5 minutes
}: UseDashboardProps = {}) {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const { user } = useAuth()
  const { tenant } = useTenant()
  const supabase = createClient()

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!user) {
      setDashboardStats(null)
      setPlatformStats(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch dashboard statistics
      const stats = await dashboardService.getDashboardStats(user.id, user.userType)
      setDashboardStats(stats)

      // Fetch platform statistics
      const platformData = await dashboardService.getPlatformStats()
      setPlatformStats(platformData)

      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Set up real-time subscriptions for data changes
  useEffect(() => {
    if (!user || !autoRefresh || !tenant) return

    // Initial load
    loadDashboardData()

    // Set up subscriptions for real-time updates
    const subscriptions = [
      // Subscribe to matches changes
      supabase
        .channel('matches_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'matches',
          },
          () => {
            // Refresh dashboard data when matches change
            setTimeout(() => loadDashboardData(), 1000)
          }
        )
        .subscribe(),

      // Subscribe to business ideas changes
      supabase
        .channel('business_ideas_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'business_ideas',
          },
          () => {
            // Refresh dashboard data when ideas change
            setTimeout(() => loadDashboardData(), 1000)
          }
        )
        .subscribe(),

      // Subscribe to investment offers changes
      supabase
        .channel('investment_offers_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'investment_offers',
          },
          () => {
            // Refresh dashboard data when offers change
            setTimeout(() => loadDashboardData(), 1000)
          }
        )
        .subscribe(),
    ]

    // Set up periodic refresh
    const refreshIntervalId = setInterval(() => {
      loadDashboardData()
    }, refreshInterval)

    // Cleanup function
    return () => {
      subscriptions.forEach(sub => sub.unsubscribe())
      clearInterval(refreshIntervalId)
    }
  }, [user, autoRefresh, refreshInterval, tenant, supabase, loadDashboardData])

  // Manual refresh function
  const refreshDashboard = useCallback(() => {
    return loadDashboardData()
  }, [loadDashboardData])

  return {
    dashboardStats,
    platformStats,
    isLoading,
    error,
    lastUpdated,
    refreshDashboard,
  }
}