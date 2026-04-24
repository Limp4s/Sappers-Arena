import axios from 'axios';
import { sessionHeaders } from './player';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

export const createLobby = async (cfg) => (await axios.post(`${API}/lobbies`, cfg, { headers: sessionHeaders() })).data;
export const joinLobby = async (code) => (await axios.post(`${API}/lobbies/${code}/join`, null, { headers: sessionHeaders() })).data;
export const getLobby = async (code) => (await axios.get(`${API}/lobbies/${code}`)).data;
export const startLobby = async (code) => (await axios.post(`${API}/lobbies/${code}/start`, null, { headers: sessionHeaders() })).data;
export const submitLobbyResult = async (code, result) => (await axios.post(`${API}/lobbies/${code}/result`, result, { headers: sessionHeaders() })).data;
export const cancelLobby = async (code) => (await axios.post(`${API}/lobbies/${code}/cancel`, null, { headers: sessionHeaders() })).data;
export const matchmakingFind = async (cfg) => (await axios.post(`${API}/matchmaking/find`, cfg, { headers: sessionHeaders() })).data;

export const reportProgress = async (code, progress) => (await axios.post(`${API}/lobbies/${code}/progress`, progress, { headers: sessionHeaders() })).data;
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
