import { GameState, PLAYERS } from "@shared/schema";

interface GameStatusProps {
  gameState: GameState;
}

export default function GameStatus({ gameState }: GameStatusProps) {
  const { winner, isDraw, gameActive } = gameState;

  let message = "";
  let style = { color: "#4B5563", fontWeight: 500 }; // Default gray color
  
  if (winner !== null) {
    message = `${PLAYERS[winner].name} wins!`;
    style = { color: PLAYERS[winner].color, fontWeight: 700 };
  } else if (isDraw) {
    message = "Game ended in a draw!";
    style = { color: "#1F2937", fontWeight: 700 }; // Dark gray for draw
  } else if (gameActive) {
    message = "Game in progress - make your move!";
  }

  return (
    <div className="mt-4 text-center p-3 bg-white rounded-lg shadow-sm">
      <p style={style}>{message}</p>
    </div>
  );
}
