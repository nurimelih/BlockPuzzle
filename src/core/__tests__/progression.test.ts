import {
  consumeLife,
  freezesAfterCompletion,
  getStreakMultiplier,
  getTimeLimit,
  LIFE_REGEN_MS,
  LIVES_MAX,
  msUntilNextLife,
  regenLives,
  resolveDailyStreak,
  shouldShowInterstitial,
} from '../progression.ts';
import { LevelDefinition } from '../../types/types.ts';

describe('lives', () => {
  const t0 = 1_000_000;

  it('regenerates one life per interval up to the max', () => {
    const state = { lives: 0, regenStartedAt: t0 };
    expect(regenLives(state, t0 + LIFE_REGEN_MS - 1).lives).toBe(0);
    expect(regenLives(state, t0 + LIFE_REGEN_MS).lives).toBe(1);
    expect(regenLives(state, t0 + LIFE_REGEN_MS * 10).lives).toBe(LIVES_MAX);
  });

  it('keeps partial regen progress', () => {
    const state = { lives: 0, regenStartedAt: t0 };
    const after = regenLives(state, t0 + LIFE_REGEN_MS + 1000);
    expect(after.lives).toBe(1);
    expect(msUntilNextLife(after, t0 + LIFE_REGEN_MS + 1000)).toBe(
      LIFE_REGEN_MS - 1000,
    );
  });

  it('starts the regen clock when the first life is lost', () => {
    const full = { lives: LIVES_MAX, regenStartedAt: 0 };
    const after = consumeLife(full, t0)!;
    expect(after.lives).toBe(LIVES_MAX - 1);
    expect(after.regenStartedAt).toBe(t0);
  });

  it('refuses to consume when empty', () => {
    expect(consumeLife({ lives: 0, regenStartedAt: t0 }, t0 + 10)).toBeNull();
  });
});

describe('getStreakMultiplier', () => {
  it('follows the tiers', () => {
    expect(getStreakMultiplier(0)).toBe(1);
    expect(getStreakMultiplier(2)).toBe(1);
    expect(getStreakMultiplier(3)).toBe(1.5);
    expect(getStreakMultiplier(6)).toBe(2);
    expect(getStreakMultiplier(25)).toBe(3);
  });
});

describe('getTimeLimit', () => {
  const level: LevelDefinition = {
    board: [
      [1, 1],
      [1, 1],
    ],
    pieces: [[[1, 1]], [[1, 1]]],
  };

  it('never times onboarding levels', () => {
    expect(getTimeLimit(level, 4)).toBeUndefined();
  });

  it('times every 5th level after onboarding', () => {
    expect(getTimeLimit(level, 13)).toBeUndefined();
    // 2 pieces * 10 + 4 cells * 0.5 = 22s * 1.5 = 33 → rounded up to 35
    expect(getTimeLimit(level, 14)).toBe(35);
  });

  it('prefers the explicit limit', () => {
    expect(getTimeLimit({ ...level, timeLimit: 45 }, 3)).toBe(45);
    expect(getTimeLimit({ ...level, timeLimit: 0 }, 14)).toBeUndefined();
  });
});

describe('shouldShowInterstitial', () => {
  const now = 10_000_000;
  const pacing = { levelsSinceAd: 4, lastAdAt: 0 };

  it('shows when all conditions hold', () => {
    expect(shouldShowInterstitial(pacing, now, 10)).toBe(true);
  });

  it('waits for new players', () => {
    expect(shouldShowInterstitial(pacing, now, 2)).toBe(false);
  });

  it('respects the level count and the time gap', () => {
    expect(
      shouldShowInterstitial({ ...pacing, levelsSinceAd: 3 }, now, 10),
    ).toBe(false);
    expect(
      shouldShowInterstitial({ ...pacing, lastAdAt: now - 60_000 }, now, 10),
    ).toBe(false);
  });
});

describe('resolveDailyStreak', () => {
  it('keeps the streak when played yesterday', () => {
    const r = resolveDailyStreak(
      { lastDate: '2026-03-01', streak: 4, freezes: 0 },
      '2026-03-02',
    );
    expect(r.streak).toBe(4);
    expect(r.usedFreeze).toBe(false);
  });

  it('bridges a missed day with a freeze', () => {
    const r = resolveDailyStreak(
      { lastDate: '2026-02-28', streak: 9, freezes: 1 },
      '2026-03-02',
    );
    expect(r).toEqual({
      lastDate: '2026-03-01',
      streak: 9,
      freezes: 0,
      usedFreeze: true,
    });
  });

  it('resets when the gap exceeds the freezes', () => {
    const r = resolveDailyStreak(
      { lastDate: '2026-02-20', streak: 9, freezes: 1 },
      '2026-03-02',
    );
    expect(r.streak).toBe(0);
    expect(r.freezes).toBe(1);
  });

  it('awards a freeze every 7 days, capped', () => {
    expect(freezesAfterCompletion(7, 0)).toBe(1);
    expect(freezesAfterCompletion(8, 1)).toBe(1);
    expect(freezesAfterCompletion(14, 2)).toBe(2);
  });
});
