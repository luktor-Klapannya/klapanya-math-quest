import {AdminLocale,useAdminLocale} from '../admin/locale';
import {ArcticEditor} from '../admin/ArcticEditor';
import React,{useEffect,useMemo,useState} from 'react';
import {getSupabaseClient} from '../../lib/supabaseClient';
import type {AdminIdentity} from '../../services/admin-console-service';
import {createBackendService,uploadBackendFile,type BackendRecord,type RecordInput,type Kind} from '../../services/backend-workspace-service';
import {adminRuntime} from '../components/AdminAccessGuard';
import {Tabs,Table,download} from '../admin/shared';
import {RecordWorkspace,template} from '../admin/RecordWorkspace';
import {DashboardWorkspace} from '../admin/DashboardWorkspace';
import {UsersWorkspace} from '../admin/UsersWorkspace';
import '../admin/backend.css';
const modules=['Dashboard','Users','Library','Game Bank','Assessment Engine'];
function AdminConsoleContent({identity,onLogout}:{identity:AdminIdentity;onLogout:()=>void}) {
 const {language,setLanguage,t}=useAdminLocale();
 const [arcticOpen,setArcticOpen]=useState(false);
 const [module,setModule]=useState('Dashboard'),[tab,setTab]=useState('All'),[gameTab,setGameTab]=useState('Overview'),[territoryTab,setTerritoryTab]=useState('General'),[assessmentTab,setAssessmentTab]=useState('Analyze');
 const [data,setData]=useState<Record<string,any[]>>({}),[errors,setErrors]=useState<string[]>([]),[loading,setLoading]=useState(true),[revision,setRevision]=useState(0),[actionError,setActionError]=useState('');
 const client=getSupabaseClient();const service=useMemo(()=>client?createBackendService(client,adminRuntime,identity):null,[client,identity.profileId,identity.organizationId,identity.principalId]);
 useEffect(()=>{let current=true;setLoading(true);setData({});setErrors([]);
 if(!service){setErrors(['Supabase is unavailable.']);setLoading(false);return;}
 const tables=['profiles','memberships','classroom_enrollments','professor_classroom_assignments','game_campaign_runs','game_sessions','game_session_results','game_backend_records'] as const;
 void Promise.all(tables.map(async table=>{try{return {table,rows:await service.read(table),error:null};}catch(e){return {table,rows:[],error:e instanceof Error?e.message:'Load failed'};}})).then(results=>{if(!current)return;setData(Object.fromEntries(results.map(r=>[r.table,r.rows])));setErrors(results.flatMap(r=>r.error?[r.error]:[]));setLoading(false);});return()=>{current=false;};},[service,revision]);
 const records=(data.game_backend_records||[]) as BackendRecord[];
 const save=async(value:RecordInput,existing?:BackendRecord)=>{if(!service)throw new Error('Supabase unavailable');if(errors.some(e=>e.includes('game_backend_records')))throw new Error('Load backend metadata successfully before writing. Review migration 011.');await service.save(value,existing);setRevision(v=>v+1);};
 const upload=async(file:File)=>{if(!client)throw new Error('Supabase unavailable');return uploadBackendFile(client,adminRuntime,identity,file);};
 const workspace=(kinds:Kind[],initialKind?:Kind)=><RecordWorkspace key={module+tab+assessmentTab+territoryTab} records={records} kinds={kinds} initialKind={initialKind} save={save} upload={upload} onSaved={()=>setRevision(v=>v+1)}/>;
 const libraryTabs:Record<string,Kind[]>={All:['DOCUMENT','QUESTION_SET','ASSESSMENT','EXTERNAL'],Documents:['DOCUMENT'],'Question Sets':['QUESTION_SET'],Assessments:['ASSESSMENT'],External:['EXTERNAL']};
 return <main className="game-backend" lang={language.toLowerCase()}><header><div><h1>Klapanya Game Platform</h1><small>Admin · {identity.organizationId}</small></div><div className="toolbar"><button aria-pressed={language==='TH'} onClick={()=>setLanguage('TH')}>TH</button><button aria-pressed={language==='EN'} onClick={()=>setLanguage('EN')}>EN</button><button onClick={()=>setRevision(v=>v+1)}>{t('Refresh')}</button><button onClick={onLogout}>{t('Logout')}</button></div></header><Tabs items={modules} value={module} onChange={setModule} label="Admin destinations"/><section aria-label={module}><h2>{t(module)}</h2>{loading&&<p role="status">Loading authorized data…</p>}{errors.map(error=><p role="alert" key={error}>{error}</p>)}{actionError&&<p role="alert">{actionError}</p>}
 {!loading&&module==='Dashboard'&&(errors.some(e=>!e.includes('game_backend_records'))?<p>Analytics unavailable until all evidence and scope queries succeed. No partial totals are shown.</p>:<DashboardWorkspace data={data}/>)}
 {!loading&&module==='Users'&&(errors.some(e=>['profiles','memberships','enrollments','assignments'].some(t=>e.includes(t)))?<p>User data unavailable. Resolve the access errors above.</p>:<UsersWorkspace data={data} onRefresh={()=>setRevision(v=>v+1)} update={async(id,name,status)=>{if(!service)throw new Error('Supabase unavailable');await service.updateProfile(id,name,status);setRevision(v=>v+1);}}/>)}
 {!loading&&module==='Library'&&<><Tabs items={Object.keys(libraryTabs)} value={tab} onChange={setTab} label="Library categories"/>{workspace(libraryTabs[tab])}</>}
 {module==='Game Bank'&&<><Table headers={['Game','Subject','Type','Territories','Version','Status','Visibility','Updated','Action']} rows={[["Game #001 · Klapanya Math Quest / Adventure",'Math','Reference game',1+records.filter(r=>r.kind==='TERRITORY').length,'math-quest-v1.0','Frozen reference','Existing game entry','Source-controlled',<button onClick={()=>setGameTab('Territories')}>{t('Open Game #001')}</button>]]}/><Tabs items={['Overview','Territories','Content Mapping','Versions']} value={gameTab} onChange={setGameTab} label="Game workspace"/>
 {gameTab==='Overview'&&<p>Shared Math Quest engine · Frozen 710-question campaign. Backend drafts are configuration records; they do not alter the live game.</p>}
 {gameTab==='Content Mapping'&&<p>Game #001 references its existing 710Q source corpus and authoritative mappings. Draft territories reference question IDs or future Library Question Sets. No canonical questions are copied here.</p>}
 {gameTab==='Versions'&&<Table headers={['Version','Scope','Authority']} rows={[["math-quest-v1.0",'Frozen reference engine','Git source'],...records.filter(r=>r.kind==='TERRITORY').map(r=>[`${r.title} · ${r.version}`,r.status,'Backend draft metadata'])]}/>}
 {gameTab==='Territories'&&<><Table headers={['Territory','Theme','Subject / content','Status','Version','Action']} rows={[["Arctic",'Ice / Arctic','Math · 710Q','Existing game','math-quest-v1.0',<button onClick={()=>setArcticOpen(true)}>{t('Open Arctic')}</button>],...records.filter(r=>r.kind==='TERRITORY').map(r=>[r.title,r.metadata.theme,r.subject,r.status,r.version,'No'])]}/>{arcticOpen&&<ArcticEditor key={identity.principalId} identity={identity}/>}<details><summary>{language==='TH'?'แบบร่างดินแดนเดิม':'Existing territory drafts'}</summary><button disabled={loading||errors.some(e=>e.includes('game_backend_records'))} onClick={async()=>{setActionError('');try{await save({kind:'TERRITORY',title:'New territory draft',subject:'Math',grade:'P6',source_id:null,visibility:'PRIVATE',status:'DRAFT',metadata:{...template.TERRITORY}});setTerritoryTab('General');}catch(e){setActionError(e instanceof Error?e.message:'Create failed');}}}>Create Territory from Arctic Reference</button>
 <Tabs items={['General','Structure','Questions','Visual','Preview','Publish']} value={territoryTab} onChange={setTerritoryTab} label="Territory detail"/>
 {territoryTab==='Structure'&&<Table headers={['Structure','Reference']} rows={['World Map','Levels','Stages','Game Modes','Boss flow','Market hooks'].map(s=>[s,'Existing MATH_710Q_V1 structure; unchanged'])}/>}
 {territoryTab==='Questions'&&<p>Use questionReferences for stable existing IDs, or libraryQuestionSetId for a future approved Question Set. Mapping is draft metadata pending runtime validation; it does not rewire Game #001.</p>}
 {territoryTab==='Visual'&&<p>Private upload slots: World Map, Level backgrounds, Stage backgrounds, Hero accents, Monster visuals, Boss visuals, Market skin, UI/theme. Choose a slot in the record form and upload its image. No runtime asset replacement.</p>}
 {territoryTab==='Preview'&&<Table headers={['Territory','Structure','Question mapping','Visual slots','Runtime readiness']} rows={records.filter(r=>r.kind==='TERRITORY').map(r=>[r.title,r.metadata.structureReference||'Missing',r.metadata.questionReferences?.length||r.metadata.libraryQuestionSetId||'Reference corpus',Object.values(r.metadata.visuals||{}).filter(Boolean).length,'Configuration only; runtime integration deferred'])}/>}
 {territoryTab==='Publish'&&<p>Move draft → review → approved → published explicitly using Edit / review. Published is a metadata state only. No deployment or public access is performed.</p>}
 {!loading&&workspace(['TERRITORY'],'TERRITORY')}</details></>}
 </>}
 {!loading&&module==='Assessment Engine'&&<><Tabs items={['Analyze','Compare','Blueprint','Question Builder','Question Sets','Export']} value={assessmentTab} onChange={setAssessmentTab} label="Assessment workflow"/>
 {assessmentTab==='Analyze'&&<><p>Select a Library source in the record form. Register a source in Library first if needed. Manual classifications retain both source and common taxonomy.</p>{workspace(['ANALYSIS'],'ANALYSIS')}</>}
 {assessmentTab==='Compare'&&<Table headers={['Analysis','Subject','Grade','Source','Source taxonomy','Common mapping']} rows={records.filter(r=>r.kind==='ANALYSIS').map(r=>[r.title,r.subject,r.grade,records.find(s=>s.id===r.source_id)?.title||'Unlinked',JSON.stringify(r.metadata.sourceTaxonomy),JSON.stringify(r.metadata.commonTaxonomyMapping)])}/>}
 {assessmentTab==='Blueprint'&&workspace(['BLUEPRINT'],'BLUEPRINT')}
 {assessmentTab==='Question Builder'&&<><p>Question metadata foundation: manually register stimulus units and question references. No AI generation, canonical question editing or automatic publishing.</p>{workspace(['QUESTION_SET'],'QUESTION_SET')}</>}
 {assessmentTab==='Question Sets'&&workspace(['QUESTION_SET'],'QUESTION_SET')}
 {assessmentTab==='Export'&&<><p>Export source-linked analysis, blueprint and question-set metadata for review.</p><button onClick={()=>download('assessment-workspace.json',JSON.stringify({schemaVersion:1,records:records.filter(r=>['ASSESSMENT','ANALYSIS','BLUEPRINT','QUESTION_SET'].includes(r.kind))},null,2))}>Export structured JSON</button></>}
 </>}
 </section></main>;
}


export function AdminConsoleScreen(props:React.ComponentProps<typeof AdminConsoleContent>){return <AdminLocale><AdminConsoleContent {...props}/></AdminLocale>;}
