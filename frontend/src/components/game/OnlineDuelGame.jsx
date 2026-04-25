import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { ArrowLeft, ShieldAlert, Swords } from 'lucide-react';
import { Cell, StatsBar, GameOverModal } from './GameParts';
import { t, useLang } from '../../lib/i18n';
import { connectLobbyWs } from '../../lib/lobby_ws';
import { submitScore } from '../../lib/player';
import { startLobby, submitLobbyResult } from '../../lib/lobby';
import { loadEquipped, MINE_ICONS, CELL_THEMES, FX_EFFECTS } from '../../lib/shop';

const makeEmptyBoard = (rows, cols) => Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({
  revealed: false,
  flagged: false,
  mine: false,
  exploded: false,
  adjacent: 0,
})));

const applyChanges = (board, changes) => {
  if (!Array.isArray(changes) || changes.length === 0) return board;
  const next = board.map((row) => row.map((c) => ({ ...c })));
  for (const ch of changes) {
    const r = ch?.r;
    const c = ch?.c;
    if (!Number.isInteger(r) || !Number.isInteger(c)) continue;
    if (!next[r] || !next[r][c]) continue;
    next[r][c] = {
      ...next[r][c],
      revealed: !!ch.revealed,
      flagged: !!ch.flagged,
      mine: !!ch.mine,
      exploded: !!ch.exploded,
      adjacent: ch.adjacent ?? next[r][c].adjacent,
    };
  }
  return next;
};

export default function OnlineDuelGame({ config, onCoinsEarned }) {
  const {
    rows, cols, mines, lives: livesTotal, mode, difficulty, label,
    onExit, player, lobbyCode, opponent,
  } = config;

  const playerName = player?.nick;
  const theme = loadEquipped(playerName);
  const mineDef = MINE_ICONS[theme.mine] || MINE_ICONS.mine_default;
  const cellTheme = CELL_THEMES[theme.cell] || CELL_THEMES.cell_default;
  const fxDef = FX_EFFECTS[theme.fx] || FX_EFFECTS.fx_default;

  const [myBoard, setMyBoard] = useState(() => makeEmptyBoard(rows, cols));
  const [oppBoard, setOppBoard] = useState(() => makeEmptyBoard(rows, cols));
  const [status, setStatus] = useState('idle'); // idle | playing | won | lost
  const [timer, setTimer] = useState(0);
  const [lives, setLives] = useState(livesTotal);
  const [oppLives, setOppLives] = useState(livesTotal);
  const [safe, setSafe] = useState(0);
  const [oppSafe, setOppSafe] = useState(0);
  const [totalSafe, setTotalSafe] = useState(rows * cols - mines);
  const [winner, setWinner] = useState(null);
  const [resultText, setResultText] = useState(null);
  const [wsError, setWsError] = useState(null);
  const [serverOffset, setServerOffset] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [coinsAwarded, setCoinsAwarded] = useState(0);
  const [ratingDelta, setRatingDelta] = useState(0);

  useLang();
  const timerRef = useRef(null);
  const wsRef = useRef(null);

  const minesLeft = useMemo(() => mines, [mines]);
  const gridStyle = useMemo(() => ({ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: '3px' }), [cols]);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      if (!startedAt) return;
      const now = Math.floor(Date.now() / 1000) + serverOffset;
      setTimer(Math.min(Math.max(0, now - startedAt), 999));
    }, 250);
  }, [serverOffset, startedAt]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => stopTimer(), [stopTimer]);

  useEffect(() => {
    if (!lobbyCode || !playerName) return;

    wsRef.current?.close?.();

    const conn = connectLobbyWs(lobbyCode, {
      onMessage: (msg) => {
        if (!msg) return;
        if (msg.type === 'init') {
          setWsError(null);
          const sNow = typeof msg.server_now === 'number' ? msg.server_now : null;
          const sStart = typeof msg.started_at === 'number' ? msg.started_at : null;
          if (sNow != null) setServerOffset(sNow - Math.floor(Date.now() / 1000));
          if (sStart != null) setStartedAt(sStart);

          setStatus(msg.status === 'playing' ? 'playing' : 'idle');
          setTotalSafe(rows * cols - mines);
          if (msg.status === 'playing') {
            stopTimer();
            startTimer();
          } else {
            // If host is connected and lobby isn't started yet, start it automatically.
            if ((msg.role === 'host' || msg.role === 'HOST') && lobbyCode) {
              startLobby(lobbyCode).catch(() => {});
            }
          }
        }

        if (msg.type === 'error') {
          setWsError(msg.error || 'Error');
        }

        if (msg.type === 'player_update') {
          const who = msg.player;
          if (who === playerName) {
            setMyBoard((b) => applyChanges(b, msg.changes));
            if (typeof msg.lives === 'number') setLives(msg.lives);
            if (typeof msg.safe === 'number') setSafe(msg.safe);
            if (typeof msg.total_safe === 'number') setTotalSafe(msg.total_safe);
            if (msg.done) {
              setStatus(msg.won ? 'won' : 'lost');
              stopTimer();
              setTimeout(() => setModalOpen(true), 700);
            }
          } else {
            setOppBoard((b) => applyChanges(b, msg.changes));
            if (typeof msg.lives === 'number') setOppLives(msg.lives);
            if (typeof msg.safe === 'number') setOppSafe(msg.safe);
          }
        }

        if (msg.type === 'duel_over') {
          setWinner(msg.winner);
          const iWon = msg.winner && msg.winner === playerName;
          setResultText(iWon ? t('game.victory') : t('game.defeat'));
          setStatus(iWon ? 'won' : 'lost');
          stopTimer();
          setTimeout(() => setModalOpen(true), 600);
        }
      },
    });

    wsRef.current = conn;

    return () => {
      conn.close();
      wsRef.current = null;
    };
  }, [lobbyCode, playerName, rows, cols, mines, startTimer, stopTimer]);

  const revealCell = (r, c) => {
    if (status === 'won' || status === 'lost') return;
    wsRef.current?.send?.({ type: 'open', r, c });
  };

  const flagCell = (r, c) => {
    if (status === 'won' || status === 'lost') return;
    wsRef.current?.send?.({ type: 'flag', r, c });
  };

  const doSubmit = async () => {
    if (!playerName) return;
    try {
      const won = status === 'won';
      const score = safe; // simple score placeholder for online; backend awards coins/rating by mode
      const res = await submitScore({
        player_name: playerName,
        difficulty,
        mode,
        level_id: null,
        rows,
        cols,
        mines,
        flags: 0,
        score,
        time_seconds: timer,
        lives_remaining: lives,
        lives_total: livesTotal,
        won,
        lobby_code: lobbyCode || null,
      });
      const awarded = res.coins_awarded ?? 0;
      setCoinsAwarded(awarded);
      setRatingDelta(res.rating_delta ?? 0);
      onCoinsEarned?.(awarded);
      if (lobbyCode) {
        try { await submitLobbyResult(lobbyCode, { score, time_seconds: timer, won, lives_remaining: lives }); } catch {}
      }
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col" data-testid="online-duel-screen">
      <header className="relative z-10 max-w-[1600px] mx-auto w-full px-4 md:px-6 pt-5 pb-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <button onClick={onExit} className="neon-btn flex items-center gap-2" data-testid="exit-online-btn">
            <ArrowLeft size={14} /> {t('common.exit')}
          </button>
          <div className="flex items-center gap-3">
            <ShieldAlert size={22} className="neon-cyan" />
            <div>
              <div className="font-display text-xl font-black tracking-tight neon-cyan leading-none">
                {label || 'ONLINE'}
              </div>
              <div className="text-[9px] tracking-[0.3em] uppercase text-slate-500 font-display mt-1">
                // {mode.toUpperCase()} · {rows}×{cols} · {mines} {t('game.minesLower')} · {livesTotal} {t('game.livesLower')}
                {opponent && <> · {t('common.vs')} <span className="neon-coral">{opponent}</span></>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {opponent && <div className="pill flex items-center gap-1 text-[10px]"><Swords size={11} /> {opponent}</div>}
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-[1600px] mx-auto w-full px-4 md:px-6 pb-8 flex flex-col gap-4">
        <StatsBar timer={timer} lives={lives} livesTotal={livesTotal} score={safe} minesLeft={minesLeft} onReset={() => {}} infiniteLives={false} showReset={false} />

        {wsError && (
          <div className="glass-panel rounded-xl px-5 py-4 border border-[#FF2A6D]/40" data-testid="ws-error">
            <div className="text-[10px] tracking-[0.25em] uppercase text-slate-500 font-display">// network</div>
            <div className="font-mono text-[12px] neon-coral">{wsError}</div>
          </div>
        )}

        {winner && (
          <div className={`glass-panel rounded-xl px-5 py-4 flex items-center justify-between gap-4 border ${winner === playerName ? 'border-[#00FF9D]/50' : 'border-[#FF2A6D]/50'}`}>
            <div>
              <div className={`font-display text-xl font-black tracking-tight ${winner === playerName ? 'neon-lime' : 'neon-coral'}`}>
                {resultText || (winner === playerName ? t('game.victory') : t('game.defeat'))}
              </div>
              <div className="text-[10px] tracking-[0.25em] uppercase text-slate-500 font-display mt-1">
                // {t('common.winner')}: <span className="text-white shadow-[0_0_10px_rgba(255,255,255,0.55)]">{winner}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] tracking-[0.25em] uppercase text-slate-500 font-display">// time</div>
              <div className="font-mono text-2xl font-black text-white shadow-[0_0_10px_rgba(255,255,255,0.55)]">{String(timer).padStart(3, '0')}s</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
          <div className="glass-panel rounded-xl p-4 md:p-6 flex items-center justify-center relative overflow-hidden" style={{ borderColor: '#00FF9D66' }}>
            <div className="w-full" style={{ maxWidth: `min(100%, ${cols * 48}px)` }}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="text-[10px] tracking-[0.25em] uppercase text-slate-400 font-display">
                  {t('common.you')} · {safe}/{totalSafe} · {t('game.lives')} {lives}
                </div>
                <div className="pill border border-[#00FF9D]/40 text-[10px] font-display neon-lime px-3 py-1">
                  {playerName || t('common.you')}
                </div>
              </div>
              <div style={gridStyle}>
                {myBoard.map((row, r) => row.map((cell, c) => (
                  <Cell key={`m-${r}-${c}`} cell={cell} r={r} c={c} onReveal={revealCell} onFlag={flagCell}
                    disabled={status === 'won' || status === 'lost'} revealDelay={0} mineIcon={mineDef.icon} cellTheme={cellTheme} />
                )))}
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4 md:p-6 flex items-center justify-center relative overflow-hidden" style={{ borderColor: '#FF2A6D66' }}>
            <div className="w-full" style={{ maxWidth: `min(100%, ${cols * 48}px)` }}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="text-[10px] tracking-[0.25em] uppercase text-slate-400 font-display">
                  {t('common.opponent')} · {oppSafe}/{totalSafe} · {t('game.lives')} {oppLives}
                </div>
                <div className="pill border border-[#FF2A6D]/40 text-[10px] font-display neon-coral px-3 py-1">
                  {opponent || t('common.opponent')}
                </div>
              </div>
              <div style={gridStyle}>
                {oppBoard.map((row, r) => row.map((cell, c) => (
                  <Cell key={`o-${r}-${c}`} cell={cell} r={r} c={c} onReveal={() => {}} onFlag={() => {}}
                    disabled={true} revealDelay={0} mineIcon={mineDef.icon} cellTheme={cellTheme} />
                )))}
              </div>
            </div>
          </div>
        </div>

      </main>

      <GameOverModal open={modalOpen} won={status === 'won'} score={safe} time={timer}
        livesRemaining={lives} livesTotal={livesTotal} difficulty={difficulty}
        playerName={playerName} onSubmit={doSubmit} flags={0}
        onClose={() => setModalOpen(false)} onNewGame={() => {}} onExit={onExit}
        submitted={submitted} coinsAwarded={coinsAwarded} ratingDelta={ratingDelta}
        noSubmit={false} mode={mode} lobbyResult={null} opponent={opponent} levelId={null}
      />
    </div>
  );
}
