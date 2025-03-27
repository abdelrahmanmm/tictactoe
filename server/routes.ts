import type { Express } from "express";
import { createServer, type Server } from "http";

/**
 * Registers all routes for the personal website application
 * 
 * Sets up the HTTP server for the website
 * 
 * @param app - The Express application instance
 * @returns A Promise resolving to the HTTP server
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server from Express app
  const httpServer = createServer(app);
  
  // Create API routes
  app.get("/api/hello", (req, res) => {
    res.json({ message: "Hello from the personal website!" });
  });

  // Return the HTTP server, which will be used by Express to listen for requests
  return httpServer;
}
