import { Assignment, StudentProgressReport } from '../types/assignment';

const ASSIGNMENTS_STORAGE_KEY = 'klapanya_math_assignments_v1';

export const INITIAL_MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 'ASG-001',
    teacherId: 'teacher_01',
    teacherName: 'คุณครูปัญญา วิชาการ',
    targetClassRoomId: 'P6-1',
    subjectId: 'MATH',
    territoryId: 'FROZEN_ARCTIC',
    assignmentType: 'TUTOR',
    title: '📖 ติวเข้ม 7 ขั้นตอน: บทที่ 1 ค่าประจำหลักและการคูณลัด',
    description: 'ศึกษา Concept และทำความเข้าใจ Common Trap ในห้องติว ก่อนเริ่มทำแบบฝึกหัด',
    targetStageId: 'D1',
    dueDate: '2026-09-05',
    status: 'ASSIGNED',
    createdAt: '2026-08-30',
    completedStudentsCount: 24,
    totalStudentsCount: 32,
  },
  {
    id: 'ASG-002',
    teacherId: 'teacher_01',
    teacherName: 'คุณครูปัญญา วิชาการ',
    targetClassRoomId: 'P6-1',
    subjectId: 'MATH',
    territoryId: 'FROZEN_ARCTIC',
    assignmentType: 'DRILL',
    title: '⚡ ดริลล์ฝึกคิดเลขเร็ว F1 Speed Rush (5s Baseline)',
    description: 'ฝึกความเร็วและความแม่นยำในการบวก-ลบระคนแบบจับเวลาข้อละ 5 วินาที',
    targetStageId: 'F1',
    targetDrillSkillTag: 'mental_speed',
    dueDate: '2026-09-06',
    status: 'IN_PROGRESS',
    createdAt: '2026-08-30',
    completedStudentsCount: 18,
    totalStudentsCount: 32,
  },
  {
    id: 'ASG-003',
    teacherId: 'teacher_01',
    teacherName: 'คุณครูปัญญา วิชาการ',
    targetClassRoomId: 'P6-1',
    subjectId: 'MATH',
    territoryId: 'FROZEN_ARCTIC',
    assignmentType: 'STAGE',
    title: '🛡️ ท้าทายด่านข้อสอบ O-NET 3 (โจทย์ขั้นสูง & สมการ)',
    description: 'เตรียมความพร้อมข้อสอบจริง สทศ. ระดับมาตรฐานความพร้อม Proficient',
    targetStageId: 'ONET-3',
    dueDate: '2026-09-10',
    status: 'ASSIGNED',
    createdAt: '2026-08-30',
    completedStudentsCount: 12,
    totalStudentsCount: 32,
  },
];

export const MOCK_STUDENTS_PROGRESS: StudentProgressReport[] = [
  {
    studentId: 'std_01',
    studentName: 'น้องกล้าหาญ (Alex The Brave)',
    avatarVisualId: 'BOY_WIZARD',
    heroId: 'CHRONOMANCER',
    rank: 'R3 Dojo Adept',
    clearedStagesCount: 6,
    averageAccuracy: 92,
    totalTimeMinutes: 85,
    topWeakSkill: 'เศษส่วนซ้อน (Multi-tier Fractions)',
    topMasteredSkill: 'ค่าประจำหลักและตัวประกอบ (Place Value & Primes)',
    lastActiveDate: 'วันนี้ (2026-08-30)',
  },
  {
    studentId: 'std_02',
    studentName: 'น้องปัญญาวดี (Luna Wisdom)',
    avatarVisualId: 'GIRL_KNIGHT',
    heroId: 'PALADIN',
    rank: 'R5 Gateway Guardian',
    clearedStagesCount: 12,
    averageAccuracy: 96,
    totalTimeMinutes: 140,
    topWeakSkill: 'รูปเรขาคณิต 3 มิติ (Cube Nets)',
    topMasteredSkill: 'อัตราส่วนและร้อยละ (Ratio & Percent)',
    lastActiveDate: 'วันนี้ (2026-08-30)',
  },
  {
    studentId: 'std_03',
    studentName: 'น้องชานนท์ (Kenji Arrow)',
    avatarVisualId: 'BOY_RANGER',
    heroId: 'SNIPER',
    rank: 'R2 Trainee',
    clearedStagesCount: 4,
    averageAccuracy: 78,
    totalTimeMinutes: 45,
    topWeakSkill: 'ลำดับการคำนวณ PEMDAS',
    topMasteredSkill: 'การคูณ-หารทศนิยม',
    lastActiveDate: 'เมื่อวาน (2026-08-29)',
  },
];

class AssignmentService {
  private assignments: Assignment[] = [];

  constructor() {
    this.assignments = this.loadAssignments();
  }

  private loadAssignments(): Assignment[] {
    if (typeof window === 'undefined') return INITIAL_MOCK_ASSIGNMENTS;
    try {
      const raw = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // Fallback
    }
    return INITIAL_MOCK_ASSIGNMENTS;
  }

  public getAssignments(classRoomId: string = 'P6-1'): Assignment[] {
    return this.assignments.filter((a) => a.targetClassRoomId === classRoomId || classRoomId === 'ALL');
  }

  public addAssignment(assignment: Omit<Assignment, 'id' | 'createdAt'>): Assignment {
    const newAsg: Assignment = {
      ...assignment,
      id: `ASG-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().split('T')[0],
      completedStudentsCount: 0,
      totalStudentsCount: 32,
    };
    this.assignments.unshift(newAsg);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(this.assignments));
      } catch (err) {
        console.warn('Could not save assignments', err);
      }
    }
    return newAsg;
  }

  public getStudentProgressReports(): StudentProgressReport[] {
    return MOCK_STUDENTS_PROGRESS;
  }
}

export const assignmentService = new AssignmentService();
