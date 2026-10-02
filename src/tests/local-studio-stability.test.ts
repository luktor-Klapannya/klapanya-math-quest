// @ts-ignore TS5097
import {LOCAL_STUDIO_PREFERENCE_KEY,parseStudioPreferences,resolveStudioSelection} from '../ui/game-ui/local-studio-stability.ts';
// @ts-ignore TS5097
import {nextStudioReviewIndex,isStudioScreenReadOnly} from '../ui/game-ui/local-studio-foundation.ts';
// @ts-ignore TS5097
import {GAME_UI_PAGE_REGISTRY} from '../ui/game-ui/registry.ts';
function assert(value:unknown,message:string):asserts value{if(!value)throw new Error(message)}
const prefs=parseStudioPreferences<{device:string;tab:string}>('{"device":"MOBILE","tab":"PREVIEW"}');
assert(prefs.device==='MOBILE'&&prefs.tab==='PREVIEW','safe preferences must round-trip');
assert(Object.keys(parseStudioPreferences('bad json')).length===0,'invalid preferences must be isolated');
assert(LOCAL_STUDIO_PREFERENCE_KEY.includes('local-studio'),'preference key must be studio scoped');
assert(resolveStudioSelection(GAME_UI_PAGE_REGISTRY,'MAP').item?.screenKey==='MAP','valid selection must remain selected');
assert(resolveStudioSelection(GAME_UI_PAGE_REGISTRY,'REMOVED_SCREEN').unavailable==='REMOVED_SCREEN','invalid selection must remain explicit');
assert(nextStudioReviewIndex(4,10,1)===5&&nextStudioReviewIndex(0,10,-1)===9,'review sequence must remain stable');
const locked=GAME_UI_PAGE_REGISTRY.filter(isStudioScreenReadOnly);assert(locked.every(page=>page.approvalStatus==='APPROVED_LOCKED'),'approved screens remain protected');
console.log('Local Studio stability PASS: persistence, invalid selection, review order, and locked protection.');
