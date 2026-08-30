import { QuestionItem } from '../types';

export interface GeometryChamberInfo {
  id: string;
  name: string;
  thaiName: string;
  academicFocus: string;
  questionCount: number;
}

export const GEOMETRY_CHAMBERS: GeometryChamberInfo[] = [
  { id: 'GEO-1', name: 'Chamber I', thaiName: 'ห้องที่ 1: รูปคลี่ลูกบาศก์ & มิติสัมพันธ์', academicFocus: 'รูปคลี่ 11 แบบ, ด้านตรงข้าม และการประกอบทรง 3 มิติ', questionCount: 10 },
  { id: 'GEO-2', name: 'Chamber II', thaiName: 'ห้องที่ 2: มุม เส้นขนาน & รูปหลายเหลี่ยม', academicFocus: 'มุมแย้ง มุมสมนัย ผลบวกมุมภายในรูปสามเหลี่ยมและ n-เหลี่ยม', questionCount: 10 },
  { id: 'GEO-3', name: 'Chamber III', thaiName: 'ห้องที่ 3: วงกลม & พื้นที่แรเงาซับซ้อน', academicFocus: 'พื้นที่ใบไม้แรเงา วงแหวน ส่วนโค้ง และเซกเตอร์', questionCount: 10 },
  { id: 'GEO-4', name: 'Chamber IV', thaiName: 'ห้องที่ 4: พื้นที่ผิว ปริมาตร & ความจุ', academicFocus: 'ปริซึม ทรงกระบอก พีระมิด และการแปลงหน่วยลูกบาศก์', questionCount: 10 },
  { id: 'GEO-5', name: 'Chamber V', thaiName: 'ห้องที่ 5: เรขาคณิตประยุกต์ & การแทนที่น้ำ', academicFocus: 'การหย่อนวัตถุแทนที่น้ำ, ทฤษฎีบทพิกัด และรูปทรง 3D เชิงซ้อน (รวมข้อ GEO-45 ถึง 50)', questionCount: 10 },
];

function generateGeometryQuestions(): QuestionItem[] {
  const list: QuestionItem[] = [];

  for (let i = 1; i <= 50; i++) {
    const qId = `GEO-${String(i).padStart(3, '0')}`;
    let chamberId = 'GEO-1';
    if (i > 40) chamberId = 'GEO-5';
    else if (i > 30) chamberId = 'GEO-4';
    else if (i > 20) chamberId = 'GEO-3';
    else if (i > 10) chamberId = 'GEO-2';

    let qText = '';
    let correctVal = '';
    let distractors: string[] = [];
    let hint = '';
    let diagType: 'CUBE_NET' | 'PARALLEL_ANGLES' | 'SHADED_CIRCLE' | 'CYLINDER_WATER' | 'COMPOSITE_3D' | 'POLYGON_GRID' = 'CUBE_NET';

    if (chamberId === 'GEO-1') {
      diagType = 'CUBE_NET';
      const oppositeFace = i % 2 === 0 ? 'หน้าหมายเลข 4' : 'หน้าหมายเลข 3';
      qText = `จากรูปคลี่ของลูกบาศก์ที่กำหนดให้ หากพับเป็นลูกบาศก์แล้ว หน้าที่มีตัวอักษร A จะอยู่ตรงข้ามกับหน้าใด`;
      correctVal = oppositeFace;
      distractors = ['หน้าหมายเลข 1', 'หน้าหมายเลข 2', 'หน้าหมายเลข 5'];
      hint = 'กฎรูปคลี่: ในแถวแนวยาว หน้าที่เว้น 1 ช่องจะอยู่ตรงข้ามกันเสมอ';
    } else if (chamberId === 'GEO-2') {
      diagType = 'PARALLEL_ANGLES';
      const angleA = 60 + (i % 6) * 5; // 60, 65, 70...
      const angleX = 180 - angleA;
      qText = `จากรูป เส้นตรงสองเส้นขนานกัน มีเส้นตัดขวางทำมุม ${angleA}° จงหาขนาดของมุมภายในบนข้างเดียวกันของเส้นตัด (มุม x°)`;
      correctVal = `${angleX}°`;
      distractors = [`${angleA}°`, `${angleX - 10}°`, `${angleA + 20}°`];
      hint = `มุมภายในบนข้างเดียวกันของเส้นตัดรวมกันได้ 180° เสมอ: x = 180 - ${angleA} = ${angleX}°`;
    } else if (chamberId === 'GEO-3') {
      diagType = 'SHADED_CIRCLE';
      const a = 14;
      const leafArea = (4 / 7) * a * a; // 112
      qText = `รูปสี่เหลี่ยมจัตุรัสด้านยาว ${a} ซม. มีส่วนโค้งของวงกลมสองวงตัดกันเกิดเป็นรูปใบไม้แรเงา จงหาพื้นที่แรเงา (กำหนดให้ π = 22/7)`;
      correctVal = `${leafArea} ตารางเซนติเมตร`;
      distractors = [`${a * a} ตารางเซนติเมตร`, `${(leafArea * 1.5).toFixed(0)} ตารางเซนติเมตร`, `${(leafArea / 2).toFixed(0)} ตารางเซนติเมตร`];
      hint = `สูตรพื้นที่ใบไม้แรเงา = (4/7)a² = (4/7) × ${a}² = ${leafArea} ตร.ซม.`;
    } else if (chamberId === 'GEO-4') {
      diagType = 'CYLINDER_WATER';
      const r = 7;
      const h = 8 + (i % 5);
      const vol = (22 / 7) * r * r * h;
      qText = `ถังเก็บน้ำทรงกระบอกรัศมีฐาน ${r} เมตร มีน้ำสูง ${h} เมตร ปริมาตรน้ำในถังคิดเป็นกี่ลูกบาศก์เมตร`;
      correctVal = `${vol} ลูกบาศก์เมตร`;
      distractors = [`${vol - 154} ลูกบาศก์เมตร`, `${vol * 2} ลูกบาศก์เมตร`, `${(vol / 2).toFixed(0)} ลูกบาศก์เมตร`];
      hint = `ปริมาตรทรงกระบอก = πr²h = (22/7) × ${r}² × ${h} = ${vol} ลบ.ม.`;
    } else {
      // Chamber GEO-5 (Includes GEO-045 through GEO-050)
      if (i === 45) {
        diagType = 'COMPOSITE_3D';
        qText = `ลูกบาศก์ไม้ขนาด 1×1×1 ซม. จำนวน 3 ลูก นำมาต่อกันดังรูป พื้นที่ผิวภายนอกทั้งหมดคิดเป็นกี่ตารางเซนติเมตร`;
        correctVal = `14 ตารางเซนติเมตร`;
        distractors = [`18 ตารางเซนติเมตร`, `12 ตารางเซนติเมตร`, `16 ตารางเซนติเมตร`];
        hint = `ลูกบาศก์ 3 ลูกมี 18 หน้า มีรอยต่อ 2 รอย (หายไป 4 หน้า): 18 - 4 = 14 ตร.ซม.`;
      } else if (i === 46) {
        diagType = 'CYLINDER_WATER';
        qText = `หย่อนลูกเหล็กตันลงในถังทรงกระบอกรัศมี 7 ซม. ทำให้น้ำสูงขึ้น 4 ซม. ลูกเหล็กมีปริมาตรกี่ลูกบาศก์เซนติเมตร`;
        correctVal = `616 ลูกบาศก์เซนติเมตร`;
        distractors = [`308 ลูกบาศก์เซนติเมตร`, `88 ลูกบาศก์เซนติเมตร`, `1,232 ลูกบาศก์เซนติเมตร`];
        hint = `ปริมาตร = πr²h = (22/7) × 7² × 4 = 616 ลบ.ซม.`;
      } else if (i === 47) {
        diagType = 'CUBE_NET';
        qText = `จากรูปคลี่ลูกบาศก์แบบ 2-3-1 หากหน้าบนสุดคือหน้า A หน้ารองรับด้านล่างสุดจะเป็นหน้าใด`;
        correctVal = `หน้าหมายเลข 5`;
        distractors = [`หน้าหมายเลข 1`, `หน้าหมายเลข 2`, `หน้าหมายเลข 4`];
        hint = `หน้าตรงข้ามของ A ในรูปคลี่ 2-3-1 คือหน้า 5`;
      } else if (i === 48) {
        diagType = 'PARALLEL_ANGLES';
        qText = `มุมแย้งภายในระหว่างเส้นขนานคู่หนึ่งมีขนาด (2x + 10)° และ 70° จงหาค่าของ x`;
        correctVal = `30`;
        distractors = [`40`, `25`, `35`];
        hint = `มุมแย้งมีขนาดเท่ากัน: 2x + 10 = 70 -> 2x = 60 -> x = 30`;
      } else if (i === 49) {
        diagType = 'SHADED_CIRCLE';
        qText = `วงกลมแนบในจัตุรัสด้านยาว 14 ซม. พื้นที่ส่วนเกินที่อยู่นอกวงกลมแต่อยู่ในจัตุรัสมีค่ากี่ตารางเซนติเมตร`;
        correctVal = `42 ตารางเซนติเมตร`;
        distractors = [`36 ตารางเซนติเมตร`, `48 ตารางเซนติเมตร`, `54 ตารางเซนติเมตร`];
        hint = `พื้นที่เหลือ = พื้นที่จัตุรัส - พื้นที่วงกลม = 14² - (22/7)×7² = 196 - 154 = 42 ตร.ซม.`;
      } else if (i === 50) {
        diagType = 'POLYGON_GRID';
        qText = `รูปสี่เหลี่ยมด้านขนานบนตารางพิกัด ฐานยาว 6 หน่วย สูง 4 หน่วย มีพื้นที่กี่ตารางหน่วย`;
        correctVal = `24 ตารางหน่วย`;
        distractors = [`12 ตารางหน่วย`, `20 ตารางหน่วย`, `28 ตารางหน่วย`];
        hint = `พื้นที่สี่เหลี่ยมด้านขนาน = ฐาน × สูง = 6 × 4 = 24 ตารางหน่วย`;
      } else {
        diagType = 'COMPOSITE_3D';
        qText = `รูปทรงตัน 3 มิติประกอบจากลูกบาศก์ขนาด 2 ซม. จำนวน 5 ลูก มีปริมาตรรวมกี่ลูกบาศก์เซนติเมตร`;
        correctVal = `40 ลูกบาศก์เซนติเมตร`;
        distractors = [`30 ลูกบาศก์เซนติเมตร`, `50 ลูกบาศก์เซนติเมตร`, `20 ลูกบาศก์เซนติเมตร`];
        hint = `ปริมาตร 1 ลูก = 2³ = 8 ลบ.ซม. ดังนั้น 5 ลูก = 5 × 8 = 40 ลบ.ซม.`;
      }
    }

    list.push({
      id: qId,
      stageId: 'FORBIDDEN_GEOMETRY_RUINS',
      chamberId,
      topic: 'Forbidden Geometry Ruins: โบราณสถานเรขาคณิต',
      subtopic: `ห้องปริศนา ${chamberId} (${qId})`,
      difficulty: (i <= 20 ? 3 : i <= 40 ? 4 : 5) as 3 | 4 | 5,
      cognitiveLevel: i <= 20 ? 'APPLICATION' : 'ADVANCED_REASONING',
      mechanicType: diagType === 'CUBE_NET' ? 'GEOMETRY_ROTATE' : 'DIAGRAM_INSPECTION',
      skillTags: ['geometry_spatial', 'calculation'],
      misconceptionTags: ['surface_area_overlap_trap', 'cube_net_adjacent_trap'],
      auditStatus: 'VERIFIED',
      questionText: qText,
      options: [
        { id: 'opt-1', text: correctVal, isCorrect: true },
        { id: 'opt-2', text: distractors[0], isCorrect: false },
        { id: 'opt-3', text: distractors[1], isCorrect: false },
        { id: 'opt-4', text: distractors[2], isCorrect: false },
      ],
      powerUpHint: '💡 ' + hint,
      explanation: `การวิเคราะห์เรขาคณิต:\n${hint}\nได้คำตอบ = ${correctVal}`,
      targetTimeSec: 75,
      rewardCoins: 50,
      rewardXp: 30,
      requiresDiagram: true,
      diagramType: diagType,
    });
  }

  return list;
}

export const ALL_GEOMETRY_QUESTIONS = generateGeometryQuestions();
export const GEOMETRY_QUESTIONS = ALL_GEOMETRY_QUESTIONS;

export function getGeometryQuestions(chamberId?: string): QuestionItem[] {
  if (chamberId) {
    return ALL_GEOMETRY_QUESTIONS.filter((q) => q.chamberId === chamberId);
  }
  return ALL_GEOMETRY_QUESTIONS;
}

export function getTotalGeometryQuestionCount(): number {
  return ALL_GEOMETRY_QUESTIONS.length;
}
