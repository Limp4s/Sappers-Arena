import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { X, Trophy, User, Clock, Crown } from 'lucide-react';
import { fetchPlayer, isOwnerNick } from '../../lib/player';
import { t, useLang } from '../../lib/i18n';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://sappers-arena.onrender.com';
const API = `${BACKEND_URL}/api`;

export default function PlayerProfileModal({ nickname, playerNum, onClose }) {
  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState(null);
  const [achDefs, setAchDefs] = useState(null);
  const [ach, setAch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  useLang();

  const titleNick = useMemo(() => {
    if (player?.nickname) return player.nickname;
    return nickname || '—';
  }, [player?.nickname, nickname]);

  const prettyPlayerId = useMemo(() => {
    const n = player?.player_num;
    if (typeof n === 'number' && Number.isFinite(n)) {
      const v = Math.max(0, Math.floor(n));
      return String(v).padStart(8, '0');
    }
    return '—';
  }, [player?.player_num]);

  const rankIconSrc = (league) => {
    const map = {
      wood: '/ranks/wood.png',
      stone: '/ranks/stone.png',
      bronze: '/ranks/bronze.png',
      iron: '/ranks/iron.png',
      gold: '/ranks/gold.png',
      diamond: '/ranks/diamond.png',
      top500: '/ranks/top500.png',
    };
    return map[String(league || '').toLowerCase()] || null;
  };

  useEffect(() => {
    let alive = true;
    const run = async () => {
      setLoading(true);
      setErr(null);
      setPlayer(null);
      setStats(null);
      setAchDefs(null);
      setAch(null);
      try {
        let p;
        if (playerNum != null && playerNum !== '' && !Number.isNaN(Number(playerNum))) {
          const res = await axios.get(`${API}/players/by-num/${encodeURIComponent(String(playerNum))}`);
          p = res.data;
        } else {
          p = await fetchPlayer(String(nickname || '').trim());
        }
        if (!alive) return;
        setPlayer(p);
        try {
          const nm = String(p?.nickname || nickname || '').trim();
          if (nm) {
            const st = await axios.get(`${API}/stats/player`, { params: { name: nm } });
            if (!alive) return;
            setStats(st.data);
          }
        } catch {
          if (!alive) return;
          setStats(null);
        }

        try {
          const nm = String(p?.nickname || nickname || '').trim();
          if (nm) {
            const [defsRes, achRes] = await Promise.all([
              axios.get(`${API}/achievements/defs`),
              axios.get(`${API}/achievements/${encodeURIComponent(nm)}`),
            ]);
            if (!alive) return;
            setAchDefs(defsRes?.data || { achievements: [] });
            setAch(achRes?.data || { unlocked: {}, unlocked_count: 0 });
          }
        } catch {
          if (!alive) return;
          setAchDefs({ achievements: [] });
          setAch({ unlocked: {}, unlocked_count: 0, offline: true });
        }
      } catch (e2) {
        if (!alive) return;
        setErr(e2?.response?.data?.detail || 'Failed');
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };
    run();
    return () => { alive = false; };
  }, [nickname, playerNum]);

  const ratingText = String(player?.rating ?? '—');
  const leagueText = String(player?.league || '').toUpperCase();
  const owner = isOwnerNick?.(player?.nickname);
  const achUnlocked = (ach?.unlocked && typeof ach.unlocked === 'object') ? ach.unlocked : {};
  const achList = Array.isArray(achDefs?.achievements) ? achDefs.achievements : [];

  return (
    <div className="modal-backdrop" data-testid="player-profile-modal">
      <div className="glass-panel slide-up rounded-2xl p-6 max-w-4xl w-[96%] max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-xl font-black neon-cyan flex items-center gap-2">
              <User size={18} /> {titleNick}
            </h3>
            {prettyPlayerId !== '—' && (
              <div className="mt-1 text-[10px] tracking-[0.25em] uppercase text-slate-500 font-display">
                {t('profile.playerId')}: <span className="font-mono text-white/90 drop-shadow-[0_0_6px_rgba(255,255,255,0.35)]">{prettyPlayerId}</span>
              </div>
            )}
            {!!player?.is_admin && (
              <div className="mt-1">
                <span className="inline-flex items-center gap-1 text-[11px] neon-gold font-display tracking-[0.25em] bg-[#FFD700]/10 border border-[#FFD700]/50 px-2 py-0.5 rounded">
                  <Crown size={11} className="neon-gold" /> {owner ? t('admin.ownerTitle') : t('admin.adminTitle')}
                </span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white" data-testid="close-player-profile-btn"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-auto pr-1">
          {loading ? (
            <div className="text-slate-500 text-xs text-center py-10">{t('profile.loading')}</div>
          ) : err ? (
            <div className="text-slate-500 text-xs text-center py-10">{err}</div>
          ) : (
            <>
            <div className="glass-panel-light rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {(player?.league || player?.ranked_place) && (
                    <span className="flex items-center gap-1 text-[11px] font-display tracking-[0.25em] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-slate-200">
                      {rankIconSrc(player?.league) ? (
                        <img src={rankIconSrc(player?.league)} alt="rank" className="w-10 h-10" />
                      ) : (
                        <Trophy size={11} className="neon-gold" />
                      )}
                      {player?.league === 'top500' && player?.ranked_place ? `TOP ${player.ranked_place}` : leagueText}
                    </span>
                  )}
                  <span className="font-mono text-2xl font-bold neon-gold">{ratingText}</span>
                </div>
              </div>
            </div>

            <div className="glass-panel-light rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={14} className="neon-gold" />
                <h3 className="font-display text-xs font-bold tracking-[0.25em] uppercase">{t('profile.lifetimeStats')}</h3>
              </div>

              {stats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Stat label={t('stats.runs')} value={stats.total_runs} color="cyan" />
                  <Stat label={t('stats.wins')} value={stats.wins} color="lime" />
                  <Stat label={t('stats.losses')} value={stats.losses} color="coral" />
                  <Stat label={t('stats.winRate')} value={`${(stats.win_rate * 100).toFixed(1)}%`} color="gold" />
                  <Stat label={t('stats.campaign')} value={stats.campaign_wins} color="cyan" />
                  <Stat label={t('stats.battles')} value={stats.battle_wins} color="coral" />
                  <Stat label={t('stats.bestScore')} value={(typeof stats.best_score === 'number') ? stats.best_score.toLocaleString() : '—'} color="cyan" />
                  <Stat label={t('stats.bestTime')} value={stats.best_time ? `${stats.best_time}s` : '—'} color="gold" />
                </div>
              ) : (
                <div className="text-slate-500 text-xs text-center py-6">
                  <Clock size={16} className="mx-auto mb-2 opacity-60" />
                  {t('leaderboard.noRecords')}
                </div>
              )}
            </div>

            <div className="glass-panel-light rounded-xl p-5 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={14} className="neon-gold" />
                <h3 className="font-display text-xs font-bold tracking-[0.25em] uppercase">{t('achievements.title')}</h3>
                <div className="ml-auto text-[11px] font-mono text-slate-400">
                  {(ach?.unlocked_count ?? Object.keys(achUnlocked || {}).length) || 0}/{achList.length || 0}
                </div>
              </div>

              {!achDefs || !ach ? (
                <div className="text-slate-500 text-xs text-center py-6">{t('profile.loading')}</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {achList.map((a) => {
                    const id = a?.id;
                    const isUnlocked = !!(id && achUnlocked?.[id]);
                    return (
                      <div key={id} className={`group glass-panel rounded-lg p-3 flex gap-2 items-start transition-transform duration-150 hover:scale-[1.03] ${isUnlocked ? '' : 'opacity-60'}`}>
                        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${isUnlocked ? 'border-[#FFD700]/50 bg-[#FFD700]/10' : 'border-white/10 bg-black/20'}`}>
                          <Trophy size={14} className={isUnlocked ? 'neon-gold' : 'text-slate-500'} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-display tracking-[0.2em] uppercase text-slate-200 truncate">{t(`achievements.items.${id}.title`)}</div>
                          <div className="text-[10px] font-mono text-slate-300 leading-snug mt-1 line-clamp-2">{t(`achievements.items.${id}.cond`)}</div>
                          <div className="text-[10px] font-mono text-slate-400 leading-snug mt-1 hidden group-hover:block">{t(`achievements.items.${id}.desc`)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  const c = { cyan: 'neon-cyan', coral: 'neon-coral', gold: 'neon-gold', lime: 'neon-lime' }[color];
  return (
    <div className="glass-panel rounded-lg p-3">
      <div className="text-[9px] tracking-[0.25em] uppercase text-slate-400 font-display">{label}</div>
      <div className={`font-mono font-bold text-xl ${c} mt-0.5`}>{value}</div>
    </div>
  );
}
