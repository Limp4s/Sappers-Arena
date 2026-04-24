import React, { useState, useMemo } from 'react';
import { Play, Grid3x3, Bomb, Heart, Zap, Info, AlertTriangle, Palette, Users } from 'lucide-react';
import { MINE_ICONS, CELL_THEMES, FX_EFFECTS, CURSORS, loadEquipped, saveEquipped } from '../../lib/shop';
import FriendLobbyModal from '../modals/FriendLobbyModal';
import { t, useLang } from '../../lib/i18n';

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const computeMaxMines = (rows, cols) => {
  const total = rows * cols;
  return Math.max(1, Math.min(Math.floor(total * 0.6), total - 10));
};

export default function CustomView({ onStartCustom, onStartCustomWithLobby, player }) {
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);
  const [mines, setMines] = useState(15);
  const [lives, setLives] = useState(3);
  const [equipped, setEquipped] = useState(() => loadEquipped(player?.nick));
  const [showLobby, setShowLobby] = useState(false);

  const maxMines = useMemo(() => computeMaxMines(rows, cols), [rows, cols]);
  const safeMines = Math.min(mines, maxMines);
  const safeCells = rows * cols - safeMines;
  const density = ((safeMines / (rows * cols)) * 100).toFixed(1);

  React.useEffect(() => { if (mines > maxMines) setMines(maxMines); }, [maxMines, mines]);
  React.useEffect(() => { saveEquipped(equipped, player?.nick); }, [equipped, player?.nick]);

  React.useEffect(() => {
    setEquipped(loadEquipped(player?.nick));
  }, [player?.nick]);

  const diff = useMemo(() => {
    const d = parseFloat(density);
    if (d < 12) return { label: t('custom.diff.easy'), color: 'neon-lime' };
    if (d < 18) return { label: t('custom.diff.normal'), color: 'neon-cyan' };
    if (d < 24) return { label: t('custom.diff.hard'), color: 'neon-gold' };
    return { label: t('custom.diff.insane'), color: 'neon-coral' };
  }, [density]);

  const buildConfig = () => ({
    rows: clamp(rows, 5, 30), cols: clamp(cols, 5, 30),
    mines: safeMines, lives: clamp(lives, 1, 10),
    difficulty: 'custom', mode: 'custom', label: t('custom.title'),
  });

  const handlePlay = () => onStartCustom(buildConfig());

  const presets = [
    { name: 'TRAINER', rows: 8,  cols: 8,  mines: 6,   lives: 5 },
    { name: 'CLASSIC', rows: 10, cols: 10, mines: 15,  lives: 3 },
    { name: 'BRUTAL',  rows: 16, cols: 16, mines: 50,  lives: 2 },
    { name: 'CHAOS',   rows: 18, cols: 22, mines: 110, lives: 1 },
  ];

  const applyPreset = (p) => {
    setRows(p.rows); setCols(p.cols);
    setMines(Math.min(p.mines, computeMaxMines(p.rows, p.cols))); setLives(p.lives);
  };

  const owned = new Set(player?.owned_items || []);
  owned.add('mine_default'); owned.add('cell_default'); owned.add('fx_default'); owned.add('cursor_default');

  const mineCapHit = mines >= maxMines;
  useLang();

  return (
    <div className="max-w-[1600px] mx-auto w-full px-4 md:px-6 pb-10" data-testid="custom-view">
      <div className="glass-panel rounded-xl p-6 mb-5">
        <div className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-display">// sandbox mode</div>
        <h2 className="font-display text-2xl md:text-3xl font-black tracking-tight neon-cyan mt-1">{t('custom.title')}</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xl">{t('custom.blurb')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="glass-panel rounded-xl p-6 md:p-8 space-y-7">
          <SliderRow icon={<Grid3x3 size={14} className="neon-cyan" />} label={t('custom.rows')} value={rows} min={5} max={30} onChange={setRows} testid="slider-rows" />
          <SliderRow icon={<Grid3x3 size={14} className="neon-cyan" style={{ transform: 'rotate(90deg)' }} />} label={t('custom.cols')} value={cols} min={5} max={30} onChange={setCols} testid="slider-cols" />
          <SliderRow icon={<Bomb size={14} className="neon-coral" />} label={t('custom.mines')} value={safeMines} min={1} max={maxMines}
            onChange={(v) => setMines(clamp(v, 1, maxMines))} testid="slider-mines"
            suffix={<span className="text-[10px] text-slate-500 font-mono">({density}% · max {maxMines})</span>} />
          <SliderRow icon={<Heart size={14} className="neon-coral" fill="currentColor" />} label={t('custom.lives')} value={lives} min={1} max={10} onChange={setLives} testid="slider-lives" />

          {mineCapHit && (
            <div className="glass-panel-light rounded-lg px-4 py-3 flex items-start gap-3" data-testid="cap-notice">
              <AlertTriangle size={14} className="neon-gold mt-0.5 shrink-0" />
              <div className="text-[11px] text-slate-300 leading-relaxed font-mono">
                <span className="neon-gold font-bold">{t('custom.mineCapTitle')}</span> {t('custom.mineCapBody')}
              </div>
            </div>
          )}

          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-display mb-2">// {t('custom.presets')}</div>
            <div className="flex gap-2 flex-wrap">
              {presets.map((p) => (
                <button key={p.name} onClick={() => applyPreset(p)} className="pill" data-testid={`preset-${p.name.toLowerCase()}`}>{p.name}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette size={13} className="neon-gold" />
              <div className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-display">// {t('custom.fxSkins')}</div>
            </div>
            <SkinGroup label={t('custom.skin.mine')}   items={Object.entries(MINE_ICONS)}  selected={equipped.mine}   owned={owned} onSelect={(id) => setEquipped(e => ({ ...e, mine: id }))}   testidPrefix="skin-mine" />
            <SkinGroup label={t('custom.skin.cell')}   items={Object.entries(CELL_THEMES)} selected={equipped.cell}   owned={owned} onSelect={(id) => setEquipped(e => ({ ...e, cell: id }))}   testidPrefix="skin-cell" />
            <SkinGroup label={t('custom.skin.fx')}     items={Object.entries(FX_EFFECTS)}  selected={equipped.fx}     owned={owned} onSelect={(id) => setEquipped(e => ({ ...e, fx: id }))}     testidPrefix="skin-fx" />
            <SkinGroup label={t('custom.skin.cursor')} items={Object.entries(CURSORS)}     selected={equipped.cursor} owned={owned} onSelect={(id) => setEquipped(e => ({ ...e, cursor: id }))} testidPrefix="skin-cursor" />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button onClick={handlePlay} className="neon-btn flex-1 flex items-center justify-center gap-2 py-4 text-base" data-testid="start-custom-btn">
              <Play size={16} fill="currentColor" /> {t('custom.solo')}
            </button>
            <button onClick={() => setShowLobby(true)} className="neon-btn neon-btn-coral flex-1 flex items-center justify-center gap-2 py-4 text-base" data-testid="open-friend-lobby-btn">
              <Users size={16} /> {t('custom.withFriend')}
            </button>
          </div>
        </div>

        <aside className="glass-panel rounded-xl p-6 space-y-4 h-fit lg:sticky lg:top-4">
          <div className="flex items-center gap-2">
            <Info size={14} className="neon-cyan" />
            <div className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-display">// {t('custom.configPreview')}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <PreviewStat label={t('battles.field')} value={`${rows}×${cols}`} color="cyan" />
            <PreviewStat label={t('custom.cells')} value={rows * cols} color="cyan" />
            <PreviewStat label={t('custom.mines')} value={safeMines} color="coral" />
            <PreviewStat label={t('custom.safe')} value={safeCells} color="lime" />
            <PreviewStat label={t('custom.lives')} value={lives} color="coral" />
            <PreviewStat label={t('custom.density')} value={`${density}%`} color="gold" />
          </div>
          <div className="glass-panel-light rounded-lg p-4 text-center">
            <div className="text-[9px] tracking-[0.3em] uppercase text-slate-400 font-display mb-2">// {t('custom.estChallenge')}</div>
            <div className={`font-display text-2xl font-black ${diff.color} tracking-tight`}>
              <Zap size={18} className="inline mb-1" /> {diff.label}
            </div>
          </div>
        </aside>
      </div>

      {showLobby && (
        <FriendLobbyModal
          config={buildConfig()}
          onClose={() => setShowLobby(false)}
          onStartWithLobby={(cfg) => onStartCustomWithLobby(cfg)}
          player={player}
        />
      )}
    </div>
  );
}

function SkinGroup({ label, items, selected, owned, onSelect, testidPrefix }) {
  return (
    <div className="mb-3">
      <div className="text-[9px] tracking-[0.25em] uppercase text-slate-500 font-display mb-1.5">{label}</div>
      <div className="flex gap-2 flex-wrap">
        {items.map(([id, def]) => {
          const isOwned = owned.has(id) || def.free;
          const isSelected = selected === id;
          const Icon = def.icon;
          return (
            <button key={id} onClick={() => isOwned && onSelect(id)} disabled={!isOwned}
              className={`px-2 py-1.5 rounded-md border text-[10px] font-mono transition-all flex items-center gap-1.5 ${
                isSelected ? 'border-[#00E5FF] bg-[rgba(0,229,255,0.12)] neon-cyan' : 'border-white/10 text-slate-400 hover:border-white/30'
              } ${!isOwned ? 'opacity-40 cursor-not-allowed' : ''}`}
              data-testid={`${testidPrefix}-${id}`}
              title={!isOwned ? t('custom.lockedTooltip') : def.name}
            >
              {Icon && <Icon size={11} />}
              <span className="truncate max-w-[80px]">{def.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SliderRow({ icon, label, value, min, max, onChange, testid, suffix }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-[11px] tracking-[0.25em] uppercase text-slate-300 font-display font-semibold">{label}</span>
          {suffix}
        </div>
        <span className="font-mono text-lg font-bold neon-cyan" data-testid={`${testid}-value`}>{value}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="custom-slider w-full" data-testid={testid} />
      <div className="flex justify-between text-[9px] text-slate-600 font-mono mt-1">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
}

function PreviewStat({ label, value, color }) {
  const c = { cyan: 'neon-cyan', coral: 'neon-coral', gold: 'neon-gold', lime: 'neon-lime' }[color];
  return (
    <div className="glass-panel-light rounded-lg p-3">
      <div className="text-[9px] tracking-[0.25em] uppercase text-slate-400 font-display">{label}</div>
      <div className={`font-mono font-bold text-lg ${c} mt-0.5`}>{value}</div>
    </div>
  );
}
