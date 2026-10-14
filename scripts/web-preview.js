/* eslint-disable no-console */
/**
 * Quick visual preview: builds the web export, serves it, and screenshots key
 * game states in headless Chromium. Not a replacement for device testing —
 * fonts/shadows/haptics differ and ads are stubbed (see web-stubs/).
 *
 *   yarn preview:web                 # build + all scenarios
 *   yarn preview:web --no-build      # reuse the last build
 *   yarn preview:web hardIntro win   # only the named scenarios
 *
 * The backend is mocked: remote levels are the 10 local levels repeated, so
 * level 15 (index 14) is a timed level. Output: .web-preview/shots/*.png
 */
require('sucrase/register/ts');
const { execSync } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, '.web-preview');
const DIST = path.join(OUT, 'dist');
const SHOTS = path.join(OUT, 'shots');

const loadPlaywright = () => {
  try {
    return require('playwright');
  } catch {
    const globalRoot = execSync('npm root -g').toString().trim();
    return require(path.join(globalRoot, 'playwright'));
  }
};

// ---------- Mock backend ----------

const { LEVELS } = require(path.join(ROOT, 'src/core/levels.ts'));
const REMOTE_LEVEL_COUNT = 20;

const mockBackend = () => {
  const boards = LEVELS.map((l, i) => ({ id: i, matrix: l.board }));
  const pieces = [];
  const levels = [];
  for (let n = 0; n < REMOTE_LEVEL_COUNT; n++) {
    const source = LEVELS[n % LEVELS.length];
    const pieceIds = source.pieces.map(matrix => {
      pieces.push({ id: pieces.length, matrix });
      return pieces.length - 1;
    });
    levels.push({
      level_number: n,
      board_id: n % LEVELS.length,
      piece_ids: pieceIds,
    });
  }
  const adSettings = {
    rewardedAdsActive: true,
    interstitialAdsActive: false,
    // Ads can't load on web; this keeps the hint button visible
    forceToShowHints: true,
  };
  return url => {
    if (url.includes('/app_config')) {
      return [{ value: JSON.stringify(adSettings) }];
    }
    if (url.includes('/rest/v1/levels')) return levels;
    if (url.includes('/rest/v1/boards')) return boards;
    if (url.includes('/rest/v1/pieces')) return pieces;
    return [];
  };
};

// ---------- Static server ----------

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
};

const FONT_CSS = `<style>
@font-face { font-family: 'JustMeAgainDownHereRegular'; src: url('/__fonts/JustMeAgainDownHereRegular.ttf'); }
@font-face { font-family: 'Just Me Again Down Here'; src: url('/__fonts/JustMeAgainDownHereRegular.ttf'); }
@font-face { font-family: 'Ionicons'; src: url('/__fonts/Ionicons.ttf'); }
</style>`;

const FONT_FILES = {
  'JustMeAgainDownHereRegular.ttf': path.join(ROOT, 'assets/fonts/JustMeAgainDownHereRegular.ttf'),
  'Ionicons.ttf': path.join(ROOT, 'node_modules/react-native-vector-icons/Fonts/Ionicons.ttf'),
};

const startServer = () =>
  new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let file;
      if (urlPath.startsWith('/__fonts/')) {
        file = FONT_FILES[path.basename(urlPath)];
      } else {
        file = path.join(DIST, urlPath);
        if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
          file = path.join(DIST, 'index.html');
        }
      }
      if (!file || !fs.existsSync(file)) {
        res.writeHead(404).end();
        return;
      }
      let body = fs.readFileSync(file);
      if (file.endsWith('index.html')) {
        body = body.toString().replace('</head>', `${FONT_CSS}</head>`);
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream' });
      res.end(body);
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });

// ---------- Scenarios ----------

const completed = count =>
  JSON.stringify(
    Array.from({ length: count }, (_, i) => ({ levelIndex: i, moves: 5, time: 30, stars: 3, score: 900 })),
  );

const yesterday = () => {
  const d = new Date(Date.now() - 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// A nickname skips the leaderboard prompt; without a playerId nothing is submitted
const BASE_STORAGE = { tutorialSeen: 'true', language: 'tr', playerNickname: 'Preview' };
const TIMED_LEVEL_INDEX = 14;

const pressText = async (page, text) => {
  // Labels often sit in pointerEvents="none" views; click through to the pressable
  await page.getByText(text, { exact: true }).first().click({ force: true });
  await page.waitForTimeout(600);
};

// Scattered pieces can cover the footer, so fire the click on the button itself
const pressHint = async page => {
  await page.locator('[data-testid="hint-button"]').dispatchEvent('click');
  await page.waitForTimeout(500);
};

const scenarios = {
  home: {
    storage: {
      ...BASE_STORAGE,
      completedLevels: completed(4),
      dailyStreak: '6',
      dailyLastDate: yesterday(),
      streakFreezes: '1',
    },
    run: async () => {},
  },
  levelStart: {
    storage: { ...BASE_STORAGE, completedLevels: completed(4), winStreak: '2' },
    run: async page => pressText(page, 'Devam Et'),
  },
  hardIntro: {
    storage: { ...BASE_STORAGE, completedLevels: completed(TIMED_LEVEL_INDEX), winStreak: '4' },
    run: async page => pressText(page, 'Devam Et'),
  },
  hardPlaying: {
    storage: { ...BASE_STORAGE, completedLevels: completed(TIMED_LEVEL_INDEX), winStreak: '4' },
    run: async page => {
      await pressText(page, 'Devam Et');
      await pressText(page, 'Başla');
      await pressHint(page);
    },
  },
  hintNudge: {
    storage: { ...BASE_STORAGE, completedLevels: completed(TIMED_LEVEL_INDEX), winStreak: '4' },
    run: async page => {
      await pressText(page, 'Devam Et');
      await pressText(page, 'Başla');
      // Level 15 has a 75s limit; the nudge shows below 30% (22s) remaining
      await page.clock.fastForward(56_000);
      await page.waitForTimeout(1200);
    },
  },
  timeUp: {
    storage: { ...BASE_STORAGE, completedLevels: completed(TIMED_LEVEL_INDEX), winStreak: '4' },
    run: async page => {
      await pressText(page, 'Devam Et');
      await pressText(page, 'Başla');
      await page.clock.fastForward(120_000);
      await page.waitForTimeout(1200);
    },
  },
  timeUpNoLives: {
    storage: page => ({
      ...BASE_STORAGE,
      completedLevels: completed(TIMED_LEVEL_INDEX),
      winStreak: '7',
      lives: JSON.stringify({ lives: 0, regenStartedAt: page.startedAt - 12 * 60 * 1000 }),
    }),
    run: async page => {
      await pressText(page, 'Devam Et');
      await pressText(page, 'Başla');
      await page.clock.fastForward(120_000);
      await page.waitForTimeout(1200);
    },
  },
  win: {
    storage: { ...BASE_STORAGE, completedLevels: completed(4), winStreak: '5' },
    run: async page => {
      await pressText(page, 'Devam Et');
      for (let i = 0; i < 8; i++) {
        if (await page.getByText('Sonraki Bölüm', { exact: true }).count()) break;
        await pressHint(page);
      }
      await page.waitForTimeout(1500);
    },
  },
};

// ---------- Main ----------

const main = async () => {
  const args = process.argv.slice(2);
  const skipBuild = args.includes('--no-build');
  const selected = args.filter(a => !a.startsWith('--'));

  if (!skipBuild || !fs.existsSync(DIST)) {
    console.log('Building web export…');
    execSync(`npx expo export --platform web --output-dir ${DIST}`, { cwd: ROOT, stdio: 'inherit' });
  }
  fs.mkdirSync(SHOTS, { recursive: true });

  const server = await startServer();
  const baseUrl = `http://127.0.0.1:${server.address().port}/`;
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  const respond = mockBackend();

  const names = selected.length ? selected : Object.keys(scenarios);
  for (const name of names) {
    const scenario = scenarios[name];
    if (!scenario) {
      console.warn(`Unknown scenario: ${name}`);
      continue;
    }
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      locale: 'tr-TR',
      hasTouch: false,
    });
    const page = await context.newPage();
    page.startedAt = Date.now();
    await page.clock.install({ time: page.startedAt });

    const storage =
      typeof scenario.storage === 'function' ? scenario.storage(page) : scenario.storage;
    await page.addInitScript(items => {
      if (sessionStorage.getItem('__seeded')) return;
      for (const [k, v] of Object.entries(items)) localStorage.setItem(k, v);
      sessionStorage.setItem('__seeded', '1');
    }, storage);

    await page.route('**/rest/v1/**', route =>
      route.fulfill({ json: respond(route.request().url()) }),
    );
    // Analytics and anything else external: drop quietly
    await page.route(/posthog|googleapis|expo\.dev/, route => route.abort());

    const errors = [];
    page.on('pageerror', e => {
      // Browsers block audio until a real user gesture; irrelevant here
      if (!e.message.includes("play() failed")) errors.push(e.message);
    });

    // Remote levels replace the level list and reset the board, so wait for them
    const levelsLoaded = page.waitForRequest(/\/rest\/v1\/levels/, { timeout: 15000 });
    await page.goto(baseUrl);
    await levelsLoaded.catch(() => errors.push('levels request never fired'));
    await page.waitForTimeout(1500);
    try {
      await scenario.run(page);
    } catch (e) {
      errors.push(`scenario: ${e.message.split('\n')[0]}`);
    }
    const file = path.join(SHOTS, `${name}.png`);
    await page.screenshot({ path: file });
    console.log(`${errors.length ? '⚠' : '✓'} ${name} → ${path.relative(ROOT, file)}`);
    errors.forEach(e => console.log(`    ${e}`));
    await context.close();
  }

  await browser.close();
  server.close();
};

main().catch(e => {
  console.error(e);
  process.exit(1);
});
