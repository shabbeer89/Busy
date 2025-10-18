"use client";

import { createClient } from '../lib/supabase-client';

// Create supabase client instance
const supabase = createClient();

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly' | 'quarterly';
  features: {
    maxUsers: number;
    maxProjects: number;
    storageLimit: number; // in GB
    apiCallsPerMonth: number;
    supportLevel: 'basic' | 'premium' | 'enterprise';
    customBranding: boolean;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
    customIntegrations: boolean;
  };
  isActive: boolean;
  isPopular: boolean;
  trialDays?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TenantSubscription {
  id: string;
  tenantId: string;
  tenantName: string;
  planId: string;
  planName: string;
  status: 'active' | 'past_due' | 'cancelled' | 'trialing' | 'incomplete' | 'unpaid';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEnd?: string;
  cancelAtPeriodEnd: boolean;
  quantity: number; // number of seats/licenses
  unitPrice: number;
  totalAmount: number;
  currency: string;
  paymentMethodId?: string;
  nextInvoiceDate?: string;
  failedPaymentCount: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  tenantId: string;
  tenantName: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  dueDate: string;
  paidAt?: string;
  description: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod?: string;
  downloadUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  tenantId: string;
  type: 'card' | 'bank_account' | 'paypal' | 'crypto';
  isDefault: boolean;
  cardDetails?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    country: string;
  };
  bankDetails?: {
    bankName: string;
    last4: string;
    routingNumber?: string;
  };
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BillingStats {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  averageRevenuePerTenant: number;
  churnRate: number;
  growthRate: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  pastDueSubscriptions: number;
  cancelledSubscriptions: number;
  revenueByPlan: Record<string, number>;
  revenueByPeriod: { period: string; revenue: number; subscriptions: number; }[];
  topPayingTenants: { tenantId: string; tenantName: string; revenue: number; }[];
}

export interface UsageRecord {
  id: string;
  tenantId: string;
  subscriptionId: string;
  metric: 'users' | 'projects' | 'storage' | 'api_calls' | 'bandwidth';
  value: number;
  unit: string;
  recordedAt: string;
  periodStart: string;
  periodEnd: string;
  metadata?: Record<string, any>;
}

class BillingService {
  // Get all available subscription plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      return [
        {
          id: 'plan_free',
          name: 'Free',
          description: 'Perfect for getting started',
          price: 0,
          currency: 'USD',
          interval: 'monthly',
          features: {
            maxUsers: 5,
            maxProjects: 3,
            storageLimit: 1,
            apiCallsPerMonth: 10000,
            supportLevel: 'basic',
            customBranding: false,
            advancedAnalytics: false,
            prioritySupport: false,
            customIntegrations: false
          },
          isActive: true,
          isPopular: false,
          trialDays: 0,
          createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'plan_starter',
          name: 'Starter',
          description: 'Great for small teams',
          price: 29,
          currency: 'USD',
          interval: 'monthly',
          features: {
            maxUsers: 25,
            maxProjects: 15,
            storageLimit: 10,
            apiCallsPerMonth: 100000,
            supportLevel: 'basic',
            customBranding: true,
            advancedAnalytics: false,
            prioritySupport: false,
            customIntegrations: false
          },
          isActive: true,
          isPopular: true,
          trialDays: 14,
          createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'plan_professional',
          name: 'Professional',
          description: 'For growing businesses',
          price: 99,
          currency: 'USD',
          interval: 'monthly',
          features: {
            maxUsers: 100,
            maxProjects: 50,
            storageLimit: 50,
            apiCallsPerMonth: 1000000,
            supportLevel: 'premium',
            customBranding: true,
            advancedAnalytics: true,
            prioritySupport: true,
            customIntegrations: false
          },
          isActive: true,
          isPopular: true,
          trialDays: 30,
          createdAt: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'plan_enterprise',
          name: 'Enterprise',
          description: 'For large organizations',
          price: 299,
          currency: 'USD',
          interval: 'monthly',
          features: {
            maxUsers: -1, // unlimited
            maxProjects: -1, // unlimited
            storageLimit: 500,
            apiCallsPerMonth: 10000000,
            supportLevel: 'enterprise',
            customBranding: true,
            advancedAnalytics: true,
            prioritySupport: true,
            customIntegrations: true
          },
          isActive: true,
          isPopular: false,
          trialDays: 60,
          createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return [];
    }
  }

  // Get tenant subscriptions with billing details
  async getTenantSubscriptions(tenantId?: string): Promise<TenantSubscription[]> {
    try {
      // In a real implementation, this would query the tenant_subscriptions table
      const mockSubscriptions: TenantSubscription[] = [
        {
          id: 'sub_001',
          tenantId: 'tenant1',
          tenantName: 'TechVentures Inc.',
          planId: 'plan_professional',
          planName: 'Professional',
          status: 'active',
          currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          cancelAtPeriodEnd: false,
          quantity: 10,
          unitPrice: 99,
          totalAmount: 990,
          currency: 'USD',
          nextInvoiceDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          failedPaymentCount: 0,
          metadata: {},
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'sub_002',
          tenantId: 'tenant2',
          tenantName: 'GreenEnergy Solutions',
          planId: 'plan_starter',
          planName: 'Starter',
          status: 'trialing',
          currentPeriodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          cancelAtPeriodEnd: false,
          quantity: 5,
          unitPrice: 29,
          totalAmount: 145,
          currency: 'USD',
          failedPaymentCount: 0,
          metadata: {},
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'sub_003',
          tenantId: 'tenant3',
          tenantName: 'Demo Tenant',
          planId: 'plan_free',
          planName: 'Free',
          status: 'active',
          currentPeriodStart: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancelAtPeriodEnd: false,
          quantity: 1,
          unitPrice: 0,
          totalAmount: 0,
          currency: 'USD',
          failedPaymentCount: 0,
          metadata: {},
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      if (tenantId) {
        return mockSubscriptions.filter(sub => sub.tenantId === tenantId);
      }

      return mockSubscriptions;
    } catch (error) {
      console.error('Error fetching tenant subscriptions:', error);
      return [];
    }
  }

  // Create new subscription for tenant
  async createSubscription(subscriptionData: {
    tenantId: string;
    planId: string;
    quantity?: number;
    paymentMethodId?: string;
    trialDays?: number;
  }): Promise<TenantSubscription | null> {
    try {
      const plans = await this.getSubscriptionPlans();
      const plan = plans.find(p => p.id === subscriptionData.planId);

      if (!plan) {
        throw new Error('Plan not found');
      }

      const quantity = subscriptionData.quantity || 1;
      const now = new Date();
      const periodEnd = new Date(now);

      // Calculate period end based on plan interval
      switch (plan.interval) {
        case 'monthly':
          periodEnd.setMonth(periodEnd.getMonth() + 1);
          break;
        case 'yearly':
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
          break;
        case 'quarterly':
          periodEnd.setMonth(periodEnd.getMonth() + 3);
          break;
      }

      const newSubscription: TenantSubscription = {
        id: `sub_${Date.now()}`,
        tenantId: subscriptionData.tenantId,
        tenantName: 'New Tenant', // Would be fetched from tenants table
        planId: plan.id,
        planName: plan.name,
        status: subscriptionData.trialDays ? 'trialing' : 'active',
        currentPeriodStart: now.toISOString(),
        currentPeriodEnd: periodEnd.toISOString(),
        trialEnd: subscriptionData.trialDays
          ? new Date(now.getTime() + subscriptionData.trialDays * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
        cancelAtPeriodEnd: false,
        quantity,
        unitPrice: plan.price,
        totalAmount: plan.price * quantity,
        currency: plan.currency,
        paymentMethodId: subscriptionData.paymentMethodId,
        failedPaymentCount: 0,
        metadata: {},
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };

      console.log('Creating subscription:', newSubscription);
      return newSubscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      return null;
    }
  }

  // Update subscription (upgrade/downgrade)
  async updateSubscription(subscriptionId: string, updates: {
    planId?: string;
    quantity?: number;
    cancelAtPeriodEnd?: boolean;
    paymentMethodId?: string;
  }): Promise<TenantSubscription | null> {
    try {
      console.log(`Updating subscription ${subscriptionId}:`, updates);
      return null; // Would return updated subscription
    } catch (error) {
      console.error('Error updating subscription:', error);
      return null;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<boolean> {
    try {
      console.log(`Cancelling subscription ${subscriptionId}, cancel at period end: ${cancelAtPeriodEnd}`);
      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return false;
    }
  }

  // Get invoices for tenant
  async getTenantInvoices(tenantId: string): Promise<Invoice[]> {
    try {
      return [
        {
          id: 'inv_001',
          subscriptionId: 'sub_001',
          tenantId,
          tenantName: 'TechVentures Inc.',
          invoiceNumber: 'INV-2024-001',
          amount: 990,
          currency: 'USD',
          status: 'paid',
          dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Professional Plan - 10 users (Dec 2024)',
          lineItems: [
            {
              description: 'Professional Plan (10 users)',
              quantity: 1,
              unitPrice: 990,
              totalPrice: 990
            }
          ],
          taxAmount: 0,
          discountAmount: 0,
          totalAmount: 990,
          paymentMethod: 'Visa ending in 4242',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'inv_002',
          subscriptionId: 'sub_001',
          tenantId,
          tenantName: 'TechVentures Inc.',
          invoiceNumber: 'INV-2024-002',
          amount: 990,
          currency: 'USD',
          status: 'open',
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Professional Plan - 10 users (Jan 2025)',
          lineItems: [
            {
              description: 'Professional Plan (10 users)',
              quantity: 1,
              unitPrice: 990,
              totalPrice: 990
            }
          ],
          taxAmount: 0,
          discountAmount: 0,
          totalAmount: 990,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
    } catch (error) {
      console.error('Error fetching tenant invoices:', error);
      return [];
    }
  }

  // Get payment methods for tenant
  async getPaymentMethods(tenantId: string): Promise<PaymentMethod[]> {
    try {
      return [
        {
          id: 'pm_001',
          tenantId,
          type: 'card',
          isDefault: true,
          cardDetails: {
            brand: 'visa',
            last4: '4242',
            expMonth: 12,
            expYear: 2025,
            country: 'US'
          },
          billingAddress: {
            line1: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94105',
            country: 'US'
          },
          isVerified: true,
          createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'pm_002',
          tenantId,
          type: 'bank_account',
          isDefault: false,
          bankDetails: {
            bankName: 'Chase Bank',
            last4: '1234',
            routingNumber: '322271627'
          },
          billingAddress: {
            line1: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94105',
            country: 'US'
          },
          isVerified: true,
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  }

  // Add new payment method
  async addPaymentMethod(tenantId: string, paymentMethodData: {
    type: 'card' | 'bank_account' | 'paypal' | 'crypto';
    token?: string;
    billingAddress: PaymentMethod['billingAddress'];
    setAsDefault?: boolean;
  }): Promise<PaymentMethod | null> {
    try {
      const newPaymentMethod: PaymentMethod = {
        id: `pm_${Date.now()}`,
        tenantId,
        type: paymentMethodData.type,
        isDefault: paymentMethodData.setAsDefault || false,
        cardDetails: paymentMethodData.type === 'card' ? {
          brand: 'unknown',
          last4: '****',
          expMonth: 0,
          expYear: 0,
          country: paymentMethodData.billingAddress.country
        } : undefined,
        billingAddress: paymentMethodData.billingAddress,
        isVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Adding payment method:', newPaymentMethod);
      return newPaymentMethod;
    } catch (error) {
      console.error('Error adding payment method:', error);
      return null;
    }
  }

  // Get comprehensive billing statistics
  async getBillingStats(timeRange: string = '12m'): Promise<BillingStats> {
    try {
      const subscriptions = await this.getTenantSubscriptions();
      const plans = await this.getSubscriptionPlans();

      const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
      const trialSubscriptions = subscriptions.filter(s => s.status === 'trialing').length;
      const pastDueSubscriptions = subscriptions.filter(s => s.status === 'past_due').length;
      const cancelledSubscriptions = subscriptions.filter(s => s.status === 'cancelled').length;

      // Calculate revenue metrics
      const totalRevenue = subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + s.totalAmount, 0);

      const monthlyRecurringRevenue = subscriptions
        .filter(s => s.status === 'active' && s.planName !== 'Free')
        .reduce((sum, s) => sum + s.totalAmount, 0);

      const annualRecurringRevenue = monthlyRecurringRevenue * 12;

      const averageRevenuePerTenant = subscriptions.length > 0
        ? totalRevenue / subscriptions.filter(s => s.status === 'active').length
        : 0;

      // Calculate revenue by plan
      const revenueByPlan = subscriptions.reduce((acc, subscription) => {
        if (subscription.status === 'active') {
          acc[subscription.planName] = (acc[subscription.planName] || 0) + subscription.totalAmount;
        }
        return acc;
      }, {} as Record<string, number>);

      // Generate revenue by period (last 12 months)
      const revenueByPeriod = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format

        return {
          period: monthKey,
          revenue: Math.floor(Math.random() * 5000) + 2000, // Mock data
          subscriptions: Math.floor(Math.random() * 10) + 5
        };
      }).reverse();

      // Get top paying tenants
      const topPayingTenants = subscriptions
        .filter(s => s.status === 'active')
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 5)
        .map(s => ({
          tenantId: s.tenantId,
          tenantName: s.tenantName,
          revenue: s.totalAmount
        }));

      // Calculate growth rate (mock)
      const growthRate = 12.5; // 12.5% growth
      const churnRate = 2.3; // 2.3% churn

      return {
        totalRevenue,
        monthlyRecurringRevenue,
        annualRecurringRevenue,
        averageRevenuePerTenant,
        churnRate,
        growthRate,
        activeSubscriptions,
        trialSubscriptions,
        pastDueSubscriptions,
        cancelledSubscriptions,
        revenueByPlan,
        revenueByPeriod,
        topPayingTenants
      };
    } catch (error) {
      console.error('Error fetching billing stats:', error);
      return {
        totalRevenue: 0,
        monthlyRecurringRevenue: 0,
        annualRecurringRevenue: 0,
        averageRevenuePerTenant: 0,
        churnRate: 0,
        growthRate: 0,
        activeSubscriptions: 0,
        trialSubscriptions: 0,
        pastDueSubscriptions: 0,
        cancelledSubscriptions: 0,
        revenueByPlan: {},
        revenueByPeriod: [],
        topPayingTenants: []
      };
    }
  }

  // Record usage for billing calculations
  async recordUsage(tenantId: string, metric: UsageRecord['metric'], value: number, metadata?: Record<string, any>): Promise<boolean> {
    try {
      const usageRecord: UsageRecord = {
        id: `usage_${Date.now()}`,
        tenantId,
        subscriptionId: '', // Would be determined from active subscription
        metric,
        value,
        unit: this.getUnitForMetric(metric),
        recordedAt: new Date().toISOString(),
        periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        periodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
        metadata
      };

      console.log('Recording usage:', usageRecord);
      return true;
    } catch (error) {
      console.error('Error recording usage:', error);
      return false;
    }
  }

  // Get usage records for tenant
  async getUsageRecords(tenantId: string, timeRange: string = '30d'): Promise<UsageRecord[]> {
    try {
      return [
        {
          id: 'usage_001',
          tenantId,
          subscriptionId: 'sub_001',
          metric: 'users',
          value: 8,
          unit: 'count',
          recordedAt: new Date().toISOString(),
          periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
          periodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()
        },
        {
          id: 'usage_002',
          tenantId,
          subscriptionId: 'sub_001',
          metric: 'storage',
          value: 2.5,
          unit: 'GB',
          recordedAt: new Date().toISOString(),
          periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
          periodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()
        }
      ];
    } catch (error) {
      console.error('Error fetching usage records:', error);
      return [];
    }
  }

  // Calculate prorated amount for subscription changes
  async calculateProration(subscriptionId: string, newPlanId: string, newQuantity?: number): Promise<{
    prorationAmount: number;
    description: string;
    effectiveDate: string;
  }> {
    try {
      // Mock proration calculation
      const prorationAmount = 45.67;
      const description = `Prorated amount for plan change from Professional to ${newPlanId}`;
      const effectiveDate = new Date().toISOString();

      return {
        prorationAmount,
        description,
        effectiveDate
      };
    } catch (error) {
      console.error('Error calculating proration:', error);
      throw new Error('Failed to calculate proration');
    }
  }

  // Generate invoice for subscription
  async generateInvoice(subscriptionId: string, options?: {
    customDescription?: string;
    taxRate?: number;
    discountAmount?: number;
  }): Promise<Invoice | null> {
    try {
      const subscription = (await this.getTenantSubscriptions()).find(s => s.id === subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

      const lineItems = [{
        description: `${subscription.planName} Plan (${subscription.quantity} ${subscription.quantity === 1 ? 'user' : 'users'})`,
        quantity: subscription.quantity,
        unitPrice: subscription.unitPrice,
        totalPrice: subscription.totalAmount
      }];

      const subtotal = subscription.totalAmount;
      const taxAmount = options?.taxRate ? subtotal * (options.taxRate / 100) : 0;
      const discountAmount = options?.discountAmount || 0;
      const totalAmount = subtotal + taxAmount - discountAmount;

      const newInvoice: Invoice = {
        id: `inv_${Date.now()}`,
        subscriptionId,
        tenantId: subscription.tenantId,
        tenantName: subscription.tenantName,
        invoiceNumber,
        amount: totalAmount,
        currency: subscription.currency,
        status: 'open',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        description: options?.customDescription || `Subscription renewal - ${subscription.planName}`,
        lineItems,
        taxAmount,
        discountAmount,
        totalAmount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Generating invoice:', newInvoice);
      return newInvoice;
    } catch (error) {
      console.error('Error generating invoice:', error);
      return null;
    }
  }

  // Private helper methods
  private getUnitForMetric(metric: UsageRecord['metric']): string {
    const units: Record<UsageRecord['metric'], string> = {
      users: 'count',
      projects: 'count',
      storage: 'GB',
      api_calls: 'requests',
      bandwidth: 'GB'
    };
    return units[metric] || 'units';
  }

  // Get billing dashboard summary
  async getBillingDashboardSummary(): Promise<{
    totalRevenue: number;
    activeSubscriptions: number;
    trialSubscriptions: number;
    pastDueInvoices: number;
    monthlyGrowth: number;
    topPlans: { name: string; count: number; revenue: number; }[];
    recentInvoices: Invoice[];
    upcomingRenewals: TenantSubscription[];
  }> {
    try {
      const subscriptions = await this.getTenantSubscriptions();
      const stats = await this.getBillingStats();

      const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
      const trialSubscriptions = subscriptions.filter(s => s.status === 'trialing').length;
      const pastDueInvoices = 3; // Mock data

      // Calculate monthly growth
      const currentMonthRevenue = stats.revenueByPeriod[stats.revenueByPeriod.length - 1]?.revenue || 0;
      const previousMonthRevenue = stats.revenueByPeriod[stats.revenueByPeriod.length - 2]?.revenue || 0;
      const monthlyGrowth = previousMonthRevenue > 0
        ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
        : 0;

      // Get top plans
      const topPlans = Object.entries(stats.revenueByPlan)
        .map(([name, revenue]) => ({
          name,
          count: Math.floor(revenue / 99), // Approximate based on average price
          revenue
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Get recent invoices (last 5)
      const allInvoices: Invoice[] = [];
      for (const subscription of subscriptions) {
        const invoices = await this.getTenantInvoices(subscription.tenantId);
        allInvoices.push(...invoices);
      }
      const recentInvoices = allInvoices
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      // Get upcoming renewals (next 7 days)
      const upcomingRenewals = subscriptions.filter(s => {
        const renewalDate = new Date(s.currentPeriodEnd);
        const now = new Date();
        const diffTime = renewalDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0;
      });

      return {
        totalRevenue: stats.totalRevenue,
        activeSubscriptions,
        trialSubscriptions,
        pastDueInvoices,
        monthlyGrowth,
        topPlans,
        recentInvoices,
        upcomingRenewals
      };
    } catch (error) {
      console.error('Error fetching billing dashboard summary:', error);
      return {
        totalRevenue: 0,
        activeSubscriptions: 0,
        trialSubscriptions: 0,
        pastDueInvoices: 0,
        monthlyGrowth: 0,
        topPlans: [],
        recentInvoices: [],
        upcomingRenewals: []
      };
    }
  }
}

export const billingService = new BillingService();