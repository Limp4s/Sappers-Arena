import React from 'react';
import { Bomb, Flag, Heart, Timer, Trophy, Zap, RefreshCw, Skull, Coins, Infinity as InfinityIcon } from 'lucide-react';
import { t, useLang } from '../../lib/i18n';

export const Cell = React.memo(function Cell({
  cell, r, c, onReveal, onFlag, disabled, revealDelay = 0,
  mineIcon: MineIcon = Bomb,
  cellTheme,
}) {
  const handleClick = (e) => { e.preventDefault(); if (disabled || cell.revealed || cell.flagged) return; onReveal(r, c); };
  const handleContext = (e) => { e.preventDefault(); if (disabled || cell.revealed) return; onFlag(r, c); };

  let className = 'cell';
  let content = null;
  const numColor = cellTheme?.number?.[cell.adjacent] || '#00E5FF';
  const accent = cellTheme?.accent || '#00E5FF';

  if (cell.revealed) {
    if (cell.mine) {
      className += cell.exploded ? ' cell-mine-hit' : ' cell-mine';
      content = <MineIcon size={14} strokeWidth={2.5} className="text-white" />;
    } else {
      className += ' cell-revealed cell-pop';
      if (cell.adjacent > 0) {
        content = (
          <span style={{
            color: numColor,
            textShadow: `0 0 6px ${numColor}80`,
            fontSize: '0.85rem',
          }}>{cell.adjacent}</span>
        );
      }
    }
  } else if (cell.flagged) {
    className += ' cell-flag';
    content = <Flag size={12} strokeWidth={2.5} style={{ color: '#FFD700' }} />;
  } else {
    className += ' cell-hidden';
  }

  // Apply themed accent for hover/revealed border via inline style for non-default themes
  const themedStyle = {};
  if (cell.revealed && !cell.mine && cellTheme && cellTheme.accent !== '#00E5FF') {
    themedStyle.borderColor = `${accent}33`;
    themedStyle.boxShadow = `inset 0 0 12px ${accent}14`;
  }

  return (
    <div className={className}
      onClick={handleClick} onContextMenu={handleContext}
      data-testid={`grid-cell-${r}-${c}`}
      style={{
        ...(cell.revealed && !cell.mine ? { animationDelay: `${revealDelay}ms` } : {}),
        ...themedStyle,
      }}
    >
      {content}
    </div>
  );
});

export const StatsBar = ({ timer, lives, livesTotal = 3, score, minesLeft, onReset, infiniteLives }) => {
  const fmt = (n) => String(n).padStart(3, '0');
  useLang();
  return (
    <div className="glass-panel rounded-xl px-5 py-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-6 flex-wrap">
        <StatItem icon={<Timer size={14} />} label={t('game.time')} value={fmt(timer)} color="cyan" testid="stat-timer" />
        <StatItem icon={<Bomb size={14} />} label={t('game.mines')} value={fmt(minesLeft)} color="coral" testid="stat-mines" />
        <StatItem icon={<Zap size={14} />} label={t('game.score')} value={score.toLocaleString()} color="gold" testid="stat-score" />
        <LivesDisplay lives={lives} livesTotal={livesTotal} infiniteLives={infiniteLives} />
      </div>
      <button className="neon-btn flex items-center gap-2" onClick={onReset} data-testid="reset-btn">
        <RefreshCw size={14} /> {t('game.reset')}
      </button>
    </div>
  );
};

const StatItem = ({ icon, label, value, color, testid }) => {
  const colorClass = { cyan: 'neon-cyan', coral: 'neon-coral', gold: 'neon-gold', lime: 'neon-lime' }[color];
  return (
    <div className="flex items-center gap-3" data-testid={testid}>
      <div className={`${colorClass} opacity-70`}>{icon}</div>
      <div>
        <div className="text-[9px] tracking-[0.25em] uppercase text-slate-400 font-display">{label}</div>
        <div className={`text-xl font-mono font-bold ${colorClass} leading-none mt-0.5`}>{value}</div>
      </div>
    </div>
  );
};

const LivesDisplay = ({ lives, livesTotal, infiniteLives }) => (
  <div className="flex items-center gap-3" data-testid="stat-lives">
    <Heart size={14} className="neon-coral opacity-80" />
    <div>
      <div className="text-[9px] tracking-[0.25em] uppercase text-slate-400 font-display">{t('game.lives')}</div>
      {infiniteLives ? (
        <div className="flex items-center gap-1 mt-1 neon-cyan font-mono font-bold text-lg" data-testid="lives-infinity">
          <InfinityIcon size={18} /> ∞
        </div>
      ) : (
        <div className="flex gap-1.5 mt-1.5 flex-wrap max-w-[160px]" data-testid="lives-indicator">
          {Array.from({ length: Math.min(livesTotal, 10) }).map((_, i) => (
            <div key={i} className={`life ${i >= lives ? 'life-lost' : ''}`} data-testid={`life-${i}`} />
          ))}
        </div>
      )}
    </div>
  </div>
);

export const GameOverModal = ({
  open, won, score, time, livesRemaining, livesTotal = 3,
  difficulty, playerName, onSubmit, onClose, onNewGame, onExit, submitted,
  coinsAwarded = 0, ratingDelta = 0, noSubmit = false, mode, flags = 0,
  lobbyResult = null, opponent = null,
  levelId = null,
}) => {
  const [submitting, setSubmitting] = React.useState(false);
  const [autoSubmitted, setAutoSubmitted] = React.useState(false);
  useLang();

  React.useEffect(() => {
    if (open && !noSubmit && playerName && !submitted && !autoSubmitted && !submitting) {
      setSubmitting(true); setAutoSubmitted(true);
      Promise.resolve(onSubmit()).finally(() => setSubmitting(false));
    }
    if (!open) setAutoSubmitted(false);
  }, [open, playerName, submitted, autoSubmitted, submitting, onSubmit, noSubmit]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" data-testid="game-over-modal">
      <div className="glass-panel slide-up rounded-2xl p-8 max-w-md w-[92%] relative overflow-hidden">
        {won && <div className="scanline" />}
        <div className="flex items-center gap-3 mb-2">
          {won ? <Trophy size={28} className="neon-gold" /> : <Skull size={28} className="neon-coral" />}
          <h2 className={`font-display text-3xl font-black tracking-tight ${won ? 'neon-cyan' : 'neon-coral'}`}>
            {won ? t('game.victory') : t('game.systemBreach')}
          </h2>
        </div>
        <p className="text-xs text-slate-400 tracking-[0.2em] uppercase mb-6 font-display">
          // {difficulty} · {won ? t('game.cleared') : t('game.terminated')}
          {playerName && <> · <span className="text-slate-300">{playerName}</span></>}
        </p>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <ResultStat label={t('game.score')} value={score.toLocaleString()} color="cyan" />
          <ResultStat label={t('game.time')} value={`${time}s`} color="gold" />
          <ResultStat label={t('game.lives')} value={typeof livesTotal === 'number' && livesTotal > 50 ? '∞' : `${livesRemaining}/${livesTotal}`} color="coral" />
        </div>

        {coinsAwarded > 0 && (
          <div className="glass-panel-light rounded-lg p-3 text-center mb-4" data-testid="coins-awarded">
            <div className="text-[9px] tracking-[0.3em] uppercase text-slate-400 font-display mb-1">{t('game.bounty')}</div>
            <div className="flex items-center justify-center gap-2">
              <Coins size={18} className="neon-gold" />
              <span className="font-mono text-2xl font-bold neon-gold">+{coinsAwarded}</span>
            </div>
          </div>
        )}

        {mode === 'campaign' && won && Number(levelId) === 150 && (
          <div className="text-center text-[12px] neon-lime font-display font-black tracking-[0.2em] mb-4" data-testid="campaign-finished">
            ТЫ ЗАКОНЧИЛ КОМПАНИЮ
          </div>
        )}
        {mode === 'battle_ranked' && ratingDelta !== 0 && (
          <div className="glass-panel-light rounded-lg p-3 text-center mb-4" data-testid="rating-delta">
            <div className="text-[9px] tracking-[0.3em] uppercase text-slate-400 font-display mb-1">{t('common.rating')}</div>
            <div className={`font-mono text-2xl font-bold ${ratingDelta > 0 ? 'neon-lime' : 'neon-coral'}`}>
              {ratingDelta > 0 ? '+' : ''}{ratingDelta}
            </div>
          </div>
        )}

        {noSubmit && won && (
          <div className="text-center text-[11px] neon-gold font-mono mb-4" data-testid="admin-nosubmit">
            {t('game.adminNoSubmit')}
          </div>
        )}
        {!noSubmit && won && (submitting || !submitted) && (
          <div className="text-center text-[11px] text-slate-400 font-mono mb-4" data-testid="submit-status">
            {submitting ? t('game.uploading') : t('game.queued')}
          </div>
        )}
        {!noSubmit && won && submitted && (
          <div className="text-center text-[11px] neon-lime font-mono mb-4" data-testid="submit-done">
            {t('game.scoreUploaded')}
          </div>
        )}

        {lobbyResult && (
          <div className="glass-panel-light rounded-lg p-3 mb-4" data-testid="lobby-result">
            <div className="text-[9px] tracking-[0.3em] uppercase text-slate-400 font-display text-center mb-2">// {t('game.duelResult')}</div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-center">
              <div>
                <div className="text-slate-500 text-[9px] uppercase tracking-[0.2em] font-display">{t('game.you')}</div>
                <div className="neon-cyan font-bold">{lobbyResult.mine.score.toLocaleString()}</div>
                <div className="text-slate-400">{lobbyResult.mine.time_seconds}s · {lobbyResult.mine.won ? t('game.win') : t('game.loss')}</div>
              </div>
              <div>
                <div className="text-slate-500 text-[9px] uppercase tracking-[0.2em] font-display">{opponent || t('game.rival')}</div>
                <div className="neon-coral font-bold">{lobbyResult.opp.score.toLocaleString()}</div>
                <div className="text-slate-400">{lobbyResult.opp.time_seconds}s · {lobbyResult.opp.won ? t('game.win') : t('game.loss')}</div>
              </div>
            </div>
            <div className="text-center mt-2 font-display font-bold">
              {lobbyResult.mine.score > lobbyResult.opp.score
                ? <span className="neon-lime">{t('game.youWinDuel')}</span>
                : lobbyResult.mine.score < lobbyResult.opp.score
                ? <span className="neon-coral">{t('game.defeated')}</span>
                : <span className="neon-gold">{t('game.tie')}</span>}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button className="neon-btn flex-1 min-w-[120px]" onClick={onNewGame} data-testid="new-game-btn">{t('game.replay')}</button>
          {onExit && (
            <button className="neon-btn neon-btn-coral flex-1 min-w-[120px]" onClick={onExit} data-testid="modal-exit-btn">{t('common.back')}</button>
          )}
          <button className="neon-btn neon-btn-coral" onClick={onClose} data-testid="close-modal-btn">{t('common.close')}</button>
        </div>
      </div>
    </div>
  );
};

const ResultStat = ({ label, value, color }) => {
  const colorClass = { cyan: 'neon-cyan', coral: 'neon-coral', gold: 'neon-gold' }[color];
  return (
    <div className="glass-panel-light rounded-lg p-3 text-center">
      <div className="text-[9px] tracking-[0.25em] uppercase text-slate-400 font-display mb-1">{label}</div>
      <div className={`font-mono font-bold text-lg ${colorClass}`}>{value}</div>
    </div>
  );
};
