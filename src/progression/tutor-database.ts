import { TutorLesson } from '../types/learning';
import { DOJO_QUESTIONS } from '../content/dojo-database';
import { SHRINE_QUESTIONS } from '../content/shrine-database';
import { ONET_QUESTIONS } from '../content/onet-database';
import { GEOMETRY_QUESTIONS } from '../content/geometry-database';
import { QUEST_QUESTIONS } from '../content/quest-database';

export const TUTOR_LESSONS: Record<string, TutorLesson> = {
  D1: {
    stageId: 'D1',
    title: 'Mental Arithmetic & Arithmetic Foundations',
    thaiTitle: 'บทเรียนติวเข้ม D1: การคิดเลขเร็วและลำดับการคำนวณ',
    targetMinutes: 3,
    steps: {
      concept: 'ลำดับความสำคัญของเครื่องหมายทางคณิตศาสตร์ (PEMDAS) และการคิดในใจอย่างเป็นระบบ',
      keyPrinciple: 'หากไม่มีวงเล็บ ต้องทำเครื่องหมาย × (คูณ) และ ÷ (หาร) จากซ้ายไปขวาก่อน + (บวก) และ - (ลบ) เสมอ',
      shortcut: 'เทคนิคคูณ 11: แยกตัวหน้าตัวหลัง แล้วเอาสองตัวบวกกันใส่ตรงกลาง เช่น 35 × 11 -> 3 _ 5 -> 3(3+5)5 = 385',
      commonTrap: 'อย่าคำนวณเรียงจากซ้ายไปขวาโดยไม่ดูเครื่องหมายคูณหาร เช่น 10 + 5 × 2 ห้ามคิด 15 × 2 = 30 เด็ดขาด! (ที่ถูกคือ 10 + 10 = 20)',
      workedExample: {
        problem: 'หาค่าของ 45 - 5 × 6 + 18 ÷ 2',
        stepByStep: [
          'ขั้นตอนที่ 1: ทำคูณและหารก่อน -> (5 × 6 = 30) และ (18 ÷ 2 = 9)',
          'ขั้นตอนที่ 2: แทนค่าลงในโจทย์ -> 45 - 30 + 9',
          'ขั้นตอนที่ 3: ทำบวกและลบจากซ้ายไปขวา -> 15 + 9 = 24',
        ],
        answer: '24',
      },
      tryOneQuestion: DOJO_QUESTIONS.D1[0],
    },
  },
  D5: {
    stageId: 'D5',
    title: 'GCD vs LCM Keyword Recognition',
    thaiTitle: 'บทเรียนติวเข้ม D5: การแยกแยะโจทย์ ห.ร.ม. และ ค.ร.น.',
    targetMinutes: 4,
    steps: {
      concept: 'การสังเกตคีย์เวิร์ดในโจทย์ปัญหาเพื่อเลือกระหว่าง ห.ร.ม. (การแบ่ง) กับ ค.ร.น. (การวนซ้ำ)',
      keyPrinciple: 'ห.ร.ม. = แบ่งสิ่งของให้ได้จำนวน "มากที่สุด" โดย "ไม่เหลือเศษ" | ค.ร.น. = เกิดขึ้นพร้อมกัน "ครั้งถัดไป/น้อยที่สุด"',
      shortcut: 'สูตรลัดความสัมพันธ์: ห.ร.ม.(A,B) × ค.ร.น.(A,B) = A × B',
      commonTrap: 'โจทย์เศษเหลือ: ถ้า ห.ร.ม. ต้อง "ลบเศษออกก่อน" จึงหา ห.ร.ม. | ถ้า ค.ร.น. ต้อง "หา ค.ร.น. ก่อนแล้วค่อยบวกเศษ"',
      workedExample: {
        problem: 'มีผลไม้ ส้ม 24 ผล และแอปเปิ้ล 36 ผล ต้องการจัดใส่ถุง ถุงละเท่าๆ กัน ให้ได้จำนวนผลไม้มากที่สุดโดยไม่ปนกัน จะจัดได้ถุงละกี่ผล?',
        stepByStep: [
          'สังเกตคีย์เวิร์ด: "แบ่งเท่าๆ กัน", "มากที่สุด", "ไม่ปนกัน" -> ใช้ ห.ร.ม.',
          'หา ห.ร.ม. ของ 24 และ 36:',
          '24 = 2³ × 3',
          '36 = 2² × 3²',
          'ห.ร.ม. = 2² × 3 = 12 ผลต่อถุง',
        ],
        answer: '12 ผล',
      },
      tryOneQuestion: DOJO_QUESTIONS.D5[0],
    },
  },
  D6: {
    stageId: 'D6',
    title: 'Fraction Reverse Thinking',
    thaiTitle: 'บทเรียนติวเข้ม D6: เศษส่วนระคนและการคิดย้อนกลับ',
    targetMinutes: 4,
    steps: {
      concept: 'การแก้โจทย์ปัญหาเศษส่วนที่มีคำว่า "ของที่เหลือ" โดยการมองสัดส่วนที่เหลืออยู่จริง',
      keyPrinciple: 'ถ้าใช้ไปเศษ a/b จะเหลือ (1 - a/b) เสมอ และการคิดย้อนกลับให้กลับเศษเป็นส่วน',
      shortcut: 'สัดส่วนเหลือสุทธิ = (1 - สัดส่วนที่ 1) × (1 - สัดส่วนที่ 2) × ...',
      commonTrap: 'อย่าเอาตัวเลขเศษส่วนมาบวกกันทันทีถ้าเป็นเศษส่วนของก้อนที่ต่างกัน!',
      workedExample: {
        problem: 'นักเรียนคนหนึ่งอ่านหนังสือ วันแรกอ่านได้ 2/5 ของเล่ม วันที่สองอ่านได้ 1/3 ของที่เหลือ ยังเหลืออีก 40 หน้า หนังสือมีกี่หน้า?',
        stepByStep: [
          'วันแรกอ่าน 2/5 -> เหลือ 3/5 ของเล่ม',
          'วันที่สองอ่าน 1/3 ของที่เหลือ -> เหลือ (2/3) × (3/5) = 2/5 ของเล่ม',
          '2/5 ของทั้งเล่ม = 40 หน้า',
          'จำนวนหน้าทั้งหมด = (40 × 5) ÷ 2 = 100 หน้า',
        ],
        answer: '100 หน้า',
      },
      tryOneQuestion: DOJO_QUESTIONS.D6[0],
    },
  },
  'ONET-3': {
    stageId: 'ONET-3',
    title: 'Multi-Tier Percentage & Scale Squared Rule',
    thaiTitle: 'บทเรียนติวเข้ม ONET-3: ร้อยละหลายต่อ & กฎพื้นที่มาตราส่วน',
    targetMinutes: 5,
    steps: {
      concept: 'การคำนวณส่วนลดหลายต่อ และกฎความสัมพันธ์ระหว่างมาตราส่วนความยาวกับพื้นที่ (Scale Squared)',
      keyPrinciple: 'เมื่อขยายความยาวด้านเป็น K เท่า -> พื้นที่จะขยายเป็น K² เท่าเสมอ!',
      shortcut: 'พื้นที่จริง = พื้นที่ในแผนที่ × (มาตราส่วน)²',
      commonTrap: 'ถ้ามาตราส่วน 1 : 100 แล้วพื้นที่ในรูป 5 ตร.ซม. พื้นที่จริงไม่ใช่ 500 ตร.ซม. แต่เป็น 5 × 100² = 50,000 ตร.ซม.!',
      workedExample: {
        problem: 'แผนผังบ้านใช้มาตราส่วน 1 : 200 ถ้าห้องนอนในแผนผังมีพื้นที่ 12 ตารางเซนติเมตร พื้นที่จริงของห้องนอนนี้กี่ตารางเมตร?',
        stepByStep: [
          'มาตราส่วนความยาว 1 ซม. : 200 ซม. (2 เมตร)',
          'มาตราส่วนพื้นที่ 1 ตร.ซม. : 2² = 4 ตารางเมตร',
          'พื้นที่จริง = 12 × 4 = 48 ตารางเมตร',
        ],
        answer: '48 ตารางเมตร',
      },
      tryOneQuestion: ONET_QUESTIONS['ONET-3'][0],
    },
  },
  GEO: {
    stageId: 'FORBIDDEN_GEOMETRY_RUINS',
    title: 'Cube Nets & Spatial Visualization',
    thaiTitle: 'บทเรียนติวเข้ม เรขาคณิต: การมองรูปคลี่ 3D และพื้นที่ใบไม้',
    targetMinutes: 4,
    steps: {
      concept: 'กฎการดูด้านตรงข้ามของรูปคลี่ลูกบาศก์ 11 แบบ และสูตรลัดพื้นที่แรเงาใบไม้',
      keyPrinciple: 'ด้านตรงข้ามกันในรูปลูกบาศก์จะ "เว้น 1 ช่องในแถวเดียวกัน" เสมอ และไม่มีวันใช้ขอบร่วมกัน',
      shortcut: 'สูตรลัดพื้นที่ใบไม้แรเงา = (4/7) × ด้าน² (เมื่อ π = 22/7)',
      commonTrap: 'อย่าสับสนระหว่างด้านที่อยู่ติดกัน (Adjacent) กับด้านตรงข้าม (Opposite)',
      workedExample: {
        problem: 'จัตุรัสยาวด้านละ 7 ซม. มีส่วนโค้งตัดกันเป็นรูปใบไม้ พื้นที่แรเงาคือเท่าใด?',
        stepByStep: [
          'ใช้สูตรลัดใบไม้: (4/7) × a²',
          '(4/7) × 7² = (4/7) × 49 = 28 ตารางเซนติเมตร',
        ],
        answer: '28 ตารางเซนติเมตร',
      },
      tryOneQuestion: GEOMETRY_QUESTIONS[0],
    },
  },
};

export function getTutorLessonForStage(stageId: string): TutorLesson {
  return TUTOR_LESSONS[stageId] || TUTOR_LESSONS.D1;
}

/** Uses existing canonical questions only; Tutor practice never mutates the corpus. */
export function getTutorPracticeQuestions(stageId:string){
  const pools:Record<string,typeof DOJO_QUESTIONS.D1>={
    D1:DOJO_QUESTIONS.D1,
    D5:DOJO_QUESTIONS.D5,
    D6:DOJO_QUESTIONS.D6,
    'ONET-3':ONET_QUESTIONS['ONET-3'],
    FORBIDDEN_GEOMETRY_RUINS:GEOMETRY_QUESTIONS,
  };
  const lesson=getTutorLessonForStage(stageId);
  const pool=pools[lesson.stageId]||DOJO_QUESTIONS.D1;
  return pool.slice(0,5);
}
