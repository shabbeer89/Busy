import { IntelligentMatchingEngine, UserProfile, BusinessIdea, InvestmentOffer } from '../matching-algorithm'

describe('IntelligentMatchingEngine', () => {
  let engine: IntelligentMatchingEngine

  beforeEach(() => {
    engine = new IntelligentMatchingEngine()
  })

  const mockUserProfile: UserProfile = {
    id: 'user1',
    user_type: 'creator',
    name: 'John Doe',
    email: 'john@example.com',
    industry: 'Technology',
    skills: ['React', 'Node.js'],
  }

  const mockBusinessIdea: BusinessIdea = {
    id: 'idea1',
    creator_id: 'user1',
    title: 'AI-Powered Analytics Platform',
    description: 'Revolutionary analytics platform using AI',
    category: 'Technology',
    tags: ['AI', 'Analytics', 'SaaS'],
    funding_goal: 500000,
    current_funding: 0,
    equity_offered: 15,
    stage: 'mvp',
    timeline: '12 months',
    status: 'published',
  }

  const mockInvestmentOffer: InvestmentOffer = {
    id: 'offer1',
    investor_id: 'user2',
    title: 'Tech Growth Fund',
    description: 'Investing in early-stage tech companies',
    amount_range: { min: 250000, max: 1000000 },
    preferred_equity: { min: 10, max: 25 },
    preferred_stages: ['mvp', 'early'],
    preferred_industries: ['Technology', 'SaaS'],
    investment_type: 'equity',
    is_active: true,
  }

  describe('calculateAmountCompatibility', () => {
    it('should return 1.0 for perfect amount match', () => {
      const score = (engine as any).calculateAmountCompatibility(500000, { min: 250000, max: 1000000 })
      expect(score).toBe(1.0)
    })

    it('should return high score for amount within range', () => {
      const score = (engine as any).calculateAmountCompatibility(300000, { min: 250000, max: 1000000 })
      expect(score).toBeGreaterThan(0.8)
    })

    it('should return lower score for amount above range', () => {
      const score = (engine as any).calculateAmountCompatibility(2000000, { min: 250000, max: 1000000 })
      expect(score).toBeLessThan(0.5)
    })
  })

  describe('calculateIndustryAlignment', () => {
    it('should return high score for matching industries', () => {
      const score = (engine as any).calculateIndustryAlignment('Technology', ['Technology', 'SaaS'])
      expect(score).toBeGreaterThan(0.8)
    })

    it('should return medium score for related industries', () => {
      const score = (engine as any).calculateIndustryAlignment('Technology', ['Healthcare'])
      expect(score).toBeGreaterThan(0.5)
      expect(score).toBeLessThan(0.8)
    })
  })

  describe('calculateOverallScore', () => {
    it('should calculate weighted score correctly', () => {
      const factors = {
        amountCompatibility: 1.0,
        industryAlignment: 0.9,
        stagePreference: 0.8,
        riskAlignment: 0.7,
      }

      const score = (engine as any).calculateOverallScore(factors)

      // Expected: (1.0 * 0.25) + (0.9 * 0.35) + (0.8 * 0.15) + (0.7 * 0.25)
      const expected = (1.0 * 0.25) + (0.9 * 0.35) + (0.8 * 0.15) + (0.7 * 0.25)
      expect(score).toBeCloseTo(expected, 2)
    })

    it('should cap score at 1.0', () => {
      const factors = {
        amountCompatibility: 1.0,
        industryAlignment: 1.0,
        stagePreference: 1.0,
        riskAlignment: 1.0,
      }

      const score = (engine as any).calculateOverallScore(factors)
      expect(score).toBeLessThanOrEqual(1.0)
    })
  })

  describe('findMatches', () => {
    it('should find matches for creator', async () => {
      // Load test data
      await engine.loadUserProfiles([mockUserProfile])
      await engine.loadBusinessIdeas([mockBusinessIdea])
      await engine.loadInvestmentOffers([mockInvestmentOffer])

      const matches = await engine.findMatches('user1', 'creator', 10)

      expect(Array.isArray(matches)).toBe(true)
      expect(matches.length).toBeGreaterThan(0)
    })

    it('should return empty array for non-existent user', async () => {
      const matches = await engine.findMatches('nonexistent', 'creator', 10)
      expect(matches).toEqual([])
    })
  })

  describe('getMatchStatistics', () => {
    it('should return statistics for user with matches', async () => {
      await engine.loadUserProfiles([mockUserProfile])
      await engine.loadBusinessIdeas([mockBusinessIdea])
      await engine.loadInvestmentOffers([mockInvestmentOffer])

      const stats = await engine.getMatchStatistics('user1', 'creator')

      expect(stats).toHaveProperty('totalMatches')
      expect(stats).toHaveProperty('highConfidenceMatches')
      expect(stats).toHaveProperty('averageScore')
      expect(stats).toHaveProperty('topFactors')
    })
  })
})