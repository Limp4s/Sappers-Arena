import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { ArrowLeft, ShieldAlert, Infinity as InfinityIcon, Swords } from 'lucide-react';
import { createEmptyBoard, placeMines, floodReveal, calculateScore } from '../../lib/game';
import { sfx } from '../../lib/sounds';
import { Cell, StatsBar, GameOverModal } from './GameParts';
import { computeStars, recordLevelResult } from '../../lib/levels';
import { submitScore, sessionHeaders } from '../../lib/player';
import { MINE_ICONS, CELL_THEMES, FX_EFFECTS, loadEquipped } from '../../lib/shop';
import { submitLobbyResult, createSeededRandom, getLobby } from '../../lib/lobby';
import { recordDailyProgress } from '../../lib/dailies';
import { t, useLang } from '../../lib/i18n';
import AchievementBanner from '../ui/AchievementBanner';

export default function MinesweeperGame({ config, onCoinsEarned }) {
  const {
    rows, cols, mines, lives: livesTotal, mode, difficulty, levelId, label,
    onExit, player, infiniteLives, lobbyCode, seed, opponent,
  } = config;
  const playerName = player?.nick;
  const theme = loadEquipped(playerName);
  const mineDef = MINE_ICONS[theme.mine] || MINE_ICONS.mine_default;
  const cellTheme = CELL_THEMES[theme.cell] || CELL_THEMES.cell_default;
  const fxDef = FX_EFFECTS[theme.fx] || FX_EFFECTS.fx_default;

  const [board, setBoard] = useState(() => createEmptyBoard(rows, cols));
  const [minesPlaced, setMinesPlaced] = useState(false);
  const [lives, setLives] = useState(livesTotal);
  const [flagsCount, setFlagsCount] = useState(0);
  const [safeRevealed, setSafeRevealed] = useState(0);
  const [status, setStatus] = useState('idle');
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [explosionFx, setExplosionFx] = useState(null);
  const [victory, setVictory] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [coinsAwarded, setCoinsAwarded] = useState(0);
  const [ratingDelta, setRatingDelta] = useState(0);
  const [lobbyResult, setLobbyResult] = useState(null);
  const [newUnlocked, setNewUnlocked] = useState([]);
  const [flagMode, setFlagMode] = useState(false);
  useLang();
  const timerRef = useRef(null);

  const totalSafe = rows * cols - mines;
  const displayLives = infiniteLives ? 99 : livesTotal;

  const countRevealedSafe = useCallback((b) => {
    let n = 0;
    for (let rr = 0; rr < b.length; rr++) {
      const row = b[rr];
      for (let cc = 0; cc < row.length; cc++) {
        const cl = row[cc];
        if (cl && cl.revealed && !cl.mine) n++;
      }
    }
    return n;
  }, []);

  useEffect(() => {
    if (status === 'playing') {
      timerRef.current = setInterval(() => setTimer((t) => Math.min(t + 1, 999)), 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [status]);

  // Poll lobby for opponent result if in lobby mode
  useEffect(() => {
    if (!lobbyCode || status !== 'won' && status !== 'lost') return;
    if (!lobbyCode || !(status === 'won' || status === 'lost')) return;
    let stopped = false;
    const t = setInterval(async () => {
      try {
        const lob = await getLobby(lobbyCode);
        if (stopped) return;
        const mine = lob.host === playerName ? lob.host_result : lob.guest_result;
        const opp = lob.host === playerName ? lob.guest_result : lob.host_result;
        if (mine && opp) {
          setLobbyResult({ mine, opp });
          clearInterval(t);
        }
      } catch {}
    }, 1500);
    return () => { stopped = true; clearInterval(t); };
  }, [lobbyCode, status, playerName]);

  const reset = useCallback(() => {
    setBoard(createEmptyBoard(rows, cols));
    setMinesPlaced(false); setLives(livesTotal); setFlagsCount(0); setSafeRevealed(0);
    setStatus('idle'); setTimer(0); setScore(0); setShaking(false);
    setExplosionFx(null);
    setVictory(false); setModalOpen(false); setSubmitted(false);
    setCoinsAwarded(0); setRatingDelta(0); setLobbyResult(null);
    setFlagMode(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [rows, cols, livesTotal]);

  const endGame = useCallback((won, finalBoard, finalSafe, finalLives) => {
    setStatus(won ? 'won' : 'lost');
    if (timerRef.current) clearInterval(timerRef.current);
    const finalScore = calculateScore({ difficulty, safeRevealed: finalSafe, timeSeconds: timer, livesRemaining: finalLives, won });
    setScore(finalScore);

    try {
      recordDailyProgress({
        played: 1,
        won: won ? 1 : 0,
        lost: won ? 0 : 1,
        flags: flagsCount,
        safe: finalSafe,
        timeSeconds: timer,
        livesRemaining: finalLives,
        livesTotal: livesTotal,
        mode,
      });
    } catch {}

    if (won) {
      setVictory(true); sfx.victory();
      if (mode === 'campaign' && levelId != null) {
        const stars = computeStars(finalLives, livesTotal);
        recordLevelResult(levelId, { stars, score: finalScore, time: timer, won: true });
      }
    } else {
      sfx.gameOver();
      if (mode === 'campaign' && levelId != null) {
        recordLevelResult(levelId, { stars: 0, score: 0, time: timer, won: false });
      }
    }
    const revealed = finalBoard.map((row) => row.map((c) => ({ ...c, revealed: c.mine ? true : c.revealed })));
    setBoard(revealed);
    setTimeout(() => setModalOpen(true), 900);
  }, [difficulty, timer, mode, levelId, livesTotal, flagsCount]);

  const revealCell = (r, c) => {
    if (status === 'won' || status === 'lost') return;
    const cell = board[r][c];
    if (cell.revealed || cell.flagged) return;

    let workingBoard = board.map((row) => row.map((cl) => ({ ...cl })));

    if (!minesPlaced) {
      const rng = seed != null ? createSeededRandom(seed) : Math.random;
      workingBoard = placeMines(workingBoard, mines, r, c, rng);
      setMinesPlaced(true); setStatus('playing');
    }

    const target = workingBoard[r][c];
    if (target.mine) {
      target.revealed = true; target.exploded = true;
      const newLives = infiniteLives ? lives : lives - 1;
      if (!infiniteLives) setLives(newLives);
      sfx.explosion();

      try {
        const el = document.querySelector(`[data-testid="grid-cell-${r}-${c}"]`);
        if (el) {
          const rect = el.getBoundingClientRect();
          setExplosionFx({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
        } else {
          setExplosionFx({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        }
      } catch {
        setExplosionFx({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      }

      setShaking(true);
      setTimeout(() => setShaking(false), 520);
      setTimeout(() => { setExplosionFx(null); }, 620);
      if (!infiniteLives && newLives <= 0) { endGame(false, workingBoard, safeRevealed, 0); return; }
      sfx.lifeLost(); setBoard(workingBoard); return;
    }

    const revealedNow = floodReveal(workingBoard, r, c);
    const newSafeCount = countRevealedSafe(workingBoard);
    setSafeRevealed(newSafeCount);
    setBoard(workingBoard);
    sfx.reveal();
    setScore(calculateScore({ difficulty, safeRevealed: newSafeCount, timeSeconds: timer, livesRemaining: lives, won: false }));
    if (newSafeCount >= totalSafe) endGame(true, workingBoard, newSafeCount, lives);
  };

  const flagCell = (r, c) => {
    if (status === 'won' || status === 'lost') return;
    const cell = board[r][c];
    if (cell.revealed) return;
    const next = board.map((row) => row.map((cl) => ({ ...cl })));
    next[r][c].flagged = !next[r][c].flagged;
    setFlagsCount((f) => f + (next[r][c].flagged ? 1 : -1));
    if (next[r][c].flagged) sfx.flag(); else sfx.unflag();
    setBoard(next);
  };

  const doSubmit = async () => {
    if (!playerName) return;
    try {
      const res = await submitScore({
        player_name: playerName, difficulty, mode,
        level_id: levelId ?? null, rows, cols, mines,
        flags: flagsCount,
        score, time_seconds: timer,
        safe_revealed: safeRevealed,
        lives_remaining: lives, lives_total: livesTotal,
        won: status === 'won',
        lobby_code: lobbyCode || null,
      });
      const awarded = res.coins_awarded ?? 0;
      setCoinsAwarded(awarded);
      setRatingDelta(res.rating_delta ?? 0);
      if (Array.isArray(res?.new_unlocked) && res.new_unlocked.length > 0) {
        setNewUnlocked(res.new_unlocked);
      }
      if (onCoinsEarned) onCoinsEarned(awarded);
      if (lobbyCode) {
        try { await submitLobbyResult(lobbyCode, { score, time_seconds: timer, won: status === 'won', lives_remaining: lives }); } catch {}
      }
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    }
  };

  const minesLeft = Math.max(0, mines - flagsCount);
  const gridStyle = { display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: '3px' };
  const fxColor = fxDef.color === 'rainbow'
    ? 'radial-gradient(ellipse at center, rgba(255,215,0,0.5), rgba(0,229,255,0.4), rgba(255,42,109,0.5), transparent 70%)'
    : `radial-gradient(ellipse at center, ${fxDef.color.replace(/0\.\d+/, '0.8')}, transparent 70%)`;

  return (
    <div className="min-h-screen w-full relative flex flex-col" data-testid="game-screen">
      <AchievementBanner
        items={newUnlocked}
        onDone={() => setNewUnlocked([])}
        textForId={(id) => t(`achievements.items.${id}.title`)}
      />
      {explosionFx && (
        <>
          {(() => {
            const x = explosionFx.x;
            const y = explosionFx.y;
            return (
              <>
                <div
                  className="explosion-flash"
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    background: fxColor,
                  }}
                  data-testid="fx-flash"
                />
              </>
            );
          })()}
        </>
      )}

      <header className="relative z-10 max-w-[1600px] mx-auto w-full px-4 md:px-6 pt-5 pb-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <button onClick={onExit} className="neon-btn flex items-center gap-2" data-testid="exit-game-btn">
            <ArrowLeft size={14} /> {t('common.exit')}
          </button>
          <div className="flex items-center gap-3">
            <ShieldAlert size={22} className="neon-cyan" />
            <div>
              <div className="font-display text-xl font-black tracking-tight neon-cyan leading-none">
                {label || t('game.defaultLabel')}
              </div>
              <div className="text-[9px] tracking-[0.3em] uppercase text-slate-500 font-display mt-1">
                // {mode.toUpperCase()} · {rows}×{cols} · {mines} {t('game.minesLower')} · {infiniteLives ? '∞' : livesTotal} {t('game.livesLower')}
                {opponent && <> · {t('common.vs')} <span className="neon-coral">{opponent}</span></>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {opponent && <div className="pill flex items-center gap-1 text-[10px]"><Swords size={11} /> {opponent}</div>}
            {infiniteLives && <div className="pill pill-active flex items-center gap-1" data-testid="infinite-lives-badge"><InfinityIcon size={12} /> {t('common.admin')}</div>}
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-[1600px] mx-auto w-full px-4 md:px-6 pb-8 flex flex-col gap-4">
        <StatsBar timer={timer} lives={lives} livesTotal={displayLives} score={score} minesLeft={minesLeft}
          onReset={reset} infiniteLives={infiniteLives}
          flagMode={flagMode} onToggleFlagMode={() => setFlagMode((v) => !v)} />

        <div className={`glass-panel rounded-xl p-4 md:p-6 flex-1 flex items-center justify-center relative overflow-hidden ${shaking ? 'shake' : ''}`}
          style={{ borderColor: `${cellTheme.accent}33` }}>
          <div className="w-full" style={{ maxWidth: `min(100%, ${cols * 48}px)` }} data-testid="game-grid">
            <div style={gridStyle}>
              {board.map((row, r) =>
                row.map((cell, c) => (
                  <Cell key={`${r}-${c}`} cell={cell} r={r} c={c}
                    onReveal={revealCell} onFlag={flagCell}
                    disabled={status === 'won' || status === 'lost'}
                    revealDelay={Math.min(300, (r + c) * 4)}
                    mineIcon={mineDef.icon} cellTheme={cellTheme}
                    flagMode={flagMode}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="text-[10px] tracking-[0.25em] uppercase text-slate-500 font-display text-center">
          {t('game.controlsHint')}
        </div>
      </main>

      <GameOverModal open={modalOpen} won={status === 'won'} score={score} time={timer}
        livesRemaining={lives} livesTotal={displayLives} difficulty={difficulty}
        playerName={playerName} onSubmit={doSubmit} flags={flagsCount}
        onClose={() => setModalOpen(false)} onNewGame={reset} onExit={onExit}
        submitted={submitted} coinsAwarded={coinsAwarded} ratingDelta={ratingDelta}
        noSubmit={false} mode={mode} lobbyResult={lobbyResult} opponent={opponent} levelId={levelId}
      />
    </div>
  );
}
