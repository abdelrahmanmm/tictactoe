import React, { createContext, useContext, useEffect, useState } from "react";
import { Game, GameState, INITIAL_GAME_STATE, INITIAL_SCORES, PLAYERS } from "@shared/schema";

// Define the context type
interface GameContextType {
  game: Game | null;
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

// Hook to use the game context
export const useGame = () => useContext(GameContext);

// Provider component
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);

  // Default game ID - for now we'll use a single game
  const DEFAULT_GAME_ID = 1;

  // Initialize WebSocket connection
  useEffect(() => {
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
      
      // Request initial game state
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: "getGame",
          gameId: DEFAULT_GAME_ID
        }));
      }
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "gameState" && data.game) {
          setGame(data.game);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
        setError("Failed to parse game data");
      }
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError(`WebSocket connection error. Please check if the server is running on port ${window.location.port}.`);
      
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
    if (!game || !ws || ws.readyState !== WebSocket.OPEN) return;
    
    // Only allow moves if the game is active and cell is empty
    if (game.state.gameActive && game.state.board[cellIndex] === null) {
      ws.send(JSON.stringify({
        type: "makeMove",
        gameId: game.id,
        cellIndex
      }));
    }
  };

  // Start a new game
  const startNewGame = () => {
    if (!game || !ws || ws.readyState !== WebSocket.OPEN) return;
    
    ws.send(JSON.stringify({
      type: "newGame",
      gameId: game.id
    }));
  };

  // Reset scores
  const resetScores = () => {
    if (!game || !ws || ws.readyState !== WebSocket.OPEN) return;
    
    ws.send(JSON.stringify({
      type: "resetScores",
      gameId: game.id
    }));
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
