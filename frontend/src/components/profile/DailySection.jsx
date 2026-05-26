import React from 'react';
import axios from 'axios';
import { Award, Check, AlertCircle, Flame } from 'lucide-react';
import { DAILY_QUESTS, claimDailyQuest, getDailyCoins, getDailyState, getQuestProgress, secondsUntilDailyReset } from '../../lib/dailies';
import { getToken, authHeaders } from '../../lib/player';
import { t } from '../../lib/i18n';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://sappers-arena.onrender.com';
const API = `${BACKEND_URL}/api`;

export default function DailySection({ player, onPlayerUpdate, newUnlocked, setNewUnlocked }) {
  const [dailyState, setDailyState] = React.useState(() => getDailyState());
  const [dailyCoins, setDailyCoins] = React.useState(() => getDailyCoins());
  const [dailyMsg, setDailyMsg] = React.useState(null);
  const [dailyOnlineState, setDailyOnlineState] = React.useState(null);

  // Simplified: check online status once on mount
  React.useEffect(() => {
    const tok = getToken?.();
    const online = !!tok && !(tok || '').startsWith('offline-');
    if (!online) {
      setDailyOnlineState(null);
      return;
    }

    axios.get(`${API}/daily/state`, { headers: authHeaders() })
      .then((r) => {
        const data = r?.data || {};
        setDailyOnlineState({ ...(data || {}), offline: false });
      })
      .catch(() => {
        setDailyOnlineState({ offline: true });
      });
  }, []);

  const isOnline = dailyOnlineState && !dailyOnlineState.offline;
  const state = isOnline ? dailyOnlineState : dailyState;
  const coins = isOnline ? (dailyOnlineState.claimed_coins || 0) : (dailyCoins || 0);
  const resetSeconds = isOnline ? (dailyOnlineState.seconds_until_reset || 0) : secondsUntilDailyReset();

  // Calculate daily streak
  const streak = React.useMemo(() => {
    const lastCompleted = state?.last_completed_date;
    if (!lastCompleted) return 0;
    
    const lastDate = new Date(lastCompleted);
    const today = new Date();
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // If completed today or yesterday, streak is valid
    if (diffDays <= 1) {
      return state?.streak || 1;
    }
    // Streak broken
    return 0;
  }, [state]);

  const handleClaim = (q) => {
    const tok = getToken?.();
    const online = !!tok && !(tok || '').startsWith('offline-');
    if (online) {
      setDailyMsg(null);
      axios.post(`${API}/daily/claim`, { quest_id: q.id }, { headers: authHeaders() })
        .then((r) => {
          const data = r.data || {};
          if (data.player) onPlayerUpdate?.(data.player);
          if (data.daily) setDailyOnlineState((prev) => ({ ...(prev || {}), ...(data.daily || {}) }));
          const awarded = data.coins_awarded || 0;
          const nu = Array.isArray(data?.new_unlocked) ? data.new_unlocked : [];
          if (nu.length) setNewUnlocked(nu);
          const extra = nu.length ? ` · +${nu.length} ${t('achievements.title')}` : '';
          setDailyMsg({ ok: true, text: `${t('daily.claimed')} +${awarded} ${t('daily.coinsShort')}${extra}` });
        })
        .catch((e) => {
          const detail = e?.response?.data?.detail || t('profile.failed');
          setDailyMsg({ ok: false, text: detail });

          axios.get(`${API}/daily/state`, { headers: authHeaders() })
            .then((r2) => {
              const data2 = r2?.data || {};
              setDailyOnlineState({ ...(data2 || {}), offline: false });
            })
            .catch(() => {});
        });
      return;
    }

    const res = claimDailyQuest(q.id);
    setDailyState(res?.state || getDailyState());
    setDailyCoins(getDailyCoins());
    if (res?.ok) {
      const awarded = res.coinsAwarded || 0;
      setDailyMsg({ ok: true, text: `${t('daily.claimed')} +${awarded} ${t('daily.coinsShort')}` });
      try { onPlayerUpdate?.({ coins: (player?.coins || 0) + awarded }); } catch {}
    }
  };

  const activeIds = state?.active || [];
  const setIds = new Set(activeIds.map(String));
  const quests = DAILY_QUESTS.filter((qq) => setIds.has(String(qq.id)));

  const hh = Math.floor(resetSeconds / 3600);
  const mm = Math.floor((resetSeconds % 3600) / 60);

  return (
    <div className="glass-panel rounded-xl p-6 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Award size={14} className="neon-gold" />
        <h3 className="font-display text-sm font-bold tracking-[0.25em] uppercase">{t('daily.title')}</h3>
      </div>

      <div className="glass-panel-light rounded-xl p-4" data-testid="daily-quests">
        <div className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-display mb-2">
          {t('daily.subtitle')}
        </div>

        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="text-[11px] font-mono text-slate-400">
            {t('daily.coins')}: <span className="neon-gold">{coins.toLocaleString()}</span>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            {t('daily.resetIn')}: {`${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`}
          </div>
        </div>

        {streak > 0 && (
          <div className="flex items-center gap-2 mb-3 glass-panel rounded-lg px-3 py-2">
            <Flame size={14} className="neon-orange" />
            <div className="text-[11px] font-mono text-slate-300">
              {t('daily.streak')}: <span className="neon-orange font-bold">{streak}</span>
            </div>
          </div>
        )}

        {dailyMsg && (
          <div className={`text-[11px] font-mono flex items-center gap-1.5 mb-3 ${dailyMsg.ok ? 'neon-lime' : 'neon-coral'}`}>
            {dailyMsg.ok ? <Check size={11} /> : <AlertCircle size={11} />}{dailyMsg.text}
          </div>
        )}

        <div className="space-y-2">
          {quests.map((q) => {
            const qp = getQuestProgress(state, q);
            const labelKey = `daily.quests.${q.id}`;
            return (
              <div key={q.id} className="glass-panel rounded-lg px-3 py-2 flex items-center gap-3">
                <div className={`text-[11px] font-mono ${qp.done ? 'neon-lime' : 'text-slate-300'}`}>
                  {qp.cur}/{qp.target}
                </div>
                <div className="flex-1 text-[11px] text-slate-200">
                  {t(labelKey)}
                  <span className="ml-2 text-[10px] font-mono text-slate-500">+{q.rewardCoins || 0} {t('daily.coinsShort')}</span>
                </div>
                {qp.claimed ? (
                  <div className="text-[11px] font-mono neon-gold">{t('daily.claimed')}</div>
                ) : qp.done ? (
                  <button
                    className="neon-btn px-3 py-1 text-[10px]"
                    onClick={() => handleClaim(q)}
                    data-testid={`daily-claim-${q.id}`}
                  >
                    {t('daily.claim')}
                  </button>
                ) : (
                  <div className="text-[11px] font-mono text-slate-500">{t('daily.inProgress')}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
