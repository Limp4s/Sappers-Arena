import { getToken } from './player';

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

const toWsUrl = (httpUrl) => {
  try {
    const u = new URL(httpUrl);
    u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
    return u.toString().replace(/\/$/, '');
  } catch {
    const trimmed = (httpUrl || '').replace(/\/$/, '');
    if (trimmed.startsWith('https://')) return `wss://${trimmed.slice('https://'.length)}`;
    if (trimmed.startsWith('http://')) return `ws://${trimmed.slice('http://'.length)}`;
    return trimmed;
  }
};

export function connectLobbyWs(code, { onMessage, onOpen, onClose, onError } = {}) {
  const token = getToken();
  const wsBase = toWsUrl(BACKEND_URL);
  const url = `${wsBase}/api/ws/lobbies/${encodeURIComponent((code || '').toUpperCase())}?token=${encodeURIComponent(token || '')}`;
  const ws = new WebSocket(url);

  ws.onopen = () => onOpen?.();
  ws.onmessage = (evt) => {
    try {
      const data = JSON.parse(evt.data);
      onMessage?.(data);
    } catch {}
  };
  ws.onerror = (e) => onError?.(e);
  ws.onclose = (e) => onClose?.(e);

  const send = (data) => {
    try {
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data));
    } catch {}
  };

  const close = () => {
    try { ws.close(); } catch {}
  };

  return { ws, send, close, url };
}
