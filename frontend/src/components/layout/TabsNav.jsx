import React from 'react';
import { Route, Target, Trophy, Crown, ShoppingBag, Swords, Coins, User } from 'lucide-react';
import { t, useLang } from '../../lib/i18n';

const TABS = [
  { key: 'campaign',    labelKey: 'tabs.campaign',    icon: Route },
  { key: 'battles',     labelKey: 'tabs.battles',     icon: Swords },
  { key: 'custom',      labelKey: 'tabs.custom',      icon: Target },
  { key: 'shop',        labelKey: 'tabs.shop',        icon: ShoppingBag },
  { key: 'leaderboard', labelKey: 'tabs.leaderboard', icon: Trophy },
  { key: 'profile',     labelKey: 'tabs.profile',     icon: User },
];

export default function TabsNav({ current, onChange, player }) {
  useLang();
  return (
    <nav className="relative z-10 max-w-[1600px] mx-auto w-full px-4 md:px-6 pt-[calc(env(safe-area-inset-top)+12px)] md:pt-5" data-testid="tabs-nav">
      <div className="flex flex-col gap-3 md:gap-4 mb-3 md:mb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 justify-start min-w-0">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center glass-panel-light pulse-glow">
              <img src="/logo.png" alt="Sappers Arena" className="w-8 h-8 object-contain" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-xl md:text-2xl font-black tracking-tight neon-cyan leading-none">
                {t('appName')}
              </h1>
              <p className="text-[9px] tracking-[0.3em] uppercase text-slate-500 font-display mt-1">
                {t('tagline')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-end">
            {player?.coins !== undefined && (
              <div className="flex items-center gap-1.5 glass-panel-light rounded-full px-3 py-1.5" data-testid="coin-badge">
                <Coins size={12} className="neon-gold" />
                <span className="font-mono text-[12px] neon-gold font-bold">{(player.coins || 0).toLocaleString()}</span>
              </div>
            )}
            {player?.nick && (
              <button onClick={() => onChange('profile')} className="flex items-center gap-2 glass-panel-light rounded-full px-3 py-1.5 hover:bg-white/10 transition-colors" data-testid="player-badge">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] shadow-[0_0_8px_#00FF9D]" />
                <span className="font-mono text-[12px] text-slate-200 font-bold">{player.nick}</span>
                {player.isAdmin && (
                  <span className="flex items-center gap-0.5 text-[9px] font-display tracking-[0.2em] neon-gold border border-[#FFD700]/50 rounded px-1.5 py-0.5">
                    <Crown size={9} /> ADMIN
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="glass-panel rounded-full p-1 flex gap-1 flex-nowrap overflow-x-auto hide-scrollbar justify-center md:justify-start md:flex-wrap md:overflow-visible">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = current === tab.key;
            return (
              <button key={tab.key} onClick={() => onChange(tab.key)}
                className={`px-2.5 md:px-3 py-2.5 md:py-2 rounded-full flex items-center gap-1.5 transition-all font-display text-[10px] tracking-[0.2em] font-semibold uppercase ${
                  active ? 'bg-[rgba(0,229,255,0.12)] text-[#00E5FF] shadow-[0_0_16px_rgba(0,229,255,0.35)]' : 'text-slate-400 hover:text-slate-200'
                }`}
                data-testid={`tab-${tab.key}`}
              >
                <Icon size={14} className="md:hidden" />
                <Icon size={12} className="hidden md:inline" />
                <span className="hidden md:inline">{t(tab.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
