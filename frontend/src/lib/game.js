// Minesweeper game engine helpers
export const DIFFICULTIES = {
  easy: { rows: 9, cols: 9, mines: 10, label: 'EASY' },
  medium: { rows: 14, cols: 14, mines: 32, label: 'MEDIUM' },
  hard: { rows: 16, cols: 20, mines: 70, label: 'HARD' },
};

export const createEmptyBoard = (rows, cols) => Array.from({ length: rows }, () =>
  Array.from({ length: cols }, () => ({ mine: false, revealed: false, flagged: false, adjacent: 0, exploded: false }))
);

// Accept optional rng function for seeded mine placement
export const placeMines = (board, mines, safeR, safeC, rng = Math.random) => {
  const rows = board.length, cols = board[0].length;
  const forbidden = new Set();
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = safeR + dr, c = safeC + dc;
      if (r >= 0 && r < rows && c >= 0 && c < cols) forbidden.add(`${r},${c}`);
    }
  }
  const positions = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (!forbidden.has(`${r},${c}`)) positions.push([r, c]);
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  positions.slice(0, mines).forEach(([r, c]) => { board[r][c].mine = true; });
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (board[r][c].mine) continue;
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].mine) count++;
    }
    board[r][c].adjacent = count;
  }
  return board;
};

export const floodReveal = (board, r, c) => {
  const rows = board.length, cols = board[0].length;
  const stack = [[r, c]];
  let revealedCount = 0;
  while (stack.length) {
    const [cr, cc] = stack.pop();
    if (cr < 0 || cr >= rows || cc < 0 || cc >= cols) continue;
    const cell = board[cr][cc];
    if (cell.revealed || cell.flagged || cell.mine) continue;
    cell.revealed = true;
    revealedCount++;
    if (cell.adjacent === 0) {
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        stack.push([cr + dr, cc + dc]);
      }
    }
  }
  return revealedCount;
};

export const calculateScore = ({ difficulty, safeRevealed, timeSeconds, livesRemaining, won }) => {
  const multipliers = { easy: 1, medium: 2.2, hard: 4, campaign: 2.5, custom: 2, battle: 3, battle_simple: 2.5, battle_ranked: 4, lobby: 2.5 };
  const mult = multipliers[difficulty] || 1;
  const base = safeRevealed * 10 * mult;
  const timeBonus = won ? Math.max(0, Math.round((600 - timeSeconds) * 3 * mult)) : 0;
  const lifeBonus = won ? livesRemaining * 500 * mult : 0;
  return Math.round(base + timeBonus + lifeBonus);
};
