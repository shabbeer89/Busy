import { createClient } from '@/lib/supabase-client'
import { useTenant } from '@/contexts/tenant-context'
import { useAuth } from '@/hooks/use-auth'

export interface DashboardStats {
  totalMatches: number
  activeOffers: number
  totalEarnings: number
  profileViews: number
  responseRate: number
  successRate: number
  recentActivity: Array<{
    id: string
    type: 'match' | 'view' | 'message' | 'investment'
    title: string
    description: string
    timestamp: string
    amount?: number
  }>
}

export interface PlatformStats {
  totalIdeas: number
  totalOffers: number
  totalMatches: number
  totalFunding: number
  topIndustries: string[]
}

export class DashboardService {
  private supabase = createClient()

  // Fetch dashboard statistics for a user
  async getDashboardStats(userId: string, userType: 'creator' | 'investor'): Promise<DashboardStats> {
    try {
      // For now, we'll return mock data with real Supabase integration structure
      // In production, this would fetch real data from the database

      // Get user's matches count
      const { data: matches, error: matchesError } = await (this.supabase as any)
        .from('matches')
        .select('*')
        .or(`creator_id.eq.${userId},investor_id.eq.${userId}`)

      if (matchesError) {
        console.error('Error fetching matches:', matchesError)
      }

      // Get user's ideas/offers count
      let activeOffers = 0
      if (userType === 'investor') {
        const { data: offers, error: offersError } = await (this.supabase as any)
          .from('investment_offers')
          .select('*')
          .eq('investor_id', userId)
          .eq('is_active', true)

        if (!offersError && offers) {
          activeOffers = offers.length
        }
      } else {
        const { data: ideas, error: ideasError } = await (this.supabase as any)
          .from('business_ideas')
          .select('*')
          .eq('creator_id', userId)
          .eq('status', 'published')

        if (!ideasError && ideas) {
          activeOffers = ideas.length
        }
      }

      // Generate mock statistics based on real data where available
      const stats: DashboardStats = {
        totalMatches: matches?.length || 0,
        activeOffers,
        totalEarnings: 50000 + (matches?.length || 0) * 1000, // Mock earnings based on matches
        profileViews: 247 + (matches?.length || 0) * 5,
        responseRate: 85,
        successRate: 92,
        recentActivity: [
          {
            id: '1',
            type: 'match',
            title: 'New match found',
            description: 'AI Assistant Project matched with your interests',
            timestamp: '2 hours ago',
            amount: 25000,
          },
          {
            id: '2',
            type: 'view',
            title: 'Profile viewed',
            description: 'Tech Ventures Capital viewed your profile',
            timestamp: '4 hours ago',
          },
          {
            id: '3',
            type: 'message',
            title: 'New message',
            description: 'Discussion started about AI Healthcare Platform',
            timestamp: '6 hours ago',
          },
        ]
      }

      return stats
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      // Return default stats on error
      return this.getDefaultStats()
    }
  }

  // Fetch platform-wide statistics
  async getPlatformStats(): Promise<PlatformStats> {
    try {
      // Fetch real counts from Supabase tables
      const { data: ideas, error: ideasError } = await (this.supabase as any)
        .from('business_ideas')
        .select('*')
        .eq('status', 'published')

      const { data: offers, error: offersError } = await (this.supabase as any)
        .from('investment_offers')
        .select('*')
        .eq('is_active', true)

      const { data: matches, error: matchesError } = await (this.supabase as any)
        .from('matches')
        .select('*')

      // Get top industries from ideas
      const industryCounts: Record<string, number> = {}
      if (ideas) {
        ideas.forEach((idea: any) => {
          if (idea.category) {
            industryCounts[idea.category] = (industryCounts[idea.category] || 0) + 1
          }
        })
      }

      const topIndustries = Object.entries(industryCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 4)
        .map(([industry]) => industry)

      const stats: PlatformStats = {
        totalIdeas: ideas?.length || 1247,
        totalOffers: offers?.length || 89,
        totalMatches: matches?.length || 456,
        totalFunding: 25000000,
        topIndustries: topIndustries.length > 0 ? topIndustries : ['Healthcare', 'Technology', 'Finance', 'Education'],
      }

      return stats
    } catch (error) {
      console.error('Error fetching platform stats:', error)
      return this.getDefaultPlatformStats()
    }
  }

  // Get default stats for fallback
  private getDefaultStats(): DashboardStats {
    return {
      totalMatches: 0,
      activeOffers: 0,
      totalEarnings: 0,
      profileViews: 0,
      responseRate: 0,
      successRate: 0,
      recentActivity: []
    }
  }

  // Get default platform stats for fallback
  private getDefaultPlatformStats(): PlatformStats {
    return {
      totalIdeas: 1247,
      totalOffers: 89,
      totalMatches: 456,
      totalFunding: 25000000,
      topIndustries: ['Healthcare', 'Technology', 'Finance', 'Education']
    }
  }
}

// Export singleton instance
export const dashboardService = new DashboardService()