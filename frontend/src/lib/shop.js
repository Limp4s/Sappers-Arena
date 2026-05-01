// Cosmetics catalog.
import { Bomb, Skull, Zap, Cat, Ghost, Flame, Biohazard, Radiation, Crown, Gem } from 'lucide-react';
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
  cell_gold_premium: { name: 'Solid Gold', price: 4500, accent: 'gold_premium',
    number: { 1:'#D4AF37', 2:'#FFD700', 3:'#FFEC8B', 4:'#C084FC', 5:'#FF2A6D', 6:'#D4AF37', 7:'#ffffff', 8:'#E2E8F0' } },
  cell_coral:   { name: 'Coral Grid', price: 900, accent: '#FF2A6D',
    number: { 1:'#FF2A6D', 2:'#FF6B9E', 3:'#FFD700', 4:'#00E5FF', 5:'#00FF9D', 6:'#FF2A6D', 7:'#ffffff', 8:'#94A3B8' } },
  cell_ice:     { name: 'Ice Grid', price: 900, accent: '#A5F3FC',
    number: { 1:'#A5F3FC', 2:'#67E8F9', 3:'#22D3EE', 4:'#0EA5E9', 5:'#0284C7', 6:'#A5F3FC', 7:'#ffffff', 8:'#64748B' } },
  cell_retro:   { name: 'Retro Green', price: 1400, accent: '#00FF9D',
    number: { 1:'#00FF9D', 2:'#4ADE80', 3:'#FFD700', 4:'#FFA500', 5:'#FF2A6D', 6:'#00FF9D', 7:'#ffffff', 8:'#94A3B8' } },
  cell_plasma:  { name: 'Plasma', price: 2400, accent: '#22D3EE',
    number: { 1:'#22D3EE', 2:'#00E5FF', 3:'#FFD700', 4:'#FF2A6D', 5:'#A855F7', 6:'#00FF9D', 7:'#ffffff', 8:'#94A3B8' } },
  cell_sunset:  { name: 'Sunset', price: 1800, accent: '#F97316',
    number: { 1:'#FB923C', 2:'#FBBF24', 3:'#F472B6', 4:'#FF2A6D', 5:'#C084FC', 6:'#FB923C', 7:'#ffffff', 8:'#94A3B8' } },
  cell_violet:  { name: 'Violet', price: 1900, accent: '#A855F7',
    number: { 1:'#A855F7', 2:'#C084FC', 3:'#E879F9', 4:'#22D3EE', 5:'#00FF9D', 6:'#A855F7', 7:'#ffffff', 8:'#94A3B8' } },
  cell_mono:    { name: 'Monochrome', price: 1600, accent: '#E2E8F0',
    number: { 1:'#E2E8F0', 2:'#CBD5E1', 3:'#94A3B8', 4:'#64748B', 5:'#475569', 6:'#E2E8F0', 7:'#ffffff', 8:'#94A3B8' } },
  cell_rainbow_premium: { name: 'Prismatic Grid', price: 5000, accent: 'rainbow',
    number: { 1:'#00E5FF', 2:'#00FF9D', 3:'#FFD700', 4:'#FF2A6D', 5:'#A855F7', 6:'#22D3EE', 7:'#ffffff', 8:'#94A3B8' } },
};

export const FX_EFFECTS = {
  fx_default:   { name: 'Red Flash',  free: true,  color: 'rgba(255, 42, 109, 0.35)' },
  fx_gold:      { name: 'Gold Burst', price: 600,  color: 'rgba(255, 215, 0, 0.40)' },
  fx_gold_premium: { name: 'Liquid Gold', price: 4500, color: 'gold_premium' },
  fx_rainbow:   { name: 'Rainbow',    price: 1200, color: 'rainbow' },
  fx_rainbow_premium: { name: 'Prismatic Nova', price: 5000, color: 'rainbow_premium' },
  fx_shockwave: { name: 'Shockwave',  price: 1600, color: 'rgba(0, 229, 255, 0.45)' },
  fx_void:      { name: 'Void',       price: 1800, color: 'rgba(15, 23, 42, 0.70)' },
  fx_lime:      { name: 'Lime Burst', price: 1400, color: 'rgba(0, 255, 157, 0.45)' },
  fx_ultraviolet: { name: 'Ultraviolet', price: 2400, color: 'rgba(168, 85, 247, 0.55)' },
  fx_ember:       { name: 'Ember',       price: 2600, color: 'rgba(251, 146, 60, 0.55)' },
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
    const base = { mine: 'mine_default', cell: 'cell_default', fx: 'fx_default' };
    if (!raw) return base;
    return { ...base, ...JSON.parse(raw) };
  } catch {
    return { mine: 'mine_default', cell: 'cell_default', fx: 'fx_default' };
  }
};

export const saveEquipped = (equipped, nick) => {
  try {
    const key = equipKeyForNick(nick ?? getStoredNickname());
    localStorage.setItem(key, JSON.stringify(equipped));
  } catch {}
};

export const getItemCategory = (id) => {
  if (id.startsWith('mine_')) return 'mine';
  if (id.startsWith('cell_')) return 'cell';
  if (id.startsWith('fx_')) return 'explosion';
  return null;
};
