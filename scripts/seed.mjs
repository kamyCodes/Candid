// npm run seed
// Opens Candid with realistic demo data loaded. Data lives in the browser's
// localStorage, so this script points a browser at /?seed and lets the app
// populate itself. It starts the dev server first when nothing is listening.
import { spawn, exec } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const PORT = process.env.CANDID_PORT || '3000';
const BASE_URL = `http://localhost:${PORT}`;
const SEED_URL = `${BASE_URL}/?seed`;

async function serverIsUp() {
  try {
    const res = await fetch(`${BASE_URL}/`);
    return res.ok;
  } catch {
    return false;
  }
}

function startDevServer() {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const child = spawn(npm, ['run', 'dev', '--', '--port', PORT], {
    detached: true,
    stdio: 'ignore',
  });
  child.unref();
}

function openInBrowser(url) {
  const command =
    process.platform === 'win32'
      ? `start "" "${url}"`
      : process.platform === 'darwin'
        ? `open "${url}"`
        : `xdg-open "${url}"`;
  exec(command, (error) => {
    if (error) {
      console.warn(`Could not open a browser automatically (${error.message}).`);
      console.log(`Open this URL yourself: ${SEED_URL}`);
    }
  });
}

console.log(`Seeding Candid with demo data (${SEED_URL})`);

if (!(await serverIsUp())) {
  console.log('No app running yet, starting the dev server...');
  startDevServer();

  let up = false;
  for (let attempt = 1; attempt <= 60; attempt++) {
    await sleep(1000);
    if (await serverIsUp()) {
      up = true;
      break;
    }
    if (attempt % 10 === 0) {
      console.log(`  still starting... (${attempt}s)`);
    }
  }

  if (!up) {
    console.error('The dev server did not come up within 60s. Run `npm run dev` yourself, then retry.');
    process.exit(1);
  }
}

openInBrowser(SEED_URL);
console.log('Demo candidates loaded in the browser tab that just opened.');
console.log('Note: seeding replaces whatever candidates were stored in that browser.');
console.log('To start fresh later, clear the candidates and activity keys (see the README, Data and privacy).');
