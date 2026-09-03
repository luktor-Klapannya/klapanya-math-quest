import {getSupabaseClient} from '../lib/supabaseClient';
import {authSession} from '../auth/session';
export async function pilotRequest(action:'capabilities'|'provision'|'password'|'drive',body:unknown){
 const owner=authSession.getCurrentUser();if(authSession.getAdapterMode()!=='supabase'||!owner)throw new Error('Real authentication required');
 const client=getSupabaseClient();if(!client)throw new Error('Supabase configuration required');const session=await client.auth.getSession();
 if(session.error||!session.data.session||authSession.getCurrentUser()!==owner)throw new Error('Authenticated session changed');
 let response:Response;try{response=await fetch(`/backend-api/${action}`,{method:'POST',headers:{Authorization:`Bearer ${session.data.session.access_token}`,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(110000)});}catch{throw new Error('Pilot API unavailable or response uncertain. Retry the same form and operation ID.');}
 if(authSession.getCurrentUser()!==owner||authSession.getAdapterMode()!=='supabase')throw new Error('Account changed');
 const data=await response.json().catch(()=>({error:'Pilot API unavailable; configure the HTTPS proxy.'}));if(!response.ok)throw new Error(`${data.error||'Pilot request failed'}${data.operationId?' Operation: '+data.operationId:''}`);return data;
}
export async function filePayload(file:File){if(file.size>10485760)throw new Error('File must be at most 10 MB');const bytes=new Uint8Array(await file.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return {name:file.name,mimeType:file.type,base64:btoa(binary)};}
