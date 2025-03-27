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

  checkForWin(board: (number | null)[]): number | null {
    for (const combo of WINNING_COMBINATIONS) {
      const [a, b, c, d, e] = combo;
      if (
        board[a] !== null &&
        board[a] === board[b] &&
        board[a] === board[c] &&
        board[a] === board[d] &&
        board[a] === board[e]
      ) {
        return board[a];
      }
    }
    return null;
  }

  checkForDraw(board: (number | null)[]): boolean {
    return board.every(cell => cell !== null);
  }
}

export const storage = new MemStorage();
