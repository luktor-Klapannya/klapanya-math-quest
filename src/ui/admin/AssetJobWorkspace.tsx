import React,{useMemo,useState}from'react';
import{CheckCircle2,Download,ImagePlus,Monitor,Smartphone,UploadCloud}from'lucide-react';
import{download,Select,Table,Tabs}from'./shared';

type AssetJobType='Teacher Hub'|'Student Hub'|'Arena'|'Hero'|'Monster'|'UI Frame'|'Tutor Card';
type AssetSlot='Background Desktop'|'Background Mobile'|'Hero Sprite'|'Monster Sprite'|'UI Panel'|'Button / Frame'|'Tutor Card'|'Summary Sheet';
type JobStatus='Draft'|'Ready to Split'|'Ready to Use'|'Needs Review';
type Device='Desktop'|'Mobile';

interface AssetJobItem{ id:string;name:string;type:AssetJobType;slot:AssetSlot;status:JobStatus;device:Device;fileName:string;src:string;notes:string;createdAt:string }

const storageKey='klapanya.admin.asset-jobs.v1';
const jobTypes:AssetJobType[]=['Teacher Hub','Student Hub','Arena','Hero','Monster','UI Frame','Tutor Card'];
const slots:AssetSlot[]=['Background Desktop','Background Mobile','Hero Sprite','Monster Sprite','UI Panel','Button / Frame','Tutor Card','Summary Sheet'];
const statuses:JobStatus[]=['Draft','Ready to Split','Ready to Use','Needs Review'];

const seedJobs:AssetJobItem[]=[
 {id:'teacher-hub-guide',name:'Teacher Hub ชุดห้องสมุดเวทมนตร์',type:'Teacher Hub',slot:'Background Desktop',status:'Ready to Use',device:'Desktop',fileName:'teacher-hub-desktop.png',src:'/backgrounds/hubs/teacher-hub-desktop.png',notes:'ใช้เป็นหน้าแรกครูแบบ Dark mode',createdAt:'Bundled'},
 {id:'student-hub-guide',name:'Student Hub ชุดห้องเรียนเวทมนตร์',type:'Student Hub',slot:'Background Desktop',status:'Ready to Use',device:'Desktop',fileName:'student-hub-desktop.png',src:'/backgrounds/hubs/student-hub-desktop.png',notes:'ใช้เป็นหน้าแรกนักเรียนแบบ Dark mode',createdAt:'Bundled'},
 {id:'arena-default',name:'Arena พื้นน้ำแข็งกลาง',type:'Arena',slot:'Background Desktop',status:'Ready to Use',device:'Desktop',fileName:'arctic_arena_desktop.jpg',src:'/backgrounds/arctic/arena/arctic_arena_desktop.jpg',notes:'Arena หลักที่ใช้ร่วมกันก่อน',createdAt:'Bundled'},
];

function readJobs(){try{const saved=JSON.parse(localStorage.getItem(storageKey)||'[]')as AssetJobItem[];return [...seedJobs,...saved]}catch{return seedJobs}}
function writeJobs(items:AssetJobItem[]){localStorage.setItem(storageKey,JSON.stringify(items.filter(item=>!seedJobs.some(seed=>seed.id===item.id))))}

export function AssetJobWorkspace(){
 const[jobs,setJobs]=useState<AssetJobItem[]>(readJobs),[active,setActive]=useState<AssetJobType|'All'>('All'),[device,setDevice]=useState<Device>('Desktop'),[type,setType]=useState<AssetJobType>('Arena'),[slot,setSlot]=useState<AssetSlot>('Background Desktop'),[status,setStatus]=useState<JobStatus>('Draft'),[notes,setNotes]=useState(''),[name,setName]=useState(''),[notice,setNotice]=useState('');
 const filtered=useMemo(()=>active==='All'?jobs:jobs.filter(job=>job.type===active),[active,jobs]);
 const selected=filtered[0]||jobs[0];
 const addFiles=(files:FileList|null)=>{if(!files?.length)return;Array.from(files).forEach(file=>{const reader=new FileReader();reader.onload=()=>{if(typeof reader.result!=='string')return;const src=reader.result;setJobs(current=>{const item:AssetJobItem={id:`asset-${Date.now()}-${Math.random().toString(36).slice(2)}`,name:name.trim()||file.name.replace(/\.[^.]+$/,''),type,slot,status,device,fileName:file.name,src,notes,createdAt:new Date().toISOString()};const next=[item,...current];writeJobs(next);return next});setNotice('เพิ่มภาพเข้า Asset Job Board แล้ว')};reader.readAsDataURL(file)})};
 const updateStatus=(id:string,value:JobStatus)=>setJobs(current=>{const next=current.map(item=>item.id===id?{...item,status:value}:item);writeJobs(next);return next});
 const exportManifest=()=>download('klapanya-asset-job-manifest.json',JSON.stringify({schemaVersion:1,exportedAt:new Date().toISOString(),jobs:jobs.map(({src,...job})=>({...job,source:src.startsWith('data:')?'admin-upload-draft':src}))},null,2));
 return <div className="asset-job-workspace">
  <header className="asset-job-hero">
   <div><p className="eyebrow">GAME ASSET JOB BOARD</p><h2>จัดภาพเป็นงานก่อนนำเข้าเกม</h2><p>อัปโหลดภาพสรุปเป็นชุดงาน เช่น Background, Hero, Monster, UI และระบุ slot ให้ชัด เพื่อไม่ให้หยิบภาพผิดตอนแยกไฟล์ใช้งานจริง</p></div>
   <button className="primary-action" onClick={exportManifest}><Download/> ส่งออก Manifest</button>
  </header>
  <section className="asset-upload-panel">
   <div className="fields">
    <label className="wide">ชื่องาน / ชุดภาพ<input value={name} onChange={event=>setName(event.target.value)} placeholder="เช่น Inspiration Arena · Ice Dojo"/></label>
    <Select label="Type" value={type} options={jobTypes} onChange={value=>setType(value as AssetJobType)}/>
    <Select label="Visual upload slot" value={slot} options={slots} onChange={value=>setSlot(value as AssetSlot)}/>
    <Select label="Review status" value={status} options={statuses} onChange={value=>setStatus(value as JobStatus)}/>
    <label>อุปกรณ์<select value={device} onChange={event=>setDevice(event.target.value as Device)}><option>Desktop</option><option>Mobile</option></select></label>
    <label className="wide">หมายเหตุ<textarea value={notes} onChange={event=>setNotes(event.target.value)} rows={3} placeholder="เช่น ต้องแยก Hero ออกจาก Background / ใช้ Dark mode ถ้ายังไม่พร้อม"/></label>
   </div>
   <label className="asset-drop-zone"><UploadCloud/><strong>เลือกหรือลากภาพเข้าชุดงานนี้</strong><span>รองรับ PNG, JPG, WebP หลายไฟล์พร้อมกัน</span><input type="file" accept="image/*" multiple onChange={event=>addFiles(event.target.files)}/></label>
   {notice&&<p className="runtime-save-success" role="status"><CheckCircle2/> {notice}</p>}
  </section>
  <Tabs items={['All',...jobTypes]} value={active} onChange={value=>setActive(value as AssetJobType|'All')} label="Asset job filters"/>
  <section className="asset-board-grid">
   <div className="asset-preview-stage">
    {selected?<><img src={selected.src} alt={selected.name}/><div className="asset-preview-overlay"><span>{selected.type}</span><strong>{selected.name}</strong><small>{selected.slot} · {selected.device}</small></div></>:<div className="asset-empty-preview"><ImagePlus/><strong>ยังไม่มีภาพในหมวดนี้</strong></div>}
   </div>
   <div className="asset-job-list">
    {filtered.map(job=><article key={job.id}>
     <img src={job.src} alt={job.name}/>
     <div><strong>{job.name}</strong><span>{job.fileName}</span><small>{job.slot} · {job.device}</small></div>
     <select value={job.status} onChange={event=>updateStatus(job.id,event.target.value as JobStatus)}>{statuses.map(item=><option key={item}>{item}</option>)}</select>
    </article>)}
   </div>
  </section>
  <section className="asset-slot-guide">
   <h3>แนวทางจัด Background</h3>
   <Table headers={['งาน','ควรอัปโหลด','วิธีใช้ในเกม']} rows={[
    ['Teacher Hub','พื้นหลัง Desktop + Mobile แยกกัน','ใช้ Dark mode เป็นค่าแรก และวางปุ่ม/ข้อมูลบน panel ไม่ทับจุดสำคัญ'],
    ['Student Hub','พื้นหลังหน้าเดียวที่เห็นครบ ไม่มี scroll','ให้พื้นที่กลางสำหรับภารกิจ บทเรียน และปุ่มเริ่มเล่น'],
    ['Arena','Background แยกจาก Hero และ Monster','ใช้ Arena เดียวก่อนได้ แล้วเปลี่ยนสีด้วย overlay ตามวิชา'],
    ['Hero / Monster','ตัวละครโปร่งใส แยกไฟล์เดี่ยว',<span>วางเหนือ Background ตาม layer <Monitor/> <Smartphone/></span>],
   ]}/>
  </section>
 </div>;
}
