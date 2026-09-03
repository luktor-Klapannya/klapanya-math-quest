import type {SupabaseClient} from '@supabase/supabase-js';
import {verifyAdmin,type AdminIdentity,type AdminRuntime} from './admin-console-service';
import {cleanVisuals,type ArcticVisuals} from './arctic-visual-slots';
export const ARCTIC_BUCKET='game-arctic-visuals';
export interface ArcticConfiguration {organization_id:string;title:string;description:string;visuals:ArcticVisuals;version:number;updated_at?:string}
export function defaultArctic(organizationId:string):ArcticConfiguration {
  return {organization_id:organizationId,title:'Arctic',description:'Klapanya Math Quest · 710Q',visuals:{},version:0};
}
export async function readArctic(client:SupabaseClient,organizationId:string) {
  const result=await client.from('game_arctic_configuration').select('*').eq('organization_id',organizationId).maybeSingle();
  if(result.error)throw new Error('Arctic configuration unavailable. Check migration 013 and access.');
  return result.data?{...result.data,visuals:cleanVisuals(result.data.visuals,organizationId)} as ArcticConfiguration:defaultArctic(organizationId);
}
export function createArcticEditor(client:SupabaseClient,runtime:AdminRuntime,expected:AdminIdentity) {
  async function authorize() {
    const owner=runtime.user();const actual=await verifyAdmin(client,runtime);
    const check=()=>{if(runtime.mode()!=='supabase'||runtime.user()!==owner)throw new Error('Account changed.');};
    check();
    if(actual.profileId!==expected.profileId||actual.principalId!==expected.principalId||actual.organizationId!==expected.organizationId)throw new Error('Admin scope changed.');
    return check;
  }
  return {
    async read(){const check=await authorize();const value=await readArctic(client,expected.organizationId);check();return value;},
    async save(value:ArcticConfiguration) {
      const check=await authorize();
      if(value.organization_id!==expected.organizationId||!value.title.trim()||value.title.length>200||value.description.length>2000)throw new Error('Invalid Arctic metadata.');
      const payload={organization_id:expected.organizationId,title:value.title.trim(),description:value.description,visuals:cleanVisuals(value.visuals,expected.organizationId)};
      const query=value.version===0?client.from('game_arctic_configuration').insert(payload):client.from('game_arctic_configuration').update(payload).eq('organization_id',expected.organizationId).eq('version',value.version);
      const result=await query.select('*').single();check();
      if(result.error||!result.data)throw new Error('Save rejected. Reload Arctic before retrying; another Admin may have saved changes.');
      window.dispatchEvent(new Event('arctic-visuals-saved'));
      return result.data as ArcticConfiguration;
    },
    async upload(file:File) {
      const check=await authorize();
      const types:Record<string,string>={'image/png':'png','image/jpeg':'jpg','image/webp':'webp'};
      if(!types[file.type]||!file.size||file.size>10485760)throw new Error('PNG, JPEG or WEBP images only, up to 10 MB.');
      const bitmap=await createImageBitmap(file);bitmap.close();check();
      const path=`${expected.organizationId}/${crypto.randomUUID()}.${types[file.type]}`;
      const result=await client.storage.from(ARCTIC_BUCKET).upload(path,file,{upsert:false,contentType:file.type});check();
      if(result.error)throw new Error('Image upload failed. Check Storage access.');
      return path;
    }
  };
}
export async function resolveArcticVisuals(client:SupabaseClient,config:ArcticConfiguration):Promise<ArcticVisuals> {
  const visuals=cleanVisuals(config.visuals,config.organization_id),resolved:ArcticVisuals={};
  await Promise.all(Object.entries(visuals).map(async([slot,path])=>{
    const result=await client.storage.from(ARCTIC_BUCKET).createSignedUrl(path,3600);
    if(!result.error&&result.data?.signedUrl)resolved[slot as keyof ArcticVisuals]=result.data.signedUrl;
  }));
  return resolved;
}
