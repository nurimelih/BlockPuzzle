import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { useGameState } from '../../state/useGameState.ts';
import { useHintSystem } from '../../state/useHintSystem.ts';
import { useGameSession } from '../../state/useGameSession.ts';
import {
  AnimatedPiece,
  AnimatedPieceHandle,
} from '../components/AnimatedPiece.tsx';
import { GameBoard } from '../components/GameBoard.tsx';
import { GameHeader, GameFooter } from '../components/GameHud.tsx';
import { MenuOverlay } from '../components/MenuOverlay.tsx';
import { WinScreen } from './WinScreen.tsx';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation.ts';
import { spacing } from '../../theme';
import { formatTime } from '../../core/utils.ts';
import { SoundManager } from '../../services/SoundManager.ts';
import { GameStorage } from '../../services/GameStorage.ts';
import { useMusicMuted } from '../../state/useMusicMuted.ts';
import { useAppStore } from '../../state/useAppStore.ts';
import { showInterstitialIfReady } from '../../services/AdManager.ts';
import { calculateScore } from '../../core/scoring.ts';
import { Analytics } from '../../services/Analytics.ts';

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

  const { hintCells, hintCount, freeHints, resetHints, refreshFreeHints, shouldShowHintButton, onHintPress, hasFreeHints } =
    useHintSystem(currentLevel, pieces, currentLevelNumber);

  const { handleHome, handleSettings, logRestart } =
    useGameSession(navigation, currentLevelNumber, moveCount, getElapsedTime, isOver);

  const [gameTime, setGameTime] = useState('00:00');
  const [showWin, setShowWin] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [activePieceId, setActivePieceId] = useState<string>();
  const [resetKey, setResetKey] = useState(0);

  const setBackgroundRevealing = useAppStore(state => state.setBackgroundRevealing);
  const isRevealing = useAppStore(state => state.isBackgroundRevealing);
  const levels = useAppStore(state => state.levels);

  const LEVELS_PER_IMAGE = 4;
  const isRevealLevel = currentLevelNumber % LEVELS_PER_IMAGE === LEVELS_PER_IMAGE - 1;

  const CELL_WIDTH = spacing.cell.width;
  const CELL_HEIGHT = spacing.cell.height;
  const screenWidth = Dimensions.get('screen').width;
  const screenHeight = Dimensions.get('screen').height;
  const BOARD_WIDTH = CELL_WIDTH * currentLevel.board[0].length;
  const BOARD_HEIGHT = CELL_HEIGHT * currentLevel.board.length;
  const BOARD_LEFT_POS = (screenWidth - BOARD_WIDTH) / 2;
  const BOARD_TOP_POS = (screenHeight - BOARD_HEIGHT) / 4;
  const PIECE_CONTAINER_TOP_PADDING = 0;

  const { isMusicMuted, setMusicMuted } = useMusicMuted();

  const pieceRefs = useRef<Record<string, AnimatedPieceHandle>>({});

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

  const scatteredPositions = useRef(
    generateScatteredPositions(currentLevel.pieces.length),
  );

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
        const placedLeft = gridX * CELL_WIDTH - (baseW - rotatedW) / 2;
        const placedTop =
          gridY * CELL_HEIGHT - (baseH - rotatedH) / 2 - PIECE_CONTAINER_TOP_PADDING;
        pieceRefs.current[id]?.setPosition(placedLeft, placedTop);
      }

      releaseAndTryLockPiece(id, gridX, gridY, canPlace);
      setActivePieceId(undefined);
    },
    [getPieceFresh, tryPlacePiece, releaseAndTryLockPiece, CELL_WIDTH, CELL_HEIGHT, PIECE_CONTAINER_TOP_PADDING],
  );

  const handleTapRotate = useCallback(
    (id: string) => {
      SoundManager.playRotateEffect();
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

  // Timer
  useEffect(() => {
    if (isPaused) return;
    setGameTime(formatTime(getElapsedTime()));
    const interval = setInterval(() => {
      setGameTime(formatTime(getElapsedTime()));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, getElapsedTime, currentLevelNumber]);

  // Win flow
  useEffect(() => {
    if (isOver) {
      const elapsed = getElapsedTime();
      const boardSize = currentLevel.board.length * currentLevel.board[0].length;
      const scoreResult = calculateScore({
        moves: moveCount,
        time: elapsed,
        hintCount,
        pieceCount: currentLevel.pieces.length,
        boardSize,
      });

      Analytics.logLevelComplete(
        currentLevelNumber, moveCount, elapsed,
        scoreResult.score, scoreResult.stars, hintCount,
      );
      SoundManager.playWinEffect();
      GameStorage.saveCompletedLevel(
        currentLevelNumber, moveCount, elapsed,
        scoreResult.stars, scoreResult.score,
      ).then(() => refreshFreeHints());
      showInterstitialIfReady();

      if (isRevealLevel) {
        setBackgroundRevealing(true);
        const timer = setTimeout(() => {
          setBackgroundRevealing(false);
          setShowWin(true);
        }, 3500);
        return () => clearTimeout(timer);
      } else {
        setShowWin(true);
      }
    } else {
      setShowWin(false);
    }
  }, [isOver, currentLevelNumber, moveCount, getElapsedTime, isRevealLevel, setBackgroundRevealing, hintCount, currentLevel, refreshFreeHints]);

  // Level change reset
  useEffect(() => {
    scatteredPositions.current = generateScatteredPositions(currentLevel.pieces.length);
    setResetKey(k => k + 1);
    resetHints();
    setShowWin(false);
    setBackgroundRevealing(false);
  }, [currentLevel, generateScatteredPositions, setBackgroundRevealing, resetHints]);

  // Restart
  const handleRestart = () => {
    logRestart();
    restart();
    scatteredPositions.current = generateScatteredPositions(pieces.length);
    setResetKey(k => k + 1);
    setMenuVisible(false);
    setShowWin(false);
    resetHints();
    setBackgroundRevealing(false);
  };

  return (
    <View style={styles.container}>
      {!isRevealing && (
        <GameBoard
          board={board}
          hintCells={hintCells}
          boardTopPos={BOARD_TOP_POS}
          boardLeftPos={BOARD_LEFT_POS}
        />
      )}

      {!isRevealing && (
        <GameHeader
          currentLevelNumber={currentLevelNumber}
          moveCount={moveCount}
          gameTime={gameTime}
          onLevelPress={handleNextLevel}
          onMenuPress={toggleMenu}
        />
      )}

      {!isRevealing && (
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
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onTapRotate={handleTapRotate}
              />
            );
          })}
        </View>
      )}

      {!isRevealing && (
        <GameFooter
          isOver={isOver}
          isMusicMuted={isMusicMuted}
          shouldShowHintButton={shouldShowHintButton}
          freeHints={freeHints}
          onMenuPress={toggleMenu}
          onHintPress={onHintPress}
          onMusicToggle={toggleMusic}
        />
      )}

      <WinScreen
        visible={showWin}
        levelNumber={currentLevelNumber}
        moves={moveCount}
        time={getElapsedTime()}
        pieceCount={currentLevel.pieces.length}
        boardSize={currentLevel.board.length * currentLevel.board[0].length}
        hintCount={hintCount}
        isLastLevel={currentLevelNumber === levels.length - 1}
        onNextLevel={handleNextLevel}
        onRestart={handleRestart}
        onHome={handleHome}
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
