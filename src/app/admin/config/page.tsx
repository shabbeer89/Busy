"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Settings,
  Search,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Database,
  Shield,
  Mail,
  CreditCard,
  Zap,
  Globe,
  ToggleLeft
} from 'lucide-react';
import AdminLayout from '../layout';
import {
  PlatformConfig,
  ConfigCategory,
  configService
} from '@/services/config-service';
import { AdminConfigSkeleton } from '@/components/ui/skeleton';

const categoryIcons: Record<string, React.ElementType> = {
  general: Settings,
  security: Shield,
  email: Mail,
  payment: CreditCard,
  api: Zap,
  database: Database,
  features: ToggleLeft,
  localization: Globe
};

interface ConfigInputProps {
  config: PlatformConfig;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

function ConfigInput({ config, value, onChange, error }: ConfigInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (newValue: any) => {
    // Validate the value before calling onChange
    const validation = configService.validateConfigValue(config, newValue);
    if (validation.valid) {
      onChange(newValue);
    }
  };

  switch (config.type) {
    case 'boolean':
      return (
        <div className="flex items-center space-x-2">
          <Switch
            checked={Boolean(value)}
            onCheckedChange={handleChange}
            disabled={config.isReadOnly}
          />
          <Label className="text-sm text-gray-600">
            {value ? 'Enabled' : 'Disabled'}
          </Label>
        </div>
      );

    case 'password':
      return (
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Enter value"
            disabled={config.isReadOnly}
            className={error ? 'border-red-500' : ''}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      );

    case 'number':
      return (
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => handleChange(Number(e.target.value))}
          placeholder="Enter number"
          disabled={config.isReadOnly}
          className={error ? 'border-red-500' : ''}
        />
      );

    case 'json':
      return (
        <Textarea
          value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value || ''}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              handleChange(parsed);
            } catch {
              handleChange(e.target.value);
            }
          }}
          placeholder="Enter JSON"
          disabled={config.isReadOnly}
          className={error ? 'border-red-500' : ''}
          rows={4}
        />
      );

    default: // string
      return (
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Enter value"
          disabled={config.isReadOnly}
          className={error ? 'border-red-500' : ''}
        />
      );
  }
}

export default function ConfigPage() {
  const [categories, setCategories] = useState<ConfigCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('general');
  const [modifiedConfigs, setModifiedConfigs] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      const categoriesData = await configService.getConfigCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load configurations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (configId: string, value: any) => {
    setModifiedConfigs(prev => ({ ...prev, [configId]: value }));

    // Clear validation error when user starts typing
    if (validationErrors[configId]) {
      setValidationErrors(prev => ({ ...prev, [configId]: '' }));
    }
  };

  const handleSaveConfig = async (configId: string) => {
    const config = categories
      .flatMap(cat => cat.settings)
      .find(c => c.id === configId);

    if (!config) return;

    const newValue = modifiedConfigs[configId] ?? config.value;

    // Validate before saving
    const validation = configService.validateConfigValue(config, newValue);
    if (!validation.valid) {
      setValidationErrors(prev => ({ ...prev, [configId]: validation.error! }));
      return;
    }

    try {
      setSaving(configId);
      const success = await configService.updateConfig(configId, newValue);

      if (success) {
        // Remove from modified configs
        setModifiedConfigs(prev => {
          const { [configId]: _, ...rest } = prev;
          return rest;
        });

        // Reload configurations to get updated data
        await loadConfigurations();
      }
    } catch (error) {
      console.error('Failed to save configuration:', error);
    } finally {
      setSaving(null);
    }
  };

  const handleResetConfig = async (configId: string) => {
    try {
      const success = await configService.resetConfigToDefault(configId);
      if (success) {
        // Remove from modified configs
        setModifiedConfigs(prev => {
          const { [configId]: _, ...rest } = prev;
          return rest;
        });

        // Reload configurations
        await loadConfigurations();
      }
    } catch (error) {
      console.error('Failed to reset configuration:', error);
    }
  };

  const getCurrentValue = (config: PlatformConfig): any => {
    return modifiedConfigs[config.id] ?? config.value;
  };

  const hasUnsavedChanges = (config: PlatformConfig): boolean => {
    return modifiedConfigs[config.id] !== undefined;
  };

  const filteredCategories = categories.map(category => ({
    ...category,
    settings: category.settings.filter(setting =>
      setting.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setting.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setting.value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.settings.length > 0);

  if (loading) {
    return (
        <AdminConfigSkeleton ></AdminConfigSkeleton>
    );
  }

  return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white">Configuration Management</h2>
            <p className="text-slate-300">
              Manage platform-wide settings and feature flags
            </p>
          </div>
          <Button
            variant="outline"
            onClick={loadConfigurations}
            className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-300 hover:from-blue-500/30 hover:to-purple-500/30 hover:text-blue-200 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Search */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/30 hover:border-slate-500/50 transition-all duration-300">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search configurations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:bg-slate-700/50 focus:border-blue-500/50 transition-all duration-300"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Category Sidebar */}
          <Card className="lg:col-span-1 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/30 hover:border-slate-500/50 transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                📂 Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((category) => {
                const Icon = categoryIcons[category.id] || Settings;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      selectedCategory === category.id
                        ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-300 hover:from-blue-500/30 hover:to-purple-500/30 hover:text-blue-200 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
                        : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {category.name}
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* Configuration Settings */}
          <Card className="lg:col-span-3 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/30 hover:border-slate-500/50 transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                {React.createElement(categoryIcons[selectedCategory] || Settings, { className: "w-5 h-5" })}
                {categories.find(cat => cat.id === selectedCategory)?.name || 'Settings'}
              </CardTitle>
              <CardDescription className="text-slate-300">
                {categories.find(cat => cat.id === selectedCategory)?.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {filteredCategories
                .find(cat => cat.id === selectedCategory)
                ?.settings.map((config) => {
                  const currentValue = getCurrentValue(config);
                  const hasChanges = hasUnsavedChanges(config);
                  const validationError = validationErrors[config.id];

                  return (
                    <div key={config.id} className="space-y-3 p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Label className="text-sm font-medium">
                              {config.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Label>
                            {config.isSecret && (
                              <Lock className="w-3 h-3 text-gray-400" />
                            )}
                            {config.isReadOnly && (
                              <Badge variant="secondary" className="text-xs">Read Only</Badge>
                            )}
                          </div>

                          {config.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                              {config.description}
                            </p>
                          )}

                          <div className="flex items-center gap-2">
                            <ConfigInput
                              config={config}
                              value={currentValue}
                              onChange={(value) => handleConfigChange(config.id, value)}
                              error={validationError}
                            />

                            <div className="flex items-center gap-1">
                              {hasChanges && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSaveConfig(config.id)}
                                  disabled={saving === config.id}
                                  className="flex items-center gap-1"
                                >
                                  {saving === config.id ? (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Save className="w-3 h-3" />
                                  )}
                                  Save
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleResetConfig(config.id)}
                                className="flex items-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Reset
                              </Button>
                            </div>
                          </div>

                          {validationError && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                              <AlertCircle className="w-3 h-3" />
                              {validationError}
                            </div>
                          )}

                          {hasChanges && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
                              <Info className="w-3 h-3" />
                              Unsaved changes
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 flex items-center justify-between pt-2 border-t">
                        <span>
                          Last updated: {new Date(config.updatedAt).toLocaleString()}
                        </span>
                        <span>
                          Type: {config.type}
                        </span>
                      </div>
                    </div>
                  );
                })}

              {(!filteredCategories.find(cat => cat.id === selectedCategory)?.settings.length) && (
                <div className="text-center py-8 text-gray-500">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No configurations found</p>
                  <p className="text-sm">
                    {searchTerm ? 'Try adjusting your search terms' : 'No settings in this category'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Configuration Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">
                {categories.reduce((sum, cat) => sum + cat.settings.length, 0)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Settings</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">
                {Object.keys(modifiedConfigs).length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Unsaved Changes</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-purple-600">
                {categories.filter(cat => cat.settings.some(s => s.isSecret)).length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Categories with Secrets</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-orange-600">
                {categories.length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Configuration Categories</p>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}