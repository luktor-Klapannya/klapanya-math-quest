/**
 * Authoritative inventory of user-visible Game Platform pages and overlays.
 *
 * UIEDITOR-01 keeps this registry source-controlled and presentation-only. Preview
 * fixtures are inert JSON values: consumers must never attach runtime services,
 * authenticated sessions, or persistence callbacks to them.
 */
export type GameUiCategory = 'ENTRY'|'HUB'|'CHARACTER'|'WORLD_STAGE'|'GAMEPLAY'|'RESULT'|'UTILITY'|'ADMIN';
export type GameUiShellKey = 'ENTRY'|'HUB'|'WORLD_STAGE'|'GAMEPLAY'|'RESULT'|'UTILITY_OVERLAY'|'ADMIN_REVIEW'|'SPECIALIZED';
export type GameUiDevice = 'MOBILE'|'TABLET'|'DESKTOP'|'LARGE_DESKTOP';
export type GameUiCapability = 'GENERAL'|'LAYOUT'|'BACKGROUND'|'CHARACTERS'|'ASSETS'|'HUD'|'QUESTION'|'HINT_EXPLANATION'|'BUTTONS'|'TYPOGRAPHY'|'RESPONSIVE'|'PREVIEW'|'PUBLISH';
export type VisualTreatmentStatus = 'CONFIGURABLE_BACKGROUND'|'REGISTRY_BACKGROUND'|'HARDCODED'|'MIXED';
export type GameUiScreenGroup = 'PUBLIC'|'STUDENT'|'TUTOR'|'GAME'|'TEACHER'|'ADMIN';
export type GameUiReadinessStatus = 'PLANNED'|'DESIGN_ONLY'|'PARTIAL'|'FUNCTIONAL'|'READY_FOR_QA'|'APPROVED_LOCKED';
export type PreviewRendererKey = 'GENERIC'|'RUNTIME_COMPONENT'|'LOGIN_MODE'|'SAFE_BOSS_COMPOSITION'|'NONE';

export interface SafePreviewFixture {
  readonly id:string;
  readonly mode:'NO_WRITE';
  readonly label:string;
  readonly data:Readonly<Record<string,string|number|boolean>>;
}

export interface GameUiPageDefinition {
  readonly screenKey:string;
  readonly name:string;
  readonly component:string;
  readonly sourceFile:string;
  readonly category:GameUiCategory;
  readonly shellKey:GameUiShellKey;
  readonly purpose:string;
  readonly previewFixture:SafePreviewFixture;
  readonly devices:readonly GameUiDevice[];
  readonly capabilities:readonly GameUiCapability[];
  readonly backgroundSource:string;
  readonly visualTreatment:VisualTreatmentStatus;
  readonly runtimeState:string|null;
  readonly routeOrEntry:string;
  readonly runtimeComponent:string|null;
  readonly screenGroup:GameUiScreenGroup;
  readonly previewRendererKey:PreviewRendererKey;
  readonly slots:readonly string[];
  readonly visualStatus:GameUiReadinessStatus;
  readonly assetStatus:GameUiReadinessStatus;
  readonly functionalStatus:GameUiReadinessStatus;
  readonly dataStatus:GameUiReadinessStatus;
  readonly responsiveStatus:GameUiReadinessStatus;
  readonly qaStatus:GameUiReadinessStatus;
  readonly approvalStatus:GameUiReadinessStatus;
  readonly approvedEvidence:string|null;
  readonly dependencies:readonly string[];
  readonly notes:string;
  readonly legacy:boolean;
  readonly runtimeActive:boolean;
}

const allDevices=['MOBILE','TABLET','DESKTOP','LARGE_DESKTOP'] as const;
const standardCapabilities=['GENERAL','LAYOUT','BACKGROUND','ASSETS','BUTTONS','TYPOGRAPHY','RESPONSIVE','PREVIEW','PUBLISH'] as const;
const gameplayCapabilities=['GENERAL','LAYOUT','BACKGROUND','CHARACTERS','ASSETS','HUD','QUESTION','HINT_EXPLANATION','BUTTONS','TYPOGRAPHY','RESPONSIVE','PREVIEW','PUBLISH'] as const;
const inertFixture=(screenKey:string,label:string):SafePreviewFixture=>Object.freeze({
  id:`${screenKey.toLowerCase()}-baseline`,mode:'NO_WRITE',label,
  data:Object.freeze({fixtureVersion:1,profileName:'ผู้เรียนตัวอย่าง',stageId:'D1',questionId:'PREVIEW-Q-001',questionText:'12 × 4 มีค่าเท่าใด?',score:0,xp:0,coins:0,preview:true}),
});

type PageSeed=Omit<GameUiPageDefinition,'previewFixture'|'devices'|'capabilities'|'runtimeState'|'routeOrEntry'|'runtimeComponent'|'screenGroup'|'previewRendererKey'|'slots'|'visualStatus'|'assetStatus'|'functionalStatus'|'dataStatus'|'responsiveStatus'|'qaStatus'|'approvalStatus'|'approvedEvidence'|'dependencies'|'notes'|'legacy'|'runtimeActive'> & Partial<Pick<GameUiPageDefinition,'runtimeState'|'routeOrEntry'|'runtimeComponent'|'screenGroup'|'previewRendererKey'|'slots'|'visualStatus'|'assetStatus'|'functionalStatus'|'dataStatus'|'responsiveStatus'|'qaStatus'|'approvalStatus'|'approvedEvidence'|'dependencies'|'notes'|'legacy'|'runtimeActive'>> & {capabilities?:readonly GameUiCapability[];devices?:readonly GameUiDevice[]};
const page=(seed:PageSeed):GameUiPageDefinition=>Object.freeze({
  ...seed,
  devices:seed.devices||allDevices,
  capabilities:seed.capabilities||standardCapabilities,
  previewFixture:inertFixture(seed.screenKey,seed.name),
  runtimeState:seed.runtimeState??null,
  routeOrEntry:seed.routeOrEntry??'Internal UI entry',
  runtimeComponent:seed.runtimeComponent??seed.component,
  screenGroup:seed.screenGroup??'GAME',
  previewRendererKey:seed.previewRendererKey??(seed.runtimeActive?'RUNTIME_COMPONENT':'GENERIC'),
  slots:Object.freeze(seed.slots??[]),
  visualStatus:seed.visualStatus??'PARTIAL',
  assetStatus:seed.assetStatus??'PARTIAL',
  functionalStatus:seed.functionalStatus??(seed.runtimeActive?'FUNCTIONAL':'PARTIAL'),
  dataStatus:seed.dataStatus??'PARTIAL',
  responsiveStatus:seed.responsiveStatus??'PARTIAL',
  qaStatus:seed.qaStatus??'PLANNED',
  approvalStatus:seed.approvalStatus??'PLANNED',
  approvedEvidence:seed.approvedEvidence??null,
  dependencies:Object.freeze(seed.dependencies??[]),
  notes:seed.notes??'',
  legacy:seed.legacy??false,
  runtimeActive:seed.runtimeActive??false,
});
const src=(name:string)=>`src/ui/screens/${name}.tsx`;
const modal=(name:string)=>`src/ui/modals/${name}.tsx`;

const BASE_GAME_UI_PAGE_REGISTRY:readonly GameUiPageDefinition[]=Object.freeze([
  page({screenKey:'LANDING',name:'Landing',component:'LandingScreen',sourceFile:src('LandingScreen'),category:'ENTRY',shellKey:'ENTRY',purpose:'Wisdom Academy public entry',backgroundSource:'SCENE_ASSET_REGISTRY.PORTAL',visualTreatment:'REGISTRY_BACKGROUND'}),
  page({screenKey:'LOGIN',name:'Student / Teacher / Staff Login',component:'LoginScreen',sourceFile:src('LoginScreen'),category:'ENTRY',shellKey:'ENTRY',purpose:'Role-aware authenticated entry shared by all login routes',backgroundSource:'SCENE_ASSET_REGISTRY.LOGIN',visualTreatment:'REGISTRY_BACKGROUND'}),
  page({screenKey:'STUDENT_HOME',name:'Student Home',component:'StudentHomeScreen',sourceFile:src('StudentHomeScreen'),category:'HUB',shellKey:'HUB',purpose:'Student game entry, progress, and navigation',backgroundSource:'Component JSX and bundled assets',visualTreatment:'HARDCODED'}),
  page({screenKey:'TEACHER_HOME',name:'Teacher Home',component:'TeacherHomeScreen',sourceFile:src('TeacherHomeScreen'),category:'HUB',shellKey:'HUB',purpose:'Teacher game and classroom navigation',backgroundSource:'Component JSX',visualTreatment:'HARDCODED'}),
  page({screenKey:'DRILL_CENTER',name:'Drill Center',component:'DrillCenterScreen',sourceFile:src('DrillCenterScreen'),category:'HUB',shellKey:'HUB',purpose:'Choose focused practice configuration',backgroundSource:'Component JSX',visualTreatment:'HARDCODED'}),
  page({screenKey:'HERO_SELECT_LEGACY',name:'Hero Select',component:'HeroSelectScreen',sourceFile:src('HeroSelectScreen'),category:'CHARACTER',shellKey:'WORLD_STAGE',purpose:'Legacy hero class selection',backgroundSource:'Component JSX',visualTreatment:'HARDCODED'}),
  page({screenKey:'AVATAR_SELECT',name:'Avatar Hero Select',component:'AvatarHeroSelectScreen',sourceFile:src('AvatarHeroSelectScreen'),category:'CHARACTER',shellKey:'WORLD_STAGE',purpose:'Player avatar selection',backgroundSource:'Component JSX and hero registry',visualTreatment:'MIXED'}),
  page({screenKey:'ARCTIC_HERO_SELECT',name:'Arctic Hero Select',component:'ArcticHeroSelectScreen',sourceFile:src('ArcticHeroSelectScreen'),category:'CHARACTER',shellKey:'WORLD_STAGE',purpose:'Arctic campaign hero selection',backgroundSource:'SCENE_ASSET_REGISTRY.ARCTIC_HERO_SELECT and hero registry',visualTreatment:'REGISTRY_BACKGROUND'}),
  page({screenKey:'MAP',name:'Arctic Map',component:'MapScreen',sourceFile:src('MapScreen'),category:'WORLD_STAGE',shellKey:'WORLD_STAGE',purpose:'Frozen Arctic campaign navigation',backgroundSource:'game_arctic_configuration.worldMap → SCENE_ASSET_REGISTRY.ARCTIC_MAP',visualTreatment:'CONFIGURABLE_BACKGROUND'}),
  page({screenKey:'STAGE_DETAIL',name:'Stage Detail',component:'StageDetailScreen',sourceFile:src('StageDetailScreen'),category:'WORLD_STAGE',shellKey:'WORLD_STAGE',purpose:'Stage briefing and activity entry',backgroundSource:'Component JSX',visualTreatment:'HARDCODED'}),
  page({screenKey:'TUTOR_ROOM',name:'Tutor Room',component:'TutorRoomScreen',sourceFile:src('TutorRoomScreen'),category:'WORLD_STAGE',shellKey:'WORLD_STAGE',purpose:'Stage lesson and guided learning',backgroundSource:'Component JSX',visualTreatment:'HARDCODED'}),
  page({screenKey:'SKILL_INVENTORY',name:'Skill Inventory',component:'SkillInventoryScreen',sourceFile:src('SkillInventoryScreen'),category:'WORLD_STAGE',shellKey:'WORLD_STAGE',purpose:'Skill and loadout management',backgroundSource:'Component JSX and equipment registry',visualTreatment:'MIXED'}),
  page({screenKey:'BATTLE',name:'BattleScreen / Quick Drill / Dojo',component:'BattleScreen',sourceFile:src('BattleScreen'),category:'GAMEPLAY',shellKey:'GAMEPLAY',purpose:'Shared Quick Drill and Dojo question battle',backgroundSource:'game_arctic_configuration.dojo → SceneBackground DOJO',visualTreatment:'CONFIGURABLE_BACKGROUND',capabilities:gameplayCapabilities}),
  page({screenKey:'SHRINE_SPEEDRUN',name:'Shrine Speedrun',component:'ShrineSpeedrunScreen',sourceFile:src('ShrineSpeedrunScreen'),category:'GAMEPLAY',shellKey:'GAMEPLAY',purpose:'Farming Shrine speedrun activity',backgroundSource:'game_arctic_configuration.farming → SceneBackground FARMING',visualTreatment:'CONFIGURABLE_BACKGROUND',capabilities:gameplayCapabilities}),
  page({screenKey:'GATEWAY_EXAM',name:'O-NET Gateway',component:'GatewayExamScreen',sourceFile:src('GatewayExamScreen'),category:'GAMEPLAY',shellKey:'GAMEPLAY',purpose:'O-NET gateway exam',backgroundSource:'game_arctic_configuration.onet → bundled O-NET asset',visualTreatment:'CONFIGURABLE_BACKGROUND',capabilities:gameplayCapabilities}),
  page({screenKey:'GEOMETRY',name:'Geometry Special',component:'GeometryScreen',sourceFile:src('GeometryScreen'),category:'GAMEPLAY',shellKey:'GAMEPLAY',purpose:'Geometry special activity',backgroundSource:'game_arctic_configuration.geometry → bundled Geometry asset',visualTreatment:'CONFIGURABLE_BACKGROUND',capabilities:gameplayCapabilities}),
  page({screenKey:'QUEST_BOARD',name:'Quest Board',component:'QuestBoardScreen',sourceFile:src('QuestBoardScreen'),category:'GAMEPLAY',shellKey:'GAMEPLAY',purpose:'Word-problem quest activity',backgroundSource:'game_arctic_configuration.quest → bundled Quest asset',visualTreatment:'CONFIGURABLE_BACKGROUND',capabilities:gameplayCapabilities}),
  page({screenKey:'BOSS_ARENA',name:'Boss Arena',component:'BossArenaScreen',sourceFile:src('BossArenaScreen'),category:'GAMEPLAY',shellKey:'GAMEPLAY',purpose:'Three Arctic boss citadel encounters',backgroundSource:'game_arctic_configuration.citadel1/2/3 → bundled boss assets',visualTreatment:'CONFIGURABLE_BACKGROUND',capabilities:gameplayCapabilities}),
  page({screenKey:'FINAL_TRIAL',name:'Final Trial',component:'FinalTrialScreen',sourceFile:src('FinalTrialScreen'),category:'GAMEPLAY',shellKey:'SPECIALIZED',purpose:'Frozen final examination flow',backgroundSource:'game_arctic_configuration.final → bundled Final asset',visualTreatment:'CONFIGURABLE_BACKGROUND',capabilities:gameplayCapabilities}),
  page({screenKey:'BATTLE_LOBBY',name:'Battle Lobby',component:'BattleLobbyScreen',sourceFile:src('BattleLobbyScreen'),category:'GAMEPLAY',shellKey:'GAMEPLAY',purpose:'Classroom Arena lobby',backgroundSource:'SceneBackground ARENA_LOBBY',visualTreatment:'REGISTRY_BACKGROUND',capabilities:gameplayCapabilities}),
  page({screenKey:'CLASSROOM_BATTLE',name:'Classroom Battle',component:'ClassroomBattleScreen',sourceFile:src('ClassroomBattleScreen'),category:'GAMEPLAY',shellKey:'GAMEPLAY',purpose:'Realtime classroom duel',backgroundSource:'SceneBackground ARENA_LIVE',visualTreatment:'REGISTRY_BACKGROUND',capabilities:gameplayCapabilities}),
  page({screenKey:'RESULT',name:'Dojo Result',component:'ResultScreen',sourceFile:src('ResultScreen'),category:'RESULT',shellKey:'RESULT',purpose:'Shared Dojo and drill result',backgroundSource:'game_arctic_configuration.victory → bundled Result asset',visualTreatment:'CONFIGURABLE_BACKGROUND'}),
  page({screenKey:'SHRINE_RESULT',name:'Shrine Result',component:'ShrineResultScreen',sourceFile:src('ShrineResultScreen'),category:'RESULT',shellKey:'RESULT',purpose:'Farming Shrine result',backgroundSource:'game_arctic_configuration.victory → bundled Result asset',visualTreatment:'CONFIGURABLE_BACKGROUND'}),
  page({screenKey:'GATEWAY_RESULT',name:'Gateway Result',component:'GatewayResultScreen',sourceFile:src('GatewayResultScreen'),category:'RESULT',shellKey:'RESULT',purpose:'O-NET gateway result',backgroundSource:'game_arctic_configuration.victory → bundled Result asset',visualTreatment:'CONFIGURABLE_BACKGROUND'}),
  page({screenKey:'BOSS_RESULT',name:'Boss Result',component:'BossResultScreen',sourceFile:src('BossResultScreen'),category:'RESULT',shellKey:'RESULT',purpose:'Boss encounter result',backgroundSource:'game_arctic_configuration.victory → bundled Result asset',visualTreatment:'CONFIGURABLE_BACKGROUND'}),
  page({screenKey:'BATTLE_REVIEW',name:'Battle Review',component:'BattleReviewScreen',sourceFile:src('BattleReviewScreen'),category:'RESULT',shellKey:'RESULT',purpose:'Classroom Arena result review',backgroundSource:'Component JSX',visualTreatment:'HARDCODED'}),
  page({screenKey:'TOP_FORM_CEREMONY',name:'Top Form Ceremony',component:'TopFormCeremonyScreen',sourceFile:src('TopFormCeremonyScreen'),category:'RESULT',shellKey:'RESULT',purpose:'Campaign transformation ceremony',backgroundSource:'game_arctic_configuration.victory → bundled Result asset',visualTreatment:'CONFIGURABLE_BACKGROUND'}),
  page({screenKey:'INVENTORY',name:'Inventory',component:'InventoryScreen',sourceFile:src('InventoryScreen'),category:'UTILITY',shellKey:'UTILITY_OVERLAY',purpose:'Player equipment inventory',backgroundSource:'Component JSX and equipment registry',visualTreatment:'MIXED'}),
  page({screenKey:'REVIEW_HUB',name:'Review Hub',component:'ReviewHubScreen',sourceFile:src('ReviewHubScreen'),category:'UTILITY',shellKey:'ADMIN_REVIEW',purpose:'Authorized visual, animation, audio, and timer review',backgroundSource:'Component JSX and asset registries',visualTreatment:'MIXED'}),
  page({screenKey:'PROFESSOR_ARENA_CONSOLE',name:'Professor Arena Console',component:'ProfessorArenaConsoleScreen',sourceFile:src('ProfessorArenaConsoleScreen'),category:'ADMIN',shellKey:'ADMIN_REVIEW',purpose:'Active teacher classroom Arena console',backgroundSource:'SceneBackground ARENA_LIVE',visualTreatment:'REGISTRY_BACKGROUND'}),
  page({screenKey:'TEACHER_BATTLE_CONSOLE_LEGACY',name:'Teacher Battle Console',component:'TeacherBattleConsoleScreen',sourceFile:src('TeacherBattleConsoleScreen'),category:'ADMIN',shellKey:'ADMIN_REVIEW',purpose:'Legacy teacher battle-console component retained in source',backgroundSource:'Component JSX',visualTreatment:'HARDCODED'}),
  page({screenKey:'ADMIN_CONSOLE',name:'Admin Backend',component:'AdminConsoleScreen',sourceFile:src('AdminConsoleScreen'),category:'ADMIN',shellKey:'ADMIN_REVIEW',purpose:'Authenticated Game Platform administration',backgroundSource:'backend.css',visualTreatment:'HARDCODED'}),
  page({screenKey:'PUBLIC_GUIDE',name:'Public Guide Center',component:'PublicGuideModal',sourceFile:modal('PublicGuideModal'),category:'ENTRY',shellKey:'UTILITY_OVERLAY',purpose:'Public overview and role-specific guide entry for learners, teachers, and parents',backgroundSource:'SCENE_ASSET_REGISTRY.GUIDE',visualTreatment:'REGISTRY_BACKGROUND'}),
  page({screenKey:'HOW_TO_PLAY',name:'Guide / How to Play',component:'HowToPlayModal',sourceFile:modal('HowToPlayModal'),category:'UTILITY',shellKey:'UTILITY_OVERLAY',purpose:'Gameplay guide overlay',backgroundSource:'Modal JSX',visualTreatment:'HARDCODED'}),
  page({screenKey:'FORMULA_CODEX',name:'Formula Codex',component:'FormulaCodexModal',sourceFile:modal('FormulaCodexModal'),category:'UTILITY',shellKey:'UTILITY_OVERLAY',purpose:'Formula reference overlay',backgroundSource:'Modal JSX',visualTreatment:'HARDCODED'}),
  page({screenKey:'MARKET',name:'Magic Market',component:'MagicMarketModal',sourceFile:modal('MagicMarketModal'),category:'UTILITY',shellKey:'UTILITY_OVERLAY',purpose:'Reward and item market overlay',backgroundSource:'game_arctic_configuration.market → bundled Market asset',visualTreatment:'CONFIGURABLE_BACKGROUND'}),
  page({screenKey:'BACKGROUND_GALLERY',name:'Background Gallery',component:'BackgroundGalleryModal',sourceFile:modal('BackgroundGalleryModal'),category:'UTILITY',shellKey:'ADMIN_REVIEW',purpose:'Source-controlled scene background gallery',backgroundSource:'SCENE_ASSET_REGISTRY',visualTreatment:'REGISTRY_BACKGROUND'}),
  page({screenKey:'TERRITORY_DETAIL',name:'Territory Detail',component:'TerritoryDetailModal',sourceFile:modal('TerritoryDetailModal'),category:'WORLD_STAGE',shellKey:'UTILITY_OVERLAY',purpose:'Territory information and entry overlay',backgroundSource:'Component data and JSX',visualTreatment:'HARDCODED'}),
  page({screenKey:'TEACHER_GUIDE',name:'Teacher Guide',component:'TeacherGuideModal',sourceFile:modal('TeacherGuideModal'),category:'UTILITY',shellKey:'UTILITY_OVERLAY',purpose:'Teacher guidance overlay',backgroundSource:'Modal JSX',visualTreatment:'HARDCODED'}),
  page({screenKey:'PARENT_GUIDE',name:'Parent Guide',component:'ParentGuideModal',sourceFile:modal('ParentGuideModal'),category:'UTILITY',shellKey:'UTILITY_OVERLAY',purpose:'Parent game-progress guidance overlay',backgroundSource:'Modal JSX',visualTreatment:'HARDCODED'}),
  page({screenKey:'STUDENT_LOGIN',name:'Student Login',component:'LoginScreen',sourceFile:src('LoginScreen'),category:'ENTRY',shellKey:'ENTRY',purpose:'Student authentication entry mode',backgroundSource:'SCENE_ASSET_REGISTRY.LOGIN',visualTreatment:'REGISTRY_BACKGROUND'}),
  page({screenKey:'TEACHER_LOGIN',name:'Teacher Login',component:'LoginScreen',sourceFile:src('LoginScreen'),category:'ENTRY',shellKey:'ENTRY',purpose:'Teacher authentication entry mode',backgroundSource:'SCENE_ASSET_REGISTRY.LOGIN',visualTreatment:'REGISTRY_BACKGROUND'}),
  page({screenKey:'STAFF_LOGIN',name:'Staff Login',component:'LoginScreen',sourceFile:src('LoginScreen'),category:'ENTRY',shellKey:'ENTRY',purpose:'Staff authentication entry mode',backgroundSource:'SCENE_ASSET_REGISTRY.LOGIN',visualTreatment:'REGISTRY_BACKGROUND'}),
  page({screenKey:'TEACHER_ASSIGNMENTS',name:'Teacher Assignments',component:'TeacherAssignmentsScreen',sourceFile:src('TeacherAssignmentsScreen'),category:'HUB',shellKey:'HUB',purpose:'Assign game activities and preview linked stages',backgroundSource:'Component JSX',visualTreatment:'HARDCODED'}),
  page({screenKey:'HERO_SELECT',name:'Hero Select Runtime',component:'AvatarHeroSelectScreen',sourceFile:src('AvatarHeroSelectScreen'),category:'CHARACTER',shellKey:'WORLD_STAGE',purpose:'Runtime hero and avatar selection state',backgroundSource:'Component JSX and hero registry',visualTreatment:'MIXED'}),
  page({screenKey:'TUTOR_CATALOG',name:'Tutor Catalog',component:'TutorCatalogScreen',sourceFile:src('TutorCatalogScreen'),category:'HUB',shellKey:'HUB',purpose:'Searchable tutor topic catalog',backgroundSource:'Component JSX',visualTreatment:'HARDCODED'}),
  page({screenKey:'TUTOR_OVERVIEW',name:'Tutor Overview',component:'TutorTopicOverviewScreen',sourceFile:src('TutorTopicOverviewScreen'),category:'WORLD_STAGE',shellKey:'WORLD_STAGE',purpose:'Tutor topic overview before lesson',backgroundSource:'Component JSX',visualTreatment:'HARDCODED'}),
  page({screenKey:'TUTOR_PRACTICE',name:'Tutor Practice',component:'TutorPracticeScreen',sourceFile:src('TutorPracticeScreen'),category:'GAMEPLAY',shellKey:'GAMEPLAY',purpose:'Quiet tutor practice session',backgroundSource:'Component JSX',visualTreatment:'HARDCODED',capabilities:gameplayCapabilities}),
  page({screenKey:'TUTOR_RESULT',name:'Tutor Result',component:'TutorResultScreen',sourceFile:src('TutorResultScreen'),category:'RESULT',shellKey:'RESULT',purpose:'Standalone tutor practice result',backgroundSource:'Component JSX',visualTreatment:'HARDCODED'}),
  page({screenKey:'DRILL_SESSION',name:'Drill Session',component:'BattleScreen',sourceFile:src('BattleScreen'),category:'GAMEPLAY',shellKey:'GAMEPLAY',purpose:'Focused drill question session',backgroundSource:'game_arctic_configuration.dojo → SceneBackground DOJO',visualTreatment:'CONFIGURABLE_BACKGROUND',capabilities:gameplayCapabilities}),
  page({screenKey:'DOJO_BATTLE',name:'Dojo Battle',component:'BattleScreen',sourceFile:src('BattleScreen'),category:'GAMEPLAY',shellKey:'GAMEPLAY',purpose:'Dojo campaign question battle',backgroundSource:'game_arctic_configuration.dojo → SceneBackground DOJO',visualTreatment:'CONFIGURABLE_BACKGROUND',capabilities:gameplayCapabilities}),
  page({screenKey:'DOJO_RESULT',name:'Dojo Result Runtime',component:'ResultScreen',sourceFile:src('ResultScreen'),category:'RESULT',shellKey:'RESULT',purpose:'Dojo campaign result',backgroundSource:'game_arctic_configuration.victory → bundled Result asset',visualTreatment:'CONFIGURABLE_BACKGROUND'}),
  page({screenKey:'SHRINE_BATTLE',name:'Shrine Battle',component:'ShrineSpeedrunScreen',sourceFile:src('ShrineSpeedrunScreen'),category:'GAMEPLAY',shellKey:'GAMEPLAY',purpose:'Farming Shrine speedrun runtime state',backgroundSource:'game_arctic_configuration.farming → SceneBackground FARMING',visualTreatment:'CONFIGURABLE_BACKGROUND',capabilities:gameplayCapabilities}),
  page({screenKey:'BOSS_BATTLE',name:'Boss Battle',component:'BossArenaScreen',sourceFile:src('BossArenaScreen'),category:'GAMEPLAY',shellKey:'GAMEPLAY',purpose:'Arctic boss battle runtime state',backgroundSource:'game_arctic_configuration.citadel1/2/3 → bundled boss assets',visualTreatment:'CONFIGURABLE_BACKGROUND',capabilities:gameplayCapabilities}),
  page({screenKey:'BOSS_PREVIEW',name:'Boss Preview',component:'ArenaTemplatePreviewScreen',sourceFile:src('ArenaTemplatePreviewScreen'),category:'GAMEPLAY',shellKey:'GAMEPLAY',purpose:'No-write safe boss composition preview',backgroundSource:'Scene and enemy asset registries',visualTreatment:'REGISTRY_BACKGROUND',capabilities:gameplayCapabilities}),
  page({screenKey:'TEACHER_BATTLE_CONSOLE',name:'Teacher Battle Console Runtime',component:'ProfessorArenaConsoleScreen',sourceFile:src('ProfessorArenaConsoleScreen'),category:'ADMIN',shellKey:'ADMIN_REVIEW',purpose:'Runtime teacher classroom Arena console',backgroundSource:'SceneBackground ARENA_LIVE',visualTreatment:'REGISTRY_BACKGROUND'}),
  page({screenKey:'PASSWORD_RECOVERY',name:'Password Recovery',component:'PasswordRecoveryGate',sourceFile:'src/ui/screens/PasswordRecoveryGate.tsx',category:'ENTRY',shellKey:'ENTRY',purpose:'Recovery state hosted inside the login flow',backgroundSource:'Login shell',visualTreatment:'MIXED',runtimeComponent:'PasswordRecoveryGate',screenGroup:'PUBLIC',previewRendererKey:'LOGIN_MODE',functionalStatus:'FUNCTIONAL',runtimeActive:false,legacy:false,notes:'Confirmed user-visible login subflow; it is not an AppScreen navigation state.'}),
]);

type RuntimeMetadata={runtimeState:string;screenGroup:GameUiScreenGroup;routeOrEntry:string;runtimeComponent?:string;previewRendererKey?:PreviewRendererKey;approvalStatus?:GameUiReadinessStatus;approvedEvidence?:string};
const runtimeMetadata:Readonly<Record<string,RuntimeMetadata>>=Object.freeze({
  LANDING:{runtimeState:'LANDING',screenGroup:'PUBLIC',routeOrEntry:'/'}, LOGIN:{runtimeState:'LOGIN',screenGroup:'PUBLIC',routeOrEntry:'Login role entry'},
  STUDENT_LOGIN:{runtimeState:'STUDENT_LOGIN',screenGroup:'PUBLIC',routeOrEntry:'Landing → Student'}, TEACHER_LOGIN:{runtimeState:'TEACHER_LOGIN',screenGroup:'PUBLIC',routeOrEntry:'Landing → Teacher'}, STAFF_LOGIN:{runtimeState:'STAFF_LOGIN',screenGroup:'ADMIN',routeOrEntry:'Protected staff entry'},
  STUDENT_HOME:{runtimeState:'STUDENT_HOME',screenGroup:'STUDENT',routeOrEntry:'Student login; #/student-home preview'}, TEACHER_HOME:{runtimeState:'TEACHER_HOME',screenGroup:'TEACHER',routeOrEntry:'Teacher login'}, TEACHER_ASSIGNMENTS:{runtimeState:'TEACHER_ASSIGNMENTS',screenGroup:'TEACHER',routeOrEntry:'Teacher Home'},
  BATTLE_LOBBY:{runtimeState:'BATTLE_LOBBY',screenGroup:'GAME',routeOrEntry:'Student Home'}, CLASSROOM_BATTLE:{runtimeState:'CLASSROOM_BATTLE',screenGroup:'GAME',routeOrEntry:'Battle Lobby'}, BATTLE_REVIEW:{runtimeState:'BATTLE_REVIEW',screenGroup:'GAME',routeOrEntry:'Classroom Battle'},
  TEACHER_BATTLE_CONSOLE:{runtimeState:'TEACHER_BATTLE_CONSOLE',screenGroup:'TEACHER',routeOrEntry:'#/professor-console preview; teacher Arena entry',runtimeComponent:'ProfessorArenaConsoleScreen'},
  AVATAR_SELECT:{runtimeState:'AVATAR_SELECT',screenGroup:'STUDENT',routeOrEntry:'Student Home / Map'},
  HERO_SELECT:{runtimeState:'HERO_SELECT',screenGroup:'STUDENT',routeOrEntry:'#/hero-select preview',approvalStatus:'APPROVED_LOCKED',approvedEvidence:'docs/HERO_AVATAR_CONTINUITY.md approved Hero Selection baseline'},
  MAP:{runtimeState:'MAP',screenGroup:'GAME',routeOrEntry:'Student Home → Continue Adventure'}, STAGE_DETAIL:{runtimeState:'STAGE_DETAIL',screenGroup:'GAME',routeOrEntry:'Map stage selection'},
  TUTOR_CATALOG:{runtimeState:'TUTOR_CATALOG',screenGroup:'TUTOR',routeOrEntry:'Student Home; #/tutor-preview'}, TUTOR_OVERVIEW:{runtimeState:'TUTOR_OVERVIEW',screenGroup:'TUTOR',routeOrEntry:'Tutor Catalog'}, TUTOR_ROOM:{runtimeState:'TUTOR_ROOM',screenGroup:'TUTOR',routeOrEntry:'Tutor Overview / Stage Detail'}, TUTOR_PRACTICE:{runtimeState:'TUTOR_PRACTICE',screenGroup:'TUTOR',routeOrEntry:'Tutor Room'}, TUTOR_RESULT:{runtimeState:'TUTOR_RESULT',screenGroup:'TUTOR',routeOrEntry:'Tutor practice completion'},
  DRILL_CENTER:{runtimeState:'DRILL_CENTER',screenGroup:'GAME',routeOrEntry:'Map / Student Home'}, DRILL_SESSION:{runtimeState:'DRILL_SESSION',screenGroup:'GAME',routeOrEntry:'Drill Center / Tutor Room'}, SKILL_INVENTORY:{runtimeState:'SKILL_INVENTORY',screenGroup:'STUDENT',routeOrEntry:'Student Home / Map'},
  DOJO_BATTLE:{runtimeState:'DOJO_BATTLE',screenGroup:'GAME',routeOrEntry:'Stage Detail'}, DOJO_RESULT:{runtimeState:'DOJO_RESULT',screenGroup:'GAME',routeOrEntry:'Dojo Battle completion'}, SHRINE_BATTLE:{runtimeState:'SHRINE_BATTLE',screenGroup:'GAME',routeOrEntry:'Map shrine entry'}, SHRINE_RESULT:{runtimeState:'SHRINE_RESULT',screenGroup:'GAME',routeOrEntry:'Shrine completion'},
  GATEWAY_EXAM:{runtimeState:'GATEWAY_EXAM',screenGroup:'GAME',routeOrEntry:'Map gateway entry'}, GATEWAY_RESULT:{runtimeState:'GATEWAY_RESULT',screenGroup:'GAME',routeOrEntry:'Gateway completion'}, BOSS_BATTLE:{runtimeState:'BOSS_BATTLE',screenGroup:'GAME',routeOrEntry:'Map boss entry'}, BOSS_PREVIEW:{runtimeState:'BOSS_PREVIEW',screenGroup:'GAME',routeOrEntry:'#/boss-preview',previewRendererKey:'SAFE_BOSS_COMPOSITION'}, BOSS_RESULT:{runtimeState:'BOSS_RESULT',screenGroup:'GAME',routeOrEntry:'Boss completion'},
  GEOMETRY:{runtimeState:'GEOMETRY',screenGroup:'GAME',routeOrEntry:'Map'}, QUEST_BOARD:{runtimeState:'QUEST_BOARD',screenGroup:'GAME',routeOrEntry:'Map'}, FINAL_TRIAL:{runtimeState:'FINAL_TRIAL',screenGroup:'GAME',routeOrEntry:'Map'}, TOP_FORM_CEREMONY:{runtimeState:'TOP_FORM_CEREMONY',screenGroup:'GAME',routeOrEntry:'Map'}, INVENTORY:{runtimeState:'INVENTORY',screenGroup:'STUDENT',routeOrEntry:'Map'}, REVIEW_HUB:{runtimeState:'REVIEW_HUB',screenGroup:'ADMIN',routeOrEntry:'Authorized review trigger'}, ADMIN_CONSOLE:{runtimeState:'ADMIN_CONSOLE',screenGroup:'ADMIN',routeOrEntry:'/admin'},
});
const legacyKeys=new Set(['HERO_SELECT_LEGACY','ARCTIC_HERO_SELECT','BATTLE','SHRINE_SPEEDRUN','BOSS_ARENA','RESULT','PROFESSOR_ARENA_CONSOLE','TEACHER_BATTLE_CONSOLE_LEGACY']);
const nonRuntimeGroups:Readonly<Record<string,GameUiScreenGroup>>=Object.freeze({
  PUBLIC_GUIDE:'PUBLIC',HOW_TO_PLAY:'PUBLIC',FORMULA_CODEX:'STUDENT',MARKET:'STUDENT',
  BACKGROUND_GALLERY:'ADMIN',TERRITORY_DETAIL:'GAME',TEACHER_GUIDE:'TEACHER',PARENT_GUIDE:'PUBLIC',PASSWORD_RECOVERY:'PUBLIC',
});
export const GAME_UI_PAGE_REGISTRY:readonly GameUiPageDefinition[]=Object.freeze(BASE_GAME_UI_PAGE_REGISTRY.map(entry=>{
  const runtime=runtimeMetadata[entry.screenKey];
  return Object.freeze({...entry,...runtime,screenGroup:runtime?.screenGroup??nonRuntimeGroups[entry.screenKey]??entry.screenGroup,runtimeActive:Boolean(runtime),legacy:legacyKeys.has(entry.screenKey),runtimeComponent:runtime?.runtimeComponent??entry.runtimeComponent,previewRendererKey:runtime?.previewRendererKey??(runtime?'RUNTIME_COMPONENT':entry.previewRendererKey),approvalStatus:runtime?.approvalStatus??entry.approvalStatus,approvedEvidence:runtime?.approvedEvidence??entry.approvedEvidence});
}));

export const GAME_UI_CATEGORIES:readonly ('ALL'|GameUiCategory)[]=Object.freeze(['ALL','ENTRY','HUB','CHARACTER','WORLD_STAGE','GAMEPLAY','RESULT','UTILITY','ADMIN']);
export const BATTLE_EDITOR_TABS=Object.freeze(['General','Layout','Assets','HUD','Question','Hint / Explanation','Responsive','Preview','Publish'] as const);
export const getGameUiPage=(screenKey:string)=>GAME_UI_PAGE_REGISTRY.find(page=>page.screenKey===screenKey);
