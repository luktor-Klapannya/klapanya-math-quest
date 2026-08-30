import { SpecialSkill, SpecialSkillId } from '../types/learning';
import { PlayerProfile } from '../types';

export const SPECIAL_SKILLS_DATABASE: Record<SpecialSkillId, SpecialSkill> = {
  FROST_RECALL: {
    id: 'FROST_RECALL',
    name: 'Frost Recall',
    thaiName: 'จิตระลึกสูตรศักดิ์สิทธิ์ (Frost Recall)',
    icon: '❄️',
    requiredMasteryLevel: 1,
    requiredHeroRank: 'Novice Trainee',
    unlockDescription: 'ปลดล็อกตั้งแต่เริ่มต้นเพื่อช่วยฝึกฝนการจำสูตรลัด',
    effectDescription: 'แสดงสูตรลัดและกฎคณิตศาสตร์ที่เกี่ยวข้องกับโจทย์ข้อนี้ในโหมดฝึกซ้อม',
    cooldownBattles: 0,
    isAllowedInExam: false,
  },
  CHAIN_INSIGHT: {
    id: 'CHAIN_INSIGHT',
    name: 'Chain Insight',
    thaiName: 'ญาณหยั่งรู้ลูกโซ่ (Chain Insight)',
    icon: '⛓️',
    requiredMasteryLevel: 2,
    requiredHeroRank: 'Dojo Adept',
    unlockDescription: 'ต้องผ่าน Training Dojo อย่างน้อย 3 ด่าน และมี Mastery >= 40%',
    effectDescription: 'เผยขั้นตอนการคิดเชื่อมโยงถัดไปในโจทย์ปัญหาหลายขั้นตอน',
    cooldownBattles: 1,
    isAllowedInExam: false,
  },
  TRAP_SENSE: {
    id: 'TRAP_SENSE',
    name: 'Trap Sense',
    thaiName: 'เนตรจับกับดักโจทย์ (Trap Sense)',
    icon: '👁️',
    requiredMasteryLevel: 3,
    requiredHeroRank: 'Arctic Elite',
    unlockDescription: 'ต้องผ่าน Farming Shrine ครบทั้ง 4 ด่าน และมี Trap Detection Mastery >= 50%',
    effectDescription: 'ไฮไลต์คำลวงและจุดหลอกในข้อสอบที่นักเรียนมักทำผิดบ่อย',
    cooldownBattles: 1,
    isAllowedInExam: false,
  },
  PRECISION_FOCUS: {
    id: 'PRECISION_FOCUS',
    name: 'Precision Focus',
    thaiName: 'สมาธิตัดช้อยส์สมบูรณ์ (Precision Focus)',
    icon: '🎯',
    requiredMasteryLevel: 3,
    requiredHeroRank: 'Gateway Guardian',
    unlockDescription: 'ต้องผ่าน O-NET Gateway Tier 2 และมี Calculation Mastery >= 60%',
    effectDescription: 'กำจัด 1 ตัวเลือกลวงที่ผิดอย่างแน่นอนที่สุด 1 ครั้งต่อด่าน',
    cooldownBattles: 2,
    isAllowedInExam: false,
  },
  SECOND_WIND: {
    id: 'SECOND_WIND',
    name: 'Second Wind',
    thaiName: 'ฟื้นพลังใจสู้บอส (Second Wind)',
    icon: '💨',
    requiredMasteryLevel: 4,
    requiredHeroRank: 'Gateway Guardian',
    unlockDescription: 'ต้องเคยพิชิตมหาบอสอย่างน้อย 1 ตัวในโหมด Challenge',
    effectDescription: 'ฟื้นฟู Resolve หัวใจ 1 ดวงทันทีเมื่อกำลังจะแพ้ในโหมด Boss Practice',
    cooldownBattles: 3,
    isAllowedInExam: false,
  },
  CRYSTAL_VISION: {
    id: 'CRYSTAL_VISION',
    name: 'Crystal Vision',
    thaiName: 'เนตรผลึกเรขาคณิต (Crystal Vision)',
    icon: '🔮',
    requiredMasteryLevel: 4,
    requiredHeroRank: 'Arctic Elite',
    unlockDescription: 'ต้องผ่าน Forbidden Geometry Ruins อย่างน้อย 3 ห้อง',
    effectDescription: 'ฉายเส้นช่วยสร้างและคลี่รูปทรง 3D ให้เห็นด้านตรงข้ามชัดเจน',
    cooldownBattles: 2,
    isAllowedInExam: false,
  },
  REVERSE_CHECK: {
    id: 'REVERSE_CHECK',
    name: 'Reverse Check',
    thaiName: 'มนตราตรวจคำตอบย้อนกลับ (Reverse Check)',
    icon: '🔄',
    requiredMasteryLevel: 5,
    requiredHeroRank: 'Grandmaster',
    unlockDescription: 'ต้องหลอม Excalibur of Absolute Admission สำเร็จ',
    effectDescription: 'นำคำตอบที่เลือกไปแทนค่าลงในโจทย์เพื่อพิสูจน์ความถูกต้องก่อนยืนยันส่ง',
    cooldownBattles: 2,
    isAllowedInExam: false,
  },
  MENTAL_BURST: {
    id: 'MENTAL_BURST',
    name: 'Mental Burst',
    thaiName: 'ระเบิดปัญญารับเหรียญคูณสอง (Mental Burst)',
    icon: '💥',
    requiredMasteryLevel: 5,
    requiredHeroRank: 'Top Form Sovereign',
    unlockDescription: 'ปลดล็อกสถานะ Top Form Sovereign สมบูรณ์',
    effectDescription: 'รับเหรียญทองและ XP เพิ่มขึ้น 2 เท่าเมื่อทำ Streak ตอบถูกต่อเนื่อง 5 ข้อ',
    cooldownBattles: 1,
    isAllowedInExam: false,
  },
};

export function checkSpecialSkillEligibility(
  profile: PlayerProfile,
  skillId: SpecialSkillId
): boolean {
  const skill = SPECIAL_SKILLS_DATABASE[skillId];
  if (!skill) return false;
  if (profile.unlockedSpecialSkills?.includes(skillId)) return true;

  // Rank / level checks
  if (skillId === 'FROST_RECALL') return true;
  if (skillId === 'CHAIN_INSIGHT') {
    const dojoCleared = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'].filter((s) => profile.clearedStages.includes(s)).length;
    return dojoCleared >= 3;
  }
  if (skillId === 'TRAP_SENSE') {
    const shrineCleared = ['F1', 'F2', 'F3', 'F4'].filter((s) => profile.clearedStages.includes(s)).length;
    return shrineCleared >= 4;
  }
  if (skillId === 'PRECISION_FOCUS') {
    return profile.clearedStages.includes('ONET-2') || profile.clearedStages.includes('ONET-3');
  }
  if (skillId === 'SECOND_WIND') {
    return profile.clearedStages.includes('BOSS-1') || profile.clearedStages.includes('BOSS-2');
  }
  if (skillId === 'CRYSTAL_VISION') {
    return profile.clearedStages.includes('FORBIDDEN_GEOMETRY_RUINS');
  }
  if (skillId === 'REVERSE_CHECK') {
    return profile.isFrostCoreForgeUnlocked || profile.unlockedGear.includes('LEGENDARY_ADMISSION_WEAPON');
  }
  if (skillId === 'MENTAL_BURST') {
    return profile.isTopFormUnlocked;
  }

  return false;
}
