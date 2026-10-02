function assert(condition:unknown,message='assertion failed'):asserts condition{if(!condition)throw new Error(message)}
function equal(actual:unknown,expected:unknown){assert(actual===expected,`expected ${String(expected)}, received ${String(actual)}`)}
import {DOJO_STAGES} from '../content/dojo-database';
import {SHRINE_STAGES} from '../content/shrine-database';
import {GATEWAY_STAGES} from '../content/onet-database';
import {BOSS_CITADELS} from '../content/boss-database';
import {SCENE_ASSET_REGISTRY} from '../ui/assets/sceneAssetRegistry';
import {GAME_UI_PAGE_REGISTRY} from '../ui/game-ui/registry';
import {ARCTIC_WORLD_SCENES,BACKGROUND_GALLERY,backgroundFor,matchesCoverageFilter} from '../ui/game-ui/local-studio-world-inventory';

for(const stage of [...DOJO_STAGES,...SHRINE_STAGES,...GATEWAY_STAGES,...BOSS_CITADELS]) assert(ARCTIC_WORLD_SCENES.some(item=>item.level===stage.id),`missing ${stage.id}`);
equal(ARCTIC_WORLD_SCENES.filter(x=>x.screenKey==='DOJO_BATTLE').length,6);
equal(ARCTIC_WORLD_SCENES.filter(x=>x.screenKey==='SHRINE_BATTLE').length,4);
equal(ARCTIC_WORLD_SCENES.filter(x=>x.screenKey==='GATEWAY_EXAM').length,4);
equal(ARCTIC_WORLD_SCENES.filter(x=>x.screenKey==='BOSS_BATTLE').length,3);
equal(BACKGROUND_GALLERY.map(x=>x.sceneKey).sort().join('|'),Object.keys(SCENE_ASSET_REGISTRY).sort().join('|'));
for(const item of ARCTIC_WORLD_SCENES) assert(GAME_UI_PAGE_REGISTRY.some(page=>page.screenKey===item.screenKey),`screen mapping missing ${item.screenKey}`);
for(const bg of BACKGROUND_GALLERY){equal(bg.tabletStatus,bg.tablet===bg.desktop?'FALLBACK':'NATIVE');equal(bg.mobileStatus,bg.mobile===bg.desktop?'FALLBACK':'NATIVE')}
assert(ARCTIC_WORLD_SCENES.filter(x=>matchesCoverageFilter(x,'FALLBACK')).length>0);
assert(ARCTIC_WORLD_SCENES.filter(x=>matchesCoverageFilter(x,'MISSING_BACKGROUND')).every(x=>!backgroundFor(x)));
console.log(`Local Studio coverage PASS: ${ARCTIC_WORLD_SCENES.length} Arctic scenes, ${BACKGROUND_GALLERY.length} backgrounds.`);
