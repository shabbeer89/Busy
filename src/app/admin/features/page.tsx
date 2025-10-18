"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FeatureToggle } from '@/components/admin/feature-toggle';
import { featureRegistry } from '@/features/registry';
import { Badge } from '@/components/ui/badge';
import { Settings, Plus, RefreshCw } from 'lucide-react';
import AdminLayout from '../layout';

export default function FeaturesPage() {
  const [selectedTenant, setSelectedTenant] = useState<string>('global');
  const [refreshKey, setRefreshKey] = useState(0);

  // Mock feature data
  const mockFeatures = [
    {
      key: 'video-calling',
      name: 'Video Calling',
      description: 'Enable real-time video calls between matched users',
      version: '1.2.0',
      author: 'Platform Team',
      tenantScoped: true,
      enabled: true,
    },
    {
      key: 'crypto-wallet',
      name: 'Crypto Wallet Integration',
      description: 'Allow users to connect crypto wallets for transactions',
      version: '2.1.0',
      author: 'Finance Team',
      tenantScoped: true,
      enabled: false,
    },
    {
      key: 'babt-verification',
      name: 'BABT Verification',
      description: 'Require Binance BABT verification for premium features',
      version: '1.0.0',
      author: 'Security Team',
      tenantScoped: true,
      enabled: true,
    },
    {
      key: 'advanced-analytics',
      name: 'Advanced Analytics',
      description: 'Detailed insights and reporting for tenant performance',
      version: '1.5.0',
      author: 'Analytics Team',
      tenantScoped: false,
      enabled: true,
    },
    {
      key: 'ai-matching',
      name: 'AI-Powered Matching',
      description: 'Use machine learning for better user matches',
      version: '2.0.0',
      author: 'AI Team',
      tenantScoped: true,
      enabled: true,
    },
  ];

  // Register features if not already registered
  useState(() => {
    mockFeatures.forEach(feature => {
      if (!featureRegistry.get(feature.key)) {
        featureRegistry.register(feature);
      }
    });
  });

  const handleFeatureToggle = (featureKey: string, enabled: boolean, tenantId?: string) => {
    console.log(`Feature ${featureKey} ${enabled ? 'enabled' : 'disabled'}${tenantId ? ` for tenant ${tenantId}` : ' globally'}`);
    setRefreshKey(prev => prev + 1); // Force re-render
  };

  const handleCreateFeature = () => {
    console.log('Create new feature');
    // Navigate to feature creation page
  };

  const handleRefreshFeatures = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Mock tenant data for tenant-scoped features
  const mockTenants = [
    { id: 'global', name: 'Global Settings' },
    { id: 'techventures', name: 'TechVentures Inc.' },
    { id: 'greenenergy', name: 'GreenEnergy Solutions' },
    { id: 'fintech', name: 'FinTech Innovations' },
  ];

  const tenantScopedFeatures = mockFeatures.filter(f => f.tenantScoped);
  const globalFeatures = mockFeatures.filter(f => !f.tenantScoped);

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Feature Management</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Control feature availability across tenants
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefreshFeatures}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleCreateFeature} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Feature
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">{mockFeatures.length}</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Features</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">
                {mockFeatures.filter(f => f.enabled).length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Enabled Features</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-purple-600">
                {tenantScopedFeatures.length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Tenant-Scoped</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-orange-600">
                {mockFeatures.filter(f => f.tenantScoped).length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Configurable</p>
            </CardContent>
          </Card>
        </div>

        {/* Tenant Selector for Tenant-Scoped Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Tenant-Scoped Features
            </CardTitle>
            <CardDescription>
              Configure features for specific tenants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <label className="text-sm font-medium">Select Tenant:</label>
              <select
                value={selectedTenant}
                onChange={(e) => setSelectedTenant(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {mockTenants.map(tenant => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              {tenantScopedFeatures.map((feature) => (
                <FeatureToggle
                  key={`${feature.key}-${selectedTenant}-${refreshKey}`}
                  feature={feature}
                  tenantId={selectedTenant !== 'global' ? selectedTenant : undefined}
                  onToggle={handleFeatureToggle}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Global Features */}
        <Card>
          <CardHeader>
            <CardTitle>Global Features</CardTitle>
            <CardDescription>
              Features that apply to all tenants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {globalFeatures.map((feature) => (
                <FeatureToggle
                  key={`${feature.key}-global-${refreshKey}`}
                  feature={feature}
                  onToggle={handleFeatureToggle}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Feature Registry Info */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Registry</CardTitle>
            <CardDescription>
              System information about registered features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Registered:</span>
                <p className="text-gray-600 dark:text-gray-300">
                  {featureRegistry.getAll().length} features
                </p>
              </div>
              <div>
                <span className="font-medium">Active Features:</span>
                <p className="text-gray-600 dark:text-gray-300">
                  {featureRegistry.getAll().filter(f => f.enabled).length} features
                </p>
              </div>
              <div>
                <span className="font-medium">Tenant-Scoped:</span>
                <p className="text-gray-600 dark:text-gray-300">
                  {featureRegistry.getAll().filter(f => f.tenantScoped).length} features
                </p>
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>
                <p className="text-gray-600 dark:text-gray-300">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}