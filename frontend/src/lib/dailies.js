const KEY_DAILIES = 'mg_dailies_v1';
const KEY_DAILY_COINS = 'mg_daily_coins_v1';

const TZ_OFFSET_HOURS = 2;

const _windowKey = () => {
  const d = new Date(Date.now() + TZ_OFFSET_HOURS * 60 * 60 * 1000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hh = d.getUTCHours();
  const w = hh < 12 ? '0' : '1';
  return `${y}-${m}-${day}-${w}`;
};

const _load = () => {
  try {
    const raw = localStorage.getItem(KEY_DAILIES);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
};

const _save = (st) => {
  try {
    localStorage.setItem(KEY_DAILIES, JSON.stringify(st));
  } catch {}
};

export const getDailyState = () => {
  const today = _windowKey();
  const st = _load();
  if (!st || st.day !== today) {
    const next = {
      day: today,
      progress: {
        gamesPlayed: 0,
        gamesWon: 0,
        flagsPlaced: 0,
        safeRevealed: 0,
      },
      claimed: {},
    };
    _save(next);
    return next;
  }
  if (!st.progress || typeof st.progress !== 'object') st.progress = {};
  if (!st.claimed || typeof st.claimed !== 'object') st.claimed = {};
  st.progress.gamesPlayed = Number(st.progress.gamesPlayed || 0);
  st.progress.gamesWon = Number(st.progress.gamesWon || 0);
  st.progress.flagsPlaced = Number(st.progress.flagsPlaced || 0);
  st.progress.safeRevealed = Number(st.progress.safeRevealed || 0);
  return st;
};

export const recordDailyProgress = ({ played = 0, won = 0, flags = 0, safe = 0 } = {}) => {
  const st = getDailyState();
  st.progress.gamesPlayed += Math.max(0, Number(played) || 0);
  st.progress.gamesWon += Math.max(0, Number(won) || 0);
  st.progress.flagsPlaced += Math.max(0, Number(flags) || 0);
  st.progress.safeRevealed += Math.max(0, Number(safe) || 0);
  _save(st);
  return st;
};

export const DAILY_QUESTS = [
  { id: 'play_1', type: 'gamesPlayed', target: 1, rewardCoins: 10 },
  { id: 'win_1', type: 'gamesWon', target: 1, rewardCoins: 15 },
  { id: 'flags_10', type: 'flagsPlaced', target: 10, rewardCoins: 10 },
  { id: 'safe_50', type: 'safeRevealed', target: 50, rewardCoins: 15 },
];

export const getQuestProgress = (state, quest) => {
  const st = state || getDailyState();
  const q = quest || {};
  const cur = Number(st?.progress?.[q.type] || 0);
  const target = Math.max(1, Number(q.target) || 1);
  const done = cur >= target;
  const claimed = !!st?.claimed?.[q.id];
  return { cur, target, done, claimed };
};

const _loadCoins = () => {
  try {
    const raw = localStorage.getItem(KEY_DAILY_COINS);
    const v = Number(raw || 0);
    return Number.isFinite(v) ? Math.max(0, Math.floor(v)) : 0;
  } catch {
    return 0;
  }
};

const _saveCoins = (v) => {
  try {
    localStorage.setItem(KEY_DAILY_COINS, String(Math.max(0, Math.floor(Number(v) || 0))));
  } catch {}
};

export const getDailyCoins = () => _loadCoins();

export const secondsUntilDailyReset = () => {
  const now = new Date(Date.now() + TZ_OFFSET_HOURS * 60 * 60 * 1000);
  const h = now.getUTCHours();
  const nextHour = h < 12 ? 12 : 24;
  const next = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + (nextHour === 24 ? 1 : 0),
    nextHour === 24 ? 0 : 12,
    0,
    0
  ));
  const nextUtcMs = next.getTime() - TZ_OFFSET_HOURS * 60 * 60 * 1000;
  return Math.max(0, Math.floor((nextUtcMs - Date.now()) / 1000));
};

export const claimDailyQuest = (questId) => {
  const st = getDailyState();
  const q = DAILY_QUESTS.find((x) => x.id === questId);
  if (!q) return { ok: false, state: st, coinsAwarded: 0 };
  const qp = getQuestProgress(st, q);
  if (!qp.done || qp.claimed) return { ok: false, state: st, coinsAwarded: 0 };

  st.claimed[questId] = true;
  _save(st);

  const coins = Math.max(0, Math.floor(Number(q.rewardCoins) || 0));
  if (coins > 0) {
    const total = _loadCoins() + coins;
    _saveCoins(total);
  }

  return { ok: true, state: getDailyState(), coinsAwarded: coins };
};
