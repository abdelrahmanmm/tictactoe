import { 
  Game, 
  InsertGame, 
  GameState, 
  INITIAL_GAME_STATE, 
  INITIAL_SCORES, 
  WINNING_COMBINATIONS,
  PLAYERS
} from "@shared/schema";

// Storage interface for the game
export interface IStorage {
  getGame(id: number): Promise<Game | undefined>;
  createGame(): Promise<Game>;
  updateGameState(id: number, state: GameState): Promise<Game | undefined>;
  updateScores(id: number, scores: number[]): Promise<Game | undefined>;
  checkForWin(board: (number | null)[]): number | null;
  checkForDraw(board: (number | null)[]): boolean;
}

export class MemStorage implements IStorage {
  private games: Map<number, Game>;
  currentId: number;

  constructor() {
    this.games = new Map();
    this.currentId = 1;
  }

  async getGame(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async createGame(): Promise<Game> {
    const id = this.currentId++;
    const game: Game = {
      id,
      state: { ...INITIAL_GAME_STATE },
      scores: [...INITIAL_SCORES],
    };
    this.games.set(id, game);
    return game;
  }

  async updateGameState(id: number, state: GameState): Promise<Game | undefined> {
    const game = this.games.get(id);
    if (!game) return undefined;

    game.state = state;
    this.games.set(id, game);
    return game;
  }

  async updateScores(id: number, scores: number[]): Promise<Game | undefined> {
    const game = this.games.get(id);
    if (!game) return undefined;

    game.scores = scores;
    this.games.set(id, game);
    return game;
  }

  /**
   * Check if there's a winning condition on the board
   * 
   * This function checks all possible winning combinations (rows, columns, diagonals)
   * for the 5x5 grid to see if any player has 5 in a row
   * 
   * @param board - The current game board state
   * @returns The player index who won, or null if no winner
   */
  checkForWin(board: (number | null)[]): number | null {
    // Loop through each possible winning combination
    for (const combo of WINNING_COMBINATIONS) {
      // Destructure the indices for the 5 positions to check
      const [a, b, c, d, e] = combo;
      
      // Check if all 5 positions have the same player's marker (not null)
      // and that they all match the first position's value
      if (
        board[a] !== null &&       // First position is not empty
        board[a] === board[b] &&   // Second position matches first
        board[a] === board[c] &&   // Third position matches first
        board[a] === board[d] &&   // Fourth position matches first
        board[a] === board[e]      // Fifth position matches first
      ) {
        // Return the player index who made the winning move
        return board[a];
      }
    }
    // If no winning combination is found, return null
    return null;
  }

  /**
   * Check if the game is a draw
   * 
   * A draw occurs when all cells are filled but no player has won
   * 
   * @param board - The current game board state
   * @returns true if the game is a draw, false otherwise
   */
  checkForDraw(board: (number | null)[]): boolean {
    // If every cell is filled (not null), it's a draw
    return board.every(cell => cell !== null);
  }
}

export const storage = new MemStorage();
