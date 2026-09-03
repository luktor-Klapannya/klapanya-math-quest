import {createServer} from 'node:http';
import {Readable} from 'node:stream';
import {createClient} from '@supabase/supabase-js';
import {backendPilotHandler} from '../server/backend-pilot-api.ts';
const e=process.env;
for(const key of ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','GAME_ALLOWED_ORIGIN','GAME_STAGING_PROJECT_REF','GAME_PRODUCTION_PROJECT_REF'])if(!e[key])throw new Error(`Missing server configuration: ${key}`);
const url=new URL(e.SUPABASE_URL),origin=new URL(e.GAME_ALLOWED_ORIGIN);
if(url.href!==`https://${e.GAME_STAGING_PROJECT_REF}.supabase.co/`||e.GAME_STAGING_PROJECT_REF===e.GAME_PRODUCTION_PROJECT_REF)throw new Error('Confirmed separate staging project required');
if(origin.origin!==e.GAME_ALLOWED_ORIGIN||origin.protocol!=='https:')throw new Error('Exact staging HTTPS origin required');
const client=createClient(url.href,e.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
const handle=backendPilotHandler(client,origin.origin,{rootFolderId:e.GOOGLE_DRIVE_LIBRARY_ROOT_FOLDER_ID,clientId:e.GOOGLE_DRIVE_CLIENT_ID,clientSecret:e.GOOGLE_DRIVE_CLIENT_SECRET,refreshToken:e.GOOGLE_DRIVE_REFRESH_TOKEN});
const server=createServer(async(req,res)=>{try{
 if(!/^\/backend-api\/(capabilities|provision|password|drive)$/.test(req.url||'')){res.writeHead(404);res.end();return;}
 const request=new Request(`http://127.0.0.1${req.url}`,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method||'')?{body:Readable.toWeb(req),duplex:'half'}:{})});
 const response=await handle(request);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
}catch{res.writeHead(503);res.end('Pilot service unavailable');}});
server.requestTimeout=120000;server.headersTimeout=15000;
server.listen(Number(e.BACKEND_API_PORT||8788),'127.0.0.1',()=>console.log('Pilot API on loopback. Requires staging HTTPS proxy; no migration or seed is applied.'));
