export const LEVELS = Array.from({ length: 200 }, (_, i) => {
  const id = i + 1;
  const isMilestone = id % 10 === 0;

  const prog = (id - 1) / 199; // 0..1

  const minRows = id <= 10 ? 6 : id <= 30 ? 8 : id <= 60 ? 10 : id <= 120 ? 12 : 14;
  const minCols = id <= 10 ? 6 : id <= 30 ? 9 : id <= 60 ? 12 : id <= 120 ? 14 : 16;

  let rows = Math.round(minRows + prog * 14 + (isMilestone ? 1 : 0)); // up to ~29-30
  let cols = Math.round(minCols + prog * 18 + (isMilestone ? 1 : 0)); // up to ~34-35

  rows = Math.max(minRows, Math.min(30, rows));
  cols = Math.max(minCols, Math.min(36, cols));

  // Gradual mine density ramp; keep it bounded so boards stay playable.
  const densityBase = 0.12 + prog * 0.10 + (isMilestone ? 0.005 : 0); // ~0.12..0.225
  const density = Math.max(0.12, Math.min(0.24, densityBase));

  const minSafe = id <= 10 ? 30 : id <= 30 ? 60 : id <= 80 ? 90 : id <= 140 ? 120 : 150;
  const minCells = minSafe + Math.max(10, Math.round(minSafe * 0.18));

  // Ensure campaign levels cannot be completed in a couple of clicks by enforcing a minimum number of safe cells.
  // If the board is too small, grow it within caps.
  const growBoard = () => {
    if (rows < 30) rows += 1;
    if (cols < 36) cols += 1;
  };

  let guard = 0;
  while (guard < 25) {
    guard += 1;
    const cells = rows * cols;
    if (cells >= minCells) break;
    if (rows >= 30 && cols >= 36) break;
    growBoard();
  }

  const cells = rows * cols;
  let mines = Math.max(10, Math.min(cells - 1, Math.round(cells * density)));

  // Final clamp: make sure safe cells are at least minSafe by reducing mines if needed.
  // (We prefer larger boards, but we still keep the constraint if we're at caps.)
  const safeCells = Math.max(0, cells - mines);
  if (safeCells < minSafe) {
    mines = Math.max(10, Math.min(cells - 1, cells - minSafe));
  }

  const lives = id <= 10 ? 5 : id <= 30 ? 4 : id <= 70 ? 3 : id <= 130 ? 2 : 1;

  return {
    id,
    name: isMilestone ? `LVL ${id}` : '',
    rows,
    cols,
    mines,
    lives,
  };
});

const STORAGE_KEY = 'mg_campaign_progress_v1';

const BACKEND_URL = (() => {
  const fromEnv = process.env.REACT_APP_BACKEND_URL;
  if (fromEnv) return fromEnv;
  try {
    const host = (window?.location?.hostname || '').toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:8000';
  } catch {}
  return 'https://sappers-arena.onrender.com';
})();
const API = `${BACKEND_URL}/api`;

export const loadProgress = () => {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : {}; }
  catch { return {}; }
};
export const saveProgress = (progress) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch {}
};

const _mergeProgress = (localProgress, serverProgress) => {
  const local = localProgress && typeof localProgress === 'object' ? localProgress : {};
  const server = serverProgress && typeof serverProgress === 'object' ? serverProgress : {};
  const merged = { ...local };

  Object.keys(server).forEach((k) => {
    const prev = local[k] || {};
    const inc = server[k] || {};
    const stars = Math.max(prev.stars || 0, inc.stars || 0);
    const bestScore = Math.max(prev.bestScore || 0, inc.bestScore || 0);
    const prevBt = prev.bestTime;
    const incBt = inc.bestTime;
    const bestTime = incBt == null ? prevBt : (prevBt == null ? incBt : Math.min(prevBt, incBt));
    const completed = !!(prev.completed || inc.completed);
    merged[k] = { stars, bestScore, bestTime, completed };
  });

  return merged;
};

export const syncCampaignProgress = async () => {
  try {
    const { sessionHeaders, getToken } = await import('./player');
    const t2 = getToken?.();
    if (!t2 || (t2 || '').startsWith('offline-')) return loadProgress();

    const axios = (await import('axios')).default;
    const server = (await axios.get(`${API}/campaign/progress`, { headers: sessionHeaders() })).data;
    const serverProgress = server?.progress || {};
    const localProgress = loadProgress();
    let merged = _mergeProgress(localProgress, serverProgress);

    // Linear-campaign gap repair:
    // If a higher level is completed (e.g. 29) but some previous levels are missing (e.g. 27/28),
    // backfill earlier levels as completed so the path doesn't show holes across devices.
    try {
      const completedIds = Object.keys(merged || {})
        .map((k) => Number(k))
        .filter((n) => Number.isFinite(n) && n > 0 && merged[String(n)]?.completed);
      const highestCompleted = completedIds.length ? Math.max(...completedIds) : 0;
      if (highestCompleted > 1) {
        for (let i = 1; i < highestCompleted; i++) {
          const key = String(i);
          const cur = merged[key];
          if (cur?.completed) continue;
          merged[key] = {
            stars: Math.max(1, Number(cur?.stars || 0)),
            bestScore: Number(cur?.bestScore || 0),
            bestTime: cur?.bestTime == null ? null : Number(cur.bestTime),
            completed: true,
          };
        }
      }
    } catch {}
    saveProgress(merged);

    // Cross-device repair: if local progress contains levels that weren't uploaded earlier
    // (e.g. temporary network issues on mobile), push the better entries back to server.
    try {
      const sp = (serverProgress && typeof serverProgress === 'object') ? serverProgress : {};
      const lp = (localProgress && typeof localProgress === 'object') ? localProgress : {};
      const keys = new Set([...Object.keys(lp || {}), ...Object.keys(merged || {})]);
      const toUpload = [];
      keys.forEach((k) => {
        const key = String(k);
        const loc = lp[key] || {};
        const srv = sp[key] || {};
        const locStars = Number(loc.stars || 0);
        const srvStars = Number(srv.stars || 0);
        const locCompleted = !!loc.completed;
        const srvCompleted = !!srv.completed;
        const locBestScore = Number(loc.bestScore || 0);
        const srvBestScore = Number(srv.bestScore || 0);

        const mergedEntry = merged[key] || loc;
        const mergedCompleted = !!mergedEntry?.completed;
        const mergedStars = Number(mergedEntry?.stars || 0);
        const mergedBestScore = Number(mergedEntry?.bestScore || 0);

        const better = (locCompleted && !srvCompleted)
          || (locStars > srvStars)
          || (locBestScore > srvBestScore)
          || (mergedCompleted && !srvCompleted)
          || (mergedStars > srvStars)
          || (mergedBestScore > srvBestScore);
        if (!better) return;
        toUpload.push({ key, entry: mergedEntry });
      });

      if (toUpload.length) {
        toUpload.forEach(({ key, entry }) => {
          axios.post(`${API}/campaign/level_result`, {
            level_id: Number(key),
            stars: Number(entry?.stars || 0),
            bestScore: Number(entry?.bestScore || 0),
            bestTime: entry?.bestTime == null ? null : Number(entry.bestTime),
            completed: !!entry?.completed,
          }, { headers: sessionHeaders() }).catch(() => {});
        });
      }
    } catch {}
    return merged;
  } catch {
    return loadProgress();
  }
};
export const computeStars = (livesRemaining, livesTotal) => {
  if (livesTotal <= 0) return 1;
  if (livesRemaining === livesTotal) return 3;
  if (livesRemaining >= Math.ceil(livesTotal / 2)) return 2;
  if (livesRemaining > 0) return 1;
  return 0;
};
export const recordLevelResult = (levelId, { stars, score, time, won }) => {
  const progress = loadProgress();
  const prev = progress[levelId] || { stars: 0, bestScore: 0, bestTime: null, completed: false };
  progress[levelId] = {
    stars: Math.max(prev.stars || 0, stars),
    bestScore: Math.max(prev.bestScore || 0, score),
    bestTime: prev.bestTime == null ? (won ? time : null) : (won ? Math.min(prev.bestTime, time) : prev.bestTime),
    completed: prev.completed || won,
  };
  saveProgress(progress);

  try {
    (async () => {
      const { sessionHeaders, getToken } = await import('./player');
      const t2 = getToken?.();
      if (!t2 || (t2 || '').startsWith('offline-')) return;

      const axios = (await import('axios')).default;
      const entry = progress[levelId];
      const res = await axios.post(`${API}/campaign/level_result`, {
        level_id: Number(levelId),
        stars: entry?.stars || 0,
        bestScore: entry?.bestScore || 0,
        bestTime: entry?.bestTime == null ? null : entry.bestTime,
        completed: !!entry?.completed,
      }, { headers: sessionHeaders() });
      const nu = Array.isArray(res?.data?.new_unlocked) ? res.data.new_unlocked : [];
      if (nu.length) {
        try {
          const { emitNewUnlocked } = await import('./player');
          emitNewUnlocked(nu);
        } catch {}
      }
    })();
  } catch {}

  return progress[levelId];
};
export const isLevelUnlocked = (levelId, progress) => {
  if (levelId === 1) return true;
  const cur = progress?.[levelId];
  if (cur && cur.completed) return true;
  const prev = progress?.[levelId - 1];
  return !!(prev && prev.completed);
};
