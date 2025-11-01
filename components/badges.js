export const BADGE_TYPES = {
  FIRST: { id: '1st', name: '1st Place', emoji: '🥇', validity: 365, color: '#FFD700' },
  SECOND: { id: '2nd', name: '2nd Place', emoji: '🥈', validity: 365, color: '#C0C0C0' },
  THIRD: { id: '3rd', name: '3rd Place', emoji: '🥉', validity: 365, color: '#CD7F32' },
  PREFECT: { id: 'prefect', name: 'Prefect', emoji: '⭐', validity: 365, color: '#3B82F6' },
  MEDIA: { id: 'media', name: 'Media Unit', emoji: '📱', validity: 365, color: '#8B5CF6' },
  GOOD_STUDENT: { id: 'good-student', name: 'Good Student', emoji: '🌟', validity: 90, color: '#F59E0B' },
  QUIZ_MASTER: { id: 'quiz-master', name: 'Quiz Master', emoji: '📝', validity: 1, color: '#10B981' },
  BEST_CHILD: { id: 'best-child', name: 'Best Child', emoji: '👑', validity: 365, color: '#EC4899' },
};

export const isValidBadge = (badge) => {
  if (!badge.expiresAt) return true;
  return new Date(badge.expiresAt) > new Date();
};

export const addBadge = (currentBadges = [], badgeType, awardedBy) => {
  const config = BADGE_TYPES[badgeType.toUpperCase().replace('-', '_')];
  if (!config) return currentBadges;

  const newBadge = {
    type: config.id,
    name: config.name,
    emoji: config.emoji,
    awardedBy,
    awardedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + config.validity * 24 * 60 * 60 * 1000).toISOString(),
  };

  return [...currentBadges, newBadge];
};

export const removeBadge = (currentBadges = [], badgeType) => {
  return currentBadges.filter(b => b.type !== badgeType);
};

export const getValidBadges = (badges = []) => {
  return badges.filter(isValidBadge);
};
