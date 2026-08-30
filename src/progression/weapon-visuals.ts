import { WeaponVisualDefinition } from '../types/combat-animation';
import { HeroClassId } from '../types';

export const WEAPON_PROGRESSION_DATABASE: Record<string, WeaponVisualDefinition> = {
  TRAINING_WEAPON: {
    id: 'TRAINING_WEAPON',
    name: 'Novice Training Weapon',
    thaiName: 'อาวุธฝึกหัดเรขาคณิต',
    tier: 1,
    icon: '🗡️',
    classVisualMap: {
      CHRONOMANCER: {
        weaponName: 'ไม้กายสิทธิ์ฝึกหัด (Training Wand)',
        weaponIcon: '🪄',
        projectileColor: '#38bdf8',
        slashColor: '#7dd3fc',
        attackVfxName: 'Chrono Pulse',
      },
      PALADIN: {
        weaponName: 'ค้อนหินฝึกหัด (Training Mace)',
        weaponIcon: '🔨',
        projectileColor: '#38bdf8',
        slashColor: '#60a5fa',
        attackVfxName: 'Frost Smash',
      },
      SNIPER: {
        weaponName: 'ธนูไม้ฝึกหัด (Training Shortbow)',
        weaponIcon: '🏹',
        projectileColor: '#34d399',
        slashColor: '#6ee7b7',
        attackVfxName: 'Quick Arrow',
      },
      ROGUE: {
        weaponName: 'มีดสั้นฝึกหัด (Training Daggers)',
        weaponIcon: '🗡️',
        projectileColor: '#c084fc',
        slashColor: '#e879f9',
        attackVfxName: 'Dual Slash',
      },
    },
  },
  BLADE_OF_CALCULATION: {
    id: 'BLADE_OF_CALCULATION',
    name: 'Blade of Calculation',
    thaiName: 'ดาบแห่งการคำนวณแม่นยำ',
    tier: 2,
    icon: '⚔️',
    classVisualMap: {
      CHRONOMANCER: {
        weaponName: 'คทาคณิตแห่งกาลเวลา (Calculation Scepter)',
        weaponIcon: '🪄',
        projectileColor: '#0ea5e9',
        slashColor: '#38bdf8',
        attackVfxName: 'Rune Bolt',
      },
      PALADIN: {
        weaponName: 'ดาบผ่าผลึกตรรกะ (Calculation Cleaver)',
        weaponIcon: '⚔️',
        projectileColor: '#2563eb',
        slashColor: '#3b82f6',
        attackVfxName: 'Heavy Cleave',
      },
      SNIPER: {
        weaponName: 'ธนูสายตาเหยี่ยว (Eagle Calculation Bow)',
        weaponIcon: '🏹',
        projectileColor: '#10b981',
        slashColor: '#34d399',
        attackVfxName: 'Focused Shot',
      },
      ROGUE: {
        weaponName: 'มีดคู่เงาคำนวณ (Calculation Twin Daggers)',
        weaponIcon: '🗡️',
        projectileColor: '#a855f7',
        slashColor: '#c084fc',
        attackVfxName: 'Shadow Cross',
      },
    },
  },
  FROST_AXE: {
    id: 'FROST_AXE',
    name: 'Glacial Class Weapon',
    thaiName: 'ศาสตราวุธผลึกน้ำแข็งคลาส',
    tier: 3,
    icon: '🪓',
    classVisualMap: {
      CHRONOMANCER: {
        weaponName: 'คทาเยือกแข็งออโรร่า (Glacial Time Staff)',
        weaponIcon: '🔮',
        projectileColor: '#06b6d4',
        slashColor: '#22d3ee',
        attackVfxName: 'Glacial Pulse',
      },
      PALADIN: {
        weaponName: 'ขวานศึกเยือกแข็ง (Glacial Frost Axe)',
        weaponIcon: '🪓',
        projectileColor: '#1d4ed8',
        slashColor: '#3b82f6',
        attackVfxName: 'Glacial Shockwave',
      },
      SNIPER: {
        weaponName: 'ธนูผลึกเหมันต์ (Crystal Aurora Bow)',
        weaponIcon: '🏹',
        projectileColor: '#059669',
        slashColor: '#10b981',
        attackVfxName: 'Crystal Shard Arrow',
      },
      ROGUE: {
        weaponName: 'กริชคู่เงามืดน้ำแข็ง (Glacial Shadow Blades)',
        weaponIcon: '⚔️',
        projectileColor: '#9333ea',
        slashColor: '#a855f7',
        attackVfxName: 'Glacial Flurry',
      },
    },
  },
  LEGENDARY_ADMISSION_WEAPON: {
    id: 'LEGENDARY_ADMISSION_WEAPON',
    name: 'Legendary Admission Weapon',
    thaiName: 'มหาศาสตราวุธพิชิตข้อสอบเข้า ม.1',
    tier: 4,
    icon: '🔱',
    classVisualMap: {
      CHRONOMANCER: {
        weaponName: 'คทาจอมราชันกาลเวลา (Sovereign Chrono Scepter)',
        weaponIcon: '🔱',
        projectileColor: '#0284c7',
        slashColor: '#38bdf8',
        attackVfxName: 'Time Distortion Wave',
      },
      PALADIN: {
        weaponName: 'ค้อนศึกราชันผู้พิทักษ์ (Sovereign Frost Hammer)',
        weaponIcon: '🔨',
        projectileColor: '#1e40af',
        slashColor: '#60a5fa',
        attackVfxName: 'Bastion Impact',
      },
      SNIPER: {
        weaponName: 'คันศรราชันไร้พ่าย (Sovereign Celestial Bow)',
        weaponIcon: '🏹',
        projectileColor: '#047857',
        slashColor: '#34d399',
        attackVfxName: 'Piercing Aurora Line',
      },
      ROGUE: {
        weaponName: 'ดาบคู่ราชันเงามรณะ (Sovereign Phantom Blades)',
        weaponIcon: '⚔️',
        projectileColor: '#7e22ce',
        slashColor: '#c084fc',
        attackVfxName: 'Phantom Cross Cut',
      },
    },
  },
  CELESTIAL_ADMISSION_BLADE: {
    id: 'CELESTIAL_ADMISSION_BLADE',
    name: 'Celestial Admission Blade (Excalibur)',
    thaiName: 'ดาบศักดิ์สิทธิ์เอ็กซ์คาลิเบอร์แห่งบัลลังก์ ม.1',
    tier: 5,
    icon: '👑',
    classVisualMap: {
      CHRONOMANCER: {
        weaponName: 'ดาบคทาเอ็กซ์คาลิเบอร์เหนือกาลเวลา (Celestial Excalibur Scepter)',
        weaponIcon: '👑',
        projectileColor: '#f59e0b',
        slashColor: '#fbbf24',
        attackVfxName: 'Absolute Zero Infinity',
      },
      PALADIN: {
        weaponName: 'ดาบศักดิ์สิทธิ์เอ็กซ์คาลิเบอร์ (Celestial Excalibur Blade)',
        weaponIcon: '👑',
        projectileColor: '#f59e0b',
        slashColor: '#fbbf24',
        attackVfxName: 'Divine Sovereign Strike',
      },
      SNIPER: {
        weaponName: 'มหาคันศรเอ็กซ์คาลิเบอร์สุริยัน (Celestial Excalibur Sunbow)',
        weaponIcon: '🏹',
        projectileColor: '#f59e0b',
        slashColor: '#fbbf24',
        attackVfxName: 'Cosmic Supernova Arrow',
      },
      ROGUE: {
        weaponName: 'ดาบคู่ศักดิ์สิทธิ์เอ็กซ์คาลิเบอร์ (Celestial Twin Excaliburs)',
        weaponIcon: '⚔️',
        projectileColor: '#f59e0b',
        slashColor: '#fbbf24',
        attackVfxName: 'Cosmic Reverse Judgment',
      },
    },
  },
};

export function getEquippedWeaponVisual(weaponId: string = 'TRAINING_WEAPON', heroId: HeroClassId = 'CHRONOMANCER') {
  const definition = WEAPON_PROGRESSION_DATABASE[weaponId] || WEAPON_PROGRESSION_DATABASE.TRAINING_WEAPON;
  return {
    ...definition,
    classVisual: definition.classVisualMap[heroId],
  };
}
