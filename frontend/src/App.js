import React, { useState, useCallback, useEffect } from 'react';
import "@/App.css";
import { HashRouter, Routes, Route } from "react-router-dom";
import TabsNav from "@/components/layout/TabsNav";
import CampaignView from "@/components/views/CampaignView";
import BattlesView from './components/views/BattlesView';
import CustomView from './components/views/CustomView';
import ShopView from './components/views/ShopView';
import LeaderboardView from './components/views/LeaderboardView';
import ProfileView from './components/views/ProfileView';
import MinesweeperGame from './components/game/Minesweeper';
import OnlineDuelGame from './components/game/OnlineDuelGame';
import AuthGate from './components/auth/NicknameGate';
import { getStoredNickname, isAuthed, isAdmin as getIsAdmin, isAdminNick, fetchMe } from "@/lib/player";

const TERMS_KEY = 'mg_terms_accepted_v1';
const PRIVACY_KEY = 'mg_privacy_accepted_v1';
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
  const [privacyAccepted, setPrivacyAccepted] = useState(() => localStorage.getItem(PRIVACY_KEY) === '1');
  const [termsAccepted, setTermsAccepted] = useState(() => localStorage.getItem(TERMS_KEY) === '1');
  const [tab, setTab] = useState('campaign');
  const [gameConfig, setGameConfig] = useState(null);
  const [infiniteLives, setInfiniteLives] = useState(false);
  const [player, setPlayer] = useState(() => {
    if (isAuthed()) {
      const nick = getStoredNickname();
      return { nick, isAdmin: getIsAdmin() || isAdminNick(nick), coins: 0, owned_items: [], rating: 1000 };
    }
    return null;
  });

  const refreshPlayer = useCallback(async () => {
    if (!player?.nick || !isAuthed()) return;
    try {
      const data = await fetchMe();
      setPlayer((p) => ({ ...p, ...data, nick: data.nickname, isAdmin: data.is_admin }));
    } catch {}
  }, [player?.nick]);

  useEffect(() => { refreshPlayer(); }, [refreshPlayer]);

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
            onClick={() => { localStorage.setItem(PRIVACY_KEY, '1'); setPrivacyAccepted(true); }}
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
            onClick={() => { localStorage.setItem(TERMS_KEY, '1'); setTermsAccepted(true); }}
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
      <div
        style={{ height: 25, WebkitAppRegion: 'drag', position: 'sticky', top: 0, zIndex: 50 }}
      />
      <TabsNav current={tab} onChange={setTab} player={player} />
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
