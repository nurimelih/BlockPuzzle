#!/usr/bin/env node
'use strict';

/**
 * Daily challenge üretici: her gün için solver ile doğrulanmış bir bulmaca üretir ve
 * Supabase'e (boards + daily_challenges) eklenecek SQL'i yazar.
 *
 * Kullanım: node scripts/generate-daily.js [--start YYYY-MM-DD] [--days 365] [--chunk 92] [--out dir]
 *
 * Seed tarihten türetilir: aynı tarih her çalıştırmada aynı bulmacayı verir.
 * SQL `on conflict do nothing` kullanır; mevcut günlerin üzerine yazmaz.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  CELL_AVAILABLE,
  generateBoard,
  rng,
  selectPieces,
  solveLevel,
} = require('./levelGen');

const DAILY_TEMPLATES = {
  medium: [
    { rows: 5, cols: 5, voidCount: 0 },
    { rows: 5, cols: 5, voidCount: 2 },
    { rows: 5, cols: 5, voidCount: 4 },
    { rows: 5, cols: 6, voidCount: 4 },
  ],
  hard: [
    { rows: 5, cols: 6, voidCount: 0 },
    { rows: 6, cols: 5, voidCount: 2 },
    { rows: 6, cols: 6, voidCount: 2 },
    { rows: 6, cols: 6, voidCount: 4 },
  ],
};

// Hafta sonu oyuncunun daha çok vakti var: daha büyük board, daha çok parça
const MIN_PIECES = { medium: 5, hard: 7 };
const MAX_ATTEMPTS_PER_DAY = 500;

function parseArgs(argv) {
  const args = { start: null, days: 365, chunk: 92, out: os.tmpdir() };
  for (let i = 2; i < argv.length; i += 2) {
    const key = argv[i].replace(/^--/, '');
    const value = argv[i + 1];
    if (key === 'start') args.start = value;
    else if (key === 'days') args.days = Number(value);
    else if (key === 'chunk') args.chunk = Number(value);
    else if (key === 'out') args.out = value;
    else throw new Error('Unknown argument: ' + argv[i]);
  }
  return args;
}

// Uygulamadaki localDateStr ile aynı format (yerel gün, YYYY-MM-DD)
function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function seedFromDate(dateStr) {
  // FNV-1a: tarih → deterministik 32-bit seed
  let h = 0x811c9dc5;
  for (const ch of 'daily-' + dateStr) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

function difficultyFor(date) {
  const day = date.getDay();
  return day === 0 || day === 6 ? 'hard' : 'medium';
}

function puzzleKey(board, pieces) {
  return JSON.stringify(board) + '|' + pieces.map(p => p.name).sort().join(',');
}

function generateDay(dateStr, difficulty, seenKeys) {
  const rand = rng(seedFromDate(dateStr));
  const templates = DAILY_TEMPLATES[difficulty];

  for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_DAY; attempt++) {
    const template = templates[Math.floor(rand() * templates.length)];
    const board = generateBoard(template, rand);
    const avail = board.flat().filter(c => c === CELL_AVAILABLE).length;
    const pieces = selectPieces(avail, 'hard', rand);
    if (pieces.length < MIN_PIECES[difficulty]) continue;

    const key = puzzleKey(board, pieces);
    if (seenKeys.has(key)) continue;
    if (!solveLevel(board, pieces.map(p => p.matrix))) continue;

    seenKeys.add(key);
    return { date: dateStr, difficulty, board, pieces };
  }
  throw new Error('Could not generate a puzzle for ' + dateStr);
}

function toSql(days) {
  const rows = days.map(d => {
    const names = d.pieces.map(p => `'${p.name}'`).join(',');
    return `  ('${d.date}', '${d.difficulty}', 'daily-${d.date}', '${JSON.stringify(d.board)}'::jsonb, array[${names}]::text[])`;
  });

  // Parçalar id yerine isimle eşlenir; DB'deki id'ler değişse bile yanlış parça yazılmaz.
  // Bir isim çözülemezse o gün eklenmez (resolved_count kontrolü).
  return `with input(date, difficulty, board_name, board, piece_names) as (values
${rows.join(',\n')}
),
resolved as (
  select i.*,
    (select array_agg(p.id order by t.ord)
       from unnest(i.piece_names) with ordinality t(name, ord)
       join pieces p on p.name = t.name) as piece_ids
  from input i
),
valid as (
  select * from resolved
  where cardinality(piece_ids) = cardinality(piece_names)
    and not exists (select 1 from daily_challenges dc where dc.date = resolved.date)
),
new_boards as (
  insert into boards (name, matrix)
  select board_name, board from valid
  on conflict (name) do nothing
  returning id, name
)
insert into daily_challenges (date, board_id, piece_ids, difficulty)
select v.date, b.id, v.piece_ids, v.difficulty
from valid v join new_boards b on b.name = v.board_name
on conflict (date) do nothing
returning date;
`;
}

function main() {
  const args = parseArgs(process.argv);
  const start = args.start ? parseDate(args.start) : new Date();
  const seenKeys = new Set();
  const days = [];

  for (let i = 0; i < args.days; i++) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    days.push(generateDay(formatDate(date), difficultyFor(date), seenKeys));
  }

  const files = [];
  for (let i = 0; i < days.length; i += args.chunk) {
    const chunk = days.slice(i, i + args.chunk);
    const file = path.join(args.out, `daily-${chunk[0].date}_${chunk[chunk.length - 1].date}.sql`);
    fs.writeFileSync(file, toSql(chunk), 'utf8');
    files.push(file);
  }

  const hard = days.filter(d => d.difficulty === 'hard').length;
  console.log(`Generated ${days.length} days (${days[0].date} → ${days[days.length - 1].date}), ${hard} hard`);
  files.forEach(f => console.log('  ' + f));
}

main();
