const KEY_DAILIES = 'mg_dailies_v1';
const KEY_DAILY_COINS = 'mg_daily_coins_v1';

const TZ_OFFSET_HOURS = 2;

const _hash = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const _pickActive = (dayKey, n = 5) => {
  const ids = (DAILY_QUESTS || []).map((q) => q.id).filter(Boolean);
  const want = Math.max(1, Math.min(Number(n) || 5, ids.length || 0));
  const seed = _hash(String(dayKey || ''));
  const arr = [...ids];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = seed % (i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr.slice(0, want);
};

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
      active: _pickActive(today, 5),
      progress: {
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        flagsPlaced: 0,
        safeRevealed: 0,
        timePlayedSeconds: 0,
        winsUnder60: 0,
        winsUnder30: 0,
        winsNoFlags: 0,
        winsFlawless: 0,
        winsWith1Life: 0,
        campaignWins: 0,
      },
      claimed: {},
    };
    _save(next);
    return next;
  }
  if (!st.progress || typeof st.progress !== 'object') st.progress = {};
  if (!st.claimed || typeof st.claimed !== 'object') st.claimed = {};
  if (!Array.isArray(st.active) || st.active.length === 0) st.active = _pickActive(today, 5);
  st.progress.gamesPlayed = Number(st.progress.gamesPlayed || 0);
  st.progress.gamesWon = Number(st.progress.gamesWon || 0);
  st.progress.gamesLost = Number(st.progress.gamesLost || 0);
  st.progress.flagsPlaced = Number(st.progress.flagsPlaced || 0);
  st.progress.safeRevealed = Number(st.progress.safeRevealed || 0);
  st.progress.timePlayedSeconds = Number(st.progress.timePlayedSeconds || 0);
  st.progress.winsUnder60 = Number(st.progress.winsUnder60 || 0);
  st.progress.winsUnder30 = Number(st.progress.winsUnder30 || 0);
  st.progress.winsNoFlags = Number(st.progress.winsNoFlags || 0);
  st.progress.winsFlawless = Number(st.progress.winsFlawless || 0);
  st.progress.winsWith1Life = Number(st.progress.winsWith1Life || 0);
  st.progress.campaignWins = Number(st.progress.campaignWins || 0);
  return st;
};

export const recordDailyProgress = ({ played = 0, won = 0, lost = 0, flags = 0, safe = 0, timeSeconds = 0, livesRemaining = null, livesTotal = null, mode = null } = {}) => {
  const st = getDailyState();
  st.progress.gamesPlayed += Math.max(0, Number(played) || 0);
  st.progress.gamesWon += Math.max(0, Number(won) || 0);
  st.progress.gamesLost += Math.max(0, Number(lost) || 0);
  st.progress.flagsPlaced += Math.max(0, Number(flags) || 0);
  st.progress.safeRevealed += Math.max(0, Number(safe) || 0);
  st.progress.timePlayedSeconds += Math.max(0, Math.floor(Number(timeSeconds) || 0));

  const didWin = (Number(won) || 0) > 0;
  const sec = Math.floor(Number(timeSeconds) || 0);
  if (didWin && sec > 0 && sec < 60) st.progress.winsUnder60 += 1;
  if (didWin && sec > 0 && sec < 30) st.progress.winsUnder30 += 1;
  if (didWin && Math.floor(Number(flags) || 0) <= 0) st.progress.winsNoFlags += 1;
  if (didWin && livesRemaining != null && livesTotal != null && Number(livesTotal) > 0 && Number(livesRemaining) >= Number(livesTotal)) st.progress.winsFlawless += 1;
  if (didWin && livesRemaining != null && Number(livesRemaining) === 1) st.progress.winsWith1Life += 1;
  if (didWin && String(mode || '') === 'campaign') st.progress.campaignWins += 1;
  _save(st);
  return st;
};

export const DAILY_QUESTS = [
  { id: 'play_1', type: 'gamesPlayed', target: 1, rewardCoins: 6 },
  { id: 'play_3', type: 'gamesPlayed', target: 3, rewardCoins: 10 },
  { id: 'win_1', type: 'gamesWon', target: 1, rewardCoins: 12 },
  { id: 'win_3', type: 'gamesWon', target: 3, rewardCoins: 20 },
  { id: 'lose_1', type: 'gamesLost', target: 1, rewardCoins: 8 },
  { id: 'lose_3', type: 'gamesLost', target: 3, rewardCoins: 14 },
  { id: 'flags_20', type: 'flagsPlaced', target: 20, rewardCoins: 10 },
  { id: 'flags_50', type: 'flagsPlaced', target: 50, rewardCoins: 18 },
  { id: 'safe_100', type: 'safeRevealed', target: 100, rewardCoins: 12 },
  { id: 'safe_250', type: 'safeRevealed', target: 250, rewardCoins: 22 },
  { id: 'time_300', type: 'timePlayedSeconds', target: 300, rewardCoins: 10 },
  { id: 'time_900', type: 'timePlayedSeconds', target: 900, rewardCoins: 20 },
  { id: 'fast_60', type: 'winsUnder60', target: 1, rewardCoins: 16 },
  { id: 'fast_30', type: 'winsUnder30', target: 1, rewardCoins: 22 },
  { id: 'no_flags', type: 'winsNoFlags', target: 1, rewardCoins: 18 },
  { id: 'flawless', type: 'winsFlawless', target: 1, rewardCoins: 18 },
  { id: 'one_life', type: 'winsWith1Life', target: 1, rewardCoins: 16 },
  { id: 'campaign_1', type: 'campaignWins', target: 1, rewardCoins: 12 },
  { id: 'campaign_3', type: 'campaignWins', target: 3, rewardCoins: 24 },
  { id: 'flags_5', type: 'flagsPlaced', target: 5, rewardCoins: 6 },
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
  if (!Array.isArray(st.active) || !st.active.includes(questId)) return { ok: false, state: st, coinsAwarded: 0 };
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
