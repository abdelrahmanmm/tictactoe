import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer } from "ws";
import { PLAYERS, WINNING_COMBINATIONS } from "@shared/schema";

// Type definition for WebSocket message
type WSMessage = {
  type: string;
  gameId?: number;
  cellIndex?: number;
  action?: string;
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  // Create a WebSocket server instance for the /ws path
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: "/ws"
  });

  // Store connected clients
  const clients = new Map();

  // Create initial game on server start
  let defaultGameId: number | null = null;
  const defaultGame = await storage.createGame();
  defaultGameId = defaultGame.id;

  // WebSocket connection handler
  wss.on("connection", (ws) => {
    const clientId = Date.now();
    clients.set(clientId, ws);

    console.log(`Client connected: ${clientId}`);

    // Send the initial game state to new client
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

    // Handle messages from clients
    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString()) as WSMessage;
        
        if (data.type === "getGame" && data.gameId) {
          const game = await storage.getGame(data.gameId);
          if (game) {
            ws.send(JSON.stringify({
              type: "gameState",
              game: game
            }));
          }
        }
        
        else if (data.type === "makeMove" && data.gameId && typeof data.cellIndex === "number") {
          const game = await storage.getGame(data.gameId);
          
          if (game && game.state.gameActive && game.state.board[data.cellIndex] === null) {
            const board = [...game.state.board];
            const currentPlayerIndex = game.state.currentPlayerIndex;
            
            // Make the move
            board[data.cellIndex] = currentPlayerIndex;
            
            // Check for win
            const winner = storage.checkForWin(board);
            const isDraw = winner === null && storage.checkForDraw(board);
            
            // Update scores if there's a winner
            let scores = [...game.scores];
            if (winner !== null) {
              scores[winner]++;
            }
            
            // Update game state
            const newState = {
              board,
              currentPlayerIndex: winner !== null || isDraw 
                ? currentPlayerIndex // Keep the same player if game ended
                : (currentPlayerIndex + 1) % 4, // Next player
              gameActive: winner === null && !isDraw,
              winner,
              isDraw
            };
            
            // Save the updated game
            await storage.updateGameState(data.gameId, newState);
            await storage.updateScores(data.gameId, scores);
            
            // Get updated game and broadcast to all clients
            const updatedGame = await storage.getGame(data.gameId);
            if (updatedGame) {
              broadcastGameState(updatedGame);
            }
          }
        }
        
        else if (data.type === "newGame" && data.gameId) {
          const game = await storage.getGame(data.gameId);
          
          if (game) {
            // Reset game state but keep scores
            const newState = {
              board: Array(9).fill(null),
              currentPlayerIndex: 0, // Always start with player 1
              gameActive: true,
              winner: null,
              isDraw: false
            };
            
            await storage.updateGameState(data.gameId, newState);
            
            // Get updated game and broadcast to all clients
            const updatedGame = await storage.getGame(data.gameId);
            if (updatedGame) {
              broadcastGameState(updatedGame);
            }
          }
        }
        
        else if (data.type === "resetScores" && data.gameId) {
          const game = await storage.getGame(data.gameId);
          
          if (game) {
            // Reset scores and game state
            const newState = {
              board: Array(9).fill(null),
              currentPlayerIndex: 0,
              gameActive: true,
              winner: null,
              isDraw: false
            };
            
            await storage.updateGameState(data.gameId, newState);
            await storage.updateScores(data.gameId, [0, 0, 0, 0]);
            
            // Get updated game and broadcast to all clients
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

    // Handle client disconnection
    ws.on("close", () => {
      clients.delete(clientId);
      console.log(`Client disconnected: ${clientId}`);
    });
  });

  // Broadcast game state to all connected clients
  function broadcastGameState(game: any) {
    const message = JSON.stringify({
      type: "gameState",
      game: game
    });
    
    clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    });
  }

  // REST API routes
  app.get("/api/game/:id", async (req, res) => {
    const gameId = parseInt(req.params.id);
    const game = await storage.getGame(gameId);
    
    if (game) {
      res.json(game);
    } else {
      res.status(404).json({ message: "Game not found" });
    }
  });

  app.post("/api/game", async (req, res) => {
    const game = await storage.createGame();
    res.status(201).json(game);
  });

  // Return the HTTP server, which will be used by Express to listen for requests
  return httpServer;
}
