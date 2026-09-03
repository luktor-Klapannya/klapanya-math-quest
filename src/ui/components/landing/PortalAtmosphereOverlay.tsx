import React from 'react';

export const PortalAtmosphereOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
      
      {/* 1. CENTRAL PORTAL BREATHING GLOW */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[520px] h-[340px] sm:h-[520px] rounded-full bg-radial from-cyan-400/15 via-blue-600/10 to-transparent blur-3xl animate-pulse" 
        style={{ animationDuration: '6s' }}
      />

      {/* 2. SUBTLE GOLDEN ACADEMY RAYS */}
      <div 
        className="absolute top-10 left-1/3 right-1/3 h-64 bg-gradient-to-b from-amber-400/10 via-amber-300/5 to-transparent blur-2xl pointer-events-none" 
      />

      {/* 3. SLOW MIST / AURORA RIBBON */}
      <div 
        className="absolute top-1/3 left-0 right-0 h-40 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent blur-2xl transform -rotate-3" 
      />

      {/* 4. ANCIENT ACADEMY RUNE CIRCLE (Low Opacity) */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] sm:w-[680px] h-[480px] sm:h-[680px] opacity-[0.035] academy-rune-spin">
        <svg viewBox="0 0 100 100" className="w-full h-full text-cyan-300 fill-none stroke-current" strokeWidth="0.5">
          <circle cx="50" cy="50" r="48" strokeDasharray="2 3" />
          <circle cx="50" cy="50" r="38" />
          <polygon points="50,14 84,74 16,74" />
          <polygon points="50,86 84,26 16,26" />
          <circle cx="50" cy="50" r="16" />
        </svg>
      </div>

      {/* 5. SPARKLING MAGIC PARTICLES */}
      <div className="absolute inset-0">
        <div className="w-1.5 h-1.5 bg-amber-300/60 rounded-full absolute top-1/4 left-[20%] animate-ping" style={{ animationDuration: '4s' }} />
        <div className="w-2 h-2 bg-cyan-300/50 rounded-full absolute top-1/3 left-[75%] animate-pulse" style={{ animationDuration: '3s' }} />
        <div className="w-1 h-1 bg-white/70 rounded-full absolute top-1/2 left-[30%] animate-ping" style={{ animationDuration: '5s' }} />
        <div className="w-2 h-2 bg-amber-400/40 rounded-full absolute top-2/3 left-[80%] animate-pulse" style={{ animationDuration: '4.5s' }} />
        <div className="w-1.5 h-1.5 bg-cyan-400/60 rounded-full absolute top-3/4 left-[15%] animate-pulse" style={{ animationDuration: '3.5s' }} />
      </div>

      {/* 6. OCCASIONAL SOFT LIGHTNING GLOW */}
      <div 
        className="absolute top-0 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" 
        style={{ animationDuration: '8s' }}
      />
    </div>
  );
};
