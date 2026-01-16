import { Cell } from '../types/types.ts';

/**
 * Converts a text string into a board pattern
 * Vowels (a,e,i,o,u,ı,ü,ö) -> Cell.INVALID (0)
 * Consonants -> Cell.AVAILABLE (1)
 * Creates nearest perfect square grid
 */
export function textToBoard(text: string): number[][] {
  // Remove spaces and convert to lowercase
  const cleanText = text.toLowerCase().replace(/\s+/g, '');

  // Find nearest perfect square
  const charCount = cleanText.length;
  const gridSize = Math.ceil(Math.sqrt(Math.min(charCount, 64)));

  // Turkish + English vowels
  const vowels = new Set(['a', 'e', 'i', 'o', 'u', 'ı', 'ü', 'ö']);

  // Convert text to cell values
  const cells: number[] = [];
  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    // Only process letters
    if (/[a-zçğışüö]/.test(char)) {
      cells.push(vowels.has(char) ? Cell.INVALID : Cell.AVAILABLE);
    }
  }

  // Pad with AVAILABLE cells if needed to fill the square
  while (cells.length < gridSize * gridSize) {
    cells.push(Cell.AVAILABLE);
  }

  // Convert flat array to 2D grid
  const board: number[][] = [];
  for (let row = 0; row < gridSize; row++) {
    const rowCells: number[] = [];
    for (let col = 0; col < gridSize; col++) {
      rowCells.push(cells[row * gridSize + col]);
    }
    board.push(rowCells);
  }

  return board;
}
