import React, { useState } from 'react';
import { X, Monitor, Tablet, Smartphone, Sparkles, Layers, ShieldCheck, ExternalLink } from 'lucide-react';

interface BackgroundGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SceneKey = 'PORTAL' | 'MAP' | 'DOJO' | 'ARENA' | 'BOSS';
type ViewportSize = 'desktop' | 'tablet' | 'mobile';

interface SceneItem {
  id: SceneKey;
  name: string;
  thaiName: string;
  category: string;
  description: string;
  desktop: string;
  tablet: string;
  mobile: string;
}

const SCENE_ITEMS: SceneItem[] = [
  {
    id: 'PORTAL',
    name: 'Wisdom Academy Portal',
    thaiName: '🌌 ประตูมิติเวทมนตร์ราชบัณฑิต',
    category: 'PORTAL_BACKGROUND',
    description: 'ปราสาทเวทมนตร์ วงแหวนรูนหมุนวน และแสงออโรร่าฟ้าครามสำหรับหน้าแรก Dark Fantasy',
    desktop: '/backgrounds/portal/portal_wisdom_academy_desktop.svg',
    tablet: '/backgrounds/portal/portal_wisdom_academy_tablet.svg',
    mobile: '/backgrounds/portal/portal_wisdom_academy_mobile.svg',
  },
  {
    id: 'MAP',
    name: 'Frozen Arctic Expedition Map',
    thaiName: '❄️ แผนที่ผจญภัยดินแดนเหมันต์',
    category: 'MAP_BACKGROUND',
    description: 'เทือกเขาน้ำแข็ง Glacial Mountain แสงออโรร่า และยอดเขาหิมะขาวบริสุทธิ์',
    desktop: '/backgrounds/arctic/map/arctic_map_desktop.svg',
    tablet: '/backgrounds/arctic/map/arctic_map_tablet.svg',
    mobile: '/backgrounds/arctic/map/arctic_map_mobile.svg',
  },
  {
    id: 'DOJO',
    name: 'Frost Training Hall',
    thaiName: '🥋 ลานประลองเปิดโล่งเสาหลักโดโจ',
    category: 'GAME_BACKGROUND',
    description: 'เสาหินน้ำแข็ง ลานประลองวงกลมเปิดโล่ง รองรับผู้กล้าและหุ่นซ้อม Frost Dummy',
    desktop: '/backgrounds/arctic/dojo/arctic_dojo_desktop.svg',
    tablet: '/backgrounds/arctic/dojo/arctic_dojo_tablet.svg',
    mobile: '/backgrounds/arctic/dojo/arctic_dojo_mobile.svg',
  },
  {
    id: 'ARENA',
    name: 'Arctic Academic Colosseum',
    thaiName: '⚔️ สนามกีฬาประลองวิชาการ',
    category: 'ARENA_BACKGROUND',
    description: 'เสาโคลอสเซียมและลานเวทีแข่งขันสำหรับ Live Classroom Battle 9–12 ผู้กล้า',
    desktop: '/backgrounds/arctic/arena/arctic_arena_desktop.svg',
    tablet: '/backgrounds/arctic/arena/arctic_arena_tablet.svg',
    mobile: '/backgrounds/arctic/arena/arctic_arena_mobile.svg',
  },
  {
    id: 'BOSS',
    name: 'Frozen Sky Dragon Citadel',
    thaiName: '🐉 ปราสาทมหาบอสมังกรไซเบอร์ฟรอสต์',
    category: 'GAME_BACKGROUND',
    description: 'ปราสาททมิฬ แกนพลังงานสีทับทิม และวงแหวนเวทมนตร์สามเหลี่ยมโบราณ',
    desktop: '/backgrounds/arctic/boss/arctic_boss_dragon_desktop.svg',
    tablet: '/backgrounds/arctic/boss/arctic_boss_dragon_tablet.svg',
    mobile: '/backgrounds/arctic/boss/arctic_boss_dragon_mobile.svg',
  },
];

export const BackgroundGalleryModal: React.FC<BackgroundGalleryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedScene, setSelectedScene] = useState<SceneKey>('PORTAL');
  const [selectedSize, setSelectedSize] = useState<ViewportSize>('desktop');
  const [showSafeZones, setShowSafeZones] = useState<boolean>(true);

  if (!isOpen) return null;

  const currentItem = SCENE_ITEMS.find((s) => s.id === selectedScene) || SCENE_ITEMS[0];
  const currentImgSrc = currentItem[selectedSize];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in select-none">
      <div className="bg-slate-950 border-2 border-cyan-400 rounded-3xl max-w-5xl w-full max-h-[95vh] flex flex-col shadow-[0_0_60px_rgba(0,240,255,0.35)] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-cyan-950/80 to-slate-950 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-cyan-300">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950">
                  STANDARD v1
                </span>
                <h2 className="text-sm sm:text-base font-black text-white font-serif tracking-wide">
                  แกลเลอรีภาพพื้นหลังเสมือนจริง (Background Gallery)
                </h2>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                เลือกชมภาพพื้นหลังทั้ง 5 ฉากหลัก พร้อมสลับขนาดหน้าจอ Desktop / Tablet / Mobile
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900 hover:bg-rose-950 border border-slate-700 hover:border-rose-400 text-slate-300 hover:text-rose-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Toolbar */}
        <div className="p-3 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Scene Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {SCENE_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedScene(item.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedScene === item.id
                    ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan font-black'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-cyan-400/50'
                }`}
              >
                {item.thaiName}
              </button>
            ))}
          </div>

          {/* Viewport Size & Safe Zone Toggle */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => setSelectedSize('desktop')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 font-bold ${
                  selectedSize === 'desktop' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                title="Desktop 1920x1080"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                onClick={() => setSelectedSize('tablet')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 font-bold ${
                  selectedSize === 'tablet' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                title="Tablet 1440x1200"
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tablet</span>
              </button>
              <button
                onClick={() => setSelectedSize('mobile')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 font-bold ${
                  selectedSize === 'mobile' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                title="Mobile 900x1200"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>

            <button
              onClick={() => setShowSafeZones(!showSafeZones)}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition-all ${
                showSafeZones
                  ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Safe Zones</span>
            </button>
          </div>
        </div>

        {/* Main Interactive Stage Area */}
        <div className="p-4 flex-1 overflow-y-auto flex flex-col items-center justify-center bg-[#020617] min-h-[360px]">
          
          <div className="text-center mb-2">
            <span className="text-xs font-mono text-cyan-300 px-3 py-0.5 rounded-full bg-slate-900 border border-slate-800">
              {currentImgSrc}
            </span>
          </div>

          {/* Rendered Frame */}
          <div 
            className={`relative rounded-2xl overflow-hidden border-2 border-cyan-400/80 bg-slate-950 shadow-2xl transition-all duration-300 flex flex-col items-center justify-between p-4 ${
              selectedSize === 'desktop'
                ? 'w-full max-w-3xl aspect-[16/9]'
                : selectedSize === 'tablet'
                ? 'w-full max-w-xl aspect-[4/3]'
                : 'w-full max-w-[280px] aspect-[9/16]'
            }`}
          >
            {/* The Actual Visual Image Rendered */}
            <img 
              src={currentImgSrc} 
              alt={currentItem.name} 
              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            />

            {/* Safe Zone Overlays */}
            {showSafeZones && (
              <>
                <div className="relative z-10 w-full p-2 rounded-xl bg-cyan-950/50 border border-cyan-400/70 backdrop-blur-sm text-center">
                  <span className="text-[10px] font-black text-cyan-300 uppercase tracking-wider block">
                    [ TOP SAFE ZONE: HUD & NAVIGATION ]
                  </span>
                </div>

                <div className="relative z-10 p-3 rounded-xl border-2 border-dashed border-amber-400 bg-amber-950/30 backdrop-blur-sm text-center">
                  <span className="text-[10px] font-black text-amber-300 block">
                    [ CENTER SAFE ZONE: HERO / MAP / ARENA ]
                  </span>
                </div>

                <div className="relative z-10 w-full p-2 rounded-xl bg-slate-950/70 border border-slate-700 backdrop-blur-sm text-center">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider block">
                    [ BOTTOM SAFE ZONE: QUESTION & ACTIONS ]
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Description Card */}
          <div className="mt-3 max-w-xl w-full p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <h4 className="text-xs font-black text-amber-300">{currentItem.thaiName} ({currentItem.name})</h4>
            <p className="text-[11px] text-slate-300 mt-0.5">{currentItem.description}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <a
            href={currentImgSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold underline"
          >
            <span>เปิดไฟล์ต้นฉบับเต็มจอ (Open Full Image)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold border border-slate-700"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
