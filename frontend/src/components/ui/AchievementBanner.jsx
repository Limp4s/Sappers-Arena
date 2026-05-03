import React, { useEffect, useMemo, useState } from 'react';
import { Trophy } from 'lucide-react';
import { t } from '../../lib/i18n';

export default function AchievementBanner({ items, onDone, textForId }) {
  const incoming = useMemo(() => (Array.isArray(items) ? items.map(String).filter(Boolean) : []), [items]);
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    if (!incoming.length) return;
    setQueue((prev) => {
      const out = [...(Array.isArray(prev) ? prev : [])];
      for (const id of incoming) {
        if (!out.includes(id)) out.push(id);
      }
      return out;
    });
  }, [incoming]);

  useEffect(() => {
    if (!queue.length) return;
    const tt = setTimeout(() => {
      setQueue((prev) => {
        const arr = Array.isArray(prev) ? [...prev] : [];
        arr.shift();
        return arr;
      });
    }, 2600);
    return () => clearTimeout(tt);
  }, [queue]);

  useEffect(() => {
    if (queue.length !== 0) return;
    if (!incoming.length) return;
    onDone?.();
  }, [queue.length, incoming.length, onDone]);

  if (!queue.length) return null;
  const current = queue[0];

  const label = (id) => {
    try {
      const v = textForId?.(id);
      if (v) return v;
    } catch {}
    return String(id || '').toUpperCase();
  };

  return (
    <div className="fixed top-14 left-0 right-0 z-[200] px-3 pt-2" data-testid="achievement-banner">
      <div className="glass-panel rounded-xl px-4 py-2 border border-[#FFD700]/30 bg-[rgba(255,215,0,0.06)] shadow-[0_0_18px_rgba(255,215,0,0.15)]">
        <div className="flex items-center gap-2">
          <Trophy size={14} className="neon-gold" />
          <div className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-display">{t('achievements.toast')}</div>
        </div>
        <div className="mt-1 text-[12px] font-mono text-slate-200">
          <div className="truncate">{label(current)}</div>
          {queue.length > 1 && (
            <div className="text-[11px] text-slate-400">+{queue.length - 1} {t('achievements.more')}</div>
          )}
        </div>
      </div>
    </div>
  );
}
