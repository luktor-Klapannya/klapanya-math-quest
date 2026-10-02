import type { GameUiDevice, GameUiPageDefinition } from './registry';
// Node's type-stripping focused test requires the extension; Vite resolves the same source module.
// @ts-ignore TS5097
import { SCENE_ASSET_REGISTRY, type ResponsiveSceneAsset, type SceneAssetKey } from '../assets/sceneAssetRegistry.ts';

export type LocalStudioDevice = Extract<GameUiDevice, 'DESKTOP' | 'TABLET' | 'MOBILE'>;
export type LocalStudioTab = 'OVERVIEW' | 'ASSETS' | 'COMPOSE' | 'PREVIEW' | 'USAGE';
export type LocalStudioSlotGroup = 'LANDING' | 'LOGIN' | 'STUDENT_HOME' | 'TUTOR' | 'MAP' | 'STAGE_DETAIL' | 'DRILL_CENTER' | 'ARENA' | 'BOSS' | 'BATTLE_LOBBY' | 'CLASSROOM_BATTLE' | 'RESULT' | 'CEREMONY' | 'TEACHER_HOME' | 'TEACHER_ASSIGNMENTS' | 'MY_GAME_REPORT' | 'GENERIC';
export type LocalStudioSlotStatus = 'AVAILABLE' | 'MISSING' | 'DRAFT' | 'APPROVED' | 'ACTIVE' | 'FALLBACK';
export type StudioDirectoryGroup = 'PUBLIC' | 'STUDENT' | 'TUTOR' | 'WORLD' | 'GAME' | 'RESULT' | 'TEACHER' | 'ADMIN_INTERNAL';
export type StudioReviewFilter = 'ALL' | 'ACTIVE_ONLY' | 'MISSING_VISUAL' | 'MISSING_ASSET' | 'RESPONSIVE_INCOMPLETE' | 'APPROVED';

export interface LocalStudioSlotDefinition {
  readonly key: string;
  readonly assetType: 'BACKGROUND' | 'HERO' | 'ENEMY_BOSS' | 'UI_COMPONENT' | 'FRAME_TEXTBOX' | 'ICON' | 'PLATFORM' | 'OVERLAY_EFFECT' | 'OTHER';
  readonly purpose: string;
}

type SlotPair = readonly [string, LocalStudioSlotDefinition['assetType']];
const slotPurpose = (key:string) => key.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/^./,value=>value.toUpperCase());
const slots = (keys: readonly SlotPair[]) => Object.freeze(keys.map(([key, assetType]) => Object.freeze({ key, assetType, purpose: slotPurpose(key) })));
const ARENA_SLOT_PAIRS = [
  ['background','BACKGROUND'],['platform','PLATFORM'],['hero','HERO'],['enemy','ENEMY_BOSS'],['heroPortrait','HERO'],['enemyPortrait','ENEMY_BOSS'],
  ['heroHp','UI_COMPONENT'],['enemyHp','UI_COMPONENT'],['timer','UI_COMPONENT'],['questionPanel','FRAME_TEXTBOX'],['answerFrame','FRAME_TEXTBOX'],
  ['hintPanel','FRAME_TEXTBOX'],['explanationPanel','FRAME_TEXTBOX'],['overlay','OVERLAY_EFFECT'],['effects','OVERLAY_EFFECT'],
] as const;

export const LOCAL_STUDIO_SLOT_SCHEMAS: Readonly<Record<LocalStudioSlotGroup, readonly LocalStudioSlotDefinition[]>> = Object.freeze({
  LANDING: slots([['background','BACKGROUND'],['atmosphere','OVERLAY_EFFECT'],['brand','UI_COMPONENT'],['title','UI_COMPONENT'],['roleEntry','UI_COMPONENT'],['guide','UI_COMPONENT'],['library','UI_COMPONENT']]),
  LOGIN: slots([['background','BACKGROUND'],['brand','UI_COMPONENT'],['loginFrame','FRAME_TEXTBOX'],['identityField','FRAME_TEXTBOX'],['passwordField','FRAME_TEXTBOX'],['submitAction','UI_COMPONENT'],['recoveryAction','UI_COMPONENT']]),
  STUDENT_HOME: slots([['background','BACKGROUND'],['atmosphere','OVERLAY_EFFECT'],['brand','UI_COMPONENT'],['profile','UI_COMPONENT'],['hero','HERO'],['adventureCta','UI_COMPONENT'],['shortcut','ICON'],['assignmentPanel','FRAME_TEXTBOX'],['dailyMission','UI_COMPONENT']]),
  TUTOR: slots([['background','BACKGROUND'],['tutorCharacter','HERO'],['lessonPanel','FRAME_TEXTBOX'],['questionPanel','FRAME_TEXTBOX'],['answerFrame','FRAME_TEXTBOX'],['hintPanel','FRAME_TEXTBOX'],['explanationPanel','FRAME_TEXTBOX'],['action','UI_COMPONENT']]),
  MAP: slots([['background','BACKGROUND'],['atmosphere','OVERLAY_EFFECT'],['territoryTitle','UI_COMPONENT'],['stageNode','ICON'],['lockedNode','ICON'],['playerMarker','HERO'],['navigation','UI_COMPONENT']]),
  STAGE_DETAIL: slots([['background','BACKGROUND'],['stageBadge','UI_COMPONENT'],['guardian','ENEMY_BOSS'],['informationPanel','FRAME_TEXTBOX'],['rewardPanel','FRAME_TEXTBOX'],['actions','UI_COMPONENT']]),
  DRILL_CENTER: slots([['background','BACKGROUND'],['skillSelector','UI_COMPONENT'],['difficultySelector','UI_COMPONENT'],['questionCount','UI_COMPONENT'],['startAction','UI_COMPONENT'],['progressSummary','FRAME_TEXTBOX']]),
  ARENA: slots(ARENA_SLOT_PAIRS),
  BOSS: slots([...ARENA_SLOT_PAIRS,['bossPhase','UI_COMPONENT'],['bossWarning','UI_COMPONENT'],['bossEffect','OVERLAY_EFFECT']] as readonly SlotPair[]),
  BATTLE_LOBBY: slots([['background','BACKGROUND'],['roomCode','FRAME_TEXTBOX'],['playerIdentity','UI_COMPONENT'],['participantList','FRAME_TEXTBOX'],['joinAction','UI_COMPONENT'],['exitAction','UI_COMPONENT']]),
  CLASSROOM_BATTLE: slots(ARENA_SLOT_PAIRS),
  RESULT: slots([['background','BACKGROUND'],['resultFrame','FRAME_TEXTBOX'],['score','UI_COMPONENT'],['accuracy','UI_COMPONENT'],['rewards','UI_COMPONENT'],['mastery','UI_COMPONENT'],['feedback','FRAME_TEXTBOX'],['actions','UI_COMPONENT']]),
  CEREMONY: slots([['background','BACKGROUND'],['atmosphere','OVERLAY_EFFECT'],['hero','HERO'],['ceremonyFrame','FRAME_TEXTBOX'],['achievement','ICON'],['continueAction','UI_COMPONENT'],['effects','OVERLAY_EFFECT']]),
  TEACHER_HOME: slots([['background','BACKGROUND'],['identity','UI_COMPONENT'],['classSelector','UI_COMPONENT'],['progressSummary','FRAME_TEXTBOX'],['assignments','FRAME_TEXTBOX'],['battleActions','UI_COMPONENT']]),
  TEACHER_ASSIGNMENTS: slots([['background','BACKGROUND'],['classSelector','UI_COMPONENT'],['assignmentList','FRAME_TEXTBOX'],['assignmentEditor','FRAME_TEXTBOX'],['previewAction','UI_COMPONENT'],['publishAction','UI_COMPONENT']]),
  MY_GAME_REPORT: slots([['background','BACKGROUND'],['identity','UI_COMPONENT'],['progressSummary','FRAME_TEXTBOX'],['masterySummary','FRAME_TEXTBOX'],['activityHistory','FRAME_TEXTBOX'],['actions','UI_COMPONENT']]),
  GENERIC: slots([['background','BACKGROUND'],['content','FRAME_TEXTBOX'],['navigation','UI_COMPONENT']]),
});

export const LOCAL_STUDIO_TABS: readonly LocalStudioTab[] = Object.freeze(['OVERVIEW','ASSETS','COMPOSE','PREVIEW','USAGE']);
export const COMPOSER_REFERENCE_PROPERTIES = Object.freeze(['x','y','width','height','scale','fit','anchor','layer','opacity','visibility'] as const);
export const LOCAL_STUDIO_SIDEBAR_STORAGE_KEY = 'klapanya.local-studio.sidebar-collapsed';
export const nextStudioReviewIndex = (current:number,total:number,direction:-1|1) => total > 0 ? (current + direction + total) % total : -1;
export function honestStudioPreviewLabel(type:'ACTUAL_COMPONENT'|'SAFE_FIXTURE'|'BACKGROUND_ONLY'|'PREVIEW_MISSING'|'LEGACY'){
  return type==='ACTUAL_COMPONENT'?'ACTUAL RUNTIME':type==='PREVIEW_MISSING'?'DRAFT / NO VISUAL':type.replace(/_/g,' ');
}

export function slotGroupForScreen(page: GameUiPageDefinition): LocalStudioSlotGroup | null {
  if (page.screenKey === 'LANDING') return 'LANDING';
  if (page.screenKey.includes('LOGIN') || page.screenKey === 'PASSWORD_RECOVERY') return 'LOGIN';
  if (page.screenKey === 'STUDENT_HOME') return 'STUDENT_HOME';
  if (page.screenKey === 'TEACHER_HOME') return 'TEACHER_HOME';
  if (page.screenKey === 'TEACHER_ASSIGNMENTS') return 'TEACHER_ASSIGNMENTS';
  if (page.screenKey === 'MAP') return 'MAP';
  if (page.screenKey === 'STAGE_DETAIL') return 'STAGE_DETAIL';
  if (page.screenKey === 'DRILL_CENTER') return 'DRILL_CENTER';
  if (page.screenKey === 'BATTLE_LOBBY') return 'BATTLE_LOBBY';
  if (page.screenKey === 'CLASSROOM_BATTLE') return 'CLASSROOM_BATTLE';
  if (page.screenKey === 'TOP_FORM_CEREMONY') return 'CEREMONY';
  if (page.category === 'RESULT' || page.screenKey.includes('RESULT') || page.screenKey === 'BATTLE_REVIEW') return 'RESULT';
  if (page.screenKey.includes('BOSS')) return 'BOSS';
  if (page.screenGroup === 'TUTOR' || page.screenKey.includes('TUTOR')) return 'TUTOR';
  if (page.category === 'GAMEPLAY') return 'ARENA';
  return 'GENERIC';
}

export function studioDirectoryGroup(page:GameUiPageDefinition):StudioDirectoryGroup {
  if(page.category==='RESULT'||page.screenKey.includes('RESULT')||page.screenKey==='BATTLE_REVIEW'||page.screenKey==='TOP_FORM_CEREMONY')return 'RESULT';
  if(page.screenGroup==='PUBLIC')return 'PUBLIC';
  if(page.screenGroup==='STUDENT')return 'STUDENT';
  if(page.screenGroup==='TUTOR')return 'TUTOR';
  if(page.screenGroup==='TEACHER')return 'TEACHER';
  if(page.screenGroup==='ADMIN')return 'ADMIN_INTERNAL';
  if(page.category==='WORLD_STAGE'||page.screenKey==='MAP'||page.screenKey==='STAGE_DETAIL')return 'WORLD';
  return 'GAME';
}

export function isDraftWorkspace(page:GameUiPageDefinition){return page.legacy||page.visualStatus==='PLANNED'||page.visualStatus==='DESIGN_ONLY'||page.previewRendererKey==='NONE'}
export function studioFlowLabel(page:GameUiPageDefinition){
  if(page.screenKey==='STUDENT_LOGIN')return 'CURRENT FLOW: Student Login → Student Home';
  if(page.screenKey==='TERRITORY_SELECT')return 'NOT CURRENT ENTRY FLOW';
  return page.legacy?'LEGACY · NOT CURRENT ENTRY FLOW':page.runtimeActive?'ACTIVE RUNTIME':page.visualStatus==='PLANNED'||page.visualStatus==='DESIGN_ONLY'?'DRAFT':'NON-RUNTIME';
}

export function matchesStudioReviewFilter(page:GameUiPageDefinition,filter:StudioReviewFilter){
  if(filter==='ACTIVE_ONLY')return page.runtimeActive;
  if(filter==='MISSING_VISUAL')return isDraftWorkspace(page)||page.visualStatus==='PARTIAL';
  if(filter==='MISSING_ASSET')return page.assetStatus==='PLANNED'||page.assetStatus==='DESIGN_ONLY'||page.assetStatus==='PARTIAL';
  if(filter==='RESPONSIVE_INCOMPLETE')return page.responsiveStatus!=='READY_FOR_QA'&&page.responsiveStatus!=='APPROVED_LOCKED';
  if(filter==='APPROVED')return page.approvalStatus==='APPROVED_LOCKED';
  return true;
}

function sceneKeyForScreen(key: string): SceneAssetKey | null {
  if (key.includes('LOGIN') || key === 'PASSWORD_RECOVERY') return 'LOGIN';
  if (key === 'LANDING') return 'PORTAL';
  if (key === 'PUBLIC_GUIDE' || key === 'HOW_TO_PLAY') return 'GUIDE';
  if (key === 'MAP') return 'ARCTIC_MAP';
  if (key.includes('HERO_SELECT')) return 'ARCTIC_HERO_SELECT';
  if (key.includes('SHRINE')) return 'ARCTIC_FARMING';
  if (key === 'GATEWAY_EXAM') return 'ARCTIC_ONET';
  if (key === 'GEOMETRY') return 'ARCTIC_GEOMETRY';
  if (key === 'QUEST_BOARD') return 'ARCTIC_QUEST';
  if (key.includes('BOSS')) return 'ARCTIC_BOSS_DRAGON';
  if (key === 'FINAL_TRIAL') return 'ARCTIC_FINAL';
  if (key.includes('RESULT') || key === 'TOP_FORM_CEREMONY') return 'ARCTIC_RESULT';
  if (key.includes('BATTLE') || key.includes('ARENA')) return 'ARCTIC_ARENA';
  return pageUsesKnownDojoBackground(key) ? 'ARCTIC_DOJO' : null;
}

const pageUsesKnownDojoBackground = (key: string) => key === 'DOJO_BATTLE' || key === 'BATTLE' || key === 'DRILL_SESSION';
const devicePath = (asset: ResponsiveSceneAsset, device: LocalStudioDevice) => device === 'MOBILE' ? asset.mobile : device === 'TABLET' ? asset.tablet : asset.desktop;

export interface LocalStudioSlotInventory {
  readonly slot: string;
  readonly assetType: LocalStudioSlotDefinition['assetType'];
  readonly device: LocalStudioDevice;
  readonly stateVariant: string;
  readonly status: LocalStudioSlotStatus;
  readonly asset: string | null;
  readonly source: string;
  readonly usesDesktopFallback: boolean;
}

export function getScreenSlotInventory(page: GameUiPageDefinition, device: LocalStudioDevice): readonly LocalStudioSlotInventory[] {
  const group = slotGroupForScreen(page);
  if (!group) return Object.freeze([]);
  const sceneKey = sceneKeyForScreen(page.screenKey);
  const scene = sceneKey ? SCENE_ASSET_REGISTRY[sceneKey] : null;
  return Object.freeze(LOCAL_STUDIO_SLOT_SCHEMAS[group].map(definition => {
    const knownBackground = definition.key === 'background' && scene;
    const usesDesktopFallback = Boolean(knownBackground && device === 'TABLET' && scene.tablet === scene.desktop);
    const knownPath = knownBackground ? devicePath(scene, device) : null;
    const approved = page.approvalStatus === 'APPROVED_LOCKED';
    return Object.freeze({
      slot: definition.key,
      assetType: definition.assetType,
      device,
      stateVariant: 'DEFAULT',
      status: usesDesktopFallback ? 'FALLBACK' : knownPath ? (approved ? 'APPROVED' : 'ACTIVE') : 'MISSING',
      asset: knownPath,
      source: knownPath ? `SCENE_ASSET_REGISTRY.${sceneKey}` : 'UNKNOWN',
      usesDesktopFallback,
    });
  }));
}

export function isStudioScreenReadOnly(page: GameUiPageDefinition) {
  return page.approvalStatus === 'APPROVED_LOCKED';
}
