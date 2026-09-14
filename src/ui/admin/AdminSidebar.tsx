import React,{useState} from 'react';
import {useAdminLocale} from './locale';

export type AdminDestinationKey='DASHBOARD'|'LIBRARY'|'CONTENT_BUILDER'|'ASSIGN_PUBLISH'|'WEB_LANDING'|'WEB_LOGIN'|'WEB_TERRITORY'|'WEB_TEACHER_HOME'|'WEB_GUIDE'|'WEB_PUBLIC_LIBRARY'|'WEB_PORTAL_HOME'|'GAMES'|'EDIT_GAME'|'ASSETS'|'PREVIEW_PUBLISH'|'USERS'|'ANALYTICS';
export interface AdminDestination {key:AdminDestinationKey;label:string;implemented:boolean}
export interface AdminNavGroup {key:string;label:string;direct?:AdminDestinationKey;defaultDestination?:AdminDestinationKey;items:readonly AdminDestination[]}

export const ADMIN_NAVIGATION:readonly AdminNavGroup[]=[
 {key:'DASHBOARD_GROUP',label:'Dashboard',direct:'DASHBOARD',items:[{key:'DASHBOARD',label:'Dashboard',implemented:true}]},
 {key:'ELEARNING',label:'E-learning',items:[
  {key:'LIBRARY',label:'Library',implemented:true},{key:'CONTENT_BUILDER',label:'Content Builder',implemented:true},{key:'ASSIGN_PUBLISH',label:'Assign & Publish',implemented:false},
 ]},
 {key:'WEB_MASTER',label:'Web Master',defaultDestination:'WEB_LANDING',items:[
  {key:'WEB_LANDING',label:'Landing Page',implemented:true},{key:'WEB_LOGIN',label:'Login / Role Entry',implemented:true},{key:'WEB_TERRITORY',label:'Territory Select',implemented:true},{key:'WEB_TEACHER_HOME',label:'Teacher Game Home',implemented:true},{key:'WEB_GUIDE',label:'Guide / How to Play',implemented:true},{key:'WEB_PUBLIC_LIBRARY',label:'Public Game Library',implemented:false},{key:'WEB_PORTAL_HOME',label:'Student Game Home',implemented:true},
 ]},
 {key:'GAME_STUDIO',label:'Game Studio',items:[
  {key:'GAMES',label:'Games',implemented:true},{key:'EDIT_GAME',label:'Edit Game',implemented:true},{key:'ASSETS',label:'Assets',implemented:true},{key:'PREVIEW_PUBLISH',label:'Preview & Publish',implemented:true},
 ]},
 {key:'USERS_GROUP',label:'Users',direct:'USERS',items:[{key:'USERS',label:'Users',implemented:true}]},
 {key:'ANALYTICS_GROUP',label:'Analytics',direct:'ANALYTICS',items:[{key:'ANALYTICS',label:'Analytics',implemented:true}]},
] as const;

export const findAdminDestination=(key:AdminDestinationKey)=>{
 for(const group of ADMIN_NAVIGATION){const item=group.items.find(item=>item.key===key);if(item)return {group,item};}
 return {group:ADMIN_NAVIGATION[0],item:ADMIN_NAVIGATION[0].items[0]};
};

export function AdminSidebar({active,onSelect,open,onClose}:{active:AdminDestinationKey;onSelect:(key:AdminDestinationKey)=>void;open:boolean;onClose:()=>void}){
 const {t}=useAdminLocale();
 const activeGroup=findAdminDestination(active).group.key;
 const [collapsed,setCollapsed]=useState<Record<string,boolean>>({});
 const choose=(key:AdminDestinationKey)=>{onSelect(key);onClose();};
 return <>
  {open&&<button className="admin-nav-scrim" aria-label={t('Close navigation')} onClick={onClose}/>}
  <aside id="admin-sidebar" className={`admin-sidebar ${open?'is-open':''}`} aria-label={t('Admin navigation')}>
   <div className="admin-sidebar-title"><strong>Klapanya Admin</strong><button className="admin-sidebar-close" onClick={onClose} aria-label={t('Close navigation')}>×</button></div>
   <nav className="admin-primary-nav">{ADMIN_NAVIGATION.map(group=>{
    if(group.direct)return <button key={group.key} className="admin-primary-link" aria-current={active===group.direct?'page':undefined} onClick={()=>choose(group.direct!)}>{t(group.label)}</button>;
    const isCollapsed=collapsed[group.key]&&!group.items.some(item=>item.key===active);
    return <section className="admin-nav-group" key={group.key}>
     <button className={`admin-nav-group-toggle ${activeGroup===group.key?'is-active':''}`} aria-expanded={!isCollapsed} onClick={()=>{if(group.defaultDestination&&activeGroup!==group.key){onSelect(group.defaultDestination);setCollapsed(value=>({...value,[group.key]:false}));}else setCollapsed(value=>({...value,[group.key]:!value[group.key]}));}}><span>{t(group.label)}</span><span aria-hidden="true">{isCollapsed?'＋':'−'}</span></button>
    {!isCollapsed&&!(group.key==='WEB_MASTER'&&activeGroup===group.key)&&<div className="admin-nav-items">{group.items.map(item=><button key={item.key} className="admin-nav-item" aria-current={active===item.key?'page':undefined} onClick={()=>choose(item.key)}><span>{t(item.label)}</span>{!item.implemented&&<small>{t('Later')}</small>}</button>)}</div>}
    </section>;
   })}</nav>
  </aside>
 </>;
}
