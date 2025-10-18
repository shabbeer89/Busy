"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface BrandingConfig {
  // Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;

  // Typography
  fontFamily: string;
  headingFontFamily?: string;

  // Logo
  logoUrl?: string;
  logoAlt: string;
  faviconUrl?: string;

  // Images
  heroBackgroundUrl?: string;
  loginBackgroundUrl?: string;

  // Content
  siteName: string;
  tagline?: string;
  description?: string;

  // Contact
  supportEmail?: string;
  contactPhone?: string;

  // Social Links
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };

  // Legal
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;

  // Custom CSS
  customCss?: string;
}

interface BrandingContextType {
  branding: BrandingConfig;
  isLoading: boolean;
  updateBranding: (config: Partial<BrandingConfig>) => Promise<void>;
  resetToDefault: () => Promise<void>;
}

const defaultBranding: BrandingConfig = {
  primaryColor: '#3b82f6',
  secondaryColor: '#64748b',
  accentColor: '#f59e0b',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  fontFamily: 'Inter, system-ui, sans-serif',
  logoAlt: 'Strategic Partnership',
  siteName: 'Strategic Partnership',
  tagline: 'Connecting Entrepreneurs & Investors',
  description: 'Intelligent business matching platform for entrepreneurs and strategic investors',
};

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

interface BrandingProviderProps {
  tenantId?: string;
  children: React.ReactNode;
}

export function BrandingProvider({ tenantId, children }: BrandingProviderProps) {
  const [branding, setBranding] = useState<BrandingConfig>(defaultBranding);
  const [isLoading, setIsLoading] = useState(true);

  // Load tenant-specific branding
  useEffect(() => {
    const loadBranding = async () => {
      if (!tenantId) {
        setBranding(defaultBranding);
        setIsLoading(false);
        return;
      }

      try {
        // In a real implementation, this would fetch from your branding API
        // For now, we'll use mock tenant-specific branding
        const tenantBranding = await getTenantBranding(tenantId);
        setBranding({ ...defaultBranding, ...tenantBranding });
      } catch (error) {
        console.error('Failed to load branding:', error);
        setBranding(defaultBranding);
      } finally {
        setIsLoading(false);
      }
    };

    loadBranding();
  }, [tenantId]);

  const updateBranding = async (config: Partial<BrandingConfig>): Promise<void> => {
    try {
      // In a real implementation, this would save to your branding API
      const updatedBranding = { ...branding, ...config };
      setBranding(updatedBranding);

      if (tenantId) {
        await saveTenantBranding(tenantId, config);
      }

      // Apply CSS variables for dynamic theming
      applyBrandingStyles(updatedBranding);
    } catch (error) {
      console.error('Failed to update branding:', error);
      throw error;
    }
  };

  const resetToDefault = async (): Promise<void> => {
    try {
      setBranding(defaultBranding);
      applyBrandingStyles(defaultBranding);

      if (tenantId) {
        await saveTenantBranding(tenantId, defaultBranding);
      }
    } catch (error) {
      console.error('Failed to reset branding:', error);
      throw error;
    }
  };

  // Apply CSS custom properties for theming
  const applyBrandingStyles = (config: BrandingConfig) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.style.setProperty('--brand-primary', config.primaryColor);
    root.style.setProperty('--brand-secondary', config.secondaryColor);
    root.style.setProperty('--brand-accent', config.accentColor);
    root.style.setProperty('--brand-background', config.backgroundColor);
    root.style.setProperty('--brand-text', config.textColor);
    root.style.setProperty('--brand-font-family', config.fontFamily);

    // Update favicon if provided
    if (config.faviconUrl) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = config.faviconUrl;
      }
    }

    // Apply custom CSS
    if (config.customCss) {
      let customStyle = document.getElementById('custom-branding-css') as HTMLStyleElement;
      if (!customStyle) {
        customStyle = document.createElement('style');
        customStyle.id = 'custom-branding-css';
        document.head.appendChild(customStyle);
      }
      customStyle.textContent = config.customCss;
    }
  };

  // Initialize branding styles on mount
  useEffect(() => {
    applyBrandingStyles(branding);
  }, [branding]);

  const contextValue: BrandingContextType = {
    branding,
    isLoading,
    updateBranding,
    resetToDefault,
  };

  return (
    <BrandingContext.Provider value={contextValue}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding(): BrandingContextType {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}

// Mock functions for tenant branding (replace with real API calls)
async function getTenantBranding(tenantId: string): Promise<Partial<BrandingConfig>> {
  // Mock tenant-specific branding
  const tenantBrandings: Record<string, Partial<BrandingConfig>> = {
    'techventures': {
      primaryColor: '#10b981',
      secondaryColor: '#059669',
      accentColor: '#f59e0b',
      siteName: 'TechVentures',
      tagline: 'Innovating Tomorrow',
      logoAlt: 'TechVentures Logo',
    },
    'greenenergy': {
      primaryColor: '#22c55e',
      secondaryColor: '#16a34a',
      accentColor: '#84cc16',
      backgroundColor: '#f0fdf4',
      siteName: 'GreenEnergy Solutions',
      tagline: 'Sustainable Future',
      logoAlt: 'GreenEnergy Logo',
    },
    'fintech': {
      primaryColor: '#3b82f6',
      secondaryColor: '#1d4ed8',
      accentColor: '#f59e0b',
      siteName: 'FinTech Innovations',
      tagline: 'Financial Technology for All',
      logoAlt: 'FinTech Logo',
    },
  };

  return tenantBrandings[tenantId] || {};
}

async function saveTenantBranding(tenantId: string, config: Partial<BrandingConfig>): Promise<void> {
  // Mock API call - in real implementation, save to database
  console.log(`Saving branding for tenant ${tenantId}:`, config);

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
}

// Branding preview component
export function BrandingPreview({ config }: { config: BrandingConfig }) {
  return (
    <div
      className="border rounded-lg p-6 space-y-4"
      style={{
        backgroundColor: config.backgroundColor,
        color: config.textColor,
        fontFamily: config.fontFamily,
      }}
    >
      {/* Header Preview */}
      <div className="text-center">
        {config.logoUrl ? (
          <img
            src={config.logoUrl}
            alt={config.logoAlt}
            className="h-12 mx-auto mb-2"
          />
        ) : (
          <div
            className="text-2xl font-bold mx-auto mb-2"
            style={{ color: config.primaryColor }}
          >
            {config.siteName}
          </div>
        )}
        {config.tagline && (
          <p className="text-sm opacity-80">{config.tagline}</p>
        )}
      </div>

      {/* Button Preview */}
      <div className="flex justify-center gap-4">
        <button
          className="px-6 py-2 rounded-md text-white font-medium"
          style={{ backgroundColor: config.primaryColor }}
        >
          Primary Button
        </button>
        <button
          className="px-6 py-2 rounded-md border font-medium"
          style={{
            borderColor: config.secondaryColor,
            color: config.secondaryColor,
          }}
        >
          Secondary Button
        </button>
      </div>

      {/* Color Palette */}
      <div className="grid grid-cols-4 gap-2 text-xs text-center">
        <div>
          <div
            className="w-full h-8 rounded mb-1"
            style={{ backgroundColor: config.primaryColor }}
          />
          Primary
        </div>
        <div>
          <div
            className="w-full h-8 rounded mb-1"
            style={{ backgroundColor: config.secondaryColor }}
          />
          Secondary
        </div>
        <div>
          <div
            className="w-full h-8 rounded mb-1"
            style={{ backgroundColor: config.accentColor }}
          />
          Accent
        </div>
        <div>
          <div
            className="w-full h-8 rounded mb-1"
            style={{ backgroundColor: config.backgroundColor }}
          />
          Background
        </div>
      </div>
    </div>
  );
}