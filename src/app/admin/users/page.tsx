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
  Users,
  Shield,
  Mail,
  MoreHorizontal,
  Filter,
  UserCheck,
  UserX
} from 'lucide-react';
import AdminLayout from '../layout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AdminUser, adminService } from '@/services/admin-service';
import { userManagementService, UserActivityReport } from '@/services/user-management-service';
import { AdminUsersSkeleton } from '@/components/ui/skeleton';

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [tenants, setTenants] = useState<{ id: string; name: string; }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tenantFilter, setTenantFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Enhanced cross-tenant features
  const [userStats, setUserStats] = useState<any>(null);
  const [selectedTenantView, setSelectedTenantView] = useState<string>('all');
  const [showActivityReport, setShowActivityReport] = useState(false);
  const [activityReport, setActivityReport] = useState<UserActivityReport | null>(null);
  const [showBulkOperations, setShowBulkOperations] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, tenantsData, statsData] = await Promise.all([
        adminService.getUsers(),
        adminService.getTenants(),
        userManagementService.getUserStatistics()
      ]);
      setUsers(usersData as any);
      setTenants(tenantsData.map(t => ({ id: t.id, name: t.name })));
      setUserStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    try {
      // In a real implementation, you'd call an API to update user status
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, status: newStatus } : user
      ));
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      // In a real implementation, you'd call an API to delete the user
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleBulkStatusChange = async (newStatus: 'active' | 'inactive' | 'suspended') => {
    if (selectedUsers.length === 0) return;

    try {
      // In a real implementation, you'd call an API to bulk update users
      setUsers(prev => prev.map(user =>
        selectedUsers.includes(user.id) ? { ...user, status: newStatus } : user
      ));
      setSelectedUsers([]);
    } catch (error) {
      console.error('Failed to bulk update users:', error);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    setSelectedUsers(prev =>
      checked ? [...prev, userId] : prev.filter(id => id !== userId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedUsers(checked ? filteredUsers.map(u => u.id) : []);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesTenant = tenantFilter === 'all' || user.tenantId === tenantFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesStatus && matchesTenant && matchesRole;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'moderator': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'user': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return <AdminUsersSkeleton />;
  }

  return (
      <div className="space-y-8">
        {/* Header Section - Dashboard Style */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white">User Management</h2>
            <p className="text-slate-300">Manage users across all tenants</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-300 hover:from-blue-500/30 hover:to-purple-500/30 hover:text-blue-200 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create User
          </Button>
        </div>

        {/* Stats Cards - Dashboard Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:scale-105 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-300">👥 Total Users</p>
                  <p className="text-4xl font-bold text-white">{users.length}</p>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-full">
                  <Users className="w-10 h-10 text-blue-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-emerald-400 font-medium bg-emerald-400/20 px-2 py-1 rounded-full">{users.filter(u => u.status === 'active').length} active</span>
                <span className="text-white/50 mx-2">•</span>
                <span className="text-white/70">{users.filter(u => u.status !== 'active').length} inactive</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:scale-105 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-300">✅ Active Users</p>
                  <p className="text-4xl font-bold text-white">{users.filter(u => u.status === 'active').length}</p>
                </div>
                <div className="bg-emerald-500/20 p-3 rounded-full">
                  <Users className="w-10 h-10 text-emerald-400" />
                </div>
              </div>
              <div className="mt-4 text-sm text-white/70 bg-white/10 px-3 py-2 rounded-full text-center">
                🚀 Currently online
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-300">👑 Administrators</p>
                  <p className="text-4xl font-bold text-white">{users.filter(u => u.role === 'admin' || u.role === 'super_admin').length}</p>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-full">
                  <Shield className="w-10 h-10 text-purple-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm bg-gradient-to-r from-emerald-400/20 to-green-400/20 px-3 py-2 rounded-full">
                <span className="text-emerald-300 font-medium">+{Math.floor(Math.random() * 5) + 1} this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 hover:scale-105 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-300">⚠️ Suspended</p>
                  <p className="text-4xl font-bold text-white">{users.filter(u => u.status === 'suspended').length}</p>
                </div>
                <div className="bg-orange-500/20 p-3 rounded-full">
                  <Shield className="w-10 h-10 text-orange-400" />
                </div>
              </div>
              <div className="mt-4 text-sm text-white/70 bg-white/10 px-3 py-2 rounded-full text-center">
                Requires attention
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cross-Tenant User Distribution - Dashboard Style */}
        {userStats?.usersByTenant && userStats.usersByTenant.length > 0 && (
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/30 hover:border-slate-500/50 transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                🏢 Tenant Distribution
              </CardTitle>
              <CardDescription className="text-slate-300">User statistics across tenants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {userStats.usersByTenant.slice(0, 6).map((tenant: any, index: number) => (
                  <div key={tenant.tenantId} className="flex items-center justify-between p-5 bg-gradient-to-r from-white/5 to-white/10 border border-white/10 rounded-xl hover:from-white/10 hover:to-white/15 hover:border-white/20 transition-all duration-300 cursor-pointer hover:scale-105">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' :
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-300 text-white' :
                        index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white' :
                        'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-lg">{tenant.tenantName}</p>
                        <p className="text-sm text-slate-300">👥 {tenant.totalUsers} users</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm bg-emerald-400/20 px-3 py-1 rounded-full mt-1">
                        <span className="text-emerald-400 font-medium">+{tenant.growthRate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters Section - Dashboard Style */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/30 hover:border-slate-500/50 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-6 items-center">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:bg-slate-700/50 focus:border-blue-500/50 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:bg-slate-700/50 focus:border-blue-500/50 transition-all duration-300"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <select
                value={tenantFilter}
                onChange={(e) => setTenantFilter(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:bg-slate-700/50 focus:border-blue-500/50 transition-all duration-300"
              >
                <option value="all">All Tenants</option>
                {tenants.map(tenant => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:bg-slate-700/50 focus:border-blue-500/50 transition-all duration-300"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="user">User</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table - Dashboard Style */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/30 hover:border-slate-500/50 transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <Users className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-white flex items-center gap-2">
                    👥 All Users
                  </CardTitle>
                  <CardDescription className="text-slate-300">Complete list of users across all tenants</CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm text-slate-400">
                  {filteredUsers.length} of {users.length} users
                </div>
                {selectedUsers.length > 0 && (
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    {selectedUsers.length} selected
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <div className="text-slate-400 text-lg mb-2">No users found</div>
                  <div className="text-slate-500">Try adjusting your search criteria</div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-slate-600 bg-slate-800 text-blue-400 focus:ring-blue-300"
                        />
                      </TableHead>
                      <TableHead className="text-slate-300 font-medium">User</TableHead>
                      <TableHead className="text-slate-300 font-medium">Role</TableHead>
                      <TableHead className="text-slate-300 font-medium">Tenant</TableHead>
                      <TableHead className="text-slate-300 font-medium">Status</TableHead>
                      <TableHead className="text-slate-300 font-medium">Last Login</TableHead>
                      <TableHead className="text-slate-300 font-medium">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user, index) => (
                      <TableRow key={user.id} className={`border-slate-700 hover:bg-slate-800/50 transition-colors ${index % 2 === 0 ? 'bg-slate-800/20' : ''}`}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                            className="rounded border-slate-600 bg-slate-800 text-blue-400 focus:ring-blue-300"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-semibold text-white flex items-center gap-2">
                              {user.name}
                            </div>
                            <div className="text-sm text-slate-400 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getRoleColor(user.role)} border-0 text-xs font-medium px-2 py-1`}>
                            {user.role.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-300">
                            {tenants.find(t => t.id === user.tenantId)?.name || 'No Tenant'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(user.status)} border-0 text-xs font-medium px-2 py-1`}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-300">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-700">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-slate-800 border-slate-700">
                              <DropdownMenuItem
                                onClick={() => {/* TODO: Edit user */}}
                                className="text-white hover:bg-slate-700 focus:bg-slate-700"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(user.id, 'active')}
                                disabled={user.status === 'active'}
                                className="text-white hover:bg-slate-700 focus:bg-slate-700"
                              >
                                <UserCheck className="w-4 h-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(user.id, 'suspended')}
                                disabled={user.status === 'suspended'}
                                className="text-red-400 hover:bg-slate-700 focus:bg-slate-700"
                              >
                                <UserX className="w-4 h-4 mr-2" />
                                Suspend
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-400 hover:bg-slate-700 focus:bg-slate-700"
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
            </div>
          </CardContent>
        </Card>
      </div>
  );
}