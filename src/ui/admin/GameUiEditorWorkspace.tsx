import React,{useMemo,useState} from 'react';
import {BATTLE_EDITOR_TABS,GAME_UI_CATEGORIES,GAME_UI_PAGE_REGISTRY,type GameUiCategory,type GameUiPageDefinition} from '../game-ui/registry';
import {Select,Table,Tabs} from './shared';
import {SCENE_ASSET_REGISTRY} from '../assets/sceneAssetRegistry';
import {ArcticHeroSelectScreen} from '../screens/ArcticHeroSelectScreen';
import {SafeBossPreview} from './SafeBossPreview';

const plannedValues:Record<string,React.ReactNode>={
 General:<Table headers={['Property','Existing value','Availability']} rows={[
  ['Component','BattleScreen','Read only'],['Purpose','Quick Drill and Dojo question battle','Read only'],['Shell','GAMEPLAY','Classification only'],['Visibility','Controlled by existing App routing','Runtime unchanged'],
 ]}/>,
 Layout:<Table headers={['Region','Existing value','Availability']} rows={[
  ['Page','SceneBackground; max width 5xl; responsive padding','Read only'],['Header','Stage, timer, progress, currency and tools','Read only'],['Arena','CombatArenaView between progress and question panel','Read only'],['Question','White responsive panel; answer grid below','Read only'],
 ]}/>,
 Assets:<Table headers={['Slot','Existing value','Availability']} rows={[
  ['Background',SCENE_ASSET_REGISTRY.ARCTIC_DOJO.desktop,'Bundled default'],['Hero','HeroCharacterArt / hero asset registry','Read only'],['Monster','CombatArenaView opponent asset','Read only'],['Ring','CombatArenaView presentation','Read only'],
 ]}/>,
 HUD:<p className="note">Existing stage label, adaptive timer, progress, combo, tools, hero HP and opponent HP are detected. Editing is not available in UIEDITOR-02.</p>,
 Question:<Table headers={['Property','Existing value','Availability']} rows={[
  ['Question text','Responsive text-base → text-xl','Read only'],['Answers','1 column → 2 columns at sm','Read only'],['Touch target','Minimum 48 px','Read only'],['Correct / wrong states','Existing BattleScreen classes','Read only'],
 ]}/>,
 'Hint / Explanation':<Table headers={['Property','Existing value','Availability']} rows={[
  ['Hint','Header action plus modal overlay','Read only'],['Explanation','Remediation modal overlay','Read only'],['Mobile behavior','Overlay; no permanent side panel','Read only'],
 ]}/>,
 Responsive:<Table headers={['Device','Target','Existing support']} rows={[
  ['Mobile','390 × 844','Tailwind base/sm and responsive scene asset'],['Tablet','768 × 1024','sm/md layout and tablet scene asset'],['Desktop','1440 × 900','md layout and desktop scene asset'],['Large Desktop','1920 × 1080','Fluid max-width layout and desktop asset'],
 ]}/>,
 Preview:<div className="readonly-panel"><strong>PREVIEW MODE · NO DATA WRITE</strong><p>The deterministic fixture is registered. Real component mounting is deferred to UIEDITOR-03 so gameplay evidence, rewards, mastery, and progress cannot run.</p><button disabled>Open responsive preview — not yet available</button></div>,
 Publish:<div className="readonly-panel"><strong>Persistence is not available in UIEDITOR-02.</strong><p>No draft, published version, save, restore, runtime override, or database table exists.</p><button disabled>Save Draft — not available</button> <button disabled>Publish — not available</button></div>,
};

const screenBackground=(key:string)=>{const asset=key==='LOGIN'?SCENE_ASSET_REGISTRY.LOGIN:key==='LANDING'?SCENE_ASSET_REGISTRY.PORTAL:key==='HOW_TO_PLAY'?SCENE_ASSET_REGISTRY.GUIDE:key==='MAP'?SCENE_ASSET_REGISTRY.ARCTIC_MAP:key==='ARCTIC_HERO_SELECT'?SCENE_ASSET_REGISTRY.ARCTIC_HERO_SELECT:key==='SHRINE_SPEEDRUN'?SCENE_ASSET_REGISTRY.ARCTIC_FARMING:key==='GATEWAY_EXAM'?SCENE_ASSET_REGISTRY.ARCTIC_ONET:key==='GEOMETRY'?SCENE_ASSET_REGISTRY.ARCTIC_GEOMETRY:key==='QUEST_BOARD'?SCENE_ASSET_REGISTRY.ARCTIC_QUEST:key==='BOSS_ARENA'?SCENE_ASSET_REGISTRY.ARCTIC_BOSS_DRAGON:key==='FINAL_TRIAL'?SCENE_ASSET_REGISTRY.ARCTIC_FINAL:key.includes('RESULT')||key==='TOP_FORM_CEREMONY'?SCENE_ASSET_REGISTRY.ARCTIC_RESULT:SCENE_ASSET_REGISTRY.ARCTIC_DOJO;return {Desktop:asset.desktop,Tablet:asset.tablet,Mobile:asset.mobile}};
function EditablePagePreview({page}:{page:GameUiPageDefinition}){const storageKey=`klapanya.game-ui.${page.screenKey}.draft.v1`,defaults=screenBackground(page.screenKey),[device,setDevice]=useState<'Desktop'|'Tablet'|'Mobile'>('Desktop'),[images,setImages]=useState<Record<'Desktop'|'Tablet'|'Mobile',string>>(()=>{try{return JSON.parse(localStorage.getItem(storageKey)||'null')||defaults}catch{return defaults}}),[dirty,setDirty]=useState(false),[notice,setNotice]=useState(''),upload=(event:React.ChangeEvent<HTMLInputElement>)=>{const file=event.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{if(typeof reader.result==='string'){setImages(value=>({...value,[device]:reader.result as string}));setDirty(true);setNotice('')}};reader.readAsDataURL(file)},save=()=>{try{localStorage.setItem(storageKey,JSON.stringify(images));setDirty(false);setNotice('บันทึก Background Draft สำเร็จ')}catch{setNotice('บันทึกไม่สำเร็จ: ภาพมีขนาดใหญ่เกินไป')}};return <section className="game-page-visual-draft"><div className="visual-editor-toolbar"><div className="device-switch">{(['Desktop','Tablet','Mobile']as const).map(value=><button key={value} aria-pressed={device===value} onClick={()=>setDevice(value)}>{value}</button>)}</div><label className="upload-control">เปลี่ยน Background<input type="file" accept="image/*" onChange={upload}/></label><button className="save-draft" disabled={!dirty} onClick={save}>บันทึกการแก้ไข</button></div>{notice&&<div className={`save-notice ${notice.includes('สำเร็จ')?'is-success':''}`}>{notice}</div>}<div className={`registry-page-preview device-${device.toLowerCase()}`}><img src={images[device]} alt={`${page.name} background preview`}/><div><strong>{page.name}</strong><span>{page.component} · {page.shellKey}</span><small>{page.previewFixture.data.questionText}</small><small>NO WRITE PREVIEW · {page.devices.join(' / ')}</small></div></div></section>}

export function GameUiEditorWorkspace(){
 const [category,setCategory]=useState<'ALL'|GameUiCategory>('ALL');
 const [selectedKey,setSelectedKey]=useState('BOSS_ARENA');
 const [editorTab,setEditorTab]=useState<(typeof BATTLE_EDITOR_TABS)[number]>('General');
 const pages=useMemo(()=>category==='ALL'?GAME_UI_PAGE_REGISTRY:GAME_UI_PAGE_REGISTRY.filter(page=>page.category===category),[category]);
 const selected=GAME_UI_PAGE_REGISTRY.find(page=>page.screenKey===selectedKey)||GAME_UI_PAGE_REGISTRY[0];
 return <div className="game-ui-editor">
  <div className="editor-heading"><div><h3>Game UI Editor</h3><p className="note">Source-controlled Master UI inventory · read-only foundation</p></div><span className="readonly-badge">READ ONLY</span></div>
  <div className="toolbar"><Select label="Category" value={category} options={[...GAME_UI_CATEGORIES]} onChange={value=>setCategory(value as 'ALL'|GameUiCategory)}/><label>Page<select value={selectedKey} onChange={event=>setSelectedKey(event.target.value)}>{pages.map(page=><option value={page.screenKey} key={page.screenKey}>{page.name}</option>)}</select></label><span className="note">{pages.length} of {GAME_UI_PAGE_REGISTRY.length} registered pages</span></div>
  <section className="editor-detail" aria-label={`${selected.name} registry detail`}>
   <div className="editor-heading"><div><h3>{selected.name}</h3><p><code>{selected.screenKey}</code> · <code>{selected.component}</code> · {selected.shellKey}</p></div><span className="readonly-badge">{selected.previewFixture.mode.replace('_',' ')}</span></div>
   <p>{selected.purpose}</p><p className="note">Source: {selected.sourceFile}<br/>Background/config: {selected.backgroundSource}<br/>Editable capabilities planned: {selected.capabilities.join(', ')}</p>
   {selected.screenKey==='BOSS_ARENA'?<SafeBossPreview/>:selected.screenKey==='ARCTIC_HERO_SELECT'?<section className="actual-game-preview"><div className="preview-safety-banner"><strong>ACTUAL COMPONENT PREVIEW</strong><span>NO WRITE · การยืนยันและย้อนกลับถูกปิดในโหมดตรวจภาพ</span></div><ArcticHeroSelectScreen previewMode currentHeroId="CHRONOMANCER" playerName="ผู้เรียนตัวอย่าง" onConfirmHero={()=>{}} onBackToTerritory={()=>{}}/></section>:<EditablePagePreview key={selected.screenKey} page={selected}/>}
   {selected.screenKey==='BATTLE'?<><Tabs items={[...BATTLE_EDITOR_TABS]} value={editorTab} onChange={value=>setEditorTab(value as (typeof BATTLE_EDITOR_TABS)[number])} label="BattleScreen editor sections"/><div className="editor-tab-panel">{plannedValues[editorTab]}</div></>:selected.screenKey==='BOSS_ARENA'?<div className="readonly-panel"><strong>Actual combat component is mounted in Safe Preview.</strong><p>ตัวอย่างนี้ใช้ข้อมูลคงที่และปิดการเขียนคะแนน XP Mastery และ Progress เพื่อให้ Webmaster ตรวจภาพได้อย่างปลอดภัย</p></div>:<div className="readonly-panel"><strong>Registry entry established.</strong><p>Detailed page controls are outside UIEDITOR-02.</p></div>}
  </section>
  <details className="game-ui-registry-list"><summary>ดูทะเบียนหน้าทั้งหมด ({pages.length} หน้า)</summary><Table headers={['Screen key','Page','Actual component','Category','Shell','Devices','Background / config','Visual status','Action']} rows={pages.map(page=>[
   page.screenKey,page.name,<code>{page.component}</code>,page.category,page.shellKey,page.devices.join(' · '),page.backgroundSource,page.visualTreatment,<button onClick={()=>{setSelectedKey(page.screenKey);window.scrollTo({top:0,behavior:'smooth'})}}>Inspect</button>,
  ])}/></details>
 </div>;
}
