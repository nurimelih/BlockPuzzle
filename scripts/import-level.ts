#!/usr/bin/env npx ts-node
/**
 * Level import scripti
 *
 * Kullanım:
 *   npx ts-node scripts/import-level.ts
 *
 * Script sırasıyla:
 *   1. Board matrisini boards tablosuna ekler (duplicate ise mevcut id'yi döner)
 *   2. Piece id listesini doğrular (hepsi pieces tablosunda olmalı)
 *   3. levels tablosuna yeni level ekler
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// .env.local oku
const envPath = path.join(__dirname, '..', '.env.local');
const env = fs.readFileSync(envPath, 'utf-8');
for (const line of env.split('\n')) {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
}

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY eksik. .env.local dosyasını kontrol et.');
  process.exit(1);
}

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

// ─── BURAYA YAZ ──────────────────────────────────────────────────────────────

type LevelInput = {
  boardName: string;
  boardMatrix: number[][];
  pieceIds: number[];
  levelNumber?: number; // belirtilmezse otomatik son+1
};

const LEVELS: LevelInput[] = [
  {
    boardName: 'cross-5x5',
    boardMatrix: [
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
    ],
    pieceIds: [1, 2, 3, 4],
  },
];

// ─────────────────────────────────────────────────────────────────────────────

async function getOrCreateBoard(name: string, matrix: number[][]): Promise<number> {
  // Aynı matris zaten var mı?
  const res = await fetch(`${SUPABASE_URL}/rest/v1/boards?select=id,matrix`, { headers });
  const boards = (await res.json()) as { id: number; matrix: number[][] }[];

  const existing = boards.find(
    b => JSON.stringify(b.matrix) === JSON.stringify(matrix),
  );
  if (existing) {
    console.log(`Board zaten var, id: ${existing.id}`);
    return existing.id;
  }

  const createRes = await fetch(`${SUPABASE_URL}/rest/v1/boards`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name, matrix }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Board oluşturulamadı: ${err}`);
  }

  const created = (await createRes.json()) as { id: number }[];
  const newId = created[0].id;
  console.log(`Yeni board oluşturuldu, id: ${newId}`);
  return newId;
}

async function listAndValidatePieceIds(pieceIds: number[]): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/pieces?select=id,name,matrix&order=id`, { headers });
  const pieces = (await res.json()) as { id: number; name: string; matrix: number[][] }[];

  console.log('Mevcut parçalar:');
  for (const p of pieces) {
    const marker = pieceIds.includes(p.id) ? ' ✓' : '';
    console.log(`  [${p.id}] ${p.name}${marker}`);
  }
  console.log();

  const existingIds = new Set(pieces.map(p => p.id));
  const missing = pieceIds.filter(id => !existingIds.has(id));
  if (missing.length > 0) {
    throw new Error(`Şu piece id'ler bulunamadı: ${missing.join(', ')}`);
  }
}

async function getNextLevelNumber(): Promise<number> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/levels?select=level_number&order=level_number.desc&limit=1`,
    { headers },
  );
  const levels = (await res.json()) as { level_number: number }[];
  return levels.length > 0 ? levels[0].level_number + 1 : 1;
}

async function createLevel(boardId: number, pieceIds: number[], levelNumber: number): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/levels`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ board_id: boardId, piece_ids: pieceIds, level_number: levelNumber }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Level oluşturulamadı: ${err}`);
  }

  const created = (await res.json()) as { id: number }[];
  console.log(`Level oluşturuldu — level_number: ${levelNumber}, id: ${created[0].id}`);
}

async function main() {
  console.log('Level import başlıyor...\n');

  await listAndValidatePieceIds(LEVELS.flatMap(l => l.pieceIds));

  for (const level of LEVELS) {
    const boardId = await getOrCreateBoard(level.boardName, level.boardMatrix);
    const levelNumber = level.levelNumber ?? await getNextLevelNumber();
    await createLevel(boardId, level.pieceIds, levelNumber);
  }

  console.log('\nTamamlandı.');
}

main().catch(err => {
  console.error('\nHata:', err.message);
  process.exit(1);
});
