import { EvidenceOutbox, flushOwnedEvidence } from '../storage/evidence-outbox';
import type { EvidenceEnvelope, OutboxStorage } from '../storage/evidence-outbox';

async function run() {
  let passed=0;
  const check=(value:unknown,label:string)=>{if(!value)throw new Error(label);passed++;console.log(`PASS: ${label}`);};
  const rows=new Map<string,string>();
  const storage:OutboxStorage={get length(){return rows.size;},key:i=>[...rows.keys()][i]??null,
    getItem:k=>rows.get(k)??null,setItem:(k,v)=>{rows.set(k,v);},removeItem:k=>{rows.delete(k);}};
  const a=new EvidenceOutbox(storage),otherTab=new EvidenceOutbox(storage);
  const item=(n:number):EvidenceEnvelope=>({sessionId:`30000000-0000-0000-0000-${String(n).padStart(12,'0')}`,stageId:'D1',evidence:{attempts:[],reportedResult:{xp:10}}});
  a.put('A',item(1));otherTab.put('A',item(2));a.put('B',item(3));
  check(a.list('A').length===2,'Two tabs preserve independent pending submissions');
  check(a.list('B').length===1,'Pending evidence isolated by owner');
  let conflict=false;try{a.put('A',{...item(1),stageId:'D2'});}catch{conflict=true;}
  check(conflict,'Conflicting session ID cannot replace evidence');
  let owner:string|null='A';let sent=0;
  try {await flushOwnedEvidence('A',a,()=>owner,async()=>{sent++;throw new Error('Network lost');});}catch{}
  check(sent===1 && a.list('A').length===2,'Network failure retains evidence');
  await flushOwnedEvidence('A',a,()=>owner,async()=>{owner='B';});
  check(a.list('A').length===2,'Account switch during request retains owner acknowledgement');
  sent=0;await flushOwnedEvidence('A',a,()=>owner,async()=>{sent++;});
  check(sent===0,'Wrong owner never flushes another account');
  owner='A';
  await flushOwnedEvidence('A',a,()=>owner,async()=>{otherTab.put('A',item(4));});
  check(a.list('A').length===1 && a.list('A')[0].sessionId===item(4).sessionId,'Acknowledgement preserves concurrently added evidence');
  await flushOwnedEvidence('A',a,()=>owner,async()=>{});
  check(a.list('A').length===0 && a.list('B').length===1,'Successful flush removes only acknowledged owner submissions');
  storage.setItem('klapanya_game_evidence_v1:A',JSON.stringify([item(5)]));
  a.migrateIfNeeded('A');a.migrateIfNeeded('A');
  check(a.list('A').length===1,'Legacy owner outbox migration is idempotent');
  await flushOwnedEvidence('A',a,()=>owner,async()=>{});a.migrateIfNeeded('A');
  check(a.list('A').length===0 && storage.getItem('klapanya_game_evidence_v1:A')!==null,'Acknowledged migration does not replay snapshot and preserves legacy data');
  const malformed='klapanya_game_evidence_v2:A:broken';storage.setItem(malformed,'bad json');
  let rejected=false;try{a.list('A');}catch{rejected=true;}
  check(rejected && storage.getItem(malformed)==='bad json','Malformed pending data is preserved and surfaced');
  console.log(`Evidence outbox: ${passed} passed`);
}
void run();
