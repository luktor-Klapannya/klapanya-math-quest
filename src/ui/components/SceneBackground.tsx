import React, { useState } from 'react';
import { 
  TerritoryId, 
  SceneType, 
  getSceneBackgroundConfig, 
  SceneBackgroundConfig 
} from '../backgrounds/SceneBackgroundRegistry';

interface SceneBackgroundProps {
  territoryId?: TerritoryId;
  sceneType?: SceneType;
  customConfig?: Partial<SceneBackgroundConfig>;
  className?: string;
  children?: React.ReactNode;
}

export const SceneBackground: React.FC<SceneBackgroundProps> = ({
  territoryId = 'FROZEN_ARCTIC',
  sceneType = 'MAP',
  customConfig,
  className = '',
  children,
}) => {
  const config = {
    ...getSceneBackgroundConfig(territoryId, sceneType),
    ...customConfig,
  };

  const [imageError, setImageError] = useState(false);

  return (
    <div className={`relative min-h-screen bg-[#030712] overflow-hidden select-none font-sans ${className}`}>
      
      {/* 1. LAYER 1: RESPONSIVE PICTURE LAYER (Desktop 1920x1080, Tablet 1440x1200, Mobile 900x1200) */}
      {!imageError && (
        <picture className="absolute inset-0 pointer-events-none z-0">
          {/* WebP High-Performance Sources */}
          <source 
            media="(min-width: 1024px)" 
            srcSet={config.assets.desktop} 
            type="image/webp" 
          />
          <source 
            media="(min-width: 640px)" 
            srcSet={config.assets.tablet} 
            type="image/webp" 
          />
          {/* Vector SVG Fallbacks for Pristine Scaling */}
          <source 
            media="(min-width: 1024px)" 
            srcSet={config.assets.desktop.replace('.webp', '.svg')} 
            type="image/svg+xml" 
          />
          <source 
            media="(min-width: 640px)" 
            srcSet={config.assets.tablet.replace('.webp', '.svg')} 
            type="image/svg+xml" 
          />
          <img
            src={config.assets.mobile.replace('.webp', '.svg')}
            alt=""
            aria-hidden="true"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center mix-blend-screen scale-105 transition-opacity duration-700 pointer-events-none select-none"
            style={{ opacity: config.backdropOpacity }}
            loading="lazy"
          />
        </picture>
      )}

      {/* Fallback Image Layer (If asset is missing or still generating) */}
      {imageError && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0 mix-blend-screen scale-105"
          style={{ 
            backgroundImage: `url('/academy_backdrop.jpg')`,
            opacity: config.backdropOpacity * 0.8
          }}
        />
      )}

      {/* 2. LAYER 2: SCENE GRADIENT OVERLAY (Always active, ensures text contrast & zero white screen) */}
      <div 
        className={`absolute inset-0 bg-gradient-to-b ${config.baseGradient} pointer-events-none z-0`} 
      />

      {/* 3. LAYER 3: ATMOSPHERIC AURORA GLOW RIBBON */}
      <div 
        className={`absolute top-0 left-1/4 right-1/4 h-80 bg-gradient-to-r ${config.auroraGlow} blur-3xl pointer-events-none z-0 animate-pulse`} 
      />

      {/* 4. LAYER 4: STRUCTURAL SVGS & SAFE ZONE FRAMING */}
      {config.hasMountainSilhouette && (
        <svg className="absolute bottom-0 left-0 right-0 w-full h-80 opacity-20 pointer-events-none z-0" viewBox="0 0 1440 400" preserveAspectRatio="none">
          <path d="M0,280 L180,180 L360,260 L540,120 L720,240 L900,100 L1080,210 L1260,150 L1440,300 L1440,400 L0,400 Z" fill="#0369a1" fillOpacity="0.4" />
          <path d="M0,320 L240,220 L480,310 L720,190 L960,280 L1200,200 L1440,330 L1440,400 L0,400 Z" fill="#0f172a" fillOpacity="0.8" />
          <polygon points="540,120 520,150 560,150" fill="#e0f2fe" fillOpacity="0.6" />
          <polygon points="900,100 875,140 925,140" fill="#e0f2fe" fillOpacity="0.7" />
        </svg>
      )}

      {config.hasArenaPillars && (
        <svg className="absolute bottom-0 left-0 right-0 w-full h-64 opacity-25 pointer-events-none z-0" viewBox="0 0 1200 300" preserveAspectRatio="none">
          <rect x="100" y="80" width="40" height="220" rx="6" fill="#0284c7" />
          <rect x="250" y="110" width="35" height="190" rx="6" fill="#0369a1" />
          <rect x="915" y="110" width="35" height="190" rx="6" fill="#0369a1" />
          <rect x="1060" y="80" width="40" height="220" rx="6" fill="#0284c7" />
          <ellipse cx="600" cy="280" rx="550" ry="60" fill="#082f49" fillOpacity="0.6" />
        </svg>
      )}

      {config.hasRuneCircle && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-[0.04] z-0 academy-rune-spin">
          <svg viewBox="0 0 100 100" className="w-full h-full text-cyan-300 fill-none stroke-current" strokeWidth="0.6">
            <circle cx="50" cy="50" r="48" strokeDasharray="3 3" />
            <circle cx="50" cy="50" r="38" />
            <polygon points="50,12 85,75 15,75" />
            <polygon points="50,88 85,25 15,25" />
            <circle cx="50" cy="50" r="14" />
          </svg>
        </div>
      )}

      {config.hasPortalRing && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-cyan-400/30 shadow-[0_0_60px_rgba(0,240,255,0.25)] pointer-events-none z-0">
          <div className="absolute inset-4 rounded-full border border-amber-400/20 animate-spin" style={{ animationDuration: '40s' }} />
        </div>
      )}

      {/* 5. LAYER 5: ATMOSPHERIC PARTICLES (Snow / Gold / Ember / Magic Runes) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {config.particleType === 'SNOW' && (
          <>
            <div className="w-1.5 h-1.5 bg-white/40 rounded-full absolute top-10 left-[15%] animate-pulse" />
            <div className="w-2 h-2 bg-cyan-200/30 rounded-full absolute top-28 left-[45%] animate-pulse" />
            <div className="w-1 h-1 bg-white/50 rounded-full absolute top-60 left-[75%] animate-pulse" />
            <div className="w-2.5 h-2.5 bg-sky-200/20 rounded-full absolute top-40 left-[85%] animate-pulse" />
          </>
        )}

        {config.particleType === 'GOLD_SPARKS' && (
          <>
            <div className="w-1.5 h-1.5 bg-amber-400/50 rounded-full absolute top-12 left-[20%] animate-ping" />
            <div className="w-2 h-2 bg-yellow-300/40 rounded-full absolute top-32 left-[50%] animate-pulse" />
            <div className="w-1 h-1 bg-amber-300/60 rounded-full absolute top-56 left-[80%] animate-ping" />
          </>
        )}

        {config.particleType === 'EMBER' && (
          <>
            <div className="w-1.5 h-1.5 bg-rose-500/50 rounded-full absolute top-16 left-[25%] animate-pulse" />
            <div className="w-2 h-2 bg-amber-500/40 rounded-full absolute top-36 left-[60%] animate-pulse" />
            <div className="w-1.5 h-1.5 bg-red-400/60 rounded-full absolute top-64 left-[75%] animate-pulse" />
          </>
        )}

        {config.particleType === 'MAGIC_RUNES' && (
          <>
            <div className="w-2 h-2 bg-cyan-400/40 rounded-full absolute top-14 left-[30%] animate-pulse" />
            <div className="w-1.5 h-1.5 bg-purple-400/40 rounded-full absolute top-44 left-[70%] animate-pulse" />
            <div className="w-2 h-2 bg-blue-300/30 rounded-full absolute top-24 left-[80%] animate-pulse" />
          </>
        )}
      </div>

      {/* 6. LAYER 6: FOREGROUND CONTENT CHILDREN */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};
