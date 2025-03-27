import { WINNING_COMBINATIONS } from "@shared/schema";

// Check if there's a winner in the game
export const checkForWin = (board: (number | null)[]): number | null => {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c, d, e] = combo;
    if (
      board[a] !== null &&
      board[a] === board[b] &&
      board[a] === board[c] &&
      board[a] === board[d] &&
      board[a] === board[e]
    ) {
      return board[a];
    }
  }
  return null;
};

// Check if the game is a draw
export const checkForDraw = (board: (number | null)[]): boolean => {
  return board.every(cell => cell !== null);
};
