import { CloudOwnedProgress, DemoOwnedProgress, exportLegacySave, freshProfile, LEGACY_SHARED_SAVE } from '../storage/owned-progress';
import type { ProgressTransport, ProgressRow } from '../storage/owned-progress';
import { validateCanonicalAttempts, verifyAndCommitGameSession } from '../../server/game-result-pipeline';
import { getQuestionsByStage } from '../content/dojo-database';

async function run() {
  let count=0;
  function check(value:unknown,message:string) { if (!value) throw new Error(message); count++; console.log(`PASS: ${message}`); }
  async function rejects(action:()=>Promise<unknown>,message:string) { let failed=false;try { await action(); } catch { failed=true; } check(failed,message); }
  const data = new Map<string,ProgressRow>();
  const requests = new Map<string,{payload:string;version:number}>();
  let owner:string|null='A'; let loseResponse=false;
  const transport:ProgressTransport = {
    async load(id) { return data.has(id) ? structuredClone(data.get(id)!) : null; },
    async save(id,version,requestId,checkpoint) {
      const key=`${id}:${requestId}`; const payload=JSON.stringify(checkpoint); const prior=requests.get(key);
      if (prior) { if (prior.payload!==payload) throw new Error('Conflicting replay'); return prior.version; }
      if ((data.get(id)?.version || 0)!==version) throw new Error('Version conflict');
      data.set(id,{version:version+1,checkpoint:structuredClone(checkpoint)});
      requests.set(key,{payload,version:version+1});
      if (loseResponse) {loseResponse=false;throw new Error('Response lost after commit');}
      return version+1;
    },
  };
  const a=new CloudOwnedProgress('A',transport,()=>owner);
  await a.loadProfile();
  await a.saveProfile({...freshProfile(),xp:12});
  owner='B';
  const b=new CloudOwnedProgress('B',transport,()=>owner);
  check((await b.loadProfile()).xp===0,'B does not inherit A progress');
  await rejects(()=>a.saveProfile({...freshProfile(),xp:999}),'Delayed A save rejected after account switch');
  await b.saveProfile({...freshProfile(),xp:7});
  owner='A';
  const reloaded=new CloudOwnedProgress('A',transport,()=>owner);
  check((await reloaded.loadProfile()).xp===12,'Reload/login restores only A checkpoint');
  const secondDevice=new CloudOwnedProgress('A',transport,()=>owner);
  await secondDevice.loadProfile();
  loseResponse=true;
  await rejects(()=>reloaded.saveProfile({...freshProfile(),xp:20}),'Uncertain network save surfaced');
  await reloaded.retry();
  check(data.get('A')?.version===2 && data.get('A')?.checkpoint.xp===20,'Retry after committed-but-lost response is idempotent');
  await rejects(()=>secondDevice.saveProfile({...freshProfile(),xp:1}),'Stale second device cannot overwrite latest progress');
  owner=null;
  await rejects(()=>reloaded.saveProfile(freshProfile()),'Logout prevents pending authenticated saves');
  owner='A';
  let release!:(row:ProgressRow)=>void;
  const delayed=new CloudOwnedProgress('A',{...transport,load:()=>new Promise(resolve=>{release=resolve;})},()=>owner);
  const lateLoad=delayed.loadProfile();owner='B';release({version:1,checkpoint:{...freshProfile(),xp:999}});
  await rejects(()=>lateLoad,'Late A load cannot appear in B session');
  const local=new Map<string,string>([[LEGACY_SHARED_SAVE,JSON.stringify({xp:5000})]]);
  const localStorage={getItem:(k:string)=>local.get(k)||null,setItem:(k:string,v:string)=>{local.set(k,v);}};
  const demoA=new DemoOwnedProgress('A',localStorage); const demoB=new DemoOwnedProgress('B',localStorage);
  check((await demoA.loadProfile()).xp===0,'Legacy shared save is not silently imported');
  await demoA.saveProfile({...freshProfile(),xp:2});
  check((await demoB.loadProfile()).xp===0,'Demo accounts have isolated keys');
  check(exportLegacySave(localStorage)===JSON.stringify({xp:5000}),'Legacy export preserves original save for explicit review');
  const q=getQuestionsByStage('D1')[0];
  const correct=q.options.find(o=>o.isCorrect)!;
  check(validateCanonicalAttempts([{questionId:q.id,selectedOptionId:correct.id,timeSpentSec:5}])[0].isCorrect,'Canonical outcome is computed from frozen answer key');
  check(!validateCanonicalAttempts([{questionId:q.id,selectedOptionId:null,timeSpentSec:5}])[0].isCorrect,'Blank response cannot claim correctness');
  await rejects(async()=>validateCanonicalAttempts([{questionId:'invented',timeSpentSec:1}]),'Unknown question ID rejected');
  await rejects(async()=>validateCanonicalAttempts([{questionId:q.id,selectedOptionId:'invented',timeSpentSec:1}]),'Unknown option rejected');
  await rejects(async()=>validateCanonicalAttempts([{questionId:q.id,timeSpentSec:-1}]),'Invalid timing rejected');
  await rejects(()=>verifyAndCommitGameSession(null as never,'session',null as never),'Missing trusted mode replay cannot promote client rewards');
  console.log(`Persistence/isolation: ${count} passed`);
}
void run();
