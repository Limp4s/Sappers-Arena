import React, { useEffect, useMemo, useState } from 'react';
import { Trophy, X } from 'lucide-react';
import { fetchAchievementDefs, fetchMyAchievements } from '../../lib/player';
import { t } from '../../lib/i18n';

export default function AchievementsModal({ open, onClose }) {
  const [defs, setDefs] = useState(null);
  const [mine, setMine] = useState(null);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setDefs(null);
    setMine(null);
    Promise.all([fetchAchievementDefs(), fetchMyAchievements()])
      .then(([d, m]) => {
        if (!alive) return;
        setDefs(d || null);
        setMine(m || null);
      })
      .catch(() => {
        if (!alive) return;
        setDefs({ achievements: [] });
        setMine({ unlocked: {}, unlocked_count: 0 });
      });
    return () => { alive = false; };
  }, [open]);

  const achUnlocked = useMemo(() => (mine?.unlocked && typeof mine.unlocked === 'object') ? mine.unlocked : {}, [mine?.unlocked]);
  const achList = useMemo(() => {
    const list = defs?.achievements;
    return Array.isArray(list) ? list : [];
  }, [defs?.achievements]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" data-testid="achievements-modal">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-[820px] glass-panel rounded-2xl border border-white/10 p-4 md:p-5">
        <div className="flex items-center gap-2">
          <Trophy size={14} className="neon-gold" />
          <div className="font-display text-xs font-bold tracking-[0.25em] uppercase text-slate-200">{t('achievements.title')}</div>
          <div className="ml-auto text-[11px] font-mono text-slate-400">
            {(mine?.unlocked_count ?? Object.keys(achUnlocked || {}).length) || 0}/{achList.length || 0}
          </div>
          <button onClick={onClose} className="ml-2 w-8 h-8 rounded-lg border border-white/10 bg-black/20 flex items-center justify-center hover:border-white/20" aria-label="close">
            <X size={14} className="text-slate-300" />
          </button>
        </div>

        {!defs || !mine ? (
          <div className="text-slate-500 text-xs text-center py-10">{t('profile.loading')}</div>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {achList.map((a) => {
              const id = a?.id;
              const unlockedAt = id ? achUnlocked?.[id] : null;
              const isUnlocked = !!unlockedAt;
              return (
                <div
                  key={id}
                  className={`group glass-panel rounded-lg p-3 flex gap-3 items-start transition-transform duration-150 hover:scale-[1.03] ${isUnlocked ? '' : 'opacity-60'}`}
                >
                  <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${isUnlocked ? 'border-[#FFD700]/50 bg-[#FFD700]/10' : 'border-white/10 bg-black/20'}`}>
                    <Trophy size={16} className={isUnlocked ? 'neon-gold' : 'text-slate-500'} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-display tracking-[0.2em] uppercase text-slate-200 truncate">{t(`achievements.items.${id}.title`)}</div>
                    <div className="text-[11px] font-mono text-slate-300 leading-snug mt-1">{t(`achievements.items.${id}.cond`)}</div>
                    <div className="text-[11px] font-mono text-slate-400 leading-snug mt-1 hidden group-hover:block">{t(`achievements.items.${id}.desc`)}</div>
                    {isUnlocked && (
                      <div className="text-[10px] font-mono text-slate-500 mt-2">{t('achievements.unlocked')}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
