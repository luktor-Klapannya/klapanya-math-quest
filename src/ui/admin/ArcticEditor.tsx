import React,{useEffect,useMemo,useState,useRef} from 'react';
import {getSupabaseClient} from '../../lib/supabaseClient';
import type {AdminIdentity} from '../../services/admin-console-service';
import {createArcticEditor,resolveArcticVisuals,type ArcticConfiguration} from '../../services/arctic-configuration-service';
import {ARCTIC_VISUAL_SLOTS,type ArcticSlot,type ArcticVisuals} from '../../services/arctic-visual-slots';
import {SCENE_ASSET_REGISTRY} from '../assets/sceneAssetRegistry';
import {adminRuntime} from '../components/AdminAccessGuard';
import {useAdminLocale} from './locale';
import {Tabs} from './shared';

export function ArcticEditor({identity}:{identity:AdminIdentity}) {
 const {language,t}=useAdminLocale();const client=getSupabaseClient();
 const editor=useMemo(()=>client?createArcticEditor(client,adminRuntime,identity):null,[client,identity]);
 const [config,setConfig]=useState<ArcticConfiguration|null>(null),[urls,setUrls]=useState<ArcticVisuals>({}),[tab,setTab]=useState('General');
 const [pending,setPending]=useState<Partial<Record<ArcticSlot,{file:File;url:string}>>>({});
 const previewUrls=useRef(new Set<string>());
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[status,setStatus]=useState(''),[revision,setRevision]=useState(0);
 useEffect(()=>{let active=true;setConfig(null);setError('');
  if(!editor||!client){setError('Supabase unavailable');return;}
  void editor.read().then(async value=>{const signed=await resolveArcticVisuals(client,value);if(active){setConfig(value);setUrls(signed);}}).catch(e=>{if(active)setError(e.message);});
  return()=>{active=false;};
 },[editor,client,revision]);
 useEffect(()=>()=>{previewUrls.current.forEach(url=>URL.revokeObjectURL(url));},[]);
 const persist=async(slot?:ArcticSlot)=>{
  if(!editor||!client||!config)return;
  setBusy(true);setError('');setStatus('');
  try{
   let next=config;
   if(slot&&pending[slot]){const path=await editor.upload(pending[slot]!.file);next={...config,visuals:{...config.visuals,[slot]:path}};}
   const saved=await editor.save(next);setConfig(saved);setUrls(await resolveArcticVisuals(client,saved));
   if(slot)setPending(previous=>{const next={...previous};delete next[slot];return next;});
   setStatus(t('Saved'));
  }catch(e){setError(e instanceof Error?e.message:'Save failed');}finally{setBusy(false);}
 };
 return <section aria-label="Existing Arctic"><h3>Game #001 → Arctic</h3>
  <Tabs items={['General','Visual']} value={tab} onChange={setTab} label="Arctic editor"/>
  {error&&<p role="alert">{error}</p>}{status&&<p role="status">{status}</p>}
  <button disabled={busy} onClick={()=>setRevision(v=>v+1)}>{t('Reload')}</button>
  {config&&tab==='General'&&<form onSubmit={e=>{e.preventDefault();void persist();}}>
   <h3>{t('Arctic metadata')}</h3><label>{t('Title')}<input required maxLength={200} value={config.title} disabled={busy} onChange={e=>setConfig({...config,title:e.target.value})}/></label>
   <label>{t('Description')}<textarea maxLength={2000} value={config.description} disabled={busy} onChange={e=>setConfig({...config,description:e.target.value})}/></label>
   <button disabled={busy}>{t(busy?'Saving…':'Save')}</button>
  </form>}
  {config&&tab==='Visual'&&<div className="arctic-visual-grid">{ARCTIC_VISUAL_SLOTS.map(slot=>{
   const saved=urls[slot.id]||SCENE_ASSET_REGISTRY[slot.asset].desktop;const selection=pending[slot.id];
   return <article key={slot.id}><h3>{language==='TH'?slot.th:slot.en}</h3>
    <p>{t('Current visual')}</p><img src={saved} alt={language==='TH'?slot.th:slot.en} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/academy_backdrop.jpg';}}/>
    <p>{t(config.visuals[slot.id]?'Uploaded':'Bundled fallback')}</p>
    <label>{t('Upload / Replace')}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={e=>{
     const file=e.target.files?.[0];if(!file)return;
     if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>10485760){setError('PNG / JPEG / WEBP ≤ 10 MB');return;}
     const url=URL.createObjectURL(file);previewUrls.current.add(url);
     setPending(previous=>({...previous,[slot.id]:{file,url}}));setStatus('');
    }}/></label>
    {selection&&<><p>{t('Unsaved preview')}</p><img src={selection.url} alt={t('Preview')}/></>}
    <button disabled={busy||!selection} onClick={()=>void persist(slot.id)}>{t(busy?'Saving…':'Save')}</button>
   </article>;
  })}</div>}
 </section>;
}
