import React, { useState } from 'react';
import { ArrowRight, BookOpen, Calendar, Coins, Compass, Flame, GraduationCap, Lightbulb, LogOut, Mail, Map, Play, Shield, Swords, Target } from 'lucide-react';
import { PlayerProfile } from '../../types';
import { StudentSession } from '../../types/auth';
import { Assignment } from '../../types/assignment';
import { authSession } from '../../auth/session';
import { assignmentService } from '../../services/assignment-service';
import { HERO_CLASSES } from '../../progression/hero-classes';
import { HeroCharacterArt } from '../components/HeroCharacterArt';
import './student-home.css';

interface StudentHomeScreenProps {
  session: StudentSession;
  profile: PlayerProfile;
  onNavigateToMap: () => void;
  onNavigateToTutor: (stageId?: string) => void;
  onNavigateToDrill: (drillType?: string) => void;
  onNavigateToDailyQuest: () => void;
  onNavigateToBattle: () => void;
  onOpenCodex: () => void;
  onOpenMarket: () => void;
  onOpenInventory: () => void;
  onOpenAvatarSelect: () => void;
  onLogout: () => void;
}

const CAMPAIGN_STAGE_COUNT = 17;

export const StudentHomeScreen: React.FC<StudentHomeScreenProps> = ({ session, profile, onNavigateToMap, onNavigateToTutor, onNavigateToDrill, onNavigateToDailyQuest, onNavigateToBattle, onOpenCodex, onOpenMarket, onOpenInventory, onOpenAvatarSelect, onLogout }) => {
  const [showAssignments, setShowAssignments] = useState(false);
  const [backgroundFailed, setBackgroundFailed] = useState(false);
  const heroClass = HERO_CLASSES[profile.heroId];
  const assignmentsAvailable = authSession.getAdapterMode() === 'mock';
  const assignments = assignmentsAvailable ? assignmentService.getAssignments(session.classRoomId) : [];
  const clearedCount = Math.min(profile.clearedStages.length, CAMPAIGN_STAGE_COUNT);
  const progressPercent = Math.round((clearedCount / CAMPAIGN_STAGE_COUNT) * 100);
  const shortcuts = [
    { title: 'คู่มือเริ่มเล่น', detail: 'รู้จักโลกและวิธีเล่น', icon: BookOpen, action: onOpenCodex },
    { title: 'คัมภีร์สูตรลัด', detail: 'ทบทวนก่อนออกเดินทาง', icon: Lightbulb, action: onOpenCodex },
    { title: 'สนามฝึกซ้อม', detail: 'ฝึกทักษะให้มั่นใจ', icon: Target, action: () => onNavigateToDrill() },
    { title: 'ห้องติวพิเศษ', detail: 'เลือกหัวข้อที่อยากเรียน', icon: GraduationCap, action: () => onNavigateToTutor() },
    { title: 'สกิลและไอเทม', detail: 'เตรียมอุปกรณ์ของผู้กล้า', icon: Shield, action: onOpenInventory },
    { title: 'สนามประลอง', detail: 'เข้าร่วมกิจกรรมในห้องเรียน', icon: Swords, action: onNavigateToBattle },
  ];

  const openAssignment = (assignment: Assignment) => {
    if (assignment.assignmentType === 'TUTOR') onNavigateToTutor(assignment.targetStageId);
    else if (assignment.assignmentType === 'DRILL') onNavigateToDrill(assignment.targetDrillSkillTag);
    else if (assignment.assignmentType === 'DAILY_QUEST') onNavigateToDailyQuest();
    else onNavigateToMap();
  };

  return (
    <div className="student-home">
      {!backgroundFailed && <picture className="student-home__background"><source media="(min-width:768px)" srcSet="/backgrounds/hubs/student-hub-desktop.png" /><img src="/backgrounds/hubs/student-hub-mobile.png" alt="" onError={() => setBackgroundFailed(true)} /></picture>}
      <div className="student-home__shade" aria-hidden="true" />
      <a className="student-home__skip" href="#student-content">ข้ามไปยังเนื้อหา</a>
      <div className="student-home__shell">
        <header className="student-home__header">
          <div className="student-home__brand"><img src="/brand/logo.png" alt="โรงเรียนกล้าปัญญา" width="44" height="44" /><span>THE WISDOM ACADEMY<small>พื้นที่การเรียนรู้ของนักเรียน</small></span></div>
          <div className="student-home__account">
            <button onClick={onOpenMarket} className="student-home__coins" aria-label={`ร้านค้า เหรียญสะสม ${profile.coins.toLocaleString()} เหรียญ`}><Coins size={18} /><span>{profile.coins.toLocaleString()}</span></button>
            <button onClick={onLogout} className="student-home__icon-button" aria-label="ออกจากระบบ"><LogOut size={20} /></button>
          </div>
        </header>

        <main id="student-content" tabIndex={-1}>
          <div className="student-home__welcome">
            <div><h1>สวัสดี, {session.studentName || profile.heroName || 'นักผจญภัย'}</h1><p>พร้อมเรียนรู้สิ่งใหม่ในการผจญภัยวันนี้หรือยัง?</p></div>
            <button onClick={onOpenAvatarSelect} className="student-home__profile"><HeroCharacterArt avatarId={profile.avatarVisualId || 'BOY_WIZARD'} size="sm" mode="PORTRAIT" /><span>{profile.heroName || 'ผู้กล้าของฉัน'}<small>{heroClass.name} · เลเวล {profile.level}</small></span><ArrowRight size={18} /></button>
          </div>

          <section className="student-home__adventure" aria-labelledby="student-adventure-title">
            <div className="student-home__adventure-copy">
              <h2 id="student-adventure-title">การผจญภัยของเธอ<br /><span>เริ่มได้อีกครั้งวันนี้</span></h2>
              <p>สำรวจ Arctic World ฝึกคณิตศาสตร์<br className="student-home__desktop-break" /> และค่อย ๆ ก้าวไปข้างหน้าในแบบของเธอ</p>
              <button onClick={onNavigateToMap} className="student-home__primary"><Play size={20} fill="currentColor" />{clearedCount > 0 ? 'ผจญภัยต่อ' : 'เริ่มผจญภัย'}<ArrowRight size={20} /></button>
              <button onClick={onNavigateToMap} className="student-home__map-link"><Map size={18} />เปิดแผนที่การเรียนรู้</button>
            </div>
            <div className="student-home__hero" aria-hidden="true"><HeroCharacterArt avatarId={profile.avatarVisualId || 'BOY_WIZARD'} size="xl" role="FULL_BODY_ART" /></div>
            <div className="student-home__realm"><Compass size={18} /><span>Arctic World<small>ดินแดนคณิตศาสตร์</small></span></div>
          </section>

          <div className="student-home__columns">
            <section className="student-home__activities" aria-labelledby="student-activities-title">
              <h2 id="student-activities-title">วันนี้อยากเรียนรู้แบบไหน?</h2>
              <div className="student-home__shortcut-grid">{shortcuts.map(({ title, detail, icon: Icon, action }) => <button key={title} onClick={action} className="student-home__shortcut"><Icon size={23} /><span>{title}<small>{detail}</small></span><ArrowRight size={17} /></button>)}</div>
              <section className="student-home__assignments">
                <button className="student-home__assignment-toggle" onClick={() => setShowAssignments(!showAssignments)} aria-expanded={showAssignments} aria-controls="student-assignment-list"><Mail size={21} /><span>งานเกมจากคุณครู{assignments.length > 0 && <small> {assignments.length} งาน</small>}</span><span>{showAssignments ? 'ย่อรายการ' : 'ดูงาน'}</span></button>
                {showAssignments && <div id="student-assignment-list" className="student-home__assignment-list">
                  {assignments.length === 0 && <p>{assignmentsAvailable ? 'ยังไม่มีงานใหม่ ระหว่างนี้เลือกฝึกหรือออกผจญภัยได้เลย' : 'หน้านี้ยังไม่รองรับการแสดงงานจากครูในบัญชีออนไลน์'}</p>}
                  {assignments.map(assignment => <button key={assignment.id} onClick={() => openAssignment(assignment)} className="student-home__assignment"><strong>{assignment.title}</strong><span>{assignment.description}</span><small><Calendar size={14} />กำหนดส่ง {assignment.dueDate}</small><span className="student-home__assignment-open">เปิดงาน <ArrowRight size={16} /></span></button>)}
                </div>}
              </section>
            </section>

            <aside className="student-home__journey" aria-label="ความคืบหน้าและภารกิจประจำวัน">
              <section className="student-home__progress"><h2>เส้นทางของฉัน</h2><div className="student-home__progress-heading"><span>ผ่านแล้ว {clearedCount} จาก {CAMPAIGN_STAGE_COUNT} ด่าน</span><strong>{progressPercent}%</strong></div><progress value={clearedCount} max={CAMPAIGN_STAGE_COUNT} aria-label="ความคืบหน้าด่านในแคมเปญ">{progressPercent}%</progress><dl><div><dt>XP สะสม</dt><dd>{profile.xp.toLocaleString()}</dd></div><div><dt>อันดับผู้กล้า</dt><dd>{profile.rank}</dd></div></dl></section>
              <button onClick={onNavigateToDailyQuest} className="student-home__daily"><Flame size={25} /><span><strong>ภารกิจประจำวัน</strong><span>ฝึกประจำวัน 15 ข้อ</span><small>ทำต่อเนื่อง {profile.dailyQuestStreak || 0} วัน</small></span><ArrowRight size={20} /></button>
            </aside>
          </div>
        </main>
        <footer className="student-home__footer"><span>ทุกก้าวของการเรียนรู้มีความหมาย</span><span>Klapanya E-Learning</span></footer>
      </div>
    </div>
  );
};
