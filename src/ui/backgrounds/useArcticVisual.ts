import {useEffect,useState,useSyncExternalStore} from 'react';
import {authSession} from '../../auth/session';
import {getSupabaseClient} from '../../lib/supabaseClient';
import {readArctic,resolveArcticVisuals} from '../../services/arctic-configuration-service';
import type {ArcticSlot} from '../../services/arctic-visual-slots';
const subscribe=(listener:()=>void)=>authSession.subscribe(listener);
const snapshot=()=>authSession.getCurrentUser();
// Presentation is account scoped, never persisted in a shared-browser cache.
export function useArcticVisual(slot?:ArcticSlot) {
 const owner=useSyncExternalStore(subscribe,snapshot,snapshot);
 const [resolved,setResolved]=useState<{owner:typeof owner;slot:ArcticSlot;url:string}|null>(null);
 useEffect(()=>{
  let active=true;let request=0;setResolved(null);
  const client=getSupabaseClient();
  if(!slot||!client||authSession.getAdapterMode()!=='supabase'||owner?.status!=='ACTIVE'||!owner.organizationId)return;
  const load=async()=>{
   const current=++request;
   try{
    const config=await readArctic(client,owner.organizationId!);
    const urls=await resolveArcticVisuals(client,{...config,visuals:{[slot]:config.visuals[slot]}});
    const url=urls[slot];
    if(!url){if(active&&current===request)setResolved(null);return;}
    const image=new Image();
    const loaded=await new Promise<boolean>(resolve=>{const timer=setTimeout(()=>resolve(false),10000);image.onload=()=>{clearTimeout(timer);resolve(true);};image.onerror=()=>{clearTimeout(timer);resolve(false);};image.src=url;});
    if(active&&current===request&&authSession.getCurrentUser()===owner)setResolved(loaded?{owner,slot,url}:null);
   }catch{if(active&&current===request)setResolved(null);}
  };
  void load();const refresh=()=>{void load();};const timer=setInterval(refresh,45*60*1000);
  window.addEventListener('focus',refresh);window.addEventListener('arctic-visuals-saved',refresh);
  return()=>{active=false;clearInterval(timer);window.removeEventListener('focus',refresh);window.removeEventListener('arctic-visuals-saved',refresh);};
 },[owner,slot]);
 return resolved?.owner===owner&&resolved?.slot===slot?resolved.url:undefined;
}
export function useArcticBackground(slot:ArcticSlot) {
 const url=useArcticVisual(slot);
 return url?{backgroundImage:`linear-gradient(rgba(3,7,18,.45),rgba(3,7,18,.65)),url("${url}")`,backgroundSize:'cover',backgroundPosition:'center'}:undefined;
}
