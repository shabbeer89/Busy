// Enhanced intelligent matching algorithm for Strategic Partnership platform

export interface UserProfile {
  id: string
  user_type: 'creator' | 'investor'
  name: string
  email: string
  avatar?: string
  bio?: string
  location?: string
  website?: string

  // Creator specific fields
  company_name?: string
  industry?: string
  experience?: string

  // Investor specific fields
  investment_range?: {
    min: number
    max: number
  }
  preferred_industries?: string[]
  risk_tolerance?: 'low' | 'medium' | 'high'

  // Common fields
  skills?: string[]
  interests?: string[]
  social_links?: {
    linkedin?: string
    twitter?: string
  }
}

export interface BusinessIdea {
  id: string
  creator_id: string
  title: string
  description: string
  category: string
  tags: string[]
  funding_goal: number
  current_funding: number
  equity_offered: number
  valuation?: number
  stage: 'concept' | 'mvp' | 'early' | 'growth'
  timeline: string
  team_size?: number
  status: 'draft' | 'published' | 'funded' | 'cancelled'
}

export interface InvestmentOffer {
  id: string
  investor_id: string
  title: string
  description: string
  amount_range: {
    min: number
    max: number
  }
  preferred_equity: {
    min: number
    max: number
  }
  preferred_stages: string[]
  preferred_industries: string[]
  geographic_preference?: string
  investment_type: 'equity' | 'debt' | 'convertible'
  timeline?: string
  is_active: boolean
}

export interface MatchFactors {
  amountCompatibility: number    // 25% weight
  industryAlignment: number      // 35% weight
  stagePreference: number        // 15% weight
  riskAlignment: number         // 25% weight
  experienceMatch?: number      // Bonus factor
  locationProximity?: number    // Bonus factor
  networkEffect?: number        // Bonus factor
}

export interface MatchResult {
  idea_id: string
  investor_id: string
  creator_id: string
  offer_id: string
  match_score: number
  factors: MatchFactors
  confidence: 'high' | 'medium' | 'low'
  reasoning: string[]
  created_at: string
}

// Enhanced scoring weights
const SCORING_WEIGHTS = {
  amountCompatibility: 0.25,
  industryAlignment: 0.35,
  stagePreference: 0.15,
  riskAlignment: 0.25,
} as const

// Industry compatibility matrix
const INDUSTRY_COMPATIBILITY: Record<string, Record<string, number>> = {
  'Technology': {
    'Technology': 1.0,
    'Software': 0.9,
    'SaaS': 0.9,
    'AI/ML': 0.8,
    'Fintech': 0.7,
    'Healthcare': 0.6,
    'E-commerce': 0.7,
    'Education': 0.6,
  },
  'Healthcare': {
    'Healthcare': 1.0,
    'Biotech': 0.9,
    'Medical Devices': 0.9,
    'Pharmaceuticals': 0.8,
    'Technology': 0.6,
    'AI/ML': 0.7,
  },
  'Finance': {
    'Finance': 1.0,
    'Fintech': 0.9,
    'Technology': 0.7,
    'E-commerce': 0.6,
  },
}

// Risk tolerance mapping
const RISK_TOLERANCE_MAP = {
  'concept': { 'high': 1.0, 'medium': 0.7, 'low': 0.3 },
  'mvp': { 'high': 0.8, 'medium': 1.0, 'low': 0.5 },
  'early': { 'high': 0.5, 'medium': 0.8, 'low': 1.0 },
  'growth': { 'high': 0.3, 'medium': 0.6, 'low': 1.0 },
}

export class IntelligentMatchingEngine {
  private userProfiles: Map<string, UserProfile> = new Map()
  private businessIdeas: Map<string, BusinessIdea> = new Map()
  private investmentOffers: Map<string, InvestmentOffer> = new Map()

  // Cache for recent matches to avoid recomputation
  private matchCache: Map<string, MatchResult[]> = new Map()
  private cacheExpiry: Map<string, number> = new Map()

  constructor() {
    // Cache expires after 30 minutes
    setInterval(() => this.clearExpiredCache(), 30 * 60 * 1000)
  }

  // Load user profiles into memory for faster matching
  async loadUserProfiles(profiles: UserProfile[]) {
    profiles.forEach(profile => {
      this.userProfiles.set(profile.id, profile)
    })
  }

  // Load business ideas into memory
  async loadBusinessIdeas(ideas: BusinessIdea[]) {
    ideas.forEach(idea => {
      if (idea.status === 'published') {
        this.businessIdeas.set(idea.id, idea)
      }
    })
  }

  // Load investment offers into memory
  async loadInvestmentOffers(offers: InvestmentOffer[]) {
    offers.forEach(offer => {
      if (offer.is_active) {
        this.investmentOffers.set(offer.id, offer)
      }
    })
  }

  // Calculate amount compatibility score
  private calculateAmountCompatibility(
    fundingGoal: number,
    amountRange: { min: number; max: number }
  ): number {
    if (fundingGoal >= amountRange.min && fundingGoal <= amountRange.max) {
      return 1.0 // Perfect match
    }

    if (fundingGoal < amountRange.min) {
      // Too small - calculate how close it is
      const ratio = fundingGoal / amountRange.min
      return Math.min(1.0, ratio * 1.2) // Allow some flexibility for smaller amounts
    }

    // Too large - calculate how much larger
    const ratio = fundingGoal / amountRange.max
    if (ratio <= 1.5) return 0.8 // Up to 50% larger still gets decent score
    if (ratio <= 2.0) return 0.5 // Up to 100% larger gets medium score
    return 0.1 // Much larger gets low score
  }

  // Calculate industry alignment score
  private calculateIndustryAlignment(
    ideaCategory: string,
    preferredIndustries: string[],
    creatorSkills?: string[]
  ): number {
    if (preferredIndustries.length === 0) {
      return 0.8 // No preference means open to anything
    }

    let bestScore = 0

    for (const industry of preferredIndustries) {
      // Direct category match
      if (ideaCategory.toLowerCase().includes(industry.toLowerCase()) ||
          industry.toLowerCase().includes(ideaCategory.toLowerCase())) {
        bestScore = Math.max(bestScore, 1.0)
      }

      // Compatibility matrix lookup
      const compatibilityScore = INDUSTRY_COMPATIBILITY[industry]?.[ideaCategory] || 0
      bestScore = Math.max(bestScore, compatibilityScore)

      // Skills-based matching
      if (creatorSkills) {
        const skillMatch = creatorSkills.some(skill =>
          skill.toLowerCase().includes(industry.toLowerCase()) ||
          industry.toLowerCase().includes(skill.toLowerCase())
        )
        if (skillMatch) {
          bestScore = Math.max(bestScore, 0.9)
        }
      }
    }

    return bestScore
  }

  // Calculate stage preference score
  private calculateStagePreference(
    ideaStage: string,
    preferredStages: string[]
  ): number {
    if (preferredStages.length === 0) {
      return 0.8 // No preference
    }

    if (preferredStages.includes(ideaStage)) {
      return 1.0 // Perfect match
    }

    // Calculate compatibility between stages
    const stageCompatibility: Record<string, Record<string, number>> = {
      'concept': { 'concept': 1.0, 'mvp': 0.6, 'early': 0.2, 'growth': 0.0 },
      'mvp': { 'concept': 0.8, 'mvp': 1.0, 'early': 0.7, 'growth': 0.3 },
      'early': { 'concept': 0.3, 'mvp': 0.8, 'early': 1.0, 'growth': 0.6 },
      'growth': { 'concept': 0.0, 'mvp': 0.4, 'early': 0.8, 'growth': 1.0 },
    }

    return stageCompatibility[ideaStage]?.[preferredStages[0]] || 0.5
  }

  // Calculate risk alignment score
  private calculateRiskAlignment(
    ideaStage: string,
    riskTolerance: string,
    creatorExperience?: string
  ): number {
    const validStages = ['concept', 'mvp', 'early', 'growth'] as const
    const validTolerances = ['low', 'medium', 'high'] as const

    if (!validStages.includes(ideaStage as any) || !validTolerances.includes(riskTolerance as any)) {
      return 0.5
    }

    const baseScore = RISK_TOLERANCE_MAP[ideaStage as keyof typeof RISK_TOLERANCE_MAP]?.[riskTolerance as keyof typeof RISK_TOLERANCE_MAP[keyof typeof RISK_TOLERANCE_MAP]] || 0.5

    // Bonus for experienced creators in early stages
    if (ideaStage === 'concept' || ideaStage === 'mvp') {
      if (creatorExperience === 'experienced' || creatorExperience === 'serial') {
        return Math.min(1.0, baseScore + 0.2)
      }
    }

    return baseScore
  }

  // Calculate experience match bonus
  private calculateExperienceMatch(
    creatorExperience: string | undefined,
    investorExperience: string | undefined
  ): number {
    if (!creatorExperience || !investorExperience) return 0.5

    const experienceLevels = ['beginner', 'intermediate', 'experienced', 'serial']
    const creatorLevel = experienceLevels.indexOf(creatorExperience)
    const investorLevel = experienceLevels.indexOf(investorExperience)

    if (creatorLevel === -1 || investorLevel === -1) return 0.5

    // Similar experience levels work well together
    const levelDiff = Math.abs(creatorLevel - investorLevel)
    return Math.max(0.3, 1.0 - (levelDiff * 0.2))
  }

  // Calculate location proximity bonus
  private calculateLocationProximity(
    creatorLocation: string | undefined,
    investorLocation: string | undefined,
    geographicPreference: string | undefined
  ): number {
    if (!creatorLocation || !investorLocation) return 0.5

    // If investor has geographic preference, check if creator location matches
    if (geographicPreference) {
      if (creatorLocation.toLowerCase().includes(geographicPreference.toLowerCase()) ||
          geographicPreference.toLowerCase().includes(creatorLocation.toLowerCase())) {
        return 1.0
      }
      return 0.3 // Low score if location doesn't match preference
    }

    // Simple proximity scoring (could be enhanced with geocoding)
    if (creatorLocation === investorLocation) {
      return 1.0
    }

    // Check if they're in the same country/region
    const locationMatch = this.getLocationMatch(creatorLocation, investorLocation)
    return locationMatch
  }

  // Simple location matching logic
  private getLocationMatch(location1: string, location2: string): number {
    // This could be enhanced with proper geocoding
    const countries = ['USA', 'Canada', 'UK', 'Germany', 'France', 'India', 'China', 'Japan']
    const regions = ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Australia']

    // Extract country/region from location strings
    const getRegion = (loc: string) => {
      for (const region of regions) {
        if (loc.toLowerCase().includes(region.toLowerCase())) {
          return region
        }
      }
      for (const country of countries) {
        if (loc.toLowerCase().includes(country.toLowerCase())) {
          return country
        }
      }
      return loc
    }

    const region1 = getRegion(location1)
    const region2 = getRegion(location2)

    return region1 === region2 ? 0.9 : 0.6
  }

  // Main matching algorithm
  async findMatches(
    targetUserId: string,
    targetType: 'creator' | 'investor',
    limit: number = 50
  ): Promise<MatchResult[]> {
    const cacheKey = `${targetUserId}_${targetType}_${limit}`
    const cached = this.matchCache.get(cacheKey)
    const expiry = this.cacheExpiry.get(cacheKey)

    // Return cached results if still valid
    if (cached && expiry && Date.now() < expiry) {
      return cached
    }

    const matches: MatchResult[] = []

    if (targetType === 'creator') {
      // Find matches for a creator's business idea
      const creatorProfile = this.userProfiles.get(targetUserId)
      if (!creatorProfile) return []

      // Find creator's published ideas
      const creatorIdeas = Array.from(this.businessIdeas.values())
        .filter(idea => idea.creator_id === targetUserId)

      for (const idea of creatorIdeas) {
        // Match against all active investment offers
        for (const offer of this.investmentOffers.values()) {
          const investorProfile = this.userProfiles.get(offer.investor_id)
          if (!investorProfile) continue

          const factors = await this.calculateMatchFactors(idea, offer, creatorProfile, investorProfile)
          const matchScore = this.calculateOverallScore(factors)

          if (matchScore >= 0.4) { // Only return reasonably good matches
            matches.push({
              idea_id: idea.id,
              investor_id: offer.investor_id,
              creator_id: targetUserId,
              offer_id: offer.id,
              match_score: matchScore,
              factors,
              confidence: this.getConfidenceLevel(matchScore),
              reasoning: this.generateMatchReasoning(factors, idea, offer),
              created_at: new Date().toISOString(),
            })
          }
        }
      }
    } else {
      // Find matches for an investor's offer
      const investorProfile = this.userProfiles.get(targetUserId)
      if (!investorProfile) return []

      // Find investor's active offers
      const investorOffers = Array.from(this.investmentOffers.values())
        .filter(offer => offer.investor_id === targetUserId)

      for (const offer of investorOffers) {
        // Match against all published business ideas
        for (const idea of this.businessIdeas.values()) {
          const creatorProfile = this.userProfiles.get(idea.creator_id)
          if (!creatorProfile) continue

          const factors = await this.calculateMatchFactors(idea, offer, creatorProfile, investorProfile)
          const matchScore = this.calculateOverallScore(factors)

          if (matchScore >= 0.4) {
            matches.push({
              idea_id: idea.id,
              investor_id: targetUserId,
              creator_id: idea.creator_id,
              offer_id: offer.id,
              match_score: matchScore,
              factors,
              confidence: this.getConfidenceLevel(matchScore),
              reasoning: this.generateMatchReasoning(factors, idea, offer),
              created_at: new Date().toISOString(),
            })
          }
        }
      }
    }

    // Sort by score and limit results
    matches.sort((a, b) => b.match_score - a.match_score)
    const topMatches = matches.slice(0, limit)

    // Cache results for 30 minutes
    this.matchCache.set(cacheKey, topMatches)
    this.cacheExpiry.set(cacheKey, Date.now() + 30 * 60 * 1000)

    return topMatches
  }

  // Calculate all match factors for a potential match
  private async calculateMatchFactors(
    idea: BusinessIdea,
    offer: InvestmentOffer,
    creatorProfile: UserProfile,
    investorProfile: UserProfile
  ): Promise<MatchFactors> {
    return {
      amountCompatibility: this.calculateAmountCompatibility(idea.funding_goal, offer.amount_range),
      industryAlignment: this.calculateIndustryAlignment(
        idea.category,
        offer.preferred_industries,
        creatorProfile.skills
      ),
      stagePreference: this.calculateStagePreference(idea.stage, offer.preferred_stages),
      riskAlignment: this.calculateRiskAlignment(
        idea.stage,
        investorProfile.risk_tolerance || 'medium',
        creatorProfile.experience
      ),
      experienceMatch: this.calculateExperienceMatch(
        creatorProfile.experience,
        'experienced' // Could be enhanced with investor experience data
      ),
      locationProximity: this.calculateLocationProximity(
        creatorProfile.location,
        investorProfile.location,
        offer.geographic_preference
      ),
      networkEffect: 0.5, // Placeholder for future network-based scoring
    }
  }

  // Calculate overall weighted score
  private calculateOverallScore(factors: MatchFactors): number {
    let score = 0

    // Core factors with defined weights
    score += factors.amountCompatibility * SCORING_WEIGHTS.amountCompatibility
    score += factors.industryAlignment * SCORING_WEIGHTS.industryAlignment
    score += factors.stagePreference * SCORING_WEIGHTS.stagePreference
    score += factors.riskAlignment * SCORING_WEIGHTS.riskAlignment

    // Bonus factors (up to 20% additional score)
    if (factors.experienceMatch && factors.experienceMatch > 0.7) {
      score += 0.1 * factors.experienceMatch
    }

    if (factors.locationProximity && factors.locationProximity > 0.8) {
      score += 0.05 * factors.locationProximity
    }

    if (factors.networkEffect && factors.networkEffect > 0.6) {
      score += 0.05 * factors.networkEffect
    }

    return Math.min(1.0, Math.max(0.0, score))
  }

  // Determine confidence level based on score
  private getConfidenceLevel(score: number): 'high' | 'medium' | 'low' {
    if (score >= 0.8) return 'high'
    if (score >= 0.6) return 'medium'
    return 'low'
  }

  // Generate human-readable reasoning for the match
  private generateMatchReasoning(
    factors: MatchFactors,
    idea: BusinessIdea,
    offer: InvestmentOffer
  ): string[] {
    const reasoning: string[] = []

    if (factors.amountCompatibility > 0.8) {
      reasoning.push(`Funding goal of $${idea.funding_goal.toLocaleString()} fits well within the investment range`)
    }

    if (factors.industryAlignment > 0.8) {
      reasoning.push(`Strong alignment in ${idea.category} industry`)
    }

    if (factors.stagePreference > 0.8) {
      reasoning.push(`${idea.stage} stage matches preferred investment stages`)
    }

    if (factors.riskAlignment > 0.7) {
      reasoning.push(`Risk profile is well-aligned for this investment`)
    }

    if (factors.experienceMatch && factors.experienceMatch > 0.7) {
      reasoning.push(`Experience levels are compatible`)
    }

    if (factors.locationProximity && factors.locationProximity > 0.8) {
      reasoning.push(`Geographic preferences are well-matched`)
    }

    return reasoning
  }

  // Clear expired cache entries
  private clearExpiredCache() {
    const now = Date.now()
    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (now >= expiry) {
        this.matchCache.delete(key)
        this.cacheExpiry.delete(key)
      }
    }
  }

  // Get match statistics for analytics
  async getMatchStatistics(userId: string, userType: 'creator' | 'investor') {
    const recentMatches = await this.findMatches(userId, userType, 100)

    const stats = {
      totalMatches: recentMatches.length,
      highConfidenceMatches: recentMatches.filter(m => m.confidence === 'high').length,
      mediumConfidenceMatches: recentMatches.filter(m => m.confidence === 'medium').length,
      averageScore: recentMatches.reduce((sum, m) => sum + m.match_score, 0) / recentMatches.length || 0,
      topFactors: this.analyzeTopFactors(recentMatches),
      improvementSuggestions: this.generateImprovementSuggestions(recentMatches),
    }

    return stats
  }

  // Analyze which factors are performing best
  private analyzeTopFactors(matches: MatchResult[]) {
    const factorSums = matches.reduce((acc, match) => {
      acc.amountCompatibility += match.factors.amountCompatibility
      acc.industryAlignment += match.factors.industryAlignment
      acc.stagePreference += match.factors.stagePreference
      acc.riskAlignment += match.factors.riskAlignment
      return acc
    }, {
      amountCompatibility: 0,
      industryAlignment: 0,
      stagePreference: 0,
      riskAlignment: 0,
    })

    const factorAverages = Object.entries(factorSums).map(([key, value]) => ({
      factor: key,
      average: value / matches.length,
    })).sort((a, b) => b.average - a.average)

    return factorAverages
  }

  // Generate suggestions for improving match quality
  private generateImprovementSuggestions(matches: MatchResult[]): string[] {
    const suggestions: string[] = []
    const avgScore = matches.reduce((sum, m) => sum + m.match_score, 0) / matches.length

    if (avgScore < 0.6) {
      suggestions.push("Consider expanding your industry preferences to find more opportunities")
      suggestions.push("Review your funding goals to align better with typical investment ranges")
    }

    const lowScoringMatches = matches.filter(m => m.match_score < 0.5)
    if (lowScoringMatches.length > matches.length * 0.3) {
      suggestions.push("Your profile may need more detailed information to improve matching accuracy")
    }

    return suggestions
  }
}

// Export singleton instance
export const matchingEngine = new IntelligentMatchingEngine()