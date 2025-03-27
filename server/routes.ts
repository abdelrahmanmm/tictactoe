import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { GameState } from "../shared/schema";

/**
 * Registers all routes for the Tic-tac-toe game application
 * 
 * Sets up the HTTP server and WebSocket server for the game
 * 
 * @param app - The Express application instance
 * @returns A Promise resolving to the HTTP server
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server from Express app
  const httpServer = createServer(app);
  
  // Create WebSocket server on a distinct path to avoid conflicts with Vite's HMR
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // WebSocket connections map (gameId -> list of connections)
  const connections = new Map<number, WebSocket[]>();
  
  /**
   * Create initial game on server startup
   * 
   * This ensures there's always a game with ID 1 available for clients to join
   * which improves the user experience by eliminating the need for explicit game creation.
   * The initialization code checks if a game already exists before creating a new one
   * to prevent duplicate games when the server restarts.
   */
  console.log('Initializing a default game...');
  try {
    // Check if game with ID 1 already exists in storage
    const existingGame = await storage.getGame(1);
    if (!existingGame) {
      // Create a new default game if none exists
      console.log('Creating initial game with ID 1...');
      await storage.createGame();
      console.log('Initial game created successfully!');
    } else {
      // Use existing game if available
      console.log('Game with ID 1 already exists, using existing game');
    }
  } catch (err) {
    // Log any errors during initialization
    console.error('Error creating initial game:', err);
  }
  
  // Handle WebSocket connections
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Handle messages from client
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);
        
        // Handle different message types
        switch (data.type) {
          case 'join_game':
            // Join an existing game or create a new one
            const gameId = data.gameId || null;
            let game;
            
            if (gameId) {
              game = await storage.getGame(gameId);
              if (!game) {
                ws.send(JSON.stringify({ type: 'error', message: 'Game not found' }));
                return;
              }
            } else {
              // Create a new game
              game = await storage.createGame();
            }
            
            // Add connection to the connections map
            if (!connections.has(game.id)) {
              connections.set(game.id, []);
            }
            connections.get(game.id)?.push(ws);
            
            // Associate this connection with the game
            (ws as any).gameId = game.id;
            
            /**
             * Prepare game state to send to the client
             * 
             * We add a "gameState" property that's a copy of the "state" property.
             * This dual-format approach ensures compatibility with both:
             * 1. The normal server setup where clients expect "state"
             * 2. The GitHub Pages static version where clients expect "gameState"
             * 
             * This allows the same client code to work in both environments without modification.
             */
            const clientGame = {
              ...game,
              gameState: game.state // Add gameState property for GitHub Pages compatibility
            };
            ws.send(JSON.stringify({ 
              type: 'game_state', 
              game: clientGame
            }));
            break;
            
          case 'make_move':
            const { gameId: moveGameId, cellIndex } = data;
            
            if (!moveGameId) {
              ws.send(JSON.stringify({ type: 'error', message: 'Game ID is required' }));
              return;
            }
            
            // Get current game
            const currentGame = await storage.getGame(moveGameId);
            if (!currentGame) {
              ws.send(JSON.stringify({ type: 'error', message: 'Game not found' }));
              return;
            }
            
            // Parse game state
            const gameState = currentGame.state;
            
            // Validate move
            if (!gameState.gameActive) {
              ws.send(JSON.stringify({ type: 'error', message: 'Game is not active' }));
              return;
            }
            
            if (cellIndex < 0 || cellIndex >= gameState.board.length) {
              ws.send(JSON.stringify({ type: 'error', message: 'Invalid cell index' }));
              return;
            }
            
            if (gameState.board[cellIndex] !== null) {
              ws.send(JSON.stringify({ type: 'error', message: 'Cell is already taken' }));
              return;
            }
            
            // Make the move
            gameState.board[cellIndex] = gameState.currentPlayerIndex;
            
            // Check for win
            const winner = storage.checkForWin(gameState.board);
            if (winner !== null) {
              gameState.winner = winner;
              gameState.gameActive = false;
              
              // Update scores
              const scores = [...currentGame.scores];
              scores[winner]++;
              await storage.updateScores(moveGameId, scores);
            } 
            // Check for draw
            else if (storage.checkForDraw(gameState.board)) {
              gameState.isDraw = true;
              gameState.gameActive = false;
              
              // Update the draw count (last element in scores array)
              const scores = [...currentGame.scores];
              scores[3]++; // Increment draw counter (index 3 is for draws)
              await storage.updateScores(moveGameId, scores);
            } 
            // Move to next player
            else {
              gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % 3; // Cycle between 0, 1, 2 (3 players)
            }
            
            // Update game state
            const updatedGame = await storage.updateGameState(moveGameId, gameState);
            
            // Broadcast updated game state to all clients connected to this game
            const gameConnections = connections.get(moveGameId) || [];
            gameConnections.forEach((conn) => {
              if (conn.readyState === WebSocket.OPEN) {
                /**
                 * Prepare updated game state for client
                 * 
                 * We maintain the dual-format (state and gameState properties)
                 * for compatibility with both server and GitHub Pages environments.
                 * We also handle the case where updatedGame might be undefined.
                 */
                const clientGame = updatedGame ? {
                  ...updatedGame,
                  gameState: updatedGame.state // Add gameState property for GitHub Pages compatibility
                } : null;
                conn.send(JSON.stringify({ 
                  type: 'game_state', 
                  game: clientGame 
                }));
              }
            });
            break;
            
          case 'restart_game':
            const { gameId: restartGameId } = data;
            
            if (!restartGameId) {
              ws.send(JSON.stringify({ type: 'error', message: 'Game ID is required' }));
              return;
            }
            
            // Get current game
            const gameToRestart = await storage.getGame(restartGameId);
            if (!gameToRestart) {
              ws.send(JSON.stringify({ type: 'error', message: 'Game not found' }));
              return;
            }
            
            // Create a new game state with the same ID but reset board
            const newGameState: GameState = {
              board: Array(25).fill(null), // 5x5 grid (25 cells)
              currentPlayerIndex: 0,
              gameActive: true,
              winner: null,
              isDraw: false
            };
            
            // Update game state
            const restartedGame = await storage.updateGameState(restartGameId, newGameState);
            
            // Broadcast updated game state to all clients
            const restartConnections = connections.get(restartGameId) || [];
            restartConnections.forEach((conn) => {
              if (conn.readyState === WebSocket.OPEN) {
                /**
                 * Prepare restarted game state for client
                 * 
                 * We maintain the dual-format (state and gameState properties)
                 * for compatibility with both server and GitHub Pages environments.
                 * We also handle the case where restartedGame might be undefined.
                 */
                const clientGame = restartedGame ? {
                  ...restartedGame,
                  gameState: restartedGame.state // Add gameState property for GitHub Pages compatibility
                } : null;
                conn.send(JSON.stringify({ 
                  type: 'game_state', 
                  game: clientGame 
                }));
              }
            });
            break;
            
          case 'ping':
            // Simple ping to keep connection alive
            ws.send(JSON.stringify({ type: 'pong' }));
            break;
            
          default:
            ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
        }
      } catch (err) {
        console.error('Error processing WebSocket message:', err);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });
    
    // Handle WebSocket disconnections
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      
      // Remove connection from all games
      const gameId = (ws as any).gameId;
      if (gameId && connections.has(gameId)) {
        const gameConnections = connections.get(gameId) || [];
        const index = gameConnections.indexOf(ws);
        if (index !== -1) {
          gameConnections.splice(index, 1);
        }
        
        // If no connections left for this game, remove the game from the connections map
        if (gameConnections.length === 0) {
          connections.delete(gameId);
        }
      }
    });
  });
  
  // Create API routes
  app.get("/api/games/:id", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      if (isNaN(gameId)) {
        return res.status(400).json({ error: 'Invalid game ID' });
      }
      
      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      
      res.json(game);
    } catch (err) {
      console.error('Error fetching game:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.post("/api/games", async (req, res) => {
    try {
      const game = await storage.createGame();
      res.status(201).json(game);
    } catch (err) {
      console.error('Error creating game:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Return the HTTP server, which will be used by Express to listen for requests
  return httpServer;
}
