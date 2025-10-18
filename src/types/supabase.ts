export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone_number: string | null
          avatar: string | null
          user_type: 'creator' | 'investor'
          is_verified: boolean
          phone_verified: boolean | null
          oauth_id: string | null
          provider: string | null
          created_at: string
          updated_at: string

          // Creator specific fields
          company_name: string | null
          industry: string | null
          experience: string | null

          // Investor specific fields
          investment_range: {
            min: number
            max: number
          } | null
          preferred_industries: string[] | null
          risk_tolerance: 'low' | 'medium' | 'high' | null

          // Common fields
          bio: string | null
          location: string | null
          website: string | null
          social_links: {
            linkedin?: string
            twitter?: string
          } | null
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone_number?: string | null
          avatar?: string | null
          user_type: 'creator' | 'investor'
          is_verified?: boolean
          phone_verified?: boolean | null
          oauth_id?: string | null
          provider?: string | null
          created_at?: string
          updated_at?: string

          // Creator specific fields
          company_name?: string | null
          industry?: string | null
          experience?: string | null

          // Investor specific fields
          investment_range?: {
            min: number
            max: number
          } | null
          preferred_industries?: string[] | null
          risk_tolerance?: 'low' | 'medium' | 'high' | null

          // Common fields
          bio?: string | null
          location?: string | null
          website?: string | null
          social_links?: {
            linkedin?: string
            twitter?: string
          } | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone_number?: string | null
          avatar?: string | null
          user_type?: 'creator' | 'investor'
          is_verified?: boolean
          phone_verified?: boolean | null
          oauth_id?: string | null
          provider?: string | null
          created_at?: string
          updated_at?: string

          // Creator specific fields
          company_name?: string | null
          industry?: string | null
          experience?: string | null

          // Investor specific fields
          investment_range?: {
            min: number
            max: number
          } | null
          preferred_industries?: string[] | null
          risk_tolerance?: 'low' | 'medium' | 'high' | null

          // Common fields
          bio?: string | null
          location?: string | null
          website?: string | null
          social_links?: {
            linkedin?: string
            twitter?: string
          } | null
        }
      }

      business_ideas: {
        Row: {
          id: string
          creator_id: string
          title: string
          description: string
          category: string
          tags: string[]

          // Financial details
          funding_goal: number
          current_funding: number
          equity_offered: number
          valuation: number | null

          // Project details
          stage: 'concept' | 'mvp' | 'early' | 'growth'
          timeline: string
          team_size: number | null

          // Media
          images: string[] | null
          documents: string[] | null
          video_url: string | null

          // Status
          status: 'draft' | 'published' | 'funded' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          title: string
          description: string
          category: string
          tags?: string[]

          // Financial details
          funding_goal: number
          current_funding?: number
          equity_offered: number
          valuation?: number | null

          // Project details
          stage: 'concept' | 'mvp' | 'early' | 'growth'
          timeline: string
          team_size?: number | null

          // Media
          images?: string[] | null
          documents?: string[] | null
          video_url?: string | null

          // Status
          status?: 'draft' | 'published' | 'funded' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          title?: string
          description?: string
          category?: string
          tags?: string[]

          // Financial details
          funding_goal?: number
          current_funding?: number
          equity_offered?: number
          valuation?: number | null

          // Project details
          stage?: 'concept' | 'mvp' | 'early' | 'growth'
          timeline?: string
          team_size?: number | null

          // Media
          images?: string[] | null
          documents?: string[] | null
          video_url?: string | null

          // Status
          status?: 'draft' | 'published' | 'funded' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }

      investment_offers: {
        Row: {
          id: string
          investor_id: string
          title: string
          description: string

          // Investment details
          amount_range: {
            min: number
            max: number
          }
          preferred_equity: {
            min: number
            max: number
          }

          // Preferences
          preferred_stages: string[]
          preferred_industries: string[]
          geographic_preference: string | null

          // Terms
          investment_type: 'equity' | 'debt' | 'convertible'
          timeline: string | null

          // Status
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          investor_id: string
          title: string
          description: string

          // Investment details
          amount_range: {
            min: number
            max: number
          }
          preferred_equity: {
            min: number
            max: number
          }

          // Preferences
          preferred_stages?: string[]
          preferred_industries?: string[]
          geographic_preference?: string | null

          // Terms
          investment_type: 'equity' | 'debt' | 'convertible'
          timeline?: string | null

          // Status
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          investor_id?: string
          title?: string
          description?: string

          // Investment details
          amount_range?: {
            min: number
            max: number
          }
          preferred_equity?: {
            min: number
            max: number
          }

          // Preferences
          preferred_stages?: string[]
          preferred_industries?: string[]
          geographic_preference?: string | null

          // Terms
          investment_type?: 'equity' | 'debt' | 'convertible'
          timeline?: string | null

          // Status
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      matches: {
        Row: {
          id: string
          idea_id: string
          investor_id: string
          creator_id: string
          offer_id: string

          // Match details
          match_score: number
          matching_factors: {
            amountCompatibility: number
            industryAlignment: number
            stagePreference: number
            riskAlignment: number
          }

          // Status
          status: 'suggested' | 'viewed' | 'contacted' | 'negotiating' | 'invested' | 'rejected'

          // Communication
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          investor_id: string
          creator_id: string
          offer_id: string

          // Match details
          match_score: number
          matching_factors: {
            amountCompatibility: number
            industryAlignment: number
            stagePreference: number
            riskAlignment: number
          }

          // Status
          status?: 'suggested' | 'viewed' | 'contacted' | 'negotiating' | 'invested' | 'rejected'

          // Communication
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          investor_id?: string
          creator_id?: string
          offer_id?: string

          // Match details
          match_score?: number
          matching_factors?: {
            amountCompatibility: number
            industryAlignment: number
            stagePreference: number
            riskAlignment: number
          }

          // Status
          status?: 'suggested' | 'viewed' | 'contacted' | 'negotiating' | 'invested' | 'rejected'

          // Communication
          created_at?: string
          updated_at?: string
        }
      }

      conversations: {
        Row: {
          id: string
          match_id: string
          participant1_id: string
          participant2_id: string
          last_message_id: string | null
          last_message_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          match_id: string
          participant1_id: string
          participant2_id: string
          last_message_id?: string | null
          last_message_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          participant1_id?: string
          participant2_id?: string
          last_message_id?: string | null
          last_message_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          type: 'text' | 'system'
          read: boolean
          read_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          type?: 'text' | 'system'
          read?: boolean
          read_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          type?: 'text' | 'system'
          read?: boolean
          read_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      transactions: {
        Row: {
          id: string
          match_id: string
          investor_id: string
          creator_id: string

          // Transaction details
          amount: number
          currency: string
          crypto_tx_hash: string | null

          // Status
          status: 'pending' | 'confirmed' | 'completed' | 'failed' | 'refunded'

          // Payment method
          payment_method: 'crypto' | 'bank_transfer'
          wallet_address: string | null

          created_at: string
          confirmed_at: string | null
        }
        Insert: {
          id?: string
          match_id: string
          investor_id: string
          creator_id: string

          // Transaction details
          amount: number
          currency: string
          crypto_tx_hash?: string | null

          // Status
          status?: 'pending' | 'confirmed' | 'completed' | 'failed' | 'refunded'

          // Payment method
          payment_method: 'crypto' | 'bank_transfer'
          wallet_address?: string | null

          created_at?: string
          confirmed_at?: string | null
        }
        Update: {
          id?: string
          match_id?: string
          investor_id?: string
          creator_id?: string

          // Transaction details
          amount?: number
          currency?: string
          crypto_tx_hash?: string | null

          // Status
          status?: 'pending' | 'confirmed' | 'completed' | 'failed' | 'refunded'

          // Payment method
          payment_method?: 'crypto' | 'bank_transfer'
          wallet_address?: string | null

          created_at?: string
          confirmed_at?: string | null
        }
      }

      favorites: {
        Row: {
          id: string
          user_id: string
          item_id: string
          item_type: 'offer' | 'idea'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_id: string
          item_type: 'offer' | 'idea'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_id?: string
          item_type?: 'offer' | 'idea'
          created_at?: string
        }
      }

      analytics_events: {
        Row: {
          id: string
          user_id: string | null
          event_type: string
          data: Json | null
          timestamp: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: string
          data?: Json | null
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_type?: string
          data?: Json | null
          timestamp?: string
        }
      }

      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          status: 'active' | 'inactive' | 'suspended'
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          status?: 'active' | 'inactive' | 'suspended'
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          status?: 'active' | 'inactive' | 'suspended'
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }

      tenant_subscriptions: {
        Row: {
          id: string
          tenant_id: string
          plan: 'free' | 'starter' | 'professional' | 'enterprise'
          features: Json
          status: 'active' | 'past_due' | 'cancelled' | 'trialing'
          current_period_start: string
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          plan?: 'free' | 'starter' | 'professional' | 'enterprise'
          features?: Json
          status?: 'active' | 'past_due' | 'cancelled' | 'trialing'
          current_period_start?: string
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          plan?: 'free' | 'starter' | 'professional' | 'enterprise'
          features?: Json
          status?: 'active' | 'past_due' | 'cancelled' | 'trialing'
          current_period_start?: string
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
