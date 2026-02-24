export type Board = number[][];

export const initializeBoard = (): Board => {
  let board = Array.from({ length: 4 }, () => Array(4).fill(0));
  board = addRandomTile(board);
  board = addRandomTile(board);
  return board;
};

export const addRandomTile = (board: Board): Board => {
  const emptyCells: { r: number; c: number }[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) {
        emptyCells.push({ r, c });
      }
    }
  }

  if (emptyCells.length === 0) return board;

  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const newBoard = board.map(row => [...row]);
  newBoard[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
  return newBoard;
};

const slideAndMerge = (row: number[]): { newRow: number[], score: number } => {
  let filtered = row.filter(val => val !== 0);
  let score = 0;
  
  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] !== 0 && filtered[i] === filtered[i + 1]) {
      filtered[i] *= 2;
      score += filtered[i];
      filtered[i + 1] = 0;
    }
  }
  
  filtered = filtered.filter(val => val !== 0);
  
  while (filtered.length < 4) {
    filtered.push(0);
  }
  
  return { newRow: filtered, score };
};

export const moveLeft = (board: Board): { newBoard: Board, score: number, changed: boolean } => {
  const newBoard: Board = [];
  let totalScore = 0;
  let changed = false;

  for (let r = 0; r < 4; r++) {
    const { newRow, score } = slideAndMerge(board[r]);
    newBoard.push(newRow);
    totalScore += score;
    if (newRow.join(',') !== board[r].join(',')) {
      changed = true;
    }
  }

  return { newBoard, score: totalScore, changed };
};

export const moveRight = (board: Board): { newBoard: Board, score: number, changed: boolean } => {
  const newBoard: Board = [];
  let totalScore = 0;
  let changed = false;

  for (let r = 0; r < 4; r++) {
    const reversedRow = [...board[r]].reverse();
    const { newRow, score } = slideAndMerge(reversedRow);
    const finalRow = newRow.reverse();
    newBoard.push(finalRow);
    totalScore += score;
    if (finalRow.join(',') !== board[r].join(',')) {
      changed = true;
    }
  }

  return { newBoard, score: totalScore, changed };
};

const transpose = (board: Board): Board => {
  const newBoard = Array.from({ length: 4 }, () => Array(4).fill(0));
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      newBoard[r][c] = board[c][r];
    }
  }
  return newBoard;
};

export const moveUp = (board: Board): { newBoard: Board, score: number, changed: boolean } => {
  const transposed = transpose(board);
  const { newBoard: moved, score, changed } = moveLeft(transposed);
  return { newBoard: transpose(moved), score, changed };
};

export const moveDown = (board: Board): { newBoard: Board, score: number, changed: boolean } => {
  const transposed = transpose(board);
  const { newBoard: moved, score, changed } = moveRight(transposed);
  return { newBoard: transpose(moved), score, changed };
};

export const checkGameOver = (board: Board): boolean => {
  // Check for empty cells
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) return false;
    }
  }

  // Check for possible merges
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const current = board[r][c];
      if (
        (r > 0 && board[r - 1][c] === current) ||
        (r < 3 && board[r + 1][c] === current) ||
        (c > 0 && board[r][c - 1] === current) ||
        (c < 3 && board[r][c + 1] === current)
      ) {
        return false;
      }
    }
  }

  return true;
};

export const checkGameWon = (board: Board): boolean => {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] >= 2048) return true;
    }
  }
  return false;
};
