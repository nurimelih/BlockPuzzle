import { calculateScore, ScoreInput } from '../scoring';

describe('calculateScore', () => {
  const baseInput: ScoreInput = {
    moves: 5,
    time: 30,
    hintCount: 0,
    pieceCount: 5,
    boardSize: 25,
  };

  it('returns 3 stars for perfect play', () => {
    const result = calculateScore(baseInput);
    expect(result.stars).toBe(3);
    expect(result.grade).toBe('S');
    expect(result.moveEfficiency).toBe(1);
  });

  it('returns lower stars for more moves', () => {
    const result = calculateScore({ ...baseInput, moves: 15 });
    expect(result.stars).toBeLessThan(3);
    expect(result.score).toBeLessThan(1000);
  });

  it('applies hint penalty', () => {
    const noHint = calculateScore(baseInput);
    const withHint = calculateScore({ ...baseInput, hintCount: 2 });
    expect(withHint.stars).toBeLessThan(noHint.stars);
    expect(withHint.score).toBeLessThan(noHint.score);
  });

  it('gives time bonus for fast completion', () => {
    const fast = calculateScore({ ...baseInput, time: 5 });
    const slow = calculateScore({ ...baseInput, time: 300 });
    expect(fast.timeBonus).toBeGreaterThan(slow.timeBonus);
    expect(fast.score).toBeGreaterThanOrEqual(slow.score);
  });

  it('clamps stars between 0.5 and 3', () => {
    // Worst case: many moves, many hints, slow time
    const worst = calculateScore({
      moves: 100,
      time: 600,
      hintCount: 5,
      pieceCount: 3,
      boardSize: 9,
    });
    expect(worst.stars).toBeGreaterThanOrEqual(0.5);
    expect(worst.stars).toBeLessThanOrEqual(3);

    // Best case: perfect
    const best = calculateScore({
      moves: 3,
      time: 1,
      hintCount: 0,
      pieceCount: 3,
      boardSize: 9,
    });
    expect(best.stars).toBe(3);
  });

  it('clamps score between 0 and 1000', () => {
    const worst = calculateScore({
      moves: 100,
      time: 600,
      hintCount: 10,
      pieceCount: 2,
      boardSize: 4,
    });
    expect(worst.score).toBeGreaterThanOrEqual(0);
    expect(worst.score).toBeLessThanOrEqual(1000);
  });

  it('stars are in 0.5 increments', () => {
    const inputs: ScoreInput[] = [
      baseInput,
      { ...baseInput, moves: 8 },
      { ...baseInput, moves: 12 },
      { ...baseInput, moves: 20 },
      { ...baseInput, moves: 50, hintCount: 3 },
    ];

    for (const input of inputs) {
      const result = calculateScore(input);
      expect(result.stars % 0.5).toBe(0);
    }
  });

  it('handles edge case: 0 time', () => {
    const result = calculateScore({ ...baseInput, time: 0 });
    expect(result.stars).toBeGreaterThanOrEqual(0.5);
    expect(result.stars).toBeLessThanOrEqual(3);
  });

  it('handles edge case: 0 moves', () => {
    const result = calculateScore({ ...baseInput, moves: 0 });
    expect(result.stars).toBe(3);
  });

  it('grade S for 3 stars', () => {
    const result = calculateScore(baseInput);
    expect(result.stars).toBe(3);
    expect(result.grade).toBe('S');
  });

  it('grade mapping is correct', () => {
    // Force low stars with bad play
    const result = calculateScore({
      moves: 50,
      time: 300,
      hintCount: 2,
      pieceCount: 3,
      boardSize: 9,
    });
    if (result.stars >= 2.5) expect(result.grade).toMatch(/^[SA]$/);
    else if (result.stars >= 1.5) expect(result.grade).toBe('B');
    else expect(result.grade).toBe('C');
  });
});
