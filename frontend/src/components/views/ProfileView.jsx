import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { User, LogOut, KeyRound, Package, Coins, Shield, Trophy, Check, AlertCircle, UserPlus, Volume2, Award } from 'lucide-react';
import { logout, changePassword, validatePassword, getPlayerId, adminListPlayers, adminFixNegativeRatings, adminDeletePlayer, getToken, authHeaders, fetchAchievementDefs, fetchMyAchievements } from '../../lib/player';
import { promoteToAdmin } from '../../lib/lobby';
import { getSfxVolume, setSfxVolume, sfx } from '../../lib/sounds';
import { DAILY_QUESTS, claimDailyQuest, getDailyCoins, getDailyState, getQuestProgress, secondsUntilDailyReset } from '../../lib/dailies';
import InventoryModal from '../modals/InventoryModal';
import PlayerProfileModal from '../modals/PlayerProfileModal';
import AchievementBanner from '../ui/AchievementBanner';
import { LANGUAGES, setLang, t, useLang } from '../../lib/i18n';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://sappers-arena.onrender.com';
const API = `${BACKEND_URL}/api`;

export default function ProfileView({ player, onPlayerUpdate, onLogout }) {
  const [stats, setStats] = useState(null);
  const [showInventory, setShowInventory] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const [showPromote, setShowPromote] = useState(false);
  const [sfxVolume, setSfxVolumeState] = useState(() => getSfxVolume());
  const [viewQuery, setViewQuery] = useState('');
  const [viewNick, setViewNick] = useState(null);
  const [viewNum, setViewNum] = useState(null);
  const [adminPlayers, setAdminPlayers] = useState(null);
  const [adminPlayersQuery, setAdminPlayersQuery] = useState('');
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminMsg, setAdminMsg] = useState(null);
  const [lang] = useLang();
  const [tab, setTab] = useState('daily');
  const [settingsTab, setSettingsTab] = useState('account');
  const [dailyState, setDailyState] = useState(() => getDailyState());
  const [dailyCoins, setDailyCoins] = useState(() => getDailyCoins());
  const [dailyMsg, setDailyMsg] = useState(null);
  const [dailyOnline, setDailyOnline] = useState(false);
  const [dailyOnlineState, setDailyOnlineState] = useState(null);
  const [newUnlocked, setNewUnlocked] = useState([]);
  const [achDefs, setAchDefs] = useState(null);
  const [achMine, setAchMine] = useState(null);

  const achUnlocked = useMemo(() => (achMine?.unlocked && typeof achMine.unlocked === 'object') ? achMine.unlocked : {}, [achMine?.unlocked]);
  const achList = useMemo(() => {
    const list = achDefs?.achievements;
    return Array.isArray(list) ? list : [];
  }, [achDefs?.achievements]);

  useEffect(() => {
    if (!player?.nick) return;
    setStats(null);
    axios.get(`${API}/stats/player`, { params: { name: player.nick } })
      .then(r => setStats(r.data))
      .catch(() => setStats({ offline: true }));
  }, [player?.nick]);

  useEffect(() => {
    setDailyState(getDailyState());
    setDailyCoins(getDailyCoins());
    setDailyMsg(null);
  }, [tab]);

  useEffect(() => {
    if (tab !== 'achievements') return;
    const tok = getToken?.();
    const online = !!tok && !(tok || '').startsWith('offline-');
    if (!online) {
      setAchDefs({ achievements: [] });
      setAchMine({ offline: true, nickname: player?.nick, unlocked: {}, unlocked_count: 0 });
      return;
    }
    setAchDefs(null);
    setAchMine(null);
    Promise.all([
      fetchAchievementDefs(),
      fetchMyAchievements(),
    ])
      .then(([defs, mine]) => {
        setAchDefs(defs || { achievements: [] });
        setAchMine(mine || { unlocked: {}, unlocked_count: 0 });
      })
      .catch(() => {
        setAchDefs({ achievements: [] });
        setAchMine({ offline: true, nickname: player?.nick, unlocked: {}, unlocked_count: 0 });
      });
  }, [tab, player?.nick]);

  useEffect(() => {
    if (tab !== 'daily') return;
    const tok = getToken?.();
    const online = !!tok && !(tok || '').startsWith('offline-');
    setDailyOnline(online);
    if (!online) { setDailyOnlineState(null); return; }
    setDailyOnlineState(null);
    axios.get(`${API}/daily/state`, { headers: authHeaders() })
      .then((r) => setDailyOnlineState(r.data))
      .catch(() => setDailyOnlineState({ offline: true }));
  }, [tab]);

  useEffect(() => {
    if (!player?.isAdmin) return;
    const tok = getToken?.();
    if (!tok || (tok || '').startsWith('offline-')) { setAdminPlayers([]); return; }
    setAdminPlayers(null);
    adminListPlayers({ limit: 500 })
      .then((r) => setAdminPlayers(r?.players || []))
      .catch(() => setAdminPlayers([]));
  }, [player?.isAdmin]);

  const refreshAdminPlayers = async () => {
    if (!player?.isAdmin) return;
    try {
      const r = await adminListPlayers({ limit: 500 });
      setAdminPlayers(r?.players || []);
    } catch {
      setAdminPlayers([]);
    }
  };

  const handleFixNegativeRatings = async () => {
    setAdminBusy(true);
    setAdminMsg(null);
    try {
      const res = await adminFixNegativeRatings();
      setAdminMsg({ ok: true, text: `Fixed: ${res?.fixed ?? 0}` });
      await refreshAdminPlayers();
    } catch (e2) {
      setAdminMsg({ ok: false, text: e2?.response?.data?.detail || 'Failed' });
    } finally {
      setAdminBusy(false);
    }
  };

  const handleDeletePlayer = async (nickname) => {
    const nickToDelete = String(nickname || '').trim();
    if (!nickToDelete) return;
    if (String(nickToDelete).toLowerCase() === String(player?.nick || '').toLowerCase()) return;
    const ok = window.confirm(`Delete account: ${nickToDelete}?`);
    if (!ok) return;
    setAdminBusy(true);
    setAdminMsg(null);
    try {
      const res = await adminDeletePlayer(nickToDelete);
      setAdminMsg({ ok: true, text: `Deleted: ${res?.deleted || nickToDelete}` });
      await refreshAdminPlayers();
    } catch (e2) {
      setAdminMsg({ ok: false, text: e2?.response?.data?.detail || 'Failed' });
    } finally {
      setAdminBusy(false);
    }
  };

  const handleLogout = async () => {
    try { await logout(); } catch {}
    onLogout?.();
  };

  const openOtherProfile = () => {
    const q = String(viewQuery || '').trim();
    if (!q) return;
    if (/^\d+$/.test(q)) {
      setViewNick(null);
      setViewNum(parseInt(q, 10));
      return;
    }
    setViewNum(null);
    setViewNick(q);
  };

  const prettyPlayerId = (() => {
    const n = player?.player_num;
    if (typeof n === 'number' && Number.isFinite(n)) {
      const v = Math.max(0, Math.floor(n) - 1);
      return String(v).padStart(3, '0');
    }
    const legacy = getPlayerId(player?.nick);
    return legacy ?? '—';
  })();

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

  const handleExitGame = async () => {
    try {
      if (window.electron?.quitApp) {
        await window.electron.quitApp();
        return;
      }
    } catch {}
    try { window.close(); } catch {}
  };

  return (
    <div className="max-w-[1600px] mx-auto w-full px-4 md:px-6 pb-10" data-testid="profile-view">
      <AchievementBanner
        items={newUnlocked}
        onDone={() => setNewUnlocked([])}
        textForId={(id) => t(`achievements.items.${id}.title`)}
      />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        <div className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-display">// identity</div>
        <div className="flex items-center gap-3">
          <h2 className="font-display text-2xl md:text-3xl font-black tracking-tight neon-cyan mt-1 flex items-center gap-3">
            <User size={26} /> {player?.nick}
          {(player?.league || player?.ranked_place) && (
            <span className="flex items-center gap-1 text-[11px] font-display tracking-[0.25em] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-slate-200">
              {rankIconSrc(player?.league) ? (
                <img src={rankIconSrc(player?.league)} alt="rank" className="w-10 h-10" />
              ) : (
                <Trophy size={11} className="neon-gold" />
              )}
              {player?.league === 'top500' && player?.ranked_place ? `TOP ${player.ranked_place}` : String(player?.league || '').toUpperCase()}
            </span>
          )}
          {player?.isAdmin && (
            <span className="flex items-center gap-1 text-[11px] neon-gold font-display tracking-[0.25em] bg-[#FFD700]/10 border border-[#FFD700]/50 px-2 py-0.5 rounded">
              <Shield size={11} /> {t('admin.title')}
            </span>
          )}
          </h2>
          <button
            onClick={() => setTab('achievements')}
            className={`ml-auto w-10 h-10 rounded-lg border transition-all flex items-center justify-center ${
              tab === 'achievements'
                ? 'border-[#00E5FF] bg-[rgba(0,229,255,0.10)] shadow-[0_0_12px_rgba(0,229,255,0.25)]'
                : 'border-white/10 bg-black/20 hover:border-white/20'
            }`}
            title={t('achievements.title')}
            data-testid="profile-top-achievements"
          >
            <Award size={16} className={tab === 'achievements' ? 'neon-cyan' : 'text-slate-400'} />
          </button>
        </div>
        <div className="text-[10px] tracking-[0.25em] uppercase text-slate-500 font-display mt-2">
          {t('profile.playerId')}
          <span className="ml-2 font-mono text-[14px] font-black text-white tracking-[0.12em] no-text-shadow">
            {prettyPlayerId}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        <div className="space-y-5">
          <div className="glass-panel rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={14} className="neon-gold" />
              <h3 className="font-display text-sm font-bold tracking-[0.25em] uppercase">{t('profile.lifetimeStats')}</h3>
            </div>
            {stats && !stats.offline ? (
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
            ) : stats?.offline ? (
              <div className="text-slate-500 text-xs text-center py-6">{t('profile.offline')}</div>
            ) : (
              <div className="text-slate-500 text-xs text-center py-6">{t('profile.loading')}</div>
            )}
          </div>

          {player?.isAdmin && (
            <div className="glass-panel rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={14} className="neon-gold" />
                <h3 className="font-display text-sm font-bold tracking-[0.25em] uppercase">ALL PLAYERS</h3>
              </div>
              <div className="flex gap-2 mb-3">
                <button
                  onClick={handleFixNegativeRatings}
                  disabled={adminBusy}
                  className="neon-btn flex-1 py-2"
                  style={{ borderColor: '#FFD700', color: '#FFD700' }}
                >
                  FIX NEGATIVE RATINGS
                </button>
              </div>
              {adminMsg && (
                <div className={`text-[11px] font-mono flex items-center gap-1.5 mb-3 ${adminMsg.ok ? 'neon-lime' : 'neon-coral'}`}>
                  {adminMsg.ok ? <Check size={11} /> : <AlertCircle size={11} />}{adminMsg.text}
                </div>
              )}
              <input
                className="neon-input mb-3"
                placeholder="SEARCH NICKNAME"
                value={adminPlayersQuery}
                onChange={(e) => setAdminPlayersQuery(e.target.value)}
              />
              {adminPlayers === null ? (
                <div className="text-slate-500 text-xs text-center py-4">{t('profile.loading')}</div>
              ) : (
                <div className="glass-panel-light rounded-lg p-3 max-h-[280px] overflow-auto">
                  {(adminPlayers || [])
                    .filter((p) => {
                      const q = (adminPlayersQuery || '').trim().toLowerCase();
                      if (!q) return true;
                      return String(p?.nickname || '').toLowerCase().includes(q);
                    })
                    .slice(0, 200)
                    .map((p) => (
                      <div key={`${p?.player_num}-${p?.nickname}`} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-b-0">
                        <div className="font-mono text-[11px] text-slate-300">#{p?.player_num ?? '—'}</div>
                        <div className="font-mono text-[11px] text-white">{p?.nickname || '—'}</div>
                        <button
                          onClick={() => handleDeletePlayer(p?.nickname)}
                          disabled={adminBusy || !p?.nickname || String(p?.nickname || '').toLowerCase() === String(player?.nick || '').toLowerCase() || !!p?.is_admin}
                          className="neon-btn neon-btn-coral px-2 py-1 text-[10px]"
                        >
                          DELETE
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          <div className="glass-panel rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound size={14} className="neon-cyan" />
              <h3 className="font-display text-sm font-bold tracking-[0.25em] uppercase">{t('profile.account')}</h3>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setTab('daily')}
                className={`pill ${tab === 'daily' ? 'pill-active' : ''}`}
                data-testid="profile-tab-daily"
              >
                {t('daily.title')}
              </button>
              <button
                onClick={() => { setTab('settings'); setSettingsTab('settings'); }}
                className={`pill ${tab === 'settings' ? 'pill-active' : ''}`}
                data-testid="profile-tab-settings"
              >
                {t('common.settings')}
              </button>
            </div>

            {tab === 'settings' ? (
              <>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setSettingsTab('settings')}
                    className={`pill ${settingsTab === 'settings' ? 'pill-active' : ''}`}
                    data-testid="profile-settings-tab-settings"
                  >
                    {t('common.settings')}
                  </button>
                  <button
                    onClick={() => setSettingsTab('account')}
                    className={`pill ${settingsTab === 'account' ? 'pill-active' : ''}`}
                    data-testid="profile-settings-tab-account"
                  >
                    {t('profile.account')}
                  </button>
                </div>

                {settingsTab === 'settings' ? (
                  <>
                    <div className="glass-panel-light rounded-xl p-4">
                      <div className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-display mb-2">{t('common.language')}</div>
                      <div className="flex gap-2 flex-wrap">
                        {LANGUAGES.map((l) => (
                          <button
                            key={l.code}
                            onClick={() => setLang(l.code)}
                            className={`pill ${lang === l.code ? 'pill-active' : ''}`}
                            data-testid={`profile-lang-${l.code}`}
                          >
                            {l.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="glass-panel-light rounded-xl p-4" data-testid="settings-sfx-volume">
                      <div className="flex items-center gap-2 mb-2">
                        <Volume2 size={14} className="neon-gold" />
                        <div className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-display">{t('settings.sound')}</div>
                        <div className="ml-auto text-[10px] font-mono text-slate-400">{Math.round((sfxVolume || 0) * 100)}%</div>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={sfxVolume}
                        onChange={(e) => {
                          const v = setSfxVolume(e.target.value);
                          setSfxVolumeState(v);
                        }}
                        onMouseUp={() => { try { sfx.click(); } catch {} }}
                        onTouchEnd={() => { try { sfx.click(); } catch {} }}
                        className="w-full"
                        data-testid="sfx-volume-slider"
                      />
                    </div>
                    <button onClick={() => setShowChangePw(true)} className="neon-btn w-full flex items-center justify-center gap-2 py-3" data-testid="open-change-password-btn">
                      <KeyRound size={14} /> {t('profile.changePassword')}
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setShowInventory(true)} className="neon-btn w-full flex items-center justify-center gap-2 py-3" data-testid="open-inventory-btn">
                      <Package size={14} /> {t('profile.inventory')}
                    </button>

                    <div className="glass-panel-light rounded-xl p-4">
                      <div className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-display mb-2">VIEW PLAYER</div>
                      <div className="flex gap-2">
                        <input
                          className="neon-input flex-1"
                          placeholder="ID or nickname"
                          value={viewQuery}
                          onChange={(e) => setViewQuery(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') openOtherProfile(); }}
                          maxLength={20}
                          data-testid="view-player-input"
                        />
                        <button
                          onClick={openOtherProfile}
                          className="neon-btn px-4"
                          data-testid="view-player-open-btn"
                        >
                          OPEN
                        </button>
                      </div>
                    </div>

                    {player?.isAdmin && (
                      <button onClick={() => setShowPromote(true)} className="neon-btn w-full flex items-center justify-center gap-2 py-3"
                        style={{ borderColor: '#FFD700', color: '#FFD700' }}
                        data-testid="open-promote-btn">
                        <UserPlus size={14} /> {t('admin.promote')}
                      </button>
                    )}
                    <button onClick={handleLogout} className="neon-btn neon-btn-coral w-full flex items-center justify-center gap-2 py-3" data-testid="logout-btn">
                      <LogOut size={14} /> {t('common.logout')}
                    </button>

                    <button onClick={handleExitGame} className="neon-btn neon-btn-coral w-full flex items-center justify-center gap-2 py-3" data-testid="exit-game-btn">
                      <LogOut size={14} /> {t('common.exit')}
                    </button>
                  </>
                )}
              </>
            ) : tab === 'achievements' ? (
              <>
                <div className="glass-panel-light rounded-xl p-4" data-testid="achievements-panel">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy size={14} className="neon-gold" />
                    <h3 className="font-display text-xs font-bold tracking-[0.25em] uppercase">{t('achievements.title')}</h3>
                    <div className="ml-auto text-[11px] font-mono text-slate-400">
                      {(achMine?.unlocked_count ?? Object.keys(achUnlocked || {}).length) || 0}/{achList.length || 0}
                    </div>
                  </div>

                  {!achDefs || !achMine ? (
                    <div className="text-slate-500 text-xs text-center py-6">{t('profile.loading')}</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
              </>
            ) : (
              <>
                <div className="glass-panel-light rounded-xl p-4" data-testid="daily-quests">
                  <div className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-display mb-2">
                    {t('daily.subtitle')}
                  </div>

                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="text-[11px] font-mono text-slate-400">
                      {t('daily.coins')}: <span className="neon-gold">{(
                        dailyOnline && dailyOnlineState && !dailyOnlineState.offline
                          ? (dailyOnlineState.claimed_coins || 0)
                          : (dailyCoins || 0)
                      ).toLocaleString()}</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      {t('daily.resetIn')}: {(() => {
                        const s = dailyOnline && dailyOnlineState && !dailyOnlineState.offline
                          ? (dailyOnlineState.seconds_until_reset || 0)
                          : secondsUntilDailyReset();
                        const hh = Math.floor(s / 3600);
                        const mm = Math.floor((s % 3600) / 60);
                        return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
                      })()}
                    </div>
                  </div>

                  {dailyMsg && (
                    <div className={`text-[11px] font-mono flex items-center gap-1.5 mb-3 ${dailyMsg.ok ? 'neon-lime' : 'neon-coral'}`}>
                      {dailyMsg.ok ? <Check size={11} /> : <AlertCircle size={11} />}{dailyMsg.text}
                    </div>
                  )}

                  <div className="space-y-2">
                    {(() => {
                      const activeIds = dailyOnline && dailyOnlineState && !dailyOnlineState.offline
                        ? (dailyOnlineState.active || [])
                        : (dailyState?.active || []);
                      const setIds = new Set((activeIds || []).map(String));
                      const list = DAILY_QUESTS.filter((qq) => setIds.has(String(qq.id)));
                      return list;
                    })().map((q) => {
                      const baseState = dailyOnline && dailyOnlineState && !dailyOnlineState.offline
                        ? { progress: dailyOnlineState.progress || {}, claimed: dailyOnlineState.claimed || {} }
                        : dailyState;
                      const qp = getQuestProgress(baseState, q);
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
                              onClick={() => {
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
                              }}
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
              </>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="glass-panel rounded-xl p-5 text-center">
            <div className="text-[9px] tracking-[0.3em] uppercase text-slate-400 font-display mb-2">// wallet</div>
            <div className="flex items-center justify-center gap-2">
              <Coins size={22} className="neon-gold" />
              <span className="font-mono text-3xl font-bold neon-gold">{(player?.coins ?? 0).toLocaleString()}</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 tracking-[0.2em] uppercase font-display">{t('common.coins')}</div>
          </div>
          <div className="glass-panel rounded-xl p-5 text-center">
            <div className="text-[9px] tracking-[0.3em] uppercase text-slate-400 font-display mb-2">// ranked</div>
            <span className="font-mono text-3xl font-bold neon-cyan">{player?.rating ?? 1000}</span>
            <div className="text-[10px] text-slate-500 mt-1 tracking-[0.2em] uppercase font-display">{t('common.rating')}</div>
          </div>
          <div className="glass-panel rounded-xl p-5 text-center">
            <div className="text-[9px] tracking-[0.3em] uppercase text-slate-400 font-display mb-2">// items</div>
            <span className="font-mono text-3xl font-bold neon-lime">{player?.owned_items?.length ?? 0}</span>
          </div>
        </aside>
      </div>

      {showInventory && <InventoryModal player={player} onClose={() => setShowInventory(false)} />}
      {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}
      {showPromote && <PromoteModal onClose={() => setShowPromote(false)} />}
      {(viewNick || viewNum != null) && (
        <PlayerProfileModal
          nickname={viewNick}
          playerNum={viewNum}
          onClose={() => { setViewNick(null); setViewNum(null); }}
        />
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

function ChangePasswordModal({ onClose }) {
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [repeatPw, setRepeatPw] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  const err = validatePassword(newPw) || (newPw !== repeatPw ? t('profile.passwordsDoNotMatch') : null);

  const submit = async (e) => {
    e.preventDefault();
    if (err || !oldPw) return;
    setSubmitting(true); setMsg(null);
    try {
      await changePassword(oldPw, newPw);
      setMsg({ ok: true, text: t('profile.passwordUpdated') });
      setTimeout(() => onClose(), 1200);
    } catch (e2) {
      setMsg({ ok: false, text: e2?.response?.data?.detail || t('profile.failed') });
    } finally { setSubmitting(false); }
  };

  return (
    <div className="modal-backdrop" data-testid="change-password-modal">
      <div className="glass-panel slide-up rounded-2xl p-7 max-w-md w-[92%]">
        <h3 className="font-display text-xl font-black neon-cyan mb-4 flex items-center gap-2">
          <KeyRound size={18} /> {t('profile.changePassword')}
        </h3>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-display block mb-1.5">{t('profile.oldPassword')}</label>
            <input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} className="neon-input" maxLength={100} autoFocus data-testid="old-password-input" />
          </div>
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-display block mb-1.5">{t('profile.newPassword')}</label>
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="neon-input" maxLength={100} data-testid="new-password-input" />
          </div>
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-display block mb-1.5">{t('profile.repeatNewPassword')}</label>
            <input type="password" value={repeatPw} onChange={(e) => setRepeatPw(e.target.value)} className="neon-input" maxLength={100} data-testid="repeat-password-input" />
          </div>
          <div className="min-h-[20px] text-[11px] font-mono">
            {newPw && err && <div className="neon-coral flex items-center gap-1.5"><AlertCircle size={11} />{err}</div>}
            {msg && <div className={`flex items-center gap-1.5 ${msg.ok ? 'neon-lime' : 'neon-coral'}`} data-testid="change-password-msg">{msg.ok ? <Check size={11} /> : <AlertCircle size={11} />}{msg.text}</div>}
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={!!err || !oldPw || submitting} className="neon-btn flex-1" data-testid="change-password-submit">
              {submitting ? t('profile.updating') : t('profile.update')}
            </button>
            <button type="button" onClick={onClose} className="neon-btn neon-btn-coral" data-testid="change-password-cancel">{t('common.cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PromoteModal({ onClose }) {
  const [nick, setNick] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!nick.trim()) return;
    setBusy(true); setMsg(null);
    try {
      const res = await promoteToAdmin(nick.trim());
      setMsg({ ok: true, text: `${res.player?.nickname || nick} ${t('admin.promoted')}` });
      setNick('');
    } catch (e2) {
      setMsg({ ok: false, text: e2?.response?.data?.detail || t('profile.failed') });
    } finally { setBusy(false); }
  };

  return (
    <div className="modal-backdrop" data-testid="promote-modal">
      <div className="glass-panel slide-up rounded-2xl p-7 max-w-md w-[92%]">
        <h3 className="font-display text-xl font-black neon-gold mb-2 flex items-center gap-2">
          <UserPlus size={18} /> {t('admin.promote')}
        </h3>
        <p className="text-xs text-slate-400 mb-4">{t('admin.promoteHelp')}</p>
        <form onSubmit={submit} className="space-y-3">
          <input className="neon-input" placeholder="CALLSIGN" value={nick} onChange={(e) => setNick(e.target.value.trim())} maxLength={20} autoFocus data-testid="promote-nick-input" />
          {msg && <div className={`text-[11px] font-mono flex items-center gap-1.5 ${msg.ok ? 'neon-lime' : 'neon-coral'}`} data-testid="promote-msg">
            {msg.ok ? <Check size={11} /> : <AlertCircle size={11} />}{msg.text}
          </div>}
          <div className="flex gap-2">
            <button type="submit" disabled={!nick.trim() || busy} className="neon-btn flex-1" data-testid="promote-submit">
              {busy ? t('admin.processing') : t('admin.grantBtn')}
            </button>
            <button type="button" onClick={onClose} className="neon-btn neon-btn-coral" data-testid="promote-cancel">{t('common.cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
