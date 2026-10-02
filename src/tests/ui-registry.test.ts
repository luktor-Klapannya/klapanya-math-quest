// Node's type-stripping runner requires extensions; the application build resolves the same modules.
// @ts-ignore TS5097
import {GAME_UI_PAGE_REGISTRY,getGameUiPage} from '../ui/game-ui/registry.ts';
// @ts-ignore TS5097
import {APP_SCREEN_STATES} from '../ui/game-ui/runtime-screens.ts';

function assert(condition:unknown,message:string):asserts condition {if(!condition)throw new Error(message);}

const keys=GAME_UI_PAGE_REGISTRY.map(page=>page.screenKey);
assert(new Set(keys).size===keys.length,'Duplicate canonical screen keys are not allowed');

const active=GAME_UI_PAGE_REGISTRY.filter(page=>page.runtimeActive);
const runtimeMappings=active.map(page=>page.runtimeState);
assert(runtimeMappings.every(Boolean),'Every active registry entry must declare runtimeState');
assert(new Set(runtimeMappings).size===runtimeMappings.length,'Each runtime state must have exactly one canonical active registry entry');

const missingRuntime=APP_SCREEN_STATES.filter(state=>!active.some(page=>page.runtimeState===state));
assert(missingRuntime.length===0,`Runtime AppScreen states missing registry mappings: ${missingRuntime.join(', ')}`);

const unknownActive=active.filter(page=>!APP_SCREEN_STATES.includes(page.runtimeState as typeof APP_SCREEN_STATES[number]));
assert(unknownActive.length===0,`Active registry entries do not map to AppScreen: ${unknownActive.map(page=>page.screenKey).join(', ')}`);

const missingComponents=active.filter(page=>!page.runtimeComponent?.trim());
assert(missingComponents.length===0,`Active registry entries missing runtime component metadata: ${missingComponents.map(page=>page.screenKey).join(', ')}`);

for(const page of GAME_UI_PAGE_REGISTRY){
 assert(page.previewFixture.mode==='NO_WRITE',`${page.screenKey} fixture must be no-write`);
 assert(page.previewFixture.data.preview===true,`${page.screenKey} fixture must be marked preview`);
 assert(typeof JSON.stringify(page.previewFixture)==='string','Fixtures must remain serializable inert data');
 assert(page.devices.length>0,`${page.screenKey} must declare target devices`);
 assert(['PUBLIC','STUDENT','TUTOR','GAME','TEACHER','ADMIN'].includes(page.screenGroup),`${page.screenKey} has an unsupported screen group`);
 if(page.approvalStatus==='APPROVED_LOCKED')assert(Boolean(page.approvedEvidence),`${page.screenKey} approval requires explicit evidence`);
 if(!page.runtimeActive)assert(page.runtimeState===null,`${page.screenKey} is non-runtime but declares a runtime state`);
}

const battle=getGameUiPage('DOJO_BATTLE');
assert(battle,'Dojo Battle runtime screen must be registered');
assert(battle.shellKey==='GAMEPLAY','Dojo Battle must use the GAMEPLAY shell classification');
assert(battle.capabilities.includes('HINT_EXPLANATION'),'Dojo Battle must declare hint/explanation capability');
assert(battle.backgroundSource.includes('game_arctic_configuration.dojo'),'Dojo Battle must expose its existing background source');

const recovery=getGameUiPage('PASSWORD_RECOVERY');
assert(recovery&&!recovery.runtimeActive&&!recovery.legacy,'Password Recovery must be explicitly registered as a current non-AppScreen login subflow');

console.log(`UI registry parity verified: ${APP_SCREEN_STATES.length} runtime states; ${GAME_UI_PAGE_REGISTRY.length} total entries; deterministic no-write fixtures only.`);
