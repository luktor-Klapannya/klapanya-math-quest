import React from 'react';
import {CombatArenaView} from '../components/CombatArenaView';
import {DEFAULT_PROFILE} from '../../storage/local-storage-adapter';
import {BOSS_CITADELS,getBossQuestions} from '../../content/boss-database';
export function SafeBossPreview(){
 const boss=BOSS_CITADELS[0],question=getBossQuestions('BOSS-1','PHASE_1')[0];
 const profile={...DEFAULT_PROFILE,level:12,xp:4280,coins:350,heroName:'ผู้กล้าตัวอย่าง'};
 return <section className="safe-boss-preview" aria-label="ตัวอย่าง Hero ต่อสู้ Boss"><div className="preview-safety-banner"><strong>ACTUAL COMBAT COMPOSITION</strong><span>NO WRITE · ไม่บันทึกคะแนน XP Mastery หรือ Progress</span></div><div className="safe-boss-stage"><div className="safe-boss-hud"><span>ปราสาทมหาบอส · Phase 1</span><strong>⚔️ HERO + BOSS FIGHT</strong><span>ข้อ 1 / 5</span></div><CombatArenaView profile={profile} targetName={boss.thaiName} targetMaxHp={boss.maxHp} targetCurrentHp={Math.round(boss.maxHp*.72)} bossId={boss.id} heroEmote="ATTACK" bossState="HIT_LIGHT" damagePopups={[]} prefersReducedMotion/><div className="safe-question-card"><p>โจทย์ตัวอย่างจากคลังจริง</p><h4>{question.questionText}</h4><div>{question.options.map(option=><button key={option.id} disabled><b>{option.id}</b> {option.text}</button>)}</div></div></div></section>;
}