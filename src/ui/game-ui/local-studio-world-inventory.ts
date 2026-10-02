import { DOJO_STAGES } from '../../content/dojo-database';
import { SHRINE_STAGES } from '../../content/shrine-database';
import { GATEWAY_STAGES } from '../../content/onet-database';
import { BOSS_CITADELS } from '../../content/boss-database';
import { SCENE_ASSET_REGISTRY, type SceneAssetKey } from '../assets/sceneAssetRegistry';

export type CoverageStatus='NATIVE'|'FALLBACK'|'MISSING'|'DRAFT'|'UNKNOWN';
export type CoverageFilter='ALL'|'MISSING_BACKGROUND'|'MISSING_MOBILE'|'MISSING_TABLET'|'FALLBACK'|'COMPLETE';
export type InventoryDevice='DESKTOP'|'TABLET'|'MOBILE';
export interface WorldScene {id:string;territory:string;level:string;activity:string;sceneKey:SceneAssetKey|null;screenKey:string;shell:string;notes?:string}
export interface BackgroundEntry {sceneKey:SceneAssetKey;territory:string;level:string;shell:string;screenKeys:readonly string[];desktop:string;tablet:string;mobile:string;desktopStatus:CoverageStatus;tabletStatus:CoverageStatus;mobileStatus:CoverageStatus;status:CoverageStatus;source:string}

const scene=(id:string,level:string,activity:string,sceneKey:SceneAssetKey|null,screenKey:string,shell=screenKey,notes?:string):WorldScene=>({id,territory:'Arctic World',level,activity,sceneKey,screenKey,shell,notes});
export const ARCTIC_WORLD_SCENES:readonly WorldScene[]=Object.freeze([
 scene('hero-select','World entry','Hero Selection','ARCTIC_HERO_SELECT','HERO_SELECT'),
 scene('world-map','World','World Map','ARCTIC_MAP','MAP'),
 scene('stage-detail','Shared','Stage Detail',null,'STAGE_DETAIL','STAGE_DETAIL','No dedicated background is registered.'),
 scene('tutor-library','Shared','Tutor / Library',null,'TUTOR_ROOM','TUTOR','No Arctic-specific background is registered.'),
 scene('drill','Shared','Drill','ARCTIC_DOJO','DRILL_CENTER'),
 ...DOJO_STAGES.map(stage=>scene(`dojo-${stage.id}`,stage.id,stage.name,'ARCTIC_DOJO','DOJO_BATTLE')),
 ...SHRINE_STAGES.map(stage=>scene(`farming-${stage.id}`,stage.id,stage.name,'ARCTIC_FARMING','SHRINE_BATTLE')),
 ...GATEWAY_STAGES.map(stage=>scene(`onet-${stage.id}`,stage.id,stage.name,'ARCTIC_ONET','GATEWAY_EXAM')),
 scene('geometry','Special','Geometry','ARCTIC_GEOMETRY','GEOMETRY'),
 scene('quest','Special','Quest / Word Problem','ARCTIC_QUEST','QUEST_BOARD'),
 ...BOSS_CITADELS.map((stage,index)=>scene(`boss-${stage.id}`,stage.id,stage.name,(['ARCTIC_BOSS_DRAGON','ARCTIC_BOSS_GOLEM','ARCTIC_BOSS_ARCHMAGE'] as const)[index]||'ARCTIC_BOSS_DRAGON','BOSS_BATTLE')),
 scene('final','Final','Final Trial','ARCTIC_FINAL','FINAL_TRIAL'),
 scene('result','Shared','Result','ARCTIC_RESULT','DOJO_RESULT','RESULT'),
 scene('ceremony','Final','Ceremony','ARCTIC_RESULT','TOP_FORM_CEREMONY','CEREMONY'),
 scene('arena-lobby','Arena','Arena Lobby','ARCTIC_ARENA','BATTLE_LOBBY'),
 scene('classroom-arena','Arena','Classroom Arena','ARCTIC_ARENA','CLASSROOM_BATTLE'),
 scene('market','Shared','Market visual slot','ARCTIC_MAP','MARKET','GENERIC'),
]);

const usage:Record<SceneAssetKey,{territory:string;level:string;shell:string;screens:string[]}>= {
 PORTAL:{territory:'Public',level:'Entry',shell:'LANDING',screens:['LANDING']},LOGIN:{territory:'Public',level:'Entry',shell:'LOGIN',screens:['LOGIN','STUDENT_LOGIN','TEACHER_LOGIN','PASSWORD_RECOVERY']},GUIDE:{territory:'Public',level:'Guide',shell:'PUBLIC_GUIDE',screens:['PUBLIC_GUIDE','HOW_TO_PLAY']},TERRITORY:{territory:'Public',level:'Territory entry',shell:'TERRITORY_SELECT',screens:['TERRITORY_SELECT']},
 ARCTIC_HERO_SELECT:{territory:'Arctic World',level:'World entry',shell:'HERO_SELECT',screens:['HERO_SELECT']},ARCTIC_MAP:{territory:'Arctic World',level:'World / Market',shell:'MAP',screens:['MAP','MARKET']},ARCTIC_DOJO:{territory:'Arctic World',level:'D1–D6 / Drill',shell:'DOJO_BATTLE',screens:['DOJO_BATTLE','DRILL_CENTER','DRILL_SESSION']},ARCTIC_FARMING:{territory:'Arctic World',level:'F1–F4',shell:'SHRINE_BATTLE',screens:['SHRINE_BATTLE']},ARCTIC_ONET:{territory:'Arctic World',level:'ONET-1–ONET-4',shell:'GATEWAY_EXAM',screens:['GATEWAY_EXAM']},ARCTIC_GEOMETRY:{territory:'Arctic World',level:'Special',shell:'GEOMETRY',screens:['GEOMETRY']},ARCTIC_QUEST:{territory:'Arctic World',level:'Special',shell:'QUEST_BOARD',screens:['QUEST_BOARD']},ARCTIC_ARENA:{territory:'Arctic World',level:'Arena',shell:'CLASSROOM_BATTLE',screens:['BATTLE_LOBBY','CLASSROOM_BATTLE']},ARCTIC_BOSS_DRAGON:{territory:'Arctic World',level:'BOSS-1',shell:'BOSS_BATTLE',screens:['BOSS_BATTLE']},ARCTIC_BOSS_GOLEM:{territory:'Arctic World',level:'BOSS-2',shell:'BOSS_BATTLE',screens:['BOSS_BATTLE']},ARCTIC_BOSS_ARCHMAGE:{territory:'Arctic World',level:'BOSS-3',shell:'BOSS_BATTLE',screens:['BOSS_BATTLE']},ARCTIC_FINAL:{territory:'Arctic World',level:'Final',shell:'FINAL_TRIAL',screens:['FINAL_TRIAL']},ARCTIC_RESULT:{territory:'Arctic World',level:'Result / Ceremony',shell:'RESULT',screens:['DOJO_RESULT','SHRINE_RESULT','GATEWAY_RESULT','BOSS_RESULT','TOP_FORM_CEREMONY']},
};
const deviceStatus=(path:string,desktop:string):CoverageStatus=>!path?'MISSING':path===desktop?'FALLBACK':'NATIVE';
export const BACKGROUND_GALLERY:readonly BackgroundEntry[]=Object.freeze((Object.keys(SCENE_ASSET_REGISTRY) as SceneAssetKey[]).map(sceneKey=>{const asset=SCENE_ASSET_REGISTRY[sceneKey],meta=usage[sceneKey];const tabletStatus=deviceStatus(asset.tablet,asset.desktop),mobileStatus=deviceStatus(asset.mobile,asset.desktop),desktopStatus:CoverageStatus=asset.desktop?'NATIVE':'MISSING',status:CoverageStatus=!asset.desktop||!asset.tablet||!asset.mobile?'MISSING':tabletStatus==='FALLBACK'||mobileStatus==='FALLBACK'?'FALLBACK':'NATIVE';return {sceneKey,territory:meta.territory,level:meta.level,shell:meta.shell,screenKeys:meta.screens,desktop:asset.desktop,tablet:asset.tablet,mobile:asset.mobile,desktopStatus,tabletStatus,mobileStatus,status,source:`SCENE_ASSET_REGISTRY.${sceneKey}`}}));
export const backgroundFor=(item:WorldScene)=>item.sceneKey?BACKGROUND_GALLERY.find(entry=>entry.sceneKey===item.sceneKey):undefined;
export function matchesCoverageFilter(item:WorldScene,filter:CoverageFilter){const bg=backgroundFor(item);if(filter==='MISSING_BACKGROUND')return !bg||bg.desktopStatus==='MISSING';if(filter==='MISSING_MOBILE')return !bg||bg.mobileStatus==='MISSING';if(filter==='MISSING_TABLET')return !bg||bg.tabletStatus==='MISSING';if(filter==='FALLBACK')return bg?.status==='FALLBACK';if(filter==='COMPLETE')return bg?.status==='NATIVE';return true}
export const previewLabel=(status:CoverageStatus)=>status==='NATIVE'?'RUNTIME ASSET':status==='FALLBACK'?'FALLBACK':status==='MISSING'?'MISSING':'REFERENCE ONLY';
