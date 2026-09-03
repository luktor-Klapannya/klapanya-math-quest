import fs from 'fs';
import path from 'path';
import https from 'https';

const baseUrl = 'https://raw.githubusercontent.com/warpdotdev/common-skills/main/.agents/skills/skill-doctor';
const targetDir = path.resolve(process.cwd(), '.agents/skills/skill-doctor');

const files = [
  'SKILL.md',
  'references/supported-harnesses.md',
  'references/skill-improvements.md',
  'scorers/code-quality.md',
  'scorers/efficiency.md',
  'scripts/collect_sessions.py',
  'scripts/render_report.py',
  'scripts/warp_decoder.py'
];

async function downloadFile(relPath) {
  const url = `${baseUrl}/${relPath}`;
  const outPath = path.join(targetDir, relPath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(outPath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`Downloaded: ${relPath}`);
          resolve(true);
        });
      } else {
        console.warn(`Skipped/Not found (${res.statusCode}): ${relPath}`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.warn(`Error downloading ${relPath}:`, err.message);
      resolve(false);
    });
  });
}

async function run() {
  console.log('Downloading complete skill-doctor suite from warpdotdev/common-skills...');
  for (const f of files) {
    await downloadFile(f);
  }
  console.log('Finished downloading skill-doctor suite.');
}

run();
