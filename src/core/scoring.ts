export type ScoreGrade = 'S' | 'A' | 'B' | 'C';

export type ScoreResult = {
  score: number;
  stars: number;
  grade: ScoreGrade;
  moveEfficiency: number;
  timeBonus: number;
};

export type ScoreInput = {
  moves: number;
  time: number;
  hintCount: number;
  pieceCount: number;
  boardSize: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Calculate score for a completed level.
 *
 * - moveEfficiency: optimalMoves / actualMoves (1.0 = perfect)
 * - timeBonus: based on time relative to expected time (pieceCount * 10s per piece + boardSize factor)
 * - hintPenalty: -0.5 stars per hint used
 * - stars: 0.5 to 3.0 (in 0.5 increments)
 * - score: 0 to 1000
 */
export function calculateScore(input: ScoreInput): ScoreResult {
  const { moves, time, hintCount, pieceCount, boardSize } = input;

  // Move efficiency: optimal is 1 move per piece
  const optimalMoves = pieceCount;
  const moveEfficiency = optimalMoves / Math.max(moves, 1);

  // Time bonus: expected time scales with piece count and board size
  // Base: 10 seconds per piece + 0.5s per board cell
  const expectedTime = pieceCount * 10 + boardSize * 0.5;
  const timeRatio = expectedTime / Math.max(time, 1);
  const timeBonus = clamp(timeRatio, 0, 1);

  // Hint penalty
  const hintPenalty = hintCount * 0.5;

  // Raw stars: moveEfficiency contributes most, time is secondary
  const rawStars = moveEfficiency * 2.5 + timeBonus * 0.5 - hintPenalty;

  // Round to nearest 0.5 and clamp
  const stars = clamp(Math.round(rawStars * 2) / 2, 0.5, 3);

  // Score: 0-1000 scale
  const rawScore = (moveEfficiency * 700) + (timeBonus * 300) - (hintCount * 100);
  const score = Math.round(clamp(rawScore, 0, 1000));

  // Grade based on stars
  let grade: ScoreGrade;
  if (stars === 3) {
    grade = 'S';
  } else if (stars >= 2.5) {
    grade = 'A';
  } else if (stars >= 1.5) {
    grade = 'B';
  } else {
    grade = 'C';
  }

  return {
    score,
    stars,
    grade,
    moveEfficiency: Math.round(moveEfficiency * 100) / 100,
    timeBonus: Math.round(timeBonus * 100) / 100,
  };
}
