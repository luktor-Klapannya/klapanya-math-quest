import fs from 'fs';
import path from 'path';

const publicDir = path.resolve(process.cwd(), 'public');
const brainDir = 'C:/Users/NUN/.gemini/antigravity/brain/ef2d7859-9626-4f7a-9d98-55723c3c59b2';
const userUploadedDir = path.join(brainDir, '.user_uploaded');

// Required production folders
const folders = [
  'brand',
  'backgrounds/portal',
  'backgrounds/arctic/map',
  'backgrounds/arctic/dojo',
  'backgrounds/arctic/farming',
  'backgrounds/arctic/onet',
  'backgrounds/arctic/geometry',
  'backgrounds/arctic/quest',
  'backgrounds/arctic/arena',
  'backgrounds/arctic/boss',
  'backgrounds/arctic/final',
  'characters/heroes',
  'characters/professors',
  'characters/enemies',
  'equipment/weapons',
  'equipment/armor',
  'equipment/accessories',
  'equipment/items'
];

console.log('Ensuring all production asset folders exist...');
for (const f of folders) {
  fs.mkdirSync(path.join(publicDir, f), { recursive: true });
}

// Helper to copy file if source exists
function copyIfExist(src, destRel) {
  if (fs.existsSync(src)) {
    const dest = path.join(publicDir, destRel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    console.log(`[COPIED] ${src} -> ${destRel}`);
    return true;
  }
  return false;
}

// 1. BRAND ASSETS
copyIfExist(path.join(userUploadedDir, 'media_1788151517299.png'), 'brand/logo.png');
copyIfExist(path.join(userUploadedDir, 'media_1788152064043.png'), 'brand/seal.png');
copyIfExist(path.join(userUploadedDir, 'media_1788186283611.png'), 'brand/emblem.png');
copyIfExist(path.join(userUploadedDir, 'media_1788186283611.png'), 'brand/brand_mark.png');

// Fallback in root public
copyIfExist(path.join(userUploadedDir, 'media_1788151517299.png'), 'logo.png');
copyIfExist(path.join(userUploadedDir, 'media_1788151517299.png'), 'klapanya_logo.png');

// 2. PORTAL & BACKGROUND ASSETS
const portalBackdropSrc = path.join(userUploadedDir, 'media_1788151814776.jpg');
if (fs.existsSync(portalBackdropSrc)) {
  copyIfExist(portalBackdropSrc, 'academy_backdrop.jpg');
  copyIfExist(portalBackdropSrc, 'backgrounds/portal/portal_desktop.jpg');
  copyIfExist(portalBackdropSrc, 'backgrounds/portal/portal_tablet.jpg');
  copyIfExist(portalBackdropSrc, 'backgrounds/portal/portal_mobile.jpg');
  copyIfExist(portalBackdropSrc, 'backgrounds/portal/login_desktop.jpg');
  copyIfExist(portalBackdropSrc, 'backgrounds/portal/login_mobile.jpg');
  copyIfExist(portalBackdropSrc, 'backgrounds/portal/guide_desktop.jpg');
  copyIfExist(portalBackdropSrc, 'backgrounds/portal/guide_mobile.jpg');
  copyIfExist(portalBackdropSrc, 'backgrounds/portal/territory_desktop.jpg');
  copyIfExist(portalBackdropSrc, 'backgrounds/portal/territory_mobile.jpg');
}

// 3. ARCTIC WORLD SCENE BACKDROPS
const battleSceneSrc = path.join(brainDir, 'hero_vs_boss_battle_1788112302919.jpg');
const chronoSceneSrc = path.join(brainDir, 'hero_chronomancer_battle_1788112320850.jpg');

if (fs.existsSync(battleSceneSrc)) {
  copyIfExist(battleSceneSrc, 'backgrounds/arctic/arena/arctic_arena_desktop.jpg');
  copyIfExist(battleSceneSrc, 'backgrounds/arctic/arena/arctic_arena_mobile.jpg');
  copyIfExist(battleSceneSrc, 'backgrounds/arctic/boss/arctic_boss_desktop.jpg');
  copyIfExist(battleSceneSrc, 'backgrounds/arctic/final/arctic_final_desktop.jpg');
}

if (fs.existsSync(chronoSceneSrc)) {
  copyIfExist(chronoSceneSrc, 'backgrounds/arctic/map/arctic_map_desktop.jpg');
  copyIfExist(chronoSceneSrc, 'backgrounds/arctic/dojo/arctic_dojo_desktop.jpg');
  copyIfExist(chronoSceneSrc, 'backgrounds/arctic/farming/arctic_farming_desktop.jpg');
  copyIfExist(chronoSceneSrc, 'backgrounds/arctic/onet/arctic_onet_desktop.jpg');
  copyIfExist(chronoSceneSrc, 'backgrounds/arctic/geometry/arctic_geometry_desktop.jpg');
  copyIfExist(chronoSceneSrc, 'backgrounds/arctic/quest/arctic_quest_desktop.jpg');
}

// 4. HERO SPRITES (Tiers L1 - L4)
const heroSprites = {
  'SPEED_CHRONOMANCER_MALE': path.join(brainDir, 'hero_chrono_boy_sprite_1788112642481.jpg'),
  'LOGIC_PALADIN_MALE': path.join(brainDir, 'hero_paladin_boy_sprite_1788112661394.jpg'),
  'REVERSE_ROGUE_MALE': path.join(brainDir, 'hero_rogue_boy_sprite_1788112686875.jpg'),
  'EAGLE_EYE_SNIPER_FEMALE': path.join(brainDir, 'hero_sniper_girl_sprite_1788112604149.jpg'),
};

for (const [key, src] of Object.entries(heroSprites)) {
  if (fs.existsSync(src)) {
    const baseName = key.toLowerCase();
    // Copy base, fullbody, portrait, battle
    copyIfExist(src, `characters/heroes/${baseName}_fullbody.png`);
    copyIfExist(src, `characters/heroes/${baseName}_portrait.png`);
    copyIfExist(src, `characters/heroes/${baseName}_battle.png`);
    
    // Copy tiers L1 - L4
    for (let level = 1; level <= 4; level++) {
      copyIfExist(src, `characters/heroes/${baseName}_l${level}.png`);
    }
  }
}

// Fallback mirror for female/male counterparts
copyIfExist(path.join(brainDir, 'hero_chrono_boy_sprite_1788112642481.jpg'), 'characters/heroes/speed_chronomancer_female_fullbody.png');
copyIfExist(path.join(brainDir, 'hero_chrono_boy_sprite_1788112642481.jpg'), 'characters/heroes/speed_chronomancer_female_portrait.png');
copyIfExist(path.join(brainDir, 'hero_paladin_boy_sprite_1788112661394.jpg'), 'characters/heroes/logic_paladin_female_fullbody.png');
copyIfExist(path.join(brainDir, 'hero_paladin_boy_sprite_1788112661394.jpg'), 'characters/heroes/logic_paladin_female_portrait.png');
copyIfExist(path.join(brainDir, 'hero_sniper_girl_sprite_1788112604149.jpg'), 'characters/heroes/eagle_eye_sniper_male_fullbody.png');
copyIfExist(path.join(brainDir, 'hero_sniper_girl_sprite_1788112604149.jpg'), 'characters/heroes/eagle_eye_sniper_male_portrait.png');
copyIfExist(path.join(brainDir, 'hero_rogue_boy_sprite_1788112686875.jpg'), 'characters/heroes/reverse_rogue_female_fullbody.png');
copyIfExist(path.join(brainDir, 'hero_rogue_boy_sprite_1788112686875.jpg'), 'characters/heroes/reverse_rogue_female_portrait.png');

for (let level = 1; level <= 4; level++) {
  copyIfExist(path.join(brainDir, 'hero_chrono_boy_sprite_1788112642481.jpg'), `characters/heroes/speed_chronomancer_female_l${level}.png`);
  copyIfExist(path.join(brainDir, 'hero_paladin_boy_sprite_1788112661394.jpg'), `characters/heroes/logic_paladin_female_l${level}.png`);
  copyIfExist(path.join(brainDir, 'hero_sniper_girl_sprite_1788112604149.jpg'), `characters/heroes/eagle_eye_sniper_male_l${level}.png`);
  copyIfExist(path.join(brainDir, 'hero_rogue_boy_sprite_1788112686875.jpg'), `characters/heroes/reverse_rogue_female_l${level}.png`);
}

// 5. PROFESSOR ASSETS
// Using academic character avatars from uploaded set
const profMaleSrc = path.join(userUploadedDir, 'media_1788097831073.png');
const profFemaleSrc = path.join(userUploadedDir, 'media_1788097857083.png');

if (fs.existsSync(profMaleSrc)) {
  copyIfExist(profMaleSrc, 'characters/professors/professor_male_fullbody.png');
  copyIfExist(profMaleSrc, 'characters/professors/professor_male_portrait.png');
}
if (fs.existsSync(profFemaleSrc)) {
  copyIfExist(profFemaleSrc, 'characters/professors/professor_female_fullbody.png');
  copyIfExist(profFemaleSrc, 'characters/professors/professor_female_portrait.png');
}

// 6. ENEMY & BOSS ASSETS
const dummySrc = path.join(brainDir, 'frost_dummy_sprite_1788112624047.jpg');
const devilSrc = path.join(userUploadedDir, 'media_1788097869604.png');
const monsterSrc = path.join(userUploadedDir, 'media_1788097887728.png');
const bigfootSrc = path.join(userUploadedDir, 'media_1788097898615.png');

if (fs.existsSync(dummySrc)) {
  copyIfExist(dummySrc, 'characters/enemies/frost_dummy.png');
  copyIfExist(dummySrc, 'characters/enemies/frost_dummy_normal.png');
  copyIfExist(dummySrc, 'characters/enemies/frost_dummy_hit.png');
  copyIfExist(dummySrc, 'characters/enemies/frost_dummy_defeat.png');
}
if (fs.existsSync(devilSrc)) {
  copyIfExist(devilSrc, 'characters/enemies/snow_devil.png');
  copyIfExist(devilSrc, 'characters/enemies/snow_devil_normal.png');
  copyIfExist(devilSrc, 'characters/enemies/snow_devil_hit.png');
  copyIfExist(devilSrc, 'characters/enemies/snow_devil_defeat.png');
}
if (fs.existsSync(monsterSrc)) {
  copyIfExist(monsterSrc, 'characters/enemies/ice_monster.png');
  copyIfExist(monsterSrc, 'characters/enemies/ice_monster_normal.png');
  copyIfExist(monsterSrc, 'characters/enemies/ice_monster_hit.png');
  copyIfExist(monsterSrc, 'characters/enemies/ice_monster_defeat.png');
}
if (fs.existsSync(bigfootSrc)) {
  copyIfExist(bigfootSrc, 'characters/enemies/big_foot.png');
  copyIfExist(bigfootSrc, 'characters/enemies/big_foot_normal.png');
  copyIfExist(bigfootSrc, 'characters/enemies/big_foot_hit.png');
  copyIfExist(bigfootSrc, 'characters/enemies/big_foot_defeat.png');
}

// 7. EQUIPMENT ASSETS (weapons, armor, accessories, items)
const weaponWandSrc = path.join(userUploadedDir, 'media_1788099774003.png');
const weaponSwordSrc = path.join(userUploadedDir, 'media_1788099783981.png');
const weaponBowSrc = path.join(userUploadedDir, 'media_1788099791933.png');
const weaponDaggerSrc = path.join(userUploadedDir, 'media_1788099803009.png');

if (fs.existsSync(weaponWandSrc)) copyIfExist(weaponWandSrc, 'equipment/weapons/chrono_staff.png');
if (fs.existsSync(weaponSwordSrc)) copyIfExist(weaponSwordSrc, 'equipment/weapons/logic_sword.png');
if (fs.existsSync(weaponBowSrc)) copyIfExist(weaponBowSrc, 'equipment/weapons/sniper_bow.png');
if (fs.existsSync(weaponDaggerSrc)) copyIfExist(weaponDaggerSrc, 'equipment/weapons/shadow_daggers.png');

// Armor, Accessories, Items
const itemPotionSrc = path.join(userUploadedDir, 'media_1788106847839.png');
const itemScrollSrc = path.join(userUploadedDir, 'media_1788111437538.png');
const itemKeySrc = path.join(userUploadedDir, 'media_1788112250876.png');
const itemBagSrc = path.join(userUploadedDir, 'media_1788134891627.png');

if (fs.existsSync(itemPotionSrc)) copyIfExist(itemPotionSrc, 'equipment/items/potion.png');
if (fs.existsSync(itemScrollSrc)) copyIfExist(itemScrollSrc, 'equipment/items/scroll.png');
if (fs.existsSync(itemKeySrc)) copyIfExist(itemKeySrc, 'equipment/items/key.png');
if (fs.existsSync(itemBagSrc)) copyIfExist(itemBagSrc, 'equipment/items/backpack.png');

copyIfExist(path.join(userUploadedDir, 'media_1788135729174.png'), 'equipment/accessories/ring.png');
copyIfExist(path.join(userUploadedDir, 'media_1788136100188.png'), 'equipment/accessories/crystal.png');
copyIfExist(path.join(userUploadedDir, 'media_1788152064043.png'), 'equipment/accessories/charm.png');
copyIfExist(path.join(userUploadedDir, 'media_1788186283611.png'), 'equipment/accessories/necklace.png');

console.log('Production asset organization complete.');
