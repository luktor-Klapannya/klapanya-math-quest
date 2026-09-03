export interface EvidenceEnvelope {
  sessionId:string;
  stageId:string;
  evidence:{attempts:unknown[];reportedResult:unknown;context?:unknown};
}
export interface OutboxStorage {
  readonly length:number;
  key(index:number):string|null;
  getItem(key:string):string|null;
  setItem(key:string,value:string):void;
  removeItem(key:string):void;
}
const prefix=(owner:string)=>`klapanya_game_evidence_v2:${encodeURIComponent(owner)}:`;
function validate(item:EvidenceEnvelope) {
  if (!item || typeof item.sessionId!=='string' || !/^[0-9a-f-]{36}$/i.test(item.sessionId)
    || typeof item.stageId!=='string' || !item.stageId || !Array.isArray(item.evidence?.attempts)) throw new Error('Invalid pending evidence');
}
export class EvidenceOutbox {
  constructor(private readonly storage:OutboxStorage) {}
  put(owner:string,item:EvidenceEnvelope) {
    validate(item);
    const key=prefix(owner)+item.sessionId;
    const encoded=JSON.stringify(item);
    const existing=this.storage.getItem(key);
    if (existing!==null && existing!==encoded) throw new Error('Session ID already used');
    // One key per submission: another tab cannot overwrite an entire owner queue.
    this.storage.setItem(key,encoded);
  }
  list(owner:string):EvidenceEnvelope[] {
    const keys=Array.from({length:this.storage.length},(_,index)=>this.storage.key(index));
    return keys.filter((key):key is string=>!!key && key.startsWith(prefix(owner))).sort().flatMap(key=>{
      const raw=this.storage.getItem(key);
      if (raw===null) return [];
      const item=JSON.parse(raw) as EvidenceEnvelope;
      validate(item);
      if (key!==prefix(owner)+item.sessionId) throw new Error('Pending evidence key mismatch');
      return [item];
    });
  }
  acknowledge(owner:string,item:EvidenceEnvelope) {
    const key=prefix(owner)+item.sessionId;
    if (this.storage.getItem(key)===JSON.stringify(item)) this.storage.removeItem(key);
  }
  migrateV1(owner:string) {
    const oldKey=`klapanya_game_evidence_v1:${owner}`;
    const raw=this.storage.getItem(oldKey);
    if (!raw) return;
    const rows=JSON.parse(raw) as EvidenceEnvelope[];
    if (!Array.isArray(rows)) throw new Error('Invalid legacy evidence outbox');
    for (const row of rows) this.put(owner,row);
    // Keep the v1 snapshot until a future explicit cleanup; repeated migration is idempotent.
    // Marking it avoids re-enqueuing acknowledged v2 submissions on every login.
    this.storage.setItem(`${oldKey}:migrated`,raw);
  }
  migrateIfNeeded(owner:string) {
    const key=`klapanya_game_evidence_v1:${owner}`;
    if (this.storage.getItem(key)!==this.storage.getItem(`${key}:migrated`)) this.migrateV1(owner);
  }
}

export async function flushOwnedEvidence(owner:string,outbox:EvidenceOutbox,currentOwner:()=>string|null,send:(item:EvidenceEnvelope)=>Promise<void>) {
  if (currentOwner()!==owner) return;
  outbox.migrateIfNeeded(owner);
  for (const item of outbox.list(owner)) {
    if (currentOwner()!==owner) return;
    await send(item);
    // A logout/account change leaves the ack pending, to be safely retried by the owner.
    if (currentOwner()!==owner) return;
    outbox.acknowledge(owner,item);
  }
}
