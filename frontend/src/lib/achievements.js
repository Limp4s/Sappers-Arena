const KEY = 'mg_achievements_v1';

const _blank = () => ({
  version: 1,
  unlocked: {},
});

export const getAchievementsState = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return _blank();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return _blank();
    if (!parsed.unlocked || typeof parsed.unlocked !== 'object') return _blank();
    return {
      version: 1,
      unlocked: parsed.unlocked,
    };
  } catch {
    return _blank();
  }
};

export const isAchievementUnlocked = (id) => {
  const st = getAchievementsState();
  return !!st.unlocked?.[id];
};

export const unlockAchievement = (id) => {
  if (!id) return { ok: false, already: false, state: getAchievementsState() };
  const prev = getAchievementsState();
  if (prev.unlocked?.[id]) return { ok: true, already: true, state: prev };
  const next = {
    ...prev,
    unlocked: {
      ...prev.unlocked,
      [id]: Date.now(),
    },
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return { ok: true, already: false, state: next };
};
