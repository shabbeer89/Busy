// Core user types
export type UserType = "creator" | "investor";

export type RiskTolerance = "low" | "medium" | "high";

export type BusinessStage = "concept" | "mvp" | "early" | "growth";

export type MatchStatus = "suggested" | "viewed" | "contacted" | "negotiating" | "invested" | "rejected";

export type TransactionStatus = "pending" | "confirmed" | "completed" | "failed" | "refunded";

export type PaymentMethod = "crypto" | "bank_transfer";

// BABT validation types
export interface BABTValidationResult {
  isValid: boolean;
  balance: string;
  walletAddress: string;
}

export interface BABTValidationState {
  isLoading: boolean;
  isValid: boolean | null;
  balance: string;
  error: string | null;
  walletAddress: string | null;
}

// Wallet connection types
export interface WalletConnection {
  address: string;
  chainId: number;
  provider: any; // ethers provider type
}

// Supabase types - using string IDs instead of Convex IDs

// NFT Validation types
export interface NFTValidationResult {
  hasTokens: boolean;
  balance: string;
  contractType: 'ERC721' | 'ERC1155' | 'UNKNOWN';
  tokenIds?: string[];
  contractName?: string;
  contractSymbol?: string;
  error?: string;
}

export interface ContractAddressInfo {
  address: string;
  name?: string;
  symbol?: string;
  contractType?: 'ERC721' | 'ERC1155' | 'UNKNOWN';
  isValid?: boolean;
}

// User profile interfaces
export interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  avatar?: string;
  userType: UserType;
  isVerified: boolean;
  phoneVerified?: boolean;
  createdAt: number;
  updatedAt: number;

  // Creator specific fields
  companyName?: string;
  industry?: string;
  experience?: string;

  // Investor specific fields
  investmentRange?: {
    min: number;
    max: number;
  };
  preferredIndustries?: string[];
  riskTolerance?: RiskTolerance;

  // Common fields
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
  };
}

// Business idea interfaces
export interface BusinessIdea {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  category: string;
  tags: string[];

  // Financial details
  fundingGoal: number;
  currentFunding: number;
  equityOffered: number;
  valuation?: number;

  // Project details
  stage: BusinessStage;
  timeline: string;
  teamSize?: number;

  // Media
  images?: string[];
  documents?: string[][];
  videoUrl?: string;

  // Status
  status: "draft" | "published" | "funded" | "cancelled";
  createdAt: number;
  updatedAt: number;
}

// Investment offer interfaces
export interface InvestmentOffer {
  id: string;
  investorId: string;
  title: string;
  description: string;

  // Investment details
  amountRange: {
    min: number;
    max: number;
  };
  preferredEquity: {
    min: number;
    max: number;
  };

  // Preferences
  preferredStages: BusinessStage[];
  preferredIndustries: string[];
  geographicPreference?: string;

  // Terms
  investmentType: "equity" | "debt" | "convertible";
  timeline?: string;

  // Status
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// Match interfaces
export interface MatchingFactors {
  amountCompatibility: number;
  industryAlignment: number;
  stagePreference: number;
  riskAlignment: number;
}

export interface Match {
  id: string;
  ideaId: string;
  investorId: string;
  creatorId: string;
  offerId: string;

  // Match details
  matchScore: number;
  matchingFactors: MatchingFactors;

  // Status
  status: MatchStatus;

  // Communication
  createdAt: number;
  updatedAt: number;
}

// Transaction interfaces
export interface Transaction {
  id: string;
  matchId: string;
  investorId: string;
  creatorId: string;

  // Transaction details
  amount: number;
  currency: string;
  cryptoTxHash?: string;

  // Status
  status: TransactionStatus;

  // Payment method
  paymentMethod: PaymentMethod;
  walletAddress?: string;

  createdAt: number;
  confirmedAt?: number;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Form data types
export interface CreateUserData {
  email: string;
  name: string;
  phoneNumber?: string;
  userType: UserType;
  password: string;
  phoneVerified?: boolean;
}

export interface UpdateUserData {
  name?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
  };
  // Creator specific
  companyName?: string;
  industry?: string;
  experience?: string;
  // Investor specific
  investmentRange?: {
    min: number;
    max: number;
  };
  preferredIndustries?: string[];
  riskTolerance?: RiskTolerance;
}

export interface CreateBusinessIdeaData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  fundingGoal: number;
  equityOffered: number;
  stage: BusinessStage;
  timeline: string;
  teamSize?: number;
}

export interface CreateInvestmentOfferData {
  title: string;
  description: string;
  amountRange: {
    min: number;
    max: number;
  };
  preferredEquity: {
    min: number;
    max: number;
  };
  preferredStages: BusinessStage[];
  preferredIndustries: string[];
  geographicPreference?: string;
  investmentType: "equity" | "debt" | "convertible";
  timeline?: string;
}
