import { PLAYERS } from "@shared/schema";

interface CurrentPlayerIndicatorProps {
  currentPlayerIndex: number;
  gameActive: boolean;
}

export default function CurrentPlayerIndicator({ 
  currentPlayerIndex, 
  gameActive 
}: CurrentPlayerIndicatorProps) {
  const currentPlayer = PLAYERS[currentPlayerIndex];

  return (
    <div className="mb-4 p-4 bg-white rounded-lg shadow-sm text-center">
      <h2 className="text-lg font-semibold text-gray-700">Current Player</h2>
      <div className="mt-2 flex items-center justify-center">
        <div 
          className={`player-turn-indicator flex items-center justify-center w-12 h-12 rounded-full 
                    bg-${currentPlayer.color} text-white font-bold text-2xl ${gameActive ? 'pulse-animation' : ''}`}
          style={{ backgroundColor: currentPlayer.color }}
        >
          {currentPlayer.symbol}
        </div>
        <div className="ml-3 text-left">
          <p className="font-semibold" style={{ color: currentPlayer.color }}>{currentPlayer.name}</p>
          <p className="text-sm text-gray-600">{gameActive ? 'Your turn' : 'Game ended'}</p>
        </div>
      </div>
    </div>
  );
}
