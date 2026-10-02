import type {GameUiDevice,GameUiPageDefinition,GameUiReadinessStatus,GameUiScreenGroup} from './registry';

export type BoardDevice=Extract<GameUiDevice,'DESKTOP'|'TABLET'|'MOBILE'>;
export type RuntimeFilter='ALL'|'ACTIVE_RUNTIME'|'NON_RUNTIME'|'LEGACY';
export type PreviewType='ACTUAL_COMPONENT'|'SAFE_FIXTURE'|'BACKGROUND_ONLY'|'PREVIEW_MISSING'|'LEGACY';

export interface ScreenBoardFilters {group:'ALL'|GameUiScreenGroup;runtime:RuntimeFilter;status:'ALL'|GameUiReadinessStatus}
export interface PreviewDescriptor {type:PreviewType;label:string;safe:true;rendererKey:string;fixtureId:string|null;actualPreviewHash:string|null}

const readiness=(page:GameUiPageDefinition)=>[page.visualStatus,page.assetStatus,page.functionalStatus,page.dataStatus,page.responsiveStatus,page.qaStatus,page.approvalStatus];

export function filterScreenPages(pages:readonly GameUiPageDefinition[],filters:ScreenBoardFilters){
 return pages.filter(page=>{
  const group=filters.group==='ALL'||page.screenGroup===filters.group;
  const runtime=filters.runtime==='ALL'||(filters.runtime==='ACTIVE_RUNTIME'&&page.runtimeActive)||(filters.runtime==='NON_RUNTIME'&&!page.runtimeActive&&!page.legacy)||(filters.runtime==='LEGACY'&&page.legacy);
  const status=filters.status==='ALL'||readiness(page).includes(filters.status);
  return group&&runtime&&status;
 });
}

export function getPreviewDescriptor(page:GameUiPageDefinition):PreviewDescriptor {
 if(page.legacy)return {type:'LEGACY',label:'LEGACY',safe:true,rendererKey:page.previewRendererKey,fixtureId:page.previewFixture?.id??null,actualPreviewHash:null};
 if(page.previewRendererKey==='SAFE_BOSS_COMPOSITION')return {type:'ACTUAL_COMPONENT',label:'ACTUAL COMPONENT',safe:true,rendererKey:page.previewRendererKey,fixtureId:page.previewFixture.id,actualPreviewHash:'#/boss-preview'};
 if(page.previewRendererKey==='NONE'||!page.previewFixture)return {type:'PREVIEW_MISSING',label:'PREVIEW MISSING',safe:true,rendererKey:page.previewRendererKey,fixtureId:null,actualPreviewHash:null};
 if(page.visualTreatment==='REGISTRY_BACKGROUND'||page.visualTreatment==='CONFIGURABLE_BACKGROUND')return {type:'BACKGROUND_ONLY',label:'BACKGROUND ONLY',safe:true,rendererKey:page.previewRendererKey,fixtureId:page.previewFixture.id,actualPreviewHash:null};
 return {type:'SAFE_FIXTURE',label:'SAFE FIXTURE',safe:true,rendererKey:page.previewRendererKey,fixtureId:page.previewFixture.id,actualPreviewHash:null};
}

export function previewTypeCounts(pages:readonly GameUiPageDefinition[]){
 return pages.reduce<Record<PreviewType,number>>((counts,page)=>{counts[getPreviewDescriptor(page).type]+=1;return counts;},{ACTUAL_COMPONENT:0,SAFE_FIXTURE:0,BACKGROUND_ONLY:0,PREVIEW_MISSING:0,LEGACY:0});
}
