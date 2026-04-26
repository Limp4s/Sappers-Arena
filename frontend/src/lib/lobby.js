import axios from 'axios';
import { sessionHeaders, getToken } from './player';

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

const normLobbyCode = (code) => (code || '').trim().toUpperCase();

const ensureLobbyAuth = async () => {
  const t = getToken();
  if (!t || (t || '').startsWith('offline-')) throw new Error('Not logged in.');
};

const authedPost = async (url, body) => {
  await ensureLobbyAuth();
  return axios.post(url, body, { headers: sessionHeaders() });
};

export const createLobby = async (cfg) => (await authedPost(`${API}/lobbies`, cfg)).data;
export const joinLobby = async (code) => (await authedPost(`${API}/lobbies/${normLobbyCode(code)}/join`, null)).data;
export const getLobby = async (code) => (await axios.get(`${API}/lobbies/${normLobbyCode(code)}`)).data;
export const startLobby = async (code) => (await authedPost(`${API}/lobbies/${normLobbyCode(code)}/start`, null)).data;
export const submitLobbyResult = async (code, result) => (await authedPost(`${API}/lobbies/${normLobbyCode(code)}/result`, result)).data;
export const cancelLobby = async (code) => (await authedPost(`${API}/lobbies/${normLobbyCode(code)}/cancel`, null)).data;
export const matchmakingFind = async (cfg) => (await authedPost(`${API}/matchmaking/find`, cfg)).data;

export const reportProgress = async (code, progress) => (await authedPost(`${API}/lobbies/${normLobbyCode(code)}/progress`, progress)).data;
export const promoteToAdmin = async (nickname) => (await axios.post(`${API}/admin/promote`, { nickname }, { headers: sessionHeaders() })).data;

// Simple xorshift seeded RNG for deterministic board generation
export function createSeededRandom(seed) {
  let x = seed >>> 0;
  if (x === 0) x = 1;
  return function() {
    x ^= x << 13; x >>>= 0;
    x ^= x >> 17; x >>>= 0;
    x ^= x << 5;  x >>>= 0;
    return (x % 100000) / 100000;
  };
}
