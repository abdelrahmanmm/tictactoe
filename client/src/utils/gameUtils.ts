import { WINNING_COMBINATIONS } from "@shared/schema";

/**
 * Check if there's a winner in the game
 * 
 * This client-side utility function mirrors the server-side logic for checking
 * if a player has won the game by getting 5 in a row (horizontally, vertically, or diagonally)
 * 
 * @param {(number | null)[]} board - The current game board (25 cells for 5x5 grid)
 * @returns {number | null} - The player index who won, or null if no winner
 */
export const checkForWin = (board: (number | null)[]): number | null => {
  // Check each winning combination from the schema
  for (const combo of WINNING_COMBINATIONS) {
    // Each combo contains 5 positions that need to be checked
    const [a, b, c, d, e] = combo;
    
    // Check if all 5 positions contain the same player's marker (not null)
    if (
      board[a] !== null &&       // Position a has a player marker
      board[a] === board[b] &&   // Position b has the same marker as a
      board[a] === board[c] &&   // Position c has the same marker as a
      board[a] === board[d] &&   // Position d has the same marker as a
      board[a] === board[e]      // Position e has the same marker as a
    ) {
      // Return the player index who has 5 in a row
      return board[a];
    }
  }
  // If no winning combination is found, return null
  return null;
};

/**
 * Check if the game is a draw
 * 
 * A draw occurs when all cells are filled and no player has won
 * 
 * @param {(number | null)[]} board - The current game board
 * @returns {boolean} - True if the game is a draw, false otherwise
 */
export const checkForDraw = (board: (number | null)[]): boolean => {
  // If every cell is filled (not null), it's a draw
  return board.every(cell => cell !== null);
};
