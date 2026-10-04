#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {
  CELL_AVAILABLE,
  TEMPLATES,
  generateBoard,
  rng,
  selectPieces,
  solveLevel,
} = require('./levelGen');

const OUT_PATH = path.resolve(__dirname, '../src/core/levels_auto_generated.ts');

function difficultyFor(idx) {
  if (idx < 20) return 'easy';
  return 'medium';
}

const TARGET = 100;
const levels = [];
let seed = 42, attempts = 0;

console.log('Generating ' + TARGET + ' solver-validated levels...');

while (levels.length < TARGET && attempts < TARGET * 60) {
  attempts++;
  seed += 7;
  const idx = levels.length;
  const diff = difficultyFor(idx);
  const tmplBias = diff === 'easy' ? 0 : 3;
  const tmplIdx = (tmplBias + (seed % 3) + TEMPLATES.length) % TEMPLATES.length;
  const rand = rng(seed);
  const tmpl = TEMPLATES[tmplIdx];
  const board = generateBoard(tmpl, rand);
  const avail = board.flat().filter(c => c === CELL_AVAILABLE).length;
  if (avail < 4) continue;
  const pieces = selectPieces(avail, diff, rand);
  if (pieces.length === 0) continue;
  if (solveLevel(board, pieces.map(p => p.matrix))) {
    levels.push({ board, pieces });
    if (levels.length % 20 === 0)
      console.log('  ' + levels.length + '/' + TARGET + ' (' + attempts + ' attempts)');
  }
}

console.log('\nGenerated ' + levels.length + ' levels in ' + attempts + ' attempts.');

const usedNames = [...new Set(levels.flatMap(l => l.pieces.map(p => p.name)))].sort();
let code = `// Bu dosya scripts/generate-levels.js tarafından üretilir — elle düzenleme.
import {
  LevelDefinition,
${usedNames.map(n => '  ' + n + ',').join('\n')}
} from '../types/types.ts';

export const GENERATED_LEVELS: LevelDefinition[] = [
`;

for (const level of levels) {
  const rows = level.board.map(row => '    [' + row.join(', ') + ']').join(',\n');
  const pnames = level.pieces.map(p => p.name).join(', ');
  code += `  {\n    board: [\n${rows},\n    ],\n    pieces: [${pnames}],\n  },\n`;
}
code += '];\n';

fs.writeFileSync(OUT_PATH, code, 'utf8');
console.log('Written to ' + OUT_PATH);
