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
import {AnalyticsWorkspace} from '../admin/AnalyticsWorkspace';
import {WebMasterWorkspace} from '../admin/WebMasterWorkspace';
import {UsersWorkspace} from '../admin/UsersWorkspace';
import {GameUiEditorWorkspace} from '../admin/GameUiEditorWorkspace';
import {AssetJobWorkspace} from '../admin/AssetJobWorkspace';
import {SafeBossPreview} from '../admin/SafeBossPreview';
import {AdminSidebar,findAdminDestination,type AdminDestinationKey} from '../admin/AdminSidebar';
import '../admin/backend.css';

const Placeholder=({title}:{title:string})=><div className="admin-placeholder"><strong>{title}</strong><p>This workspace is reserved in the Admin structure. Existing application behavior remains unchanged.</p></div>;

function AdminConsoleContent({identity,onLogout}:{identity:AdminIdentity;onLogout:()=>void}) {
 const {language,setLanguage,t}=useAdminLocale();
 const [destination,setDestination]=useState<AdminDestinationKey>('DASHBOARD'),[navOpen,setNavOpen]=useState(false),[sidebarHidden,setSidebarHidden]=useState(()=>localStorage.getItem('klapanya.admin.sidebar-hidden')==='true');
 const [arcticOpen,setArcticOpen]=useState(false),[libraryTab,setLibraryTab]=useState('All'),[builderTab,setBuilderTab]=useState('Question Bank'),[editTab,setEditTab]=useState('General'),[previewTab,setPreviewTab]=useState('Visual QA'),[assessmentTab,setAssessmentTab]=useState('Analyze');
 const [data,setData]=useState<Record<string,any[]>>({}),[errors,setErrors]=useState<string[]>([]),[loading,setLoading]=useState(true),[revision,setRevision]=useState(0),[actionError,setActionError]=useState('');
 const client=getSupabaseClient();
 const service=useMemo(()=>client?createBackendService(client,adminRuntime,identity):null,[client,identity.profileId,identity.organizationId,identity.principalId]);
 useEffect(()=>{let current=true;setLoading(true);setData({});setErrors([]);
  if(!service){setErrors(['Supabase is unavailable.']);setLoading(false);return;}
  const tables=['profiles','memberships','classroom_enrollments','professor_classroom_assignments','game_campaign_runs','game_sessions','game_session_results','game_backend_records'] as const;
  void Promise.all(tables.map(async table=>{try{return {table,rows:await service.read(table),error:null};}catch(e){return {table,rows:[],error:e instanceof Error?e.message:'Load failed'};}})).then(results=>{if(!current)return;setData(Object.fromEntries(results.map(r=>[r.table,r.rows])));setErrors([...new Set(results.flatMap(r=>r.error?[r.error]:[]))]);setLoading(false);});return()=>{current=false;};
 },[service,revision]);
 const records=(data.game_backend_records||[]) as BackendRecord[];
 const save=async(value:RecordInput,existing?:BackendRecord)=>{if(!service)throw new Error('Supabase unavailable');if(errors.some(e=>e.includes('game_backend_records')))throw new Error('Load backend metadata successfully before writing. Review migration 011.');await service.save(value,existing);setRevision(value=>value+1);};
 const upload=async(file:File)=>{if(!client)throw new Error('Supabase unavailable');return uploadBackendFile(client,adminRuntime,identity,file);};
 const workspace=(key:string,kinds:Kind[],initialKind?:Kind)=><RecordWorkspace key={key} records={records} kinds={kinds} initialKind={initialKind} save={save} upload={upload} onSaved={()=>setRevision(value=>value+1)}/>;
 const current=findAdminDestination(destination);
 useEffect(()=>{window.scrollTo({top:0,left:0,behavior:'auto'});},[destination,editTab,previewTab]);
 const libraryTabs:Record<string,Kind[]>={All:['DOCUMENT','QUESTION_SET','ASSESSMENT','EXTERNAL'],Games:['TERRITORY'],Worksheets:['DOCUMENT'],'Question Sets':['QUESTION_SET'],'Learning Resources':['DOCUMENT','EXTERNAL']};
 const gameTable=<Table headers={['Game','Subject','Type','Territories','Version','Status','Visibility','Updated','Action']} rows={[["Game #001 · Klapanya Math Quest / Adventure",'Math','Reference game',1+records.filter(r=>r.kind==='TERRITORY').length,'math-quest-v1.0','Frozen reference','Existing game entry','Source-controlled',<button onClick={()=>{setDestination('EDIT_GAME');setEditTab('Territory');}}>{t('Open Game #001')}</button>]]}/>;
 const territory=<><Table headers={['Territory','Theme','Subject / content','Status','Version','Action']} rows={[["Arctic",'Ice / Arctic','Math · 710Q','Existing game','math-quest-v1.0',<button onClick={()=>setArcticOpen(true)}>{t('Open Arctic')}</button>],...records.filter(r=>r.kind==='TERRITORY').map(r=>[r.title,r.metadata.theme,r.subject,r.status,r.version,'No'])]}/>{arcticOpen&&<ArcticEditor key={identity.principalId} identity={identity}/>}<details><summary>{language==='TH'?'แบบร่างดินแดนเดิม':'Existing territory drafts'}</summary><button disabled={loading||errors.some(e=>e.includes('game_backend_records'))} onClick={async()=>{setActionError('');try{await save({kind:'TERRITORY',title:'New territory draft',subject:'Math',grade:'P6',source_id:null,visibility:'PRIVATE',status:'DRAFT',metadata:{...template.TERRITORY}});}catch(e){setActionError(e instanceof Error?e.message:'Create failed');}}}>Create Territory from Arctic Reference</button>{!loading&&workspace('territory',['TERRITORY'],'TERRITORY')}</details></>;
 const content=()=>{
  if(destination==='DASHBOARD')return !loading&&<DashboardWorkspace data={data}/>;
  if(destination==='USERS')return <UsersWorkspace loading={loading} loadErrors={errors} data={data} onRefresh={()=>setRevision(value=>value+1)} update={async(id,name,status)=>{if(!service)throw new Error('Supabase unavailable');await service.updateProfile(id,name,status);setRevision(value=>value+1);}}/>;
  if(destination==='LIBRARY')return !loading&&<><Tabs items={Object.keys(libraryTabs)} value={libraryTab} onChange={setLibraryTab} label="Library work areas"/>{workspace(`library-${libraryTab}`,libraryTabs[libraryTab])}</>;
  if(destination==='CONTENT_BUILDER')return !loading&&<><Tabs items={['Question Bank','Upload / Import','Assessment Analysis','Blueprint','Question Sets']} value={builderTab} onChange={setBuilderTab} label="Content Builder workflow"/>
   {builderTab==='Question Bank'&&workspace('question-bank',['QUESTION_SET'],'QUESTION_SET')}{builderTab==='Upload / Import'&&workspace('upload-import',['DOCUMENT','EXTERNAL'])}
   {builderTab==='Assessment Analysis'&&<><Tabs items={['Analyze','Compare','Export']} value={assessmentTab} onChange={setAssessmentTab} label="Assessment analysis"/>{assessmentTab==='Analyze'&&workspace('analysis',['ANALYSIS'],'ANALYSIS')}{assessmentTab==='Compare'&&<Table headers={['Analysis','Subject','Grade','Source','Source taxonomy','Common mapping']} rows={records.filter(r=>r.kind==='ANALYSIS').map(r=>[r.title,r.subject,r.grade,records.find(source=>source.id===r.source_id)?.title||'Unlinked',JSON.stringify(r.metadata.sourceTaxonomy),JSON.stringify(r.metadata.commonTaxonomyMapping)])}/>} {assessmentTab==='Export'&&<button onClick={()=>download('assessment-workspace.json',JSON.stringify({schemaVersion:1,records:records.filter(r=>['ASSESSMENT','ANALYSIS','BLUEPRINT','QUESTION_SET'].includes(r.kind))},null,2))}>Export structured JSON</button>}</>}
   {builderTab==='Blueprint'&&workspace('blueprint',['BLUEPRINT'],'BLUEPRINT')}{builderTab==='Question Sets'&&workspace('question-sets',['QUESTION_SET'],'QUESTION_SET')}</>;
  if(destination==='ASSIGN_PUBLISH')return <Placeholder title={t('Assign & Publish')}/>;
  if(['WEB_LANDING','WEB_LOGIN','WEB_TERRITORY','WEB_TEACHER_HOME','WEB_GUIDE','WEB_PUBLIC_LIBRARY','WEB_PORTAL_HOME'].includes(destination))return <WebMasterWorkspace destination={destination as 'WEB_LANDING'|'WEB_LOGIN'|'WEB_TERRITORY'|'WEB_TEACHER_HOME'|'WEB_GUIDE'|'WEB_PUBLIC_LIBRARY'|'WEB_PORTAL_HOME'} onNavigate={setDestination}/>;
  if(destination==='GAMES')return <>{gameTable}<p>Game #001 uses the frozen Math Quest engine and authoritative 710-question corpus.</p></>;
  if(destination==='EDIT_GAME')return <><Tabs items={['General','Territory','Levels & Stages','UI','Heroes','Monsters','Bosses','Market']} value={editTab} onChange={setEditTab} label="Edit Game work areas"/>{editTab==='General'&&<>{gameTable}<p>Existing Game #001 configuration. Frozen gameplay behavior is unchanged.</p></>}{editTab==='Territory'&&territory}{editTab==='UI'&&<GameUiEditorWorkspace/>}{!['General','Territory','UI'].includes(editTab)&&<Placeholder title={t(editTab)}/>}</>;
  if(destination==='ASSETS')return <AssetJobWorkspace/>;
  if(destination==='PREVIEW_PUBLISH')return <><Tabs items={['Visual QA','Responsive Preview','Game Preview','Versions']} value={previewTab} onChange={setPreviewTab} label="Preview and publish"/>{previewTab==='Game Preview'?<SafeBossPreview/>:<><Table headers={['Version','Scope','Authority']} rows={[["math-quest-v1.0",'Frozen reference engine','Git source'],...records.filter(r=>r.kind==='TERRITORY').map(r=>[`${r.title} · ${r.version}`,r.status,'Backend draft metadata'])]}/><p className="note">Preview and version information only. No deployment is performed.</p></>}</>;
  if(destination==='ANALYTICS')return !loading&&<AnalyticsWorkspace data={data}/>;
 };
 const nested=!current.group.direct&&current.group.label!==current.item.label;
 const toggleSidebar=()=>setSidebarHidden(value=>{const next=!value;localStorage.setItem('klapanya.admin.sidebar-hidden',String(next));return next});
 return <main className="game-backend" lang={language.toLowerCase()}><header className="admin-topbar"><div className="admin-brand"><button className="admin-menu-button" aria-expanded={navOpen} aria-controls="admin-sidebar" onClick={()=>setNavOpen(value=>!value)}>{t('Menu')}</button><button className="admin-sidebar-toggle" aria-pressed={sidebarHidden} aria-label={sidebarHidden?'Show sidebar':'Hide sidebar'} title={sidebarHidden?'แสดง Sidebar':'ซ่อน Sidebar'} onClick={toggleSidebar}>{sidebarHidden?'☰':'◀'}</button><div><h1>Klapanya Game Platform</h1><small>{identity.organizationId}</small></div></div><div className="toolbar"><button aria-pressed={language==='TH'} onClick={()=>setLanguage('TH')}>TH</button><button aria-pressed={language==='EN'} onClick={()=>setLanguage('EN')}>EN</button><button onClick={()=>setRevision(value=>value+1)}>{t('Refresh')}</button><button onClick={onLogout}>{t('Logout')}</button></div></header><div className={`admin-shell ${sidebarHidden?'is-sidebar-hidden':''}`}><AdminSidebar active={destination} onSelect={key=>{setDestination(key);setActionError('');}} open={navOpen} onClose={()=>setNavOpen(false)}/><div className={`admin-workspace ${nested?'has-breadcrumb':'is-top-level'}`}>{nested&&<nav className="admin-breadcrumb" aria-label={t('Breadcrumb')}><span>{t(current.group.label)}</span><span aria-hidden="true">›</span><strong>{t(current.item.label)}</strong></nav>}<section className="admin-content-surface" aria-label={current.item.label}>{loading&&<p role="status">Loading authorized data…</p>}{errors.map(error=><p role="alert" key={error}>{error}</p>)}{actionError&&<p role="alert">{actionError}</p>}{content()}</section></div></div></main>;
}

export function AdminConsoleScreen(props:React.ComponentProps<typeof AdminConsoleContent>){return <AdminLocale><AdminConsoleContent {...props}/></AdminLocale>;}
