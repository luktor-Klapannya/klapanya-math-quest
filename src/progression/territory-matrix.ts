import { TerritoryFormConfig, TerritoryId, HeroClassId } from '../types';

export const TERRITORY_DATABASE: Record<TerritoryId, TerritoryFormConfig> = {
  FROZEN_ARCTIC: {
    id: 'FROZEN_ARCTIC',
    name: 'Frozen Arctic Realm',
    thaiName: 'ดินแดนอาร์กติกเยือกแข็ง',
    tagline: 'สมรภูมิคณิตศาสตร์ท่ามกลางธารน้ำแข็งและแสงออโรร่า',
    status: 'ACTIVE',
    uiTheme: {
      primaryGradient: 'from-cyan-950 via-slate-900 to-blue-950',
      accentColor: 'text-cyan-400',
      cardBg: 'bg-arctic-900/90 backdrop-blur-md',
      glowShadow: 'shadow-glow-cyan',
      borderStyle: 'border-cyan-500/40',
      badgeStyle: 'bg-cyan-950 text-cyan-300 border-cyan-400',
    },
    mapTheme: {
      backgroundClass: 'aurora-bg',
      ambientTitle: 'มหาพายุหิมะและแสงเหนือออโรร่า',
      weatherEffect: '❄️ เกล็ดหิมะโปรยปราย',
    },
    companionPets: [
      {
        id: 'PET_FROST_CUB',
        name: 'Frostbite Polar Cub',
        thaiName: 'ลูกหมีขั้วโลกฟรอสต์ไบต์',
        avatar: '🐻‍❄️',
        description: 'ลูกหมีขั้วโลกผู้ช่วยเสริมสมาธิ ปล่อยไอเย็นให้รู้สึกสดชื่นขณะคิดเลข',
        practiceFlavorBonus: '+5% เหรียญทองโบนัสในโหมดฝึกฝน',
      },
      {
        id: 'PET_AURORA_OWL',
        name: 'Aurora Snow Owl',
        thaiName: 'นกฮูกหิมะแสงเหนือ',
        avatar: '🦉',
        description: 'นกฮูกปราชญ์บินนำทาง กระพือปีกส่องแสงตรวจจับความผิดพลาดในโหมดฝึกฝน',
        practiceFlavorBonus: 'แจ้งเตือนเมื่อตอบเร็วผิดปกติในโหมดฝึกฝน',
      },
      {
        id: 'PET_GLACIAL_FOX',
        name: 'Glacial Arctic Fox',
        thaiName: 'จิ้งจอกหิมะผลึกแก้ว',
        avatar: '🦊',
        description: 'จิ้งจอกหิมะผู้คล่องแคล่ว วิ่งสร้างประกายแสงคริสตัลรอบตัวละคร',
        practiceFlavorBonus: 'เพิ่มเอฟเฟกต์ประกายคริสตัลเมื่อทำคอมโบในโหมดฝึกฝน',
      },
    ],
    topFormVisuals: {
      title: 'Grand Arctic Sovereign',
      thaiTitle: 'จักรพรรดิอาร์กติกเยือกแข็งสมบูรณ์แบบ',
      haloIcon: '✨👑',
      auraEffect: 'รัศมีแสงออโรร่าสีทองผสมฟ้าน้ำแข็งพุ่งกระจายรอบตัว',
      regaliaName: 'Mythic Sovereign Arctic Regalia',
    },
    costumeSet: {
      CHRONOMANCER: [
        { tier: 1, name: 'Novice Frost Cloak', thaiName: 'ผ้าคลุมขนสัตว์ฝึกหัด', description: 'ผ้าคลุมขนสัตว์หนาป้องกันไอเย็น', avatarVariant: '🧙‍♂️', rankRequired: 'Novice Trainee' },
        { tier: 2, name: 'Glacial Time Robe', thaiName: 'ชุดคลุมกาลเวลาธารน้ำแข็ง', description: 'ชุดคลุมผ้าไหมสลักอักขระลูกตุ้มน้ำแข็ง', avatarVariant: '🧙‍♂️❄️', rankRequired: 'Dojo Adept' },
        { tier: 3, name: 'Aurora Chrono Plate', thaiName: 'เกราะกาลเวลาประกายแสงเหนือ', description: 'เกราะเบาสะท้อนแสงเหนือ ป้องกันแรงกดดัน', avatarVariant: '🧙‍♂️🌌', rankRequired: 'Gateway Guardian' },
        { tier: 4, name: 'Sovereign Time Regalia', thaiName: 'ภูษาจักรพรรดิกาลเวลาสมบูรณ์', description: 'ชุดมหาปราชญ์กาลเวลาสูงสุดแห่งดินแดนอาร์กติก', avatarVariant: '👑🧙‍♂️', rankRequired: 'Top Form' },
      ],
      PALADIN: [
        { tier: 1, name: 'Novice Ice Mail', thaiName: 'เกราะโซ่ถักน้ำแข็งฝึกหัด', description: 'เกราะโซ่เหล็กเคลือบน้ำแข็งบาง', avatarVariant: '🛡️', rankRequired: 'Novice Trainee' },
        { tier: 2, name: 'Glacial Bastion Armor', thaiName: 'เกราะปราการธารน้ำแข็ง', description: 'เกราะแผ่นผลึกน้ำแข็งหนาต้านทานแรงกระแทก', avatarVariant: '🛡️❄️', rankRequired: 'Dojo Adept' },
        { tier: 3, name: 'Permafrost Bulwark', thaiName: 'เกราะกำแพงน้ำแข็งนิรันดร์', description: 'เกราะหินสลักรูนตรรกะชั้นสูง', avatarVariant: '🛡️💎', rankRequired: 'Gateway Guardian' },
        { tier: 4, name: 'Sovereign Aegis Plate', thaiName: 'มหาเกราะจักรพรรดิตรรกะศิลา', description: 'ชุดเกราะอัศวินสูงสุดแห่งการปกป้องการสอบเข้า', avatarVariant: '👑🛡️', rankRequired: 'Top Form' },
      ],
      SNIPER: [
        { tier: 1, name: 'Novice Arctic Hood', thaiName: 'ฮู้ดนักล่าหิมะฝึกหัด', description: 'หมวกฮู้ดพรางตัวในทุ่งหิมะสีขาว', avatarVariant: '🏹', rankRequired: 'Novice Trainee' },
        { tier: 2, name: 'Starfrost Scout Garb', thaiName: 'ชุดลาดตระเวนผลึกดวงดาว', description: 'ชุดพรางสายตาพร้อมแว่นส่องระยะไกล', avatarVariant: '🏹❄️', rankRequired: 'Dojo Adept' },
        { tier: 3, name: 'Aurora Marksman Suit', thaiName: 'ชุดพลซุ่มยิงแสงเหนือ', description: 'ชุดหนังน้ำแข็งเคลือบออโรร่าเพิ่มความเฉียบคม', avatarVariant: '🏹✨', rankRequired: 'Gateway Guardian' },
        { tier: 4, name: 'Sovereign Eagle Regalia', thaiName: 'ภูษาจักรพรรดิอินทรีเนตรทิพย์', description: 'ชุดนักล่าสูงสุด มองทะลุโจทย์ทุกมิติ', avatarVariant: '👑🏹', rankRequired: 'Top Form' },
      ],
      ROGUE: [
        { tier: 1, name: 'Novice Blizzard Leather', thaiName: 'ชุดหนังพายุหิมะฝึกหัด', description: 'ชุดหนังบางเบาเคลื่อนไหวรวดเร็วบนผิวน้ำแข็ง', avatarVariant: '🗡️', rankRequired: 'Novice Trainee' },
        { tier: 2, name: 'Glacial Shadow Tunic', thaiName: 'เสื้อคลุมเงาน้ำแข็ง', description: 'เสื้อคลุมสะท้อนเงาลวงตาในพายุเยือกแข็ง', avatarVariant: '🗡️❄️', rankRequired: 'Dojo Adept' },
        { tier: 3, name: 'Aurora Phantom Cloak', thaiName: 'ผ้าคลุมภูตพรายแสงเหนือ', description: 'ผ้าคลุมล่องหนตัดสลับตัวเลือกคำตอบ', avatarVariant: '🗡️🌌', rankRequired: 'Gateway Guardian' },
        { tier: 4, name: 'Sovereign Shadow Regalia', thaiName: 'ภูษาจักรพรรดิเงาพลิกแพลง', description: 'ชุดปรมาจารย์เงาผู้กลับตาลปัตรโจทย์ยากให้ง่าย', avatarVariant: '👑🗡️', rankRequired: 'Top Form' },
      ],
    },
    weaponSet: {
      CHRONOMANCER: [
        { tier: 1, name: 'Frost Quartz Hourglass', thaiName: 'นาฬิกาทรายควอตซ์น้ำแข็ง', description: 'นาฬิกาทรายจับเวลามาตรฐาน', icon: '⏳' },
        { tier: 2, name: 'Glacial Pendulum', thaiName: 'ลูกตุ้มกาลเวลาธารน้ำแข็ง', description: 'ลูกตุ้มแกว่งชะลอจังหวะความคิด', icon: '🕰️' },
        { tier: 3, name: 'Chrono Ice Scepter', thaiName: 'คทากาลเวลาน้ำแข็งออโรร่า', description: 'คทาเวทมนตร์ตรึงเวลาคิดคำนวณ', icon: '🪄' },
        { tier: 4, name: 'Absolute Zero Clock', thaiName: 'นาฬิกาหยุดเวลาสมบูรณ์', description: 'อาวุธกาลเวลาขั้นสุดยอดแห่งอาร์กติก', icon: '💠' },
      ],
      PALADIN: [
        { tier: 1, name: 'Frost Battleaxe', thaiName: 'ขวานศึกน้ำแข็งสลักสูตร', description: 'ขวานศึกสำหรับตัดโจทย์คำนวณ', icon: '🪓' },
        { tier: 2, name: 'Glacial Halberd', thaiName: 'ทวนง้าวน้ำแข็งผลึกแน่น', description: 'ทวนทะลวงสมการสองชั้น', icon: '🔱' },
        { tier: 3, name: 'Ice Fortress Shield', thaiName: 'โล่ปราการศิลาเยือกแข็ง', description: 'โล่ต้านทานกับดักคำลวง 100%', icon: '🛡️' },
        { tier: 4, name: 'Sovereign Bastion Hammer', thaiName: 'ค้อนจักรพรรดิตรรกะสมบูรณ์', description: 'ค้อนทุบทำลายโจทย์ระบบซับซ้อนในคราเดียว', icon: '🔨' },
      ],
      SNIPER: [
        { tier: 1, name: 'Ice Compound Bow', thaiName: 'ธนูประกอบคันน้ำแข็ง', description: 'ธนูยิงคำตอบความแม่นยำสูง', icon: '🏹' },
        { tier: 2, name: 'Aurora Crystal Crossbow', thaiName: 'หน้าไม้ผลึกแสงเหนือ', description: 'หน้าไม้ยิงเจาะจุดสำคัญของโจทย์', icon: '🎯' },
        { tier: 3, name: 'Glacial Sniper Rifle', thaiName: 'ปืนซุ่มยิงธารน้ำแข็ง', description: 'ปืนลำกล้องยาวเล็งตัดตัวหลอก', icon: '🔭' },
        { tier: 4, name: 'Starfrost Railgun', thaiName: 'ปืนเรลกันดวงดาวเยือกแข็ง', description: 'อาวุธยิงคำตอบทะลุผ่านความซับซ้อน', icon: '⚡' },
      ],
      ROGUE: [
        { tier: 1, name: 'Dual Frost Daggers', thaiName: 'มีดสั้นคู่น้ำแข็ง', description: 'มีดสั้นคู่สำหรับฟันคำนวณรวดเร็ว', icon: '🗡️' },
        { tier: 2, name: 'Ice Chain Sickles', thaiName: 'เคียวโซ่น้ำแข็ง', description: 'เคียวเกี่ยวลากตัวเลขย้อนกลับ', icon: '⛓️' },
        { tier: 3, name: 'Glacial Kunai Set', thaiName: 'ชุดคุไนน้ำแข็งสะบัดเงา', description: 'คุไนสลักสูตรตัดตัวเลือก 50:50', icon: '⭐' },
        { tier: 4, name: 'Phantom Aurora Claws', thaiName: 'กรงเล็บภูตพรายแสงเหนือ', description: 'กรงเล็บตะปบเฉลยคำตอบในพริบตา', icon: '🐾' },
      ],
    },
    skillVfx: {
      CHRONOMANCER: {
        primaryEffect: '❄️ ละอองหิมะระเบิด (Snow Burst)',
        activeVFX: '❄️ มหาผลึกน้ำแข็งก่อตัวตรึงเวลาบนหน้าจอ',
        passiveVFX: '⏳ ละอองหิมะหมุนวนรอบนาฬิกาทราย',
        topFormAura: '🌌 วงแหวนนาฬิกาออโรร่าสีทองลอยเหนือศีรษะ',
      },
      PALADIN: {
        primaryEffect: '🛡️ กำแพงน้ำแข็งสะท้อน (Ice Barrier)',
        activeVFX: '🛡️ โล่ผลึกน้ำแข็งยักษ์แผ่รัศมีป้องกันคอมโบ',
        passiveVFX: '❄️ เกราะน้ำแข็งผลึกบางเคลือบตัวผู้กล้า',
        topFormAura: '👑 รัศมีโล่ทองคำขาวเปล่งประกายรอบตัว',
      },
      SNIPER: {
        primaryEffect: '🎯 ลำแสงเลเซอร์แสงเหนือ (Aurora Sight)',
        activeVFX: '✨ เลเซอร์ผลึกน้ำแข็งพุ่งชี้เป้าคำตอบที่ถูกต้อง',
        passiveVFX: '🎯 วงเล็งเป้าน้ำแข็งหมุนโฟกัสที่ตัวเลือก',
        topFormAura: '🌟 ดวงตาอินทรีออโรร่าสีทองส่องประกายเจิดจรัส',
      },
      ROGUE: {
        primaryEffect: '💨 เงาม่านพายุหิมะ (Blizzard Veil)',
        activeVFX: '🌪️ พายุหิมะพัดพรางตาตัดตัวเลือกผิดออก 2 ข้อ',
        passiveVFX: '💨 รอยเท้าละอองหิมะเรืองแสงขณะเคลื่อนไหว',
        topFormAura: '🐾 เงาภูตหิมะสีทองคอยซัพพอร์ตข้างกาย',
      },
    },
  },

  // Future-Ready Territory 2: SKY_CITADEL
  SKY_CITADEL: {
    id: 'SKY_CITADEL',
    name: 'Sky Citadel Realm',
    thaiName: 'นครลอยฟ้าเวหาศักดิ์สิทธิ์',
    tagline: 'สมรภูมิคณิตศาสตร์เหนือก้อนเมฆและสายลมสวรรค์',
    status: 'PREPARED_FUTURE',
    uiTheme: {
      primaryGradient: 'from-sky-950 via-indigo-950 to-slate-900',
      accentColor: 'text-sky-400',
      cardBg: 'bg-slate-900/90 backdrop-blur-md',
      glowShadow: 'shadow-glow-cyan',
      borderStyle: 'border-sky-500/40',
      badgeStyle: 'bg-sky-950 text-sky-300 border-sky-400',
    },
    mapTheme: {
      backgroundClass: 'sky-bg',
      ambientTitle: 'ทะเลหมอกและเกาะลอยฟ้าศักดิ์สิทธิ์',
      weatherEffect: '🪶 ขนนกและสายลมพัดผ่าน',
    },
    companionPets: [
      { id: 'PET_SKY_GRIFFIN', name: 'Zephyr Griffin', thaiName: 'กริฟฟินสายลม', avatar: '🦅', description: 'ลูกกริฟฟินเวหาโบยบินเหนือเกาะลอยฟ้า', practiceFlavorBonus: '+5% XP โบนัสในโหมดฝึกฝน' },
    ],
    topFormVisuals: {
      title: 'Grand Celestial Sovereign',
      thaiTitle: 'มหาจักรพรรดิเวหาผู้ไร้ขอบเขต',
      haloIcon: '🪽👑',
      auraEffect: 'ปีกขนนกสายฟ้าสีทองแผ่กว้าง',
      regaliaName: 'Celestial Sky Sovereign Regalia',
    },
    costumeSet: {} as any,
    weaponSet: {} as any,
    skillVfx: {} as any,
  },

  // Future-Ready Territory 3: VOLCANIC_FORGE
  VOLCANIC_FORGE: {
    id: 'VOLCANIC_FORGE',
    name: 'Volcanic Forge Realm',
    thaiName: 'เตาหลอมอัคนีภูเขาไฟ',
    tagline: 'สมรภูมิคณิตศาสตร์ในหุบเขาลาวาและประกายเพลิง',
    status: 'PREPARED_FUTURE',
    uiTheme: {
      primaryGradient: 'from-red-950 via-stone-900 to-amber-950',
      accentColor: 'text-amber-400',
      cardBg: 'bg-stone-900/90 backdrop-blur-md',
      glowShadow: 'shadow-glow-gold',
      borderStyle: 'border-amber-500/40',
      badgeStyle: 'bg-amber-950 text-amber-300 border-amber-400',
    },
    mapTheme: {
      backgroundClass: 'magma-bg',
      ambientTitle: 'ลำธารลาวาเดือดพล่านและเขม่าควันทองคำ',
      weatherEffect: '🔥 ประกายไฟลอยละล่อง',
    },
    companionPets: [
      { id: 'PET_MAGMA_SALAMANDER', name: 'Magma Salamander', thaiName: 'ซาลาแมนเดอร์ลาวา', avatar: '🦎', description: 'สัตว์เลื้อยคลานเพลิงดูดซับความร้อน', practiceFlavorBonus: '+5% เหรียญทองในโหมดฝึกฝน' },
    ],
    topFormVisuals: {
      title: 'Grand Volcanic Sovereign',
      thaiTitle: 'มหาจักรพรรดิเพลิงนิรันดร์',
      haloIcon: '🔥👑',
      auraEffect: 'มงกุฎเปลวเพลิงบริสุทธิ์สีทองอร่าม',
      regaliaName: 'Inferno Sovereign Regalia',
    },
    costumeSet: {} as any,
    weaponSet: {} as any,
    skillVfx: {} as any,
  },

  // Future-Ready Territory 4: OCEAN_ABYSS
  OCEAN_ABYSS: {
    id: 'OCEAN_ABYSS',
    name: 'Ocean Abyss Realm',
    thaiName: 'ห้วงมหาสมุทรบาดาล',
    tagline: 'สมรภูมิคณิตศาสตร์ใต้ท้องทะเลลึกและแนวปะการังเวทมนตร์',
    status: 'PREPARED_FUTURE',
    uiTheme: {
      primaryGradient: 'from-blue-950 via-teal-950 to-slate-900',
      accentColor: 'text-teal-400',
      cardBg: 'bg-slate-900/90 backdrop-blur-md',
      glowShadow: 'shadow-glow-cyan',
      borderStyle: 'border-teal-500/40',
      badgeStyle: 'bg-teal-950 text-teal-300 border-teal-400',
    },
    mapTheme: {
      backgroundClass: 'ocean-bg',
      ambientTitle: 'วิหารบาดาลโบราณและแนวฟองคลื่น',
      weatherEffect: '🫧 ฟองคลื่นและประกายพรายน้ำ',
    },
    companionPets: [
      { id: 'PET_TIDE_DOLPHIN', name: 'Tidal Luminescent Dolphin', thaiName: 'โลมาพรายน้ำเรืองแสง', avatar: '🐬', description: 'โลมาเรืองแสงช่วยส่องสว่างใต้น้ำลึก', practiceFlavorBonus: 'ฟองอากาศนำทางในโหมดฝึกฝน' },
    ],
    topFormVisuals: {
      title: 'Grand Oceanic Sovereign',
      thaiTitle: 'มหาจักรพรรดิสมุทรบาดาล',
      haloIcon: '🔱👑',
      auraEffect: 'มงกุฎตรีศูลและเกลียวคลื่นทองคำหมุนวน',
      regaliaName: 'Tidal Sovereign Regalia',
    },
    costumeSet: {} as any,
    weaponSet: {} as any,
    skillVfx: {} as any,
  },

  // Future-Ready Territory 5: THAI_LEGEND
  THAI_LEGEND: {
    id: 'THAI_LEGEND',
    name: 'Himmapan Mythic Realm',
    thaiName: 'ป่าหิมพานต์แดนตำนานไทย',
    tagline: 'สมรภูมิคณิตศาสตร์ในดินแดนพญาครุฑ พญานาค และมหาเวทโบราณ',
    status: 'PREPARED_FUTURE',
    uiTheme: {
      primaryGradient: 'from-amber-950 via-emerald-950 to-slate-900',
      accentColor: 'text-amber-400',
      cardBg: 'bg-slate-900/90 backdrop-blur-md',
      glowShadow: 'shadow-glow-gold',
      borderStyle: 'border-amber-500/40',
      badgeStyle: 'bg-amber-950 text-amber-300 border-amber-400',
    },
    mapTheme: {
      backgroundClass: 'himmapan-bg',
      ambientTitle: 'เขากิชฌกูฏและสระอโนดาตแห่งแดนหิมพานต์',
      weatherEffect: '🌸 ดอกมณฑารพโปรยปราย',
    },
    companionPets: [
      { id: 'PET_MYTHIC_NAGA', name: 'Emerald Mini Naga', thaiName: 'พญานาคน้อยเกล็ดมรกต', avatar: '🐉', description: 'พญานาคน้อยผู้พิทักษ์ความรู้แห่งสระอโนดาต', practiceFlavorBonus: '+10% XP ในโหมดฝึกฝน' },
    ],
    topFormVisuals: {
      title: 'Grand Himmapan Sovereign',
      thaiTitle: 'มหาจักรพรรดิป่าหิมพานต์มงกุฎเพชร',
      haloIcon: '🪷👑',
      auraEffect: 'ชฎามงกุฎทองคำประดับอัญมณี 9 ประการและพญานาคคู่บารมี',
      regaliaName: 'Siam Sovereign Mythic Regalia',
    },
    costumeSet: {} as any,
    weaponSet: {} as any,
    skillVfx: {} as any,
  },
};
