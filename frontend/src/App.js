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
const TERMS_TEXT = `The game is in early testing.
By continuing, you agree to the Terms:
- The game is provided "as is."
- You are responsible for your own use.
- The game does not intentionally collect any personal data in offline mode.
- Once you accept the terms, you cannot opt out.
- All rights to this game belong to the owners of the company.
- If your name is Ivan, you will be an unpaid beta tester.`;

function Home() {
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
