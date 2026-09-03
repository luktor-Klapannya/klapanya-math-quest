const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');

http.get('http://127.0.0.1:3000/', (res) => {
  console.log('Vite server responded with HTTP status:', res.statusCode);

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-profile-'));
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const artifactDir = 'C:\\Users\\NUN\\.gemini\\antigravity\\brain\\ef2d7859-9626-4f7a-9d98-55723c3c59b2';
  
  const outDesktop = path.join(artifactDir, 'landing_live_desktop_v2.png');
  const outMobile = path.join(artifactDir, 'landing_live_mobile_v2.png');

  // Desktop Capture (1440x900)
  const cmdDesktop = `"${chromePath}" --headless=new --user-data-dir="${tempDir}" --no-first-run --no-default-browser-check --disable-gpu --window-size=1440,900 --hide-scrollbars --virtual-time-budget=6000 --screenshot="${outDesktop}" http://127.0.0.1:3000/`;
  execSync(cmdDesktop);
  console.log('Saved landing_live_desktop_v2.png - Size:', fs.statSync(outDesktop).size);

  // Mobile Capture (390x844)
  const cmdMobile = `"${chromePath}" --headless=new --user-data-dir="${tempDir}" --no-first-run --no-default-browser-check --disable-gpu --window-size=390,844 --hide-scrollbars --virtual-time-budget=6000 --screenshot="${outMobile}" http://127.0.0.1:3000/`;
  execSync(cmdMobile);
  console.log('Saved landing_live_mobile_v2.png - Size:', fs.statSync(outMobile).size);

  // Cleanup temp dir
  fs.rmSync(tempDir, { recursive: true, force: true });
}).on('error', (e) => {
  console.error('FAILED TO CONNECT TO VITE SERVER:', e.message);
  process.exit(1);
});
