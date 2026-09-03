import { AuthUser, UserRole } from './types';
import { Permission, canUserPerform } from './permissions';

export interface GuardCheckResult {
  allowed: boolean;
  reason?: 'UNAUTHENTICATED' | 'FORBIDDEN_ROLE' | 'FORBIDDEN_PERMISSION' | 'ACCOUNT_INACTIVE';
  redirectTo?: string;
}

export function checkAuthGuard(user: AuthUser | null): GuardCheckResult {
  if (!user) {
    return { allowed: false, reason: 'UNAUTHENTICATED', redirectTo: 'LOGIN' };
  }
  if (user.status !== 'ACTIVE') {
    return { allowed: false, reason: 'ACCOUNT_INACTIVE', redirectTo: 'LOGIN' };
  }
  return { allowed: true };
}

export function checkRoleGuard(
  user: AuthUser | null,
  allowedRoles: UserRole[]
): GuardCheckResult {
  const authCheck = checkAuthGuard(user);
  if (!authCheck.allowed) return authCheck;

  if (!allowedRoles.includes(user!.role)) {
    return { allowed: false, reason: 'FORBIDDEN_ROLE', redirectTo: 'LANDING' };
  }

  return { allowed: true };
}

export function checkPermissionGuard(
  user: AuthUser | null,
  permission: Permission
): GuardCheckResult {
  const authCheck = checkAuthGuard(user);
  if (!authCheck.allowed) return authCheck;

  if (!canUserPerform(user, permission)) {
    return { allowed: false, reason: 'FORBIDDEN_PERMISSION', redirectTo: 'LANDING' };
  }

  return { allowed: true };
}
