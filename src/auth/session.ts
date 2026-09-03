import { IAuthAdapter } from './IAuthAdapter';
import { MockAuthAdapter } from './MockAuthAdapter';
import { SupabaseAuthAdapter } from './SupabaseAuthAdapter';
import { AuthUser, LoginCredentials, AuthResult, UserRole } from './types';
import { Permission, canUserPerform, hasPermission } from './permissions';

export type AuthMode = 'mock' | 'supabase';

export function resolveAuthMode(env: { VITE_AUTH_MODE?: string; PROD?: boolean }): AuthMode {
  // Production defaults to real auth, even if configuration is missing.
  if (env.VITE_AUTH_MODE === 'mock') return 'mock';
  if (env.VITE_AUTH_MODE === 'supabase' || env.PROD || env.VITE_AUTH_MODE) return 'supabase';
  return 'mock';
}

/**
 * Central Auth Session Manager
 * Orchestrates pluggable IAuthAdapter implementations (MockAuthAdapter <-> SupabaseAuthAdapter).
 */
export class AuthSessionManager {
  private static instance: AuthSessionManager;
  private adapter: IAuthAdapter;
  private currentMode: AuthMode = 'mock';
  private listeners = new Set<() => void>();
  private unsubscribeAdapter?: () => void;
  private emit = () => { this.listeners.forEach(listener => listener()); };

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private constructor() {
    const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any)?.env : {};
    const authModeEnv = resolveAuthMode(metaEnv || {});
    if (authModeEnv === 'supabase') {
      this.currentMode = 'supabase';
      this.adapter = new SupabaseAuthAdapter();
    } else {
      this.currentMode = 'mock';
      this.adapter = new MockAuthAdapter();
    }
    this.unsubscribeAdapter = this.adapter.subscribe?.(this.emit);
  }

  public static getInstance(): AuthSessionManager {
    if (!AuthSessionManager.instance) {
      AuthSessionManager.instance = new AuthSessionManager();
    }
    return AuthSessionManager.instance;
  }

  public setAdapter(adapter: IAuthAdapter, mode: AuthMode = 'mock'): void {
    this.unsubscribeAdapter?.();
    this.adapter = adapter;
    this.currentMode = mode;
    this.unsubscribeAdapter = adapter.subscribe?.(this.emit);
    this.emit();
  }

  public getAdapterMode(): AuthMode {
    return this.currentMode;
  }

  public getAdapter(): IAuthAdapter {
    return this.adapter;
  }

  public async login(credentials: LoginCredentials): Promise<AuthResult> {
    const result = await this.adapter.login(credentials);
    this.emit();
    return result;
  }

  public async logout(): Promise<void> {
    try { await this.adapter.logout(); } finally { this.emit(); }
  }

  public async restoreSession(): Promise<AuthUser | null> {
    const user = await this.adapter.restoreSession();
    this.emit();
    return user;
  }

  public getCurrentUser(): AuthUser | null {
    return this.adapter.getCurrentUser();
  }

  public isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.status === 'ACTIVE';
  }

  public getUserRole(): UserRole | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  public can(permission: Permission): boolean {
    const user = this.getCurrentUser();
    return canUserPerform(user, permission);
  }
}

export const authSession = AuthSessionManager.getInstance();
