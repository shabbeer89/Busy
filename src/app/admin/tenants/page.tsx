"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Building,
  Users,
  Settings,
  MoreHorizontal,
  Filter,
  TrendingUp,
  CreditCard,
  DollarSign
} from 'lucide-react';
import AdminLayout from '../layout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tenant, adminService } from '@/services/admin-service';
import { TenantForm } from '@/components/admin/tenant-form';
import { billingService, TenantSubscription, SubscriptionPlan, Invoice, BillingStats } from '@/services/billing-service';
import { AdminTenantsSkeleton } from '@/components/ui/skeleton';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  // Enhanced billing features
  const [subscriptions, setSubscriptions] = useState<TenantSubscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billingStats, setBillingStats] = useState<BillingStats | null>(null);
  const [showBillingDetails, setShowBillingDetails] = useState<string | null>(null);
  const [selectedTenantForBilling, setSelectedTenantForBilling] = useState<Tenant | null>(null);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const [tenantsData, plansData, statsData] = await Promise.all([
        adminService.getTenants(),
        billingService.getSubscriptionPlans(),
        billingService.getBillingStats()
      ]);
      setTenants(tenantsData);
      setPlans(plansData);
      setBillingStats(statsData);

      // Load subscriptions for all tenants
      const allSubscriptions = await billingService.getTenantSubscriptions();
      setSubscriptions(allSubscriptions);
    } catch (error) {
      console.error('Failed to load tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async (tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTenant = await adminService.createTenant(tenantData);
      if (newTenant) {
        setTenants(prev => [newTenant, ...prev]);
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Failed to create tenant:', error);
    }
  };

  const handleEditTenant = (tenant: Tenant) => {
    setEditingTenant(tenant);
  };

  const handleUpdateTenant = async (tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingTenant) return;

    try {
      const updatedTenant = await adminService.updateTenant(editingTenant.id, tenantData);
      if (updatedTenant) {
        setTenants(prev => prev.map(t => t.id === editingTenant.id ? updatedTenant : t));
        setEditingTenant(null);
      }
    } catch (error) {
      console.error('Failed to update tenant:', error);
    }
  };

  const handleDeleteTenant = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      return;
    }

    try {
      const success = await adminService.deleteTenant(id);
      if (success) {
        setTenants(prev => prev.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete tenant:', error);
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
        <AdminTenantsSkeleton />
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tenant Management</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Manage tenants, their settings, and access permissions
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Tenant
          </Button>
        </div>

        {/* Enhanced Stats with Billing Information */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">{tenants.length}</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Tenants</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">
                {tenants.filter(t => t.status === 'active').length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Active Tenants</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-purple-600">
                {billingStats?.activeSubscriptions || 0}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Active Subscriptions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-orange-600">
                ${billingStats?.monthlyRecurringRevenue?.toFixed(0) || '0'}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Monthly Revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-indigo-600">
                {billingStats?.trialSubscriptions || 0}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Free Trials</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">
                +{billingStats?.growthRate?.toFixed(1) || '0'}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Growth Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Billing Overview Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subscription Plans Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Subscription Plans
              </CardTitle>
              <CardDescription>
                Available plans and pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plans.slice(0, 4).map((plan) => (
                  <div key={plan.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {plan.name}
                      </h4>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          ${plan.price}/{plan.interval === 'monthly' ? 'mo' : 'yr'}
                        </div>
                        {plan.isPopular && (
                          <Badge className="bg-green-100 text-green-800">Popular</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {plan.description}
                    </p>
                    <div className="text-xs text-gray-500">
                      <div>Users: {plan.features.maxUsers === -1 ? 'Unlimited' : plan.features.maxUsers}</div>
                      <div>Storage: {plan.features.storageLimit}GB</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Revenue by Plan
              </CardTitle>
              <CardDescription>
                Monthly recurring revenue breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(billingStats?.revenueByPlan || {})
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([planName, revenue]) => (
                    <div key={planName} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{planName}</span>
                      <div className="text-right">
                        <div className="font-bold">${revenue.toFixed(0)}</div>
                        <div className="text-xs text-gray-500">per month</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Paying Tenants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Top Paying Tenants
              </CardTitle>
              <CardDescription>
                Highest revenue generating tenants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {billingStats?.topPayingTenants?.slice(0, 5).map((tenant, index) => (
                  <div key={tenant.tenantId} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium truncate">{tenant.tenantName}</span>
                    </div>
                    <div className="font-bold text-green-600">
                      ${tenant.revenue.toFixed(0)}
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-4 text-gray-500">
                    <p>No subscription data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center">
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
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tenants Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              All Tenants
            </CardTitle>
            <CardDescription>
              Complete list of tenants in your system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTenants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tenants found matching your criteria.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {tenant.name}
                          </div>
                          {tenant.domain && (
                            <div className="text-sm text-gray-500">
                              {tenant.domain}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {tenant.slug}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(tenant.status)}>
                          {tenant.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(tenant.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {(() => {
                            const tenantSubscription = subscriptions.find(s => s.tenantId === tenant.id);
                            if (!tenantSubscription) {
                              return <span className="text-gray-400">No subscription</span>;
                            }
                            return (
                              <div>
                                <div className="font-medium">{tenantSubscription.planName}</div>
                                <div className="text-xs text-gray-500">
                                  {tenantSubscription.status} • ${tenantSubscription.totalAmount}/{tenantSubscription.planName === 'Free' ? 'mo' : 'mo'}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {(() => {
                            const tenantSubscription = subscriptions.find(s => s.tenantId === tenant.id);
                            const revenue = billingStats?.topPayingTenants?.find(t => t.tenantId === tenant.id)?.revenue || 0;
                            return (
                              <div className="font-medium text-green-600">
                                ${revenue.toFixed(0)}/mo
                              </div>
                            );
                          })()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowBillingDetails(tenant.id)}
                          >
                            <CreditCard className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {/* TODO: Open settings modal */}}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {/* TODO: Open users modal */}}
                          >
                            <Users className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => handleEditTenant(tenant)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteTenant(tenant.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tenant Forms */}
      <TenantForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSubmit={handleCreateTenant}
        mode="create"
      />

      {editingTenant && (
        <TenantForm
          open={!!editingTenant}
          onOpenChange={(open) => !open && setEditingTenant(null)}
          onSubmit={handleUpdateTenant}
          initialData={editingTenant}
          mode="edit"
        />
      )}
    </>
  );
}