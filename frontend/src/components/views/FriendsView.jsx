import React, { useState } from 'react';
import axios from 'axios';
import { Search, Users, Trophy, User, AlertCircle, Clock } from 'lucide-react';
import { t } from '../../lib/i18n';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function FriendsView() {
  const [query, setQuery] = useState('');
  const [stats, setStats] = useState(null);
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const doSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setError(null); setStats(null); setPlayer(null);
    try {
      const [pRes, sRes] = await Promise.allSettled([
        axios.get(`${API}/players/${encodeURIComponent(query.trim())}`),
        axios.get(`${API}/stats/player`, { params: { name: query.trim() } }),
      ]);
      if (pRes.status === 'fulfilled') setPlayer(pRes.value.data);
      if (sRes.status === 'fulfilled') setStats(sRes.value.data);
      if (pRes.status === 'rejected') setError(t('friends.noResult'));
    } catch {
      setError(t('friends.noResult'));
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-[1600px] mx-auto w-full px-4 md:px-6 pb-10" data-testid="friends-view">
      <div className="glass-panel rounded-xl p-6 mb-5">
        <div className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-display">// network</div>
        <h2 className="font-display text-2xl md:text-3xl font-black tracking-tight neon-cyan mt-1 flex items-center gap-3">
          <Users size={26} /> {t('friends.title')}
        </h2>
        <p className="text-xs text-slate-400 mt-1">{t('friends.blurb')}</p>
      </div>

      <div className="glass-panel rounded-xl p-6 mb-5">
        <form onSubmit={doSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="neon-input pl-10" placeholder={t('friends.searchPlaceholder')}
              value={query} onChange={(e) => setQuery(e.target.value)} maxLength={20}
              data-testid="friends-search-input" />
          </div>
          <button type="submit" disabled={!query.trim() || loading} className="neon-btn px-5" data-testid="friends-search-btn">
            {loading ? '...' : t('common.search')}
          </button>
        </form>
        {error && <div className="mt-3 neon-coral text-[12px] font-mono flex items-center gap-1.5" data-testid="friends-error"><AlertCircle size={11} />{error}</div>}
      </div>

      {player && (
        <div className="glass-panel rounded-xl p-6" data-testid="friend-profile">
          <div className="flex items-center gap-3 mb-4">
            <User size={22} className="neon-cyan" />
            <div>
              <div className="font-display text-2xl font-black neon-cyan">{player.nickname}</div>
              <div className="text-[10px] text-slate-500 tracking-[0.25em] uppercase font-display">
                {player.is_admin ? 'ADMIN · ' : ''}ELO {player.rating} · {(player.owned_items || []).length} items
              </div>
            </div>
          </div>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label={t('stats.runs')} value={stats.total_runs} color="cyan" />
              <Stat label={t('stats.wins')} value={stats.wins} color="lime" />
              <Stat label={t('stats.losses')} value={stats.losses} color="coral" />
              <Stat label={t('stats.winRate')} value={`${(stats.win_rate * 100).toFixed(1)}%`} color="gold" />
              <Stat label={t('stats.campaign')} value={stats.campaign_wins} color="cyan" />
              <Stat label={t('stats.battles')} value={stats.battle_wins} color="coral" />
              <Stat label={t('stats.bestScore')} value={stats.best_score.toLocaleString()} color="cyan" />
              <Stat label={t('stats.bestTime')} value={stats.best_time ? `${stats.best_time}s` : '—'} color="gold" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }) {
  const c = { cyan: 'neon-cyan', coral: 'neon-coral', gold: 'neon-gold', lime: 'neon-lime' }[color];
  return (
    <div className="glass-panel-light rounded-lg p-3">
      <div className="text-[9px] tracking-[0.25em] uppercase text-slate-400 font-display">{label}</div>
      <div className={`font-mono font-bold text-xl ${c} mt-0.5`}>{value}</div>
    </div>
  );
}
