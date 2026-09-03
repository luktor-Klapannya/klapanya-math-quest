import fs from 'fs';
import path from 'path';

// Helper to ensure directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Generate an SVG for a specific scene and dimension
function generateSceneSvg(sceneKey, width, height) {
  const isMobile = width < 1000;
  
  if (sceneKey === 'PORTAL') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <radialGradient id="portalGlow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.35"/>
          <stop offset="40%" stop-color="#3b82f6" stop-opacity="0.2"/>
          <stop offset="80%" stop-color="#050d24" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#030712" stop-opacity="1"/>
        </radialGradient>
        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#020617"/>
          <stop offset="50%" stop-color="#0b1e3b"/>
          <stop offset="100%" stop-color="#030712"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#skyGrad)"/>
      <circle cx="${width/2}" cy="${height*0.38}" r="${isMobile ? width*0.45 : width*0.25}" fill="url(#portalGlow)"/>
      <!-- Distant Spire Castles -->
      <path d="M0,${height} L${width*0.1},${height*0.65} L${width*0.2},${height*0.75} L${width*0.3},${height*0.55} L${width*0.45},${height*0.8} L${width*0.5},${height*0.48} L${width*0.55},${height*0.8} L${width*0.7},${height*0.55} L${width*0.8},${height*0.75} L${width*0.9},${height*0.65} L${width},${height} Z" fill="#030b18" fill-opacity="0.85"/>
      <!-- Central Portal Arch & Rune Rings -->
      <circle cx="${width/2}" cy="${height*0.38}" r="${isMobile ? 140 : 200}" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="8 6" opacity="0.6"/>
      <circle cx="${width/2}" cy="${height*0.38}" r="${isMobile ? 120 : 170}" fill="none" stroke="#fbbf24" stroke-width="1.5" opacity="0.4"/>
      <circle cx="${width/2}" cy="${height*0.38}" r="${isMobile ? 90 : 130}" fill="none" stroke="#00f0ff" stroke-width="3" opacity="0.8"/>
    </svg>`;
  }

  if (sceneKey === 'MAP') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <linearGradient id="mapSky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#020817"/>
          <stop offset="40%" stop-color="#082f49"/>
          <stop offset="100%" stop-color="#030712"/>
        </linearGradient>
        <linearGradient id="aurora" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.1"/>
          <stop offset="50%" stop-color="#38bdf8" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.1"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#mapSky)"/>
      <!-- Aurora Ribbon -->
      <path d="M0,${height*0.2} Q${width*0.25},${height*0.1} ${width*0.5},${height*0.25} T${width},${height*0.15} L${width},${height*0.45} Q${width*0.75},${height*0.3} ${width*0.5},${height*0.4} T0,${height*0.35} Z" fill="url(#aurora)"/>
      <!-- Glacial Mountains -->
      <path d="M0,${height*0.85} L${width*0.15},${height*0.55} L${width*0.35},${height*0.75} L${width*0.55},${height*0.45} L${width*0.75},${height*0.7} L${width*0.9},${height*0.5} L${width},${height*0.8} L${width},${height} L0,${height} Z" fill="#0c4a6e" fill-opacity="0.4"/>
      <path d="M0,${height*0.9} L${width*0.2},${height*0.68} L${width*0.45},${height*0.85} L${width*0.7},${height*0.6} L${width*0.88},${height*0.8} L${width},${height*0.72} L${width},${height} L0,${height} Z" fill="#082f49" fill-opacity="0.7"/>
      <!-- Frost Caps -->
      <polygon points="${width*0.55},${height*0.45} ${width*0.52},${height*0.52} ${width*0.58},${height*0.52}" fill="#e0f2fe" fill-opacity="0.8"/>
      <polygon points="${width*0.15},${height*0.55} ${width*0.12},${height*0.62} ${width*0.18},${height*0.62}" fill="#e0f2fe" fill-opacity="0.7"/>
      <polygon points="${width*0.9},${height*0.5} ${width*0.87},${height*0.57} ${width*0.93},${height*0.57}" fill="#e0f2fe" fill-opacity="0.7"/>
    </svg>`;
  }

  if (sceneKey === 'DOJO') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <linearGradient id="dojoSky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#020617"/>
          <stop offset="60%" stop-color="#0c2340"/>
          <stop offset="100%" stop-color="#020617"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#dojoSky)"/>
      <!-- Dojo Pillars -->
      <rect x="${width*0.08}" y="${height*0.25}" width="${width*0.04}" height="${height*0.7}" rx="8" fill="#0284c7" fill-opacity="0.3"/>
      <rect x="${width*0.88}" y="${height*0.25}" width="${width*0.04}" height="${height*0.7}" rx="8" fill="#0284c7" fill-opacity="0.3"/>
      <!-- Open Arena Combat Circle -->
      <ellipse cx="${width/2}" cy="${height*0.78}" rx="${isMobile ? width*0.45 : width*0.35}" ry="${height*0.15}" fill="#0369a1" fill-opacity="0.15" stroke="#38bdf8" stroke-width="2" stroke-opacity="0.4"/>
      <ellipse cx="${width/2}" cy="${height*0.78}" rx="${isMobile ? width*0.35 : width*0.25}" ry="${height*0.1}" fill="none" stroke="#fbbf24" stroke-width="1" stroke-opacity="0.3" stroke-dasharray="6 4"/>
    </svg>`;
  }

  if (sceneKey === 'ARENA') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <linearGradient id="arenaSky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#020617"/>
          <stop offset="50%" stop-color="#041f3d"/>
          <stop offset="100%" stop-color="#020617"/>
        </linearGradient>
        <radialGradient id="arenaLight" cx="50%" cy="30%" r="50%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#020617" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#arenaSky)"/>
      <rect width="${width}" height="${height}" fill="url(#arenaLight)"/>
      <!-- Colosseum Grand Pillars -->
      <rect x="${width*0.05}" y="${height*0.2}" width="${width*0.05}" height="${height*0.75}" rx="6" fill="#0369a1" fill-opacity="0.4"/>
      <rect x="${width*0.15}" y="${height*0.28}" width="${width*0.04}" height="${height*0.65}" rx="6" fill="#0284c7" fill-opacity="0.3"/>
      <rect x="${width*0.81}" y="${height*0.28}" width="${width*0.04}" height="${height*0.65}" rx="6" fill="#0284c7" fill-opacity="0.3"/>
      <rect x="${width*0.9}" y="${height*0.2}" width="${width*0.05}" height="${height*0.75}" rx="6" fill="#0369a1" fill-opacity="0.4"/>
      <!-- Center Competition Arena Stage -->
      <ellipse cx="${width/2}" cy="${height*0.82}" rx="${width*0.48}" ry="${height*0.14}" fill="#082f49" fill-opacity="0.5" stroke="#38bdf8" stroke-width="2" stroke-opacity="0.5"/>
    </svg>`;
  }

  if (sceneKey === 'BOSS') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <linearGradient id="bossSky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#020617"/>
          <stop offset="50%" stop-color="#2a0808"/>
          <stop offset="100%" stop-color="#020617"/>
        </linearGradient>
        <radialGradient id="bossCore" cx="50%" cy="40%" r="40%">
          <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#020617" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bossSky)"/>
      <rect width="${width}" height="${height}" fill="url(#bossCore)"/>
      <!-- Citadel Spire Fortress -->
      <path d="M0,${height} L${width*0.2},${height*0.6} L${width*0.35},${height*0.75} L${width*0.5},${height*0.4} L${width*0.65},${height*0.75} L${width*0.8},${height*0.6} L${width},${height} Z" fill="#1e0a0a" fill-opacity="0.8"/>
      <!-- Magic Boss Rune Circle -->
      <circle cx="${width/2}" cy="${height*0.42}" r="${isMobile ? 120 : 180}" fill="none" stroke="#f43f5e" stroke-width="2" stroke-dasharray="6 4" opacity="0.6"/>
      <polygon points="${width/2},${height*0.42 - (isMobile ? 100 : 150)} ${width/2 + (isMobile ? 86 : 130)},${height*0.42 + (isMobile ? 50 : 75)} ${width/2 - (isMobile ? 86 : 130)},${height*0.42 + (isMobile ? 50 : 75)}" fill="none" stroke="#fbbf24" stroke-width="1.5" opacity="0.5"/>
    </svg>`;
  }

  // Default Arctic theme
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <rect width="${width}" height="${height}" fill="#020817"/>
  </svg>`;
}

// Generate all standard background SVG files
const scenes = [
  { key: 'PORTAL', folder: 'portal', prefix: 'wisdom-academy' },
  { key: 'PORTAL', folder: 'portal', prefix: 'portal_wisdom_academy' },
  { key: 'MAP', folder: 'arctic/map', prefix: 'arctic_map' },
  { key: 'DOJO', folder: 'arctic/dojo', prefix: 'arctic_dojo' },
  { key: 'ARENA', folder: 'arctic/arena', prefix: 'arctic_arena' },
  { key: 'BOSS', folder: 'arctic/boss', prefix: 'arctic_boss_dragon' },
  { key: 'BOSS', folder: 'arctic/boss', prefix: 'arctic_boss_golem' },
  { key: 'BOSS', folder: 'arctic/boss', prefix: 'arctic_boss_archmage' },
  { key: 'DOJO', folder: 'arctic/farming', prefix: 'arctic_farming' },
  { key: 'MAP', folder: 'arctic/onet', prefix: 'arctic_onet' },
  { key: 'DOJO', folder: 'arctic/geometry', prefix: 'arctic_geometry' },
  { key: 'MAP', folder: 'arctic/quest', prefix: 'arctic_quest' },
  { key: 'DOJO', folder: 'arctic/final', prefix: 'arctic_final' },
  { key: 'MAP', folder: 'arctic/result', prefix: 'arctic_result' },
];

const sizes = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'tablet', width: 1440, height: 1200 },
  { name: 'mobile', width: 900, height: 1200 },
];

const publicDir = path.resolve('public', 'backgrounds');

for (const sc of scenes) {
  const targetDir = path.join(publicDir, sc.folder);
  ensureDir(targetDir);

  for (const sz of sizes) {
    const fileName = `${sc.prefix}_${sz.name}.svg`;
    const filePath = path.join(targetDir, fileName);
    const svgContent = generateSceneSvg(sc.key, sz.width, sz.height);
    fs.writeFileSync(filePath, svgContent, 'utf-8');
    console.log(`Generated SVG: ${filePath}`);
  }
}

console.log('All standard background SVGs generated successfully!');
