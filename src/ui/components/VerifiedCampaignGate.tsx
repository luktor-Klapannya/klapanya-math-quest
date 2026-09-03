import React,{useEffect,useState} from 'react';
import {campaignRequest} from '../../services/campaign-client';
import type {PlayerProfile} from '../../types';
export function VerifiedCampaignGate({owner,stageId,heroId,children,onExit}:{owner:string;stageId:string;heroId:PlayerProfile['heroId'];children:(sessionId:string)=>React.ReactNode;onExit:()=>void}){
 const [sessionId]=useState(()=>crypto.randomUUID());const [ready,setReady]=useState(false);const [error,setError]=useState(false);const [retry,setRetry]=useState(0);
 useEffect(()=>{
  let cancelled=false;setReady(false);setError(false);
  campaignRequest('start',{sessionId,stageId,heroId},owner).then(()=>{if(!cancelled)setReady(true);}).catch(()=>{if(!cancelled)setError(true);});
  return()=>{cancelled=true;};
 },[owner,sessionId,stageId,heroId,retry]);
 if(ready)return <>{children(sessionId)}</>;
 return <div className="p-8 text-slate-100 space-y-4" role="status"><p>{error?'เริ่มรอบที่ยืนยันไม่ได้ กรุณาตรวจสอบการเชื่อมต่อและด่านที่ผ่านการยืนยันแล้ว':'กำลังเตรียมรอบเล่น…'}</p>
 {error&&<button className="min-h-[44px] px-4 bg-cyan-800 rounded" onClick={()=>setRetry(n=>n+1)}>ลองอีกครั้ง</button>}
 <button className="min-h-[44px] px-4 bg-slate-800 rounded" onClick={onExit}>กลับแผนที่</button></div>;
}
