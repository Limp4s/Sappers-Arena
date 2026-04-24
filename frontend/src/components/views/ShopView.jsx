import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Coins, Check, Lock, ShoppingBag, Bomb } from 'lucide-react';
import { MINE_ICONS, CELL_THEMES, FX_EFFECTS, CURSORS, loadEquipped, saveEquipped, getItemCategory } from '../../lib/shop';
import { purchaseItem, fetchPlayer } from '../../lib/player';
import { t, useLang } from '../../lib/i18n';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

export default function ShopView({ player, onPlayerUpdate }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [equipped, setEquipped] = useState(() => loadEquipped(player?.nick));
  const [buying, setBuying] = useState(null);
  const [msg, setMsg] = useState(null);
  useLang();

  useEffect(() => {
    axios.get(`${API}/shop/items`).then(r => {
      setItems(r.data || []);
      setLoading(false);
    }).catch(() => {
      const localCatalog = [];

      Object.entries(MINE_ICONS).forEach(([id, def]) => {
        if (id === 'mine_default') return;
        localCatalog.push({ id, category: 'mine', name: def.name, price: def.price || 0 });
      });
      Object.entries(CELL_THEMES).forEach(([id, def]) => {
        if (id === 'cell_default') return;
        localCatalog.push({ id, category: 'cell', name: def.name, price: def.price || 0 });
      });
      Object.entries(FX_EFFECTS).forEach(([id, def]) => {
        if (id === 'fx_default') return;
        localCatalog.push({ id, category: 'explosion', name: def.name, price: def.price || 0 });
      });
      Object.entries(CURSORS).forEach(([id, def]) => {
        if (id === 'cursor_default') return;
        localCatalog.push({ id, category: 'cursor', name: def.name, price: def.price || 0 });
      });

      setItems(localCatalog);
      setLoading(false);
    });
  }, []);

  useEffect(() => { saveEquipped(equipped, player?.nick); }, [equipped, player?.nick]);

  useEffect(() => {
    setEquipped(loadEquipped(player?.nick));
  }, [player?.nick]);

  const owned = new Set(player?.owned_items || []);
  // Defaults always owned
  owned.add('mine_default'); owned.add('cell_default'); owned.add('fx_default'); owned.add('cursor_default');

  const handleBuy = async (itemId, price) => {
    if (!player) return;
    if ((player.coins || 0) < price) {
      setMsg({ type: 'err', text: t('shop.notEnoughCoins') });
      return;
    }
    setBuying(itemId);
    setMsg(null);
    try {
      const res = await purchaseItem(itemId);
      onPlayerUpdate(res.player);
      // Auto-equip the new item
      const cat = getItemCategory(itemId);
      if (cat) setEquipped((e) => ({ ...e, [cat === 'explosion' ? 'fx' : cat]: itemId }));
      setMsg({ type: 'ok', text: t('shop.acquired').replace('{id}', itemId) });
    } catch (e) {
      const detail = e?.response?.data?.detail || t('shop.purchaseFailed');
      setMsg({ type: 'err', text: detail });
    } finally {
      setBuying(null);
    }
  };

  const handleEquip = (itemId) => {
    const cat = getItemCategory(itemId);
    if (!cat) return;
    const slot = cat === 'explosion' ? 'fx' : cat;
    setEquipped((e) => ({ ...e, [slot]: itemId }));
    setMsg({ type: 'ok', text: t('shop.equippedMsg').replace('{id}', itemId) });
  };

  const renderMeta = (id) => {
    if (id.startsWith('mine_')) {
      const def = MINE_ICONS[id];
      if (!def) return null;
      const Icon = def.icon;
      return <div className="flex items-center justify-center h-16 neon-cyan"><Icon size={34} strokeWidth={2} /></div>;
    }
    if (id.startsWith('cell_')) {
      const def = CELL_THEMES[id];
      if (!def) return null;
      return (
        <div className="flex items-center justify-center h-16">
          <div className="grid grid-cols-3 gap-1">
            {[1,2,3,4,5,6].map(n => (
              <div key={n} className="w-4 h-4 rounded-sm border" style={{
                borderColor: def.accent, background: 'rgba(0,0,0,0.5)',
                color: def.number[n], fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'JetBrains Mono', fontWeight: 700,
              }}>{n}</div>
            ))}
          </div>
        </div>
      );
    }
    if (id.startsWith('fx_')) {
      const def = FX_EFFECTS[id];
      if (!def) return null;
      const bg = def.color === 'rainbow'
        ? 'radial-gradient(circle at center, rgba(255,215,0,0.45), rgba(0,229,255,0.35), rgba(255,42,109,0.35), transparent 70%)'
        : def.color;
      return <div className="h-16 rounded-lg" style={{ background: bg }} />;
    }
    if (id.startsWith('cursor_')) {
      const def = CURSORS[id];
      if (!def) return null;
      const Icon = def.icon;
      return <div className="flex items-center justify-center h-16 neon-cyan"><Icon size={30} strokeWidth={2} /></div>;
    }
    return null;
  };

  const groupedItems = {
    mine: items.filter(i => i.category === 'mine'),
    cell: items.filter(i => i.category === 'cell'),
    explosion: items.filter(i => i.category === 'explosion'),
    cursor: items.filter(i => i.category === 'cursor'),
  };

  const GROUPS = [
    { key: 'mine', label: t('shop.groups.mine'), defaultItem: { id: 'mine_default', name: t('shop.defaultBomb'), price: 0 } },
    { key: 'cell', label: t('shop.groups.cell'), defaultItem: { id: 'cell_default', name: t('shop.defaultCell'), price: 0 } },
    { key: 'explosion', label: t('shop.groups.explosion'), defaultItem: { id: 'fx_default', name: t('shop.defaultFx'), price: 0 } },
    { key: 'cursor', label: t('shop.groups.cursor'), defaultItem: { id: 'cursor_default', name: t('shop.defaultCursor'), price: 0 } },
  ];

  return (
    <div className="max-w-[1600px] mx-auto w-full px-4 md:px-6 pb-10" data-testid="shop-view">
      <div className="glass-panel rounded-xl p-6 mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-display">// cosmetics market</div>
          <h2 className="font-display text-2xl md:text-3xl font-black tracking-tight neon-cyan mt-1 flex items-center gap-3">
            <ShoppingBag size={26} /> {t('shop.title')}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            {t('shop.blurb')}
          </p>
        </div>
        <div className="flex items-center gap-2 glass-panel-light rounded-full px-5 py-2.5" data-testid="shop-coin-balance">
          <Coins size={16} className="neon-gold" />
          <span className="font-mono text-xl font-bold neon-gold">{(player?.coins ?? 0).toLocaleString()}</span>
          <span className="text-[10px] text-slate-500 tracking-[0.2em] uppercase font-display">{t('shop.coins')}</span>
        </div>
      </div>

      {msg && (
        <div className={`rounded-lg px-4 py-2 text-xs font-mono mb-4 ${msg.type === 'ok' ? 'neon-lime bg-[#00FF9D]/5 border border-[#00FF9D]/30' : 'neon-coral bg-[#FF2A6D]/5 border border-[#FF2A6D]/30'}`} data-testid="shop-msg">
          {msg.text}
        </div>
      )}

      {loading && <div className="text-center text-slate-500 text-xs py-8">{t('shop.loading')}</div>}

      {!loading && GROUPS.map(group => (
        <section key={group.key} className="mb-6">
          <h3 className="font-display text-xs font-bold tracking-[0.3em] uppercase text-slate-300 mb-3">
            // {group.label}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Default (free) item */}
            <ItemCard
              item={group.defaultItem}
              isOwned={true}
              isEquipped={equipped[group.key === 'explosion' ? 'fx' : group.key] === group.defaultItem.id}
              preview={renderMeta(group.defaultItem.id)}
              onEquip={() => handleEquip(group.defaultItem.id)}
            />
            {groupedItems[group.key].map(item => (
              <ItemCard
                key={item.id}
                item={item}
                isOwned={owned.has(item.id)}
                isEquipped={equipped[group.key === 'explosion' ? 'fx' : group.key] === item.id}
                preview={renderMeta(item.id)}
                disabled={buying === item.id}
                onBuy={() => handleBuy(item.id, item.price)}
                onEquip={() => handleEquip(item.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ItemCard({ item, isOwned, isEquipped, preview, onBuy, onEquip, disabled }) {
  return (
    <div
      className={`glass-panel rounded-xl p-4 flex flex-col gap-3 transition-all border ${
        isEquipped ? 'border-[#00FF9D]/60 shadow-[0_0_18px_rgba(0,255,157,0.25)]' : 'border-white/10'
      }`}
      data-testid={`shop-item-${item.id}`}
    >
      <div className="glass-panel-light rounded-lg">{preview}</div>
      <div>
        <div className="font-display text-xs font-bold tracking-wider text-slate-200">{item.name}</div>
        <div className="flex items-center gap-1 mt-1 text-[11px]">
          {item.price > 0 ? (
            <>
              <Coins size={11} className="neon-gold" />
              <span className="neon-gold font-mono font-bold">{item.price}</span>
            </>
          ) : (
            <span className="text-slate-500 font-mono">{t('shop.free')}</span>
          )}
        </div>
      </div>
      {isOwned ? (
        <button
          onClick={onEquip}
          disabled={isEquipped}
          className={`pill w-full justify-center ${isEquipped ? 'pill-active' : ''}`}
          data-testid={`shop-equip-${item.id}`}
        >
          {isEquipped ? <><Check size={11} /> {t('shop.equipped')}</> : t('shop.equip')}
        </button>
      ) : (
        <button
          onClick={onBuy}
          disabled={disabled}
          className="neon-btn w-full py-2 text-[11px]"
          data-testid={`shop-buy-${item.id}`}
        >
          {disabled ? t('shop.buying') : t('shop.buy')}
        </button>
      )}
    </div>
  );
}
