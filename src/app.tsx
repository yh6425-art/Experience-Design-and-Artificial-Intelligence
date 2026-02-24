import React, { useState, useEffect, useCallback } from 'react';
import { Board, initializeBoard, addRandomTile, moveLeft, moveRight, moveUp, moveDown, checkGameOver, checkGameWon } from './gameLogic';

export default function App() {
  const [board, setBoard] = useState<Board>(initializeBoard());
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(() => {
    const saved = localStorage.getItem('2048-best-score');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [hasContinued, setHasContinued] = useState<boolean>(false);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('2048-best-score', score.toString());
    }
  }, [score, bestScore]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameOver || (gameWon && !hasContinued)) return;

    // Prevent default scrolling for arrow keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }

    let result: { newBoard: Board, score: number, changed: boolean } | null = null;

    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        result = moveLeft(board);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        result = moveRight(board);
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
        result = moveUp(board);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        result = moveDown(board);
        break;
      default:
        return;
    }

    if (result && result.changed) {
      let nextBoard = addRandomTile(result.newBoard);
      setBoard(nextBoard);
      setScore(s => s + result!.score);

      if (!hasContinued && checkGameWon(nextBoard)) {
        setGameWon(true);
      } else if (checkGameOver(nextBoard)) {
        setGameOver(true);
      }
    }
  }, [board, gameOver, gameWon, hasContinued]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Swipe handling for mobile
  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    if (gameOver || (gameWon && !hasContinued)) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };

    const dx = touchEnd.x - touchStart.x;
    const dy = touchEnd.y - touchStart.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 30) {
      let result: { newBoard: Board, score: number, changed: boolean } | null = null;
      
      if (absDx > absDy) {
        // Horizontal swipe
        if (dx > 0) result = moveRight(board);
        else result = moveLeft(board);
      } else {
        // Vertical swipe
        if (dy > 0) result = moveDown(board);
        else result = moveUp(board);
      }

      if (result && result.changed) {
        let nextBoard = addRandomTile(result.newBoard);
        setBoard(nextBoard);
        setScore(s => s + result!.score);

        if (!hasContinued && checkGameWon(nextBoard)) {
          setGameWon(true);
        } else if (checkGameOver(nextBoard)) {
          setGameOver(true);
        }
      }
    }
    setTouchStart(null);
  };

  const resetGame = () => {
    setBoard(initializeBoard());
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setHasContinued(false);
  };

  const continueGame = () => {
    setHasContinued(true);
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col items-center justify-center p-4 font-pixel">
      <div className="w-full max-w-[400px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl text-[#e2e8f0] tracking-tighter" style={{ textShadow: '4px 4px 0px #0f0f1a' }}>2048</h1>
          <div className="flex gap-2">
            <div className="bg-[#16213e] pixel-border p-2 text-center min-w-[80px]">
              <div className="text-[10px] text-[#a0aec0] mb-1">SCORE</div>
              <div className="text-sm text-white">{score}</div>
            </div>
            <div className="bg-[#16213e] pixel-border p-2 text-center min-w-[80px]">
              <div className="text-[10px] text-[#a0aec0] mb-1">BEST</div>
              <div className="text-sm text-white">{bestScore}</div>
            </div>
          </div>
        </div>

        {/* Controls info */}
        <div className="flex justify-between items-center mb-6 gap-4">
          <p className="text-xs text-[#a0aec0] leading-relaxed flex-1">
            Join the numbers and get to the <strong className="text-white">2048 tile!</strong>
          </p>
          <button 
            onClick={resetGame}
            className="bg-[#e94560] text-white text-xs py-3 px-4 pixel-border active:pixel-border-pressed hover:bg-[#ff5271] transition-colors whitespace-nowrap"
          >
            NEW GAME
          </button>
        </div>

        {/* Game Board */}
        <div 
          className="bg-[#0f0f1a] p-3 pixel-border relative touch-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="grid grid-cols-4 gap-3">
            {board.map((row, rIndex) => (
              row.map((cell, cIndex) => (
                <div 
                  key={`${rIndex}-${cIndex}`} 
                  className={`w-full aspect-square flex items-center justify-center pixel-border transition-colors duration-150
                    ${cell === 0 ? 'bg-[#16213e] shadow-none' : getTileColor(cell)}
                  `}
                >
                  {cell !== 0 ? cell : ''}
                </div>
              ))
            ))}
          </div>

          {/* Overlays */}
          {(gameOver || (gameWon && !hasContinued)) && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 animate-in fade-in duration-300">
              <h2 className="text-3xl text-white mb-6 text-center" style={{ textShadow: '4px 4px 0px #000' }}>
                {gameWon && !hasContinued ? 'YOU WIN!' : 'GAME OVER!'}
              </h2>
              <div className="flex flex-col gap-4 w-3/4">
                {gameWon && !hasContinued && (
                  <button 
                    onClick={continueGame}
                    className="bg-[#4a5568] text-white text-xs py-4 px-4 pixel-border active:pixel-border-pressed hover:bg-[#718096] transition-colors w-full"
                  >
                    KEEP GOING
                  </button>
                )}
                <button 
                  onClick={resetGame}
                  className="bg-[#e94560] text-white text-xs py-4 px-4 pixel-border active:pixel-border-pressed hover:bg-[#ff5271] transition-colors w-full"
                >
                  TRY AGAIN
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-[10px] text-[#a0aec0] leading-loose">
          <p>HOW TO PLAY: Use your <strong className="text-white">arrow keys</strong> or <strong className="text-white">swipe</strong> to move the tiles. Tiles with the same number merge into one when they touch.</p>
        </div>
      </div>
    </div>
  );
}

const getTileColor = (value: number) => {
  switch (value) {
    case 2: return 'bg-[#eee4da] text-[#776e65] text-lg sm:text-xl';
    case 4: return 'bg-[#ede0c8] text-[#776e65] text-lg sm:text-xl';
    case 8: return 'bg-[#f2b179] text-[#f9f6f2] text-lg sm:text-xl';
    case 16: return 'bg-[#f59563] text-[#f9f6f2] text-base sm:text-lg';
    case 32: return 'bg-[#f67c5f] text-[#f9f6f2] text-base sm:text-lg';
    case 64: return 'bg-[#f65e3b] text-[#f9f6f2] text-base sm:text-lg';
    case 128: return 'bg-[#edcf72] text-[#f9f6f2] text-sm sm:text-base';
    case 256: return 'bg-[#edcc61] text-[#f9f6f2] text-sm sm:text-base';
    case 512: return 'bg-[#edc850] text-[#f9f6f2] text-sm sm:text-base';
    case 1024: return 'bg-[#edc53f] text-[#f9f6f2] text-[10px] sm:text-xs';
    case 2048: return 'bg-[#edc22e] text-[#f9f6f2] text-[10px] sm:text-xs';
    default: return 'bg-[#3d3a33] text-[#f9f6f2] text-[10px] sm:text-xs';
  }
};
