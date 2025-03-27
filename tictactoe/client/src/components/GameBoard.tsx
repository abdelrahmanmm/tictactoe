import { useGame } from "@/contexts/GameContext";
import { PLAYERS } from "@shared/schema";

/**
 * Props for the GameBoard component
 * 
 * @interface GameBoardProps
 * @property {(number | null)[]} board - Array representing the current state of the game board
 * @property {boolean} gameActive - Whether the game is currently active or not
 */
interface GameBoardProps {
  board: (number | null)[];  // Array of 25 elements for 5x5 grid
  gameActive: boolean;       // Is the game in progress?
}

/**
 * GameBoard Component
 * 
 * Renders a 5x5 grid for the Tic-tac-toe game
 * Allows players to make moves by clicking on empty cells
 * Displays player symbols with appropriate colors
 * 
 * @param {GameBoardProps} props - Component props
 * @returns {JSX.Element} - The rendered game board
 */
export default function GameBoard({ board, gameActive }: GameBoardProps) {
  // Get the makeMove function from the game context
  const { makeMove } = useGame();

  /**
   * Handles a cell click event
   * 
   * Triggers a move if the game is active and the cell is empty
   * 
   * @param {number} index - The index of the clicked cell (0-24)
   */
  const handleCellClick = (index: number) => {
    if (gameActive && board[index] === null) {
      makeMove(index);
    }
  };

  return (
    <div className="board-container mx-auto">
      {/* 5x5 grid layout using CSS Grid */}
      <div className="grid grid-cols-5 gap-2 bg-gray-200 p-2 rounded-lg shadow-md">
        {/* Map through each cell in the board array (25 cells) */}
        {board.map((cell, index) => (
          <div
            key={index}
            className={`cell bg-white rounded-md flex items-center justify-center text-3xl font-bold cursor-pointer shadow-sm h-12 w-12
                      ${gameActive && cell === null ? 'hover:bg-gray-50' : ''}`}
            onClick={() => handleCellClick(index)}
          >
            {/* If cell is not empty, show the player's symbol */}
            {cell !== null && (
              <span style={{ color: PLAYERS[cell].color }}>
                {PLAYERS[cell].symbol}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
