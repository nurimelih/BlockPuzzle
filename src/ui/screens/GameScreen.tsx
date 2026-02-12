import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Cell } from '../../types/types.ts';
import { useGameState } from '../../state/useGameState.ts';
import {
  AnimatedPiece,
  AnimatedPieceHandle,
} from '../components/AnimatedPiece.tsx';
import { MenuOverlay } from '../components/MenuOverlay.tsx';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation.ts';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../../theme';
import { formatTime } from '../../core/utils.ts';
import { SoundManager } from '../../services/SoundManager.ts';
import { GameStorage } from '../../services/GameStorage.ts';
import { useMusicMuted } from '../../state/useMusicMuted.ts';
import { LabelButton } from '../components/base/LabelButton.tsx';
import { Analytics } from '../../services/Analytics.ts';
import { useAppStore } from '../../state/useAppStore.ts';
import {
  showRewardedAd,
  showInterstitialIfReady,
  isRewardedAdReady,
} from '../../services/AdManager.ts';
import { solvePartial } from '../../core/solver.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'GameScreen'>;

export const GameScreen: React.FC<Props> = ({ route, navigation }) => {
  const { levelNumber } = route.params;
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
    getPieceFresh,
  } = useGameState(levelNumber);

  const [gameTime, setGameTime] = useState('00:00');
  const setCurrentScreen = useAppStore(state => state.setCurrentScreen);
  const setCurrentLevel = useAppStore(state => state.setCurrentLevel);
  const levels = useAppStore(state => state.levels);
  const isRewardedAdsActive = useAppStore(
    state => state.appSettings,
  ).rewardedAdsActive;

  const forceToShowHints = useAppStore(
    state => state.appSettings,
  ).forceToShowHints;

  useEffect(() => {
    setCurrentScreen('game');
  }, [setCurrentScreen]);

  useEffect(() => {
    setCurrentLevel(currentLevelNumber);
    Analytics.logLevelStart(currentLevelNumber);
  }, [currentLevelNumber, setCurrentLevel]);

  const CELL_WIDTH = spacing.cell.width;
  const CELL_HEIGHT = spacing.cell.height;

  const screenWidth = Dimensions.get('screen').width;
  const screenHeight = Dimensions.get('screen').height;

  const BOARD_WIDTH = CELL_WIDTH * currentLevel.board[0].length;
  const BOARD_HEIGHT = CELL_HEIGHT * currentLevel.board.length;

  const BOARD_LEFT_POS = (screenWidth - BOARD_WIDTH) / 2;
  const BOARD_TOP_POS = (screenHeight - BOARD_HEIGHT) / 4;

  const PIECE_CONTAINER_TOP_PADDING = 0;

  const generateScatteredPositions = useCallback(
    (pieceCount: number) => {
      const positions: Record<string, { left: number; top: number }> = {};

      const minLeft = CELL_WIDTH;
      const maxLeft = screenWidth - CELL_WIDTH * 5;

      for (let i = 0; i < pieceCount; i++) {
        const left = minLeft + Math.random() * (maxLeft - minLeft);
        const top = 100 + Math.random() * 300;

        positions[`piece-${i}`] = { left, top };
      }
      return positions;
    },
    [screenWidth, CELL_WIDTH],
  );

  const { isMusicMuted, setMusicMuted } = useMusicMuted();

  // local states
  const [menuVisible, setMenuVisible] = useState(false);
  const [activePieceId, setActivePieceId] = useState<string>();
  const [hintCells, setHintCells] = useState<{ x: number; y: number }[]>([]);
  const [resetKey, setResetKey] = useState(0);

  // Refs for gesture handler pattern
  const pieceRefs = useRef<Record<string, AnimatedPieceHandle>>({});
  const scatteredPositions = useRef(
    generateScatteredPositions(currentLevel.pieces.length),
  );

  // Callbacks for AnimatedPiece gesture events
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
        const placedLeft = gridX * CELL_WIDTH - (baseW - rotatedW) / 2;
        const placedTop =
          gridY * CELL_HEIGHT -
          (baseH - rotatedH) / 2 -
          PIECE_CONTAINER_TOP_PADDING;
        pieceRefs.current[id]?.setPosition(placedLeft, placedTop);
      }

      releaseAndTryLockPiece(id, gridX, gridY, canPlace);
      setActivePieceId(undefined);
    },
    [
      getPieceFresh,
      tryPlacePiece,
      releaseAndTryLockPiece,
      CELL_WIDTH,
      CELL_HEIGHT,
      PIECE_CONTAINER_TOP_PADDING,
    ],
  );

  const handleTapRotate = useCallback(
    (id: string) => {
      SoundManager.playRotateEffect();
      rotatePiece(id);
    },
    [rotatePiece],
  );

  const toggleMenu = () => {
    setMenuVisible(prev => {
      const newVisible = !prev;
      if (newVisible) {
        pauseTimer();
      } else {
        resumeTimer();
      }
      return newVisible;
    });
  };

  useEffect(() => {
    if (isPaused) return;

    setGameTime(formatTime(getElapsedTime()));
    const interval = setInterval(() => {
      setGameTime(formatTime(getElapsedTime()));
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, getElapsedTime, currentLevelNumber]);

  useEffect(() => {
    if (isOver) {
      Analytics.logLevelComplete(
        currentLevelNumber,
        moveCount,
        getElapsedTime(),
      );
      SoundManager.playWinEffect();
      GameStorage.saveCompletedLevel(
        currentLevelNumber,
        moveCount,
        getElapsedTime(),
      );
      // Show interstitial ad after level completion
      showInterstitialIfReady();
    }
  }, [isOver, currentLevelNumber, moveCount, getElapsedTime]);

  useEffect(() => {
    scatteredPositions.current = generateScatteredPositions(
      currentLevel.pieces.length,
    );
    setResetKey(k => k + 1);
    setHintCells([]);
  }, [currentLevel, generateScatteredPositions]);

  // functions
  const handleRestart = () => {
    restart();
    scatteredPositions.current = generateScatteredPositions(pieces.length);
    setResetKey(k => k + 1);
    setMenuVisible(false);
  };

  const handleHome = () => {
    navigation.navigate('HomeScreen');
  };
  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const toggleMusic = () => {
    setMusicMuted(!isMusicMuted);
  };

  const handleHintWithAd = async () => {
    // Solve from current state - respects already placed pieces
    const solution = solvePartial(currentLevel, pieces);
    if (!solution || solution.length === 0) return;

    const rewarded = await showRewardedAd();
    if (rewarded) {
      handleHint();
    }
  };

  const handleHint = async () => {
    const solution = solvePartial(currentLevel, pieces);
    if (!solution || solution.length === 0) return;
    const hint = solution[0];

    const cells: { x: number; y: number }[] = [];
    for (let i = 0; i < hint.matrix.length; i++) {
      for (let j = 0; j < hint.matrix[i].length; j++) {
        if (hint.matrix[i][j] === 1) {
          cells.push({ x: hint.x + j, y: hint.y + i });
        }
      }
    }

    setHintCells(cells);

    setTimeout(() => {
      setHintCells([]);
    }, 3000);
  };

  const generateCellStyle = useCallback((cell: Cell) => {
    switch (cell) {
      case Cell.INVALID:
        return styles.notAvailable;
      case Cell.AVAILABLE:
        return styles.available;
      case Cell.VOID:
        return styles.void;
    }
  }, []);

  const renderBoard = useCallback(() => {
    const isHintCell = (row: number, col: number) =>
      hintCells.some(c => c.x === col && c.y === row);

    return (
      <View
        style={[styles.level, { top: BOARD_TOP_POS, left: BOARD_LEFT_POS }]}
      >
        {board.map((row: Cell[], rowIndex: number) => {
          return (
            <View
              style={[styles.row, rowIndex === 0 && styles.topBorder]}
              key={`row-${rowIndex}`}
            >
              {row.map((cell, colIndex) => {
                return (
                  <View
                    key={`cell-${rowIndex}-${colIndex}`}
                    style={[
                      styles.cell,
                      generateCellStyle(cell),
                      isHintCell(rowIndex, colIndex) && styles.hintCell,
                    ]}
                  />
                );
              })}
            </View>
          );
        })}
      </View>
    );
  }, [board, generateCellStyle, BOARD_TOP_POS, BOARD_LEFT_POS, hintCells]);

  const renderPieces = () => {
    return (
      <View
        style={[
          styles.piecesContainer,
          { top: BOARD_TOP_POS, left: BOARD_LEFT_POS },
        ]}
      >
        {pieces.map(gamePiece => {
          const scattered = scatteredPositions.current[gamePiece.id];

          return (
            <AnimatedPiece
              ref={handle => {
                if (handle) {
                  pieceRefs.current[gamePiece.id] = handle;
                }
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
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onTapRotate={handleTapRotate}
            />
          );
        })}
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View>
        <View style={styles.headerRow}>
          <LabelButton style={styles.levelText} onPress={handleNextLevel}>
            Level {currentLevelNumber + 1}
          </LabelButton>
          <LabelButton style={styles.movesText}>Moves {moveCount}</LabelButton>
        </View>

        <View style={styles.timerRow}>
          <LabelButton style={styles.timerText}>{gameTime}</LabelButton>
        </View>

        <Pressable onPress={toggleMenu} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderBoard()}
      {renderHeader()}

      {renderPieces()}

      <View style={styles.footerIcons}>
        <Pressable onPress={toggleMenu} style={styles.footerIcon}>
          <View style={styles.iconShadow}>
            <Icon name="settings-outline" size={22} color={colors.white} />
          </View>
        </Pressable>
        {!isOver &&
          ((isRewardedAdReady() && isRewardedAdsActive) ||
            forceToShowHints) && (
            <Pressable
              onPress={forceToShowHints ? handleHint : handleHintWithAd}
              style={styles.footerIcon}
            >
              <View style={styles.iconShadow}>
                <Icon name="bulb-outline" size={22} color={colors.white} />
              </View>
            </Pressable>
          )}

        <Pressable onPress={toggleMusic} style={styles.footerIcon}>
          <View style={styles.iconShadow}>
            <Icon
              name={isMusicMuted ? 'volume-mute' : 'musical-notes'}
              size={22}
              color={colors.white}
            />
          </View>
        </Pressable>
      </View>
      <MenuOverlay
        onDismiss={toggleMenu}
        visible={isOver || menuVisible}
        isWin={isOver}
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
  level: {
    position: 'absolute',
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
    zIndex: 1,
  },
  row: {
    flexDirection: 'row',
    borderLeftWidth: 0,
  },
  topBorder: {
    borderTopWidth: 0,
  },
  cell: {
    width: spacing.cell.width,
    height: spacing.cell.height,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: colors.board.cellBorder,
    borderRadius: spacing.borderRadius.sm,
  },
  available: {
    backgroundColor: colors.board.cellAvailable,
  },
  notAvailable: {
    backgroundColor: colors.board.cellInvalid,
    borderColor: colors.board.cellBorderInvalid,
  },
  void: {
    backgroundColor: colors.background.transparent,
    opacity: 0,
  },
  hintCell: {
    backgroundColor: 'rgba(255, 235, 59, 0.6)',
    borderColor: 'rgba(255, 193, 7, 0.9)',
    borderWidth: 1.5,
  },
  piecesContainer: {
    position: 'absolute',
    zIndex: 1,
    width: 160,
    height: 240,
    borderWidth: 0,
  },
  headerRow: {
    width: '100%',
    paddingHorizontal: spacing.xxxxl,
    paddingVertical: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  levelText: {
    fontSize: typography.fontSize.xl,
    color: colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  movesText: {
    fontSize: typography.fontSize.xl,
    color: colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  timerRow: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  timerText: {
    fontSize: typography.fontSize.xl,
    color: colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  footerIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  footerIcon: {
    padding: spacing.sm,
  },
  iconShadow: {
    shadowColor: 'rgba(0, 0, 0, 0.75)',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
  },
});
