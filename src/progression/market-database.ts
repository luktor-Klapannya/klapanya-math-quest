import { ConsumableItem, ConsumableItemId } from '../types/learning';
import { PlayerProfile } from '../types';

export const MAGIC_MARKET_ITEMS: Record<ConsumableItemId, ConsumableItem> = {
  MAGIC_HINT: {
    id: 'MAGIC_HINT',
    name: 'Magic Hint Potion',
    thaiName: 'น้ำยาคำใบ้เวทมนตร์ (Level 1 Hint)',
    icon: '🔮',
    coinPrice: 30,
    description: 'เปิดอ่านคัมภีร์ใบ้สูตรลัดและแนวคิดสำคัญของโจทย์ข้อนี้โดยไม่เสียคะแนน',
    effectDescription: 'ปลดล็อกคำใบ้ระดับ 1 ในโหมดฝึกซ้อมและโดโจ',
    isAllowedInExam: false,
  },
  DEEP_HINT_SCROLL: {
    id: 'DEEP_HINT_SCROLL',
    name: 'Deep Hint Scroll',
    thaiName: 'ม้วนคัมภีร์เฉลยแนวทาง (Level 2 Solution)',
    icon: '📜',
    coinPrice: 50,
    description: 'เปิดดูขั้นตอนการคำนวณอย่างละเอียดทีละบรรทัด พร้อมสูตรลัดเฉพาะข้อ',
    effectDescription: 'ปลดล็อกวิธีคิดระดับ 2 สำหรับโจทย์ยาก',
    isAllowedInExam: false,
  },
  FIFTY_FIFTY_RUNE: {
    id: 'FIFTY_FIFTY_RUNE',
    name: '50:50 Shadow Rune',
    thaiName: 'รูนตัดตัวเลือกลวง (50:50)',
    icon: '✂️',
    coinPrice: 40,
    description: 'ระเบิดทำลายตัวเลือกลวงที่ผิดออกทันที 2 ตัวเลือก เหลือเพียง 2 ตัวเลือกให้วิเคราะห์',
    effectDescription: 'ตัดช้อยส์ผิด 2 ช้อยส์ในโหมดฝึกซ้อม',
    isAllowedInExam: false,
  },
  TIME_POTION: {
    id: 'TIME_POTION',
    name: 'Chrono Time Potion',
    thaiName: 'น้ำยาหยุดเวลา (+30 วินาที)',
    icon: '⏳',
    coinPrice: 35,
    description: 'เพิ่มเวลาคิดคำนวณในโหมดจับเวลาอีก 30 วินาที เพื่อให้คิดทบทวนได้รอบคอบ',
    effectDescription: 'เพิ่มเวลา 30s ในการฝึกสปีดรัน',
    isAllowedInExam: false,
  },
  AEGIS_SHIELD: {
    id: 'AEGIS_SHIELD',
    name: 'Aegis Barrier',
    thaiName: 'โล่คุ้มครองคอมโบ (Aegis Shield)',
    icon: '🛡️',
    coinPrice: 60,
    description: 'ป้องกันการสูญเสีย Streak คอมโบ หรือ Resolve หัวใจ 1 ครั้งเมื่อตอบผิด',
    effectDescription: 'ป้องกันหัวใจลด 1 ครั้งในการสู้บอสโหมดซ้อม',
    isAllowedInExam: false,
  },
  RETRY_TOKEN: {
    id: 'RETRY_TOKEN',
    name: 'Phoenix Retry Token',
    thaiName: 'เหรียญฟีนิกซ์ขอแก้ตัวใหม่ (Retry Token)',
    icon: '🪙',
    coinPrice: 50,
    description: 'ขอโอกาสตอบข้อเดิมใหม่อีก 1 ครั้งทันทีหลังตอบผิด โดยไม่นับเป็นข้อเสีย',
    effectDescription: 'ขอตอบซ้ำ 1 ครั้งในโหมดฝึกซ้อม',
    isAllowedInExam: false,
  },
  REVEAL_STEP: {
    id: 'REVEAL_STEP',
    name: 'First Step Crystal',
    thaiName: 'ผลึกเปิดก้าวแรก (First Step Reveal)',
    icon: '✨',
    coinPrice: 45,
    description: 'แสดงสมการขั้นแรกหรือการตั้งประโยคสัญลักษณ์ของโจทย์ปัญหาหลายขั้นตอน',
    effectDescription: 'เปิดโครงสร้างขั้นแรกของโจทย์ปัญหา',
    isAllowedInExam: false,
  },
  DIAGRAM_LENS: {
    id: 'DIAGRAM_LENS',
    name: 'Geometry Helper Lens',
    thaiName: 'แว่นตาเรขาคณิต (Diagram Lens)',
    icon: '📐',
    coinPrice: 50,
    description: 'ลากเส้นประช่วยสร้างและไฮไลต์มุมที่เท่ากันในรูปเรขาคณิตเวกเตอร์ SVG',
    effectDescription: 'ไฮไลต์เส้นช่วยสร้างในโหมดเรขาคณิต',
    isAllowedInExam: false,
  },
};

export function purchaseMarketItem(
  profile: PlayerProfile,
  itemId: ConsumableItemId,
  quantity: number = 1
): { success: boolean; updatedProfile: PlayerProfile; message: string } {
  const item = MAGIC_MARKET_ITEMS[itemId];
  if (!item) return { success: false, updatedProfile: profile, message: 'ไม่พบไอเทมนี้ในร้านค้า' };

  const totalCost = item.coinPrice * quantity;
  if (profile.coins < totalCost) {
    return { 
      success: false, 
      updatedProfile: profile, 
      message: `เหรียญทองไม่เพียงพอ (ต้องการ ${totalCost} 🪙 แต่มีเพียง ${profile.coins} 🪙)` 
    };
  }

  const currentCount = profile.consumableInventory?.[itemId] || 0;
  const updatedInventory = {
    ...(profile.consumableInventory || {}),
    [itemId]: currentCount + quantity,
  };

  const updatedProfile: PlayerProfile = {
    ...profile,
    coins: profile.coins - totalCost,
    consumableInventory: updatedInventory,
  };

  return {
    success: true,
    updatedProfile,
    message: `ซื้อ ${item.thaiName} จำนวน ${quantity} ชิ้นสำเร็จ! (จ่าย ${totalCost} 🪙)`,
  };
}

export function useConsumableItem(
  profile: PlayerProfile,
  itemId: ConsumableItemId,
  isExamMode: boolean
): { success: boolean; updatedProfile: PlayerProfile; message: string } {
  if (isExamMode) {
    return {
      success: false,
      updatedProfile: profile,
      message: 'ไม่อนุญาตให้ใช้ไอเทมช่วยเหลือในโหมดการสอบจริง (Exam Integrity Protection)',
    };
  }

  const currentCount = profile.consumableInventory?.[itemId] || 0;
  if (currentCount <= 0) {
    return {
      success: false,
      updatedProfile: profile,
      message: 'ไม่มีไอเทมนี้ในกระเป๋า กรุณาซื้อเพิ่มที่ตลาดเวทมนตร์',
    };
  }

  const updatedInventory = {
    ...(profile.consumableInventory || {}),
    [itemId]: currentCount - 1,
  };

  return {
    success: true,
    updatedProfile: {
      ...profile,
      consumableInventory: updatedInventory,
    },
    message: `ใช้งาน ${MAGIC_MARKET_ITEMS[itemId]?.thaiName || itemId} สำเร็จ!`,
  };
}
