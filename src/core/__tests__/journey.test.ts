import {
  LEVELS_PER_STOP,
  getCompletedStopCount,
  getPostcardIndex,
  getQuadrantForLevel,
  getRevealUpdate,
  getRevealedCount,
  getStopIndex,
} from '../journey';

describe('journey', () => {
  it('maps levels to stops', () => {
    expect(getStopIndex(0)).toBe(0);
    expect(getStopIndex(LEVELS_PER_STOP - 1)).toBe(0);
    expect(getStopIndex(LEVELS_PER_STOP)).toBe(1);
  });

  it('walks quadrants clockwise within a stop', () => {
    expect(getQuadrantForLevel(0)).toEqual({ col: 0, row: 0 });
    expect(getQuadrantForLevel(1)).toEqual({ col: 1, row: 0 });
    expect(getQuadrantForLevel(2)).toEqual({ col: 1, row: 1 });
    expect(getQuadrantForLevel(3)).toEqual({ col: 0, row: 1 });
    expect(getQuadrantForLevel(4)).toEqual({ col: 0, row: 0 });
  });

  it('clamps revealed count per stop', () => {
    expect(getRevealedCount(0, 0)).toBe(0);
    expect(getRevealedCount(2, 0)).toBe(2);
    expect(getRevealedCount(9, 0)).toBe(LEVELS_PER_STOP);
    expect(getRevealedCount(9, 2)).toBe(1);
    expect(getRevealedCount(3, 2)).toBe(0);
  });

  it('counts completed stops', () => {
    expect(getCompletedStopCount(3)).toBe(0);
    expect(getCompletedStopCount(4)).toBe(1);
    expect(getCompletedStopCount(31)).toBe(7);
  });

  it('cycles postcards when stops outnumber them', () => {
    expect(getPostcardIndex(0, 3)).toBe(0);
    expect(getPostcardIndex(4, 3)).toBe(1);
    expect(getPostcardIndex(5, 0)).toBe(0);
  });

  describe('getRevealUpdate', () => {
    it('reveals the next quadrant on first completion', () => {
      expect(getRevealUpdate(1, 1)).toEqual({
        stopIndex: 0,
        revealedBefore: 1,
        revealedAfter: 2,
        newQuadrantIndex: 1,
        completedStop: false,
      });
    });

    it('completes the stop on its last level', () => {
      const update = getRevealUpdate(3, 3);
      expect(update.completedStop).toBe(true);
      expect(update.newQuadrantIndex).toBe(3);
      expect(update.revealedAfter).toBe(LEVELS_PER_STOP);
    });

    it('reveals nothing when replaying an old level', () => {
      const update = getRevealUpdate(10, 3);
      expect(update.newQuadrantIndex).toBeNull();
      expect(update.completedStop).toBe(false);
      expect(update.revealedBefore).toBe(LEVELS_PER_STOP);
    });

    it('starts a fresh stop at revealed 0', () => {
      const update = getRevealUpdate(4, 4);
      expect(update).toMatchObject({ stopIndex: 1, revealedBefore: 0, newQuadrantIndex: 0 });
    });
  });
});
