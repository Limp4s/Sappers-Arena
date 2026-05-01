import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Lock, Star, Play, CheckCircle2, Bomb, Heart, Grid3x3, Trophy, Infinity as InfinityIcon, Crown } from 'lucide-react';
import { LEVELS, loadProgress, isLevelUnlocked, syncCampaignProgress } from '../../lib/levels';
import { t, useLang } from '../../lib/i18n';

export default function CampaignView({ onStartLevel, isAdmin, infiniteLives, onToggleInfiniteLives }) {
  const [progress, setProgress] = useState(() => loadProgress());
  const scrollerRef = useRef(null);
  const dragState = useRef({ dragging: false, startY: 0, startScroll: 0, moved: false });
  const startedAutoRef = useRef(false);

  useEffect(() => {
    const isCoarse = (() => {
      try { return window.matchMedia && window.matchMedia('(pointer: coarse)').matches; } catch { return false; }
    })();
    if (isCoarse) return undefined;

    const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const prevBody = {
      overflowY: document.body.style.overflowY,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    const prevHtmlOverflow = document.documentElement.style.overflowY;

    try { window.scrollTo(0, 0); } catch {}

    document.documentElement.style.overflowY = 'hidden';
    document.body.style.overflowY = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.documentElement.style.overflowY = prevHtmlOverflow;
      document.body.style.overflowY = prevBody.overflowY;
      document.body.style.position = prevBody.position;
      document.body.style.top = prevBody.top;
      document.body.style.width = prevBody.width;
      try { window.scrollTo(0, scrollY); } catch {}
    };
  }, []);

  useEffect(() => {
    setProgress(loadProgress());
    syncCampaignProgress().then((merged) => {
      if (merged) setProgress(merged);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (startedAutoRef.current) return;
    let nextId = null;
    try {
      nextId = localStorage.getItem('mg_campaign_autostart_next');
    } catch {}
    const idNum = Number(nextId);
    if (!idNum || !Number.isFinite(idNum)) return;
    const lvl = LEVELS.find((l) => Number(l.id) === idNum);
    if (!lvl) return;
    if (!isLevelUnlocked(lvl.id, progress)) return;
    startedAutoRef.current = true;
    try { localStorage.removeItem('mg_campaign_autostart_next'); } catch {}
    onStartLevel(lvl);
  }, [progress, onStartLevel]);

  useEffect(() => {
    const onStorage = (e) => {
      if (!e) return;
      if (e.key !== 'mg_session_token' && e.key !== 'mg_player') return;
      syncCampaignProgress().then((merged) => {
        if (merged) setProgress(merged);
      }).catch(() => {});
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (!scrollerRef.current) return;
    const next = LEVELS.find((l) => isLevelUnlocked(l.id, progress) && !progress[l.id]?.completed);
    const target = next || LEVELS[0];
    const node = scrollerRef.current.querySelector(`[data-testid='level-node-${target.id}']`);
    if (node) setTimeout(() => node.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
  }, [progress]);

  const onMouseDown = useCallback((e) => {
    if (e.target.closest('button')) return;
    const el = scrollerRef.current;
    if (!el) return;
    dragState.current = { dragging: true, startY: e.clientY, startScroll: el.scrollTop, moved: false };
    el.style.cursor = 'grabbing';
  }, []);
  const onMouseMove = useCallback((e) => {
    if (!dragState.current.dragging) return;
    const el = scrollerRef.current;
    if (!el) return;
    const dy = e.clientY - dragState.current.startY;
    if (Math.abs(dy) > 3) dragState.current.moved = true;
    el.scrollTop = dragState.current.startScroll - dy;
  }, []);
  const onMouseUp = useCallback(() => {
    const el = scrollerRef.current;
    if (el) el.style.cursor = 'grab';
    dragState.current.dragging = false;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const completedCount = Object.values(progress).filter((p) => p.completed).length;
  const totalStars = Object.values(progress).reduce((sum, p) => sum + (p.stars || 0), 0);
  useLang();

  // Layout: each node placed along a sinusoidal curve
  const ROW_HEIGHT = 130;
  const CURVE_WIDTH = (() => {
    try {
      const vw = Math.max(320, Math.min(520, window.innerWidth || 340));
      return Math.max(260, Math.min(340, vw - 40));
    } catch {
      return 340;
    }
  })();
  const PATH_H_OFFSET = CURVE_WIDTH / 2;
  const curveX = (idx) => Math.sin(idx * 0.7) * PATH_H_OFFSET;

  const segmentForId = (id) => Math.floor((Number(id) - 1) / 10);
  const isMilestone = (id) => Number(id) % 10 === 0;

  const pathPoints = LEVELS.map((_, idx) => {
    const y = 60 + idx * ROW_HEIGHT;
    const x = curveX(idx);
    return { x, y };
  });
  const totalHeight = 60 + LEVELS.length * ROW_HEIGHT + 80;

  // Build SVG path string
  const svgPathD = pathPoints.length
    ? `M ${pathPoints[0].x} ${pathPoints[0].y} ` +
      pathPoints.slice(1).map((p, i) => {
        const prev = pathPoints[i];
        const cpY = (prev.y + p.y) / 2;
        return `C ${prev.x} ${cpY}, ${p.x} ${cpY}, ${p.x} ${p.y}`;
      }).join(' ')
    : '';

  return (
    <div className="max-w-[1600px] mx-auto w-full px-4 md:px-6 pb-10" data-testid="campaign-view">
      <div className="mb-3 flex flex-wrap items-center justify-end gap-5">
          {isAdmin && (
            <button onClick={onToggleInfiniteLives}
              className={`pill flex items-center gap-2 ${infiniteLives ? 'pill-active' : ''}`}
              data-testid="toggle-infinite-lives"
            >
              <InfinityIcon size={13} />
              {infiniteLives ? t('campaign.infinityOn') : t('campaign.infinityOff')}
              <Crown size={11} className="neon-gold" />
            </button>
          )}
          <MetaStat label={t('campaign.cleared')} value={`${completedCount}/${LEVELS.length}`} color="cyan" />
          <MetaStat label={t('campaign.stars')} value={`${totalStars}/${LEVELS.length * 3}`} color="gold" icon={<Star size={14} fill="#FFD700" />} />
      </div>

      <div className="glass-panel rounded-xl relative overflow-hidden campaign-bg" data-testid="level-trail">
        <div
          ref={scrollerRef}
          onMouseDown={onMouseDown}
          className="relative overflow-y-auto overflow-x-hidden hide-scrollbar select-none"
          style={{ height: '76vh', minHeight: '620px', cursor: 'grab' }}
          data-testid="campaign-scroller"
        >
          <div className="relative mx-auto" style={{ width: '100%', maxWidth: CURVE_WIDTH + 320, height: totalHeight }}>
            {/* SVG curvy path */}
            <svg className="absolute left-1/2 -translate-x-1/2 top-0 pointer-events-none"
              width={CURVE_WIDTH + 40} height={totalHeight}
              viewBox={`${-(CURVE_WIDTH/2 + 20)} 0 ${CURVE_WIDTH + 40} ${totalHeight}`}
            >
              <defs>
                <linearGradient id="pathGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="#00E5FF" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#FF2A6D" stopOpacity="0.7" />
                </linearGradient>
              </defs>
              <path d={svgPathD}
                stroke="url(#pathGrad)"
                strokeWidth="3"
                strokeDasharray="8 10"
                fill="none"
                strokeLinecap="round"
              />
              {/* Glowing trail beneath */}
              <path d={svgPathD} stroke="#00E5FF" strokeWidth="6" fill="none" strokeOpacity="0.15" strokeLinecap="round" />
            </svg>

            {/* Start marker */}
            <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 10 }}>
              <div className="w-11 h-11 rounded-full glass-panel-light border-2 border-[#00E5FF]/40 flex items-center justify-center">
                <Play size={14} fill="#00E5FF" className="neon-cyan" />
              </div>
              <div className="text-[9px] tracking-[0.3em] uppercase text-slate-500 font-display text-center mt-1">{t('campaign.start')}</div>
            </div>

            {/* Level nodes placed along curve */}
            {LEVELS.map((lvl, idx) => {
              const progressEntry = progress[lvl.id] || { stars: 0, completed: false };
              const unlocked = isLevelUnlocked(lvl.id, progress);
              const x = curveX(idx);
              const y = 60 + idx * ROW_HEIGHT;
              const seg = segmentForId(lvl.id);
              const milestone = isMilestone(lvl.id);
              // Label side alternates with x sign
              const labelSide = x >= 0 ? 'right' : 'left';
              return (
                <div key={lvl.id} className="absolute flex items-center"
                  style={{ left: '50%', top: y, transform: `translate(calc(-50% + ${x}px), -50%)` }}
                >
                  {labelSide === 'right' && (
                    <div className="absolute left-full ml-4 hidden md:block w-[160px]">
                      {milestone && (
                        <>
                          <div className="text-[9px] tracking-[0.3em] uppercase text-slate-500 font-display">LVL {String(lvl.id).padStart(2, '0')}</div>
                          <div className={`font-display text-sm font-bold ${unlocked ? 'text-slate-200' : 'text-slate-600'}`}>CHECKPOINT</div>
                        </>
                      )}
                    </div>
                  )}
                  <LevelNode level={lvl} unlocked={unlocked} progress={progressEntry}
                    onClick={() => { if (!unlocked || dragState.current.moved) return; onStartLevel(lvl); }}
                    milestone={milestone} segment={seg}
                  />
                  {labelSide === 'left' && (
                    <div className="absolute right-full mr-4 text-right hidden md:block w-[160px]">
                      {milestone && (
                        <>
                          <div className="text-[9px] tracking-[0.3em] uppercase text-slate-500 font-display">LVL {String(lvl.id).padStart(2, '0')}</div>
                          <div className={`font-display text-sm font-bold ${unlocked ? 'text-slate-200' : 'text-slate-600'}`}>CHECKPOINT</div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Goal marker */}
            <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 60 + LEVELS.length * ROW_HEIGHT + 10 }}>
              <div className="w-11 h-11 rounded-full glass-panel-light border-2 border-[#FFD700]/40 flex items-center justify-center">
                <Trophy size={14} className="neon-gold" />
              </div>
              <div className="text-[9px] tracking-[0.3em] uppercase text-slate-500 font-display text-center mt-1">GOAL</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const MetaStat = ({ label, value, color, icon }) => {
  const c = { cyan: 'neon-cyan', gold: 'neon-gold' }[color];
  return (
    <div>
      <div className="text-[9px] tracking-[0.25em] uppercase text-slate-500 font-display">{label}</div>
      <div className={`font-mono font-bold text-xl ${c} flex items-center gap-2 mt-0.5`}>{icon}{value}</div>
    </div>
  );
};

function LevelNode({ level, unlocked, progress, onClick, milestone = false, segment = 0 }) {
  const { id, rows, cols, mines, lives } = level;
  const { stars, completed } = progress;
  let stateClass = 'bg-white/5 border-white/10 text-slate-500';
  if (unlocked && !completed) stateClass = 'bg-black/70 border-[#00E5FF]/70 neon-cyan hover:scale-110 hover:shadow-[0_0_26px_rgba(0,229,255,0.6)]';
  if (completed) stateClass = 'bg-[rgba(0,255,157,0.08)] border-[#00FF9D]/70 neon-lime hover:scale-110';
  const isCurrent = unlocked && !completed;

  const milestoneBorder = milestone ? 'border-[#FFD700]/60' : '';
  const milestoneSize = milestone ? 'w-[74px] h-[74px] md:w-[80px] md:h-[80px]' : 'w-16 h-16 md:w-[68px] md:h-[68px]';
  const bgHue = (segment * 26) % 360;
  const bgGlow = `radial-gradient(circle at 50% 50%, hsla(${bgHue}, 100%, 60%, 0.16), transparent 65%)`;

  return (
    <button disabled={!unlocked} onClick={onClick} data-testid={`level-node-${id}`}
      className={`relative group flex flex-col items-center gap-1 transition-transform duration-200 ${!unlocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      style={{ minWidth: '78px' }}
    >
      <div className={`relative ${milestoneSize} rounded-2xl border-2 flex items-center justify-center backdrop-blur-sm transition-all ${stateClass} ${milestoneBorder}`}
        style={{ backgroundImage: bgGlow }}
      >
        {isCurrent && <span className="absolute inset-0 rounded-2xl pulse-glow pointer-events-none" />}
        {!unlocked ? <Lock size={20} className="text-slate-600" /> :
          completed ? <CheckCircle2 size={22} strokeWidth={2.5} /> :
          <Play size={20} strokeWidth={2.5} fill="currentColor" />}
        <span className="absolute -top-2 -right-2 text-[10px] font-display font-black text-white bg-[#050505] rounded-full px-2 py-0.5 border border-white/40 shadow-[0_0_10px_rgba(255,255,255,0.55)]">
          {String(id).padStart(2, '0')}
        </span>
        {milestone && (
          <span className="absolute -bottom-2 -left-2 text-[9px] font-display font-black neon-gold bg-[#050505] rounded-full px-1.5 py-0.5 border border-[#FFD700]/40">
            ★
          </span>
        )}
      </div>
      {unlocked && (
        <div className="flex gap-0.5">
          {[1, 2, 3].map((s) => (
            <Star key={s} size={10} strokeWidth={1.5}
              className={s <= stars ? 'text-[#FFD700]' : 'text-slate-700'}
              fill={s <= stars ? '#FFD700' : 'transparent'} />
          ))}
        </div>
      )}
      {unlocked && (
        <div className="absolute top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 whitespace-nowrap glass-panel rounded-lg px-3 py-2 text-[10px] font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Grid3x3 size={10} className="neon-cyan" />{rows}×{cols}</span>
            <span className="flex items-center gap-1"><Bomb size={10} className="neon-coral" />{mines}</span>
            <span className="flex items-center gap-1"><Heart size={10} className="neon-coral" fill="currentColor" />{lives}</span>
          </div>
        </div>
      )}
    </button>
  );
}
