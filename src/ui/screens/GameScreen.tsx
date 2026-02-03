import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Cell } from '../../types/types.ts';
import { useGameState } from '../../state/useGameState.ts';
import { AnimatedPiece } from '../components/AnimatedPiece.tsx';
import { MenuOverlay } from '../components/MenuOverlay.tsx';
import { LEVELS } from '../../core/levels.ts';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation.ts';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../../theme';
import { formatTime } from '../../core/utils.ts';
import { SoundManager } from '../../services/SoundManager.ts';
import { GameStorage } from '../../services/GameStorage.ts';
import { LabelButton } from '../components/base/LabelButton.tsx';
import { Analytics } from '../../services/Analytics.ts';
import { useAppStore } from '../../state/useAppStore.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'GameScreen'>;

export const GameScreen: React.FC<Props> = ({ route, navigation }) => {
  const { levelNumber } = route.params;
  const {
    currentLevel,
    currentLevelNumber,
    board,
    pieces,
    rotatePiece,
    getPieceMatrix,
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
  } = useGameState(levelNumber);

  const [gameTime, setGameTime] = useState('00:00');
  const setCurrentScreen = useAppStore(state => state.setCurrentScreen);
  const setCurrentLevel = useAppStore(state => state.setCurrentLevel);

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

  const startPos = useRef({ left: 0, top: 0 });

  // local states
  const [menuVisible, setMenuVisible] = useState(false);
  const [activePieceId, setActivePieceId] = useState<string>();
  const [isMusicMuted, setIsMusicMuted] = useState(SoundManager.isMusicMutedState());
  const [uiPositions, setUiPositions] = useState<
    Record<string, { top: number; left: number }>
  >(() => generateScatteredPositions(currentLevel.pieces.length));

  const uiPositionsRef = useRef(uiPositions);
  const activePieceIdRef = useRef(activePieceId);
  const piecesRef = useRef(pieces);
  const boardStateRef = useRef(board);
  const getPieceMatrixRef = useRef(getPieceMatrix);
  const isRotatingRef = useRef(false);
  const rotateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (rotateTimeoutRef.current) {
        clearTimeout(rotateTimeoutRef.current);
      }
    };
  }, []);

  const attemptPlacementRef = useRef<(pieceId: string) => void>(() => {});

  attemptPlacementRef.current = (pieceId: string) => {
    const pos = uiPositionsRef.current[pieceId];
    if (!pos) return;

    const gridX = Math.round(pos.left / CELL_WIDTH);
    const gridY = Math.round(pos.top / CELL_HEIGHT);

    const canPlace = tryPlacePiece(pieceId, gridX, gridY);

    if (canPlace) {
      SoundManager.playPlaceEffect();
      setUiPositions(prev => ({
        ...prev,
        [pieceId]: {
          left: gridX * CELL_WIDTH,
          top: gridY * CELL_HEIGHT - PIECE_CONTAINER_TOP_PADDING,
        },
      }));
    }

    releaseAndTryLockPiece(pieceId, gridX, gridY, canPlace);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => !isRotatingRef.current,
      onPanResponderGrant: () => {
        if (!activePieceIdRef.current) return;
        const pos = uiPositionsRef.current[activePieceIdRef.current];
        if (!pos) return;

        startPos.current = uiPositionsRef.current[activePieceIdRef.current];
      },

      onPanResponderMove: (_, gestureState) => {
        const { dx, dy } = gestureState;
        if (!activePieceIdRef.current) return;

        setUiPositions(prev => ({
          ...prev,
          [activePieceIdRef.current as string]: {
            left: startPos.current.left + dx,
            top: startPos.current.top + dy,
          },
        }));
      },
      onPanResponderRelease: () => {
        const id = activePieceIdRef.current;
        if (!id) return;

        attemptPlacementRef.current(id);
        setActivePieceId(undefined);
      },
    }),
  ).current;

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
    }
  }, [isOver, currentLevelNumber, moveCount, getElapsedTime]);

  useEffect(() => {
    uiPositionsRef.current = uiPositions;
  }, [uiPositions]);

  useEffect(() => {
    activePieceIdRef.current = activePieceId;
  }, [activePieceId]);

  useEffect(() => {
    piecesRef.current = pieces;
  }, [pieces, isOver]);

  useEffect(() => {
    boardStateRef.current = board;
  }, [board]);

  useEffect(() => {
    getPieceMatrixRef.current = getPieceMatrix;
  }, [getPieceMatrix]);

  useEffect(() => {
    setUiPositions(generateScatteredPositions(currentLevel.pieces.length));
  }, [currentLevel, generateScatteredPositions]);

  // functions
  const resetUiPositions = () => {
    setUiPositions(generateScatteredPositions(pieces.length));
  };

  const handleRestart = () => {
    restart();
    resetUiPositions();
    setMenuVisible(false);
  };

  const handleHome = () => {
    navigation.navigate('HomeScreen');
  };
  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const toggleMusic = () => {
    const newMuted = !isMusicMuted;
    setIsMusicMuted(newMuted);
    SoundManager.setMusicMuted(newMuted);
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
                    style={[styles.cell, generateCellStyle(cell)]}
                  />
                );
              })}
            </View>
          );
        })}
      </View>
    );
  }, [board, generateCellStyle, BOARD_TOP_POS, BOARD_LEFT_POS]);

  const renderPieces = () => {
    return (
      <View
        style={[
          styles.piecesContainer,
          { top: BOARD_TOP_POS, left: BOARD_LEFT_POS },
        ]}
      >
        {pieces.map(gamePiece => {
          const matrix = getPieceMatrix(gamePiece.id);
          const uiPos = uiPositions[gamePiece.id];

          if (!matrix) return;

          return (
            <AnimatedPiece
              key={gamePiece.id}
              gamePiece={gamePiece}
              matrix={matrix}
              uiPos={uiPos}
              panHandlers={panResponder.panHandlers}
              onTouchStart={() => setActivePieceId(gamePiece.id)}
              onPressRotate={() => {
                SoundManager.playRotateEffect();
                rotatePiece(gamePiece.id);
                rotateTimeoutRef.current = setTimeout(() => {
                  attemptPlacementRef.current(gamePiece.id);
                  setActivePieceId(undefined);
                }, 0);
              }}
              cellWidth={CELL_WIDTH}
              cellHeight={CELL_HEIGHT}
              isActive={activePieceId === gamePiece.id}
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
        onNextLevel={handleNextLevel}
        onPreviousLevel={handlePrevLevel}
        onRestart={handleRestart}
        onHome={handleHome}
        onSettings={handleSettings}
        currentLevelNumber={currentLevelNumber}
        isLastLevel={currentLevelNumber === LEVELS.length}
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
    shadowColor: 'black',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 5,
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
