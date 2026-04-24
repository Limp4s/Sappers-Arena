// Cosmetics catalog.
import { Bomb, Skull, Zap, Cat, Ghost, Flame, MousePointer2, Crosshair, Target, Biohazard, Radiation, Crown, Gem } from 'lucide-react';
import { getStoredNickname } from './player';

export const MINE_ICONS = {
  mine_default: { icon: Bomb,   name: 'Bomb',        free: true },
  mine_skull:      { icon: Skull,      name: 'Skull',       price: 400 },
  mine_zap:        { icon: Zap,        name: 'Zap',         price: 500 },
  mine_cat:        { icon: Cat,        name: 'Phantom Cat', price: 800 },
  mine_ghost:      { icon: Ghost,      name: 'Ghost',       price: 1000 },
  mine_flame:      { icon: Flame,      name: 'Flame',       price: 1200 },
  mine_radiation:  { icon: Radiation,  name: 'Radiation',   price: 1500 },
  mine_biohazard:  { icon: Biohazard,  name: 'Biohazard',   price: 1500 },
  mine_crown:      { icon: Crown,      name: 'Crown',       price: 2000 },
  mine_gem:        { icon: Gem,        name: 'Gem',         price: 2200 },
};

export const CELL_THEMES = {
  cell_default: { name: 'Cyan Grid', free: true, accent: '#00E5FF',
    number: { 1:'#00E5FF', 2:'#00FF9D', 3:'#FFD700', 4:'#FF2A6D', 5:'#FF6B9E', 6:'#00E5FF', 7:'#ffffff', 8:'#94A3B8' } },
  cell_gold:    { name: 'Gold Grid', price: 900, accent: '#FFD700',
    number: { 1:'#FFD700', 2:'#FFE066', 3:'#FFA500', 4:'#FF6B9E', 5:'#FF2A6D', 6:'#FFD700', 7:'#ffffff', 8:'#94A3B8' } },
  cell_coral:   { name: 'Coral Grid', price: 900, accent: '#FF2A6D',
    number: { 1:'#FF2A6D', 2:'#FF6B9E', 3:'#FFD700', 4:'#00E5FF', 5:'#00FF9D', 6:'#FF2A6D', 7:'#ffffff', 8:'#94A3B8' } },
  cell_ice:     { name: 'Ice Grid', price: 900, accent: '#A5F3FC',
    number: { 1:'#A5F3FC', 2:'#67E8F9', 3:'#22D3EE', 4:'#0EA5E9', 5:'#0284C7', 6:'#A5F3FC', 7:'#ffffff', 8:'#64748B' } },
  cell_retro:   { name: 'Retro Green', price: 1400, accent: '#00FF9D',
    number: { 1:'#00FF9D', 2:'#4ADE80', 3:'#FFD700', 4:'#FFA500', 5:'#FF2A6D', 6:'#00FF9D', 7:'#ffffff', 8:'#94A3B8' } },
  cell_sunset:  { name: 'Sunset', price: 1800, accent: '#F97316',
    number: { 1:'#FB923C', 2:'#FBBF24', 3:'#F472B6', 4:'#FF2A6D', 5:'#C084FC', 6:'#FB923C', 7:'#ffffff', 8:'#94A3B8' } },
  cell_violet:  { name: 'Violet', price: 1900, accent: '#A855F7',
    number: { 1:'#A855F7', 2:'#C084FC', 3:'#E879F9', 4:'#22D3EE', 5:'#00FF9D', 6:'#A855F7', 7:'#ffffff', 8:'#94A3B8' } },
  cell_mono:    { name: 'Monochrome', price: 1600, accent: '#E2E8F0',
    number: { 1:'#E2E8F0', 2:'#CBD5E1', 3:'#94A3B8', 4:'#64748B', 5:'#475569', 6:'#E2E8F0', 7:'#ffffff', 8:'#94A3B8' } },
};

export const FX_EFFECTS = {
  fx_default:   { name: 'Red Flash',  free: true,  color: 'rgba(255, 42, 109, 0.35)' },
  fx_gold:      { name: 'Gold Burst', price: 600,  color: 'rgba(255, 215, 0, 0.40)' },
  fx_rainbow:   { name: 'Rainbow',    price: 1200, color: 'rainbow' },
  fx_shockwave: { name: 'Shockwave',  price: 1600, color: 'rgba(0, 229, 255, 0.45)' },
  fx_void:      { name: 'Void',       price: 1800, color: 'rgba(15, 23, 42, 0.70)' },
  fx_lime:      { name: 'Lime Burst', price: 1400, color: 'rgba(0, 255, 157, 0.45)' },
};

export const CURSORS = {
  cursor_default:   { name: 'Default',     icon: MousePointer2, free: true, css: 'auto' },
  cursor_crosshair: { name: 'Crosshair',   icon: Crosshair,     price: 600,
    css: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="10" stroke="%2300E5FF" stroke-width="2" fill="none"/><line x1="14" y1="0" x2="14" y2="8" stroke="%2300E5FF" stroke-width="2"/><line x1="14" y1="20" x2="14" y2="28" stroke="%2300E5FF" stroke-width="2"/><line x1="0" y1="14" x2="8" y2="14" stroke="%2300E5FF" stroke-width="2"/><line x1="20" y1="14" x2="28" y2="14" stroke="%2300E5FF" stroke-width="2"/></svg>') 14 14, crosshair` },
  cursor_target:    { name: 'Target Lock', icon: Target,        price: 800,
    css: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" stroke="%23FF2A6D" stroke-width="2" fill="none"/><circle cx="16" cy="16" r="7" stroke="%23FF2A6D" stroke-width="1.5" fill="none"/><circle cx="16" cy="16" r="2" fill="%23FF2A6D"/></svg>') 16 16, crosshair` },
  cursor_neon:      { name: 'Neon Pointer', icon: MousePointer2, price: 1200,
    css: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><path d="M4 4 L4 22 L10 18 L14 26 L18 24 L14 16 L22 14 Z" stroke="%23FFD700" stroke-width="1.5" fill="%23000" fill-opacity="0.8"/></svg>') 4 4, auto` },
  cursor_coral:     { name: 'Coral Pointer', icon: MousePointer2, price: 1500,
    css: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><path d="M4 4 L4 22 L10 18 L14 26 L18 24 L14 16 L22 14 Z" stroke="%23FF2A6D" stroke-width="1.8" fill="%23000" fill-opacity="0.8"/></svg>') 4 4, auto` },
  cursor_lime:      { name: 'Lime Pointer', icon: MousePointer2, price: 1500,
    css: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><path d="M4 4 L4 22 L10 18 L14 26 L18 24 L14 16 L22 14 Z" stroke="%2300FF9D" stroke-width="1.8" fill="%23000" fill-opacity="0.8"/></svg>') 4 4, auto` },
};

const EQUIP_KEY = 'mg_equipped_v2';

const equipKeyForNick = (nick) => {
  const safe = (nick || '').trim();
  return safe ? `${EQUIP_KEY}:${safe}` : EQUIP_KEY;
};

export const loadEquipped = (nick) => {
  try {
    const key = equipKeyForNick(nick ?? getStoredNickname());
    const raw = localStorage.getItem(key) ?? localStorage.getItem(EQUIP_KEY);
    const base = { mine: 'mine_default', cell: 'cell_default', fx: 'fx_default', cursor: 'cursor_default' };
    if (!raw) return base;
    return { ...base, ...JSON.parse(raw) };
  } catch {
    return { mine: 'mine_default', cell: 'cell_default', fx: 'fx_default', cursor: 'cursor_default' };
  }
};

export const saveEquipped = (equipped, nick) => {
  try {
    const key = equipKeyForNick(nick ?? getStoredNickname());
    localStorage.setItem(key, JSON.stringify(equipped));
  } catch {}
  applyCursor(equipped.cursor);
};

export const applyCursor = (cursorId) => {
  const def = CURSORS[cursorId] || CURSORS.cursor_default;
  document.documentElement.style.cursor = def.css;
};

export const getItemCategory = (id) => {
  if (id.startsWith('mine_')) return 'mine';
  if (id.startsWith('cell_')) return 'cell';
  if (id.startsWith('fx_')) return 'explosion';
  if (id.startsWith('cursor_')) return 'cursor';
  return null;
};
