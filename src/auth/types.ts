/**
 * Authentication & Authorization Types
 * The Wisdom Academy School / Klapanya E-Learning
 */

export type UserRole = 
  | 'LEARNER' 
  | 'PROFESSOR' 
  | 'ADMIN' 
  | 'REVIEWER_DEV' 
  | 'EXTERNAL_LEARNER' 
  | 'EXTERNAL_PROFESSOR';

export type UserStatus = 'ACTIVE' | 'DISABLED' | 'EXPIRED';

export interface AuthUser {
  id: string;
  userCode: string; // Permanent learner/professor code (e.g. G6001, PROF001)
  displayName: string;
  role: UserRole;
  status: UserStatus;
  organizationId: string; // e.g. 'ORG_KLAPANYA'
  classroomId?: string; // e.g. 'P6-1'
  gradeLevel?: string; // e.g. 'G6'
  academicYear?: string; // e.g. '2569'
  avatarId?: string;
  heroClass?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export type AuthErrorCode = 
  | 'INVALID_CREDENTIALS'
  | 'INVALID_CODE'
  | 'WRONG_ROLE'
  | 'USER_DISABLED'
  | 'USER_EXPIRED'
  | 'EMPTY_USERNAME'
  | 'EMPTY_CODE'
  | 'SESSION_EXPIRED'
  | 'NETWORK_ERROR';

export interface LoginCredentials {
  userName: string;
  userCode: string;
  requestedRole: UserRole;
  // Used only by real Supabase authentication; names/codes never prove identity.
  email?: string;
  password?: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
  errorCode?: AuthErrorCode;
}

export interface SessionState {
  currentUser: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isRestoring: boolean;
}
