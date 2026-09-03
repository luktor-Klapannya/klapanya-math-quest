import {readFile,readdir} from 'node:fs/promises';
import {loadEnv} from 'vite';
import assert from 'node:assert/strict';
// Run after npm run build. Checks public config only; never logs key values.
const env=loadEnv('production',process.cwd(),'VITE_');
assert.equal(env.VITE_AUTH_MODE,'supabase','Deployment must explicitly use real Supabase auth');
assert.equal(env.VITE_SUPABASE_URL,'https://olkwebybofeuzwiaiykf.supabase.co','Wrong Game Supabase project');
assert.ok(env.VITE_SUPABASE_ANON_KEY,'Public Supabase key missing');
const files=await readdir('dist/assets');
const bundle=(await Promise.all(files.filter(name=>name.endsWith('.js')).map(name=>readFile(`dist/assets/${name}`,'utf8')))).join('\n');
assert.ok(bundle.includes(env.VITE_SUPABASE_URL),'Vite failed to embed Supabase URL');
assert.ok(bundle.includes(env.VITE_SUPABASE_ANON_KEY),'Vite failed to embed public key');
assert.ok((await readFile('dist/.htaccess','utf8')).includes('/index.html'),'Missing SPA fallback');
console.log('PASS: Real-auth Game production config is embedded and SPA fallback is packaged.');
