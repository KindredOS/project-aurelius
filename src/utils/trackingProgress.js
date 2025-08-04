// Path: src/utils/trackingProgress.js
// Focus: Stateless utility module for handling achievement progress logic
// Version Update: First scaffold,

// Returns progress (0–100) for a given badge
export const getProgressForBadge = (badge, achievements) => {
  if (!Array.isArray(achievements)) return 0;

  const entry = achievements.find((a) => {
    if (typeof a === 'string') return a === badge.id;
    return a?.key === badge.id;
  });

  if (!entry) return 0;
  if (typeof entry === 'string') return 100;
  if (entry.progress !== undefined) return Math.min(entry.progress, 100);

  return 0;
};

// Returns true if badge is considered unlocked
export const isAchievementUnlocked = (badge, achievements) => {
  if (!Array.isArray(achievements)) return false;

  return achievements.some((a) => {
    if (typeof a === 'string') return a === badge.id;
    return a?.key === badge.id && (a.progress === undefined || a.progress >= 100);
  });
};

// Returns an updated achievements array with the badge progress incremented or unlocked
export const updateAchievements = (achievements, key, amount = 0, forceUnlock = false) => {
  const copy = Array.isArray(achievements) ? [...achievements] : [];
  const index = copy.findIndex((a) => typeof a === 'object' && a.key === key);

  if (forceUnlock) {
    if (index !== -1) {
      copy[index] = {
        ...copy[index],
        progress: 100,
        unlockedAt: new Date().toISOString()
      };
    } else {
      copy.push({ key, progress: 100, unlockedAt: new Date().toISOString() });
    }
    return copy;
  }

  if (index !== -1) {
    const updated = { ...copy[index] };
    updated.progress = Math.min((updated.progress || 0) + amount, 100);
    if (updated.progress === 100 && !updated.unlockedAt) {
      updated.unlockedAt = new Date().toISOString();
    }
    copy[index] = updated;
    return copy;
  }

  copy.push({ key, progress: amount });
  return copy;
};
