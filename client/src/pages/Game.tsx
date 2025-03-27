import { useState, useEffect } from "react";
import { useGame, getGameState } from "@/contexts/GameContext";
import GameBoard from "@/components/GameBoard";
import CurrentPlayerIndicator from "@/components/CurrentPlayerIndicator";
import PlayerScores from "@/components/PlayerScores";
import GameStatus from "@/components/GameStatus";
import GameControls from "@/components/GameControls";
import GameInstructions from "@/components/GameInstructions";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { GameState } from "@shared/schema";

export default function Game() {
  const { game, loading, error } = useGame();
  const [isGitHubPages, setIsGitHubPages] = useState(false);

  useEffect(() => {
    // Check if running on GitHub Pages
    setIsGitHubPages(window.location.hostname.includes('github.io'));
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!game) {
    return <ErrorState message="Game not found" />;
  }

  // Get game state using helper function
  const gameState = getGameState(game);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-indigo-600">4-Player Tic-Tac-Toe</h1>
        <p className="mt-2 text-gray-600">First player to get 5 in a row wins!</p>
      </header>

      <div className="lg:flex lg:items-start lg:justify-center gap-8">
        {/* Game Board and Current Player Section */}
        <div className="mb-6 lg:mb-0">
          {/* Current Player Indicator */}
          <CurrentPlayerIndicator 
            currentPlayerIndex={gameState.currentPlayerIndex}
            gameActive={gameState.gameActive}
          />

          {/* Game Board */}
          <GameBoard 
            board={gameState.board}
            gameActive={gameState.gameActive}
          />

          {/* Game Status */}
          <GameStatus 
            gameState={gameState}
          />

          {/* Game Controls */}
          <GameControls />
        </div>

        {/* Player Scores and Instructions Section */}
        <div className="lg:w-72">
          {/* Player Scores */}
          <PlayerScores scores={game.scores} />

          {/* Game Instructions */}
          <GameInstructions />
        </div>
      </div>
      
      {isGitHubPages && (
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Running in standalone mode for GitHub Pages deployment.</p>
          <p>No server connection required - all game logic runs in your browser!</p>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-indigo-600">4-Player Tic-Tac-Toe</h1>
        <p className="mt-2 text-gray-600">Loading game...</p>
      </header>

      <div className="lg:flex lg:items-start lg:justify-center gap-8">
        <div className="mb-6 lg:mb-0">
          <Skeleton className="h-24 w-full mb-4 rounded-lg" />
          <Skeleton className="h-80 w-full mb-4 rounded-lg" />
          <Skeleton className="h-16 w-full mb-4 rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
        <div className="lg:w-72">
          <Skeleton className="h-64 w-full mb-6 rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-indigo-600">4-Player Tic-Tac-Toe</h1>
      </header>

      <div className="max-w-md mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {message}. Please refresh the page to try again.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
