// RBAC (Role-Based Access Control) System
// Granular permissions management with tenant isolation

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  TENANT_ADMIN = 'tenant_admin',
  USER = 'user',
  CREATOR = 'creator',
  INVESTOR = 'investor',
}

export enum Permission {
  // Super Admin Permissions
  MANAGE_TENANTS = 'manage_tenants',
  MANAGE_SYSTEM = 'manage_system',
  VIEW_SYSTEM_ANALYTICS = 'view_system_analytics',
  MANAGE_FEATURE_FLAGS = 'manage_feature_flags',

  // Tenant Admin Permissions
  MANAGE_TENANT_USERS = 'manage_tenant_users',
  MANAGE_TENANT_SETTINGS = 'manage_tenant_settings',
  VIEW_TENANT_ANALYTICS = 'view_tenant_analytics',
  MANAGE_TENANT_FEATURES = 'manage_tenant_features',

  // User Permissions
  CREATE_IDEAS = 'create_ideas',
  CREATE_OFFERS = 'create_offers',
  VIEW_MATCHES = 'view_matches',
  SEND_MESSAGES = 'send_messages',
  MANAGE_PROFILE = 'manage_profile',
  VIEW_ANALYTICS = 'view_analytics',

  // BABT Protected Features
  ACCESS_BABT_FEATURES = 'access_babt_features',
  VERIFY_BABT = 'verify_babt',

  // Special Permissions
  IMPERSONATE_USERS = 'impersonate_users',
  VIEW_AUDIT_LOGS = 'view_audit_logs',
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  inherits?: UserRole[];
}

export interface PermissionContext {
  tenantId?: string;
  userId: string;
  resourceId?: string;
  resourceType?: string;
}

// Role-based permission matrix
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    Permission.MANAGE_TENANTS,
    Permission.MANAGE_SYSTEM,
    Permission.VIEW_SYSTEM_ANALYTICS,
    Permission.MANAGE_FEATURE_FLAGS,
    Permission.MANAGE_TENANT_USERS,
    Permission.MANAGE_TENANT_SETTINGS,
    Permission.VIEW_TENANT_ANALYTICS,
    Permission.MANAGE_TENANT_FEATURES,
    Permission.CREATE_IDEAS,
    Permission.CREATE_OFFERS,
    Permission.VIEW_MATCHES,
    Permission.SEND_MESSAGES,
    Permission.MANAGE_PROFILE,
    Permission.VIEW_ANALYTICS,
    Permission.ACCESS_BABT_FEATURES,
    Permission.VERIFY_BABT,
    Permission.IMPERSONATE_USERS,
    Permission.VIEW_AUDIT_LOGS,
  ],

  [UserRole.TENANT_ADMIN]: [
    Permission.MANAGE_TENANT_USERS,
    Permission.MANAGE_TENANT_SETTINGS,
    Permission.VIEW_TENANT_ANALYTICS,
    Permission.MANAGE_TENANT_FEATURES,
    Permission.CREATE_IDEAS,
    Permission.CREATE_OFFERS,
    Permission.VIEW_MATCHES,
    Permission.SEND_MESSAGES,
    Permission.MANAGE_PROFILE,
    Permission.VIEW_ANALYTICS,
    Permission.ACCESS_BABT_FEATURES,
    Permission.VERIFY_BABT,
    Permission.VIEW_AUDIT_LOGS,
  ],

  [UserRole.USER]: [
    Permission.CREATE_IDEAS,
    Permission.CREATE_OFFERS,
    Permission.VIEW_MATCHES,
    Permission.SEND_MESSAGES,
    Permission.MANAGE_PROFILE,
    Permission.VIEW_ANALYTICS,
  ],

  [UserRole.CREATOR]: [
    Permission.CREATE_IDEAS,
    Permission.VIEW_MATCHES,
    Permission.SEND_MESSAGES,
    Permission.MANAGE_PROFILE,
    Permission.VIEW_ANALYTICS,
  ],

  [UserRole.INVESTOR]: [
    Permission.CREATE_OFFERS,
    Permission.VIEW_MATCHES,
    Permission.SEND_MESSAGES,
    Permission.MANAGE_PROFILE,
    Permission.VIEW_ANALYTICS,
  ],
};

// Permission checker class
export class PermissionChecker {
  private userRole: UserRole;
  private userPermissions: Set<Permission>;
  private tenantId?: string;

  constructor(userRole: UserRole, tenantId?: string, additionalPermissions: Permission[] = []) {
    this.userRole = userRole;
    this.tenantId = tenantId;

    // Combine role-based permissions with additional permissions
    this.userPermissions = new Set([
      ...ROLE_PERMISSIONS[userRole],
      ...additionalPermissions,
    ]);
  }

  // Check if user has a specific permission
  hasPermission(permission: Permission): boolean {
    return this.userPermissions.has(permission);
  }

  // Check if user has any of the permissions
  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  // Check if user has all of the permissions
  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  // Check resource-specific permission with context
  canAccessResource(context: PermissionContext, requiredPermission: Permission): boolean {
    // Basic permission check
    if (!this.hasPermission(requiredPermission)) {
      return false;
    }

    // Tenant isolation check
    if (context.tenantId && this.tenantId && context.tenantId !== this.tenantId) {
      // Super admin can access all tenants
      if (this.userRole !== UserRole.SUPER_ADMIN) {
        return false;
      }
    }

    // Resource ownership check (simplified)
    if (context.resourceType && context.resourceId) {
      return this.checkResourceOwnership(context);
    }

    return true;
  }

  // Check if user owns or has access to a resource
  private checkResourceOwnership(context: PermissionContext): boolean {
    // This would integrate with your database to check ownership
    // For now, return true (implement proper ownership checks)
    return true;
  }

  // Get all permissions for the current user
  getPermissions(): Permission[] {
    return Array.from(this.userPermissions);
  }

  // Get user role
  getRole(): UserRole {
    return this.userRole;
  }

  // Check if user is admin (super or tenant admin)
  isAdmin(): boolean {
    return [UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN].includes(this.userRole);
  }

  // Check if user is super admin
  isSuperAdmin(): boolean {
    return this.userRole === UserRole.SUPER_ADMIN;
  }

  // Check if user is tenant admin
  isTenantAdmin(): boolean {
    return this.userRole === UserRole.TENANT_ADMIN;
  }
}

// Permission hooks for React components
export function usePermissions(userRole: UserRole, tenantId?: string): PermissionChecker {
  return new PermissionChecker(userRole, tenantId);
}

export function usePermissionCheck(
  userRole: UserRole,
  permission: Permission,
  tenantId?: string
): boolean {
  const checker = new PermissionChecker(userRole, tenantId);
  return checker.hasPermission(permission);
}

// Permission guard component
export function PermissionGuard({
  permission,
  userRole,
  tenantId,
  fallback = null,
  children,
}: {
  permission: Permission;
  userRole: UserRole;
  tenantId?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}): React.ReactNode {
  const hasPermission = usePermissionCheck(userRole, permission, tenantId);
  return hasPermission ? children : fallback;
}

// Utility functions
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: 'Super Admin',
    [UserRole.TENANT_ADMIN]: 'Tenant Admin',
    [UserRole.USER]: 'User',
    [UserRole.CREATOR]: 'Creator',
    [UserRole.INVESTOR]: 'Investor',
  };

  return displayNames[role] || role;
}

export function getPermissionDisplayName(permission: Permission): string {
  const displayNames: Record<Permission, string> = {
    [Permission.MANAGE_TENANTS]: 'Manage Tenants',
    [Permission.MANAGE_SYSTEM]: 'Manage System',
    [Permission.VIEW_SYSTEM_ANALYTICS]: 'View System Analytics',
    [Permission.MANAGE_FEATURE_FLAGS]: 'Manage Feature Flags',
    [Permission.MANAGE_TENANT_USERS]: 'Manage Tenant Users',
    [Permission.MANAGE_TENANT_SETTINGS]: 'Manage Tenant Settings',
    [Permission.VIEW_TENANT_ANALYTICS]: 'View Tenant Analytics',
    [Permission.MANAGE_TENANT_FEATURES]: 'Manage Tenant Features',
    [Permission.CREATE_IDEAS]: 'Create Business Ideas',
    [Permission.CREATE_OFFERS]: 'Create Investment Offers',
    [Permission.VIEW_MATCHES]: 'View Matches',
    [Permission.SEND_MESSAGES]: 'Send Messages',
    [Permission.MANAGE_PROFILE]: 'Manage Profile',
    [Permission.VIEW_ANALYTICS]: 'View Analytics',
    [Permission.ACCESS_BABT_FEATURES]: 'Access BABT Features',
    [Permission.VERIFY_BABT]: 'Verify BABT',
    [Permission.IMPERSONATE_USERS]: 'Impersonate Users',
    [Permission.VIEW_AUDIT_LOGS]: 'View Audit Logs',
  };

  return displayNames[permission] || permission;
}

export function getPermissionsByCategory(): Record<string, Permission[]> {
  return {
    'System Administration': [
      Permission.MANAGE_TENANTS,
      Permission.MANAGE_SYSTEM,
      Permission.VIEW_SYSTEM_ANALYTICS,
      Permission.MANAGE_FEATURE_FLAGS,
    ],
    'Tenant Management': [
      Permission.MANAGE_TENANT_USERS,
      Permission.MANAGE_TENANT_SETTINGS,
      Permission.VIEW_TENANT_ANALYTICS,
      Permission.MANAGE_TENANT_FEATURES,
    ],
    'Business Features': [
      Permission.CREATE_IDEAS,
      Permission.CREATE_OFFERS,
      Permission.VIEW_MATCHES,
      Permission.SEND_MESSAGES,
      Permission.MANAGE_PROFILE,
      Permission.VIEW_ANALYTICS,
    ],
    'BABT Features': [
      Permission.ACCESS_BABT_FEATURES,
      Permission.VERIFY_BABT,
    ],
    'Special Permissions': [
      Permission.IMPERSONATE_USERS,
      Permission.VIEW_AUDIT_LOGS,
    ],
  };
}