import fs from 'fs';
import path from 'path';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

const baseDirs = [
  'public/brand',
  'public/backgrounds/portal',
  'public/backgrounds/arctic/map',
  'public/backgrounds/arctic/dojo',
  'public/backgrounds/arctic/farming',
  'public/backgrounds/arctic/onet',
  'public/backgrounds/arctic/geometry',
  'public/backgrounds/arctic/quest',
  'public/backgrounds/arctic/arena',
  'public/backgrounds/arctic/boss',
  'public/backgrounds/arctic/final',
  'public/characters/heroes',
  'public/characters/professors',
  'public/characters/enemies',
  'public/equipment/weapons',
  'public/equipment/armor',
  'public/equipment/accessories',
  'public/equipment/sets',
];

baseDirs.forEach(dir => ensureDir(path.resolve(dir)));

// 1. Copy Brand Assets
const brandFiles = ['logo.png', 'logo2.jpg'];
brandFiles.forEach(f => {
  const src = path.resolve('public', f);
  const dest = path.resolve('public/brand', f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied brand asset: ${dest}`);
  }
});

// Also create public/brand/seal.png if logo.png exists
if (fs.existsSync(path.resolve('public/logo.png'))) {
  fs.copyFileSync(path.resolve('public/logo.png'), path.resolve('public/brand/seal.png'));
}

// 2. Organize Hero character assets into public/characters/heroes/
const charSrcDir = path.resolve('public/characters');
if (fs.existsSync(charSrcDir)) {
  const files = fs.readdirSync(charSrcDir);
  files.forEach(f => {
    if (f.startsWith('hero_')) {
      const src = path.join(charSrcDir, f);
      const dest = path.resolve('public/characters/heroes', f);
      fs.copyFileSync(src, dest);
    } else if (f.startsWith('frost_dummy')) {
      const src = path.join(charSrcDir, f);
      const dest = path.resolve('public/characters/enemies', f);
      fs.copyFileSync(src, dest);
    }
  });
}

// 3. Create SVG / vector enemy placeholders if not present
const enemies = [
  { id: 'snow_devil', name: 'Snow Devil (ภูตหิมะจอมป่วน)', color: '#38bdf8' },
  { id: 'ice_monster', name: 'Ice Monster (อสูรน้ำแข็งโบราณ)', color: '#0284c7' },
  { id: 'big_foot', name: 'Big Foot (ยักษ์เหมันต์บิ๊กฟุต)', color: '#0369a1' },
];

const enemyStates = ['normal', 'hit', 'defeat'];

enemies.forEach(enemy => {
  enemyStates.forEach(st => {
    const filePath = path.resolve('public/characters/enemies', `${enemy.id}_${st}.svg`);
    if (!fs.existsSync(filePath)) {
      const isDefeat = st === 'defeat';
      const isHit = st === 'hit';
      const opacity = isDefeat ? '0.4' : '0.9';
      const glow = isHit ? '#f43f5e' : enemy.color;

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <radialGradient id="${enemy.id}_${st}_grad" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stop-color="${glow}" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#020617" stop-opacity="0.9"/>
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="70" fill="url(#${enemy.id}_${st}_grad)" opacity="${opacity}" stroke="${glow}" stroke-width="3"/>
        <circle cx="80" cy="85" r="10" fill="#ffffff" />
        <circle cx="120" cy="85" r="10" fill="#ffffff" />
        <circle cx="${isHit ? 75 : 82}" cy="85" r="5" fill="${isHit ? '#ef4444' : '#0f172a'}" />
        <circle cx="${isHit ? 115 : 122}" cy="85" r="5" fill="${isHit ? '#ef4444' : '#0f172a'}" />
        <path d="${isDefeat ? 'M75,135 Q100,115 125,135' : 'M75,125 Q100,145 125,125'}" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round"/>
        ${isHit ? '<polygon points="100,20 110,45 135,50 115,70 120,95 100,80 80,95 85,70 65,50 90,45" fill="#f43f5e" opacity="0.7"/>' : ''}
      </svg>`;
      fs.writeFileSync(filePath, svg, 'utf-8');
    }
  });
});

console.log('Asset structure initialization complete!');
