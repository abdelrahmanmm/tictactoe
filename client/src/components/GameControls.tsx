import { useGame } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";

export default function GameControls() {
  const { startNewGame, resetScores } = useGame();

  return (
    <div className="mt-4 flex justify-center gap-4">
      <Button 
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
        onClick={startNewGame}
      >
        New Game
      </Button>
      <Button 
        variant="outline"
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
        onClick={resetScores}
      >
        Reset Scores
      </Button>
    </div>
  );
}
