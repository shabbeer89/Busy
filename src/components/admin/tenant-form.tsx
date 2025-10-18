"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tenant } from '@/services/admin-service';

interface TenantFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Partial<Tenant>;
  mode?: 'create' | 'edit';
}

export function TenantForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode = 'create'
}: TenantFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    domain: initialData?.domain || '',
    status: initialData?.status || 'active' as Tenant['status'],
    settings: initialData?.settings || {}
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tenant name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Tenant slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    if (formData.domain && !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.domain)) {
      newErrors.domain = 'Please enter a valid domain name';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        domain: formData.domain.trim() || undefined,
        status: formData.status,
        settings: formData.settings
      });

      // Reset form
      setFormData({
        name: '',
        slug: '',
        domain: '',
        status: 'active',
        settings: {}
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting tenant form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-generate slug from name if slug is empty
    if (field === 'name' && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSettingsChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Tenant' : 'Edit Tenant'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new tenant with custom settings and permissions.'
              : 'Update tenant information and settings.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tenant Name */}
          <div>
            <Label htmlFor="name">Tenant Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter tenant name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Tenant Slug */}
          <div>
            <Label htmlFor="slug">Tenant Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => handleInputChange('slug', e.target.value)}
              placeholder="tenant-slug"
              className={errors.slug ? 'border-red-500' : ''}
            />
            {errors.slug && (
              <p className="text-sm text-red-600 mt-1">{errors.slug}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Used in URLs and as a unique identifier
            </p>
          </div>

          {/* Domain */}
          <div>
            <Label htmlFor="domain">Custom Domain</Label>
            <Input
              id="domain"
              value={formData.domain}
              onChange={(e) => handleInputChange('domain', e.target.value)}
              placeholder="tenant.example.com"
              className={errors.domain ? 'border-red-500' : ''}
            />
            {errors.domain && (
              <p className="text-sm text-red-600 mt-1">{errors.domain}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Optional: Custom domain for this tenant
            </p>
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Settings */}
          <div className="space-y-3">
            <Label>Tenant Settings</Label>

            <div>
              <Label htmlFor="maxUsers" className="text-sm text-gray-600">Max Users</Label>
              <Input
                id="maxUsers"
                type="number"
                value={formData.settings.maxUsers || ''}
                onChange={(e) => handleSettingsChange('maxUsers', e.target.value)}
                placeholder="100"
              />
            </div>

            <div>
              <Label htmlFor="features" className="text-sm text-gray-600">Enabled Features</Label>
              <Input
                id="features"
                value={formData.settings.features || ''}
                onChange={(e) => handleSettingsChange('features', e.target.value)}
                placeholder="feature1,feature2,feature3"
              />
              <p className="text-xs text-gray-500 mt-1">
                Comma-separated list of enabled features
              </p>
            </div>

            <div>
              <Label htmlFor="branding" className="text-sm text-gray-600">Branding</Label>
              <Textarea
                id="branding"
                value={formData.settings.branding || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleSettingsChange('branding', e.target.value)}
                placeholder='{"logo": "url", "colors": {"primary": "#000"}}'
                rows={2}
              />
              <p className="text-xs text-gray-500 mt-1">
                JSON configuration for custom branding
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : mode === 'create' ? 'Create Tenant' : 'Update Tenant'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}