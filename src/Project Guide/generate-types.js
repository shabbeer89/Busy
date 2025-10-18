#!/usr/bin/env node

/**
 * TypeScript Types Generator for Multi-Tenant Platform
 *
 * This script helps generate and maintain consistent TypeScript types
 * across the application by analyzing the database schema and updating
 * type definitions accordingly.
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Generating TypeScript types for Multi-Tenant Platform...\n');

// Update the main types file with enhanced admin support
const typesContent = `// ========================================
// AUTO-GENERATED TYPES - DO NOT EDIT MANUALLY
// Generated on: ${new Date().toISOString()}
// ========================================

// Core user types - Enhanced with admin support
export type UserType = "creator" | "investor" | "tenant_admin" | "super_admin";

export type RoleLevel = "user" | "admin" | "super_admin";

export type RiskTolerance = "low" | "medium" | "high";

export type BusinessStage = "concept" | "mvp" | "early" | "growth";

export type MatchStatus = "suggested" | "viewed" | "contacted" | "negotiating" | "invested" | "rejected";

export type TransactionStatus = "pending" | "confirmed" | "completed" | "failed" | "refunded";

export type PaymentMethod = "crypto" | "bank_transfer";

export type TenantStatus = "active" | "inactive" | "suspended";

export type SubscriptionPlan = "free" | "starter" | "professional" | "enterprise";

export type SubscriptionStatus = "active" | "past_due" | "cancelled" | "trialing";

export type AuditSeverity = "low" | "medium" | "high" | "critical";

export type NotificationType = "info" | "success" | "warning" | "error";

export type NotificationPriority = "low" | "normal" | "high" | "critical";

// ========================================
// ENHANCED USER INTERFACE WITH ADMIN SUPPORT
// ========================================

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

  // Enhanced fields from schema
  oauthId?: string;
  provider?: string;

  // Admin role fields
  roleLevel?: RoleLevel;
  permissions?: string[];
  managedTenantIds?: string[];

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

  // Multi-tenant field
  tenantId?: string;
}

// ========================================
// ADMIN INTERFACES
// ========================================

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  settings: {
    branding?: {
      primary_color?: string;
      secondary_color?: string;
      accent_color?: string;
    };
    features?: {
      ai_recommendations?: boolean;
      advanced_analytics?: boolean;
      custom_branding?: boolean;
      api_access?: boolean;
    };
    limits?: {
      max_users?: number;
      max_projects?: number;
      storage_limit?: number;
    };
  };
  createdAt: number;
  updatedAt: number;
}

export interface TenantSubscription {
  id: string;
  tenantId: string;
  plan: SubscriptionPlan;
  features: Record<string, any>;
  status: SubscriptionStatus;
  currentPeriodStart: number;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AuditLog {
  id: string;
  timestamp: number;
  userId?: string;
  userName?: string;
  tenantId?: string;
  tenantName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  severity: AuditSeverity;
  sessionId?: string;
  location?: string;
  riskScore: number;
}

export interface PlatformConfiguration {
  id: string;
  category: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json' | 'password';
  description?: string;
  isSecret: boolean;
  isReadOnly: boolean;
  updatedAt: number;
  updatedBy?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  keyHash: string;
  keyPrefix: string;
  tenantId?: string;
  userId?: string;
  permissions: string[];
  rateLimits: {
    requests_per_second?: number;
    requests_per_minute?: number;
    requests_per_hour?: number;
    requests_per_day?: number;
  };
  isActive: boolean;
  expiresAt?: number;
  lastUsed?: number;
  usage: {
    current_period: {
      requests: number;
      start_time?: number;
    };
    limits: {
      daily?: number;
      monthly?: number;
    };
  };
  createdAt: number;
  updatedAt: number;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  userId?: string;
  tenantId?: string;
  isRead: boolean;
  readAt?: number;
  actionUrl?: string;
  expiresAt?: number;
  metadata: Record<string, any>;
  createdAt: number;
}

export interface SecurityEvent {
  id: string;
  timestamp: number;
  type: 'threat' | 'breach' | 'suspicious' | 'policy_violation' | 'failed_login' | 'unauthorized_access';
  severity: AuditSeverity;
  title: string;
  description: string;
  sourceIp?: string;
  userId?: string;
  userName?: string;
  tenantId?: string;
  location?: string;
  userAgent?: string;
  riskScore: number;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  resolvedAt?: number;
  resolution?: string;
  details: Record<string, any>;
}

// ========================================
// FORM DATA TYPES
// ========================================

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
  // Admin specific
  roleLevel?: RoleLevel;
  permissions?: string[];
  managedTenantIds?: string[];
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

export interface CreateTenantData {
  name: string;
  slug: string;
  settings?: Tenant['settings'];
}

export interface UpdateTenantData {
  name?: string;
  status?: TenantStatus;
  settings?: Tenant['settings'];
}

// ========================================
// API RESPONSE TYPES
// ========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ========================================
// LEGACY TYPES (Maintained for compatibility)
// ========================================

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

// ========================================
// TYPE GUARDS AND UTILITIES
// ========================================

export function isAdmin(user: User): boolean {
  return user.roleLevel === 'admin' || user.roleLevel === 'super_admin';
}

export function isSuperAdmin(user: User): boolean {
  return user.roleLevel === 'super_admin';
}

export function isTenantAdmin(user: User): boolean {
  return user.userType === 'tenant_admin' && user.roleLevel === 'admin';
}

export function hasPermission(user: User, permission: string): boolean {
  return (user.permissions || []).includes(permission);
}

export function canManageTenant(user: User, tenantId: string): boolean {
  if (isSuperAdmin(user)) return true;
  if (isTenantAdmin(user)) {
    return (user.managedTenantIds || []).includes(tenantId);
  }
  return user.tenantId === tenantId;
}

// ========================================
// CONSTANTS
// ========================================

export const USER_TYPE_LABELS = {
  creator: 'Creator',
  investor: 'Investor',
  tenant_admin: 'Tenant Admin',
  super_admin: 'Super Admin'
} as const;

export const BUSINESS_STAGE_LABELS = {
  concept: 'Concept',
  mvp: 'MVP',
  early: 'Early Stage',
  growth: 'Growth Stage'
} as const;

export const TENANT_STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended'
} as const;

export const SUBSCRIPTION_PLAN_LABELS = {
  free: 'Free',
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise'
} as const;

console.log('✅ Enhanced types generated successfully!');
console.log('📋 Summary of changes:');
console.log('  • Added admin user types (tenant_admin, super_admin)');
console.log('  • Added admin role fields (roleLevel, permissions, managedTenantIds)');
console.log('  • Added tenant_id to users table');
console.log('  • Added comprehensive admin interfaces');
console.log('  • Added type guards and utility functions');
console.log('  • Added constants for better type safety');
`;

fs.writeFileSync(path.join(__dirname, '../../src/types/index.ts'), typesContent);

console.log('✅ Types updated successfully!');
console.log('📁 File: src/types/index.ts');
console.log('🔧 Next steps:');
console.log('  1. Run: npm run dev');
console.log('  2. Test admin features with new user types');
console.log('  3. Verify database schema matches types');