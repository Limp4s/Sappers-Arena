import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Trophy, Clock, User, Search, Trash2, Crown, Shield, Sparkles } from 'lucide-react';
import { getStoredNickname, adminHeaders } from '../../lib/player';
import { t, useLang } from '../../lib/i18n';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

const SCOPES = [
  { key: 'campaign', mode: 'campaign' },
  { key: 'battle_simple', mode: 'battle_simple' },
  { key: 'battle_ranked', mode: 'battle_ranked' },
  { key: 'custom', mode: 'custom' },
  { key: 'all', mode: null },
];

export default function LeaderboardView({ isAdmin = false }) {
  const [scope, setScope] = useState('campaign');
  const [entries, setEntries] = useState([]);
  const [recent, setRecent] = useState([]);
  const [rankedPlayers, setRankedPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nameQuery, setNameQuery] = useState(() => getStoredNickname());
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  useLang();

  const fetchLeaderboard = useCallback(async (selectedScope) => {
    setLoading(true);
    try {
      const def = SCOPES.find((s) => s.key === selectedScope);
      const params = { limit: 20 };
      if (def?.mode) params.mode = def.mode;
      const res = await axios.get(`${API}/leaderboard`, { params });
      setEntries(res.data || []);
    } catch (e) { setEntries([]); } finally { setLoading(false); }
  }, []);

  const fetchRecent = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/leaderboard/recent`, { params: { limit: 8 } });
      setRecent(res.data || []);
    } catch {}
  }, []);

  const fetchRanked = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/leaderboard/ranked`, { params: { limit: 10 } });
      setRankedPlayers(res.data || []);
    } catch {}
  }, []);

  const fetchStats = useCallback(async (name) => {
    if (!name || !name.trim()) { setStats(null); return; }
    setStatsLoading(true);
    try {
      const res = await axios.get(`${API}/stats/player`, { params: { name: name.trim() } });
      setStats(res.data);
    } catch { setStats(null); } finally { setStatsLoading(false); }
  }, []);

  useEffect(() => { fetchLeaderboard(scope); }, [scope, fetchLeaderboard]);
  useEffect(() => { fetchRecent(); fetchRanked(); }, [fetchRecent, fetchRanked]);
  useEffect(() => { if (nameQuery) fetchStats(nameQuery); }, [nameQuery, fetchStats]);

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm(t('leaderboard.deleteConfirm'))) return;
    try {
      await axios.delete(`${API}/leaderboard/${id}`, { headers: adminHeaders() });
      await fetchLeaderboard(scope);
      await fetchRecent();
    } catch (e) { alert('Delete failed: ' + (e?.response?.data?.detail || e.message)); }
  };

  const getRankColor = (i) => i === 0 ? 'neon-gold' : i === 1 ? 'neon-cyan' : i === 2 ? 'neon-coral' : 'text-slate-500';

  const showLevelCol = scope === 'campaign';
  const cols = isAdmin
    ? (showLevelCol ? '28px 1fr 50px 70px 50px 56px 26px' : '28px 1fr 70px 56px 26px')
    : (showLevelCol ? '28px 1fr 50px 70px 50px 56px'     : '28px 1fr 70px 56px');

  return (
    <div className="max-w-[1600px] mx-auto w-full px-4 md:px-6 pb-10" data-testid="leaderboard-view">
      <div className="glass-panel rounded-xl p-6 mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-display">// global grid</div>
          <h2 className="font-display text-2xl md:text-3xl font-black tracking-tight neon-cyan mt-1 flex items-center gap-3">
            <Trophy size={26} className="neon-gold" />
            {t('leaderboard.title')}
            {isAdmin && (
              <span className="flex items-center gap-1 text-[11px] neon-gold font-display tracking-[0.25em] bg-[#FFD700]/10 border border-[#FFD700]/50 px-2 py-0.5 rounded" data-testid="admin-badge">
                <Crown size={11} /> ADMIN
              </span>
            )}
          </h2>
        </div>

        <div className="glass-panel-light rounded-full p-1 flex gap-1 flex-wrap">
          {SCOPES.map((s) => (
            <button key={s.key} onClick={() => setScope(s.key)}
              className={`px-3 py-2 rounded-full font-display text-[10px] tracking-[0.2em] font-semibold uppercase transition-all ${
                scope === s.key ? 'bg-[rgba(0,229,255,0.12)] text-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.3)]' : 'text-slate-400 hover:text-slate-200'
              }`}
              data-testid={`scope-${s.key}`}
            >
              {s.key === 'campaign' ? t('tabs.campaign')
                : s.key === 'battle_simple' ? t('tabs.battles')
                : s.key === 'battle_ranked' ? t('battles.rankedTitle')
                : s.key === 'custom' ? t('tabs.custom')
                : 'ALL'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        <div className="glass-panel rounded-xl p-6 min-h-[400px]">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={14} className="neon-gold" />
            <h3 className="font-display text-sm font-bold tracking-[0.25em] uppercase">
              {t('leaderboard.top')} · {scope === 'campaign' ? t('tabs.campaign')
                : scope === 'battle_simple' ? t('tabs.battles')
                : scope === 'battle_ranked' ? t('battles.rankedTitle')
                : scope === 'custom' ? t('tabs.custom')
                : 'ALL'}
            </h3>
          </div>

          <div className="space-y-1" data-testid="leaderboard-list">
            <div className="grid gap-2 text-slate-500 text-[10px] tracking-[0.2em] uppercase border-b border-white/5 pb-2 mb-1 px-3" style={{ gridTemplateColumns: cols }}>
              <div>#</div>
              <div>{t('leaderboard.name')}</div>
              {showLevelCol && <div>{t('leaderboard.lvl')}</div>}
              <div className="text-right">{t('leaderboard.score')}</div>
              {showLevelCol && <div className="text-right">LIVES LEFT</div>}
              <div className="text-right">{t('leaderboard.time')}</div>
              {isAdmin && <div />}
            </div>

            {loading && <div className="text-center text-slate-500 text-xs py-8">{t('leaderboard.loading')}</div>}
            {!loading && entries.length === 0 && (
              <div className="text-center text-slate-500 text-xs py-8">
                <Sparkles size={18} className="mx-auto mb-2 opacity-50" /> {t('leaderboard.noRecords')}
              </div>
            )}
            {!loading && entries.map((e, i) => {
              const livesRem = e.lives_remaining ?? 0;
              const livesTotalVal = e.lives_total ?? 3;
              return (
                <div
                  key={e.id}
                  className="grid gap-2 px-3 py-2 rounded items-center text-[12px] font-mono hover:bg-[rgba(0,229,255,0.06)] transition-colors"
                  style={{ gridTemplateColumns: cols }}
                  data-testid={`lb-entry-${i}`}
                >
                  <div className={`font-display font-bold ${getRankColor(i)}`}>{String(i + 1).padStart(2, '0')}</div>
                  <div className="truncate text-slate-200 flex items-center gap-1.5">
                    {e.player_name}
                    {(e.player_name || '').toLowerCase() === 'limp4' && <Crown size={10} className="neon-gold shrink-0" />}
                  </div>
                  {showLevelCol && <div className="neon-lime text-[11px] font-bold">{e.level_id != null ? String(e.level_id).padStart(2, '0') : '—'}</div>}
                  <div className="text-right neon-cyan">{e.score.toLocaleString()}</div>
                  {showLevelCol && (
                    <div className="text-right text-[11px]" data-testid={`lb-lives-remaining-${i}`}>
                      <span className="neon-lime">{livesRem}</span>
                      <span className="text-slate-600">/{livesTotalVal}</span>
                    </div>
                  )}
                  <div className="text-right text-slate-400">{String(e.time_seconds).padStart(3, '0')}s</div>
                  {isAdmin && (
                    <button onClick={() => handleDelete(e.id)}
                      className="text-slate-600 hover:text-[#FF2A6D] transition-colors justify-self-end"
                      title="Delete entry" data-testid={`admin-delete-${i}`}
                    ><Trash2 size={13} /></button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <aside className="space-y-5">
          {/* Ranked players panel */}
          <div className="glass-panel rounded-xl p-5" data-testid="ranked-players-card">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={14} className="neon-gold" />
              <h3 className="font-display text-xs font-bold tracking-[0.25em] uppercase">{t('leaderboard.topRanked')}</h3>
            </div>
            <div className="space-y-1" data-testid="ranked-players-list">
              {rankedPlayers.length === 0 && <div className="text-slate-500 text-[11px] text-center py-4">{t('leaderboard.noRankedRunsYet')}</div>}
              {rankedPlayers.slice(0, 10).map((p, i) => (
                <div key={p.nickname} className="flex items-center justify-between text-[11px] py-1.5 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2 truncate">
                    <span className={`font-display font-bold ${getRankColor(i)} w-4`}>{i + 1}</span>
                    <span className="truncate text-slate-200">{p.nickname}</span>
                  </div>
                  <span className="neon-gold font-mono font-bold">{p.rating || 1000}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-5" data-testid="player-stats-card">
            <div className="flex items-center gap-2 mb-3">
              <User size={14} className="neon-cyan" />
              <h3 className="font-display text-xs font-bold tracking-[0.25em] uppercase">{t('leaderboard.agentStats')}</h3>
            </div>
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input className="neon-input pl-9" placeholder={t('leaderboard.callsignPlaceholder')} value={nameQuery}
                  onChange={(e) => setNameQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') fetchStats(nameQuery); }}
                  data-testid="stats-name-input" maxLength={20} />
              </div>
              <button onClick={() => fetchStats(nameQuery)} className="neon-btn px-3 py-2 text-[10px]" data-testid="stats-fetch-btn">{t('leaderboard.scan')}</button>
            </div>
            {statsLoading && <div className="text-slate-500 text-xs text-center py-4">{t('leaderboard.scanning')}</div>}
            {!statsLoading && stats && (
              <div className="space-y-2">
                <StatLine label={t('stats.runs')} value={stats.total_runs} color="cyan" />
                <StatLine label={t('stats.wins')} value={stats.wins} color="lime" />
                <StatLine label={t('stats.losses')} value={stats.losses} color="coral" />
                <StatLine label={t('stats.winRate')} value={`${(stats.win_rate * 100).toFixed(1)}%`} color="gold" />
                <StatLine label={t('stats.bestScore')} value={stats.best_score.toLocaleString()} color="cyan" />
                <StatLine label={t('stats.bestTime')} value={stats.best_time ? `${stats.best_time}s` : '—'} color="gold" />
              </div>
            )}
            {!statsLoading && !stats && <div className="text-slate-500 text-xs text-center py-4">{t('leaderboard.enterCallsignHint')}</div>}
          </div>

          {isAdmin && (
            <div className="glass-panel rounded-xl p-5 border border-[#FFD700]/30" data-testid="admin-panel">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={14} className="neon-gold" />
                <h3 className="font-display text-xs font-bold tracking-[0.25em] uppercase neon-gold">{t('admin.panelTitle')}</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{t('admin.panelHint')}</p>
            </div>
          )}

          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="neon-cyan" />
              <h3 className="font-display text-xs font-bold tracking-[0.25em] uppercase">{t('leaderboard.recentActivity')}</h3>
            </div>
            <div className="space-y-2" data-testid="recent-list">
              {recent.length === 0 && <div className="text-slate-500 text-[11px] text-center py-4">{t('leaderboard.noRunsYet')}</div>}
              {recent.map((r) => (
                <div key={r.id} className="flex items-center justify-between text-[11px] py-1.5 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2 truncate">
                    <span className={`w-1.5 h-1.5 rounded-full ${r.won ? 'bg-[#00FF9D]' : 'bg-[#FF2A6D]'}`} />
                    <span className="truncate text-slate-300">{r.player_name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 font-mono shrink-0">
                    <span>{r.mode}</span>
                    <span className="neon-cyan">{r.score.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatLine({ label, value, color }) {
  const colorClass = { cyan: 'neon-cyan', coral: 'neon-coral', gold: 'neon-gold', lime: 'neon-lime' }[color];
  return (
    <div className="flex items-center justify-between text-[11px] font-mono border-b border-white/5 pb-1.5 last:border-0 last:pb-0">
      <span className="text-[9px] tracking-[0.25em] uppercase text-slate-500 font-display">{label}</span>
      <span className={`font-bold ${colorClass}`}>{value}</span>
    </div>
  );
}
