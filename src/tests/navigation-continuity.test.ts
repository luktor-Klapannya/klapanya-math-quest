// Node's type-stripping runner requires extensions; the application build resolves the same module.
// @ts-ignore TS5097
import { activityReturnDestination, postLoginDestination } from '../services/navigation-continuity.ts';

function assertEqual(actual: unknown, expected: unknown, message: string) {
  if (actual !== expected) throw new Error(`${message}: expected ${String(expected)}, received ${String(actual)}`);
}

assertEqual(postLoginDestination('STUDENT'), 'STUDENT_HOME', 'Student login destination');
assertEqual(postLoginDestination('TEACHER'), 'TEACHER_HOME', 'Teacher login destination');
assertEqual(activityReturnDestination('STUDENT_HOME', 'STUDENT'), 'STUDENT_HOME', 'Student Home origin');
assertEqual(activityReturnDestination('MAP', 'STUDENT'), 'MAP', 'Map origin');
assertEqual(activityReturnDestination('TUTOR_ROOM', 'STUDENT'), 'TUTOR_ROOM', 'Tutor origin');
assertEqual(activityReturnDestination('TEACHER_ASSIGNMENTS', 'TEACHER'), 'TEACHER_ASSIGNMENTS', 'Teacher assignment origin');
assertEqual(activityReturnDestination('TEACHER_ASSIGNMENTS', 'STUDENT'), 'STUDENT_HOME', 'Role-safe assignment fallback');

console.log('Navigation continuity tests passed.');
