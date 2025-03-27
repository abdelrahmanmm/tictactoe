import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer } from "ws";
import { PLAYERS, WINNING_COMBINATIONS } from "@shared/schema";

/**
 * Type definition for WebSocket messages
 * 
 * This defines the structure of messages sent between client and server
 * over the WebSocket connection
 */
type WSMessage = {
  type: string;         // The type of message (e.g., "makeMove", "newGame")
  gameId?: number;      // The ID of the game being referenced
  cellIndex?: number;   // The index of the cell being played (0-24 for 5x5 grid)
  action?: string;      // Additional action information if needed
};

/**
 * Registers all routes and WebSocket handlers for the application
 * 
 * This function sets up:
 * 1. The WebSocket server for real-time game updates
 * 2. REST API endpoints for HTTP requests
 * 3. Game state management and broadcasting
 * 
 * @param app - The Express application instance
 * @returns A Promise resolving to the HTTP server
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server from Express app
  const httpServer = createServer(app);
  
  // Create a WebSocket server instance attached to the HTTP server
  // Using a specific path to avoid conflicts with Vite's HMR WebSocket
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: "/ws"
  });

  // Map to store all connected WebSocket clients
  const clients = new Map();

  // Create an initial game when the server starts
  let defaultGameId: number | null = null;
  const defaultGame = await storage.createGame();
  defaultGameId = defaultGame.id;

  /**
   * WebSocket connection event handler
   * 
   * Handles new client connections and sets up message processing
   */
  wss.on("connection", (ws) => {
    // Generate a unique ID for this client
    const clientId = Date.now();
    clients.set(clientId, ws);

    console.log(`Client connected: ${clientId}`);

    // Send the initial game state to the newly connected client
    if (defaultGameId) {
      console.log(`Attempting to send initial game state for game ID: ${defaultGameId}`);
      storage.getGame(defaultGameId).then((game) => {
        if (game) {
          console.log("Retrieved game data:", game);
          const message = JSON.stringify({
            type: "gameState",
            game: game
          });
          console.log("Sending message to client:", message);
          ws.send(message);
        } else {
          console.log(`Game with ID ${defaultGameId} not found`);
        }
      }).catch(err => {
        console.error("Error retrieving game:", err);
      });
    } else {
      console.log("No default game ID available");
    }

    /**
     * WebSocket message event handler
     * 
     * Processes messages from clients and performs the appropriate actions
     */
    ws.on("message", async (message) => {
      try {
        // Parse the incoming message
        const data = JSON.parse(message.toString()) as WSMessage;
        
        // Handle "getGame" message type - client requesting game state
        if (data.type === "getGame" && data.gameId) {
          const game = await storage.getGame(data.gameId);
          if (game) {
            // Send the current game state back to the client
            ws.send(JSON.stringify({
              type: "gameState",
              game: game
            }));
          }
        }
        
        // Handle "makeMove" message type - client making a move
        else if (data.type === "makeMove" && data.gameId && typeof data.cellIndex === "number") {
          const game = await storage.getGame(data.gameId);
          
          // Validate that the move is legal
          if (game && game.state.gameActive && game.state.board[data.cellIndex] === null) {
            // Create a copy of the current board
            const board = [...game.state.board];
            const currentPlayerIndex = game.state.currentPlayerIndex;
            
            // Update the board with the new move
            board[data.cellIndex] = currentPlayerIndex;
            
            // Check if the move resulted in a win or draw
            const winner = storage.checkForWin(board);
            const isDraw = winner === null && storage.checkForDraw(board);
            
            // Update scores if there's a winner
            let scores = [...game.scores];
            if (winner !== null) {
              scores[winner]++;
            }
            
            // Create the new game state
            const newState = {
              board,
              currentPlayerIndex: winner !== null || isDraw 
                ? currentPlayerIndex // Keep the same player if game ended
                : (currentPlayerIndex + 1) % 4, // Next player (cycle through 0-3)
              gameActive: winner === null && !isDraw, // Game continues if no winner and not a draw
              winner,
              isDraw
            };
            
            // Save the updated game state and scores
            await storage.updateGameState(data.gameId, newState);
            await storage.updateScores(data.gameId, scores);
            
            // Broadcast the updated game state to all clients
            const updatedGame = await storage.getGame(data.gameId);
            if (updatedGame) {
              broadcastGameState(updatedGame);
            }
          }
        }
        
        // Handle "newGame" message type - start a new game
        else if (data.type === "newGame" && data.gameId) {
          const game = await storage.getGame(data.gameId);
          
          if (game) {
            // Reset the game board but keep scores from previous games
            const newState = {
              board: Array(25).fill(null), // Empty 5x5 board
              currentPlayerIndex: 0,       // Start with player 0
              gameActive: true,            // Game is now active
              winner: null,                // No winner yet
              isDraw: false                // Not a draw
            };
            
            // Update the game state
            await storage.updateGameState(data.gameId, newState);
            
            // Broadcast the new game state to all clients
            const updatedGame = await storage.getGame(data.gameId);
            if (updatedGame) {
              broadcastGameState(updatedGame);
            }
          }
        }
        
        // Handle "resetScores" message type - reset all scores and start fresh
        else if (data.type === "resetScores" && data.gameId) {
          const game = await storage.getGame(data.gameId);
          
          if (game) {
            // Reset both the game state and all player scores
            const newState = {
              board: Array(25).fill(null), // Empty 5x5 board
              currentPlayerIndex: 0,       // Start with player 0
              gameActive: true,            // Game is now active
              winner: null,                // No winner yet
              isDraw: false                // Not a draw
            };
            
            // Update game state and reset all scores to zero
            await storage.updateGameState(data.gameId, newState);
            await storage.updateScores(data.gameId, [0, 0, 0, 0]);
            
            // Broadcast the reset game state to all clients
            const updatedGame = await storage.getGame(data.gameId);
            if (updatedGame) {
              broadcastGameState(updatedGame);
            }
          }
        }
        
      } catch (error) {
        console.error("Error processing message:", error);
      }
    });

    /**
     * WebSocket close event handler
     * 
     * Cleans up when a client disconnects
     */
    ws.on("close", () => {
      clients.delete(clientId);
      console.log(`Client disconnected: ${clientId}`);
    });
  });

  /**
   * Broadcasts a game state update to all connected clients
   * 
   * @param game - The current game state to broadcast
   */
  function broadcastGameState(game: any) {
    // Create the message to send
    const message = JSON.stringify({
      type: "gameState",
      game: game
    });
    
    // Send to all connected clients
    clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    });
  }

  /**
   * REST API endpoint to get a specific game by ID
   */
  app.get("/api/game/:id", async (req, res) => {
    const gameId = parseInt(req.params.id);
    const game = await storage.getGame(gameId);
    
    if (game) {
      res.json(game);
    } else {
      res.status(404).json({ message: "Game not found" });
    }
  });

  /**
   * REST API endpoint to create a new game
   */
  app.post("/api/game", async (req, res) => {
    const game = await storage.createGame();
    res.status(201).json(game);
  });

  // Return the HTTP server, which will be used by Express to listen for requests
  return httpServer;
}
