import { UserRole, AuthUser } from './types';

export type Permission = 
  | 'VIEW_OWN_PROGRESS'
  | 'VIEW_CLASS_PROGRESS'
  | 'CREATE_ASSIGNMENT'
  | 'CREATE_ARENA'
  | 'JOIN_ARENA'
  | 'UPLOAD_CONTENT'
  | 'PUBLISH_CONTENT'
  | 'VIEW_REPORTS'
  | 'MANAGE_USERS'
  | 'ACCESS_REVIEW_HUB';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  LEARNER: [
    'VIEW_OWN_PROGRESS',
    'JOIN_ARENA',
  ],
  EXTERNAL_LEARNER: [
    'VIEW_OWN_PROGRESS',
    'JOIN_ARENA',
  ],
  PROFESSOR: [
    'VIEW_OWN_PROGRESS',
    'VIEW_CLASS_PROGRESS',
    'CREATE_ASSIGNMENT',
    'CREATE_ARENA',
    'JOIN_ARENA',
    'UPLOAD_CONTENT',
    'VIEW_REPORTS',
  ],
  EXTERNAL_PROFESSOR: [
    'VIEW_OWN_PROGRESS',
    'VIEW_CLASS_PROGRESS',
    'CREATE_ARENA',
    'JOIN_ARENA',
    'VIEW_REPORTS',
  ],
  ADMIN: [
    'VIEW_OWN_PROGRESS',
    'VIEW_CLASS_PROGRESS',
    'CREATE_ASSIGNMENT',
    'CREATE_ARENA',
    'JOIN_ARENA',
    'UPLOAD_CONTENT',
    'PUBLISH_CONTENT',
    'VIEW_REPORTS',
    'MANAGE_USERS',
    'ACCESS_REVIEW_HUB',
  ],
  REVIEWER_DEV: [
    'VIEW_OWN_PROGRESS',
    'JOIN_ARENA',
    'ACCESS_REVIEW_HUB',
  ],
};

/**
 * Checks if a given role has a specific permission.
 */
export function hasPermission(role: UserRole | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Checks if an authenticated user object has a specific permission.
 */
export function canUserPerform(user: AuthUser | null | undefined, permission: Permission): boolean {
  if (!user || user.status !== 'ACTIVE') return false;
  return hasPermission(user.role, permission);
}
