import React from 'react';
import { Shield, Check, AlertCircle } from 'lucide-react';
import { adminListPlayers, adminFixNegativeRatings, adminGrantCoins, adminGrantRatingWin, adminResetPlayer, adminDeletePlayer, getToken, isOwnerNick } from '../../lib/player';
import { demoteAdmin } from '../../lib/lobby';
import { t, useLang } from '../../lib/i18n';

export default function AdminPanel({ player, onPlayerUpdate }) {
  const [lang] = useLang();
  const [adminPlayers, setAdminPlayers] = React.useState(null);
  const [adminPlayersQuery, setAdminPlayersQuery] = React.useState('');
  const [adminBusy, setAdminBusy] = React.useState(false);
  const [adminMsg, setAdminMsg] = React.useState(null);

  const owner = isOwnerNick?.(player?.nick);

  React.useEffect(() => {
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

  const handleDemoteAdmin = async (nickname) => {
    const targetNick = String(nickname || '').trim();
    if (!targetNick) return;
    if (!owner) return;
    if (String(targetNick).toLowerCase() === String(player?.nick || '').toLowerCase()) return;
    if (isOwnerNick?.(targetNick)) return;
    const ok = window.confirm(t('admin.demoteConfirm', { nickname: targetNick }));
    if (!ok) return;
    setAdminBusy(true);
    setAdminMsg(null);
    try {
      await demoteAdmin(targetNick);
      setAdminMsg({ ok: true, text: t('admin.demoted', { nickname: targetNick }) });
      await refreshAdminPlayers();
    } catch (e2) {
      setAdminMsg({ ok: false, text: e2?.response?.data?.detail || t('common.failed') });
    }
    setAdminBusy(false);
  };

  const handleResetPlayer = async (nickname) => {
    const targetNick = String(nickname || '').trim();
    if (!targetNick) return;
    if (String(targetNick).toLowerCase() === String(player?.nick || '').toLowerCase()) return;
    if (isOwnerNick?.(targetNick)) return;
    const ok = window.confirm(t('profile.admin.resetAchievementsConfirm', { nickname: targetNick }));
    if (!ok) return;
    setAdminBusy(true);
    setAdminMsg(null);
    try {
      const res = await adminResetPlayer(targetNick);
      setAdminMsg({ ok: true, text: t('profile.admin.resetAchievementsOk', { nickname: targetNick }) });
      if (String(targetNick).toLowerCase() === String(player?.nick || '').toLowerCase() && res?.player) {
        onPlayerUpdate?.(res.player);
      }
      await refreshAdminPlayers();
    } catch (e2) {
      setAdminMsg({ ok: false, text: e2?.response?.data?.detail || t('common.failed') });
    }
    setAdminBusy(false);
  };

  const handleFixNegativeRatings = async () => {
    setAdminBusy(true);
    setAdminMsg(null);
    try {
      const res = await adminFixNegativeRatings();
      setAdminMsg({ ok: true, text: t('profile.admin.fixedNegativeRatings', { n: res?.fixed ?? 0 }) });
      await refreshAdminPlayers();
    } catch (e2) {
      setAdminMsg({ ok: false, text: e2?.response?.data?.detail || t('common.failed') });
    } finally {
      setAdminBusy(false);
    }
  };

  const handleDeletePlayer = async (nickname) => {
    const nickToDelete = String(nickname || '').trim();
    if (!nickToDelete) return;
    if (String(nickToDelete).toLowerCase() === String(player?.nick || '').toLowerCase()) return;
    const ok = window.confirm(t('profile.admin.deleteAccountConfirm', { nickname: nickToDelete }));
    if (!ok) return;
    setAdminBusy(true);
    setAdminMsg(null);
    try {
      const res = await adminDeletePlayer(nickToDelete);
      setAdminMsg({ ok: true, text: t('profile.admin.deleteAccountOk', { nickname: res?.deleted || nickToDelete }) });
      await refreshAdminPlayers();
    } catch (e2) {
      setAdminMsg({ ok: false, text: e2?.response?.data?.detail || t('common.failed') });
    } finally {
      setAdminBusy(false);
    }
  };

  if (!player?.isAdmin) return null;

  return (
    <div className="glass-panel rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield size={14} className="neon-gold" />
        <h3 className="font-display text-sm font-bold tracking-[0.25em] uppercase">{t('profile.admin.allPlayers')}</h3>
      </div>
      <div className="flex gap-2 mb-3">
        <button
          onClick={handleFixNegativeRatings}
          disabled={adminBusy}
          className="neon-btn flex-1 py-2"
          style={{ borderColor: '#FFD700', color: '#FFD700' }}
        >
          {t('profile.admin.fixNegativeRatings')}
        </button>
        <button
          onClick={async () => {
            try {
              setAdminMsg(null);
              const r = await adminGrantCoins(100);
              if (r?.player) onPlayerUpdate?.(r.player);
              setAdminMsg({ ok: true, text: `+${r?.coins_delta || 0} COINS` });
            } catch {
              setAdminMsg({ ok: false, text: 'Failed.' });
            }
          }}
          disabled={adminBusy}
          className="neon-btn flex-1 py-2"
          style={{ borderColor: '#FFD700', color: '#FFD700' }}
        >
          {t('profile.admin.coinsSelf')}
        </button>
        <button
          onClick={async () => {
            try {
              setAdminMsg(null);
              const r = await adminGrantRatingWin();
              if (r?.player) onPlayerUpdate?.(r.player);
              setAdminMsg({ ok: true, text: `+${r?.rating_delta || 0} RATING` });
            } catch {
              setAdminMsg({ ok: false, text: 'Failed.' });
            }
          }}
          disabled={adminBusy}
          className="neon-btn flex-1 py-2"
          style={{ borderColor: '#00E5FF', color: '#00E5FF' }}
        >
          {t('profile.admin.ratingSelf')}
        </button>
      </div>
      {adminMsg && (
        <div className={`text-[11px] font-mono flex items-center gap-1.5 mb-3 ${adminMsg.ok ? 'neon-lime' : 'neon-coral'}`}>
          {adminMsg.ok ? <Check size={11} /> : <AlertCircle size={11} />}{adminMsg.text}
        </div>
      )}
      <input
        className="neon-input mb-3"
        placeholder={t('profile.admin.searchNickname')}
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
              const nn = String(p?.nickname || '').toLowerCase();
              const pn = String(p?.player_num ?? '').toLowerCase();
              return nn.includes(q) || pn.includes(q);
            })
            .map((p) => (
              <div key={String(p?.player_num || p?.nickname || Math.random())} className="flex items-center justify-between gap-3 py-2 border-b border-white/5 last:border-b-0">
                <div className="font-mono text-[11px] text-slate-300">#{p?.player_num ?? '—'}</div>
                <div className="font-mono text-[11px] text-white">{p?.nickname || '—'}</div>
                <button
                  onClick={() => handleDemoteAdmin(p?.nickname)}
                  disabled={adminBusy || !p?.nickname || !owner || !p?.is_admin || isOwnerNick?.(p?.nickname) || String(p?.nickname || '').toLowerCase() === String(player?.nick || '').toLowerCase()}
                  className="neon-btn px-2 py-1 text-[10px]"
                  style={{ borderColor: '#8B5CF6', color: '#C4B5FD' }}
                >
                  {t('admin.demote')}
                </button>
                <button
                  onClick={() => handleResetPlayer(p?.nickname)}
                  disabled={adminBusy || !p?.nickname || String(p?.nickname || '').toLowerCase() === String(player?.nick || '').toLowerCase() || isOwnerNick?.(p?.nickname) || (!!p?.is_admin && !owner)}
                  className="neon-btn px-2 py-1 text-[10px]"
                  style={{ borderColor: '#FFD700', color: '#FFD700' }}
                >
                  {t('profile.admin.reset')}
                </button>
                <button
                  onClick={() => handleDeletePlayer(p?.nickname)}
                  disabled={adminBusy || !p?.nickname || String(p?.nickname || '').toLowerCase() === String(player?.nick || '').toLowerCase() || (!!p?.is_admin && !owner)}
                  className="neon-btn neon-btn-coral px-2 py-1 text-[10px]"
                >
                  {t('profile.admin.delete')}
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
