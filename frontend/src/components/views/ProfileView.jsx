import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { User, LogOut, KeyRound, Trophy, Crown, Check, AlertCircle, Award } from 'lucide-react';
import { logout, changePassword, validatePassword, getPlayerId, getToken, isOwnerNick } from '../../lib/player';
import { promoteToAdmin } from '../../lib/lobby';
import InventoryModal from '../modals/InventoryModal';
import PlayerProfileModal from '../modals/PlayerProfileModal';
import AchievementsModal from '../modals/AchievementsModal';
import AchievementBanner from '../ui/AchievementBanner';
import { t } from '../../lib/i18n';
import FriendsSection from '../profile/FriendsSection';
import DailySection from '../profile/DailySection';
import SettingsSection from '../profile/SettingsSection';
import AdminPanel from '../profile/AdminPanel';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://sappers-arena.onrender.com';
const API = `${BACKEND_URL}/api`;

export default function ProfileView({ player, onPlayerUpdate, onLogout }) {
  const [stats, setStats] = useState(null);
  const [showInventory, setShowInventory] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const [showPromote, setShowPromote] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [viewQuery, setViewQuery] = useState('');
  const [viewNick, setViewNick] = useState(null);
  const [viewNum, setViewNum] = useState(null);
  const [newUnlocked, setNewUnlocked] = useState([]);

  const owner = isOwnerNick?.(player?.nick);

  useEffect(() => {
    if (!player?.nick) return;
    setStats(null);
    axios.get(`${API}/stats/player`, { params: { name: player.nick } })
      .then(r => setStats(r.data))
      .catch(() => setStats({ offline: true }));
  }, [player?.nick]);

  const prettyPlayerId = useMemo(() => {
    const n = player?.player_num ?? getPlayerId?.(player?.nick);
    if (typeof n === 'number' && Number.isFinite(n)) {
      const v = Math.max(0, Math.floor(n));
      return String(v).padStart(8, '0');
    }
    if (typeof n === 'string' && n.trim()) {
      const asNum = Number(n);
      if (Number.isFinite(asNum)) return String(Math.max(0, Math.floor(asNum))).padStart(8, '0');
    }
    return null;
  }, [player?.nick, player?.player_num]);

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

  return (
    <div className="max-w-[1600px] mx-auto w-full px-4 md:px-6 pb-10" data-testid="profile-view">
      <AchievementBanner
        items={newUnlocked}
        onDone={() => setNewUnlocked([])}
        textForId={(id) => t(`achievements.items.${id}.title`)}
      />
      <AchievementsModal open={showAchievements} onClose={() => setShowAchievements(false)} />
      <div className="flex items-start gap-5">
        <div className="min-w-0">
          <h2 className="font-display text-2xl md:text-3xl font-black tracking-tight neon-cyan mt-1 flex items-center gap-3 flex-wrap">
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
                <Crown size={11} className="neon-gold" /> {owner ? t('admin.ownerTitle') : t('admin.adminTitle')}
              </span>
            )}

            <button
              onClick={() => setShowAchievements(true)}
              className={`w-12 h-12 rounded-xl border transition-all flex items-center justify-center shrink-0 ${
                showAchievements
                  ? 'border-[#FFD700]/60 bg-[rgba(255,215,0,0.10)] shadow-[0_0_18px_rgba(255,215,0,0.25)]'
                  : 'border-[#FFD700]/30 bg-[rgba(255,215,0,0.05)] hover:border-[#FFD700]/60 hover:bg-[rgba(255,215,0,0.08)] hover:shadow-[0_0_14px_rgba(255,215,0,0.18)]'
              }`}
              title={t('achievements.title')}
              data-testid="profile-top-achievements"
            >
              <Award size={18} className="neon-gold" />
            </button>
          </h2>
          {prettyPlayerId && (
            <div className="mt-1 text-[10px] tracking-[0.25em] uppercase text-slate-500 font-display">
              {t('profile.playerId')}: <span className="font-mono text-white/90 drop-shadow-[0_0_6px_rgba(255,255,255,0.35)]">{prettyPlayerId}</span>
            </div>
          )}
        </div>
      </div>

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

          <AdminPanel player={player} onPlayerUpdate={onPlayerUpdate} />

          <FriendsSection 
            player={player} 
            onPlayerUpdate={onPlayerUpdate} 
            viewQuery={viewQuery} 
            setViewQuery={setViewQuery} 
            openOtherProfile={openOtherProfile} 
          />

          <DailySection 
            player={player} 
            onPlayerUpdate={onPlayerUpdate} 
            newUnlocked={newUnlocked} 
            setNewUnlocked={setNewUnlocked} 
          />

          <SettingsSection 
            player={player} 
            showInventory={showInventory} 
            setShowInventory={setShowInventory} 
            showChangePw={showChangePw} 
            setShowChangePw={setShowChangePw} 
            showPromote={showPromote} 
            setShowPromote={setShowPromote} 
            handleLogout={handleLogout} 
          />
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
