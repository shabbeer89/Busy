"use client";

import { createClient } from '@/lib/supabase-client';

const supabase = createClient();

export interface PlatformConfig {
  id: string;
  category: 'general' | 'security' | 'email' | 'payment' | 'api' | 'database' | 'features' | 'localization';
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json' | 'password';
  description?: string;
  isSecret: boolean;
  isReadOnly: boolean;
  updatedAt: string;
  updatedBy?: string;
}

export interface ConfigCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  settings: PlatformConfig[];
}

class ConfigService {
  async getAllConfigs(): Promise<PlatformConfig[]> {
    try {
      // Use mock data for now since database schema may not be applied yet
      return this.getMockConfigs();
    } catch (error) {
      console.error('Error fetching configurations:', error);
      return this.getMockConfigs();
    }
  }

  async getConfigsByCategory(category: string): Promise<PlatformConfig[]> {
    try {
      // Use mock data for now since database schema may not be applied yet
      const allConfigs = await this.getAllConfigs();
      return allConfigs.filter(config => config.category === category);
    } catch (error) {
      console.error('Error fetching configs by category:', error);
      const allConfigs = await this.getAllConfigs();
      return allConfigs.filter(config => config.category === category);
    }
  }

  async updateConfig(configId: string, value: any): Promise<PlatformConfig | null> {
    try {
      // Use mock data for now since database schema may not be applied yet
      console.log('Updating configuration:', configId, value);

      const allConfigs = await this.getAllConfigs();
      const config = allConfigs.find(c => c.id === configId);

      if (!config) {
        return null;
      }

      const updatedConfig: PlatformConfig = {
        ...config,
        value,
        updatedAt: new Date().toISOString(),
        updatedBy: 'current_user'
      };

      return updatedConfig;
    } catch (error) {
      console.error('Error updating configuration:', error);
      return null;
    }
  }

  async getConfigCategories(): Promise<ConfigCategory[]> {
    const allConfigs = await this.getAllConfigs();

    return [
      {
        id: 'general',
        name: 'General Settings',
        description: 'Basic platform configuration and branding',
        icon: 'Settings',
        settings: allConfigs.filter(c => c.category === 'general')
      },
      {
        id: 'security',
        name: 'Security Settings',
        description: 'Authentication, sessions, and security policies',
        icon: 'Shield',
        settings: allConfigs.filter(c => c.category === 'security')
      },
      {
        id: 'email',
        name: 'Email Settings',
        description: 'SMTP configuration and email templates',
        icon: 'Mail',
        settings: allConfigs.filter(c => c.category === 'email')
      },
      {
        id: 'payment',
        name: 'Payment Settings',
        description: 'Payment gateway and billing configuration',
        icon: 'CreditCard',
        settings: allConfigs.filter(c => c.category === 'payment')
      },
      {
        id: 'api',
        name: 'API Settings',
        description: 'API keys, rate limiting, and webhook configuration',
        icon: 'Zap',
        settings: allConfigs.filter(c => c.category === 'api')
      },
      {
        id: 'database',
        name: 'Database Settings',
        description: 'Database connections and performance settings',
        icon: 'Database',
        settings: allConfigs.filter(c => c.category === 'database')
      },
      {
        id: 'features',
        name: 'Feature Flags',
        description: 'Enable or disable platform features',
        icon: 'ToggleLeft',
        settings: allConfigs.filter(c => c.category === 'features')
      },
      {
        id: 'localization',
        name: 'Localization',
        description: 'Language, timezone, and regional settings',
        icon: 'Globe',
        settings: allConfigs.filter(c => c.category === 'localization')
      }
    ].filter(category => category.settings.length > 0);
  }

  async resetConfigToDefault(configId: string): Promise<boolean> {
    try {
      const allConfigs = await this.getAllConfigs();
      const config = allConfigs.find(c => c.id === configId);

      if (!config) {
        throw new Error('Configuration not found');
      }

      let defaultValue: any;
      switch (config.key) {
        case 'site_name': defaultValue = 'Multi-Tenant Platform'; break;
        case 'maintenance_mode': defaultValue = false; break;
        case 'session_timeout': defaultValue = 3600; break;
        case 'max_login_attempts': defaultValue = 5; break;
        default: defaultValue = config.value;
      }

      const updatedConfig = await this.updateConfig(configId, defaultValue);
      return updatedConfig !== null;
    } catch (error) {
      console.error('Error resetting configuration:', error);
      return false;
    }
  }

  async getConfigValue(key: string): Promise<any> {
    const allConfigs = await this.getAllConfigs();
    const config = allConfigs.find(c => c.key === key);
    return config?.value;
  }

  async setConfigValue(key: string, value: any): Promise<boolean> {
    try {
      const allConfigs = await this.getAllConfigs();
      const config = allConfigs.find(c => c.key === key);

      if (!config) {
        throw new Error(`Configuration key '${key}' not found`);
      }

      const updatedConfig = await this.updateConfig(config.id, value);
      return updatedConfig !== null;
    } catch (error) {
      console.error('Error setting configuration value:', error);
      return false;
    }
  }

  validateConfigValue(config: PlatformConfig, value: any): { valid: boolean; error?: string } {
    switch (config.type) {
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return { valid: false, error: 'Value must be a valid number' };
        }
        if (config.key === 'session_timeout' && value < 60) {
          return { valid: false, error: 'Session timeout must be at least 60 seconds' };
        }
        if (config.key === 'max_login_attempts' && value < 1) {
          return { valid: false, error: 'Max login attempts must be at least 1' };
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          return { valid: false, error: 'Value must be true or false' };
        }
        break;
      case 'json':
        try {
          if (typeof value === 'string') {
            JSON.parse(value);
          } else if (typeof value !== 'object') {
            return { valid: false, error: 'Value must be valid JSON' };
          }
        } catch {
          return { valid: false, error: 'Value must be valid JSON' };
        }
        break;
      case 'string':
        if (typeof value !== 'string') {
          return { valid: false, error: 'Value must be a string' };
        }
        if (config.key === 'site_name' && value.trim().length < 2) {
          return { valid: false, error: 'Site name must be at least 2 characters' };
        }
        break;
    }
    return { valid: true };
  }

  private getMockConfigs(): PlatformConfig[] {
    return [
      {
        id: '1',
        category: 'general',
        key: 'site_name',
        value: 'Multi-Tenant Platform',
        type: 'string',
        description: 'The main site name displayed in headers and emails',
        isSecret: false,
        isReadOnly: false,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
      },
      {
        id: '2',
        category: 'general',
        key: 'site_description',
        value: 'A powerful multi-tenant platform for modern applications',
        type: 'string',
        description: 'Site description for SEO and meta tags',
        isSecret: false,
        isReadOnly: false,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
      },
      {
        id: '3',
        category: 'general',
        key: 'maintenance_mode',
        value: false,
        type: 'boolean',
        description: 'Enable maintenance mode to show maintenance page to users',
        isSecret: false,
        isReadOnly: false,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
      },
      {
        id: '4',
        category: 'security',
        key: 'session_timeout',
        value: 3600,
        type: 'number',
        description: 'Session timeout in seconds (default: 3600 = 1 hour)',
        isSecret: false,
        isReadOnly: false,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
      },
      {
        id: '5',
        category: 'security',
        key: 'max_login_attempts',
        value: 5,
        type: 'number',
        description: 'Maximum failed login attempts before account lockout',
        isSecret: false,
        isReadOnly: false,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
      },
      {
        id: '6',
        category: 'email',
        key: 'smtp_host',
        value: 'smtp.example.com',
        type: 'string',
        description: 'SMTP server hostname',
        isSecret: false,
        isReadOnly: false,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
      },
      {
        id: '7',
        category: 'email',
        key: 'smtp_username',
        value: 'noreply@example.com',
        type: 'string',
        description: 'SMTP authentication username',
        isSecret: false,
        isReadOnly: false,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
      },
      {
        id: '8',
        category: 'email',
        key: 'smtp_password',
        value: 'password123',
        type: 'password',
        description: 'SMTP authentication password',
        isSecret: true,
        isReadOnly: false,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
      },
      {
        id: '9',
        category: 'features',
        key: 'enable_video_calling',
        value: true,
        type: 'boolean',
        description: 'Enable video calling feature across the platform',
        isSecret: false,
        isReadOnly: false,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
      },
      {
        id: '10',
        category: 'features',
        key: 'enable_crypto_payments',
        value: false,
        type: 'boolean',
        description: 'Enable cryptocurrency payment processing',
        isSecret: false,
        isReadOnly: false,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
      },
      {
        id: '11',
        category: 'api',
        key: 'rate_limit_per_minute',
        value: 1000,
        type: 'number',
        description: 'API rate limit per minute per user',
        isSecret: false,
        isReadOnly: false,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
      },
      {
        id: '12',
        category: 'localization',
        key: 'default_timezone',
        value: 'UTC',
        type: 'string',
        description: 'Default timezone for the platform',
        isSecret: false,
        isReadOnly: false,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
      },
      {
        id: '13',
        category: 'localization',
        key: 'supported_languages',
        value: ['en', 'es', 'fr', 'de'],
        type: 'json',
        description: 'List of supported language codes',
        isSecret: false,
        isReadOnly: false,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
      }
    ];
  }
}

export const configService = new ConfigService();
