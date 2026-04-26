import React, { useEffect, useState, useRef } from 'react';
import { Swords, Loader2, Copy, Check, X, Play, Clock, Trophy } from 'lucide-react';
import { matchmakingFind, getLobby, cancelLobby, startLobby } from '../../lib/lobby';
import { t, useLang } from '../../lib/i18n';

export default function BattlesView({ onStartBattle, player }) {
  const [searching, setSearching] = useState(null); // 'simple' | 'ranked'
  const [lobby, setLobby] = useState(null);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);
  const startedRef = useRef(false);
  useLang();

  const SIMPLE_CFG = { rows: 10, cols: 10, mines: 20, lives: 3, mode: 'battle_simple', public: true };
  const RANKED_CFG = { rows: 10, cols: 10, mines: 20, lives: 2, mode: 'battle_ranked', public: true };

  const stopPolling = () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };

  useEffect(() => {
    return () => {
      stopPolling();
      if (lobby?.code) {
        cancelLobby(lobby.code).catch(() => {});
      }
    };
  }, [lobby?.code]);

  const beginSearch = async (kind) => {
    setError(null); setSearching(kind);
    const cfg = kind === 'simple' ? SIMPLE_CFG : RANKED_CFG;
    try {
      const l = await matchmakingFind(cfg);
      setLobby(l);
      startedRef.current = false;
      // If we just joined an existing lobby with a guest already (us), wait for host to start
      pollRef.current = setInterval(async () => {
        try {
          const latest = await getLobby(l.code);
          setLobby(latest);
          if (!startedRef.current && latest.status === 'waiting' && latest.host === player?.nick && latest.guest) {
            startedRef.current = true;
            try {
              const started = await startLobby(latest.code);
              setLobby(started);
            } catch {}
          }
          if (latest.status === 'playing') {
            stopPolling();
            launchFromLobby(latest, kind, cfg);
          }
        } catch {}
      }, 1500);
    } catch (e) {
      setError(e?.response?.data?.detail || 'Matchmaking failed.');
      setSearching(null);
    }
  };

  const launchFromLobby = (lob, kind, cfg) => {
    onStartBattle({
      ...cfg,
      difficulty: 'battle',
      label: kind === 'ranked' ? t('battles.rankedTitle') : t('battles.simpleTitle'),
      lobbyCode: lob.code,
      seed: lob.seed,
      opponent: lob.host === (player?.nick) ? lob.guest : lob.host,
    });
    setSearching(null); setLobby(null);
  };

  const hostStartManually = async () => {
    if (!lobby) return;
    try {
      const l = await startLobby(lobby.code);
      setLobby(l);
    } catch (e) {
      setError(e?.response?.data?.detail || 'Start failed.');
    }
  };

  const cancelSearch = async () => {
    stopPolling();
    if (lobby) { try { await cancelLobby(lobby.code); } catch {} }
    setLobby(null); setSearching(null); setError(null);
  };

  const iAmHost = lobby?.host === player?.nick;
  const oppName = iAmHost ? lobby?.guest : lobby?.host;

  const [copied, setCopied] = useState(false);
  const copyLobbyCode = async () => {
    const code = lobby?.code;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <div className="max-w-[1600px] mx-auto w-full px-4 md:px-6 pb-10" data-testid="battles-view">
      <div className="glass-panel rounded-xl p-6 mb-6">
        <div className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-display">// duel protocol</div>
        <h2 className="font-display text-2xl md:text-3xl font-black tracking-tight neon-cyan mt-1 flex items-center gap-3">
          <Swords size={26} className="neon-coral" /> {t('battles.title')}
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xl">
          {t('battles.blurb')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <BattleCard
          title={t('battles.simpleTitle')} subtitle={t('battles.simpleSubtitle')} color="cyan"
          config={SIMPLE_CFG} disabled={!!searching}
          onFind={() => beginSearch('simple')}
          testid="start-simple-battle"
        />
        <BattleCard
          title={t('battles.rankedTitle')} subtitle={t('battles.rankedSubtitle')} color="coral"
          config={RANKED_CFG} disabled={!!searching}
          onFind={() => beginSearch('ranked')}
          testid="start-ranked-battle"
          rating={player?.rating}
        />
      </div>

      {searching && (
        <div className="glass-panel rounded-xl p-6" data-testid="matchmaking-panel">
          <div className="flex items-center gap-3 mb-3">
            <Loader2 size={18} className="neon-cyan animate-spin" />
            <h3 className="font-display text-lg font-bold neon-cyan">
              {oppName ? t('battles.found') : t('battles.searching')}
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-3 mb-4">
            <div className="glass-panel-light rounded-lg p-3">
              <div className="text-[9px] tracking-[0.25em] text-slate-400 font-display uppercase">{t('battles.code')}</div>
              <div className="flex items-center gap-2">
                <div className="font-mono text-lg font-bold neon-cyan allow-select" data-testid="mm-lobby-code">{lobby?.code || '—'}</div>
                {!!lobby?.code && (
                  <button onClick={copyLobbyCode} className="text-slate-400 hover:text-[#00E5FF]" title={t('common.copy')} data-testid="mm-copy-code">
                    {copied ? <Check size={14} className="neon-lime" /> : <Copy size={14} />}
                  </button>
                )}
              </div>
            </div>
            <div className="glass-panel-light rounded-lg p-3">
              <div className="text-[9px] tracking-[0.25em] text-slate-400 font-display uppercase">{t('battles.host')}</div>
              <div className="font-mono text-lg font-bold text-slate-200">{lobby?.host || '—'}</div>
            </div>
            <div className="glass-panel-light rounded-lg p-3">
              <div className="text-[9px] tracking-[0.25em] text-slate-400 font-display uppercase">{t('battles.opponent')}</div>
              <div className={`font-mono text-lg font-bold ${oppName ? 'neon-lime' : 'text-slate-500'}`}>
                {oppName || t('battles.waiting')}
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {iAmHost && oppName && lobby?.status === 'waiting' && (
              <button onClick={hostStartManually} className="neon-btn flex items-center gap-2" data-testid="host-start-btn">
                <Play size={12} fill="currentColor" /> {t('battles.startNow')}
              </button>
            )}
            <button onClick={cancelSearch} className="neon-btn neon-btn-coral flex items-center gap-2" data-testid="cancel-matchmaking-btn">
              <X size={12} /> {t('battles.cancel')}
            </button>
          </div>
          {error && <div className="mt-3 text-[11px] neon-coral" data-testid="matchmaking-error">{error}</div>}
        </div>
      )}
    </div>
  );
}

function BattleCard({ title, subtitle, color, config, onFind, testid, rating, disabled }) {
  const colorClass = { cyan: 'neon-cyan', coral: 'neon-coral' }[color];
  const borderClass = { cyan: 'border-[#00E5FF]/30 hover:border-[#00E5FF]/70', coral: 'border-[#FF2A6D]/30 hover:border-[#FF2A6D]/70' }[color];
  return (
    <div className={`glass-panel rounded-xl p-6 border-2 transition-all ${borderClass}`}>
      <div className={`flex items-center gap-3 mb-3 ${colorClass}`}>
        <Swords size={20} />
        <div>
          <div className="font-display text-xl font-black tracking-tight">{title}</div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-slate-500 font-display">{subtitle}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4 mb-5">
        <StatBox label={t('battles.field')} value={`${config.rows}×${config.cols}`} />
        <StatBox label={t('battles.mines')} value={config.mines} />
        <StatBox label={t('battles.lives')} value={config.lives} />
      </div>
      {rating !== undefined && (
        <div className="glass-panel-light rounded-lg px-4 py-2 mb-4 flex items-center justify-between">
          <span className="text-[10px] tracking-[0.25em] uppercase text-slate-400 font-display">{t('battles.yourRating')}</span>
          <span className="neon-gold font-mono text-lg font-bold">{rating || 500}</span>
        </div>
      )}
      <button onClick={onFind} disabled={disabled} className="neon-btn w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50" data-testid={testid}>
        <Swords size={14} /> {t('battles.findOpponent')}
      </button>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="glass-panel-light rounded-lg p-2 text-center">
      <div className="text-[9px] tracking-[0.25em] uppercase text-slate-400 font-display">{label}</div>
      <div className="font-mono font-bold neon-cyan">{value}</div>
    </div>
  );
}
