import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Cell } from '../../types/types.ts';
import { colors, spacing, shadows } from '../../theme';

type Props = {
  board: Cell[][];
  hintCells: { x: number; y: number }[];
  boardTopPos: number;
  boardLeftPos: number;
};

export const GameBoard: React.FC<Props> = React.memo(({
  board,
  hintCells,
  boardTopPos,
  boardLeftPos,
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
    ...shadows.board,
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
});
