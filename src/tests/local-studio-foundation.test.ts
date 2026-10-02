// Node's type-stripping runner requires extensions; the application build resolves the same modules.
// @ts-ignore TS5097
import { GAME_UI_PAGE_REGISTRY } from '../ui/game-ui/registry.ts';
// @ts-ignore TS5097
import { getScreenSlotInventory, honestStudioPreviewLabel, isDraftWorkspace, isStudioScreenReadOnly, LOCAL_STUDIO_SIDEBAR_STORAGE_KEY, LOCAL_STUDIO_SLOT_SCHEMAS, LOCAL_STUDIO_TABS, matchesStudioReviewFilter, nextStudioReviewIndex, slotGroupForScreen, studioDirectoryGroup, studioFlowLabel } from '../ui/game-ui/local-studio-foundation.ts';

function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }
assert(GAME_UI_PAGE_REGISTRY.length === 57, `Expected 57 dynamic registry entries, received ${GAME_UI_PAGE_REGISTRY.length}`);
assert(LOCAL_STUDIO_TABS.join(',') === 'OVERVIEW,ASSETS,COMPOSE,PREVIEW,USAGE', 'Workspace tabs are incomplete');
assert(new Set(LOCAL_STUDIO_SLOT_SCHEMAS.ARENA.map(slot=>slot.key)).size === 15, 'Arena slot schema must contain 15 unique slots');
const arenaKeys=new Set(LOCAL_STUDIO_SLOT_SCHEMAS.ARENA.map(slot=>slot.key));
const bossKeys=new Set(LOCAL_STUDIO_SLOT_SCHEMAS.BOSS.map(slot=>slot.key));
assert([...arenaKeys].every(key=>bossKeys.has(key)), 'Boss must inherit every Arena slot');
assert(['bossPhase','bossWarning','bossEffect'].every(key=>bossKeys.has(key)), 'Boss extension slots are missing');
assert(Object.keys(LOCAL_STUDIO_SLOT_SCHEMAS).length >= 16, 'Completion-pass slot schemas are incomplete');
assert(GAME_UI_PAGE_REGISTRY.every(page=>getScreenSlotInventory(page,'DESKTOP').length>0), 'Every registry screen must expose a component/slot checklist');
const map=GAME_UI_PAGE_REGISTRY.find(page=>page.screenKey==='MAP');
assert(map && slotGroupForScreen(map)==='MAP', 'MAP must open the MAP workspace schema');
const tablet=map ? getScreenSlotInventory(map,'TABLET') : [];
const mapBackground=tablet.find(item=>item.slot==='background');
assert(mapBackground?.status==='FALLBACK' && mapBackground.usesDesktopFallback, 'Tablet desktop fallback must be labeled honestly');
const locked=GAME_UI_PAGE_REGISTRY.filter(page=>page.approvalStatus==='APPROVED_LOCKED');
assert(locked.length>0 && locked.every(isStudioScreenReadOnly), 'APPROVED_LOCKED screens must remain read-only');
assert(new Set(GAME_UI_PAGE_REGISTRY.map(studioDirectoryGroup)).size===8, 'Every Local Studio directory group must be represented');
assert(nextStudioReviewIndex(0,57,-1)===56&&nextStudioReviewIndex(56,57,1)===0, 'Previous/Next review must wrap through the current directory');
assert(LOCAL_STUDIO_SIDEBAR_STORAGE_KEY.startsWith('klapanya.local-studio.'), 'Sidebar preference must be local-studio scoped');
assert(honestStudioPreviewLabel('BACKGROUND_ONLY')==='BACKGROUND ONLY'&&honestStudioPreviewLabel('PREVIEW_MISSING')==='DRAFT / NO VISUAL', 'Preview labels must be explicit');
const studentLogin=GAME_UI_PAGE_REGISTRY.find(page=>page.screenKey==='STUDENT_LOGIN');
assert(studentLogin&&studioFlowLabel(studentLogin)==='CURRENT FLOW: Student Login → Student Home', 'Student Login current flow label is wrong');
assert(GAME_UI_PAGE_REGISTRY.filter(isDraftWorkspace).every(page=>matchesStudioReviewFilter(page,'MISSING_VISUAL')), 'Draft workspaces must appear in Missing Visual review');
assert(!JSON.stringify(LOCAL_STUDIO_SLOT_SCHEMAS).includes('Supabase'), 'Slot schemas must not contain runtime/database write callbacks');
console.log(`Local Studio completion verified: ${GAME_UI_PAGE_REGISTRY.length} registry screens; ${Object.keys(LOCAL_STUDIO_SLOT_SCHEMAS).length} reusable slot schemas; 8 directory groups.`);
