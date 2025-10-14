"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TenantCard } from '@/components/admin/tenant-card';
import { Plus, Search, Filter } from 'lucide-react';
import AdminLayout from '../layout';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'pending';
  subscription: {
    plan: string;
    status: string;
    expiresAt: string;
  };
  stats: {
    users: number;
    revenue: number;
    growth: number;
  };
  createdAt: string;
}

export default function TenantsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock tenant data
  const mockTenants: Tenant[] = [
    {
      id: '1',
      name: 'TechVentures Inc.',
      slug: 'techventures',
      status: 'active',
      subscription: {
        plan: 'Enterprise',
        status: 'active',
        expiresAt: '2024-12-31',
      },
      stats: {
        users: 245,
        revenue: 12500,
        growth: 15.3,
      },
      createdAt: '2023-06-15T10:00:00Z',
    },
    {
      id: '2',
      name: 'GreenEnergy Solutions',
      slug: 'greenenergy',
      status: 'active',
      subscription: {
        plan: 'Pro',
        status: 'active',
        expiresAt: '2024-08-15',
      },
      stats: {
        users: 89,
        revenue: 3200,
        growth: 8.7,
      },
      createdAt: '2023-09-22T14:30:00Z',
    },
    {
      id: '3',
      name: 'FinTech Innovations',
      slug: 'fintech-innovations',
      status: 'suspended',
      subscription: {
        plan: 'Basic',
        status: 'expired',
        expiresAt: '2024-01-01',
      },
      stats: {
        users: 34,
        revenue: 800,
        growth: -2.1,
      },
      createdAt: '2023-11-08T09:15:00Z',
    },
  ];

  const filteredTenants = mockTenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewTenant = (tenantId: string) => {
    console.log('View tenant:', tenantId);
    // Navigate to tenant details page
  };

  const handleEditTenant = (tenantId: string) => {
    console.log('Edit tenant:', tenantId);
    // Navigate to tenant edit page
  };

  const handleImpersonate = (tenantId: string) => {
    console.log('Impersonate tenant:', tenantId);
    // Start impersonation session
  };

  const handleCreateTenant = () => {
    console.log('Create new tenant');
    // Navigate to tenant creation page
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tenant Management</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Manage all tenants on the platform
            </p>
          </div>
          <Button onClick={handleCreateTenant} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Tenant
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">{mockTenants.length}</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Tenants</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">
                {mockTenants.filter(t => t.status === 'active').length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Active Tenants</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-orange-600">
                {mockTenants.filter(t => t.status === 'suspended').length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Suspended</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-purple-600">
                ${mockTenants.reduce((sum, t) => sum + t.stats.revenue, 0).toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search tenants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tenants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenants.map((tenant) => (
            <TenantCard
              key={tenant.id}
              tenant={tenant}
              onView={handleViewTenant}
              onEdit={handleEditTenant}
              onImpersonate={handleImpersonate}
            />
          ))}
        </div>

        {filteredTenants.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-300">
                No tenants found matching your criteria.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}