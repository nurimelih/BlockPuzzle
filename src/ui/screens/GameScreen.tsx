import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, Dimensions, StyleSheet, View } from 'react-native';
import { useGameState } from '../../state/useGameState.ts';
import { useHintSystem } from '../../state/useHintSystem.ts';
import { useGameSession } from '../../state/useGameSession.ts';
import { useProgression } from '../../state/useProgression.ts';
import { useLevelProgress } from '../../state/useLevelProgress.ts';
import {
  AnimatedPiece,
  AnimatedPieceHandle,
} from '../components/AnimatedPiece.tsx';
import { GameBoard } from '../components/GameBoard.tsx';
import { GameHeader, GameFooter } from '../components/GameHud.tsx';
import { MenuOverlay } from '../components/MenuOverlay.tsx';
import { TutorialOverlay } from '../components/TutorialOverlay.tsx';
import { RetryModal, RetryReason } from '../components/RetryModal.tsx';
import { HardLevelIntro } from '../components/HardLevelIntro.tsx';
import { WinScreen } from './WinScreen.tsx';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation.ts';
import { spacing } from '../../theme';
import { formatTime } from '../../core/utils.ts';
import { SoundManager } from '../../services/SoundManager.ts';
import { HapticsManager } from '../../services/HapticsManager.ts';
import { GameStorage } from '../../services/GameStorage.ts';
import { useMusicMuted } from '../../state/useMusicMuted.ts';
import { useAppStore } from '../../state/useAppStore.ts';
import {
  isRewardedAdReady,
  registerLevelComplete,
  showInterstitialIfReady,
  showRewardedAd,
} from '../../services/AdManager.ts';
import { calculateScore } from '../../core/scoring.ts';
import { HintPlacement } from '../../core/hint.ts';
import {
  DEFAULT_TIMED_LEVEL_CONFIG,
  getTimeLimit,
} from '../../core/progression.ts';
import type { LevelProgressSnapshot } from '../../services/GameStorage.ts';
import type { PieceDirection, PieceMatrix } from '../../types/types.ts';
import { Analytics } from '../../services/Analytics.ts';
import { submitScore } from '../../services/supabase.ts';
import { NicknameModal } from '../components/NicknameModal.tsx';

// Remaining share of the time limit below which the hint gets a nudge
const HINT_NUDGE_TIME_RATIO = 0.3;
const TIME_CRITICAL_SECONDS = 10;

type Props = NativeStackScreenProps<RootStackParamList, 'GameScreen'>;

export const GameScreen: React.FC<Props> = ({ route, navigation }) => {
  const { levelNumber, dailyChallenge, mode } = route.params;
  const isDaily = mode === 'daily';
  const {
    currentLevel,
    currentLevelNumber,
    board,
    pieces,
    rotatePiece,
    releaseAndTryLockPiece,
    tryPlacePiece,
    isOver,
    restart,
    moveCount,
    handleNextLevel,
    handlePrevLevel,
    isPaused,
    pauseTimer,
    resumeTimer,
    getElapsedTime,
    setElapsedTime,
    getPieceFresh,
    placePieceAt,
    unplacePieces,
    restorePieces,
  } = useGameState(levelNumber, dailyChallenge);

  const appSettings = useAppStore(state => state.appSettings);
  const timeLimit = useMemo(
    () =>
      isDaily
        ? undefined
        : getTimeLimit(currentLevel, currentLevelNumber, {
            ...DEFAULT_TIMED_LEVEL_CONFIG,
            ...(appSettings.timedLevelInterval !== undefined && {
              interval: appSettings.timedLevelInterval,
            }),
            ...(appSettings.timedLevelTimeFactor !== undefined && {
              timeFactor: appSettings.timedLevelTimeFactor,
            }),
          }),
    [isDaily, currentLevel, currentLevelNumber, appSettings],
  );
  const isTimedLevel = timeLimit !== undefined;

  const progression = useProgression();

  // Assigned below once piece positions are known; the hint hook only needs a stable callback
  const applyHintRef = useRef<(placement: HintPlacement) => void>(() => {});
  const handleApplyHint = useCallback(
    (placement: HintPlacement) => applyHintRef.current(placement),
    [],
  );

  const {
    hintCells,
    hintCount,
    setHintCount,
    freeHints,
    resetHints,
    refreshFreeHints,
    shouldShowHintButton,
    onHintPress,
  } = useHintSystem(currentLevel, pieces, currentLevelNumber, {
    isTimedLevel,
    onApplyHint: handleApplyHint,
  });

  const { handleHome, handleSettings, logRestart } = useGameSession(
    navigation,
    currentLevelNumber,
    moveCount,
    getElapsedTime,
    isOver,
  );

  const [gameTime, setGameTime] = useState('00:00');
  const [showWin, setShowWin] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [activePieceId, setActivePieceId] = useState<string>();
  const [resetKey, setResetKey] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showHardIntro, setShowHardIntro] = useState(false);
  const [retryReason, setRetryReason] = useState<RetryReason | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | undefined>();
  // Score multiplier and streak shown on the win screen for the level just won
  const [winStreakInfo, setWinStreakInfo] = useState({
    multiplier: 1,
    streak: 0,
  });
  const isTransitioningRef = useRef(false);
  const isNicknameModalActive = showNicknameModal;
  const pendingScoreRef = useRef<{ score: number; elapsed: number } | null>(
    null,
  );

  const setBackgroundRevealing = useAppStore(
    state => state.setBackgroundRevealing,
  );
  const isRevealing = useAppStore(state => state.isBackgroundRevealing);
  const levels = useAppStore(state => state.levels);

  const LEVELS_PER_IMAGE = 4;
  const isRevealLevel =
    currentLevelNumber % LEVELS_PER_IMAGE === LEVELS_PER_IMAGE - 1;

  const CELL_WIDTH = spacing.cell.width;
  const CELL_HEIGHT = spacing.cell.height;
  const screenWidth = Dimensions.get('screen').width;
  const screenHeight = Dimensions.get('screen').height;
  const BOARD_WIDTH = CELL_WIDTH * currentLevel.board[0].length;
  const BOARD_HEIGHT = CELL_HEIGHT * currentLevel.board.length;
  const BOARD_LEFT_POS = (screenWidth - BOARD_WIDTH) / 2;
  const BOARD_TOP_POS = (screenHeight - BOARD_HEIGHT) / 4;
  const PIECE_CONTAINER_TOP_PADDING = 0;
  const FOOTER_HEIGHT = 100;

  const { isMusicMuted, setMusicMuted } = useMusicMuted();

  const pieceRefs = useRef<Record<string, AnimatedPieceHandle>>({});

  // Container position of a piece sitting on the board at grid (x, y)
  const getPlacedPosition = useCallback(
    (
      baseMatrix: PieceMatrix,
      rotation: PieceDirection,
      gridX: number,
      gridY: number,
    ) => {
      const baseCols = baseMatrix[0].length;
      const baseRows = baseMatrix.length;
      const isSwapped = rotation % 180 !== 0;
      const rotatedW = (isSwapped ? baseRows : baseCols) * CELL_WIDTH;
      const rotatedH = (isSwapped ? baseCols : baseRows) * CELL_HEIGHT;
      const baseW = baseCols * CELL_WIDTH;
      const baseH = baseRows * CELL_HEIGHT;
      return {
        left: gridX * CELL_WIDTH - (baseW - rotatedW) / 2,
        top:
          gridY * CELL_HEIGHT -
          (baseH - rotatedH) / 2 -
          PIECE_CONTAINER_TOP_PADDING,
      };
    },
    [CELL_WIDTH, CELL_HEIGHT, PIECE_CONTAINER_TOP_PADDING],
  );

  const generateScatteredPositions = useCallback(
    (gamePieces: { baseMatrix: number[][] }[]) => {
      const positions: Record<string, { left: number; top: number }> = {};
      const placed: { left: number; top: number; w: number; h: number }[] = [];
      const EDGE_PADDING = 20;
      const GAP = 20;

      // Dağılım alanı: board'un altı (pieces container relative koordinatları)
      const areaTop = BOARD_HEIGHT + GAP;
      const areaBottom =
        screenHeight - BOARD_TOP_POS - FOOTER_HEIGHT - EDGE_PADDING;
      const areaLeft = -BOARD_LEFT_POS + EDGE_PADDING;
      const areaRight = screenWidth - BOARD_LEFT_POS - EDGE_PADDING;

      for (let i = 0; i < gamePieces.length; i++) {
        const piece = gamePieces[i];
        const baseW = piece.baseMatrix[0].length * CELL_WIDTH;
        const baseH = piece.baseMatrix.length * CELL_HEIGHT;
        const boxSize = Math.max(baseW, baseH);

        let bestLeft = areaLeft;
        let bestTop = areaTop;
        let bestOverlap = Infinity;

        const maxAttempts = 50;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          const left =
            areaLeft +
            Math.random() * Math.max(0, areaRight - areaLeft - boxSize);
          const top =
            areaTop +
            Math.random() * Math.max(0, areaBottom - areaTop - boxSize);

          // AABB overlap kontrolü
          let totalOverlap = 0;
          for (const p of placed) {
            const overlapX = Math.max(
              0,
              Math.min(left + boxSize, p.left + p.w) - Math.max(left, p.left),
            );
            const overlapY = Math.max(
              0,
              Math.min(top + boxSize, p.top + p.h) - Math.max(top, p.top),
            );
            totalOverlap += overlapX * overlapY;
          }

          if (totalOverlap === 0) {
            bestLeft = left;
            bestTop = top;
            bestOverlap = 0;
            break;
          }

          if (totalOverlap < bestOverlap) {
            bestOverlap = totalOverlap;
            bestLeft = left;
            bestTop = top;
          }
        }

        positions[`piece-${i}`] = { left: bestLeft, top: bestTop };
        placed.push({ left: bestLeft, top: bestTop, w: boxSize, h: boxSize });
      }
      return positions;
    },
    [
      screenWidth,
      screenHeight,
      CELL_WIDTH,
      CELL_HEIGHT,
      BOARD_WIDTH,
      BOARD_HEIGHT,
      BOARD_LEFT_POS,
      BOARD_TOP_POS,
      FOOTER_HEIGHT,
    ],
  );

  const scatteredPositions = useRef(
    generateScatteredPositions(
      currentLevel.pieces.map(m => ({ baseMatrix: m })),
    ),
  );
  // Board positions of pieces restored from a saved session (override scattered)
  const restoredPositions = useRef<
    Record<string, { left: number; top: number }>
  >({});

  const levelKey = isDaily
    ? `daily-${new Date().toDateString()}`
    : `level-${currentLevelNumber}`;

  const handleRestoreProgress = useCallback(
    (snapshot: LevelProgressSnapshot) => {
      restorePieces(snapshot.pieces, snapshot.moveCount);
      setElapsedTime(snapshot.elapsed);
      setHintCount(snapshot.hintCount);

      const positions: Record<string, { left: number; top: number }> = {};
      snapshot.pieces.forEach((sp, index) => {
        const base = currentLevel.pieces[index];
        if (
          sp.placed &&
          base &&
          sp.boardX !== undefined &&
          sp.boardY !== undefined
        ) {
          positions[sp.id] = getPlacedPosition(
            base,
            sp.rotation,
            sp.boardX,
            sp.boardY,
          );
        }
      });
      restoredPositions.current = positions;
      setResetKey(k => k + 1);
    },
    [
      restorePieces,
      setElapsedTime,
      setHintCount,
      currentLevel,
      getPlacedPosition,
    ],
  );

  const { clearProgress } = useLevelProgress({
    levelKey,
    level: currentLevel,
    pieces,
    moveCount,
    hintCount,
    isOver,
    getElapsedTime,
    onRestore: handleRestoreProgress,
  });

  // Gesture callbacks
  const handleDragStart = useCallback((id: string) => {
    setActivePieceId(id);
  }, []);

  const handleDragEnd = useCallback(
    (id: string, finalLeft: number, finalTop: number) => {
      const piece = getPieceFresh(id);
      if (!piece) return;

      const baseCols = piece.baseMatrix[0].length;
      const baseRows = piece.baseMatrix.length;
      const isSwapped = piece.rotation % 180 !== 0;
      const rotatedW = (isSwapped ? baseRows : baseCols) * CELL_WIDTH;
      const rotatedH = (isSwapped ? baseCols : baseRows) * CELL_HEIGHT;
      const baseW = baseCols * CELL_WIDTH;
      const baseH = baseRows * CELL_HEIGHT;

      const adjustedLeft = finalLeft + (baseW - rotatedW) / 2;
      const adjustedTop = finalTop + (baseH - rotatedH) / 2;
      const gridX = Math.round(adjustedLeft / CELL_WIDTH);
      const gridY = Math.round(adjustedTop / CELL_HEIGHT);

      const canPlace = tryPlacePiece(id, gridX, gridY);
      if (canPlace) {
        SoundManager.playPlaceEffect();
        HapticsManager.impactMedium();
        const placed = getPlacedPosition(
          piece.baseMatrix,
          piece.rotation,
          gridX,
          gridY,
        );
        pieceRefs.current[id]?.setPosition(placed.left, placed.top);
      }

      releaseAndTryLockPiece(id, gridX, gridY, canPlace);
      setActivePieceId(undefined);
    },
    [
      getPieceFresh,
      tryPlacePiece,
      releaseAndTryLockPiece,
      getPlacedPosition,
      CELL_WIDTH,
      CELL_HEIGHT,
    ],
  );

  applyHintRef.current = (placement: HintPlacement) => {
    const hintId = `piece-${placement.pieceIndex}`;
    const toUnplace = placement.unplaceIndices
      .map(i => `piece-${i}`)
      .filter(id => id !== hintId);
    if (toUnplace.length > 0) {
      unplacePieces(toUnplace);
      toUnplace.forEach(id => {
        const home = scatteredPositions.current[id];
        if (home) pieceRefs.current[id]?.setPosition(home.left, home.top);
      });
    }

    const piece = getPieceFresh(hintId);
    if (!piece) return;
    placePieceAt(hintId, placement.rotation, placement.x, placement.y);
    const placed = getPlacedPosition(
      piece.baseMatrix,
      placement.rotation,
      placement.x,
      placement.y,
    );
    pieceRefs.current[hintId]?.setPosition(placed.left, placed.top);
    SoundManager.playPlaceEffect();
    HapticsManager.impactMedium();
  };

  const handleTapRotate = useCallback(
    (id: string) => {
      SoundManager.playRotateEffect();
      HapticsManager.impactLight();
      rotatePiece(id);
    },
    [rotatePiece],
  );

  // Menu
  const toggleMenu = () => {
    setMenuVisible(prev => {
      const newVisible = !prev;
      if (newVisible) pauseTimer();
      else resumeTimer();
      return newVisible;
    });
  };

  const toggleMusic = () => setMusicMuted(!isMusicMuted);

  // Anything on screen that must keep the clock stopped
  const isTimerBlocked =
    menuVisible ||
    showHardIntro ||
    retryReason !== null ||
    isOver ||
    showTutorial;
  const isTimerBlockedRef = useRef(isTimerBlocked);
  isTimerBlockedRef.current = isTimerBlocked;

  const handleTimeUp = useCallback(() => {
    pauseTimer();
    setRetryReason('timeUp');
    Analytics.logTimeUp(currentLevelNumber, progression.winStreak);
  }, [pauseTimer, currentLevelNumber, progression.winStreak]);

  // Timer: counts up normally, down on timed levels
  useEffect(() => {
    const tick = () => {
      const elapsed = getElapsedTime();
      if (timeLimit === undefined) {
        setGameTime(formatTime(elapsed));
        setRemainingTime(undefined);
        return;
      }
      const remaining = Math.max(0, timeLimit - elapsed);
      setGameTime(formatTime(remaining));
      setRemainingTime(remaining);
      // Blocked covers intro/menu/modals: a restored, already expired level
      // must not fire before the intro card is dismissed
      if (remaining === 0 && !isTimerBlockedRef.current) {
        handleTimeUp();
      }
    };
    tick();
    if (isPaused) return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [
    isPaused,
    getElapsedTime,
    currentLevelNumber,
    timeLimit,
    isOver,
    retryReason,
    handleTimeUp,
  ]);

  // Metro stops, calls, notifications: the clock only runs while the game is visible
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        if (!isTimerBlockedRef.current) resumeTimer();
      } else {
        pauseTimer();
      }
    });
    return () => sub.remove();
  }, [pauseTimer, resumeTimer]);

  const handleHintPress = useCallback(async () => {
    // A rewarded ad can take 30s; it must not eat into a timed level
    pauseTimer();
    try {
      await onHintPress();
    } finally {
      if (!isTimerBlockedRef.current) resumeTimer();
    }
  }, [onHintPress, pauseTimer, resumeTimer]);

  const isAdRetryAvailable =
    isRewardedAdReady() && !!appSettings.rewardedAdsActive;

  // Tutorial check
  useEffect(() => {
    if (currentLevelNumber === 0) {
      GameStorage.getTutorialSeen().then(seen => {
        if (!seen) setShowTutorial(true);
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Win flow
  const streakRef = useRef(progression);
  streakRef.current = progression;
  // isOver stays true for one render after switching levels; without this guard
  // the win would be recorded again under the next level's number
  const winHandledRef = useRef(false);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!isOver) {
      winHandledRef.current = false;
      setShowWin(false);
      return;
    }
    if (winHandledRef.current) return;
    winHandledRef.current = true;
    {
      const elapsed = getElapsedTime();
      const boardSize =
        currentLevel.board.length * currentLevel.board[0].length;
      // The multiplier earned so far applies to this win; the streak grows after it
      const { streakMultiplier, winStreak } = streakRef.current;
      const multiplier = isDaily ? 1 : streakMultiplier;
      setWinStreakInfo({ multiplier, streak: isDaily ? 0 : winStreak + 1 });
      if (!isDaily) streakRef.current.incrementStreak();
      registerLevelComplete();

      const scoreResult = calculateScore({
        moves: moveCount,
        time: elapsed,
        hintCount,
        pieceCount: currentLevel.pieces.length,
        boardSize,
        streakMultiplier: multiplier,
      });

      Analytics.logLevelComplete(
        currentLevelNumber,
        moveCount,
        elapsed,
        scoreResult.score,
        scoreResult.stars,
        hintCount,
      );
      SoundManager.playWinEffect();
      HapticsManager.notificationSuccess();
      if (isDaily) GameStorage.markDailyCompleted();

      // Leaderboard score gönder (fire and forget)
      if (!isDaily) {
        GameStorage.getPlayerNickname().then(nickname => {
          if (!nickname) {
            pendingScoreRef.current = { score: scoreResult.score, elapsed };
            setShowNicknameModal(true);
          } else {
            GameStorage.getPlayerId().then(playerId => {
              if (playerId) {
                submitScore(
                  playerId,
                  currentLevelNumber,
                  scoreResult.score,
                  moveCount,
                  elapsed,
                );
              }
            });
          }
        });
      }

      GameStorage.saveCompletedLevel(
        currentLevelNumber,
        moveCount,
        elapsed,
        scoreResult.stars,
        scoreResult.score,
      ).then(() => refreshFreeHints());

      if (isRevealLevel) {
        setBackgroundRevealing(true);
        revealTimerRef.current = setTimeout(() => {
          revealTimerRef.current = null;
          setBackgroundRevealing(false);
          setShowWin(true);
        }, 3500);
      } else {
        setShowWin(true);
      }
    }
  }, [
    isOver,
    currentLevelNumber,
    moveCount,
    getElapsedTime,
    isRevealLevel,
    setBackgroundRevealing,
    hintCount,
    currentLevel,
    refreshFreeHints,
  ]);

  // Timed levels open with the intro card; the clock waits for it
  const showIntroIfTimed = useCallback(() => {
    if (!isTimedLevel) {
      setShowHardIntro(false);
      return;
    }
    setShowHardIntro(true);
    pauseTimer();
  }, [isTimedLevel, pauseTimer]);

  // Level change reset
  useEffect(() => {
    scatteredPositions.current = generateScatteredPositions(
      currentLevel.pieces.map(m => ({ baseMatrix: m })),
    );
    restoredPositions.current = {};
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    setResetKey(k => k + 1);
    resetHints();
    setShowWin(false);
    setRetryReason(null);
    setBackgroundRevealing(false);
    showIntroIfTimed();
  }, [
    currentLevel,
    generateScatteredPositions,
    setBackgroundRevealing,
    resetHints,
    showIntroIfTimed,
  ]);

  // Restart
  const performRestart = () => {
    logRestart();
    restart();
    clearProgress();
    scatteredPositions.current = generateScatteredPositions(
      pieces.map(p => ({ baseMatrix: p.baseMatrix })),
    );
    restoredPositions.current = {};
    setResetKey(k => k + 1);
    setMenuVisible(false);
    setShowWin(false);
    setRetryReason(null);
    resetHints();
    setBackgroundRevealing(false);
    showIntroIfTimed();
  };

  // Restarting a running timed level would reset the clock for free, so it
  // goes through the same life / ad / streak choice as running out of time
  const handleRestart = () => {
    if (isTimedLevel && !isOver && progression.winStreak > 0) {
      setMenuVisible(false);
      pauseTimer();
      setRetryReason('restart');
      return;
    }
    performRestart();
  };

  const handleRetryWithLife = async () => {
    if (await progression.spendLife()) {
      Analytics.logTimedRetry(
        currentLevelNumber,
        'life',
        progression.winStreak,
      );
      performRestart();
    }
  };

  const handleRetryWithAd = async () => {
    if (await showRewardedAd()) {
      Analytics.logTimedRetry(currentLevelNumber, 'ad', progression.winStreak);
      performRestart();
    }
  };

  const handleGiveUpStreak = async () => {
    Analytics.logTimedRetry(
      currentLevelNumber,
      'streak_lost',
      progression.winStreak,
    );
    await progression.resetStreak();
    performRestart();
  };

  const handleCancelRetry = () => {
    setRetryReason(null);
    resumeTimer();
  };

  const handleHardIntroStart = () => {
    setShowHardIntro(false);
    resumeTimer();
  };

  // Interstitials only at natural breaks after a win, never over the win moment
  const withInterstitial = (next: () => void) => async () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    try {
      await showInterstitialIfReady();
    } finally {
      isTransitioningRef.current = false;
      next();
    }
  };

  return (
    <View style={styles.container}>
      {!isRevealing && !isNicknameModalActive && (
        <GameBoard
          board={board}
          hintCells={hintCells}
          boardTopPos={BOARD_TOP_POS}
          boardLeftPos={BOARD_LEFT_POS}
        />
      )}

      {!isRevealing && !isNicknameModalActive && (
        <GameHeader
          currentLevelNumber={currentLevelNumber}
          moveCount={moveCount}
          gameTime={gameTime}
          isTimeCritical={
            remainingTime !== undefined &&
            remainingTime <= TIME_CRITICAL_SECONDS
          }
          winStreak={isDaily ? 0 : progression.winStreak}
          title={isDaily ? new Date().toLocaleDateString('tr-TR') : undefined}
          onLevelPress={isDaily ? undefined : handleNextLevel}
          onMenuPress={toggleMenu}
          onBackPress={handleHome}
        />
      )}

      {!isRevealing && !isNicknameModalActive && (
        <View
          style={[
            styles.piecesContainer,
            { top: BOARD_TOP_POS, left: BOARD_LEFT_POS },
          ]}
        >
          {pieces.map(gamePiece => {
            const scattered =
              restoredPositions.current[gamePiece.id] ??
              scatteredPositions.current[gamePiece.id];
            return (
              <AnimatedPiece
                ref={handle => {
                  if (handle) pieceRefs.current[gamePiece.id] = handle;
                }}
                key={gamePiece.id}
                gamePiece={gamePiece}
                matrix={gamePiece.baseMatrix}
                rotation={gamePiece.rotation}
                initialLeft={scattered?.left ?? 0}
                initialTop={scattered?.top ?? 0}
                resetKey={resetKey}
                cellWidth={CELL_WIDTH}
                cellHeight={CELL_HEIGHT}
                isActive={activePieceId === gamePiece.id}
                boardLeftPos={BOARD_LEFT_POS}
                boardTopPos={BOARD_TOP_POS}
                screenWidth={screenWidth}
                screenHeight={screenHeight - FOOTER_HEIGHT}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onTapRotate={handleTapRotate}
              />
            );
          })}
        </View>
      )}

      {!isRevealing && !isNicknameModalActive && (
        <GameFooter
          isOver={isOver}
          isMusicMuted={isMusicMuted}
          shouldShowHintButton={shouldShowHintButton}
          freeHints={freeHints}
          showHintNudge={
            timeLimit !== undefined &&
            remainingTime !== undefined &&
            remainingTime <= timeLimit * HINT_NUDGE_TIME_RATIO &&
            !isTimerBlocked
          }
          onMenuPress={toggleMenu}
          onHintPress={handleHintPress}
          onMusicToggle={toggleMusic}
        />
      )}

      <WinScreen
        visible={showWin && !isNicknameModalActive}
        levelNumber={currentLevelNumber}
        moves={moveCount}
        time={getElapsedTime()}
        pieceCount={currentLevel.pieces.length}
        boardSize={currentLevel.board.length * currentLevel.board[0].length}
        hintCount={hintCount}
        streakMultiplier={winStreakInfo.multiplier}
        winStreak={winStreakInfo.streak}
        isLastLevel={currentLevelNumber === levels.length - 1}
        isDaily={isDaily}
        onNextLevel={withInterstitial(handleNextLevel)}
        onRestart={handleRestart}
        onHome={withInterstitial(handleHome)}
        onLeaderboard={() => navigation.navigate('Leaderboard')}
      />

      <NicknameModal
        visible={showNicknameModal}
        onComplete={() => {
          setShowNicknameModal(false);
          const pending = pendingScoreRef.current;
          if (pending) {
            GameStorage.getPlayerId().then(playerId => {
              if (playerId) {
                submitScore(
                  playerId,
                  currentLevelNumber,
                  pending.score,
                  moveCount,
                  pending.elapsed,
                );
              }
            });
            pendingScoreRef.current = null;
          }
        }}
      />

      <HardLevelIntro
        visible={showHardIntro && !showTutorial}
        timeLimit={timeLimit ?? 0}
        winStreak={progression.winStreak}
        streakMultiplier={progression.streakMultiplier}
        lives={progression.lives}
        onStart={handleHardIntroStart}
      />

      <RetryModal
        reason={retryReason}
        winStreak={progression.winStreak}
        streakMultiplier={progression.streakMultiplier}
        livesState={progression.livesState}
        isAdAvailable={isAdRetryAvailable}
        onUseLife={handleRetryWithLife}
        onWatchAd={handleRetryWithAd}
        onGiveUpStreak={handleGiveUpStreak}
        onCancel={handleCancelRetry}
      />

      <TutorialOverlay
        visible={showTutorial}
        onComplete={() => {
          setShowTutorial(false);
          GameStorage.setTutorialSeen();
        }}
      />

      <MenuOverlay
        onDismiss={toggleMenu}
        visible={!isOver && menuVisible}
        isWin={false}
        onNextLevel={() => {
          setMenuVisible(false);
          handleNextLevel();
        }}
        onPreviousLevel={() => {
          setMenuVisible(false);
          handlePrevLevel();
        }}
        onRestart={handleRestart}
        onHome={handleHome}
        onSettings={handleSettings}
        currentLevelNumber={currentLevelNumber}
        isLastLevel={currentLevelNumber === levels.length - 1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  piecesContainer: {
    position: 'absolute',
    zIndex: 1,
    width: 160,
    height: 240,
    borderWidth: 0,
  },
});
