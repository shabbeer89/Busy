// Plugin Architecture - Feature Registry System
// This implements a modular feature system for runtime extensibility

export interface FeatureDefinition {
  key: string;
  name: string;
  description: string;
  version: string;
  author: string;
  dependencies?: string[];
  config?: Record<string, any>;
  components?: {
    routes?: Record<string, any>;
    ui?: Record<string, any>;
    forms?: Record<string, any>;
  };
  services?: {
    api?: Record<string, any>;
    analytics?: Record<string, any>;
    notifications?: Record<string, any>;
  };
  hooks?: Record<string, any>;
  types?: Record<string, any>;
  enabled: boolean;
  tenantScoped: boolean;
}

export interface FeatureRegistry {
  register(feature: FeatureDefinition): void;
  unregister(featureKey: string): void;
  get(featureKey: string): FeatureDefinition | undefined;
  getAll(): FeatureDefinition[];
  isEnabled(featureKey: string, tenantId?: string): boolean;
  enable(featureKey: string, tenantId?: string): void;
  disable(featureKey: string, tenantId?: string): void;
  getTenantFeatures(tenantId: string): FeatureDefinition[];
}

class FeatureRegistryImpl implements FeatureRegistry {
  private features: Map<string, FeatureDefinition> = new Map();
  private tenantOverrides: Map<string, Map<string, boolean>> = new Map();

  register(feature: FeatureDefinition): void {
    // Validate feature dependencies
    if (feature.dependencies) {
      for (const dep of feature.dependencies) {
        if (!this.features.has(dep)) {
          throw new Error(`Feature ${feature.key} depends on ${dep} which is not registered`);
        }
      }
    }

    this.features.set(feature.key, feature);
  }

  unregister(featureKey: string): void {
    this.features.delete(featureKey);

    // Remove tenant overrides
    for (const tenantOverrides of this.tenantOverrides.values()) {
      tenantOverrides.delete(featureKey);
    }
  }

  get(featureKey: string): FeatureDefinition | undefined {
    return this.features.get(featureKey);
  }

  getAll(): FeatureDefinition[] {
    return Array.from(this.features.values());
  }

  isEnabled(featureKey: string, tenantId?: string): boolean {
    const feature = this.features.get(featureKey);
    if (!feature) return false;

    if (!feature.tenantScoped) {
      return feature.enabled;
    }

    // Tenant-scoped feature
    if (tenantId) {
      const tenantOverrides = this.tenantOverrides.get(tenantId);
      if (tenantOverrides?.has(featureKey)) {
        return tenantOverrides.get(featureKey)!;
      }
    }

    // Fall back to global setting
    return feature.enabled;
  }

  enable(featureKey: string, tenantId?: string): void {
    const feature = this.features.get(featureKey);
    if (!feature) return;

    if (feature.tenantScoped && tenantId) {
      let tenantOverrides = this.tenantOverrides.get(tenantId);
      if (!tenantOverrides) {
        tenantOverrides = new Map();
        this.tenantOverrides.set(tenantId, tenantOverrides);
      }
      tenantOverrides.set(featureKey, true);
    } else {
      feature.enabled = true;
    }
  }

  disable(featureKey: string, tenantId?: string): void {
    const feature = this.features.get(featureKey);
    if (!feature) return;

    if (feature.tenantScoped && tenantId) {
      let tenantOverrides = this.tenantOverrides.get(tenantId);
      if (!tenantOverrides) {
        tenantOverrides = new Map();
        this.tenantOverrides.set(tenantId, tenantOverrides);
      }
      tenantOverrides.set(featureKey, false);
    } else {
      feature.enabled = false;
    }
  }

  getTenantFeatures(tenantId: string): FeatureDefinition[] {
    return this.getAll().filter(feature =>
      feature.tenantScoped && this.isEnabled(feature.key, tenantId)
    );
  }
}

// Global feature registry instance
export const featureRegistry = new FeatureRegistryImpl();

// Feature flag hooks
export function useFeature(featureKey: string, tenantId?: string): boolean {
  return featureRegistry.isEnabled(featureKey, tenantId);
}

export function useFeatureConfig<T = any>(featureKey: string): T | undefined {
  const feature = featureRegistry.get(featureKey);
  return feature?.config as T;
}

export function useTenantFeatures(tenantId: string): FeatureDefinition[] {
  return featureRegistry.getTenantFeatures(tenantId);
}

// Feature guard component
export function FeatureGuard({
  feature,
  tenantId,
  fallback = null,
  children
}: {
  feature: string;
  tenantId?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}): React.ReactNode {
  const isEnabled = useFeature(feature, tenantId);
  return isEnabled ? children : fallback;
}

// Feature toggle utility for admin (React components to be created separately)
export interface FeatureToggleProps {
  feature: string;
  tenantId?: string;
  onToggle?: (enabled: boolean) => void;
}

// Utility functions for feature management
export function toggleFeature(feature: string, tenantId?: string): void {
  const isEnabled = featureRegistry.isEnabled(feature, tenantId);
  if (isEnabled) {
    featureRegistry.disable(feature, tenantId);
  } else {
    featureRegistry.enable(feature, tenantId);
  }
}