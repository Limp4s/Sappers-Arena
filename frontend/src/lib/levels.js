export const LEVELS = Array.from({ length: 150 }, (_, i) => {
  const id = i + 1;
  const segment = Math.floor((id - 1) / 10);
  const isMilestone = id % 10 === 0;

  const baseRows = 5 + Math.floor((id - 1) / 6);
  const baseCols = 5 + Math.floor((id - 1) / 5);
  const rows = Math.min(26 + segment, baseRows + (isMilestone ? 1 : 0));
  const cols = Math.min(30 + segment, baseCols + (isMilestone ? 1 : 0));

  const cells = rows * cols;
  const density = Math.min(0.26, 0.14 + segment * 0.01 + (isMilestone ? 0.01 : 0));
  const mines = Math.max(2, Math.min(cells - 1, Math.round(cells * density)));

  const lives = id <= 10 ? 5 : id <= 30 ? 4 : id <= 60 ? 3 : id <= 100 ? 2 : 1;

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
    const merged = _mergeProgress(loadProgress(), serverProgress);
    saveProgress(merged);
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
      await axios.post(`${API}/campaign/level_result`, {
        level_id: Number(levelId),
        stars: entry?.stars || 0,
        bestScore: entry?.bestScore || 0,
        bestTime: entry?.bestTime == null ? null : entry.bestTime,
        completed: !!entry?.completed,
      }, { headers: sessionHeaders() });
    })();
  } catch {}

  return progress[levelId];
};
export const isLevelUnlocked = (levelId, progress) => {
  if (levelId === 1) return true;
  const prev = progress[levelId - 1];
  return !!(prev && prev.completed);
};
