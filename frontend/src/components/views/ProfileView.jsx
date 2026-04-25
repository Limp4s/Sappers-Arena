import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, LogOut, KeyRound, Package, Coins, Shield, Trophy, Check, AlertCircle, UserPlus } from 'lucide-react';
import { logout, changePassword, validatePassword, getPlayerId, adminListPlayers, getToken } from '../../lib/player';
import { promoteToAdmin } from '../../lib/lobby';
import InventoryModal from '../modals/InventoryModal';
import { LANGUAGES, setLang, t, useLang } from '../../lib/i18n';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://sappers-arena.onrender.com';
const API = `${BACKEND_URL}/api`;

export default function ProfileView({ player, onPlayerUpdate, onLogout }) {
  const [stats, setStats] = useState(null);
  const [showInventory, setShowInventory] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const [showPromote, setShowPromote] = useState(false);
  const [adminPlayers, setAdminPlayers] = useState(null);
  const [adminPlayersQuery, setAdminPlayersQuery] = useState('');
  const [lang] = useLang();
  const [tab, setTab] = useState('account');

  useEffect(() => {
    if (!player?.nick) return;
    setStats(null);
    axios.get(`${API}/stats/player`, { params: { name: player.nick } })
      .then(r => setStats(r.data))
      .catch(() => setStats({ offline: true }));
  }, [player?.nick]);

  useEffect(() => {
    if (!player?.isAdmin) return;
    const tok = getToken?.();
    if (!tok || (tok || '').startsWith('offline-')) { setAdminPlayers([]); return; }
    setAdminPlayers(null);
    adminListPlayers({ limit: 500 })
      .then((r) => setAdminPlayers(r?.players || []))
      .catch(() => setAdminPlayers([]));
  }, [player?.isAdmin]);

  const handleLogout = async () => {
    try { await logout(); } catch {}
    onLogout?.();
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
      <div className="glass-panel rounded-xl p-6 mb-5">
        <div className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-display">// identity</div>
        <h2 className="font-display text-2xl md:text-3xl font-black tracking-tight neon-cyan mt-1 flex items-center gap-3">
          <User size={26} /> {player?.nick}
          {(player?.league || player?.ranked_place) && (
            <span className="flex items-center gap-1 text-[11px] font-display tracking-[0.25em] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-slate-200">
              <Trophy size={11} className="neon-gold" />
              {player?.league === 'top500' && player?.ranked_place ? `TOP ${player.ranked_place}` : String(player?.league || '').toUpperCase()}
            </span>
          )}
          {player?.isAdmin && (
            <span className="flex items-center gap-1 text-[11px] neon-gold font-display tracking-[0.25em] bg-[#FFD700]/10 border border-[#FFD700]/50 px-2 py-0.5 rounded">
              <Shield size={11} /> {t('admin.title')}
            </span>
          )}
        </h2>
        <div className="text-[10px] tracking-[0.25em] uppercase text-slate-500 font-display mt-2">
          {t('profile.playerId')}
          <span className="ml-2 font-mono text-[14px] font-black text-white tracking-[0.12em] shadow-[0_0_10px_rgba(255,255,255,0.55)]">
            {player?.player_num ?? getPlayerId(player?.nick) ?? '—'}
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
                onClick={() => setTab('account')}
                className={`pill ${tab === 'account' ? 'pill-active' : ''}`}
                data-testid="profile-tab-account"
              >
                {t('profile.account')}
              </button>
              <button
                onClick={() => setTab('settings')}
                className={`pill ${tab === 'settings' ? 'pill-active' : ''}`}
                data-testid="profile-tab-settings"
              >
                {t('common.settings')}
              </button>
            </div>

            {tab === 'account' ? (
              <>
                <button onClick={() => setShowInventory(true)} className="neon-btn w-full flex items-center justify-center gap-2 py-3" data-testid="open-inventory-btn">
                  <Package size={14} /> {t('profile.inventory')}
                </button>
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
            ) : (
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
                <button onClick={() => setShowChangePw(true)} className="neon-btn w-full flex items-center justify-center gap-2 py-3" data-testid="open-change-password-btn">
                  <KeyRound size={14} /> {t('profile.changePassword')}
                </button>
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
