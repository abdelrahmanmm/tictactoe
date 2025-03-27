import { useGame } from "@/contexts/GameContext";
import { PLAYERS } from "@shared/schema";

interface GameBoardProps {
  board: (number | null)[];
  gameActive: boolean;
}

export default function GameBoard({ board, gameActive }: GameBoardProps) {
  const { makeMove } = useGame();

  const handleCellClick = (index: number) => {
    if (gameActive && board[index] === null) {
      makeMove(index);
    }
  };

  return (
    <div className="board-container mx-auto">
      <div className="grid grid-cols-5 gap-2 bg-gray-200 p-2 rounded-lg shadow-md">
        {board.map((cell, index) => (
          <div
            key={index}
            className={`cell bg-white rounded-md flex items-center justify-center text-3xl font-bold cursor-pointer shadow-sm h-12 w-12
                      ${gameActive && cell === null ? 'hover:bg-gray-50' : ''}`}
            onClick={() => handleCellClick(index)}
          >
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
