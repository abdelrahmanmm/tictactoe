import React, { createContext, useContext, useEffect, useState } from "react";
import { Game, GameState, INITIAL_GAME_STATE, INITIAL_SCORES, PLAYERS } from "@shared/schema";
import { checkForWin, checkForDraw } from "../utils/gameUtils";

// Custom game type for GitHub Pages
interface GitHubPagesGame {
  id: number;
  gameState: GameState;
  scores: number[];
}

// Union type to handle both server and GitHub Pages formats
type GameWithState = Game | GitHubPagesGame;

// Helper function to check if a game is a GitHub Pages game
const isGitHubPagesGame = (game: GameWithState): game is GitHubPagesGame => {
  return 'gameState' in game;
};

// Helper function to get game state regardless of format
export const getGameState = (game: GameWithState): GameState => {
  return isGitHubPagesGame(game) ? game.gameState : game.state;
};

// Define the context type
interface GameContextType {
  game: GameWithState | null;
  loading: boolean;
  error: string | null;
  makeMove: (cellIndex: number) => void;
  startNewGame: () => void;
  resetScores: () => void;
}

// Create context with default values
const GameContext = createContext<GameContextType>({
  game: null,
  loading: true,
  error: null,
  makeMove: () => {},
  startNewGame: () => {},
  resetScores: () => {},
});

// Create WebSocket connection
let ws: WebSocket | null = null;

// Static game data for GitHub Pages (where there's no backend)
let staticGameId = 1;
let staticScores = [...INITIAL_SCORES];

// Hook to use the game context
export const useGame = () => useContext(GameContext);

// Provider component
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [game, setGame] = useState<GameWithState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [isGitHubPages, setIsGitHubPages] = useState<boolean>(false);

  // Default game ID - for now we'll use a single game
  const DEFAULT_GAME_ID = 1;

  // Initialize game state
  useEffect(() => {
    // Check if running on GitHub Pages
    const isGitHubPagesHosting = window.location.hostname.includes('github.io');
    setIsGitHubPages(isGitHubPagesHosting);
    
    if (isGitHubPagesHosting) {
      console.log("Running on GitHub Pages - using static game data");
      // Initialize with static game data for GitHub Pages
      const staticGame: GitHubPagesGame = {
        id: staticGameId,
        gameState: { ...INITIAL_GAME_STATE },
        scores: [...staticScores],
      };
      setGame(staticGame);
      setLoading(false);
      return;
    }

    // If not on GitHub Pages, connect to WebSocket
    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    // Create WebSocket URL with the same host but ws/wss protocol
    const wsUrl = `${protocol}//${host}/ws`;
    
    console.log("Connecting to WebSocket at:", wsUrl);
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log("WebSocket connected successfully");
      setWsConnected(true);
      
      // Join game
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: "join_game",
          gameId: DEFAULT_GAME_ID
        }));
      }
    };
    
    ws.onmessage = (event) => {
      try {
        console.log("WebSocket message received:", event.data);
        const data = JSON.parse(event.data);
        console.log("Parsed WebSocket data:", data);
        
        if (data.type === "game_state" && data.game) {
          console.log("Setting game state:", data.game);
          setGame(data.game);
          setLoading(false);
        } else if (data.type === "error") {
          console.error("Server error:", data.message);
          setError(`Server error: ${data.message}`);
        } else {
          console.log("Received message:", data);
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
        setError("Failed to parse game data");
      }
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError(`WebSocket connection error. Please try refreshing the page.`);
      
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (ws && ws.readyState === WebSocket.CLOSED) {
          console.log("Attempting to reconnect WebSocket...");
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          const host = window.location.host;
          const wsUrl = `${protocol}//${host}/ws`;
          
          try {
            ws = new WebSocket(wsUrl);
          } catch (err) {
            console.error("Failed to reconnect:", err);
          }
        }
      }, 3000);
    };
    
    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setWsConnected(false);
    };
    
    // Clean up on unmount
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Make a move in the game
  const makeMove = (cellIndex: number) => {
    if (!game) return;
    
    // For GitHub Pages (static)
    if (isGitHubPages) {
      const gameState = getGameState(game);
      
      // Only allow moves if the game is active and cell is empty
      if (gameState.gameActive && gameState.board[cellIndex] === null) {
        // Make a copy of game state and update it
        const newGameState = { ...gameState };
        
        // Update board with player's move
        newGameState.board = [...newGameState.board];
        newGameState.board[cellIndex] = newGameState.currentPlayerIndex;
        
        // Check for win
        const winner = checkForWin(newGameState.board);
        if (winner !== null) {
          newGameState.winner = winner;
          newGameState.gameActive = false;
          
          // Update scores
          const scores = [...game.scores];
          scores[winner]++;
          staticScores = scores;
          
          // Update game
          if (isGitHubPagesGame(game)) {
            setGame({
              ...game,
              gameState: newGameState,
              scores
            });
          } else {
            setGame({
              ...game,
              state: newGameState,
              scores
            });
          }
          return;
        }
        
        // Check for draw
        if (checkForDraw(newGameState.board)) {
          newGameState.isDraw = true;
          newGameState.gameActive = false;
          
          // Update draw count
          const scores = [...game.scores];
          scores[3]++; // Draw counter
          staticScores = scores;
          
          // Update game
          if (isGitHubPagesGame(game)) {
            setGame({
              ...game,
              gameState: newGameState,
              scores
            });
          } else {
            setGame({
              ...game,
              state: newGameState,
              scores
            });
          }
          return;
        }
        
        // Move to next player
        newGameState.currentPlayerIndex = (newGameState.currentPlayerIndex + 1) % 3; // Cycle between 0, 1, 2
        
        // Update game
        if (isGitHubPagesGame(game)) {
          setGame({
            ...game,
            gameState: newGameState
          });
        } else {
          setGame({
            ...game,
            state: newGameState
          });
        }
        return;
      }
    }
    
    // For WebSocket connection
    if (ws && ws.readyState === WebSocket.OPEN) {
      const gameState = getGameState(game);
      
      // Only allow moves if the game is active and cell is empty
      if (gameState.gameActive && gameState.board[cellIndex] === null) {
        ws.send(JSON.stringify({
          type: "make_move",
          gameId: game.id,
          cellIndex
        }));
      }
    }
  };

  // Start a new game
  const startNewGame = () => {
    if (!game) return;
    
    // For GitHub Pages (static)
    if (isGitHubPages) {
      // Reset game state but keep scores
      const newGameState: GameState = {
        board: Array(25).fill(null), // 5x5 grid = 25 cells
        currentPlayerIndex: 0,
        gameActive: true,
        winner: null,
        isDraw: false
      };
      
      // Update game with new state
      if (isGitHubPagesGame(game)) {
        setGame({
          ...game,
          gameState: newGameState
        });
      } else {
        setGame({
          ...game,
          state: newGameState
        });
      }
      return;
    }
    
    // For WebSocket connection
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: "restart_game",
        gameId: game.id
      }));
    }
  };

  // Reset scores
  const resetScores = () => {
    if (!game) return;
    
    // For GitHub Pages (static)
    if (isGitHubPages) {
      const resetScores = [0, 0, 0, 0];
      staticScores = resetScores;
      
      setGame({
        ...game,
        scores: resetScores
      });
      return;
    }
    
    // For WebSocket connection
    if (ws && ws.readyState === WebSocket.OPEN) {
      // This would require a new endpoint on the server
      // For now, we leave it unimplemented 
      ws.send(JSON.stringify({
        type: "reset_scores",
        gameId: game.id
      }));
    }
  };

  // Provide context values
  const contextValue: GameContextType = {
    game,
    loading,
    error,
    makeMove,
    startNewGame,
    resetScores
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};
