import type { UserRole } from '../types/auth';
import type { AppScreen } from '../ui/game-ui/runtime-screens';

export type ActivityOrigin = 'STUDENT_HOME' | 'MAP' | 'TUTOR_ROOM' | 'TEACHER_ASSIGNMENTS';

export function postLoginDestination(role: UserRole): AppScreen {
  return role === 'TEACHER' ? 'TEACHER_HOME' : 'STUDENT_HOME';
}

export function activityReturnDestination(origin: ActivityOrigin, role?: UserRole): AppScreen {
  if (origin === 'TEACHER_ASSIGNMENTS') {
    return role === 'TEACHER' ? 'TEACHER_ASSIGNMENTS' : 'STUDENT_HOME';
  }
  return origin;
}
