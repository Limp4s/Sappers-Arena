import React, { useState } from 'react';
import { Package, Bomb, Sparkles, Palette, X, Check, Lock } from 'lucide-react';
import { MINE_ICONS, CELL_THEMES, FX_EFFECTS, loadEquipped, saveEquipped } from '../../lib/shop';
import { t, useLang } from '../../lib/i18n';

const TABS = [
  { key: 'bomb',   labelKey: 'inventory.tabs.bombs',     icon: Bomb,          items: MINE_ICONS,  slot: 'mine' },
  { key: 'fx',     labelKey: 'inventory.tabs.explosions', icon: Sparkles,      items: FX_EFFECTS, slot: 'fx' },
  { key: 'theme',  labelKey: 'inventory.tabs.themes',    icon: Palette,       items: CELL_THEMES, slot: 'cell' },
];

export default function InventoryModal({ player, onClose }) {
  const [tab, setTab] = useState('bomb');
  const [equipped, setEquipped] = useState(() => loadEquipped(player?.nick));
  useLang();

  const owned = new Set(player?.owned_items || []);
  Object.keys(MINE_ICONS).concat(Object.keys(CELL_THEMES), Object.keys(FX_EFFECTS))
    .forEach(id => { const cat = TABS.find(t => Object.prototype.hasOwnProperty.call(t.items, id)); if (cat?.items[id]?.free) owned.add(id); });

  const handleEquip = (slot, id) => {
    const next = { ...equipped, [slot]: id };
    setEquipped(next); saveEquipped(next, player?.nick);
  };

  const displayName = (id, fallback) => {
    const key = `shop.items.${id}`;
    const v = t(key);
    return v === key ? fallback : v;
  };

  const active = TABS.find(t => t.key === tab);

  const renderPreview = (id, def) => {
    if (def?.icon) {
      const Icon = def.icon;
      return <div className="flex items-center justify-center h-14 neon-cyan"><Icon size={28} strokeWidth={2} /></div>;
    }
    if (def?.number) {
      const accent = def.accent === 'rainbow'
        ? '#00E5FF'
        : (def.accent === 'gold_premium' ? '#D4AF37' : def.accent);
      return (
        <div className="flex items-center justify-center h-14">
          <div className="grid grid-cols-3 gap-1">
            {[1,2,3,4,5,6].map(n => (
              <div key={n} className="w-3.5 h-3.5 rounded-sm border" style={{
                borderColor: accent, background: 'rgba(0,0,0,0.5)',
                color: def.number[n], fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'JetBrains Mono', fontWeight: 700,
              }}>{n}</div>
            ))}
          </div>
        </div>
      );
    }
    if (def?.color) {
      const bg = def.color === 'rainbow_premium'
        ? 'linear-gradient(90deg, #00E5FF, #00FF9D, #FFD700, #FF2A6D, #A855F7, #00E5FF)'
        : (def.color === 'gold_premium'
          ? 'linear-gradient(90deg, #7a5b18, #d4af37, #ffec8b, #d4af37, #7a5b18)'
          : (def.color === 'rainbow'
            ? 'radial-gradient(circle, #00E5FF, #FF2A6D, #FFD700, #00FF9D)'
            : def.color.replace(/0\.\d+/, '0.8')));
      return <div className="flex items-center justify-center h-14">
        <div className="w-10 h-10 rounded-full" style={{ background: bg, filter: 'blur(2px)' }} />
      </div>;
    }
    return <div className="h-14" />;
  };

  return (
    <div className="modal-backdrop" data-testid="inventory-modal">
      <div className="glass-panel slide-up rounded-2xl p-6 max-w-3xl w-[94%] max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-black neon-cyan flex items-center gap-2">
            <Package size={20} /> {t('inventory.title')}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white" data-testid="close-inventory-btn"><X size={18} /></button>
        </div>

        <div className="glass-panel-light rounded-full p-1 flex gap-1 mb-4 flex-wrap">
          {TABS.map((tabDef) => {
            const Icon = tabDef.icon;
            const isActive = tabDef.key === tab;
            return (
              <button key={tabDef.key} onClick={() => setTab(tabDef.key)}
                className={`px-4 py-2 rounded-full font-display text-[10px] tracking-[0.2em] font-semibold uppercase transition-all flex items-center gap-1.5 ${isActive ? 'bg-[rgba(0,229,255,0.12)] text-[#00E5FF]' : 'text-slate-400'}`}
                data-testid={`inventory-tab-${tabDef.key}`}
              ><Icon size={11} />{t(tabDef.labelKey)}</button>
            );
          })}
        </div>

        <div className="overflow-y-auto flex-1 pr-1" data-testid={`inventory-grid-${tab}`}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(active.items).map(([id, def]) => {
              const isOwned = owned.has(id) || def.free;
              const isEquipped = equipped[active.slot] === id;
              return (
                <div key={id}
                  className={`glass-panel-light rounded-xl p-3 border ${isEquipped ? 'border-[#00FF9D]/60 shadow-[0_0_18px_rgba(0,255,157,0.25)]' : 'border-white/10'} ${!isOwned ? 'opacity-50' : ''}`}
                  data-testid={`inv-item-${id}`}
                >
                  {renderPreview(id, def)}
                  <div className="text-[11px] text-center font-display font-bold text-slate-200 mt-1 truncate">{displayName(id, def.name)}</div>
                  {isOwned ? (
                    <button onClick={() => handleEquip(active.slot, id)}
                      disabled={isEquipped}
                      className={`mt-2 w-full pill ${isEquipped ? 'pill-active' : ''}`}
                      data-testid={`inv-equip-${id}`}
                    >{isEquipped ? <><Check size={10} /> {t('shop.equipped')}</> : t('shop.equip')}</button>
                  ) : (
                    <div className="mt-2 text-[10px] text-slate-500 text-center font-mono flex items-center justify-center gap-1">
                      <Lock size={10} /> {t('inventory.buyInShop')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
