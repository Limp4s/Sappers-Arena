import React, { useState, useCallback, useEffect } from 'react';
import "@/App.css";
import { HashRouter, Routes, Route } from "react-router-dom";
import { Heart, Flag, Swords, Sparkles } from 'lucide-react';
import TabsNav from "@/components/layout/TabsNav";
import CampaignView from "@/components/views/CampaignView";
import BattlesView from './components/views/BattlesView';
import CustomView from './components/views/CustomView';
import ShopView from './components/views/ShopView';
import LeaderboardView from './components/views/LeaderboardView';
import ProfileView from './components/views/ProfileView';
import MinesweeperGame from './components/game/Minesweeper';
import OnlineDuelGame from './components/game/OnlineDuelGame';
import AchievementBanner from './components/ui/AchievementBanner';
import AuthGate from './components/auth/NicknameGate';
import { getStoredNickname, isAuthed, isAdmin as getIsAdmin, isAdminNick, fetchMe, getPlayerId, setPlayerId } from "@/lib/player";
import { t } from '@/lib/i18n';

const TERMS_KEY = 'mg_terms_accepted_v1';
const PRIVACY_KEY = 'mg_privacy_accepted_v1';
const ONBOARDING_KEY = 'mg_onboarding_done_v1';
const TERMS_TEXT = `The game is in early testing.
By continuing, you agree to the Terms:
- The game is provided "as is."
- You are responsible for your own use.
- The game does not intentionally collect any personal data in offline mode.
- Once you accept the terms, you cannot opt out.
- All rights to this game belong to the owners of the company.
- If your name is Ivan, you will be an unpaid beta tester.`;

const PRIVACY_TEXT = `Privacy Policy
Last updated: ${new Date().toISOString().slice(0, 10)}

This Privacy Policy explains how Sappers Arena ("we", "our", "the game") collects and uses information when you use the game.

1) Information we collect
- Account data: nickname and session/authentication data (if you log in).
- Gameplay data: results, scores, progress, and settings.
- Technical data: IP address, device/browser information, and diagnostic data used for security and bug fixing.
- Storage: we may use local storage/cookies to keep you logged in and remember your preferences.

2) How we use information
- To provide and improve the game and store progress.
- To maintain leaderboards and competitive features.
- To prevent abuse and ensure security.

3) Legal bases (EEA/UK)
Where applicable, we process data based on:
- Performance of a contract (providing the game and saving progress).
- Legitimate interests (security, fraud prevention, improving the game).
- Consent (for optional features, where required).

4) Data sharing
We do not sell your personal data.
We may share limited data with service providers (hosting/infrastructure) only as needed to operate the game.

5) International transfers
Our service providers may process data outside your country. Where required, we use appropriate safeguards.

6) Data retention
We retain data only as long as necessary for the purposes described above or as required by law.

7) Your rights
Depending on your location, you may have rights to access, correct, delete, or restrict processing of your data.
You may also object to processing or request data portability.

8) Children
The game is not intended for children under 13. If you believe a child has provided personal data, contact us.

9) Contact
Support: limp976@gmail.com`;

function Home() {
  const accountKey = useCallback((base) => {
    try {
      const nick = (getStoredNickname?.() || '').trim().toLowerCase();
      if (nick) return `${base}:${nick}`;
    } catch {}
    return base;
  }, []);

  const [privacyAccepted, setPrivacyAccepted] = useState(() => {
    try { return localStorage.getItem(accountKey(PRIVACY_KEY)) === '1'; } catch { return false; }
  });
  const [termsAccepted, setTermsAccepted] = useState(() => {
    try { return localStorage.getItem(accountKey(TERMS_KEY)) === '1'; } catch { return false; }
  });
  const [onboardingDone, setOnboardingDone] = useState(() => {
    try { return localStorage.getItem(accountKey(ONBOARDING_KEY)) === '1'; } catch { return false; }
  });
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [tab, setTab] = useState('campaign');
  const [gameConfig, setGameConfig] = useState(null);
  const [infiniteLives, setInfiniteLives] = useState(false);
  const [newUnlocked, setNewUnlocked] = useState([]);
  const [player, setPlayer] = useState(() => {
    if (isAuthed()) {
      const nick = getStoredNickname();
      const cachedId = getPlayerId(nick);
      return { nick, isAdmin: getIsAdmin() || isAdminNick(nick), coins: 0, owned_items: [], rating: 1000, player_num: cachedId ?? undefined };
    }
    return null;
  });

  useEffect(() => {
    const onCtx = (e) => { try { e.preventDefault(); } catch {} };
    try { window.addEventListener('contextmenu', onCtx); } catch {}
    return () => { try { window.removeEventListener('contextmenu', onCtx); } catch {} };
  }, []);

  const refreshPlayer = useCallback(async () => {
    if (!player?.nick || !isAuthed()) return;
    try {
      const data = await fetchMe();
      if (data?.nickname && (data?.player_num != null)) {
        try { setPlayerId(data.nickname, data.player_num); } catch {}
      }
      setPlayer((p) => ({ ...p, ...data, nick: data.nickname, isAdmin: data.is_admin }));
    } catch {}
  }, [player?.nick]);

  useEffect(() => { refreshPlayer(); }, [refreshPlayer]);

  useEffect(() => {
    const onUnlocked = (e) => {
      const ids = Array.isArray(e?.detail) ? e.detail.map(String).filter(Boolean) : [];
      if (!ids.length) return;
      setNewUnlocked(ids);
    };
    try { window.addEventListener('mg:new_unlocked', onUnlocked); } catch {}
    return () => { try { window.removeEventListener('mg:new_unlocked', onUnlocked); } catch {} };
  }, []);

  const handlePlayerUpdate = useCallback((updated) => {
    setPlayer((p) => ({
      ...p,
      coins: updated.coins ?? p?.coins ?? 0,
      owned_items: updated.owned_items || p?.owned_items || [],
      rating: updated.rating ?? p?.rating ?? 1000,
    }));
  }, []);

  const startCampaignLevel = useCallback((level) => {
    setGameConfig({
      rows: level.rows, cols: level.cols, mines: level.mines,
      lives: level.lives, mode: 'campaign', difficulty: 'campaign',
      levelId: level.id, label: `LVL ${String(level.id).padStart(2, '0')}`,
      infiniteLives,
    });
  }, [infiniteLives]);

  const startCustomGame = useCallback((cfg) => setGameConfig(cfg), []);
  const startBattle = useCallback((cfg) => setGameConfig(cfg), []);

  const exitGame = useCallback(() => {
    setGameConfig(null);
    refreshPlayer();
  }, [refreshPlayer]);

  const handleLogout = useCallback(() => {
    setPlayer(null);
    setTab('campaign');
  }, []);

  const showOnboarding = !!player && !gameConfig && !onboardingDone;
  const finishOnboarding = useCallback(() => {
    try { localStorage.setItem(accountKey(ONBOARDING_KEY), '1'); } catch {}
    setOnboardingDone(true);
    setOnboardingStep(0);
  }, [accountKey]);

  useEffect(() => {
    try { setPrivacyAccepted(localStorage.getItem(accountKey(PRIVACY_KEY)) === '1'); } catch { setPrivacyAccepted(false); }
    try { setTermsAccepted(localStorage.getItem(accountKey(TERMS_KEY)) === '1'); } catch { setTermsAccepted(false); }
    try { setOnboardingDone(localStorage.getItem(accountKey(ONBOARDING_KEY)) === '1'); } catch { setOnboardingDone(false); }
    setOnboardingStep(0);
  }, [player?.nick, accountKey]);

  if (!privacyAccepted) {
    return (
      <div className="modal-backdrop" data-testid="privacy-modal">
        <div className="glass-panel slide-up rounded-2xl p-8 max-w-md w-[92%] relative overflow-hidden">
          <div className="scanline" />
          <div className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-display mb-2">// privacy</div>
          <h2 className="font-display text-2xl font-black tracking-tight neon-cyan mb-3">PRIVACY POLICY</h2>
          <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed bg-black/20 border border-white/10 rounded-lg p-4 max-h-[45vh] overflow-auto">{PRIVACY_TEXT}</pre>
          <button
            className="neon-btn w-full py-3 mt-4"
            onClick={() => { localStorage.setItem(accountKey(PRIVACY_KEY), '1'); setPrivacyAccepted(true); }}
            data-testid="privacy-accept-btn"
          >I AGREE</button>
        </div>
      </div>
    );
  }

  if (!termsAccepted) {
    return (
      <div className="modal-backdrop" data-testid="terms-modal">
        <div className="glass-panel slide-up rounded-2xl p-8 max-w-md w-[92%] relative overflow-hidden">
          <div className="scanline" />
          <div className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-display mb-2">// terms</div>
          <h2 className="font-display text-2xl font-black tracking-tight neon-cyan mb-3">TERMS OF USE</h2>
          <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed bg-black/20 border border-white/10 rounded-lg p-4 max-h-[45vh] overflow-auto">{TERMS_TEXT}</pre>
          <button
            className="neon-btn w-full py-3 mt-4"
            onClick={() => { localStorage.setItem(accountKey(TERMS_KEY), '1'); setTermsAccepted(true); }}
            data-testid="terms-accept-btn"
          >I AGREE</button>
        </div>
      </div>
    );
  }

  if (!player) return <AuthGate onReady={(p) => setPlayer({ ...p, coins: 0, owned_items: [], rating: 1000 })} />;

  if (gameConfig) {
    const isOnline = !!gameConfig?.lobbyCode && (String(gameConfig?.mode || '').startsWith('battle_') || String(gameConfig?.mode || '').startsWith('lobby'));
    if (isOnline) {
      return <OnlineDuelGame config={{ ...gameConfig, player, onExit: exitGame }} onCoinsEarned={refreshPlayer} />;
    }
    return <MinesweeperGame config={{ ...gameConfig, player, onExit: exitGame }} onCoinsEarned={refreshPlayer} />;
  }

  return (
    <div className="min-h-screen w-full">
      <AchievementBanner
        items={newUnlocked}
        onDone={() => setNewUnlocked([])}
        textForId={(id) => t(`achievements.items.${id}.title`)}
      />
      <div
        style={{ height: 25, WebkitAppRegion: 'drag', position: 'sticky', top: 0, zIndex: 50 }}
      />
      <TabsNav current={tab} onChange={setTab} player={player} />
      {showOnboarding && (
        <OnboardingModal
          step={onboardingStep}
          onBack={() => setOnboardingStep((s) => Math.max(0, s - 1))}
          onNext={() => setOnboardingStep((s) => Math.min(3, s + 1))}
          onSkip={finishOnboarding}
          onDone={finishOnboarding}
        />
      )}
      {tab === 'campaign' && (
        <CampaignView onStartLevel={startCampaignLevel} isAdmin={player.isAdmin}
          infiniteLives={infiniteLives} onToggleInfiniteLives={() => setInfiniteLives((v) => !v)} />
      )}
      {tab === 'battles' && <BattlesView onStartBattle={startBattle} player={player} />}
      {tab === 'custom' && (
        <CustomView
          onStartCustom={startCustomGame}
          onStartCustomWithLobby={startCustomGame}
          player={player}
        />
      )}
      {tab === 'shop' && <ShopView player={player} onPlayerUpdate={handlePlayerUpdate} />}
      {tab === 'leaderboard' && <LeaderboardView isAdmin={player.isAdmin} />}
      {tab === 'profile' && <ProfileView player={player} onPlayerUpdate={handlePlayerUpdate} onLogout={handleLogout} />}
    </div>
  );
}

function OnboardingModal({ step, onBack, onNext, onSkip, onDone }) {
  const STEPS = [
    {
      key: 'welcome',
      title: t('onboarding.welcomeTitle'),
      icon: <Sparkles size={18} className="neon-cyan" />,
      body: t('onboarding.welcomeBody'),
    },
    {
      key: 'lives',
      title: t('onboarding.livesTitle'),
      icon: <Heart size={18} className="neon-coral" fill="currentColor" />,
      body: t('onboarding.livesBody'),
    },
    {
      key: 'flags',
      title: t('onboarding.flagsTitle'),
      icon: <Flag size={18} className="neon-gold" />,
      body: t('onboarding.flagsBody'),
    },
    {
      key: 'duels',
      title: t('onboarding.duelsTitle'),
      icon: <Swords size={18} className="neon-lime" />,
      body: t('onboarding.duelsBody'),
    },
  ];

  const idx = Math.max(0, Math.min(STEPS.length - 1, Number(step) || 0));
  const s = STEPS[idx];
  const isLast = idx === STEPS.length - 1;

  return (
    <div className="modal-backdrop" data-testid="onboarding-modal">
      <div className="glass-panel slide-up rounded-2xl p-7 max-w-md w-[92%] relative overflow-hidden">
        <div className="scanline" />
        <div className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-display mb-2">// {t('onboarding.label')}</div>
        <h2 className="font-display text-xl md:text-2xl font-black tracking-tight neon-cyan mb-3 flex items-center gap-2">
          {s.icon} {s.title}
        </h2>
        <div className="text-xs text-slate-300 font-mono leading-relaxed bg-black/20 border border-white/10 rounded-lg p-4" data-testid={`onboarding-step-${s.key}`}>
          {s.body}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-[10px] text-slate-500 font-display tracking-[0.2em] uppercase" data-testid="onboarding-progress">
            {t('onboarding.stepLabel')} {String(idx + 1).padStart(2, '0')} / 04
          </div>
          <button className="pill" onClick={onSkip} data-testid="onboarding-skip">{t('onboarding.skip')}</button>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            className="neon-btn neon-btn-coral flex-1"
            onClick={onBack}
            disabled={idx <= 0}
            data-testid="onboarding-back"
          >
            {t('common.back')}
          </button>
          {!isLast ? (
            <button type="button" className="neon-btn flex-1" onClick={onNext} data-testid="onboarding-next">{t('onboarding.next')}</button>
          ) : (
            <button type="button" className="neon-btn flex-1" onClick={onDone} data-testid="onboarding-done">{t('onboarding.done')}</button>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
