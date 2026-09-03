import React, { useState } from 'react';
import { HowToPlayModal } from '../modals/HowToPlayModal';
import { TerritoryDetailModal } from '../modals/TerritoryDetailModal';
import { authSession } from '../../auth/session';
import { AuthUser } from '../../auth/types';

interface LandingScreenProps {
  onGoToStaffLogin: () => void;
  onGoToStudentLogin: () => void;
  onGoToTeacherLogin: () => void;
  onQuickDemoStudent: () => void;
  onQuickDemoTeacher: () => void;
  onEnterHub?: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onGoToStaffLogin,
  onGoToStudentLogin,
  onGoToTeacherLogin,
  onQuickDemoStudent,
  onQuickDemoTeacher,
  onEnterHub,
}) => {
  const [currentUser] = useState<AuthUser | null>(authSession.getCurrentUser());
  const [selectedRole, setSelectedRole] = useState<'LEARNER' | 'PROFESSOR'>('LEARNER');
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [showPilotLibraryNotice, setShowPilotLibraryNotice] = useState(false);
  const [showTerritoryModal, setShowTerritoryModal] = useState<boolean>(false);
  const [activeTerritoryKey, setActiveTerritoryKey] = useState<string>('ARCTIC');

  const handleEnterAction = (role: 'LEARNER' | 'PROFESSOR' = selectedRole) => {
    if (currentUser) {
      if (onEnterHub) {
        onEnterHub();
        return;
      }
      if (currentUser.role === 'PROFESSOR') {
        onQuickDemoTeacher();
      } else {
        onQuickDemoStudent();
      }
      return;
    }

    if (role === 'PROFESSOR') {
      onGoToTeacherLogin();
    } else {
      onGoToStudentLogin();
    }
  };

  const handleOpenTerritory = (tKey: string = 'ARCTIC') => {
    setActiveTerritoryKey(tKey);
    setShowTerritoryModal(true);
  };

  return (
    <div className="relative w-screen h-screen min-h-screen overflow-hidden font-sans select-none bg-[#030712]">
      
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 1. LAYER 1: APPROVED VISUAL FOUNDATION (100% UNCHANGED ARTWORK) */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <picture className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
        <source media="(min-width: 768px)" srcSet="/backgrounds/portal/portal_desktop.png" />
        <img
          src="/backgrounds/portal/portal_mobile.jpg"
          alt="Wisdom Academy Landing"
          className="w-full h-full object-cover object-center pointer-events-none select-none"
        />
      </picture>

      {/* Navigation only: AdminAccessGuard owns authorization. */}
      <nav aria-label="Pilot public entry" className="absolute bottom-2 left-2 right-2 z-40 flex flex-wrap justify-center gap-1 rounded-lg bg-slate-950/90 p-1 text-sm text-amber-100">
        <button className="min-h-[44px] px-2" onClick={onGoToStudentLogin}>Learner</button>
        <button className="min-h-[44px] px-2" onClick={onGoToTeacherLogin}>Teacher</button>
        <button className="min-h-[44px] px-2" title="Guest guide; no account required" onClick={()=>setShowGuideModal(true)}>Guest</button>
        <button className="min-h-[44px] px-2" onClick={()=>setShowGuideModal(true)}>Guide</button>
        <button className="min-h-[44px] px-2" onClick={()=>setShowPilotLibraryNotice(v=>!v)}>Library</button>
        {showPilotLibraryNotice&&<p role="status" className="w-full px-3 pb-2 text-center">Library resources are being prepared for the pilot. Public Library access is not open yet.</p>}
      </nav>
      <button type="button" onClick={onGoToStaffLogin}
        aria-label="Staff/Admin sign in" title="Staff/Admin sign in"
        className="absolute z-40 top-[2%] left-[3%] min-w-[44px] min-h-[44px] w-[14%] h-[7%] md:w-[8%] md:h-[9%] rounded-lg bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300" />

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 2. LAYER 2: DESKTOP INTERACTIVE HIT AREAS (>= 768px)             */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block absolute inset-0 z-30 pointer-events-auto">
        
        {/* Top-Right Login Button */}
        <button
          onClick={() => handleEnterAction(selectedRole)}
          className="absolute top-[3.5%] right-[2.5%] w-[9%] h-[5%] rounded-xl hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/50 cursor-pointer"
          title="เข้าสู่ระบบ (Login)"
          aria-label="Login"
        />

        {/* Top Navigation: Home, Guide, Arena, Territory, About */}
        <div className="absolute top-[3.5%] left-[34%] w-[42%] h-[5%] flex items-center justify-between">
          <button
            onClick={() => {}}
            className="w-[18%] h-full rounded-xl hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
            title="Home"
            aria-label="Home"
          />
          <button
            onClick={() => setShowGuideModal(true)}
            className="w-[18%] h-full rounded-xl hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
            title="คู่มือ (Guide)"
            aria-label="Guide"
          />
          <button
            onClick={() => handleEnterAction('LEARNER')}
            className="w-[18%] h-full rounded-xl hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
            title="ลานประลอง (Arena)"
            aria-label="Arena"
          />
          <button
            onClick={() => handleOpenTerritory('ARCTIC')}
            className="w-[20%] h-full rounded-xl hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
            title="ดินแดน (Territory)"
            aria-label="Territory"
          />
          <button
            onClick={() => setShowGuideModal(true)}
            className="w-[18%] h-full rounded-xl hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
            title="เกี่ยวกับเรา (About)"
            aria-label="About"
          />
        </div>

        {/* Center Role Selector: Professor vs Learner */}
        <div className="absolute top-[38%] left-[40.5%] w-[19%] h-[4.5%] flex items-center justify-between">
          <button
            onClick={() => {
              setSelectedRole('PROFESSOR');
              handleEnterAction('PROFESSOR');
            }}
            className={`w-[48%] h-full rounded-xl transition-all focus:outline-none cursor-pointer ${
              selectedRole === 'PROFESSOR' ? 'bg-amber-400/20 ring-2 ring-amber-400' : 'hover:bg-white/10'
            }`}
            title="เลือกบทบาท: อาจารย์ (Professor)"
            aria-label="Select Professor"
          />
          <button
            onClick={() => {
              setSelectedRole('LEARNER');
              handleEnterAction('LEARNER');
            }}
            className={`w-[48%] h-full rounded-xl transition-all focus:outline-none cursor-pointer ${
              selectedRole === 'LEARNER' ? 'bg-cyan-400/20 ring-2 ring-cyan-400' : 'hover:bg-white/10'
            }`}
            title="เลือกบทบาท: นักเรียน (Learner)"
            aria-label="Select Learner"
          />
        </div>

        {/* Center Primary CTA: Enter to Academic World Button */}
        <button
          onClick={() => handleEnterAction(selectedRole)}
          className="absolute top-[49.5%] left-[37.5%] w-[25%] h-[7%] rounded-2xl hover:brightness-110 active:scale-98 transition-all focus:outline-none focus:ring-4 focus:ring-amber-400/60 cursor-pointer shadow-lg"
          title="เข้าสู่ดินแดนแห่งปัญญา (Enter to Academic World)"
          aria-label="Enter to Academic World"
        />

        {/* Left Arena Box (Explore Arena) */}
        <button
          onClick={() => handleEnterAction('LEARNER')}
          className="absolute top-[47%] left-[6.5%] w-[22.5%] h-[17%] rounded-2xl hover:bg-white/5 transition-colors focus:outline-none cursor-pointer"
          title="เข้าสู่ลานประลองวิชาการ (Academic Arena)"
          aria-label="Explore Arena"
        />

        {/* Right Territory Box (Explore Territory) */}
        <button
          onClick={() => handleOpenTerritory('ARCTIC')}
          className="absolute top-[47%] right-[6.5%] w-[22.5%] h-[17%] rounded-2xl hover:bg-white/5 transition-colors focus:outline-none cursor-pointer"
          title="สำรวจดินแดนทั้ง 5 (Explore Territories)"
          aria-label="Explore Territory"
        />

        {/* 5 Territory Realm Cards (Bottom Row) */}
        <div className="absolute top-[67%] left-[6.5%] w-[87%] h-[15%] flex items-center justify-between">
          {/* Arctic */}
          <button
            onClick={() => handleOpenTerritory('ARCTIC')}
            className="w-[18%] h-full rounded-2xl hover:scale-105 transition-transform focus:outline-none cursor-pointer"
            title="World Arctic (Mathematics)"
            aria-label="World Arctic"
          />
          {/* Sky Castle */}
          <button
            onClick={() => handleOpenTerritory('SKY')}
            className="w-[18%] h-full rounded-2xl hover:scale-105 transition-transform focus:outline-none cursor-pointer"
            title="Sky Castle (Social Studies)"
            aria-label="Sky Castle"
          />
          {/* Ocean */}
          <button
            onClick={() => handleOpenTerritory('OCEAN')}
            className="w-[18%] h-full rounded-2xl hover:scale-105 transition-transform focus:outline-none cursor-pointer"
            title="Bubble Ocean Land (English)"
            aria-label="Ocean"
          />
          {/* Volcanic */}
          <button
            onClick={() => handleOpenTerritory('VOLCANIC')}
            className="w-[18%] h-full rounded-2xl hover:scale-105 transition-transform focus:outline-none cursor-pointer"
            title="Volcanic Earth (Science)"
            aria-label="Volcanic"
          />
          {/* Thai */}
          <button
            onClick={() => handleOpenTerritory('THAI')}
            className="w-[18%] h-full rounded-2xl hover:scale-105 transition-transform focus:outline-none cursor-pointer"
            title="Legendary Forest (Thai Language)"
            aria-label="Thai"
          />
        </div>

        {/* Bottom Quick Resources Row */}
        <div className="absolute bottom-[3.5%] left-[6.5%] w-[87%] h-[9%] flex items-center justify-between">
          <button
            onClick={() => setShowGuideModal(true)}
            className="w-[18%] h-full rounded-xl hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
            title="คู่มือ (Guide)"
            aria-label="Guide Resource"
          />
          <button
            onClick={() => setShowGuideModal(true)}
            className="w-[18%] h-full rounded-xl hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
            title="เอกสารการเรียน (Documents)"
            aria-label="Documents Resource"
          />
          <button
            onClick={() => handleEnterAction('PROFESSOR')}
            className="w-[18%] h-full rounded-xl hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
            title="อาจารย์ / ห้องพักครู (Professor Help)"
            aria-label="Professor Help"
          />
          <button
            onClick={() => handleEnterAction('LEARNER')}
            className="w-[18%] h-full rounded-xl hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
            title="นักเรียน / ศูนย์การเรียนรู้ (Learner Help)"
            aria-label="Learner Help"
          />
          <button
            onClick={() => setShowGuideModal(true)}
            className="w-[18%] h-full rounded-xl hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
            title="ศูนย์ช่วยเหลือ (Support Center)"
            aria-label="Support Center"
          />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 3. LAYER 3: MOBILE INTERACTIVE HIT AREAS (< 768px)               */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden absolute inset-0 z-30 pointer-events-auto">
        
        {/* Mobile Top-Right Menu Burger */}
        <button
          onClick={() => setShowGuideModal(true)}
          className="absolute top-[2.5%] right-[4.5%] w-[15%] h-[6%] rounded-2xl hover:bg-white/10 transition-colors focus:outline-none cursor-pointer min-h-[44px]"
          title="Menu"
          aria-label="Menu"
        />

        {/* Mobile Role Selector: Professor / Learner */}
        <div className="absolute top-[47%] left-[26%] w-[48%] h-[11%] flex items-center justify-between">
          <button
            onClick={() => {
              setSelectedRole('PROFESSOR');
              handleEnterAction('PROFESSOR');
            }}
            className={`w-[48%] h-full rounded-2xl transition-all focus:outline-none cursor-pointer ${
              selectedRole === 'PROFESSOR' ? 'bg-amber-400/20 ring-2 ring-amber-400' : 'hover:bg-white/10'
            }`}
            title="Professor"
            aria-label="Select Professor"
          />
          <button
            onClick={() => {
              setSelectedRole('LEARNER');
              handleEnterAction('LEARNER');
            }}
            className={`w-[48%] h-full rounded-2xl transition-all focus:outline-none cursor-pointer ${
              selectedRole === 'LEARNER' ? 'bg-cyan-400/20 ring-2 ring-cyan-400' : 'hover:bg-white/10'
            }`}
            title="Learner"
            aria-label="Select Learner"
          />
        </div>

        {/* Mobile Primary Button: Login / Enter to Academic World */}
        <button
          onClick={() => handleEnterAction(selectedRole)}
          className="absolute top-[60%] left-[13%] w-[74%] h-[8%] rounded-full hover:brightness-110 active:scale-98 transition-all focus:outline-none focus:ring-4 focus:ring-amber-400/60 cursor-pointer shadow-lg min-h-[48px]"
          title="เข้าสู่ดินแดนแห่งปัญญา (Login to Academic World)"
          aria-label="Login to Academic World"
        />

        {/* Mobile Bottom: Guide Card */}
        <button
          onClick={() => setShowGuideModal(true)}
          className="absolute bottom-[4.5%] left-[4.5%] w-[43%] h-[20%] rounded-3xl hover:scale-102 transition-transform focus:outline-none cursor-pointer"
          title="คู่มือ (Guide)"
          aria-label="Mobile Guide"
        />

        {/* Mobile Bottom: Library Card */}
        <button
          onClick={() => handleOpenTerritory('ARCTIC')}
          className="absolute bottom-[4.5%] right-[4.5%] w-[43%] h-[20%] rounded-3xl hover:scale-102 transition-transform focus:outline-none cursor-pointer"
          title="คลังความรู้ & ดินแดน (Library & Territories)"
          aria-label="Mobile Library"
        />
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 4. MODALS: GUIDE & TERRITORY (z-50)                              */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {showGuideModal && (
        <HowToPlayModal
          isOpen={showGuideModal}
          onClose={() => setShowGuideModal(false)}
        />
      )}

      {showTerritoryModal && (
        <TerritoryDetailModal
          territoryKey={activeTerritoryKey}
          isOpen={showTerritoryModal}
          onClose={() => setShowTerritoryModal(false)}
          onEnterArctic={() => {
            setShowTerritoryModal(false);
            handleEnterAction('LEARNER');
          }}
        />
      )}
    </div>
  );
};
