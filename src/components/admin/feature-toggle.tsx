"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { featureRegistry } from '@/features/registry';

interface FeatureToggleProps {
  feature: {
    key: string;
    name: string;
    description: string;
    version: string;
    author: string;
    tenantScoped: boolean;
    enabled: boolean;
  };
  tenantId?: string;
  onToggle?: (featureKey: string, enabled: boolean, tenantId?: string) => void;
}

export function FeatureToggle({ feature, tenantId, onToggle }: FeatureToggleProps) {
  const isEnabled = tenantId && feature.tenantScoped
    ? featureRegistry.isEnabled(feature.key, tenantId)
    : feature.enabled;

  const handleToggle = (enabled: boolean) => {
    if (tenantId && feature.tenantScoped) {
      if (enabled) {
        featureRegistry.enable(feature.key, tenantId);
      } else {
        featureRegistry.disable(feature.key, tenantId);
      }
    } else {
      if (enabled) {
        featureRegistry.enable(feature.key);
      } else {
        featureRegistry.disable(feature.key);
      }
    }

    onToggle?.(feature.key, enabled, tenantId);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {feature.name}
              {feature.tenantScoped && (
                <Badge variant="outline" className="text-xs">
                  Tenant-Scoped
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              {feature.description}
            </CardDescription>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggle}
            className="ml-4"
          />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Version {feature.version}</span>
          <span>By {feature.author}</span>
        </div>
      </CardContent>
    </Card>
  );
}