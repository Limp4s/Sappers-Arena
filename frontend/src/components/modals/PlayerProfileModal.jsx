import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { X, Trophy, User, Clock } from 'lucide-react';
import { fetchPlayer } from '../../lib/player';
import { t, useLang } from '../../lib/i18n';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://sappers-arena.onrender.com';
const API = `${BACKEND_URL}/api`;

export default function PlayerProfileModal({ nickname, playerNum, onClose }) {
  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState(null);
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
      const v = Math.max(0, Math.floor(n) - 1);
      return String(v).padStart(3, '0');
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

  return (
    <div className="modal-backdrop" data-testid="player-profile-modal">
      <div className="glass-panel slide-up rounded-2xl p-6 max-w-2xl w-[94%] max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-black neon-cyan flex items-center gap-2">
            <User size={18} /> {titleNick}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white" data-testid="close-player-profile-btn"><X size={18} /></button>
        </div>

        {loading ? (
          <div className="text-slate-500 text-xs text-center py-10">{t('profile.loading')}</div>
        ) : err ? (
          <div className="text-slate-500 text-xs text-center py-10">{err}</div>
        ) : (
          <>
            <div className="glass-panel-light rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-display">// identity</div>
                  <div className="text-[10px] tracking-[0.25em] uppercase text-slate-500 font-display mt-2">
                    {t('profile.playerId')}
                    <span className="ml-2 font-mono text-[14px] font-black text-white tracking-[0.12em] no-text-shadow">{prettyPlayerId}</span>
                  </div>
                </div>

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
          </>
        )}
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
