import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define player type
export type Player = {
  id: number;
  symbol: string;
  color: string;
  name: string;
};

// Define game state type
export type GameState = {
  board: (number | null)[];
  currentPlayerIndex: number;
  gameActive: boolean;
  winner: number | null;
  isDraw: boolean;
};

// Define the game model
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  state: jsonb("state").$type<GameState>().notNull(),
  scores: jsonb("scores").$type<number[]>().notNull(),
});

// Define insert schema
export const insertGameSchema = createInsertSchema(games).pick({
  state: true,
  scores: true,
});

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

// Define user model (if needed for authentication later)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Define constants for the game
export const PLAYERS: Player[] = [
  { id: 0, symbol: "X", color: "#EF4444", name: "Player 1" }, // Red
  { id: 1, symbol: "O", color: "#3B82F6", name: "Player 2" }, // Blue
  { id: 2, symbol: "△", color: "#10B981", name: "Player 3" }, // Green
  { id: 3, symbol: "□", color: "#F59E0B", name: "Player 4" }, // Amber
];

export const WINNING_COMBINATIONS: number[][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export const INITIAL_GAME_STATE: GameState = {
  board: Array(9).fill(null),
  currentPlayerIndex: 0,
  gameActive: true,
  winner: null,
  isDraw: false,
};

export const INITIAL_SCORES = [0, 0, 0, 0];
