import React from 'react';
import { KeyRound, Package, Volume2, UserPlus, LogOut } from 'lucide-react';
import { getSfxVolume, setSfxVolume, sfx } from '../../lib/sounds';
import { LANGUAGES, setLang, t, useLang } from '../../lib/i18n';

export default function SettingsSection({ 
  player, 
  showInventory, 
  setShowInventory, 
  showChangePw, 
  setShowChangePw, 
  showPromote, 
  setShowPromote, 
  handleLogout 
}) {
  const [lang] = useLang();
  const [sfxVolume, setSfxVolumeState] = React.useState(() => getSfxVolume());

  return (
    <div className="glass-panel rounded-xl p-6 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <KeyRound size={14} className="neon-cyan" />
        <h3 className="font-display text-sm font-bold tracking-[0.25em] uppercase">{t('profile.account')}</h3>
      </div>

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

      <button onClick={() => setShowInventory(true)} className="neon-btn w-full flex items-center justify-center gap-2 py-3" data-testid="open-inventory-btn">
        <Package size={14} /> {t('profile.inventory')}
      </button>

      <button onClick={() => setShowChangePw(true)} className="neon-btn w-full flex items-center justify-center gap-2 py-3" data-testid="open-change-password-btn">
        <KeyRound size={14} /> {t('profile.changePassword')}
      </button>

      {player?.isAdmin && (
        <button onClick={() => setShowPromote(true)} className="neon-btn w-full flex items-center justify-center gap-2 py-3"
          style={{ borderColor: '#FFD700', color: '#FFD700' }}
          data-testid="open-promote-btn">
          <UserPlus size={14} /> {t('admin.promote')}
        </button>
      )}
      <button onClick={handleLogout} className="neon-btn neon-btn-coral w-full flex items-center justify-center gap-2 py-3" data-testid="logout-btn">
        <LogOut size={14} /> {t('common.changeAccount')}
      </button>
    </div>
  );
}
