import React, { useState, useEffect } from 'react';
import { Users, Activity, Database, Settings, Search, Key, Trash2, Shield, ShieldOff, RotateCcw, Copy, Check, X, Loader2 } from 'lucide-react';
import { adminResetPassword, adminResetPlayer, adminDeletePlayer } from '../../lib/player';
import { adminPromotePlayer, adminDemotePlayer, adminGetStats, adminGetLobbies, adminDbCheck, adminListPlayers } from '../../lib/lobby';
import { t, useLang } from '../../lib/i18n';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('players');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  useLang();

  // Players section state
  const [players, setPlayers] = useState([]);

  // Lobby section state
  const [lobbies, setLobbies] = useState([]);

  // System section state
  const [serverStats, setServerStats] = useState(null);
  const [dbStats, setDbStats] = useState(null);

  // Fetch functions
  const fetchPlayers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminListPlayers({ limit: 100 });
      setPlayers(res.players || []);
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to fetch players');
    } finally {
      setLoading(false);
    }
  };

  const fetchServerStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminGetStats();
      setServerStats(res);
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to fetch server stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchLobbies = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminGetLobbies();
      setLobbies(res.lobbies || []);
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to fetch lobbies');
    } finally {
      setLoading(false);
    }
  };

  const fetchDbCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminDbCheck();
      setDbStats(res);
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to check database');
    } finally {
      setLoading(false);
    }
  };

  // Player actions
  const resetPlayerPassword = async (nickname) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminResetPassword(nickname);
      setGeneratedPassword(res.new_password);
      setShowPasswordModal(true);
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const resetPlayerProgress = async (nickname) => {
    if (!confirm(`Reset progress for ${nickname}?`)) return;
    setLoading(true);
    try {
      await adminResetPlayer(nickname);
      alert('Progress reset successfully');
      fetchPlayers();
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to reset progress');
    } finally {
      setLoading(false);
    }
  };

  const deletePlayer = async (nickname) => {
    if (!confirm(`Delete player ${nickname}? This cannot be undone.`)) return;
    setLoading(true);
    try {
      await adminDeletePlayer(nickname);
      alert('Player deleted successfully');
      fetchPlayers();
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to delete player');
    } finally {
      setLoading(false);
    }
  };

  const promotePlayer = async (nickname) => {
    setLoading(true);
    try {
      await adminPromotePlayer(nickname);
      alert('Player promoted to admin');
      fetchPlayers();
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to promote player');
    } finally {
      setLoading(false);
    }
  };

  const demotePlayer = async (nickname) => {
    setLoading(true);
    try {
      await adminDemotePlayer(nickname);
      alert('Player demoted from admin');
      fetchPlayers();
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to demote player');
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = async () => {
    if (!generatedPassword) return;
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'players') fetchPlayers();
    if (activeTab === 'system') {
      fetchServerStats();
      fetchDbCheck();
    }
    if (activeTab === 'lobbies') fetchLobbies();
  }, [activeTab]);

  const filteredPlayers = players.filter(p => 
    p.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full">
      <div className="container mx-auto p-4 max-w-6xl">
        <h1 className="font-display text-3xl font-black neon-cyan mb-6 tracking-tight">АДМИН ПАНЕЛЬ</h1>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { id: 'players', icon: Users, label: 'Игроки' },
            { id: 'lobbies', icon: Activity, label: 'Лобби' },
            { id: 'system', icon: Database, label: 'Система' },
            { id: 'settings', icon: Settings, label: 'Настройки' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`neon-btn flex items-center gap-2 px-4 py-2 ${activeTab === tab.id ? 'neon-btn' : 'opacity-60'}`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="glass-panel-light rounded-lg p-4 mb-4 neon-coral">
            {error}
          </div>
        )}

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div className="space-y-4">
            <div className="glass-panel-light rounded-lg p-4">
              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    className="neon-input pl-10 w-full"
                    placeholder="Поиск по нику..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button onClick={fetchPlayers} className="neon-btn flex items-center gap-2">
                  <RotateCcw size={16} /> Обновить
                </button>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin neon-cyan" size={32} />
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredPlayers.map(player => (
                    <div key={player.nickname} className="glass-panel rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-mono font-bold text-slate-200">{player.nickname}</div>
                          <div className="text-xs text-slate-400">ID: {player.player_num || 'N/A'}</div>
                        </div>
                        {player.is_admin && (
                          <Shield className="neon-lime" size={16} />
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => resetPlayerPassword(player.nickname)}
                          className="p-2 hover:bg-white/10 rounded text-slate-400 hover:text-[#00E5FF]"
                          title="Сбросить пароль"
                        >
                          <Key size={16} />
                        </button>
                        <button
                          onClick={() => resetPlayerProgress(player.nickname)}
                          className="p-2 hover:bg-white/10 rounded text-slate-400 hover:text-yellow-400"
                          title="Сбросить прогресс"
                        >
                          <RotateCcw size={16} />
                        </button>
                        <button
                          onClick={() => player.is_admin ? demotePlayer(player.nickname) : promotePlayer(player.nickname)}
                          className="p-2 hover:bg-white/10 rounded text-slate-400 hover:text-neon-lime"
                          title={player.is_admin ? "Снять админ права" : "Выдать админ права"}
                        >
                          {player.is_admin ? <ShieldOff size={16} /> : <Shield size={16} />}
                        </button>
                        <button
                          onClick={() => deletePlayer(player.nickname)}
                          className="p-2 hover:bg-white/10 rounded text-slate-400 hover:text-neon-coral"
                          title="Удалить аккаунт"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lobbies Tab */}
        {activeTab === 'lobbies' && (
          <div className="space-y-4">
            <div className="glass-panel-light rounded-lg p-4">
              <button onClick={fetchLobbies} className="neon-btn flex items-center gap-2 mb-4">
                <RotateCcw size={16} /> Обновить
              </button>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin neon-cyan" size={32} />
                </div>
              ) : lobbies.length === 0 ? (
                <div className="text-center py-8 text-slate-400">Нет активных лобби</div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {lobbies.map(lobby => (
                    <div key={lobby.code} className="glass-panel rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-2xl font-black neon-cyan">{lobby.code}</span>
                        <span className={`text-xs px-2 py-1 rounded ${lobby.status === 'waiting' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {lobby.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-slate-400">Хост: <span className="text-slate-200">{lobby.host}</span></div>
                        <div className="text-slate-400">Гость: <span className="text-slate-200">{lobby.guest || 'Ожидание...'}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="space-y-4">
            <div className="glass-panel-light rounded-lg p-4">
              <h2 className="font-display text-lg font-bold neon-cyan mb-4">Статистика сервера</h2>
              <button onClick={() => { fetchServerStats(); fetchDbCheck(); }} className="neon-btn flex items-center gap-2 mb-4">
                <RotateCcw size={16} /> Обновить
              </button>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin neon-cyan" size={32} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {serverStats && (
                    <>
                      <div className="glass-panel rounded-lg p-4 text-center">
                        <div className="text-3xl font-black neon-cyan">{serverStats.online_players}</div>
                        <div className="text-xs text-slate-400">Онлайн игроков</div>
                      </div>
                      <div className="glass-panel rounded-lg p-4 text-center">
                        <div className="text-3xl font-black neon-lime">{serverStats.total_players}</div>
                        <div className="text-xs text-slate-400">Всего игроков</div>
                      </div>
                      <div className="glass-panel rounded-lg p-4 text-center">
                        <div className="text-3xl font-black neon-gold">{serverStats.active_lobbies}</div>
                        <div className="text-xs text-slate-400">Активных лобби</div>
                      </div>
                    </>
                  )}
                  
                  {dbStats && (
                    <div className="glass-panel rounded-lg p-4 col-span-2">
                      <h3 className="font-display text-sm font-bold text-slate-300 mb-2">База данных</h3>
                      <div className="text-xs text-slate-400 mb-2">Размер: {dbStats.db_size}</div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>Игроки: <span className="text-slate-200">{dbStats.collection_stats.players}</span></div>
                        <div>Сессии: <span className="text-slate-200">{dbStats.collection_stats.sessions}</span></div>
                        <div>Лобби: <span className="text-slate-200">{dbStats.collection_stats.lobbies}</span></div>
                        <div>Лидерборд: <span className="text-slate-200">{dbStats.collection_stats.leaderboard}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="glass-panel-light rounded-lg p-4">
              <h2 className="font-display text-lg font-bold neon-cyan mb-4">Глобальные настройки</h2>
              <div className="text-slate-400 text-sm">
                Настройки в разработке...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="modal-backdrop">
          <div className="glass-panel slide-up rounded-2xl p-6 max-w-md w-[92%]">
            <h3 className="font-display text-xl font-black neon-cyan mb-4">Новый пароль</h3>
            <div className="glass-panel-light rounded-lg p-4 mb-4">
              <div className="font-mono text-2xl font-black text-center neon-lime tracking-wider">
                {generatedPassword}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={copyPassword} className="neon-btn flex-1 flex items-center justify-center gap-2">
                {copied ? <Check className="neon-lime" size={16} /> : <Copy size={16} />}
                {copied ? 'Скопировано' : 'Копировать'}
              </button>
              <button onClick={() => { setShowPasswordModal(false); setGeneratedPassword(null); }} className="neon-btn neon-btn-coral flex-1">
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
