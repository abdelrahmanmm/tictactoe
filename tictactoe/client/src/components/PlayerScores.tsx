import { PLAYERS } from "@shared/schema";

interface PlayerScoresProps {
  scores: number[];
}

export default function PlayerScores({ scores }: PlayerScoresProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Scoreboard</h2>
      <div className="space-y-3">
        {PLAYERS.map((player, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-2 rounded-md" 
            style={{ backgroundColor: `rgba(${parseInt(player.color.slice(1, 3), 16)}, ${parseInt(player.color.slice(3, 5), 16)}, ${parseInt(player.color.slice(5, 7), 16)}, 0.1)` }}
          >
            <div className="flex items-center">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: player.color }}
              >
                {player.symbol}
              </div>
              <span className="ml-2 font-medium">{player.name}</span>
            </div>
            <span className="text-xl font-bold">{scores[index]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
