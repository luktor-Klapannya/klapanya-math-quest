import {createServer} from 'node:http';
import {Readable} from 'node:stream';
import {createClient} from '@supabase/supabase-js';
import {campaignHandler} from '../server/campaign-api.ts';
const e=process.env;
for(const key of ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','GAME_ALLOWED_ORIGIN','GAME_STAGING_PROJECT_REF','GAME_PRODUCTION_PROJECT_REF'])
 if(!e[key])throw new Error(`Missing server configuration: ${key}`);
const url=new URL(e.SUPABASE_URL),origin=new URL(e.GAME_ALLOWED_ORIGIN);
if(url.href!==`https://${e.GAME_STAGING_PROJECT_REF}.supabase.co/`||e.GAME_STAGING_PROJECT_REF===e.GAME_PRODUCTION_PROJECT_REF)throw new Error('Separate staging project required');
if(origin.origin!==e.GAME_ALLOWED_ORIGIN||origin.protocol!=='https:')throw new Error('Exact staging HTTPS origin required');
const client=createClient(url.href,e.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
const handle=campaignHandler(client,origin.origin);
const server=createServer(async(req,res)=>{
 try{
  if(!['/game-api/campaign/start','/game-api/campaign/verify'].includes((req.url||'').split('?')[0])){res.writeHead(404);res.end();return;}
  const request=new Request(`http://127.0.0.1${req.url}`,{method:req.method,headers:req.headers,
   ...(!['GET','HEAD'].includes(req.method||'')?{body:Readable.toWeb(req),duplex:'half'}:{})});
  const response=await handle(request);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(503);res.end('Service unavailable');}
});
server.requestTimeout=15000;server.headersTimeout=15000;
server.listen(Number(e.GAME_API_PORT||8787),'127.0.0.1',()=>console.log('Game staging API listening on loopback; configure the staging HTTPS reverse proxy.'));
