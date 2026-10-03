// Yolculuk: her durak bir kartpostal, her kartpostal LEVELS_PER_STOP parçaya bölünür.
// Her tamamlanan level bir parçayı açar; durağın son level'ı resmi bütünüyle açar.

export const LEVELS_PER_STOP = 4;

// Parçaların açılma sırası saat yönünde: sol üst → sağ üst → sağ alt → sol alt.
// Oyun içi arka plan da aynı sırayla bu çeyreklere kayar.
export const QUADRANTS = [
  { col: 0, row: 0 },
  { col: 1, row: 0 },
  { col: 1, row: 1 },
  { col: 0, row: 1 },
] as const;

export type Quadrant = (typeof QUADRANTS)[number];

export const getStopIndex = (levelIndex: number): number =>
  Math.floor(levelIndex / LEVELS_PER_STOP);

export const getQuadrantForLevel = (levelIndex: number): Quadrant =>
  QUADRANTS[levelIndex % LEVELS_PER_STOP];

/** `highestUnlocked` = oynanabilecek en yüksek level index'i (tamamlanan en yüksek + 1). */
export const getRevealedCount = (highestUnlocked: number, stopIndex: number): number =>
  Math.min(LEVELS_PER_STOP, Math.max(0, highestUnlocked - stopIndex * LEVELS_PER_STOP));

export const getCompletedStopCount = (highestUnlocked: number): number =>
  Math.floor(highestUnlocked / LEVELS_PER_STOP);

/** Durak sayısı kartpostal sayısını aşarsa resimler döngüye girer. */
export const getPostcardIndex = (stopIndex: number, postcardCount: number): number =>
  postcardCount > 0 ? stopIndex % postcardCount : 0;

export type RevealUpdate = {
  stopIndex: number;
  revealedBefore: number;
  revealedAfter: number;
  /** Bu tamamlanışla ilk kez açılan parça; tekrar oynanan level'da null. */
  newQuadrantIndex: number | null;
  completedStop: boolean;
};

export const getRevealUpdate = (
  highestUnlockedBefore: number,
  completedLevelIndex: number,
): RevealUpdate => {
  const stopIndex = getStopIndex(completedLevelIndex);
  const highestUnlockedAfter = Math.max(highestUnlockedBefore, completedLevelIndex + 1);
  const revealedBefore = getRevealedCount(highestUnlockedBefore, stopIndex);
  const revealedAfter = getRevealedCount(highestUnlockedAfter, stopIndex);
  const isNewReveal = revealedAfter > revealedBefore;

  return {
    stopIndex,
    revealedBefore,
    revealedAfter,
    newQuadrantIndex: isNewReveal ? revealedAfter - 1 : null,
    completedStop: isNewReveal && revealedAfter === LEVELS_PER_STOP,
  };
};
