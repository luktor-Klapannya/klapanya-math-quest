import { AuthUser, LoginCredentials, AuthResult } from './types';

export interface IAuthAdapter {
  login(credentials: LoginCredentials): Promise<AuthResult>;
  logout(): Promise<void>;
  restoreSession(): Promise<AuthUser | null>;
  getCurrentUser(): AuthUser | null;
  subscribe?(listener: () => void): () => void;
}
