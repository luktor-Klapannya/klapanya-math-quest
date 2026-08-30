import { PlayerProfile, HeroClassId, TerritoryId } from './index';

export type UserRole = 'STUDENT' | 'TEACHER' | 'REVIEWER';

export interface StudentSession {
  userId: string;
  role: 'STUDENT';
  studentName: string;
  classRoomId: string;
  avatarVisualId: string;
  heroId: HeroClassId;
  profile: PlayerProfile;
  loginTimestamp: number;
}

export interface TeacherSession {
  userId: string;
  role: 'TEACHER';
  teacherName: string;
  schoolName: string;
  assignedClasses: string[];
  loginTimestamp: number;
}

export type UserSession = StudentSession | TeacherSession;

export interface IAuthAdapter {
  getCurrentSession(): UserSession | null;
  loginAsStudent(studentName: string, classRoomId?: string): Promise<StudentSession>;
  loginAsTeacher(teacherName: string, schoolName?: string): Promise<TeacherSession>;
  loginAsReviewer(): Promise<StudentSession>;
  logout(): Promise<void>;
}
