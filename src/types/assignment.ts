export type AssignmentType = 'STAGE' | 'DRILL' | 'TUTOR' | 'DAILY_QUEST' | 'FINAL_PRACTICE';
export type AssignmentStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';

export interface Assignment {
  id: string;
  teacherId: string;
  teacherName: string;
  targetClassRoomId: string;
  subjectId: 'MATH';
  territoryId: 'FROZEN_ARCTIC';
  assignmentType: AssignmentType;
  title: string;
  description: string;
  targetStageId: string; // e.g. 'D1', 'ONET-3', 'F1', 'TUTOR_D1'
  targetDrillSkillTag?: string;
  dueDate: string; // YYYY-MM-DD
  status: AssignmentStatus;
  createdAt: string;
  completedStudentsCount?: number;
  totalStudentsCount?: number;
}

export interface StudentProgressReport {
  studentId: string;
  studentName: string;
  avatarVisualId: string;
  heroId: string;
  rank: string;
  clearedStagesCount: number;
  averageAccuracy: number;
  totalTimeMinutes: number;
  topWeakSkill: string;
  topMasteredSkill: string;
  lastActiveDate: string;
}
