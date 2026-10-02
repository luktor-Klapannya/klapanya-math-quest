import React from 'react';
import {getBossQuestions} from '../../content/boss-database';
import './arena-template-preview.css';

export function ArenaTemplatePreviewScreen(){
 const question=getBossQuestions('BOSS-1','PHASE_1')[0];
 return <main className="arena-template-preview">
  <header className="arena-topbar"><div className="arena-brand"><b>✦ KLAPANYA</b><small>THE WISDOM ACADEMY</small></div><div className="arena-title"><strong>ARCTIC ARENA</strong><span>ด่านฝึกต่อสู้ · 1 / 5</span></div><div className="arena-currencies"><span>⚡ 85/120</span><span>🪙 350</span><span>💎 25</span></div></header>
  <section className="arena-stage">
   <div className="arena-objective"><b>เป้าหมาย</b><span>ตอบถูก 3 ข้อเพื่อผ่านด่าน</span><strong>ความคืบหน้า 1 / 3</strong></div>
   <div className="arena-fighter hero"><div className="fighter-hp"><span>ผู้กล้ากล้าปัญญา</span><b>850 / 850</b></div><img src="/characters/heroes/hero_m_logic_paladin_fullbody.png" alt="อัศวินตรรกะ"/></div>
   <div className="arena-versus">VS</div>
   <div className="arena-fighter monster"><div className="fighter-hp"><span>อสูรน้ำแข็ง</span><b>1,200 / 1,200</b></div><img src="/characters/enemies/ice_monster_normal.png" alt="อสูรน้ำแข็ง"/></div>
   <aside className="arena-inspiration"><b>แรงบันดาลใจ</b><span>ความคิดที่กล้าหาญ เปล่งประกายเหมือนผลึกน้ำแข็ง</span></aside>
  </section>
  <section className="arena-learning-panel">
   <article className="arena-question"><div className="question-label">คำถาม 1 / 5</div><h1>{question.questionText}</h1><p>เลือกคำตอบที่ถูกต้อง</p></article>
   <div className="arena-answers">{question.options.map((option,index)=><button key={option.id}><b>{String.fromCharCode(65+index)}</b><span>{option.text}</span></button>)}</div>
   <aside className="arena-help"><button>💡 คำใบ้</button><div><b>แนวคิดสำคัญ</b><span>อ่านโจทย์ให้ครบ แล้วเลือกวิธีคำนวณทีละขั้น</span></div><button className="next" disabled>ข้อต่อไป →</button></aside>
  </section>
  <footer className="arena-footer"><button onClick={()=>{window.location.hash=''}}>← กลับหน้าหลัก</button><nav><span className="active">⚔️ Arena</span><span>📘 Tutor</span><span>🎯 Drill</span><span>🏰 Boss</span></nav><small>PREVIEW · ไม่บันทึกคะแนน</small></footer>
 </main>
}
