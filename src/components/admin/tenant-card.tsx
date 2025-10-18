"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, DollarSign, TrendingUp, Settings, Eye, Edit } from 'lucide-react';

interface TenantCardProps {
  tenant: {
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
  };
  onView: (tenantId: string) => void;
  onEdit: (tenantId: string) => void;
  onImpersonate: (tenantId: string) => void;
}

export function TenantCard({ tenant, onView, onEdit, onImpersonate }: TenantCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'suspended': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getSubscriptionColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'expired': return 'text-red-600';
      case 'cancelled': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(tenant.status)}`} />
            <CardTitle className="text-lg">{tenant.name}</CardTitle>
          </div>
          <Badge variant="outline">{tenant.slug}</Badge>
        </div>
        <CardDescription>
          Created {new Date(tenant.createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Subscription Info */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Plan:</span>
          <span className={`font-medium ${getSubscriptionColor(tenant.subscription.status)}`}>
            {tenant.subscription.plan}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{tenant.stats.users}</div>
            <div className="text-xs text-gray-600">Users</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">${tenant.stats.revenue.toLocaleString()}</div>
            <div className="text-xs text-gray-600">Revenue</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{tenant.stats.growth}%</div>
            <div className="text-xs text-gray-600">Growth</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(tenant.id)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(tenant.id)}
            className="flex-1"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onImpersonate(tenant.id)}
            className="text-orange-600 hover:text-orange-700"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}