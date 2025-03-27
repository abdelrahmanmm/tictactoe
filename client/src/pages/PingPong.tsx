import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

/**
 * PingPong Game Component
 * 
 * A classic ping pong game using HTML Canvas and JavaScript
 */
export default function PingPong() {
  // Game canvas reference
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState({ player: 0, computer: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  // Game constants and variables (stored in ref to persist between renders without triggering effects)
  const gameStateRef = useRef({
    playerPaddleY: 0,
    computerPaddleY: 0,
    ballX: 0,
    ballY: 0,
    ballSpeedX: 0,
    ballSpeedY: 0,
    paddleHeight: 80,
    paddleWidth: 10,
    ballSize: 10,
    canvasWidth: 0,
    canvasHeight: 0,
    computerSpeed: 3.5,
    animationFrameId: 0
  });

  // Initialize the game
  const initGame = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const gs = gameStateRef.current;
    
    // Set canvas dimensions
    gs.canvasWidth = canvas.width;
    gs.canvasHeight = canvas.height;
    
    // Initialize paddle positions
    gs.playerPaddleY = gs.canvasHeight / 2 - gs.paddleHeight / 2;
    gs.computerPaddleY = gs.canvasHeight / 2 - gs.paddleHeight / 2;
    
    // Initialize ball position and speed
    gs.ballX = gs.canvasWidth / 2;
    gs.ballY = gs.canvasHeight / 2;
    gs.ballSpeedX = 5;
    gs.ballSpeedY = 2;
    
    setGameOver(false);
    setWinner(null);
    setGameStarted(true);
  };

  // Handle mouse movement to control player paddle
  const handleMouseMove = (e: MouseEvent) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const gs = gameStateRef.current;
    
    // Calculate mouse position relative to canvas
    const mouseY = e.clientY - rect.top;
    
    // Update player paddle position, keeping it within canvas bounds
    gs.playerPaddleY = Math.max(0, Math.min(gs.canvasHeight - gs.paddleHeight, mouseY - gs.paddleHeight / 2));
  };

  // Draw the game elements on the canvas
  const draw = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const gs = gameStateRef.current;
    
    // Clear canvas
    ctx.fillStyle = '#111827'; // Dark background
    ctx.fillRect(0, 0, gs.canvasWidth, gs.canvasHeight);
    
    // Draw center line
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = '#6B7280';
    ctx.beginPath();
    ctx.moveTo(gs.canvasWidth / 2, 0);
    ctx.lineTo(gs.canvasWidth / 2, gs.canvasHeight);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw paddles
    ctx.fillStyle = '#FFFFFF';
    
    // Player paddle (left)
    ctx.fillRect(0, gs.playerPaddleY, gs.paddleWidth, gs.paddleHeight);
    
    // Computer paddle (right)
    ctx.fillRect(gs.canvasWidth - gs.paddleWidth, gs.computerPaddleY, gs.paddleWidth, gs.paddleHeight);
    
    // Draw ball
    ctx.beginPath();
    ctx.arc(gs.ballX, gs.ballY, gs.ballSize, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.closePath();
    
    // Draw scores
    ctx.font = '24px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(score.player.toString(), gs.canvasWidth / 4, 30);
    ctx.fillText(score.computer.toString(), 3 * gs.canvasWidth / 4, 30);
  };

  // Update the game state
  const update = () => {
    const gs = gameStateRef.current;
    
    // Move the ball
    gs.ballX += gs.ballSpeedX;
    gs.ballY += gs.ballSpeedY;
    
    // AI for computer paddle
    // Move towards ball position with a fixed speed
    if (gs.computerPaddleY + gs.paddleHeight / 2 < gs.ballY) {
      gs.computerPaddleY += gs.computerSpeed;
    } else if (gs.computerPaddleY + gs.paddleHeight / 2 > gs.ballY) {
      gs.computerPaddleY -= gs.computerSpeed;
    }
    
    // Keep computer paddle within canvas
    gs.computerPaddleY = Math.max(0, Math.min(gs.canvasHeight - gs.paddleHeight, gs.computerPaddleY));
    
    // Ball collision with top and bottom walls
    if (gs.ballY - gs.ballSize <= 0 || gs.ballY + gs.ballSize >= gs.canvasHeight) {
      gs.ballSpeedY = -gs.ballSpeedY;
    }
    
    // Ball collision with paddles
    // Player paddle
    if (
      gs.ballX - gs.ballSize <= gs.paddleWidth &&
      gs.ballY >= gs.playerPaddleY &&
      gs.ballY <= gs.playerPaddleY + gs.paddleHeight
    ) {
      gs.ballSpeedX = -gs.ballSpeedX;
      
      // Add a slight angle based on where the ball hits the paddle
      const impactPosition = (gs.ballY - (gs.playerPaddleY + gs.paddleHeight / 2)) / (gs.paddleHeight / 2);
      gs.ballSpeedY = impactPosition * 5;
    }
    
    // Computer paddle
    if (
      gs.ballX + gs.ballSize >= gs.canvasWidth - gs.paddleWidth &&
      gs.ballY >= gs.computerPaddleY &&
      gs.ballY <= gs.computerPaddleY + gs.paddleHeight
    ) {
      gs.ballSpeedX = -gs.ballSpeedX;
      
      // Add a slight angle based on where the ball hits the paddle
      const impactPosition = (gs.ballY - (gs.computerPaddleY + gs.paddleHeight / 2)) / (gs.paddleHeight / 2);
      gs.ballSpeedY = impactPosition * 5;
    }
    
    // Ball out of bounds - scoring
    if (gs.ballX - gs.ballSize <= 0) {
      // Computer scores
      setScore(prev => ({ ...prev, computer: prev.computer + 1 }));
      
      // Reset ball position
      gs.ballX = gs.canvasWidth / 2;
      gs.ballY = gs.canvasHeight / 2;
      gs.ballSpeedX = 5;
      gs.ballSpeedY = 2;
    } else if (gs.ballX + gs.ballSize >= gs.canvasWidth) {
      // Player scores
      setScore(prev => ({ ...prev, player: prev.player + 1 }));
      
      // Reset ball position
      gs.ballX = gs.canvasWidth / 2;
      gs.ballY = gs.canvasHeight / 2;
      gs.ballSpeedX = -5;
      gs.ballSpeedY = 2;
    }
    
    // Check for game over (first to 5 points)
    if (score.player >= 5) {
      setGameOver(true);
      setWinner('Player');
      setGameStarted(false);
    } else if (score.computer >= 5) {
      setGameOver(true);
      setWinner('Computer');
      setGameStarted(false);
    }
  };

  // Game loop
  const gameLoop = () => {
    if (!gameStarted) return;
    
    update();
    draw();
    
    // Continue the game loop
    gameStateRef.current.animationFrameId = requestAnimationFrame(gameLoop);
  };

  // Start the game
  const startGame = () => {
    setScore({ player: 0, computer: 0 });
    initGame();
  };

  // Effect to set up the game when component mounts
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match its container
    canvas.width = 800;
    canvas.height = 400;
    
    // Initialize game when component mounts
    initGame();
    
    // Set up mouse event listener
    window.addEventListener('mousemove', handleMouseMove);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(gameStateRef.current.animationFrameId);
    };
  }, []);

  // Effect to start/stop game loop
  useEffect(() => {
    if (gameStarted) {
      gameLoop();
    } else {
      cancelAnimationFrame(gameStateRef.current.animationFrameId);
    }
    
    return () => {
      cancelAnimationFrame(gameStateRef.current.animationFrameId);
    };
  }, [gameStarted]);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Navigation */}
      <nav className="flex justify-between items-center mb-8">
        <div className="text-2xl font-bold">Ping Pong Game</div>
        <div className="flex gap-4">
          <Link href="/">
            <a className="hover:text-blue-600 transition-colors">Home</a>
          </Link>
          <Link href="/ping-pong">
            <a className="hover:text-blue-600 transition-colors">Ping Pong</a>
          </Link>
        </div>
      </nav>
      
      {/* Game instructions */}
      <div className="max-w-2xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Classic Ping Pong</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Move your mouse up and down to control the left paddle.
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          First to score 5 points wins the game!
        </p>
      </div>
      
      {/* Game area */}
      <div className="flex flex-col items-center mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-1 rounded-lg shadow-lg">
          <canvas 
            ref={canvasRef} 
            className="bg-gray-900 rounded w-full"
          ></canvas>
        </div>
        
        {/* Game controls */}
        <div className="mt-6 flex gap-4">
          {gameOver ? (
            <>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow mb-4 text-center">
                <h2 className="text-xl font-bold mb-2">Game Over!</h2>
                <p className="text-lg">{winner} wins!</p>
              </div>
              <Button onClick={startGame}>Play Again</Button>
            </>
          ) : (
            <>
              {gameStarted ? (
                <Button variant="outline" onClick={() => setGameStarted(false)}>Pause</Button>
              ) : (
                <Button onClick={() => setGameStarted(true)}>
                  {score.player === 0 && score.computer === 0 ? 'Start Game' : 'Resume'}
                </Button>
              )}
              <Button variant="destructive" onClick={startGame}>Restart</Button>
            </>
          )}
        </div>
      </div>
      
      {/* Game instructions */}
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">How to Play</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
          <li>Move your mouse up and down to control the left paddle</li>
          <li>The computer controls the right paddle</li>
          <li>Don't let the ball pass your paddle</li>
          <li>Score points by getting the ball past the computer's paddle</li>
          <li>First to 5 points wins!</li>
        </ul>
      </div>
    </div>
  );
}