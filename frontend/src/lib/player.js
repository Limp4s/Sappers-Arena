import axios from 'axios';

const DEFAULT_RENDER_BACKEND = 'https://sappers-arena.onrender.com';
const BACKEND_URL = (() => {
  const fromEnv = process.env.REACT_APP_BACKEND_URL;
  if (fromEnv) return fromEnv;
  try {
    const host = (window?.location?.hostname || '').toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:8000';
  } catch {}
  return DEFAULT_RENDER_BACKEND;
})();
const API = `${BACKEND_URL}/api`;

const _isElectron = () => {
  try {
    // renderer process
    if (typeof window !== 'undefined' && window?.process?.type === 'renderer') return true;
    // main process
    if (typeof process !== 'undefined' && !!process?.versions?.electron) return true;
    // user agent
    if (typeof navigator !== 'undefined' && /Electron\//i.test(navigator.userAgent || '')) return true;
  } catch {}
  return false;
};

const _isBackendReachable = async () => {
  try {
    const res = await fetch(`${API}/health`, { method: 'GET' });
    return !!res && res.ok;
  } catch {
    return false;
  }
};

const KEY_NICK = 'mg_player';
const KEY_ADMIN = 'mg_is_admin';
const KEY_TOKEN = 'mg_session_token';
const KEY_USERS = 'mg_local_users';
const KEY_IDS = 'mg_player_ids';
const KEY_ID_COUNTER = 'mg_player_id_counter';
const ACCOUNT_SCOPED_STORAGE_KEYS = [
  'mg_campaign_progress_v1',
  'mg_dailies_v1',
  'mg_daily_coins_v1',
  'mg_achievements_v1',
];
const OFFLINE_ADMIN_NICK = 'limp4';
const OFFLINE_ADMIN_PASSWORD = 'Limon626';

export const ADMIN_NICKS = new Set(['limp4']);
export const ROOT_ADMIN_NICK = 'limp4';
export const isOwnerNick = (nick) => (String(nick || '').toLowerCase() === ROOT_ADMIN_NICK);
export const isAdminNick = (nick) => ADMIN_NICKS.has((nick || '').toLowerCase());

const _randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const _makeGuestNick = () => {
  const suffix = `${Date.now().toString(36)}${_randInt(100, 999)}`.slice(-8);
  return `Guest${suffix}`;
};
const _makeGuestPassword = () => `${crypto.getRandomValues(new Uint32Array(2))[0].toString(16)}${crypto.getRandomValues(new Uint32Array(2))[1].toString(16)}`;

const _loadIds = () => {
  try {
    const raw = localStorage.getItem(KEY_IDS);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const _saveIds = (ids) => {
  localStorage.setItem(KEY_IDS, JSON.stringify(ids || {}));
};

const _nextId = () => {
  try {
    const cur = parseInt(localStorage.getItem(KEY_ID_COUNTER) || '0', 10);
    const next = Number.isFinite(cur) ? cur + 1 : 1;
    localStorage.setItem(KEY_ID_COUNTER, String(next));
    return next;
  } catch {
    return Date.now();
  }
};

export const getPlayerId = (nick) => {
  const key = (nick || '').trim().toLowerCase();
  if (!key) return null;
  if (key === OFFLINE_ADMIN_NICK) return 0;
  const ids = _loadIds();
  return ids[key] ?? null;
};

export const setPlayerId = (nick, id) => {
  try {
    const key = (nick || '').trim().toLowerCase();
    if (!key) return;
    if (key === OFFLINE_ADMIN_NICK) return;
    const n = Number(id);
    if (!Number.isFinite(n)) return;
    const v = Math.max(0, Math.floor(n));
    const ids = _loadIds();
    ids[key] = v;
    _saveIds(ids);
  } catch {}
};

const _ensurePlayerId = (nick) => {
  const key = _userKey(nick);
  if (!key) return null;
  if (key === OFFLINE_ADMIN_NICK) {
    const ids = _loadIds();
    if (ids[key] !== 0) { ids[key] = 0; _saveIds(ids); }
    return 0;
  }
  const ids = _loadIds();
  if (ids[key] != null) return ids[key];
  const id = _nextId();
  ids[key] = id;
  _saveIds(ids);
  return id;
};

export const getStoredNickname = () => localStorage.getItem(KEY_NICK) || '';
export const getToken = () => localStorage.getItem(KEY_TOKEN) || '';
export const isAuthed = () => !!(localStorage.getItem(KEY_NICK) && localStorage.getItem(KEY_TOKEN));

const isOnlineToken = (t) => !!t && !(t || '').startsWith('offline-');
export const isAdmin = () => {
  const nick = getStoredNickname();
  const token = getToken();
  if ((token || '').startsWith('offline-')) return isAdminNick(nick);
  return localStorage.getItem(KEY_ADMIN) === '1' || isAdminNick(nick);
};

export const isOwner = () => {
  const nick = getStoredNickname();
  return isOwnerNick(nick);
};

export const saveSession = (nick, token, admin) => {
  const prevNick = getStoredNickname();
  if (prevNick && prevNick !== nick) {
    try { ACCOUNT_SCOPED_STORAGE_KEYS.forEach((k) => localStorage.removeItem(k)); } catch {}
  }
  const normalizedAdmin = isAdminNick(nick) ? true : !!admin;
  localStorage.setItem(KEY_NICK, nick);
  localStorage.setItem(KEY_TOKEN, token);
  localStorage.setItem(KEY_ADMIN, normalizedAdmin ? '1' : '0');
  try { _ensurePlayerId(nick); } catch {}
};

export const clearSession = () => {
  localStorage.removeItem(KEY_NICK);
  localStorage.removeItem(KEY_TOKEN);
  localStorage.removeItem(KEY_ADMIN);
  try { ACCOUNT_SCOPED_STORAGE_KEYS.forEach((k) => localStorage.removeItem(k)); } catch {}
};

const NICK_RE = /^[\p{L}0-9_-]{3,20}$/u;
export const validateNickFormat = (nick) => {
  if (!nick || nick.length < 3) return 'Minimum 3 characters.';
  if (nick.length > 20) return 'Maximum 20 characters.';
  if (!NICK_RE.test(nick)) return 'Only letters, digits, _ and -.';
  return null;
};
export const validatePassword = (pw) => {
  if (!pw || pw.length < 4) return 'Min 4 characters.';
  if (pw.length > 100) return 'Max 100 characters.';
  return null;
};

const _loadUsers = () => {
  try {
    const raw = localStorage.getItem(KEY_USERS);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const _saveUsers = (users) => {
  localStorage.setItem(KEY_USERS, JSON.stringify(users || {}));
};

const _userKey = (nick) => (nick || '').trim().toLowerCase();

const _toHex = (buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');

const _hashPassword = async (pw, salt) => {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${pw}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return _toHex(digest);
};

const _makeOfflineToken = (nick) => `offline-${_userKey(nick)}-${Date.now()}`;

const _offlinePlayerDoc = (u) => ({
  nickname: u.nickname,
  is_admin: !!u.is_admin,
  id: u.id,
  coins: u.coins ?? 0,
  owned_items: u.owned_items || [],
  rating: u.rating ?? 1000,
});

export const authHeaders = () => {
  const t = getToken();
  return isOnlineToken(t) ? { 'X-Session-Token': t } : {};
};

export const emitNewUnlocked = (ids) => {
  try {
    const list = Array.isArray(ids) ? ids.map(String).filter(Boolean) : [];
    if (!list.length) return;
    window.dispatchEvent(new CustomEvent('mg:new_unlocked', { detail: list }));
  } catch {}
};

export const ensureOnlineSession = async () => {
  const existing = getToken();
  if (isOnlineToken(existing) && getStoredNickname()) return { nickname: getStoredNickname(), token: existing };
  return null;
};

export const checkNickAvailable = async (nick) => {
  try {
    return (await axios.get(`${API}/players/check`, { params: { nickname: nick } })).data;
  } catch {
    const key = _userKey(nick);
    const users = _loadUsers();
    const valid = !validateNickFormat(nick);
    if (!valid) return { available: false, valid: false };
    const taken = !!users[key];
    return {
      available: !taken,
      valid: true,
      reason: taken ? 'taken' : undefined,
      is_admin_nick: isAdminNick(nick),
    };
  }
};

export const registerNick = async (nick, password) => {
  const errNick = validateNickFormat(nick);
  if (errNick) {
    const e = new Error(errNick);
    e.response = { data: { detail: errNick } };
    throw e;
  }
  const errPw = validatePassword(password);
  if (errPw) {
    const e = new Error(errPw);
    e.response = { data: { detail: errPw } };
    throw e;
  }

  try {
    return (await axios.post(`${API}/players/register`, { nickname: nick, password })).data;
  } catch (error) {
    // Web build: do not silently go offline. If the backend is reachable but requests fail
    // (CORS/HTTPS/misconfig), surface the error so the user can fix connectivity.
    if (!_isElectron()) {
      if (error?.response) throw error;
      const reachable = await _isBackendReachable();
      if (reachable) throw error;
      throw error;
    }

    // If the server responded with a validation/auth error, do not create an offline account.
    if (error?.response) throw error;

    const key = _userKey(nick);
    const users = _loadUsers();
    if (users[key]) {
      const e = new Error('Already taken.');
      e.response = { data: { detail: 'Already taken.' } };
      throw e;
    }

    const wantsOwner = key === OFFLINE_ADMIN_NICK;
    if (wantsOwner && password !== OFFLINE_ADMIN_PASSWORD) {
      const e = new Error('Owner callsign is reserved.');
      e.response = { data: { detail: 'Owner callsign is reserved.' } };
      throw e;
    }

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltHex = _toHex(salt);
    const pwHash = await _hashPassword(password, saltHex);

    const id = wantsOwner ? 0 : _ensurePlayerId(nick);

    const userDoc = {
      id,
      nickname: nick,
      salt: saltHex,
      password_hash: pwHash,
      is_admin: wantsOwner,
      coins: wantsOwner ? 1000 : 0,
      owned_items: [],
      rating: wantsOwner ? 1600 : 1000,
      created_at: Date.now(),
    };
    users[key] = userDoc;
    _saveUsers(users);

    return {
      player: _offlinePlayerDoc(userDoc),
      token: _makeOfflineToken(nick),
    };
  }
};

export const loginNick = async (nick, password) => {
  try {
    return (await axios.post(`${API}/players/login`, { nickname: nick, password })).data;
  } catch (error) {
    // Web build: never auto-switch to offline.
    if (!_isElectron()) {
      throw error;
    }

    // If the server responded (4xx/5xx), do not silently fall back to offline.
    // Offline fallback is reserved for network/unreachable scenarios.
    if (error?.response) throw error;

    // If the backend is reachable but the request failed, do NOT fall back to offline.
    // This usually means CORS / HTTPS / proxy misconfiguration and should be surfaced.
    const reachable = await _isBackendReachable();
    if (reachable) throw error;

    const key = _userKey(nick);
    const users = _loadUsers();
    const u = users[key];

    // Special-case owner account to always be able to enter offline.
    const isOwnerLogin = key === OFFLINE_ADMIN_NICK && password === OFFLINE_ADMIN_PASSWORD;
    if (isOwnerLogin && !u) {
      const id = 0;
      _ensurePlayerId(nick);
      const pwHash = await _hashPassword(OFFLINE_ADMIN_PASSWORD, 'owner');
      const userDoc = {
        id,
        nickname: nick,
        salt: 'owner',
        password_hash: pwHash,
        is_admin: true,
        coins: 1000,
        owned_items: [],
        rating: 1600,
        created_at: Date.now(),
      };
      users[key] = userDoc;
      _saveUsers(users);
      return { player: _offlinePlayerDoc(userDoc), token: _makeOfflineToken(nick) };
    }

    if (!u) {
      const e = new Error('Invalid credentials.');
      e.response = { data: { detail: 'Invalid credentials.' } };
      throw e;
    }

    // Ensure user has a stable local ID.
    if (u.id == null) {
      u.id = key === OFFLINE_ADMIN_NICK ? 0 : _ensurePlayerId(u.nickname);
      users[key] = u;
      _saveUsers(users);
    }

    if (key === OFFLINE_ADMIN_NICK && password === OFFLINE_ADMIN_PASSWORD) {
      // Ensure owner stays owner in offline storage.
      if (!u.is_admin) {
        u.is_admin = true;
        users[key] = u;
        _saveUsers(users);
      }
      return { player: _offlinePlayerDoc({ ...u, is_admin: true }), token: _makeOfflineToken(nick) };
    }

    try {
      const test = await _hashPassword(password, u.salt);
      if (test !== u.password_hash) {
        const e = new Error('Invalid credentials.');
        e.response = { data: { detail: 'Invalid credentials.' } };
        throw e;
      }
    } catch (e) {
      if (e?.response) throw e;
      const e2 = new Error('Invalid credentials.');
      e2.response = { data: { detail: 'Invalid credentials.' } };
      throw e2;
    }

    // Never grant admin offline except for the owner callsign.
    return {
      player: _offlinePlayerDoc({ ...u, is_admin: isAdminNick(u.nickname) }),
      token: _makeOfflineToken(nick),
    };
  }
};

export const logout = async () => {
  try { await axios.post(`${API}/players/logout`, null, { headers: authHeaders() }); } catch {}
  clearSession();
};

export const changePassword = async (oldPw, newPw) => {
  try {
    return (await axios.post(`${API}/players/change-password`, { old_password: oldPw, new_password: newPw }, { headers: authHeaders() })).data;
  } catch {
    const nick = getStoredNickname();
    const key = _userKey(nick);
    const users = _loadUsers();
    const u = users[key];
    if (!u) {
      const e = new Error('Not logged in.');
      e.response = { data: { detail: 'Not logged in.' } };
      throw e;
    }
    const errPw = validatePassword(newPw);
    if (errPw) {
      const e = new Error(errPw);
      e.response = { data: { detail: errPw } };
      throw e;
    }

    // Owner account: allow changing only if the old password matches the offline owner password.
    if (key === OFFLINE_ADMIN_NICK) {
      if (oldPw !== OFFLINE_ADMIN_PASSWORD) {
        const e = new Error('Invalid old password.');
        e.response = { data: { detail: 'Invalid old password.' } };
        throw e;
      }
      const e = new Error('Owner password is fixed in offline mode.');
      e.response = { data: { detail: 'Owner password is fixed in offline mode.' } };
      throw e;
    }

    const test = await _hashPassword(oldPw, u.salt);
    if (test !== u.password_hash) {
      const e = new Error('Invalid old password.');
      e.response = { data: { detail: 'Invalid old password.' } };
      throw e;
    }
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltHex = _toHex(salt);
    const pwHash = await _hashPassword(newPw, saltHex);
    users[key] = { ...u, salt: saltHex, password_hash: pwHash };
    _saveUsers(users);
    return { ok: true };
  }
};

export const fetchMe = async () => {
  try {
    if (!isOnlineToken(getToken())) throw new Error('Not logged in.');
    return (await axios.get(`${API}/me`, { headers: authHeaders() })).data;
  } catch {
    const nick = getStoredNickname();
    const key = _userKey(nick);
    const users = _loadUsers();
    const u = users[key];
    if (!u) {
      return { nickname: nick, is_admin: isAdminNick(nick), coins: 0, owned_items: [], rating: 1000 };
    }
    return {
      nickname: u.nickname,
      is_admin: isAdminNick(u.nickname),
      coins: u.coins ?? 0,
      owned_items: u.owned_items || [],
      rating: u.rating ?? 1000,
    };
  }
};

export const fetchPlayer = async (nick) => {
  try {
    return (await axios.get(`${API}/players/${encodeURIComponent(nick)}`)).data;
  } catch {
    const key = _userKey(nick);
    const users = _loadUsers();
    const u = users[key];
    if (!u) {
      const e = new Error('Player not found.');
      e.response = { data: { detail: 'Player not found.' } };
      throw e;
    }
    return _offlinePlayerDoc({ ...u, is_admin: isAdminNick(u.nickname) });
  }
};

export const fetchAchievementDefs = async () => {
  try {
    return (await axios.get(`${API}/achievements/defs`)).data;
  } catch {
    return { achievements: [] };
  }
};

export const fetchMyAchievements = async () => {
  try {
    if (!isOnlineToken(getToken())) throw new Error('Not logged in.');
    return (await axios.get(`${API}/achievements/me`, { headers: authHeaders() })).data;
  } catch {
    const nick = getStoredNickname();
    return { nickname: nick, unlocked: {}, unlocked_count: 0, offline: true };
  }
};

export const fetchPlayerAchievements = async (nick) => {
  try {
    return (await axios.get(`${API}/achievements/${encodeURIComponent(String(nick || '').trim())}`)).data;
  } catch (e) {
    const err = new Error('Player not found.');
    err.response = e?.response || { data: { detail: 'Player not found.' } };
    throw err;
  }
};

export const purchaseItem = async (itemId) => {
  try {
    return (await axios.post(`${API}/shop/purchase`, { item_id: itemId }, { headers: authHeaders() })).data;
  } catch (error) {
    if (!_isElectron()) throw error;
    const reachable = await _isBackendReachable();
    if (reachable) throw error;
    // Offline: do not block gameplay; keep a minimal local inventory/coins system.
    const nick = getStoredNickname();
    const key = _userKey(nick);
    const users = _loadUsers();
    let u = users[key];
    if (!u) {
      if (!nick || !nick.trim()) {
        const e = new Error('Not logged in.');
        e.response = { data: { detail: 'Not logged in.' } };
        throw e;
      }
      u = { nickname: nick.trim(), coins: 0, owned_items: [], rating: 1000 };
      users[key] = u;
      _saveUsers(users);
    }
    if ((u.owned_items || []).includes(itemId)) return { player: _offlinePlayerDoc(u) };
    // No catalog/prices offline: just grant it for now.
    const next = { ...u, owned_items: [...(u.owned_items || []), itemId] };
    users[key] = next;
    _saveUsers(users);
    return { player: _offlinePlayerDoc(next) };
  }
};

export const submitScore = async (body) => {
  try {
    if (!isOnlineToken(getToken())) throw new Error('Not logged in.');
    const nick = getStoredNickname();
    const payload = (nick && nick.trim()) ? { ...body, player_name: nick.trim() } : body;
    return (await axios.post(`${API}/leaderboard`, payload, { headers: authHeaders() })).data;
  } catch (error) {
    if (!_isElectron()) throw error;
    if (error?.response) throw error;
    const reachable = await _isBackendReachable();
    if (reachable) throw error;
    // Offline: keep a minimal local coins system.
    const _computeCampaignCoins = ({ level_id, lives_remaining, time_seconds, flags, won }) => {
      if (level_id == null) return 0;
      const lvl = Number(level_id) || 0;
      const lvl_win = Math.floor(lvl * 0.6);
      const lvl_lose = Math.floor(lvl * 0.2);
      const base_win = won ? (8 + lvl_win + (Number(lives_remaining) || 0) * 3) : 0;
      const base_lose = !won ? (2 + lvl_lose) : 0;
      let time_bonus = 0;
      const ts = Number(time_seconds) || 0;
      if (won && ts > 0) {
        const target = Math.max(45, lvl * 6);
        time_bonus = Math.max(0, Math.floor((target - ts) / 12));
      }
      const flag_bonus = Math.min(10, Number(flags) || 0);
      return Math.min(50, base_win + base_lose + time_bonus + flag_bonus);
    };

    const _computeCoins = (payload) => {
      const mode = payload?.mode;
      if (mode === 'campaign') return _computeCampaignCoins(payload);
      if (mode === 'battle_ranked') return payload?.won ? 40 + (Number(payload?.lives_remaining) || 0) * 8 : 3;
      if (mode === 'battle_simple') return payload?.won ? 25 + (Number(payload?.lives_remaining) || 0) * 5 : 2;
      if (mode === 'lobby') return payload?.won ? 15 + (Number(payload?.lives_remaining) || 0) * 5 : 2;
      return 0;
    };

    const coins_awarded = _computeCoins(body);

    try {
      const nick = getStoredNickname();
      const key = _userKey(nick);
      const users = _loadUsers();
      const u = users[key];
      if (u) {
        const next = { ...u, coins: (u.coins ?? 0) + coins_awarded };
        users[key] = next;
        _saveUsers(users);
      }
    } catch {}

    return { ok: true, coins_awarded, rating_delta: 0 };
  }
};

export const adminHeaders = () => authHeaders();
export const sessionHeaders = () => authHeaders();

export const adminListPlayers = async ({ limit = 200 } = {}) => {
  return (await axios.get(`${API}/admin/players`, { params: { limit }, headers: authHeaders() })).data;
};

export async function adminFixNegativeRatings() {
  const res = await axios.post(`${API}/admin/ratings/fix-negative`, {}, { headers: authHeaders() });
  return res?.data;
}

export async function adminGrantRatingWin() {
  const res = await axios.post(`${API}/admin/rating/grant-win`, {}, { headers: authHeaders() });
  return res?.data;
}

export async function adminGrantCoins(amount = 100) {
  const res = await axios.post(`${API}/admin/coins/grant`, {}, { params: { amount }, headers: authHeaders() });
  return res?.data;
}

export async function adminResetAchievements(nickname) {
  const nick = String(nickname || '').trim();
  if (!nick) throw new Error('Missing nickname');
  const res = await axios.post(`${API}/admin/achievements/reset`, { nickname: nick }, { headers: authHeaders() });
  return res?.data;
}

export const adminDeletePlayer = async (nickname) => {
  const nick = String(nickname || '').trim();
  if (!nick) throw new Error('Missing nickname');
  return (await axios.delete(`${API}/admin/player/${encodeURIComponent(nick)}`, { headers: authHeaders() })).data;
};
