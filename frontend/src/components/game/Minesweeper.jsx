import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import { ArrowLeft, ShieldAlert, Infinity as InfinityIcon, Swords } from 'lucide-react';
import { createEmptyBoard, placeMines, floodReveal, calculateScore } from '../../lib/game';
import { sfx } from '../../lib/sounds';
import { Cell, StatsBar, GameOverModal } from './GameParts';
import { computeStars, recordLevelResult } from '../../lib/levels';
import { submitScore, sessionHeaders } from '../../lib/player';
import { MINE_ICONS, CELL_THEMES, FX_EFFECTS, FLAG_SKINS, loadEquipped } from '../../lib/shop';
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
  const tutorialStorageKey = useMemo(() => {
    const base = 'mg_tutorial_lvl1_done_v1';
    try {
      const nick = (playerName || '').trim().toLowerCase();
      if (nick) return `${base}:${nick}`;
    } catch {}
    return base;
  }, [playerName]);
  const theme = loadEquipped(playerName);
  const mineDef = MINE_ICONS[theme.mine] || MINE_ICONS.mine_default;
  const cellTheme = CELL_THEMES[theme.cell] || CELL_THEMES.cell_default;
  const fxDef = FX_EFFECTS[theme.fx] || FX_EFFECTS.fx_default;
  const flagDef = FLAG_SKINS[theme.flag] || FLAG_SKINS.flag_default;

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
  const tutorialEnabled = (mode === 'campaign' && Number(levelId) === 1);

  const [tutorialStep, setTutorialStep] = useState(() => (tutorialEnabled ? 0 : null));
  const [tutorialOneCell, setTutorialOneCell] = useState(null);
  const [tutorialOneRect, setTutorialOneRect] = useState(null);
  const [tutorialMineCell, setTutorialMineCell] = useState(null);
  const [tutorialMineRect, setTutorialMineRect] = useState(null);
  const [tutorialProofRects, setTutorialProofRects] = useState([]);
  const [tutorialHintCell, setTutorialHintCell] = useState(null);
  const [tutorialHintRect, setTutorialHintRect] = useState(null);
  const [tutorialHintNeighborRects, setTutorialHintNeighborRects] = useState([]);
  const [tutorialExplained, setTutorialExplained] = useState(() => ({}));
  const [tutorialExplainedNums, setTutorialExplainedNums] = useState(() => ({}));
  const [tutorialHintsStarted, setTutorialHintsStarted] = useState(false);
  const [tutorialSkipConfirm, setTutorialSkipConfirm] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  useLang();
  const timerRef = useRef(null);
  const tutorialTimerRef = useRef(null);
  const tutorialContainerRef = useRef(null);

  useEffect(() => {
    if (!tutorialEnabled) {
      setTutorialStep(null);
      return;
    }
    setTutorialStep(0);
    setTutorialOneCell(null);
    setTutorialOneRect(null);
    setTutorialMineCell(null);
    setTutorialMineRect(null);
    setTutorialProofRects([]);
    setTutorialHintCell(null);
    setTutorialHintRect(null);
    setTutorialHintNeighborRects([]);
    setTutorialExplained({});
    setTutorialExplainedNums({});
    setTutorialHintsStarted(false);
    setTutorialSkipConfirm(false);
    setTutorialCompleted(false);
  }, [tutorialEnabled, levelId]);

  const onContinue = useCallback(() => {
    setTutorialCompleted(false);
    setModalOpen(false);
    try { onExit?.(); } catch {}
  }, [onExit]);

  useEffect(() => {
    if (tutorialStep !== 3 || !tutorialOneCell) return;
    const compute = () => {
      try {
        const el = document.querySelector(`[data-testid="grid-cell-${tutorialOneCell.r}-${tutorialOneCell.c}"]`);
        const cont = tutorialContainerRef.current;
        if (!el || !cont) return;
        const r1 = el.getBoundingClientRect();
        const r2 = cont.getBoundingClientRect();
        setTutorialOneRect({
          left: r1.left - r2.left,
          top: r1.top - r2.top,
          width: r1.width,
          height: r1.height,
        });
      } catch {}
    };
    compute();
    const onResize = () => compute();
    const onScroll = () => compute();
    try { window.addEventListener('resize', onResize); } catch {}
    try { window.addEventListener('scroll', onScroll, true); } catch {}
    return () => {
      try { window.removeEventListener('resize', onResize); } catch {}
      try { window.removeEventListener('scroll', onScroll, true); } catch {}
    };
  }, [tutorialStep, tutorialOneCell]);

  useEffect(() => {
    if (tutorialStep !== 4 || !tutorialMineCell) return;
    const compute = () => {
      try {
        const cont = tutorialContainerRef.current;
        if (!cont) return;

        const mineEl = document.querySelector(`[data-testid="grid-cell-${tutorialMineCell.r}-${tutorialMineCell.c}"]`);
        if (mineEl) {
          const r1 = mineEl.getBoundingClientRect();
          const r2 = cont.getBoundingClientRect();
          setTutorialMineRect({ left: r1.left - r2.left, top: r1.top - r2.top, width: r1.width, height: r1.height });
        }

        const proof = [];
        const around = tutorialMineCell?.around || [];
        around.forEach(({ r, c }) => {
          const el = document.querySelector(`[data-testid="grid-cell-${r}-${c}"]`);
          if (!el) return;
          const rr = el.getBoundingClientRect();
          const cr = cont.getBoundingClientRect();
          proof.push({ left: rr.left - cr.left, top: rr.top - cr.top, width: rr.width, height: rr.height });
        });
        setTutorialProofRects(proof);
      } catch {}
    };
    compute();
    const onResize = () => compute();
    const onScroll = () => compute();
    try { window.addEventListener('resize', onResize); } catch {}
    try { window.addEventListener('scroll', onScroll, true); } catch {}
    return () => {
      try { window.removeEventListener('resize', onResize); } catch {}
      try { window.removeEventListener('scroll', onScroll, true); } catch {}
    };
  }, [tutorialStep, tutorialMineCell]);

  useEffect(() => {
    if (tutorialStep !== 5 || !tutorialHintCell) return;
    const compute = () => {
      try {
        const cont = tutorialContainerRef.current;
        if (!cont) return;
        const cellEl = document.querySelector(`[data-testid="grid-cell-${tutorialHintCell.r}-${tutorialHintCell.c}"]`);
        if (cellEl) {
          const r1 = cellEl.getBoundingClientRect();
          const r2 = cont.getBoundingClientRect();
          setTutorialHintRect({ left: r1.left - r2.left, top: r1.top - r2.top, width: r1.width, height: r1.height });
        }
        const neigh = [];
        const r0 = tutorialHintCell.r;
        const c0 = tutorialHintCell.c;
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const rr = r0 + dr;
          const cc = c0 + dc;
          if (rr < 0 || rr >= rows || cc < 0 || cc >= cols) continue;
          const el = document.querySelector(`[data-testid="grid-cell-${rr}-${cc}"]`);
          if (!el) continue;
          const r1 = el.getBoundingClientRect();
          const r2 = cont.getBoundingClientRect();
          neigh.push({ left: r1.left - r2.left, top: r1.top - r2.top, width: r1.width, height: r1.height });
        }
        setTutorialHintNeighborRects(neigh);
      } catch {}
    };
    compute();
    const onResize = () => compute();
    const onScroll = () => compute();
    try { window.addEventListener('resize', onResize); } catch {}
    try { window.addEventListener('scroll', onScroll, true); } catch {}
    return () => {
      try { window.removeEventListener('resize', onResize); } catch {}
      try { window.removeEventListener('scroll', onScroll, true); } catch {}
    };
  }, [tutorialStep, tutorialHintCell, rows, cols]);

  const totalSafe = rows * cols - mines;
  const displayLives = infiniteLives ? 99 : livesTotal;

  const tutorialMode = useMemo(() => tutorialEnabled, [tutorialEnabled]);
  const effectiveMines = useMemo(() => {
    if (!tutorialMode) return mines;
    // Tutorial should be easier: fewer bombs.
    return Math.max(5, Math.min(mines, Math.floor(Number(mines || 0) * 0.6)));
  }, [tutorialMode, mines]);
  const displayLabel = tutorialMode ? 'TUTORIAL' : (label || t('game.defaultLabel'));

  const markTutorialDone = useCallback(() => {
    try { localStorage.setItem(tutorialStorageKey, '1'); } catch {}
  }, [tutorialStorageKey]);

  const recomputeAdjacent = (b) => {
    const rr = b.length;
    const cc = b[0]?.length || 0;
    for (let r = 0; r < rr; r++) for (let c = 0; c < cc; c++) {
      if (b[r][c].mine) { b[r][c].adjacent = 0; continue; }
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rr && nc >= 0 && nc < cc && b[nr][nc].mine) count++;
      }
      b[r][c].adjacent = count;
    }
  };

  const pickNextHintCell = useCallback((b, explainedMap) => {
    try {
      const explained = explainedMap && typeof explainedMap === 'object' ? explainedMap : {};
      for (let rr = 0; rr < b.length; rr++) {
        for (let cc = 0; cc < b[rr].length; cc++) {
          const cl = b[rr][cc];
          if (!cl?.revealed || cl?.mine) continue;
          const adj = Number(cl?.adjacent || 0);
          if (adj <= 0) continue;
          const key = `${rr},${cc}`;
          if (explained[key]) continue;
          return { r: rr, c: cc, adjacent: adj };
        }
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const pickNextHintNumberCell = useCallback((b, explainedNumsMap) => {
    try {
      const explainedNums = explainedNumsMap && typeof explainedNumsMap === 'object' ? explainedNumsMap : {};
      for (let rr = 0; rr < b.length; rr++) {
        for (let cc = 0; cc < b[rr].length; cc++) {
          const cl = b[rr][cc];
          if (!cl?.revealed || cl?.mine) continue;
          const adj = Number(cl?.adjacent || 0);
          if (adj <= 0) continue;
          if (explainedNums[String(adj)]) continue;
          return { r: rr, c: cc, adjacent: adj };
        }
      }
      return null;
    } catch {
      return null;
    }
  }, []);

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

  const countRevealedAll = useCallback((b) => {
    let n = 0;
    for (let rr = 0; rr < b.length; rr++) {
      const row = b[rr];
      for (let cc = 0; cc < row.length; cc++) {
        const cl = row[cc];
        if (cl && cl.revealed) n++;
      }
    }
    return n;
  }, []);

  useEffect(() => {
    if (tutorialMode) return;
    if (status === 'playing') {
      timerRef.current = setInterval(() => setTimer((t) => Math.min(t + 1, 999)), 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [status, tutorialMode]);

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
    setTutorialOneCell(null);
    setTutorialOneRect(null);
    setTutorialMineCell(null);
    setTutorialMineRect(null);
    setTutorialProofRects([]);
    setTutorialHintCell(null);
    setTutorialHintRect(null);
    setTutorialHintNeighborRects([]);
    setTutorialExplained({});
    setTutorialExplainedNums({});
    setTutorialHintsStarted(false);
    setTutorialSkipConfirm(false);
    setTutorialCompleted(false);
    if (tutorialEnabled) setTutorialStep(0);
    if (tutorialTimerRef.current) clearTimeout(tutorialTimerRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [rows, cols, livesTotal, tutorialEnabled]);

  const endGame = useCallback((won, finalBoard, finalSafe, finalLives) => {
    setStatus(won ? 'won' : 'lost');
    if (timerRef.current) clearInterval(timerRef.current);
    const finalScore = tutorialMode ? 0 : calculateScore({ difficulty, safeRevealed: finalSafe, timeSeconds: timer, livesRemaining: finalLives, won });
    setScore(finalScore);

    try {
      if (!tutorialMode) {
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
      }
    } catch {}

    if (won) {
      setVictory(true); sfx.victory();
      if (mode === 'campaign' && levelId != null) {
        if (!tutorialMode) {
          const stars = computeStars(finalLives, livesTotal);
          recordLevelResult(levelId, { stars, score: finalScore, time: timer, won: true });
        }
      }
    } else {
      if (!tutorialMode) {
        sfx.gameOver();
        if (mode === 'campaign' && levelId != null) {
          recordLevelResult(levelId, { stars: 0, score: 0, time: timer, won: false });
        }
      }
    }
    const revealed = finalBoard.map((row) => row.map((c) => ({ ...c, revealed: c.mine ? true : c.revealed })));
    setBoard(revealed);
    setTimeout(() => {
      if (tutorialMode && won) {
        try { markTutorialDone(); } catch {}
        setTutorialCompleted(true);
      } else {
        setModalOpen(true);
      }
    }, 900);
  }, [difficulty, timer, mode, levelId, livesTotal, flagsCount, tutorialMode, markTutorialDone]);

  const revealCell = (r, c) => {
    if (status === 'won' || status === 'lost') return;
    const cell = board[r][c];
    if (cell.revealed || cell.flagged) return;

    if (tutorialStep === 0) {
      setTutorialStep(1);
    }

    let workingBoard = board.map((row) => row.map((cl) => ({ ...cl })));

    if (!minesPlaced) {
      const rng = seed != null ? createSeededRandom(seed) : Math.random;
      workingBoard = placeMines(workingBoard, effectiveMines, r, c, rng);
      setMinesPlaced(true); setStatus('playing');
    }

    const target = workingBoard[r][c];
    if (target.mine) {
      if (tutorialMode) {
        // Tutorial can't be failed: allow clicking mines without losing.
        target.revealed = true;
        setBoard(workingBoard);
        try { sfx.explosion(); } catch {}
        return;
      }

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
    if (!tutorialMode) {
      setScore(calculateScore({ difficulty, safeRevealed: newSafeCount, timeSeconds: timer, livesRemaining: lives, won: false }));
    }

    const totalSafeEff = rows * cols - effectiveMines;
    if (newSafeCount >= totalSafeEff) endGame(true, workingBoard, newSafeCount, lives);
    else if (tutorialMode) {
      const allRevealed = countRevealedAll(workingBoard);
      if (allRevealed >= rows * cols) endGame(true, workingBoard, newSafeCount, lives);
    }
  };

  const flagCell = (r, c) => {
    if (status === 'won' || status === 'lost') return;
    const cell = board[r][c];
    if (cell.revealed) return;
    const next = board.map((row) => row.map((cl) => ({ ...cl })));
    next[r][c].flagged = !next[r][c].flagged;
    setFlagsCount((f) => {
      const nf = f + (next[r][c].flagged ? 1 : -1);
      // After the first flag in tutorial, start guided hints ONCE.
      if (tutorialMode && !tutorialHintsStarted && tutorialStep == null && nf >= 1) {
        try {
          const pick = pickNextHintNumberCell(next, tutorialExplainedNums);
          if (pick) {
            setTutorialHintCell(pick);
            setTutorialStep(5);
            setTutorialHintsStarted(true);
          }
        } catch {}
      }
      return nf;
    });
    if (next[r][c].flagged) sfx.flag(); else sfx.unflag();
    setBoard(next);
  };

  const doSubmit = async () => {
    if (tutorialMode) {
      setSubmitted(true);
      return;
    }
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

  const minesLeft = Math.max(0, effectiveMines - flagsCount);
  const gridStyle = { display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: '3px' };
  const fxClass = fxDef.color === 'rainbow_premium'
    ? 'explosion-flash fx-rainbow-premium'
    : (fxDef.color === 'gold_premium'
      ? 'explosion-flash fx-gold-premium'
      : (fxDef.color === 'ice_premium'
        ? 'explosion-flash fx-ice-premium'
        : (fxDef.color === 'fire_premium' ? 'explosion-flash fx-fire-premium' : 'explosion-flash')));
  const fxColor = fxDef.color === 'rainbow_premium'
    ? 'linear-gradient(90deg, #00E5FF, #00FF9D, #FFD700, #FF2A6D, #A855F7, #00E5FF)'
    : (fxDef.color === 'gold_premium'
      ? 'linear-gradient(90deg, #7a5b18, #d4af37, #ffec8b, #d4af37, #7a5b18)'
      : (fxDef.color === 'ice_premium'
        ? 'linear-gradient(90deg, #0ea5e9, #67e8f9, #e0f2fe, #67e8f9, #0ea5e9)'
        : (fxDef.color === 'fire_premium'
          ? 'linear-gradient(90deg, #7c2d12, #fb923c, #fbbf24, #ef4444, #fb923c, #7c2d12)'
          : (fxDef.color === 'rainbow'
            ? 'radial-gradient(ellipse at center, rgba(255,215,0,0.5), rgba(0,229,255,0.4), rgba(255,42,109,0.5), transparent 70%)'
            : `radial-gradient(ellipse at center, ${fxDef.color.replace(/0\.\d+/, '0.8')}, transparent 70%)`))));

  return (
    <div className="min-h-screen w-full relative flex flex-col" style={{ minHeight: '100dvh' }} data-testid="game-screen" onContextMenu={(e) => e.preventDefault()}>
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
                  className={fxClass}
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
                {displayLabel}
              </div>
              <div className="text-[9px] tracking-[0.3em] uppercase text-slate-500 font-display mt-1">
                {mode.toUpperCase()} · {rows}×{cols} · {mines} {t('game.minesLower')} · {infiniteLives ? '∞' : livesTotal} {t('game.livesLower')}
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
        {tutorialMode ? (
          <div className="glass-panel rounded-xl px-5 py-4 flex flex-wrap items-center justify-between gap-4" data-testid="tutorial-bar">
            <div>
              <div className="text-[9px] tracking-[0.25em] uppercase text-slate-400 font-display">{t('game.mines')}</div>
              <div className="text-xl font-mono font-bold neon-coral leading-none mt-0.5">{String(minesLeft).padStart(3, '0')}</div>
            </div>
            <div className="flex items-center gap-2">
              {tutorialStep != null && (
                <button className="neon-btn px-4 py-2 text-[11px] md:hidden" onClick={() => setTutorialSkipConfirm(true)} type="button" data-testid="tutorial-skip-btn">
                  {t('onboarding.skip')}
                </button>
              )}
              <button className={`neon-btn flex items-center gap-2 ${flagMode ? 'neon-btn-gold' : ''}`}
                onClick={() => setFlagMode((v) => !v)} type="button" data-testid="flag-mode-btn">
                {t('game.flag')}
              </button>
              <button className="neon-btn flex items-center gap-2" onClick={reset} data-testid="reset-btn" type="button">
                {t('game.reset')}
              </button>
            </div>
          </div>
        ) : (
          <StatsBar timer={timer} lives={lives} livesTotal={displayLives} score={score} minesLeft={minesLeft}
            onReset={reset} infiniteLives={infiniteLives}
            flagMode={flagMode} onToggleFlagMode={() => setFlagMode((v) => !v)} />
        )}

        {tutorialMode && tutorialStep != null && tutorialSkipConfirm && (
          <div className="md:hidden fixed left-1/2 top-[88px] -translate-x-1/2 z-[80] pointer-events-auto">
            <div className="glass-panel rounded-xl px-4 py-3 border border-white/20 w-[92vw] max-w-[360px]">
              <div className="text-[12px] font-mono text-slate-200">{t('tutorial.skipConfirm')}</div>
              <div className="mt-3 flex gap-2">
                <button className="neon-btn neon-btn-coral flex-1" onClick={() => setTutorialSkipConfirm(false)} type="button">{t('common.no')}</button>
                <button className="neon-btn flex-1" onClick={() => {
                  try { markTutorialDone(); } catch {}
                  setTutorialSkipConfirm(false);
                  setTutorialStep(null);
                }} type="button">{t('common.yes')}</button>
              </div>
            </div>
          </div>
        )}

        <div ref={tutorialContainerRef} className={`glass-panel rounded-xl p-4 md:p-6 flex-1 flex items-center justify-center relative overflow-hidden ${shaking ? 'shake' : ''} ${tutorialStep != null ? 'md:pl-[440px]' : ''}`}
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
                    flagColor={flagDef.color}
                    flagMode={flagMode}
                  />
                ))
              )}
            </div>
          </div>

          {tutorialStep != null && (
            <div className="absolute inset-0 z-30 pointer-events-none">
              <div className="hidden md:block absolute top-4 right-4 pointer-events-auto">
                <button
                  className="neon-btn px-4 py-2 text-[11px]"
                  onClick={() => {
                    try { markTutorialDone(); } catch {}
                    setTutorialStep(null);
                  }}
                >{t('onboarding.skip')}</button>
              </div>

              {tutorialStep === 0 && (
                <div className="absolute left-4 right-4 bottom-4 md:left-6 md:right-auto md:top-1/2 md:bottom-auto md:-translate-y-1/2 max-w-[360px] glass-panel rounded-xl p-5 border border-[#00E5FF]/30">
                  <div className="text-[12px] font-mono text-slate-200">{t('tutorial.step0')}</div>
                </div>
              )}

              {tutorialStep === 1 && (
                <div className="absolute left-4 right-4 bottom-4 md:left-6 md:right-auto md:top-1/2 md:bottom-auto md:-translate-y-1/2 max-w-[420px] glass-panel rounded-xl p-5 border border-[#00FF9D]/30">
                  <div className="text-[12px] font-mono text-slate-200">{t('tutorial.step1')}</div>
                  <div className="mt-4 flex gap-2 pointer-events-auto">
                    <button className="neon-btn px-4 py-2 text-[11px]" onClick={() => setTutorialStep(2)}>{t('common.continue')}</button>
                  </div>
                </div>
              )}

              {tutorialStep === 2 && (
                <div className="absolute left-4 right-4 bottom-4 md:left-6 md:right-auto md:top-1/2 md:bottom-auto md:-translate-y-1/2 max-w-[520px] glass-panel rounded-xl p-5 border border-[#00E5FF]/30">
                  <div className="text-[12px] font-mono text-slate-200">{t('tutorial.step2')}</div>
                  <div className="mt-4 flex gap-2 pointer-events-auto">
                    <button className="neon-btn px-4 py-2 text-[11px]" onClick={() => {
                      try {
                        // Find a revealed numbered cell (prefer "1", otherwise smallest > 0) and point at it.
                        const b = board;
                        let pick = null;
                        let bestAdj = Infinity;
                        for (let rr = 0; rr < b.length; rr++) {
                          for (let cc = 0; cc < b[rr].length; cc++) {
                            const cl = b[rr][cc];
                            if (!cl?.revealed || cl?.mine) continue;
                            const adj = Number(cl?.adjacent || 0);
                            if (adj <= 0) continue;
                            if (adj === 1) { pick = { r: rr, c: cc }; bestAdj = 1; break; }
                            if (adj < bestAdj) { bestAdj = adj; pick = { r: rr, c: cc }; }
                          }
                          if (bestAdj === 1) break;
                        }
                        if (pick) {
                          setTutorialOneCell(pick);
                          setTutorialStep(3);
                        }
                      } catch {}
                    }}>{t('common.continue')}</button>
                  </div>
                </div>
              )}

              {tutorialStep === 3 && tutorialOneCell && tutorialOneRect && (
                <div
                  className="absolute rounded-lg border-2 border-[#FFD700]/70"
                  style={{
                    left: `${tutorialOneRect.left}px`,
                    top: `${tutorialOneRect.top}px`,
                    width: `${tutorialOneRect.width}px`,
                    height: `${tutorialOneRect.height}px`,
                    boxShadow: '0 0 16px rgba(255,215,0,0.35)',
                  }}
                />
              )}

              {tutorialStep === 3 && tutorialOneCell && tutorialOneRect && (
                <svg className="absolute inset-0" style={{ width: '100%', height: '100%' }}>
                  <line
                    x1="35%"
                    y1="50%"
                    x2={tutorialOneRect.left + tutorialOneRect.width / 2}
                    y2={tutorialOneRect.top + tutorialOneRect.height / 2}
                    stroke="rgba(255,255,255,0.95)"
                    strokeWidth="2"
                  />
                </svg>
              )}

              {tutorialStep === 3 && tutorialOneCell && (
                <div className="absolute left-4 right-4 bottom-4 md:left-6 md:right-auto md:top-1/2 md:bottom-auto md:-translate-y-1/2 max-w-[560px] glass-panel rounded-xl p-5 border border-[#FFD700]/30">
                  <div className="text-[12px] font-mono text-slate-200">{t('tutorial.step3a')}<span className="neon-gold font-bold">{t('tutorial.step3b')}</span>{t('tutorial.step3c')}</div>
                  <div className="mt-3 flex gap-2 pointer-events-auto">
                    <button
                      className="neon-btn px-4 py-2 text-[11px]"
                      onClick={() => {
                        try {
                          const b = board.map((row) => row.map((cl) => ({ ...cl })));
                          const one = tutorialOneCell;
                          const cand = [];
                          for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
                            if (dr === 0 && dc === 0) continue;
                            const rr = one.r + dr;
                            const cc = one.c + dc;
                            if (rr < 0 || rr >= b.length || cc < 0 || cc >= b[0].length) continue;
                            if (b[rr][cc].revealed) continue;
                            cand.push({ r: rr, c: cc });
                          }
                          const target = cand[0];
                          if (target) {
                            // Ensure there is a mine at target by swapping with an existing mine.
                            if (!b[target.r][target.c].mine) {
                              let swap = null;
                              for (let rr = 0; rr < b.length; rr++) {
                                for (let cc = 0; cc < b[rr].length; cc++) {
                                  if (b[rr][cc].mine && !(rr === target.r && cc === target.c)) { swap = { r: rr, c: cc }; break; }
                                }
                                if (swap) break;
                              }
                              if (swap) {
                                b[swap.r][swap.c].mine = false;
                                b[target.r][target.c].mine = true;
                              }
                              recomputeAdjacent(b);
                            }

                            // Reveal nearby numbered cells as proof.
                            const around = [];
                            for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
                              if (dr === 0 && dc === 0) continue;
                              const rr = target.r + dr;
                              const cc = target.c + dc;
                              if (rr < 0 || rr >= b.length || cc < 0 || cc >= b[0].length) continue;
                              if (!b[rr][cc].mine && b[rr][cc].adjacent > 0) {
                                b[rr][cc].revealed = true;
                                around.push({ r: rr, c: cc });
                              }
                            }
                            setBoard(b);
                            setTutorialMineCell({ r: target.r, c: target.c, around });
                            setTutorialStep(4);
                          }
                        } catch {}
                      }}
                    >{t('common.continue')}</button>
                  </div>
                </div>
              )}

              {tutorialStep === 4 && tutorialMineCell && tutorialMineRect && (
                <>
                  <div
                    className="absolute rounded-lg border-2 border-white"
                    style={{
                      left: `${tutorialMineRect.left}px`,
                      top: `${tutorialMineRect.top}px`,
                      width: `${tutorialMineRect.width}px`,
                      height: `${tutorialMineRect.height}px`,
                      boxShadow: '0 0 18px rgba(255,255,255,0.45)',
                    }}
                  />
                  {tutorialProofRects.map((r, i) => (
                    <div key={i} className="absolute rounded-lg border border-[#00E5FF]/60"
                      style={{ left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, boxShadow: '0 0 12px rgba(0,229,255,0.25)' }}
                    />
                  ))}
                </>
              )}

              {tutorialStep === 4 && tutorialMineCell && tutorialMineRect && (
                <svg className="absolute inset-0" style={{ width: '100%', height: '100%' }}>
                  <line
                    x1="35%"
                    y1="50%"
                    x2={tutorialMineRect.left + tutorialMineRect.width / 2}
                    y2={tutorialMineRect.top + tutorialMineRect.height / 2}
                    stroke="rgba(255,255,255,0.95)"
                    strokeWidth="2"
                  />
                </svg>
              )}

              {tutorialStep === 4 && (
                <div className="absolute left-4 right-4 bottom-4 md:left-6 md:right-auto md:top-1/2 md:bottom-auto md:-translate-y-1/2 max-w-[640px] glass-panel rounded-xl p-5 border border-white/25">
                  <div className="text-[12px] font-mono text-slate-200">{t('tutorial.step4a')}</div>
                  <div className="text-[12px] font-mono text-slate-200 mt-2">{t('tutorial.step4b')}</div>
                  <div className="mt-4 flex gap-2 pointer-events-auto">
                    <button className="neon-btn px-4 py-2 text-[11px]" onClick={() => setTutorialStep(5)}>{t('common.continue')}</button>
                  </div>
                </div>
              )}

              {tutorialStep === 5 && tutorialHintCell && tutorialHintRect && (
                <>
                  <div className="absolute rounded-lg border-2 border-white"
                    style={{ left: `${tutorialHintRect.left}px`, top: `${tutorialHintRect.top}px`, width: `${tutorialHintRect.width}px`, height: `${tutorialHintRect.height}px`, boxShadow: '0 0 18px rgba(255,255,255,0.35)' }}
                  />
                  {tutorialHintNeighborRects.map((r, i) => (
                    <div key={i} className="absolute rounded-lg border border-[#A855F7]/55"
                      style={{ left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, boxShadow: '0 0 10px rgba(168,85,247,0.20)' }}
                    />
                  ))}
                  <svg className="absolute inset-0" style={{ width: '100%', height: '100%' }}>
                    <line
                      x1="35%"
                      y1="50%"
                      x2={tutorialHintRect.left + tutorialHintRect.width / 2}
                      y2={tutorialHintRect.top + tutorialHintRect.height / 2}
                      stroke="rgba(255,255,255,0.95)"
                      strokeWidth="2"
                    />
                  </svg>
                </>
              )}

              {tutorialStep === 5 && tutorialHintCell && (
                <div className="absolute left-4 right-4 bottom-4 md:left-6 md:right-auto md:top-1/2 md:bottom-auto md:-translate-y-1/2 max-w-[680px] glass-panel rounded-xl p-5 border border-white/25">
                  <div className="text-[12px] font-mono text-slate-200">{t('tutorial.step5a')}<span className="neon-cyan font-bold">{tutorialHintCell.adjacent}</span>{t('tutorial.step5b')}<span className="neon-cyan font-bold">{tutorialHintCell.adjacent}</span>{t('tutorial.step5c')}</div>
                  <div className="mt-4 flex gap-2 pointer-events-auto">
                    <button className="neon-btn px-4 py-2 text-[11px]" onClick={() => {
                      try {
                        const key = `${tutorialHintCell.r},${tutorialHintCell.c}`;
                        const nextExplained = { ...(tutorialExplained || {}), [key]: true };
                        setTutorialExplained(nextExplained);
                        const nextNums = { ...(tutorialExplainedNums || {}), [String(tutorialHintCell.adjacent)]: true };
                        setTutorialExplainedNums(nextNums);
                        const pick = pickNextHintNumberCell(board, nextNums);
                        if (pick) setTutorialHintCell(pick);
                        else setTutorialStep(null);
                      } catch {
                        setTutorialStep(null);
                      }
                    }}>{t('common.continue')}</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-[10px] tracking-[0.25em] uppercase text-slate-500 font-display text-center">
          {t('game.controlsHint')}
        </div>
      </main>

      {tutorialMode ? (
        tutorialCompleted && (
          <div className="modal-backdrop" data-testid="tutorial-done-modal">
            <div className="glass-panel slide-up rounded-2xl p-8 max-w-md w-[92%] relative overflow-hidden">
              <div className="scanline" />
              <h2 className="font-display text-2xl font-black tracking-tight neon-cyan mb-4">{t('tutorial.doneTitle')}</h2>
              <div className="flex flex-wrap gap-2">
                <button className="neon-btn neon-btn-coral flex-1 min-w-[120px]" onClick={() => setModalOpen(false)} data-testid="close-modal-btn">{t('common.close')}</button>
                <button className="neon-btn flex-1 min-w-[120px]" onClick={onContinue} data-testid="continue-btn">{t('common.continue')}</button>
              </div>
            </div>
          </div>
        )
      ) : (
        <GameOverModal open={modalOpen} won={status === 'won'} score={score} time={timer}
          livesRemaining={lives} livesTotal={displayLives} difficulty={difficulty}
          playerName={playerName} onSubmit={doSubmit} flags={flagsCount}
          onClose={() => setModalOpen(false)} onNewGame={reset} onExit={onExit}
          submitted={submitted} coinsAwarded={coinsAwarded} ratingDelta={ratingDelta}
          noSubmit={false} mode={mode} lobbyResult={lobbyResult} opponent={opponent} levelId={levelId}
        />
      )}
    </div>
  );
}
