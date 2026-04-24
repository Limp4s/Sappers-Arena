import React, { useState, useEffect } from 'react';
import { Users, Copy, Check, X, Loader2, Play, LogIn } from 'lucide-react';
import { createLobby, joinLobby, getLobby, startLobby, cancelLobby } from '../../lib/lobby';
import { t, useLang } from '../../lib/i18n';

export default function FriendLobbyModal({ config, onClose, onStartWithLobby, player }) {
  const [mode, setMode] = useState('choose'); // choose | host | join
  const [lobby, setLobby] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  useLang();

  useEffect(() => {
    if (!lobby || lobby.status !== 'waiting') return;
    const t = setInterval(async () => {
      try {
        const latest = await getLobby(lobby.code);
        setLobby(latest);
        if (latest.status === 'playing') {
          clearInterval(t);
          onStartWithLobby({ ...config, mode: 'lobby', difficulty: 'lobby', label: `LOBBY · ${latest.code}`, lobbyCode: latest.code, seed: latest.seed });
          onClose();
        }
      } catch {}
    }, 1500);
    return () => clearInterval(t);
  }, [lobby, config, onStartWithLobby, onClose]);

  useEffect(() => () => {
    if (lobby?.status === 'waiting') { cancelLobby(lobby.code).catch(() => {}); }
  }, [lobby]);

  const hostCreate = async () => {
    setBusy(true); setError(null);
    try {
      const l = await createLobby({ ...config, mode: 'lobby_friend', public: false });
      setLobby(l); setMode('host');
    } catch (e) { setError(e?.response?.data?.detail || t('lobbyFriend.createFailed')); }
    finally { setBusy(false); }
  };

  const join = async () => {
    if (joinCode.length !== 6) return;
    setBusy(true); setError(null);
    try {
      const l = await joinLobby(joinCode.toUpperCase());
      setLobby(l); setMode('host'); // reuse view
    } catch (e) { setError(e?.response?.data?.detail || t('lobbyFriend.joinFailed')); }
    finally { setBusy(false); }
  };

  const hostStart = async () => {
    if (!lobby) return;
    setBusy(true); setError(null);
    try {
      const l = await startLobby(lobby.code);
      setLobby(l);
    } catch (e) { setError(e?.response?.data?.detail || t('lobbyFriend.startFailed')); setBusy(false); }
  };

  const copyCode = async () => {
    if (!lobby?.code) return;
    try { await navigator.clipboard.writeText(lobby.code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };

  const iAmHost = lobby?.host === player?.nick;
  const opponent = iAmHost ? lobby?.guest : lobby?.host;

  return (
    <div className="modal-backdrop" data-testid="friend-lobby-modal">
      <div className="glass-panel slide-up rounded-2xl p-7 max-w-md w-[92%]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-black neon-cyan flex items-center gap-2">
            <Users size={20} /> {t('lobbyFriend.title')}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white" data-testid="close-lobby-btn"><X size={18} /></button>
        </div>

        {mode === 'choose' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">{t('lobbyFriend.hint')}</p>
            <button onClick={hostCreate} disabled={busy} className="neon-btn w-full flex items-center justify-center gap-2 py-3" data-testid="create-lobby-btn">
              <Users size={14} /> {t('common.createLobby')}
            </button>
            <div className="relative flex items-center gap-2 my-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[9px] text-slate-500 tracking-[0.3em] font-display uppercase">{t('common.or')}</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-display block mb-1.5">{t('lobbyFriend.codeLabel')}</label>
              <input className="neon-input font-mono tracking-[0.3em] text-center text-lg" placeholder={t('lobbyFriend.codePlaceholder')}
                value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                maxLength={6} data-testid="lobby-code-input" />
            </div>
            <button onClick={join} disabled={joinCode.length !== 6 || busy}
              className="neon-btn w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50"
              data-testid="join-lobby-btn"
            >
              <LogIn size={14} /> {t('common.joinLobby')}
            </button>
            {error && <div className="mt-2 text-[11px] neon-coral" data-testid="lobby-error">{error}</div>}
          </div>
        )}

        {mode === 'host' && lobby && (
          <div className="space-y-4" data-testid="lobby-waiting-room">
            <div className="glass-panel-light rounded-lg p-4 text-center">
              <div className="text-[9px] tracking-[0.3em] uppercase text-slate-400 font-display mb-2">{t('lobbyFriend.shareCode')}</div>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-3xl font-black neon-cyan tracking-[0.3em] allow-select" data-testid="lobby-code-display">{lobby.code}</span>
                <button onClick={copyCode} className="text-slate-400 hover:text-[#00E5FF]" title={t('common.copy')} data-testid="copy-code-btn">
                  {copied ? <Check size={16} className="neon-lime" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="glass-panel-light rounded-lg p-3 text-center">
                <div className="text-[9px] text-slate-400 font-display tracking-[0.2em] uppercase">{t('lobbyFriend.host')}</div>
                <div className="font-mono text-sm font-bold text-slate-200 truncate">{lobby.host}</div>
              </div>
              <div className="glass-panel-light rounded-lg p-3 text-center">
                <div className="text-[9px] text-slate-400 font-display tracking-[0.2em] uppercase">{t('lobbyFriend.guest')}</div>
                <div className={`font-mono text-sm font-bold truncate ${opponent ? 'neon-lime' : 'text-slate-500'}`}>
                  {opponent || (<span className="flex items-center justify-center gap-1"><Loader2 size={11} className="animate-spin" /> {t('lobbyFriend.waiting')}</span>)}
                </div>
              </div>
            </div>
            {iAmHost && opponent && lobby.status === 'waiting' && (
              <button onClick={hostStart} disabled={busy} className="neon-btn w-full flex items-center justify-center gap-2 py-3" data-testid="lobby-start-btn">
                <Play size={14} fill="currentColor" /> {t('lobbyFriend.startNow')}
              </button>
            )}
            {!iAmHost && lobby.status === 'waiting' && (
              <div className="text-center text-[11px] text-slate-400 font-mono">
                {t('lobbyFriend.waitingForHost')}
              </div>
            )}
            {error && <div className="text-[11px] neon-coral" data-testid="lobby-error">{error}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
