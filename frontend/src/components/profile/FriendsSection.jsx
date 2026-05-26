import React from 'react';
import { Users, UserCheck, Check, X, UserPlus } from 'lucide-react';
import { getFriends, removeFriend, acceptFriendRequest, rejectFriendRequest, sendFriendRequest } from '../../lib/player';
import { t } from '../../lib/i18n';

export default function FriendsSection({ player, onPlayerUpdate }) {
  const [friends, setFriends] = React.useState([]);
  const [friendsLoading, setFriendsLoading] = React.useState(false);
  const [pendingRequests, setPendingRequests] = React.useState([]);
  const [addFriendQuery, setAddFriendQuery] = React.useState('');
  const [addFriendMsg, setAddFriendMsg] = React.useState(null);

  React.useEffect(() => {
    if (!player?.nick) return;
    setFriendsLoading(true);
    getFriends()
      .then((r) => {
        setFriends(r?.friends || []);
        const pending = player?.friend_requests_pending || [];
        setPendingRequests(pending);
      })
      .catch(() => {
        setFriends([]);
        setPendingRequests([]);
      })
      .finally(() => setFriendsLoading(false));
  }, [player?.nick]);

  const handleAddFriend = async () => {
    const nick = addFriendQuery.trim();
    if (!nick) return;
    if (nick.toLowerCase() === player?.nick?.toLowerCase()) {
      setAddFriendMsg({ ok: false, text: 'Cannot add yourself as a friend' });
      return;
    }
    try {
      await sendFriendRequest(nick);
      setAddFriendMsg({ ok: true, text: `Friend request sent to ${nick}` });
      setAddFriendQuery('');
    } catch (e) {
      setAddFriendMsg({ ok: false, text: e?.response?.data?.detail || 'Failed to send friend request' });
    }
  };

  return (
    <div className="glass-panel rounded-xl p-6 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Users size={14} className="neon-cyan" />
        <h3 className="font-display text-sm font-bold tracking-[0.25em] uppercase">{t('friends.title')}</h3>
      </div>

      <div className="glass-panel-light rounded-xl p-4">
        <div className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-display mb-2">{t('friends.addFriend')}</div>
        <div className="flex gap-2">
          <input
            className="neon-input flex-1"
            placeholder={t('friends.addFriendPlaceholder')}
            value={addFriendQuery}
            onChange={(e) => setAddFriendQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddFriend(); }}
            maxLength={20}
            data-testid="add-friend-input"
          />
          <button
            onClick={handleAddFriend}
            className="neon-btn px-4"
            data-testid="add-friend-btn"
          >
            <UserPlus size={14} />
          </button>
        </div>
        {addFriendMsg && (
          <div className={`text-[11px] font-mono flex items-center gap-1.5 mt-2 ${addFriendMsg.ok ? 'neon-lime' : 'neon-coral'}`}>
            {addFriendMsg.ok ? <Check size={11} /> : <X size={11} />}{addFriendMsg.text}
          </div>
        )}
      </div>

      {pendingRequests.length > 0 && (
        <div className="glass-panel-light rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <UserCheck size={14} className="neon-lime" />
            <h3 className="font-display text-xs font-bold tracking-[0.25em] uppercase">{t('friends.friendRequests')}</h3>
          </div>
          <div className="space-y-2">
            {pendingRequests.map((reqNick) => (
              <div key={reqNick} className="glass-panel rounded-lg px-3 py-2 flex items-center gap-3">
                <div className="text-[11px] font-mono neon-cyan">{reqNick}</div>
                <div className="flex-1"></div>
                <button
                  onClick={() => {
                    acceptFriendRequest(reqNick)
                      .then(() => {
                        setPendingRequests(pendingRequests.filter(r => r !== reqNick));
                        onPlayerUpdate?.();
                      })
                      .catch(() => {});
                  }}
                  className="text-green-400 hover:text-green-300"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => {
                    rejectFriendRequest(reqNick)
                      .then(() => setPendingRequests(pendingRequests.filter(r => r !== reqNick)))
                      .catch(() => {});
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-panel-light rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users size={14} className="neon-cyan" />
          <h3 className="font-display text-xs font-bold tracking-[0.25em] uppercase">{t('friends.friendsList')}</h3>
        </div>
        {friendsLoading ? (
          <div className="text-slate-500 text-xs text-center py-4">{t('friends.loading')}</div>
        ) : friends.length === 0 ? (
          <div className="text-slate-500 text-xs text-center py-4">{t('friends.noFriends')}</div>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <div key={friend.nickname} className="glass-panel rounded-lg px-3 py-2 flex items-center gap-3">
                <div className="text-[11px] font-mono neon-cyan">{friend.nickname}</div>
                <div className="flex-1 text-[11px] text-slate-400">Rating: {friend.rating || 1000}</div>
                <button
                  onClick={() => {
                    removeFriend(friend.nickname)
                      .then(() => setFriends(friends.filter(f => f.nickname !== friend.nickname)))
                      .catch(() => {});
                  }}
                  className="text-slate-500 hover:text-red-400"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
