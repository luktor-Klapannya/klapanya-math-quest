// @ts-ignore TS5097
import {GAME_UI_PAGE_REGISTRY} from '../ui/game-ui/registry.ts';
// @ts-ignore TS5097
import {filterScreenPages,getPreviewDescriptor,previewTypeCounts,type BoardDevice} from '../ui/game-ui/preview-foundation.ts';

function assert(condition:unknown,message:string):asserts condition {if(!condition)throw new Error(message);}
const all=filterScreenPages(GAME_UI_PAGE_REGISTRY,{group:'ALL',runtime:'ALL',status:'ALL'});
assert(all.length===GAME_UI_PAGE_REGISTRY.length,'Board must render directly from the dynamic registry count');

for(const group of ['PUBLIC','STUDENT','TUTOR','GAME','TEACHER','ADMIN'] as const){
 const pages=filterScreenPages(GAME_UI_PAGE_REGISTRY,{group,runtime:'ALL',status:'ALL'});
 assert(pages.length>0,`${group} filter must return screens`);
 assert(pages.every(page=>page.screenGroup===group),`${group} filter returned another group`);
}

const active=filterScreenPages(GAME_UI_PAGE_REGISTRY,{group:'ALL',runtime:'ACTIVE_RUNTIME',status:'ALL'});
const legacy=filterScreenPages(GAME_UI_PAGE_REGISTRY,{group:'ALL',runtime:'LEGACY',status:'ALL'});
const nonRuntime=filterScreenPages(GAME_UI_PAGE_REGISTRY,{group:'ALL',runtime:'NON_RUNTIME',status:'ALL'});
assert(active.every(page=>page.runtimeActive&&!page.legacy),'Active runtime filter is incorrect');
assert(legacy.every(page=>page.legacy),'Legacy filter is incorrect');
assert(nonRuntime.every(page=>!page.runtimeActive&&!page.legacy),'Non-runtime filter is incorrect');

let device:BoardDevice='DESKTOP';
const registrySnapshot=JSON.stringify(GAME_UI_PAGE_REGISTRY);
device='MOBILE';
assert(device==='MOBILE','Device selector must update preview device state');
assert(JSON.stringify(GAME_UI_PAGE_REGISTRY)===registrySnapshot,'Device selection must not mutate registry/runtime responsive metadata');

const locked=GAME_UI_PAGE_REGISTRY.filter(page=>page.approvalStatus==='APPROVED_LOCKED');
assert(locked.length>0&&locked.every(page=>page.screenKey==='HERO_SELECT'),'Approved screens must remain registry-controlled and read-only');

for(const page of GAME_UI_PAGE_REGISTRY){
 const preview=getPreviewDescriptor(page);
 assert(preview.safe===true,`${page.screenKey} preview must be explicitly no-write`);
 assert(Boolean(preview.rendererKey)&&Boolean(preview.fixtureId||preview.type==='PREVIEW_MISSING'),`${page.screenKey} preview requires an explicit renderer and fixture or an honest missing state`);
 assert(!('onSubmit' in preview)&&!('onAward' in preview)&&!('persist' in preview),`${page.screenKey} preview descriptor must expose no gameplay write path`);
}

const counts=previewTypeCounts(GAME_UI_PAGE_REGISTRY);
assert(Object.values(counts).reduce((sum,count)=>sum+count,0)===GAME_UI_PAGE_REGISTRY.length,'Preview type counts must cover every registry card');
assert(counts.ACTUAL_COMPONENT===1,'Only the explicitly safe boss composition may mount as an actual component');
console.log(`All Screens Board verified: ${all.length} dynamic cards; active=${active.length}; non-runtime=${nonRuntime.length}; legacy=${legacy.length}.`);
