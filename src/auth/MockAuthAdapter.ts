import { IAuthAdapter } from './IAuthAdapter';
import { AuthUser, LoginCredentials, AuthResult } from './types';

const SESSION_STORAGE_KEY = 'klapanya_auth_session_v1';

export const SEED_MOCK_USERS: AuthUser[] = [
  {
    id: 'usr_prof_001',
    userCode: 'PROF001',
    displayName: 'คุณครูปัญญา วิชาการ',
    role: 'PROFESSOR',
    status: 'ACTIVE',
    organizationId: 'ORG_KLAPANYA',
    academicYear: '2569',
    createdAt: '2026-05-01T00:00:00.000Z',
  },
  {
    id: 'usr_lrn_001',
    userCode: 'G6001',
    displayName: 'น้องกล้าหาญ (Alex)',
    role: 'LEARNER',
    status: 'ACTIVE',
    organizationId: 'ORG_KLAPANYA',
    classroomId: 'P6-1',
    gradeLevel: 'G6',
    academicYear: '2569',
    avatarId: 'BOY_WIZARD',
    heroClass: 'SPEED_CHRONOMANCER',
    createdAt: '2026-05-01T00:00:00.000Z',
  },
  {
    id: 'usr_lrn_002',
    userCode: 'G6002',
    displayName: 'น้องปัญญา (Sarah)',
    role: 'LEARNER',
    status: 'ACTIVE',
    organizationId: 'ORG_KLAPANYA',
    classroomId: 'P6-2',
    gradeLevel: 'G6',
    academicYear: '2569',
    avatarId: 'GIRL_KNIGHT',
    heroClass: 'LOGIC_PALADIN',
    createdAt: '2026-05-01T00:00:00.000Z',
  },
  {
    id: 'usr_rev_001',
    userCode: 'REV001',
    displayName: 'ผู้ตรวจประเมินระบบ (Auditor)',
    role: 'REVIEWER_DEV',
    status: 'ACTIVE',
    organizationId: 'ORG_KLAPANYA',
    classroomId: 'DEV-AUDIT',
    academicYear: '2569',
    createdAt: '2026-05-01T00:00:00.000Z',
  },
  {
    id: 'usr_adm_001',
    userCode: 'ADM001',
    displayName: 'ผู้ดูแลระบบกลาง (Admin)',
    role: 'ADMIN',
    status: 'ACTIVE',
    organizationId: 'ORG_KLAPANYA',
    academicYear: '2569',
    createdAt: '2026-05-01T00:00:00.000Z',
  },
  {
    id: 'usr_dis_001',
    userCode: 'DIS001',
    displayName: 'นักเรียนพักการเรียน (Disabled)',
    role: 'LEARNER',
    status: 'DISABLED',
    organizationId: 'ORG_KLAPANYA',
    classroomId: 'P6-1',
    gradeLevel: 'G6',
    createdAt: '2026-05-01T00:00:00.000Z',
  },
  {
    id: 'usr_exp_001',
    userCode: 'EXP001',
    displayName: 'บัญชีหมดอายุ (Expired)',
    role: 'LEARNER',
    status: 'EXPIRED',
    organizationId: 'ORG_KLAPANYA',
    classroomId: 'P6-1',
    gradeLevel: 'G6',
    createdAt: '2025-05-01T00:00:00.000Z',
  },
];

export class MockAuthAdapter implements IAuthAdapter {
  private currentUser: AuthUser | null = null;
  private users: AuthUser[] = [...SEED_MOCK_USERS];

  constructor() {
    this.restoreSessionSync();
  }

  private restoreSessionSync(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        this.currentUser = JSON.parse(raw);
      }
    } catch (err) {
      console.warn('[MockAuthAdapter] Failed to restore session cache', err);
    }
  }

  public async login(credentials: LoginCredentials): Promise<AuthResult> {
    const trimmedName = credentials.userName.trim();
    const trimmedCode = credentials.userCode.trim().toUpperCase();

    if (!trimmedName) {
      return {
        success: false,
        errorCode: 'EMPTY_USERNAME',
        error: 'กรุณากรอกชื่อผู้ใช้งาน',
      };
    }

    if (!trimmedCode) {
      return {
        success: false,
        errorCode: 'EMPTY_CODE',
        error: 'กรุณากรอกรหัสประจำตัว (User Code)',
      };
    }

    // Match against seed database
    const matchedUser = this.users.find(
      (u) => u.userCode.toUpperCase() === trimmedCode
    );

    if (matchedUser) {
      // Check status
      if (matchedUser.status === 'DISABLED') {
        return {
          success: false,
          errorCode: 'USER_DISABLED',
          error: 'บัญชีนี้ถูกระงับการใช้งานชั่วคราว กรุณาติดต่อผู้ดูแลระบบ',
        };
      }

      if (matchedUser.status === 'EXPIRED') {
        return {
          success: false,
          errorCode: 'USER_EXPIRED',
          error: 'บัญชีนี้หมดอายุการใช้งานสำหรับปีการศึกษานี้',
        };
      }

      // Check requested role compatibility
      if (credentials.requestedRole === 'PROFESSOR' && matchedUser.role !== 'PROFESSOR' && matchedUser.role !== 'ADMIN') {
        return {
          success: false,
          errorCode: 'WRONG_ROLE',
          error: 'รหัสประจำตัวนี้ไม่มีสิทธิ์เข้าใช้งานในบทบาทครูผู้สอน',
        };
      }

      if (credentials.requestedRole === 'LEARNER' && matchedUser.role !== 'LEARNER' && matchedUser.role !== 'REVIEWER_DEV') {
        return {
          success: false,
          errorCode: 'WRONG_ROLE',
          error: 'รหัสประจำตัวนี้ไม่ได้ลงทะเบียนในบทบาทนักเรียน',
        };
      }

      const updatedUser: AuthUser = {
        ...matchedUser,
        displayName: trimmedName || matchedUser.displayName,
        lastLoginAt: new Date().toISOString(),
      };

      this.currentUser = updatedUser;
      this.persistSession(updatedUser);

      return {
        success: true,
        user: updatedUser,
      };
    }

    // If code format is valid learner pattern (e.g. G6xxx or any student code), allow dynamic creation
    if (credentials.requestedRole === 'LEARNER') {
      const dynamicUser: AuthUser = {
        id: `usr_${Date.now()}`,
        userCode: trimmedCode,
        displayName: trimmedName,
        role: 'LEARNER',
        status: 'ACTIVE',
        organizationId: 'ORG_KLAPANYA',
        classroomId: 'P6-1',
        gradeLevel: 'G6',
        academicYear: '2569',
        avatarId: 'BOY_WIZARD',
        heroClass: 'SPEED_CHRONOMANCER',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      this.users.push(dynamicUser);
      this.currentUser = dynamicUser;
      this.persistSession(dynamicUser);

      return {
        success: true,
        user: dynamicUser,
      };
    }

    // If code is not found for Professor role
    return {
      success: false,
      errorCode: 'INVALID_CREDENTIALS',
      error: 'ชื่อผู้ใช้หรือรหัสประจำตัวไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
    };
  }

  public async logout(): Promise<void> {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      } catch (err) {
        console.warn('[MockAuthAdapter] Failed to clear session cache', err);
      }
    }
  }

  public async restoreSession(): Promise<AuthUser | null> {
    this.restoreSessionSync();
    return this.currentUser;
  }

  public getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  private persistSession(user: AuthUser): void {
    if (typeof window === 'undefined') return;
    try {
      // Marked clearly as NON-AUTHORITATIVE prototype storage
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } catch (err) {
      console.warn('[MockAuthAdapter] Failed to persist session cache', err);
    }
  }
}
