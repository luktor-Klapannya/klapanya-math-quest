const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

http.get('http://127.0.0.1:3000/', (res) => {
  console.log('HTTP GET Status:', res.statusCode);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const artifactDir = 'C:\\Users\\NUN\\.gemini\\antigravity\\brain\\ef2d7859-9626-4f7a-9d98-55723c3c59b2';
  const outDesktop = path.join(artifactDir, 'screenshot_landing_desktop_1440x900.png');
  const outMobile = path.join(artifactDir, 'screenshot_landing_mobile_390x844.png');

  // Desktop
  const cmdDesktop = `"${chromePath}" --headless=new --disable-gpu --window-size=1440,900 --hide-scrollbars --virtual-time-budget=5000 --screenshot="${outDesktop}" http://127.0.0.1:3000/`;
  execSync(cmdDesktop);
  console.log('Desktop screenshot saved. Size:', fs.statSync(outDesktop).size);

  // Mobile
  const cmdMobile = `"${chromePath}" --headless=new --disable-gpu --window-size=390,844 --hide-scrollbars --virtual-time-budget=5000 --screenshot="${outMobile}" http://127.0.0.1:3000/`;
  execSync(cmdMobile);
  console.log('Mobile screenshot saved. Size:', fs.statSync(outMobile).size);
}).on('error', (e) => {
  console.error('Connection error:', e.message);
});
