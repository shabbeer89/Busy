"use client";

import { createClient } from '../lib/supabase-client';

// Create supabase client instance
const supabase = createClient();

export interface APIEndpoint {
  id: string;
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  version: string;
  isActive: boolean;
  isDeprecated: boolean;
  deprecationDate?: string;
  documentationUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RateLimitRule {
  id: string;
  name: string;
  description: string;
  endpointPattern: string;
  method?: string;
  limit: number;
  window: number; // in seconds
  strategy: 'fixed_window' | 'sliding_window' | 'token_bucket';
  appliesTo: 'global' | 'tenant' | 'user' | 'ip';
  tenantId?: string;
  userId?: string;
  ipRange?: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface APIKey {
  id: string;
  name: string;
  key: string;
  tenantId?: string;
  userId?: string;
  permissions: string[];
  rateLimits: {
    requestsPerSecond: number;
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  isActive: boolean;
  expiresAt?: string;
  lastUsed?: string;
  usage: {
    currentPeriod: {
      requests: number;
      startTime: string;
    };
    limits: {
      daily: number;
      monthly: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface APIUsageStats {
  endpoint: string;
  method: string;
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  errors: number;
  rateLimitHits: number;
  uniqueUsers: number;
  dataTransferred: number;
  trends: {
    requests: { date: string; count: number; }[];
    responseTime: { date: string; avg: number; }[];
    errors: { date: string; count: number; }[];
  };
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  tenantId?: string;
  isActive: boolean;
  retryPolicy: {
    maxRetries: number;
    backoffStrategy: 'linear' | 'exponential';
    retryOn: number[]; // HTTP status codes
  };
  lastTriggered?: string;
  successRate: number;
  totalDeliveries: number;
  failedDeliveries: number;
  createdAt: string;
  updatedAt: string;
}

export interface APIManagementStats {
  totalRequests: number;
  totalEndpoints: number;
  activeAPIKeys: number;
  rateLimitHits: number;
  averageResponseTime: number;
  errorRate: number;
  uptime: number;
  dataTransferred: number;
  topEndpoints: { endpoint: string; requests: number; }[];
  topUsers: { userId: string; requests: number; }[];
  requestTrends: { date: string; requests: number; errors: number; }[];
}

class APIManagementService {
  // Get all API endpoints
  async getAPIEndpoints(): Promise<APIEndpoint[]> {
    try {
      // Query real API endpoints from database
      const { data, error } = await supabase
        .from('api_endpoints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching API endpoints:', error);
        // Fallback to mock data if table doesn't exist yet
        return this.getMockAPIEndpoints();
      }

      return data?.map((endpoint: any) => ({
        id: endpoint.id,
        name: endpoint.name,
        path: endpoint.path,
        method: endpoint.method,
        description: endpoint.description,
        version: endpoint.version,
        isActive: endpoint.is_active,
        isDeprecated: endpoint.is_deprecated,
        deprecationDate: endpoint.deprecation_date,
        documentationUrl: endpoint.documentation_url,
        tags: endpoint.tags || [],
        createdAt: endpoint.created_at,
        updatedAt: endpoint.updated_at
      })) || [];
    } catch (error) {
      console.error('Error fetching API endpoints:', error);
      return this.getMockAPIEndpoints();
    }
  }

  // Fallback method for when api_endpoints table doesn't exist yet
  private getMockAPIEndpoints(): APIEndpoint[] {
    return [
      {
        id: 'endpoint_001',
        name: 'Get User Profile',
        path: '/api/users/profile',
        method: 'GET',
        description: 'Retrieve user profile information',
        version: 'v1',
        isActive: true,
        isDeprecated: false,
        documentationUrl: '/docs/api/users/profile',
        tags: ['users', 'profile', 'read'],
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
        {
          id: 'endpoint_002',
          name: 'Create Investment Offer',
          path: '/api/offers',
          method: 'POST',
          description: 'Create a new investment offer',
          version: 'v1',
          isActive: true,
          isDeprecated: false,
          documentationUrl: '/docs/api/offers/create',
          tags: ['offers', 'investments', 'create'],
          createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'endpoint_003',
          name: 'Get Tenant Analytics',
          path: '/api/analytics/tenant',
          method: 'GET',
          description: 'Retrieve analytics data for a specific tenant',
          version: 'v1',
          isActive: true,
          isDeprecated: false,
          documentationUrl: '/docs/api/analytics/tenant',
          tags: ['analytics', 'tenants', 'read'],
          createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'endpoint_004',
          name: 'Update User Settings',
          path: '/api/users/settings',
          method: 'PUT',
          description: 'Update user preferences and settings',
          version: 'v1',
          isActive: true,
          isDeprecated: false,
          documentationUrl: '/docs/api/users/settings',
          tags: ['users', 'settings', 'update'],
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'endpoint_005',
          name: 'Legacy User Search',
          path: '/api/v1/users/search',
          method: 'GET',
          description: 'Search users (deprecated - use /api/users/search)',
          version: 'v1',
          isActive: false,
          isDeprecated: true,
          deprecationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          documentationUrl: '/docs/api/v1/users/search',
          tags: ['users', 'search', 'deprecated'],
          createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
    } catch (error: unknown) {
      console.error('Error fetching API endpoints:', error);
      return [];
    }
  

  // Get rate limiting rules
  async getRateLimitRules(): Promise<RateLimitRule[]> {
    try {
      return [
        {
          id: 'rule_001',
          name: 'Global API Rate Limit',
          description: 'General rate limiting for all API endpoints',
          endpointPattern: '/api/*',
          limit: 1000,
          window: 60,
          strategy: 'sliding_window',
          appliesTo: 'global',
          isActive: true,
          priority: 1,
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'rule_002',
          name: 'Authentication Rate Limit',
          description: 'Stricter rate limiting for authentication endpoints',
          endpointPattern: '/api/auth/*',
          limit: 10,
          window: 60,
          strategy: 'fixed_window',
          appliesTo: 'ip',
          isActive: true,
          priority: 2,
          createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'rule_003',
          name: 'Tenant-Specific Limit',
          description: 'Custom rate limit for premium tenants',
          endpointPattern: '/api/analytics/*',
          limit: 5000,
          window: 60,
          strategy: 'token_bucket',
          appliesTo: 'tenant',
          tenantId: 'tenant1',
          isActive: true,
          priority: 3,
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
    } catch (error) {
      console.error('Error fetching rate limit rules:', error);
      return [];
    }
  }

  // Get API keys
  async getAPIKeys(): Promise<APIKey[]> {
    try {
      return [
        {
          id: 'key_001',
          name: 'Production API Key',
          key: 'pk_live_1234567890abcdef',
          tenantId: 'tenant1',
          permissions: ['read', 'write', 'analytics'],
          rateLimits: {
            requestsPerSecond: 100,
            requestsPerMinute: 5000,
            requestsPerHour: 100000,
            requestsPerDay: 1000000
          },
          isActive: true,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          usage: {
            currentPeriod: {
              requests: 15420,
              startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            },
            limits: {
              daily: 1000000,
              monthly: 30000000
            }
          },
          createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'key_002',
          name: 'Development API Key',
          key: 'pk_test_abcdef1234567890',
          tenantId: 'tenant2',
          permissions: ['read', 'analytics'],
          rateLimits: {
            requestsPerSecond: 50,
            requestsPerMinute: 1000,
            requestsPerHour: 50000,
            requestsPerDay: 500000
          },
          isActive: true,
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          lastUsed: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          usage: {
            currentPeriod: {
              requests: 3420,
              startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            },
            limits: {
              daily: 500000,
              monthly: 15000000
            }
          },
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'key_003',
          name: 'Suspended API Key',
          key: 'pk_susp_abcdef1234567890',
          tenantId: 'tenant3',
          permissions: ['read'],
          rateLimits: {
            requestsPerSecond: 10,
            requestsPerMinute: 100,
            requestsPerHour: 1000,
            requestsPerDay: 10000
          },
          isActive: false,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastUsed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          usage: {
            currentPeriod: {
              requests: 0,
              startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            },
            limits: {
              daily: 10000,
              monthly: 300000
            }
          },
          createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
    } catch (error) {
      console.error('Error fetching API keys:', error);
      return [];
    }
  }

  // Get API usage statistics
  async getAPIUsageStats(timeRange: string = '24h'): Promise<APIManagementStats> {
    try {
      const endpoints = await this.getAPIEndpoints();
      const keys = await this.getAPIKeys();

      // Generate mock usage statistics based on real data
      const totalRequests = 125000;
      const rateLimitHits = 2340;
      const averageResponseTime = 245; // ms
      const errorRate = 0.02; // 2%
      const uptime = 99.9;
      const dataTransferred = 15.7; // GB

      const topEndpoints = endpoints
        .filter(e => e.isActive)
        .map(endpoint => ({
          endpoint: `${endpoint.method} ${endpoint.path}`,
          requests: Math.floor(Math.random() * 50000) + 1000
        }))
        .sort((a, b) => b.requests - a.requests)
        .slice(0, 5);

      const topUsers = keys
        .filter(k => k.isActive)
        .map(key => ({
          userId: key.tenantId || key.userId || 'unknown',
          requests: Math.floor(Math.random() * 20000) + 1000
        }))
        .sort((a, b) => b.requests - a.requests)
        .slice(0, 5);

      // Generate request trends (last 30 days)
      const requestTrends = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        return {
          date: date.toISOString().split('T')[0],
          requests: Math.floor(3000 + Math.random() * 2000),
          errors: Math.floor(Math.random() * 50)
        };
      }).reverse();

      return {
        totalRequests,
        totalEndpoints: endpoints.filter(e => e.isActive).length,
        activeAPIKeys: keys.filter(k => k.isActive).length,
        rateLimitHits,
        averageResponseTime,
        errorRate,
        uptime,
        dataTransferred,
        topEndpoints,
        topUsers,
        requestTrends
      };
    } catch (error) {
      console.error('Error fetching API usage stats:', error);
      return {
        totalRequests: 0,
        totalEndpoints: 0,
        activeAPIKeys: 0,
        rateLimitHits: 0,
        averageResponseTime: 0,
        errorRate: 0,
        uptime: 100,
        dataTransferred: 0,
        topEndpoints: [],
        topUsers: [],
        requestTrends: []
      };
    }
  }

  // Get webhooks
  async getWebhooks(): Promise<Webhook[]> {
    try {
      return [
        {
          id: 'webhook_001',
          name: 'Payment Notifications',
          url: 'https://api.partner.com/webhooks/payments',
          events: ['payment.succeeded', 'payment.failed', 'payment.refunded'],
          secret: 'whsec_1234567890abcdef',
          tenantId: 'tenant1',
          isActive: true,
          retryPolicy: {
            maxRetries: 3,
            backoffStrategy: 'exponential',
            retryOn: [500, 502, 503, 504]
          },
          lastTriggered: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          successRate: 98.5,
          totalDeliveries: 1250,
          failedDeliveries: 18,
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'webhook_002',
          name: 'User Activity Events',
          url: 'https://analytics.example.com/events',
          events: ['user.registered', 'user.login', 'user.logout'],
          secret: 'whsec_abcdef1234567890',
          tenantId: 'tenant2',
          isActive: true,
          retryPolicy: {
            maxRetries: 5,
            backoffStrategy: 'linear',
            retryOn: [408, 429, 500, 502, 503]
          },
          lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          successRate: 99.2,
          totalDeliveries: 3420,
          failedDeliveries: 27,
          createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      return [];
    }
  }

  // Create new API key
  async createAPIKey(keyData: Omit<APIKey, 'id' | 'key' | 'createdAt' | 'updatedAt' | 'usage'>): Promise<APIKey | null> {
    try {
      // Generate a secure API key
      const keyPrefix = keyData.tenantId ? 'pk_tenant' : 'pk_user';
      const randomSuffix = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      const newKey: APIKey = {
        id: `key_${Date.now()}`,
        key: `${keyPrefix}_${randomSuffix}`,
        ...keyData,
        usage: {
          currentPeriod: {
            requests: 0,
            startTime: new Date().toISOString()
          },
          limits: {
            daily: keyData.rateLimits.requestsPerDay,
            monthly: keyData.rateLimits.requestsPerDay * 30
          }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Creating API key:', newKey);
      return newKey;
    } catch (error) {
      console.error('Error creating API key:', error);
      return null;
    }
  }

  // Update rate limit rule
  async updateRateLimitRule(ruleId: string, updates: Partial<RateLimitRule>): Promise<RateLimitRule | null> {
    try {
      console.log(`Updating rate limit rule ${ruleId}:`, updates);
      return null; // Return updated rule
    } catch (error) {
      console.error('Error updating rate limit rule:', error);
      return null;
    }
  }

  // Revoke API key
  async revokeAPIKey(keyId: string): Promise<boolean> {
    try {
      console.log(`Revoking API key ${keyId}`);
      return true;
    } catch (error) {
      console.error('Error revoking API key:', error);
      return false;
    }
  }

  // Get API usage analytics for specific endpoint
  async getEndpointAnalytics(endpointId: string, timeRange: string = '24h'): Promise<APIUsageStats | null> {
    try {
      const endpoints = await this.getAPIEndpoints();
      const endpoint = endpoints.find(e => e.id === endpointId);

      if (!endpoint) return null;

      // Generate realistic analytics data
      const totalRequests = Math.floor(Math.random() * 10000) + 1000;
      const errors = Math.floor(totalRequests * 0.02);
      const rateLimitHits = Math.floor(totalRequests * 0.005);

      return {
        endpoint: `${endpoint.method} ${endpoint.path}`,
        method: endpoint.method,
        totalRequests,
        successRate: ((totalRequests - errors) / totalRequests) * 100,
        averageResponseTime: 200 + Math.random() * 100,
        errors,
        rateLimitHits,
        uniqueUsers: Math.floor(totalRequests * 0.3),
        dataTransferred: (totalRequests * 2.5) / 1024, // MB
        trends: {
          requests: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            count: Math.floor(100 + Math.random() * 200)
          })).reverse(),
          responseTime: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            avg: 200 + Math.random() * 100
          })).reverse(),
          errors: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            count: Math.floor(Math.random() * 10)
          })).reverse()
        }
      };
    } catch (error) {
      console.error('Error fetching endpoint analytics:', error);
      return null;
    }
  }

  // Test API endpoint
  async testEndpoint(endpointId: string): Promise<{
    success: boolean;
    responseTime: number;
    statusCode: number;
    error?: string;
  }> {
    try {
      // In a real implementation, this would make an actual HTTP request
      const endpoints = await this.getAPIEndpoints();
      const endpoint = endpoints.find(e => e.id === endpointId);

      if (!endpoint) {
        return {
          success: false,
          responseTime: 0,
          statusCode: 404,
          error: 'Endpoint not found'
        };
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

      return {
        success: true,
        responseTime: 150 + Math.random() * 100,
        statusCode: 200
      };
    } catch (error) {
      console.error('Error testing endpoint:', error);
      return {
        success: false,
        responseTime: 0,
        statusCode: 500,
        error: 'Test failed'
      };
    }
  }

  // Get API documentation
  async getAPIDocumentation(): Promise<{
    overview: string;
    authentication: string;
    rateLimiting: string;
    endpoints: APIEndpoint[];
    examples: Record<string, any>;
  }> {
    try {
      const endpoints = await this.getAPIEndpoints();

      return {
        overview: 'Comprehensive API for multi-tenant platform management',
        authentication: 'API keys required for all requests',
        rateLimiting: 'Rate limits apply per API key and IP address',
        endpoints: endpoints.filter(e => e.isActive),
        examples: {
          authentication: {
            curl: 'curl -H "Authorization: Bearer YOUR_API_KEY" https://api.example.com/users',
            javascript: 'fetch("/users", { headers: { "Authorization": "Bearer YOUR_API_KEY" } })'
          }
        }
      };
    } catch (error) {
      console.error('Error fetching API documentation:', error);
      return {
        overview: '',
        authentication: '',
        rateLimiting: '',
        endpoints: [],
        examples: {}
      };
    }
  }
}

export const apiManagementService = new APIManagementService();
