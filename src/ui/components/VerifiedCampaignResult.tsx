import React,{useEffect,useState} from 'react';
import {getSupabaseClient} from '../../lib/supabaseClient';
import {authSession} from '../../auth/session';
import {flushGameEvidence} from '../../services/game-evidence';
import {ResultScreen} from '../screens/ResultScreen';
import type {StageSessionResult} from '../../types';
export function VerifiedCampaignResult({sessionId,owner,onExit}:{sessionId:string;owner:string;onExit:()=>void}){
 const [result,setResult]=useState<StageSessionResult|null>(null);const [busy,setBusy]=useState(false);const [reload,setReload]=useState(0);
 useEffect(()=>{
  let cancelled=false;setResult(null);setBusy(true);
  const load=async()=>{
   try{await flushGameEvidence(owner);}catch{/* Retained outbox; never display client totals as final. */}
   const row=await getSupabaseClient()?.from('game_session_results').select('result').eq('session_id',sessionId).maybeSingle();
   if(!cancelled&&authSession.getCurrentUser()?.id===owner){if(!row?.error&&row?.data)setResult(row.data.result);setBusy(false);}
  };
  void load();
  return()=>{cancelled=true;};
 },[sessionId,owner,reload]);
 if(result&&authSession.getCurrentUser()?.id===owner)return <ResultScreen result={result} onReturnToMap={onExit}/>;
 return <div className="p-8 text-slate-100 space-y-4" role="status"><p>{busy?'กำลังยืนยันผลรอบเล่น…':'ผลยังไม่ยืนยัน หลักฐานที่บันทึกไว้จะส่งซ้ำเมื่อเชื่อมต่อได้'}</p>
 <button disabled={busy} className="min-h-[44px] px-4 bg-cyan-800 rounded" onClick={()=>setReload(n=>n+1)}>ส่งซ้ำ / ตรวจผล</button>
 <button className="min-h-[44px] px-4 bg-slate-800 rounded" onClick={onExit}>กลับแผนที่</button></div>;
}
