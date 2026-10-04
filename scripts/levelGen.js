// Level ve daily üretiminin ortak parçası: parça tanımları, board/parça seçimi, solver.
'use strict';

const fs = require('fs');
const path = require('path');

const TYPES_PATH = path.resolve(__dirname, '../src/types/types.ts');

// Parça şekilleri oyunla tek kaynaktan gelsin: elle kopyalanınca boyutlar kayıyor ve
// üretilen board'lar parçalarla uyuşmuyordu.
function loadPieces() {
  const source = fs.readFileSync(TYPES_PATH, 'utf8');
  const pattern = /export const (\w+_PIECE): PieceMatrix = (\[[\s\S]*?\]);/g;
  const pieces = [];
  let match;
  while ((match = pattern.exec(source)) !== null) {
    const matrix = JSON.parse(match[2].replace(/,\s*\]/g, ']'));
    const cells = matrix.flat().filter(c => c === 1).length;
    pieces.push({ name: match[1], matrix, cells });
  }
  if (pieces.length === 0) throw new Error('No *_PIECE definitions found in ' + TYPES_PATH);
  return pieces;
}

const ALL_PIECES = loadPieces();

// types.ts Cell enum ile aynı
const CELL_AVAILABLE = 1;
const CELL_VOID = 2;

function rotate90CW(arr) {
  return arr[0].map((_, i) => arr.map(r => r[i])).map(r => [...r].reverse());
}

function getRotationVariants(base) {
  const variants = [], seen = new Set();
  let cur = base;
  for (let i = 0; i < 4; i++) {
    const k = JSON.stringify(cur);
    if (!seen.has(k)) { seen.add(k); variants.push(cur); }
    cur = rotate90CW(cur);
  }
  return variants;
}

function cellsOf(matrix) {
  const cells = [];
  for (let y = 0; y < matrix.length; y++)
    for (let x = 0; x < matrix[y].length; x++)
      if (matrix[y][x] === 1) cells.push({ x, y });
  return cells; // satır-öncelikli sırada, ilk eleman = çapa hücresi
}

/**
 * Exact-cover backtracking: her adımda ilk boş hücre mutlaka bir parçayla kapanmalı.
 * Bu yüzden yalnızca çapa hücresi oraya denk gelen yerleşimler denenir — saf
 * "her parça her pozisyonda" aramasına göre çözülemez adaylarda kat kat hızlı.
 */
function solveLevel(board, pieceMatrices) {
  const rows = board.length;
  const cols = board[0].length;
  const filled = board.map(row => row.map(c => c !== CELL_AVAILABLE));
  const shapes = pieceMatrices.map(m => ({
    key: JSON.stringify(m),
    variants: getRotationVariants(m).map(cellsOf),
  }));
  const used = new Array(shapes.length).fill(false);

  function firstEmpty() {
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++)
        if (!filled[y][x]) return { x, y };
    return null;
  }

  function fits(cells, ox, oy) {
    for (const c of cells) {
      const x = ox + c.x, y = oy + c.y;
      if (x < 0 || y < 0 || x >= cols || y >= rows || filled[y][x]) return false;
    }
    return true;
  }

  function setCells(cells, ox, oy, value) {
    for (const c of cells) filled[oy + c.y][ox + c.x] = value;
  }

  function bt() {
    const target = firstEmpty();
    if (!target) return used.every(Boolean);
    const triedShapes = new Set();
    for (let i = 0; i < shapes.length; i++) {
      if (used[i] || triedShapes.has(shapes[i].key)) continue;
      triedShapes.add(shapes[i].key);
      for (const cells of shapes[i].variants) {
        const ox = target.x - cells[0].x;
        const oy = target.y - cells[0].y;
        if (!fits(cells, ox, oy)) continue;
        setCells(cells, ox, oy, true);
        used[i] = true;
        if (bt()) return true;
        used[i] = false;
        setCells(cells, ox, oy, false);
      }
    }
    return false;
  }

  return bt();
}

function rng(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0x100000000; };
}

const TEMPLATES = [
  {rows:4,cols:4,voidCount:0},   // 16 hücre - easy
  {rows:4,cols:5,voidCount:2},   // 18 hücre - easy
  {rows:5,cols:4,voidCount:2},   // 18 hücre - easy
  {rows:4,cols:5,voidCount:0},   // 20 hücre - medium
  {rows:5,cols:4,voidCount:0},   // 20 hücre - medium
  {rows:5,cols:5,voidCount:4},   // 21 hücre - medium
  {rows:5,cols:5,voidCount:2},   // 23 hücre - medium
  {rows:5,cols:5,voidCount:0},   // 25 hücre - medium
  {rows:5,cols:6,voidCount:4},   // 26 hücre - medium
  {rows:6,cols:5,voidCount:4},   // 26 hücre - medium
];

function generateBoard(tmpl, rand) {
  const { rows, cols, voidCount } = tmpl;
  const board = Array.from({ length: rows }, () => Array(cols).fill(CELL_AVAILABLE));
  const cands = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) cands.push([r, c]);
  for (let i = cands.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [cands[i], cands[j]] = [cands[j], cands[i]];
  }
  let placed = 0;
  for (const [r, c] of cands) {
    if (placed >= voidCount) break;
    board[r][c] = CELL_VOID;
    placed++;
  }
  return board;
}

function selectPieces(avail, difficulty, rand) {
  const pool = difficulty === 'easy'
    ? ALL_PIECES.filter(p => p.cells <= 3)
    : difficulty === 'medium'
      ? ALL_PIECES.filter(p => p.cells <= 4)
      : ALL_PIECES;
  const minP = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5;
  const maxP = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 8 : 10;

  for (let att = 0; att < 300; att++) {
    const pieces = []; let total = 0, iters = 0;
    while (total < avail && iters < 80) {
      iters++;
      const p = pool[Math.floor(rand() * pool.length)];
      if (total + p.cells <= avail) { pieces.push(p); total += p.cells; }
    }
    if (total === avail && pieces.length >= minP && pieces.length <= maxP) {
      for (let i = pieces.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
      }
      return pieces;
    }
  }
  return [];
}

module.exports = {
  ALL_PIECES,
  CELL_AVAILABLE,
  CELL_VOID,
  TEMPLATES,
  generateBoard,
  rng,
  selectPieces,
  solveLevel,
};
