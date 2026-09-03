import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { GLASS_TOKENS } from '../../tokens/glassTokens';

interface AcademicWorldCTAProps {
  onClick: () => void;
  label?: string;
}

export const AcademicWorldCTA: React.FC<AcademicWorldCTAProps> = ({
  onClick,
  label = 'ENTER TO ACADEMIC WORLD',
}) => {
  return (
    <div className="relative group select-none">
      
      {/* Outer Luminous Pulse Aura */}
      <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 via-cyan-400/30 to-amber-500/30 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 animate-pulse pointer-events-none" />

      {/* Main Translucent Golden Crystal Button */}
      <button
        onClick={onClick}
        className={`px-8 sm:px-12 py-3.5 sm:py-4 text-sm sm:text-base font-serif font-black flex items-center justify-center gap-3 ${GLASS_TOKENS.GLASS_BUTTON_PRIMARY}`}
      >
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
        <span className="tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {label}
        </span>
        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 group-hover:translate-x-1.5 transition-transform duration-300" />
      </button>
    </div>
  );
};
