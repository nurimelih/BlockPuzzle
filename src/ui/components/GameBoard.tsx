import React, { useCallback } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Cell } from '../../types/types.ts';
import { colors, spacing } from '../../theme';
import type { SolverCells } from '../../state/useSolverVisualizer.ts';

type Props = {
  board: Cell[][];
  hintCells: { x: number; y: number }[];
  boardTopPos: number;
  boardLeftPos: number;
  solverCells?: SolverCells;
};

export const GameBoard: React.FC<Props> = React.memo(({
  board,
  hintCells,
  boardTopPos,
  boardLeftPos,
  solverCells,
}) => {
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

  const isHintCell = (row: number, col: number) =>
    hintCells.some(c => c.x === col && c.y === row);

  const isSolverTry = (row: number, col: number) =>
    solverCells?.try.some(c => c.x === col && c.y === row) ?? false;

  const isSolverPlaced = (row: number, col: number) =>
    solverCells?.placed.some(c => c.x === col && c.y === row) ?? false;

  return (
    <View style={[styles.level, { top: boardTopPos, left: boardLeftPos }]}>
      {board.map((row: Cell[], rowIndex: number) => (
        <View
          style={[styles.row, rowIndex === 0 && styles.topBorder]}
          key={`row-${rowIndex}`}
        >
          {row.map((cell, colIndex) => (
            <View
              key={`cell-${rowIndex}-${colIndex}`}
              style={[
                styles.cell,
                generateCellStyle(cell),
                isHintCell(rowIndex, colIndex) && styles.hintCell,
                isSolverPlaced(rowIndex, colIndex) && (solverCells?.solved ? styles.solverSolved : styles.solverPlaced),
                isSolverTry(rowIndex, colIndex) && styles.solverTry,
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
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
  solverTry: {
    backgroundColor: 'rgba(255, 100, 100, 0.45)',
    borderColor: 'rgba(255, 60, 60, 0.7)',
    borderWidth: 1,
  },
  solverPlaced: {
    backgroundColor: 'rgba(100, 200, 100, 0.55)',
    borderColor: 'rgba(50, 180, 50, 0.8)',
    borderWidth: 1,
  },
  solverSolved: {
    backgroundColor: 'rgba(80, 160, 255, 0.6)',
    borderColor: 'rgba(40, 120, 255, 0.9)',
    borderWidth: 1.5,
  },
});
