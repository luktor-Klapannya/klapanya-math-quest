import React from 'react';

interface AtmosphereOverlayProps {
  particleType?: 'SNOW' | 'GOLD_SPARKS' | 'EMBER' | 'MAGIC_RUNES';
  auroraGlow?: string;
  className?: string;
}

export const AtmosphereOverlay: React.FC<AtmosphereOverlayProps> = ({
  particleType = 'SNOW',
  auroraGlow = 'from-cyan-500/20 via-sky-400/25 to-blue-600/15',
  className = '',
}) => {
  return (
    <div className={`absolute inset-0 pointer-events-none z-0 overflow-hidden select-none ${className}`}>
      
      {/* 1. AURORA GLOW RIBBON */}
      <div 
        className={`absolute top-0 left-1/4 right-1/4 h-80 bg-gradient-to-r ${auroraGlow} blur-3xl pointer-events-none animate-pulse`} 
        style={{ animationDuration: '6s' }}
      />

      {/* 2. ATMOSPHERIC PARTICLES */}
      <div className="absolute inset-0">
        {particleType === 'SNOW' && (
          <>
            <div className="w-1.5 h-1.5 bg-white/60 rounded-full absolute top-10 left-[15%] animate-pulse" />
            <div className="w-2 h-2 bg-cyan-200/40 rounded-full absolute top-28 left-[45%] animate-pulse" />
            <div className="w-1 h-1 bg-white/70 rounded-full absolute top-60 left-[75%] animate-pulse" />
            <div className="w-2.5 h-2.5 bg-sky-200/30 rounded-full absolute top-40 left-[85%] animate-pulse" />
          </>
        )}

        {particleType === 'GOLD_SPARKS' && (
          <>
            <div className="w-1.5 h-1.5 bg-amber-400/60 rounded-full absolute top-12 left-[20%] animate-ping" style={{ animationDuration: '3s' }} />
            <div className="w-2 h-2 bg-yellow-300/50 rounded-full absolute top-32 left-[50%] animate-pulse" />
            <div className="w-1 h-1 bg-amber-300/70 rounded-full absolute top-56 left-[80%] animate-ping" style={{ animationDuration: '4s' }} />
          </>
        )}

        {particleType === 'EMBER' && (
          <>
            <div className="w-1.5 h-1.5 bg-rose-500/60 rounded-full absolute top-16 left-[25%] animate-pulse" />
            <div className="w-2 h-2 bg-amber-500/50 rounded-full absolute top-36 left-[60%] animate-pulse" />
            <div className="w-1.5 h-1.5 bg-red-400/70 rounded-full absolute top-64 left-[75%] animate-pulse" />
          </>
        )}

        {particleType === 'MAGIC_RUNES' && (
          <>
            <div className="w-2 h-2 bg-cyan-400/50 rounded-full absolute top-14 left-[30%] animate-pulse" />
            <div className="w-1.5 h-1.5 bg-purple-400/50 rounded-full absolute top-44 left-[70%] animate-pulse" />
            <div className="w-2 h-2 bg-blue-300/40 rounded-full absolute top-24 left-[80%] animate-pulse" />
          </>
        )}
      </div>
    </div>
  );
};
