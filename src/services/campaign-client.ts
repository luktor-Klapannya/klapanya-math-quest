import {getSupabaseClient} from '../lib/supabaseClient';
import {authSession} from '../auth/session';
export async function campaignRequest(action:'start'|'verify',body:unknown,owner:string){
 if(authSession.getAdapterMode()!=='supabase'||authSession.getCurrentUser()?.id!==owner)throw new Error('Authenticated owner required');
 const client=getSupabaseClient();if(!client)throw new Error('Supabase configuration required');
 const {data,error}=await client.auth.getSession();
 if(error||!data.session)throw new Error('Authentication required');
 const base=(import.meta.env.VITE_GAME_API_BASE_URL||'').replace(/\/$/,'');
 const response=await fetch(`${base}/game-api/campaign/${action}`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${data.session.access_token}`},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
 if(authSession.getCurrentUser()?.id!==owner)throw new Error('Account changed');
 if(!response.ok)throw new Error(`Campaign request failed (${response.status})`);
 return response.json();
}
