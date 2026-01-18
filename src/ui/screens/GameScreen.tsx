import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Cell } from '../../types/types.ts';
import { useGameState } from '../../state/useGameState.ts';
import { AnimatedPiece } from '../components/AnimatedPiece.tsx';
import { WinOverlay } from '../components/WinOverlay.tsx';
import { useTheme } from '@rneui/themed';
import { LEVELS } from '../../core/levels.ts';

type Props = {
  initialLevelNumber: number;
};

export const GameScreen: React.FC<Props> = ({ initialLevelNumber }) => {
  // manager;
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
  } = useGameState(initialLevelNumber);

  const { theme } = useTheme();

  const CELL_WIDTH = 40;
  const CELL_HEIGHT = 40;

  const screenWidth = Dimensions.get('screen').width;
  const screenHeight = Dimensions.get('screen').height;
  const BOARD_HEIGHT = currentLevel.board.length * CELL_HEIGHT;
  const BOARD_WIDTH = currentLevel.board[0].length * CELL_WIDTH;

  const PAGE_PADDING =
    (screenWidth - CELL_WIDTH * currentLevel.board[0].length) / 2;
  const BOARD_TOP_POS = PAGE_PADDING;
  const BOARD_LEFT_POS = PAGE_PADDING;

  const PIECE_CONTAINER_TOP_PADDING = 10;


  const generateScatteredPositions = (pieceCount: number) => {
    const positions: Record<string, { left: number; top: number }> = {};

    const minLeft = CELL_WIDTH;
    const maxLeft = screenWidth - CELL_WIDTH * 5;

    for (let i = 0; i < pieceCount; i++) {
      const left = minLeft + Math.random() * (maxLeft - minLeft);
      const top = 100 + Math.random() * 300;

      positions[`piece-${i}`] = { left, top };
    }
    return positions;
  };

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
            left: startPos.current.left + dx, // cannot read property 'left' on undefined
            top: startPos.current.top + dy,
          },
        }));
      },
      onPanResponderRelease: (_, _gestureState) => {
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

  // themes
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    level: {
      position: 'absolute',
      top: PAGE_PADDING,
      left: PAGE_PADDING,
    },

    row: {
      flexDirection: 'row',
      borderLeftWidth: 0,
    },
    topBorder: { borderTopWidth: 0 },
    cell: {
      width: CELL_WIDTH,
      height: CELL_HEIGHT,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 0.5,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 4,
    },
    available: {
      backgroundColor: 'rgba(109, 76, 65, 0.5)',
    },
    notAvailable: {
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderColor: 'rgba(0, 0, 0, 0.1)',
    },

    void: {
      backgroundColor: theme.colors.background,
      opacity: 0,
    },

    piecesContainer: {
      position: 'absolute',
      top: BOARD_TOP_POS,
      left: BOARD_LEFT_POS,
      zIndex: 1,
      width: 160,
      height: 240,
      borderWidth: 0,
    },

    debug: {
      position: 'absolute',
      left: PAGE_PADDING,
      top: PAGE_PADDING + currentLevel.board[0].length * CELL_WIDTH + 10,
    },
    button: {
      borderWidth: 0,
      borderRadius: 4,
      padding: 2,
    },
  });

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
  }, [currentLevel]); // yeni level

  // functions
  const resetUiPositions = () => {
    setUiPositions(generateScatteredPositions(pieces.length));
  };

  const handleRestart = () => {
    goLevel(0);
    restart();
    resetUiPositions();
  };

  const generateCellStyle = useCallback(
    (cell: Cell) => {
      switch (cell) {
        case Cell.INVALID:
          return styles.notAvailable;
        case Cell.AVAILABLE:
          return styles.available;
        case Cell.VOID:
          return styles.void;
      }
    },
    [styles],
  );

  const renderLevel = useCallback(() => {
    return (
      <View style={[styles.level]}>
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
  }, [styles, board, generateCellStyle]);

  const renderPieces = () => {
    return (
      <View style={[styles.piecesContainer]}>
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

  return (
    <View style={[styles.container]}>
      {renderLevel()}
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: PIECE_CONTAINER_TOP_PADDING,
        }}
      >
        <Text>Level: {currentLevelNumber + 1}</Text>
        <Text>Moves: {moveCount}</Text>
        <Pressable onPress={toggleMenu}>
          <Text>Open Menu</Text>
        </Pressable>
        {renderPieces()}
      </View>

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
