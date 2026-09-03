import React, { useState } from 'react';
import { Menu, X, LogIn, LogOut, User, Sparkles, GraduationCap, Shield } from 'lucide-react';
import { GlassNavButton } from './GlassNavButton';
import { GLASS_TOKENS } from '../../tokens/glassTokens';
import { AuthUser } from '../../../auth/types';

interface GlassAnchorNavigationProps {
  activeSection: string;
  currentUser?: AuthUser | null;
  onNavigate: (sectionId: string) => void;
  onOpenLogin: () => void;
  onLogout?: () => void;
}

const NAV_ITEMS = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'arena', label: 'Arena', href: '#arena' },
  { id: 'territory', label: 'Territory', href: '#territory' },
  { id: 'guide', label: 'Guide', href: '#guide' },
  { id: 'documents', label: 'Documents', href: '#guide' },
  { id: 'about', label: 'About', href: '#about' },
];

export const GlassAnchorNavigation: React.FC<GlassAnchorNavigationProps> = ({
  activeSection,
  currentUser,
  onNavigate,
  onOpenLogin,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleItemClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const isAuthenticated = !!currentUser && currentUser.status === 'ACTIVE';

  return (
    <header className="sticky top-0 z-40 w-full px-4 py-3 sm:py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* BRAND IDENTITY (Top-Left): Official Seal + Typography */}
        <a 
          href="#home" 
          onClick={(e) => { e.preventDefault(); handleItemClick('home'); }}
          className="flex items-center gap-3 group select-none"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full p-0.5 bg-slate-950/80 border border-amber-400/70 shadow-[0_0_15px_rgba(251,191,36,0.3)] group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center">
            <img src="/brand/seal.png" alt="School Seal" className="w-full h-full object-contain rounded-full" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-sm sm:text-base font-black tracking-widest text-amber-200 group-hover:text-cyan-200 transition-colors">
              KLAPANYA
            </span>
            <span className="text-[10px] sm:text-[11px] font-display text-slate-400 tracking-wider -mt-1">
              The Wisdom Academy
            </span>
          </div>
        </a>

        {/* DESKTOP GLASS ANCHOR CAPSULES (Independent Glass Pills) */}
        <nav className="hidden lg:flex items-center gap-2">
          {NAV_ITEMS.map((item) => (
            <GlassNavButton
              key={item.id}
              label={item.label}
              href={item.href}
              isActive={activeSection === item.id}
              onClick={() => handleItemClick(item.id)}
            />
          ))}
        </nav>

        {/* RIGHT ACTION: USER IDENTITY OR LOGIN BUTTON */}
        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/80 border border-cyan-400/50 backdrop-blur-md shadow-glass-crystal text-xs">
                {currentUser.role === 'PROFESSOR' ? (
                  <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                )}
                <span className="font-bold text-white max-w-[120px] truncate">
                  {currentUser.displayName}
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-slate-900 text-[10px] font-black text-amber-300 border border-slate-700">
                  {currentUser.role}
                </span>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 rounded-full bg-slate-950/80 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 border border-slate-700/80 hover:border-rose-400 transition-all shadow-md"
                  title="ออกจากระบบ (Logout)"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className={`hidden sm:inline-flex items-center gap-2 px-5 py-1.5 text-xs font-bold ${GLASS_TOKENS.GLASS_BUTTON_ACTIVE} hover:scale-105 active:scale-95`}
            >
              <LogIn className="w-3.5 h-3.5 text-amber-300" />
              <span>เข้าสู่ระบบ / Login</span>
            </button>
          )}

          {/* Mobile Hamburger Glass Capsule */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className={`lg:hidden p-2 text-slate-200 ${GLASS_TOKENS.GLASS_BUTTON_DEFAULT}`}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-300" /> : <Menu className="w-5 h-5 text-slate-300" />}
          </button>
        </div>
      </div>

      {/* MOBILE GLASS DRAWER / OVERLAY */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 p-4 rounded-3xl bg-slate-950/90 backdrop-blur-2xl border border-cyan-400/30 shadow-[0_12px_40px_rgba(0,0,0,0.8)] animate-fade-in space-y-2">
          
          {isAuthenticated && (
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-cyan-400/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentUser.role === 'PROFESSOR' ? (
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                ) : (
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                )}
                <div>
                  <div className="text-xs font-bold text-white">{currentUser.displayName}</div>
                  <div className="text-[10px] text-amber-300 font-mono">{currentUser.role} • {currentUser.userCode}</div>
                </div>
              </div>
              {onLogout && (
                <button
                  onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                  className="px-2.5 py-1 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-300 text-[10px] font-bold"
                >
                  Logout
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {NAV_ITEMS.map((item) => (
              <GlassNavButton
                key={item.id}
                label={item.label}
                href={item.href}
                isActive={activeSection === item.id}
                onClick={() => handleItemClick(item.id)}
                className="justify-center py-2.5"
              />
            ))}
          </div>

          {!isAuthenticated && (
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenLogin(); }}
                className={`w-full py-2.5 justify-center flex items-center gap-2 text-xs font-black ${GLASS_TOKENS.GLASS_BUTTON_ACTIVE}`}
              >
                <LogIn className="w-4 h-4 text-amber-300" />
                <span>เข้าสู่ระบบ (Login to World)</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
