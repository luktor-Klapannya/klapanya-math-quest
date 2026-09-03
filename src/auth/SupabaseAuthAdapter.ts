import type { SupabaseClient } from '@supabase/supabase-js';
import { IAuthAdapter } from './IAuthAdapter';
import { AuthUser, LoginCredentials, AuthResult, UserRole } from './types';
import { getSupabaseClient } from '../lib/supabaseClient';

export type GameAuthClient = Pick<SupabaseClient, 'auth' | 'from'>;
class AuthFailure extends Error {
  constructor(public code: NonNullable<AuthResult['errorCode']>, message: string) { super(message); }
}

export class SupabaseAuthAdapter implements IAuthAdapter {
  private currentUser: AuthUser | null = null;
  private authUserId: string | null = null;
  private revision = 0;
  private listeners = new Set<() => void>();

  // Tests inject a client explicitly. Missing configuration never selects a mock.
  constructor(private readonly client: GameAuthClient | null = getSupabaseClient()) {
    // Never restore an identity from either legacy application cache.
    client?.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || event === 'USER_UPDATED' ||
          (this.currentUser && session?.user.id !== this.authUserId)) {
        this.revision++;
        this.clearIdentity();
      }
    });
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private clearIdentity(): void {
    this.currentUser = null;
    this.authUserId = null;
    this.listeners.forEach(listener => listener());
  }

  private async resolveVerifiedUser(requestedRole?: UserRole, expectedPrincipal?: string) {
    if (!this.client) throw new AuthFailure('NETWORK_ERROR', 'ยังไม่ได้ตั้งค่า Supabase');
    // Unlike getSession/localStorage, getUser checks credentials with the Auth server.
    const { data, error } = await this.client.auth.getUser();
    if (error || !data.user || (expectedPrincipal && data.user.id !== expectedPrincipal)) {
      throw new AuthFailure('INVALID_CREDENTIALS', 'กรุณาเข้าสู่ระบบด้วยบัญชีที่ยืนยันแล้ว');
    }
    const { data: profile, error: profileError } = await this.client.from('profiles')
      .select('*, memberships(role_id, organization_id)')
      .eq('auth_user_id', data.user.id).maybeSingle();
    if (profileError || !profile || profile.auth_user_id !== data.user.id) {
      throw new AuthFailure('INVALID_CREDENTIALS', 'ไม่พบโปรไฟล์เกมที่เชื่อมกับบัญชีนี้');
    }
    if (profile.status !== 'ACTIVE') {
      throw new AuthFailure(profile.status === 'DISABLED' ? 'USER_DISABLED' : 'USER_EXPIRED', 'บัญชีนี้ไม่พร้อมใช้งาน');
    }
    const roles: UserRole[] = (profile.memberships || [])
      .filter((m: { organization_id: string }) => m.organization_id === profile.organization_id)
      .map((m: { role_id: UserRole }) => m.role_id);
    const allowed: UserRole[] = requestedRole === 'PROFESSOR'
      ? ['PROFESSOR', 'ADMIN', 'EXTERNAL_PROFESSOR']
      : requestedRole === 'LEARNER' ? ['LEARNER', 'EXTERNAL_LEARNER']
        : requestedRole ? [requestedRole]
          : ['ADMIN', 'PROFESSOR', 'EXTERNAL_PROFESSOR', 'LEARNER', 'EXTERNAL_LEARNER'];
    const role = allowed.find(candidate => roles.includes(candidate));
    if (!role) throw new AuthFailure('WRONG_ROLE', 'บัญชีนี้ไม่มีสิทธิ์ในบทบาทที่เลือก');
    const user: AuthUser = {
      id: profile.id, userCode: profile.user_code, displayName: profile.display_name,
      role, status: 'ACTIVE', organizationId: profile.organization_id,
      classroomId: profile.classroom_id || undefined, gradeLevel: profile.grade_level || undefined,
      academicYear: profile.academic_year, avatarId: profile.avatar_id, heroClass: profile.hero_class,
      createdAt: profile.created_at, lastLoginAt: profile.last_login_at,
    };
    return { user, principal: data.user.id };
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const revision = ++this.revision;
    this.clearIdentity();
    if (!this.client) return { success: false, errorCode: 'NETWORK_ERROR', error: 'ยังไม่ได้ตั้งค่า Supabase' };
    if (!credentials.email?.trim() || !credentials.password) {
      return { success: false, errorCode: 'INVALID_CREDENTIALS',
        error: 'กรุณาระบุอีเมลและรหัสผ่าน ชื่อและรหัสนักเรียนใช้ยืนยันตัวตนไม่ได้' };
    }
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email: credentials.email.trim(), password: credentials.password,
      });
      if (error || !data.session || !data.user) throw new AuthFailure('INVALID_CREDENTIALS', 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      const resolved = await this.resolveVerifiedUser(credentials.requestedRole, data.user.id);
      if (revision !== this.revision) throw new AuthFailure('SESSION_EXPIRED', 'กรุณาเข้าสู่ระบบอีกครั้ง');
      this.authUserId = resolved.principal;
      this.currentUser = resolved.user;
      return { success: true, user: resolved.user };
    } catch (error) {
      if (revision === this.revision) {
        try { await this.client.auth.signOut({ scope: 'local' }); } catch { /* Already locally unauthenticated. */ }
      }
      return { success: false, errorCode: error instanceof AuthFailure ? error.code : 'NETWORK_ERROR',
        error: error instanceof AuthFailure ? error.message : 'ไม่สามารถยืนยันตัวตนได้ กรุณาลองใหม่' };
    }
  }

  async restoreSession(): Promise<AuthUser | null> {
    const revision = ++this.revision;
    this.clearIdentity();
    try {
      const resolved = await this.resolveVerifiedUser();
      if (revision === this.revision) {
        this.authUserId = resolved.principal;
        this.currentUser = resolved.user;
      }
    } catch { /* Fail closed; no identity-cache or mock fallback. */ }
    return this.currentUser;
  }

  async logout(): Promise<void> {
    this.revision++;
    this.clearIdentity();
    if (this.client) {
      const { error } = await this.client.auth.signOut({ scope: 'local' });
      if (error) throw error;
    }
  }

  getCurrentUser(): AuthUser | null { return this.currentUser; }
}

