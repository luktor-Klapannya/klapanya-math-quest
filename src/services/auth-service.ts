import { IAuthAdapter, UserSession, StudentSession, TeacherSession } from '../types/auth';
import { DEFAULT_PROFILE } from '../storage/local-storage-adapter';
import { authSession } from '../auth/session';
import { AuthUser, UserRole, AuthResult } from '../auth/types';

const SESSION_STORAGE_KEY = 'klapanya_user_session_v1';

export class LocalAuthService implements IAuthAdapter {
  private currentSession: UserSession | null = null;

  constructor() {
    this.currentSession = this.loadSession();
  }

  private loadSession(): UserSession | null {
    if (authSession.getAdapterMode() === 'supabase') return null;
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (err) {
      console.warn('Could not load user session', err);
    }
    return null;
  }

  private saveSession(session: UserSession | null): void {
    this.currentSession = session;
    if (typeof window === 'undefined') return;
    try {
      if (authSession.getAdapterMode() === 'supabase') {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return;
      }
      if (session) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (err) {
      console.warn('Could not save user session', err);
    }
  }

  public getCurrentSession(): UserSession | null {
    if (authSession.getAdapterMode() === 'supabase') {
      const user = authSession.getCurrentUser();
      return user ? this.sessionFromUser(user) : null;
    }
    return this.currentSession;
  }

  public async restoreSession(): Promise<UserSession | null> {
    if (authSession.getAdapterMode() === 'supabase') {
      await authSession.restoreSession();
      return this.getCurrentSession();
    }
    return this.currentSession;
  }

  private requireMockMode(): void {
    if (authSession.getAdapterMode() !== 'mock') throw new Error('Demo login requires explicit mock mode');
  }

  public async loginWithCredentials(
    userName: string,
    userCode: string,
    requestedRole: UserRole,
    verifiedCredentials?: { email: string; password: string }
  ): Promise<AuthResult> {
    const res = await authSession.login({
      userName,
      userCode,
      requestedRole,
      ...verifiedCredentials,
    });

    if (res.success && res.user) {
      this.saveSession(this.sessionFromUser(res.user));
    } else {
      this.saveSession(null);
    }
    return res;
  }

  private sessionFromUser(user: AuthUser): UserSession {
      if (user.role === 'PROFESSOR' || user.role === 'ADMIN' || user.role === 'EXTERNAL_PROFESSOR') {
        const teacherSession: TeacherSession = {
          userId: user.id,
          role: 'TEACHER',
          teacherName: user.displayName,
          schoolName: 'โรงเรียนกล้าปัญญา (The Wisdom Academy School)',
          assignedClasses: authSession.getAdapterMode() === 'mock'
            ? ['P6-1 (ห้องเรียนคณิตเข้มข้น)', 'P6-2 (ห้องเตรียมสอบเข้า ม.1)', 'P6-VIP (กิฟต์เต็ด/สสวท.)'] : [],
          loginTimestamp: Date.now(),
        };
        return teacherSession;
      } else {
        const studentSession: StudentSession = {
          userId: user.id,
          role: 'STUDENT',
          studentName: user.displayName,
          classRoomId: user.classroomId || '',
          avatarVisualId: user.avatarId || 'BOY_WIZARD',
          heroId: (user.heroClass as any) || 'CHRONOMANCER',
          profile: {
            ...DEFAULT_PROFILE,
            heroName: user.displayName,
          },
          loginTimestamp: Date.now(),
        };
        return studentSession;
      }
  }

  public async loginAsStudent(studentName: string = 'น้องกล้าหาญ (Alex)', classRoomId: string = 'P6-1'): Promise<StudentSession> {
    this.requireMockMode();
    const session: StudentSession = {
      userId: `student_${Date.now()}`,
      role: 'STUDENT',
      studentName,
      classRoomId,
      avatarVisualId: DEFAULT_PROFILE.avatarVisualId || 'BOY_WIZARD',
      heroId: DEFAULT_PROFILE.heroId || 'CHRONOMANCER',
      profile: {
        ...DEFAULT_PROFILE,
        heroName: studentName,
      },
      loginTimestamp: Date.now(),
    };
    this.saveSession(session);
    return session;
  }

  public async loginAsTeacher(teacherName: string = 'คุณครูปัญญา วิชาการ', schoolName: string = 'Klapanya Math Academy'): Promise<TeacherSession> {
    this.requireMockMode();
    const session: TeacherSession = {
      userId: `teacher_${Date.now()}`,
      role: 'TEACHER',
      teacherName,
      schoolName,
      assignedClasses: ['P6-1 (ห้องเรียนคณิตเข้มข้น)', 'P6-2 (ห้องเตรียมสอบเข้า ม.1)', 'P6-VIP (กิฟต์เต็ด/สสวท.)'],
      loginTimestamp: Date.now(),
    };
    this.saveSession(session);
    return session;
  }

  public async loginAsReviewer(): Promise<StudentSession> {
    this.requireMockMode();
    const session: StudentSession = {
      userId: 'reviewer_dev',
      role: 'STUDENT',
      studentName: 'ผู้ตรวจประเมินระบบ (Auditor)',
      classRoomId: 'DEV-AUDIT',
      avatarVisualId: 'BOY_WIZARD',
      heroId: 'CHRONOMANCER',
      profile: {
        ...DEFAULT_PROFILE,
        heroName: 'ผู้ตรวจประเมินระบบ',
        coins: 9999,
        xp: 5000,
        level: 20,
        rank: 'Top Form Sovereign',
        isTopFormUnlocked: true,
      },
      loginTimestamp: Date.now(),
    };
    this.saveSession(session);
    return session;
  }

  public async logout(): Promise<void> {
    this.saveSession(null);
    await authSession.logout();
  }
}

export const authService = new LocalAuthService();
