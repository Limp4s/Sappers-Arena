import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { ArrowLeft, ShieldAlert, Swords } from 'lucide-react';
import { Cell, StatsBar, GameOverModal } from './GameParts';
import { t, useLang } from '../../lib/i18n';
import { connectLobbyWs } from '../../lib/lobby_ws';
import { submitScore } from '../../lib/player';
import { submitLobbyResult } from '../../lib/lobby';
import { loadEquipped, MINE_ICONS, CELL_THEMES, FX_EFFECTS, FLAG_SKINS } from '../../lib/shop';
import { recordDailyProgress } from '../../lib/dailies';
import AchievementBanner from '../ui/AchievementBanner';

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
  const localTheme = loadEquipped(playerName);
  const [themes, setThemes] = useState({});

  const myTheme = themes?.[playerName] || localTheme;
  const oppName = opponent;
  const oppTheme = (oppName && themes?.[oppName]) ? themes[oppName] : null;

  const mineDef = MINE_ICONS[myTheme.mine] || MINE_ICONS.mine_default;
  const cellTheme = CELL_THEMES[myTheme.cell] || CELL_THEMES.cell_default;
  const fxDef = FX_EFFECTS[myTheme.fx] || FX_EFFECTS.fx_default;
  const flagDef = FLAG_SKINS[myTheme.flag] || FLAG_SKINS.flag_default;

  const oppMineDef = MINE_ICONS[oppTheme?.mine] || mineDef;
  const oppCellTheme = CELL_THEMES[oppTheme?.cell] || cellTheme;
  const oppFlagDef = FLAG_SKINS[oppTheme?.flag] || flagDef;

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
  const [wsErrorDisplay, setWsErrorDisplay] = useState(null);
  const [serverOffset, setServerOffset] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [coinsAwarded, setCoinsAwarded] = useState(0);
  const [ratingDelta, setRatingDelta] = useState(0);
  const [rematchWaiting, setRematchWaiting] = useState(false);
  const [rematchVoted, setRematchVoted] = useState(false);
  const [oppRematchVoted, setOppRematchVoted] = useState(false);
  const [rematchSecondsLeft, setRematchSecondsLeft] = useState(0);
  const [newUnlocked, setNewUnlocked] = useState([]);

  useLang();
  const timerRef = useRef(null);
  const wsRef = useRef(null);
  const roleRef = useRef(null);
  const pingRef = useRef(null);
  const reconnectRef = useRef({ t: null, attempt: 0, stopped: false });
  const rematchTimeoutRef = useRef(null);
  const rematchTickRef = useRef(null);
  const rematchSendRef = useRef({ queued: false, t: null });
  const finishedRef = useRef(false);
  const startedAtRef = useRef(null);
  const serverOffsetRef = useRef(0);
  const statusRef = useRef('idle');

  const minesLeft = useMemo(() => mines, [mines]);
  const gridStyle = useMemo(() => ({ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: '3px' }), [cols]);

  useEffect(() => {
    startedAtRef.current = startedAt;
  }, [startedAt]);

  useEffect(() => {
    serverOffsetRef.current = serverOffset;
  }, [serverOffset]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      const sAt = startedAtRef.current;
      if (!sAt) return;
      const now = Math.floor(Date.now() / 1000) + (serverOffsetRef.current || 0);
      setTimer(Math.min(Math.max(0, now - sAt), 999));
    }, 250);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => stopTimer(), [stopTimer]);

  useEffect(() => {
    return () => {
      if (rematchTimeoutRef.current) {
        clearTimeout(rematchTimeoutRef.current);
        rematchTimeoutRef.current = null;
      }
      if (rematchTickRef.current) {
        clearInterval(rematchTickRef.current);
        rematchTickRef.current = null;
      }
      if (rematchSendRef.current.t) {
        clearTimeout(rematchSendRef.current.t);
        rematchSendRef.current.t = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!wsError) {
      setWsErrorDisplay(null);
      return;
    }
    const t = setTimeout(() => setWsErrorDisplay(wsError), 5000);
    return () => clearTimeout(t);
  }, [wsError]);

  useEffect(() => {
    if (!lobbyCode || !playerName) return;

    const clearPing = () => {
      if (pingRef.current) {
        clearInterval(pingRef.current);
        pingRef.current = null;
      }
    };

    const stopReconnect = () => {
      reconnectRef.current.stopped = true;
      if (reconnectRef.current.t) {
        clearTimeout(reconnectRef.current.t);
        reconnectRef.current.t = null;
      }
    };

    const scheduleReconnect = () => {
      if (reconnectRef.current.stopped) return;
      if (reconnectRef.current.t) return;
      const attempt = reconnectRef.current.attempt || 0;
      const delay = Math.min(15000, 600 + attempt * 900);
      reconnectRef.current.t = setTimeout(() => {
        reconnectRef.current.t = null;
        reconnectRef.current.attempt = attempt + 1;
        connect();
      }, delay);
    };

    const connect = () => {
      wsRef.current?.close?.();
      clearPing();

      setWsError(null);
      roleRef.current = null;

      const conn = connectLobbyWs(lobbyCode, {
        onOpen: () => {
          reconnectRef.current.attempt = 0;
          setWsError(null);
          clearPing();
          pingRef.current = setInterval(() => {
            try {
              if (wsRef.current?.ws?.readyState === WebSocket.OPEN) wsRef.current.send({ type: 'ping' });
            } catch {}
          }, 20000);

          if (rematchSendRef.current.queued) {
            try { wsRef.current?.send?.({ type: 'rematch' }); } catch {}
            rematchSendRef.current.queued = false;
          }

          // Send our current theme to the server so opponent can render it.
          try {
            wsRef.current?.send?.({ type: 'theme', theme: localTheme });
          } catch {}
        },
        onError: (e) => {
          const url = e?.url ? ` ${e.url}` : '';
          setWsError(`WebSocket error.${url}`);
        },
        onClose: (e) => {
          clearPing();
          const c = typeof e?.code === 'number' ? e.code : null;
          const r = e?.reason ? ` ${e.reason}` : '';
          const url = e?.url ? ` ${e.url}` : '';
          setWsError(`Disconnected.${c != null ? ` code=${c}` : ''}${r}${url}`);
          scheduleReconnect();
        },
        onMessage: (msg) => {
        if (!msg) return;
        if (msg.type === 'themes') {
          if (msg.themes && typeof msg.themes === 'object') {
            setThemes(msg.themes || {});
          }
        }

        if (msg.type === 'init') {
          setWsError(null);
          roleRef.current = msg.role;
          finishedRef.current = false;
          const sNow = typeof msg.server_now === 'number' ? msg.server_now : null;
          const sStart = typeof msg.started_at === 'number' ? msg.started_at : null;
          if (sNow != null) setServerOffset(sNow - Math.floor(Date.now() / 1000));
          if (sStart != null) setStartedAt(sStart);

          if (msg.themes && typeof msg.themes === 'object') {
            setThemes(msg.themes || {});
          }

          const nextStatus = msg.status === 'playing' ? 'playing' : 'idle';
          const prevStatus = statusRef.current;
          const prevStarted = startedAtRef.current;
          setStatus(nextStatus);
          if (nextStatus === 'playing') {
            const yourCells = Array.isArray(msg.your_cells) ? msg.your_cells : null;
            const oppCells = Array.isArray(msg.opp_cells) ? msg.opp_cells : null;
            if (yourCells || oppCells) {
              if (yourCells) setMyBoard((b) => applyChanges(makeEmptyBoard(rows, cols), yourCells));
              if (oppCells) setOppBoard((b) => applyChanges(makeEmptyBoard(rows, cols), oppCells));
            } else if (prevStatus !== 'playing' || (sStart != null && prevStarted != null && sStart !== prevStarted)) {
              setMyBoard(makeEmptyBoard(rows, cols));
              setOppBoard(makeEmptyBoard(rows, cols));
            }
          }
          setTotalSafe(rows * cols - mines);
          if (msg.status === 'playing') {
            setRematchWaiting(false);
            setRematchVoted(false);
            setOppRematchVoted(false);
            setRematchSecondsLeft(0);
            stopTimer();
            startTimer();
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
            if (msg.done && !finishedRef.current) {
              try {
                const iWon = !!msg.won;
                recordDailyProgress({ played: 1, won: iWon ? 1 : 0, lost: iWon ? 0 : 1, flags: 0, safe: Number(msg.safe || 0), timeSeconds: Number(msg.time_seconds || timer || 0), livesRemaining: lives, livesTotal: livesTotal, mode });
              } catch {}
              finishedRef.current = true;
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
          if (!finishedRef.current) {
            try {
              recordDailyProgress({ played: 1, won: iWon ? 1 : 0, lost: iWon ? 0 : 1, flags: 0, safe: safe, timeSeconds: timer, livesRemaining: lives, livesTotal: livesTotal, mode });
            } catch {}
            finishedRef.current = true;
          }
          setResultText(iWon ? t('game.youWon') : t('game.youLost'));
          setStatus(iWon ? 'won' : 'lost');
          stopTimer();
          setTimeout(() => setModalOpen(true), 600);
        }

        if (msg.type === 'rematch_wait') {
          setRematchWaiting(true);
          if (msg.who && msg.who !== playerName) setOppRematchVoted(true);
        }

        if (msg.type === 'rematch_start') {
          finishedRef.current = false;
          const sNow = typeof msg.server_now === 'number' ? msg.server_now : null;
          const sStart = typeof msg.started_at === 'number' ? msg.started_at : null;
          if (sNow != null) setServerOffset(sNow - Math.floor(Date.now() / 1000));
          if (sStart != null) setStartedAt(sStart);

          setWinner(null);
          setResultText(null);
          setStatus('playing');
          setModalOpen(false);
          setSubmitted(false);
          setCoinsAwarded(0);
          setRatingDelta(0);
          setRematchWaiting(false);
          setRematchVoted(false);
          setOppRematchVoted(false);
          setRematchSecondsLeft(0);
          setLives(livesTotal);
          setOppLives(livesTotal);
          setSafe(0);
          setOppSafe(0);
          setMyBoard(makeEmptyBoard(rows, cols));
          setOppBoard(makeEmptyBoard(rows, cols));
          stopTimer();
          startTimer();
        }
        },
      });

      wsRef.current = conn;
    };

    reconnectRef.current.stopped = false;
    reconnectRef.current.attempt = 0;
    connect();

    return () => {
      stopReconnect();
      clearPing();
      wsRef.current?.close?.();
      wsRef.current = null;
    };
  }, [lobbyCode, playerName, rows, cols, mines, livesTotal, opponent]);

  const revealCell = (r, c) => {
    if (status === 'won' || status === 'lost') return;
    const ready = wsRef.current?.ws?.readyState === WebSocket.OPEN;
    if (!ready) {
      return;
    }
    wsRef.current?.send?.({ type: 'open', r, c });
  };

  const flagCell = (r, c) => {
    if (status === 'won' || status === 'lost') return;
    const ready = wsRef.current?.ws?.readyState === WebSocket.OPEN;
    if (!ready) {
      return;
    }
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
        safe_revealed: safe,
        lives_remaining: lives,
        lives_total: livesTotal,
        won,
        lobby_code: lobbyCode || null,
      });
      const awarded = res.coins_awarded ?? 0;
      setCoinsAwarded(awarded);
      setRatingDelta(res.rating_delta ?? 0);
      if (Array.isArray(res?.new_unlocked) && res.new_unlocked.length > 0) {
        setNewUnlocked(res.new_unlocked);
      }
      onCoinsEarned?.(awarded);
      if (lobbyCode) {
        try { await submitLobbyResult(lobbyCode, { score, time_seconds: timer, won, lives_remaining: lives }); } catch {}
      }
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    }
  };

  const requestRematch = () => {
    if (rematchVoted) return;
    const ready = wsRef.current?.ws?.readyState === WebSocket.OPEN;
    setRematchWaiting(true);
    setRematchVoted(true);
    setRematchSecondsLeft(15);
    if (rematchTickRef.current) clearInterval(rematchTickRef.current);
    rematchTickRef.current = setInterval(() => {
      setRematchSecondsLeft((s) => {
        const n = Math.max(0, (Number(s) || 0) - 1);
        if (n <= 0 && rematchTickRef.current) {
          clearInterval(rematchTickRef.current);
          rematchTickRef.current = null;
        }
        return n;
      });
    }, 1000);

    if (ready) {
      wsRef.current?.send?.({ type: 'rematch' });
    } else {
      rematchSendRef.current.queued = true;
      setWsError((prev) => prev || 'Reconnecting...');
      if (rematchSendRef.current.t) clearTimeout(rematchSendRef.current.t);
      rematchSendRef.current.t = setTimeout(() => {
        rematchSendRef.current.t = null;
        const ok = wsRef.current?.ws?.readyState === WebSocket.OPEN;
        if (ok && rematchSendRef.current.queued) {
          try { wsRef.current?.send?.({ type: 'rematch' }); } catch {}
          rematchSendRef.current.queued = false;
        }
      }, 1200);
    }
    if (rematchTimeoutRef.current) clearTimeout(rematchTimeoutRef.current);
    rematchTimeoutRef.current = setTimeout(() => {
      rematchTimeoutRef.current = null;
      setRematchWaiting(false);
      setRematchVoted(false);
      setRematchSecondsLeft(0);
      onExit?.();
    }, 15000);
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col" data-testid="online-duel-screen">
      <AchievementBanner
        items={newUnlocked}
        onDone={() => setNewUnlocked([])}
        textForId={(id) => t(`achievements.items.${id}.title`)}
      />
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

        {wsErrorDisplay && (
          <div className="glass-panel rounded-xl px-5 py-4 border border-[#FF2A6D]/40" data-testid="ws-error">
            <div className="text-[10px] tracking-[0.25em] uppercase text-slate-500 font-display">// network</div>
            <div className="font-mono text-[12px] neon-coral">{wsErrorDisplay}</div>
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
                    disabled={status === 'won' || status === 'lost'} revealDelay={0} mineIcon={mineDef.icon} cellTheme={cellTheme} flagColor={flagDef.color} />
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
                    disabled={true} revealDelay={0} mineIcon={oppMineDef.icon} cellTheme={oppCellTheme} flagColor={oppFlagDef.color} />
                )))}
              </div>
            </div>
          </div>
        </div>

      </main>

      <GameOverModal open={modalOpen} won={status === 'won'} score={safe} time={timer}
        livesRemaining={lives} livesTotal={livesTotal} difficulty={difficulty}
        playerName={playerName} onSubmit={doSubmit} flags={0}
        onClose={() => setModalOpen(false)} onNewGame={requestRematch} onExit={onExit}
        submitted={submitted} coinsAwarded={coinsAwarded} ratingDelta={ratingDelta}
        rematchWaiting={rematchWaiting} rematchVoted={rematchVoted} oppRematchVoted={oppRematchVoted} rematchSecondsLeft={rematchSecondsLeft}
        noSubmit={false} mode={mode} lobbyResult={null} opponent={opponent} levelId={null}
      />
    </div>
  );
}
