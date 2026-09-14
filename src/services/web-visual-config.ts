import {useSyncExternalStore} from 'react';

export type WebVisualPage='LOGIN'|'TERRITORY'|'GUIDE'|'TEACHER_HOME';
export type WebVisualDevice='desktop'|'mobile';
export interface WebVisualConfig{desktop:string;mobile:string;fit:'cover'|'contain'}

export const WEB_VISUAL_DEFAULTS:Record<WebVisualPage,WebVisualConfig>={
 LOGIN:{desktop:'/backgrounds/portal/login-gateway-clean-desktop.png',mobile:'/backgrounds/portal/login-gateway-clean-mobile.png',fit:'cover'},
 TERRITORY:{desktop:'/backgrounds/portal/territory_desktop.jpg',mobile:'/backgrounds/portal/territory_mobile.jpg',fit:'cover'},
 GUIDE:{desktop:'/backgrounds/portal/guide-academy/academy_guide_desktop.png',mobile:'/backgrounds/portal/guide-academy/academy_guide_mobile.png',fit:'cover'},
 TEACHER_HOME:{desktop:'/backgrounds/portal/teacher-console-reference.png',mobile:'/game-bank/ready/backgrounds/fantasy-academy-star-courtyard-portrait.png',fit:'cover'},
};

const key=(page:WebVisualPage)=>`klapanya.web.visual.${page}.v2`;
const event='klapanya-web-visual-change';
export function readWebVisual(page:WebVisualPage):WebVisualConfig{
 if(typeof window==='undefined')return WEB_VISUAL_DEFAULTS[page];
 try{return {...WEB_VISUAL_DEFAULTS[page],...JSON.parse(localStorage.getItem(key(page))||'null')}}catch{return WEB_VISUAL_DEFAULTS[page]}
}
export function saveWebVisual(page:WebVisualPage,value:WebVisualConfig){
 localStorage.setItem(key(page),JSON.stringify(value));window.dispatchEvent(new CustomEvent(event,{detail:page}));
}
export function resetWebVisual(page:WebVisualPage){localStorage.removeItem(key(page));window.dispatchEvent(new CustomEvent(event,{detail:page}));}
const listen=(notify:()=>void)=>{const local=(e:Event)=>{if(!(e instanceof CustomEvent)||e.detail)notify()};window.addEventListener(event,local);window.addEventListener('storage',notify);return()=>{window.removeEventListener(event,local);window.removeEventListener('storage',notify)}};
export function useWebVisual(page:WebVisualPage){return useSyncExternalStore(listen,()=>JSON.stringify(readWebVisual(page)),()=>JSON.stringify(WEB_VISUAL_DEFAULTS[page]));}
export function parseWebVisual(snapshot:string):WebVisualConfig{return JSON.parse(snapshot)}
