import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from '../components/AppText.tsx';
import { Cell } from '../../types/types.ts';
import { useGameState } from '../../state/useGameState.ts';
import { AnimatedPiece } from '../components/AnimatedPiece.tsx';
import { WinOverlay } from '../components/WinOverlay.tsx';
import { LEVELS } from '../../core/levels.ts';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation.ts';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'GameScreen'>;

export const GameScreen: React.FC<Props> = ({ route }) => {
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
    goLevel,
  } = useGameState(levelNumber);

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
  const [uiPositions, setUiPositions] = useState<
    Record<string, { top: number; left: number }>
  >(() => generateScatteredPositions(currentLevel.pieces.length));

  const uiPositionsRef = useRef(uiPositions);
  const activePieceIdRef = useRef(activePieceId);
  const piecesRef = useRef(pieces);
  const boardStateRef = useRef(board);
  const getPieceMatrixRef = useRef(getPieceMatrix);
  const isRotatingRef = useRef(false);

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
        const id = activePieceIdRef.current as string;
        const { left, top } = uiPositionsRef.current[id];
        const gridX = Math.round(left / CELL_WIDTH);
        const gridY = Math.round(top / CELL_HEIGHT);

        const gamePiece = piecesRef.current.find(
          piece => piece.id === (activePieceIdRef.current as string),
        );

        if (!gamePiece) return;
        const matrix = getPieceMatrixRef.current(gamePiece.id);

        if (!matrix) return;

        const canPlaceResult = tryPlacePiece(gamePiece.id!, gridX, gridY);

        const snapLeft = gridX * CELL_WIDTH;
        const snapTop = gridY * CELL_HEIGHT - PIECE_CONTAINER_TOP_PADDING;

        if (canPlaceResult) {
          setUiPositions(prev => ({
            ...prev,
            [id]: {
              left: snapLeft,
              top: snapTop,
            },
          }));
        }
        releaseAndTryLockPiece(id, gridX, gridY, canPlaceResult);

        if (!canPlaceResult) console.log('Not snapping', gridX, gridY);
      },
    }),
  ).current;

  const toggleMenu = () => {
    setMenuVisible(prev => !prev);
  };

  // hooks
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
    goLevel(0);
    restart();
    resetUiPositions();
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
              onPressRotate={() => rotatePiece(gamePiece.id)}
              cellWidth={CELL_WIDTH}
              cellHeight={CELL_HEIGHT}
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
          <Text style={styles.levelText}>Level {currentLevelNumber + 1}</Text>
          <Text style={styles.movesText}>Moves {moveCount}</Text>
        </View>

        <View style={styles.timerRow}>
          <Text style={styles.timerText}>00:01</Text>
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

      <Icon
        style={styles.settingsIcon}
        name="settings-outline"
        size={20}
        color={colors.piece.base}
      />
      <WinOverlay
        onDismiss={toggleMenu}
        visible={isOver || menuVisible}
        onNextLevel={handleNextLevel}
        onRestart={handleRestart}
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
    color: colors.piece.base,
  },
  movesText: {
    fontSize: typography.fontSize.xl,
    color: colors.piece.base,
  },
  timerRow: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  timerText: {
    fontSize: typography.fontSize.xl,
    color: colors.piece.base,
  },
  settingsIcon: {
    paddingBottom: spacing.xl,
  },
});
