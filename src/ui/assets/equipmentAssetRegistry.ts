/**
 * Central Equipment Asset Registry
 * Data-driven registry for unlockable weapons, armor, accessories, and gear sets.
 */

export type EquipmentSlot = 
  | 'weapon'
  | 'armor'
  | 'headgear'
  | 'accessories'
  | 'ring'
  | 'crystal'
  | 'necklace'
  | 'shield_charm'
  | 'item'
  | 'potion'
  | 'scroll'
  | 'key'
  | 'backpack';

export interface EquipmentItem {
  id: string;
  slot: EquipmentSlot;
  nameEn: string;
  nameTh: string;
  requiredRank: string; // R1 - R7
  priceCoins: number;
  bonusStat: {
    label: string;
    value: string;
  };
  assetPath: string;
  glowColor: string;
}

export const EQUIPMENT_ASSET_REGISTRY: Record<string, EquipmentItem> = {
  // 1. WEAPONS
  'WP_NOVICE_WAND': {
    id: 'WP_NOVICE_WAND',
    slot: 'weapon',
    nameEn: 'Novice Chrono Wand',
    nameTh: 'ไม้คทากาลเวลาฝึกหัด',
    requiredRank: 'R1',
    priceCoins: 0,
    bonusStat: { label: 'Mental Speed', value: '+5%' },
    assetPath: '/equipment/weapons/chrono_staff.png',
    glowColor: '#38bdf8',
  },
  'WP_PALADIN_BLADE': {
    id: 'WP_PALADIN_BLADE',
    slot: 'weapon',
    nameEn: 'Logic Guardian Blade',
    nameTh: 'ดาบตรรกะผู้พิทักษ์',
    requiredRank: 'R2',
    priceCoins: 50,
    bonusStat: { label: 'Accuracy Shield', value: '+10%' },
    assetPath: '/equipment/weapons/logic_sword.png',
    glowColor: '#fbbf24',
  },
  'WP_SNIPER_BOW': {
    id: 'WP_SNIPER_BOW',
    slot: 'weapon',
    nameEn: 'Geometry Eagle Bow',
    nameTh: 'คันศรเรขาคณิตเนตรเหยี่ยว',
    requiredRank: 'R3',
    priceCoins: 120,
    bonusStat: { label: 'Critical Sight', value: '+15%' },
    assetPath: '/equipment/weapons/sniper_bow.png',
    glowColor: '#10b981',
  },
  'WP_ROGUE_DAGGERS': {
    id: 'WP_ROGUE_DAGGERS',
    slot: 'weapon',
    nameEn: 'Reverse Twin Daggers',
    nameTh: 'มีดคู่ย้อนรอยพีชคณิต',
    requiredRank: 'R4',
    priceCoins: 200,
    bonusStat: { label: 'Equation Backtrack', value: '+20%' },
    assetPath: '/equipment/weapons/shadow_daggers.png',
    glowColor: '#a855f7',
  },

  // 2. ARMOR & ROBES
  'AR_FROST_CLOAK': {
    id: 'AR_FROST_CLOAK',
    slot: 'armor',
    nameEn: 'Frost Mage Robe',
    nameTh: 'ผ้าคลุมฟรอสต์อาคาเดมี่',
    requiredRank: 'R1',
    priceCoins: 30,
    bonusStat: { label: 'Focus Resolve', value: '+5%' },
    assetPath: '/equipment/accessories/charm.png',
    glowColor: '#00f0ff',
  },

  // 3. ACCESSORIES (Ring, Charm, Crystal, Necklace)
  'ACC_WISDOM_RING': {
    id: 'ACC_WISDOM_RING',
    slot: 'ring',
    nameEn: 'Wisdom Academy Ring',
    nameTh: 'แหวนมนตราแห่งปัญญา',
    requiredRank: 'R2',
    priceCoins: 45,
    bonusStat: { label: 'Mental Focus', value: '+8%' },
    assetPath: '/equipment/accessories/ring.png',
    glowColor: '#f59e0b',
  },
  'ACC_ARCTIC_CRYSTAL': {
    id: 'ACC_ARCTIC_CRYSTAL',
    slot: 'crystal',
    nameEn: 'Glacial Resonance Crystal',
    nameTh: 'ผลึกแก้วธารน้ำแข็ง',
    requiredRank: 'R3',
    priceCoins: 90,
    bonusStat: { label: 'Calculation Flow', value: '+10%' },
    assetPath: '/equipment/accessories/crystal.png',
    glowColor: '#38bdf8',
  },
  'ACC_ROYAL_NECKLACE': {
    id: 'ACC_ROYAL_NECKLACE',
    slot: 'necklace',
    nameEn: 'Academy Sovereign Necklace',
    nameTh: 'สร้อยคอราชบัณฑิต',
    requiredRank: 'R4',
    priceCoins: 150,
    bonusStat: { label: 'Exam Fortitude', value: '+15%' },
    assetPath: '/equipment/accessories/necklace.png',
    glowColor: '#eab308',
  },
  'SC_WISDOM_SEAL': {
    id: 'SC_WISDOM_SEAL',
    slot: 'shield_charm',
    nameEn: 'Wisdom Academy Emblem Charm',
    nameTh: 'ตราสัญลักษณ์ราชบัณฑิตกล้าปัญญา',
    requiredRank: 'R1',
    priceCoins: 0,
    bonusStat: { label: 'EXP Bonus', value: '+10%' },
    assetPath: '/brand/seal.png',
    glowColor: '#fbbf24',
  },

  // 4. CONSUMABLES & ITEMS (Potion, Backpack, Scroll, Key)
  'ITM_RESTORATION_POTION': {
    id: 'ITM_RESTORATION_POTION',
    slot: 'potion',
    nameEn: 'Stamina Elixir Potion',
    nameTh: 'น้ำยาฟื้นฟูพลังสมาธิ',
    requiredRank: 'R1',
    priceCoins: 15,
    bonusStat: { label: 'Instant Resolve', value: '+30 HP' },
    assetPath: '/equipment/items/potion.png',
    glowColor: '#10b981',
  },
  'ITM_ACADEMIC_SCROLL': {
    id: 'ITM_ACADEMIC_SCROLL',
    slot: 'scroll',
    nameEn: 'Ancient Theorem Scroll',
    nameTh: 'ม้วนคัมภีร์ทฤษฎีบทโบราณ',
    requiredRank: 'R2',
    priceCoins: 25,
    bonusStat: { label: 'Hint Efficiency', value: '+1 Free Hint' },
    assetPath: '/equipment/items/scroll.png',
    glowColor: '#3b82f6',
  },
  'ITM_DUNGEON_KEY': {
    id: 'ITM_DUNGEON_KEY',
    slot: 'key',
    nameEn: 'Citadel Gate Key',
    nameTh: 'กุญแจทองโบราณปลดล็อกด่าน',
    requiredRank: 'R3',
    priceCoins: 50,
    bonusStat: { label: 'Access Unlock', value: 'Vault Entry' },
    assetPath: '/equipment/items/key.png',
    glowColor: '#f59e0b',
  },
  'BP_EXPEDITION_BAG': {
    id: 'BP_EXPEDITION_BAG',
    slot: 'backpack',
    nameEn: 'Arctic Expedition Satchel',
    nameTh: 'กระเป๋าสะพายสำรวจขั้วโลก',
    requiredRank: 'R2',
    priceCoins: 60,
    bonusStat: { label: 'Potion Capacity', value: '+2' },
    assetPath: '/equipment/items/backpack.png',
    glowColor: '#38bdf8',
  },
};

export function getEquipmentItem(id: string): EquipmentItem | undefined {
  return EQUIPMENT_ASSET_REGISTRY[id];
}
