/**
 * Sprint 4.5: Glass Navigation & Button Tokens
 * Authoritative design tokens for The Wisdom Academy School portal interface.
 */

export const GLASS_TOKENS = {
  // 1. DEFAULT GLASS CAPSULE (Transparent dark glass with subtle inner highlight)
  GLASS_BUTTON_DEFAULT: 
    'bg-slate-950/30 backdrop-blur-xl border border-cyan-100/20 rounded-full text-slate-200 hover:border-cyan-300/70 hover:bg-cyan-400/10 hover:text-white transition-all duration-300 shadow-glass-crystal',

  // 2. ACTIVE / SELECTED GLASS CAPSULE (Luminous gold/cyan border & soft warm glow)
  GLASS_BUTTON_ACTIVE: 
    'bg-amber-400/15 backdrop-blur-xl border border-amber-300/80 rounded-full text-amber-100 shadow-[0_0_20px_rgba(251,191,36,0.35)] transition-all duration-300 font-bold',

  // 3. PRIMARY HERO CTA (Translucent golden crystal button with deep glass depth & gold glow)
  GLASS_BUTTON_PRIMARY: 
    'relative overflow-hidden bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 backdrop-blur-2xl border-2 border-amber-300/90 rounded-2xl sm:rounded-full text-amber-100 shadow-[0_0_35px_rgba(251,191,36,0.45),inset_0_1px_2px_rgba(255,255,255,0.4)] hover:shadow-[0_0_50px_rgba(251,191,36,0.7),inset_0_1px_3px_rgba(255,255,255,0.6)] hover:border-amber-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 font-black tracking-wide',

  // 4. SECONDARY / MUTED GLASS CAPSULE (Subtle pill for resources and metadata)
  GLASS_BUTTON_MUTED: 
    'bg-slate-950/20 backdrop-blur-lg border border-slate-700/60 rounded-full text-slate-300 hover:border-cyan-400/50 hover:bg-cyan-950/30 hover:text-white transition-all duration-200',

  // 5. ROLE PILL: PROFESSOR SELECTED (Soft Gold-Violet glow)
  ROLE_PILL_PROFESSOR_ACTIVE: 
    'bg-gradient-to-r from-amber-500/25 to-purple-600/25 backdrop-blur-xl border border-amber-300/80 text-amber-200 shadow-[0_0_20px_rgba(234,179,8,0.35)]',

  // 6. ROLE PILL: LEARNER SELECTED (Soft Cyan-Blue glow)
  ROLE_PILL_LEARNER_ACTIVE: 
    'bg-gradient-to-r from-cyan-500/25 to-blue-600/25 backdrop-blur-xl border border-cyan-400/80 text-cyan-200 shadow-[0_0_20px_rgba(0,240,255,0.35)]',

  // 7. ROLE PILL: INACTIVE
  ROLE_PILL_INACTIVE: 
    'bg-slate-950/30 backdrop-blur-lg border border-slate-700/70 text-slate-400 hover:border-slate-500 hover:text-slate-200',

  // 8. WORLD GATEWAY CARD (Magical portal plaque)
  GATEWAY_PLAQUE: 
    'bg-slate-950/40 backdrop-blur-xl border border-cyan-400/30 hover:border-cyan-400/80 rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,240,255,0.2)]',

  // 9. MINI REALM MEDALLION
  REALM_MEDALLION_ACTIVE: 
    'bg-cyan-950/50 backdrop-blur-lg border-2 border-cyan-400 text-cyan-100 shadow-[0_0_20px_rgba(0,240,255,0.3)]',
  REALM_MEDALLION_LOCKED: 
    'bg-slate-950/40 backdrop-blur-lg border border-slate-800 text-slate-400 opacity-75 hover:opacity-100 hover:border-slate-700',
};
