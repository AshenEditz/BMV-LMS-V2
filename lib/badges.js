// lib/badges.js
// Badge management system with expiry and validation

export const BADGE_TYPES = {
  FIRST: { 
    id: '1st', 
    name: '1st Place', 
    emoji: '🥇', 
    validity: 365, 
    color: '#FFD700' 
  },
  SECOND: { 
    id: '2nd', 
    name: '2nd Place', 
    emoji: '🥈', 
    validity: 365, 
    color: '#C0C0C0' 
  },
  THIRD: { 
    id: '3rd', 
    name: '3rd Place', 
    emoji: '🥉', 
    validity: 365, 
    color: '#CD7F32' 
  },
  PREFECT: { 
    id: 'prefect', 
    name: 'Prefect', 
    emoji: '⭐', 
    validity: 365, 
    color: '#3B82F6' 
  },
  MEDIA: { 
    id: 'media', 
    name: 'Media Unit', 
    emoji: '📱', 
    validity: 365, 
    color: '#8B5CF6' 
  },
  GOOD_STUDENT: { 
    id: 'good-student', 
    name: 'Good Student', 
    emoji: '🌟', 
    validity: 90, 
    color: '#F59E0B' 
  },
  QUIZ_MASTER: { 
    id: 'quiz-master', 
    name: 'Quiz Master', 
    emoji: '📝', 
    validity: 1, 
    color: '#10B981' 
  },
  FORM_MASTER: { 
    id: 'form-master', 
    name: 'Form Master', 
    emoji: '📝', 
    validity: 1, 
    color: '#10B981' 
  },
  BEST_CHILD: { 
    id: 'best-child', 
    name: 'Best Child', 
    emoji: '👑', 
    validity: 365, 
    color: '#EC4899' 
  },
};

/**
 * Check if a badge is still valid (not expired)
 * @param {Object} badge - Badge object with expiresAt field
 * @returns {boolean} - True if valid, false if expired
 */
export const isValidBadge = (badge) => {
  if (!badge.expiresAt) return true;
  return new Date(badge.expiresAt) > new Date();
};

/**
 * Add a badge to a student's badge collection
 * @param {Array} currentBadges - Current badges array
 * @param {string} badgeType - Type of badge to add
 * @param {string} awardedBy - Who awarded the badge
 * @returns {Array} - Updated badges array
 */
export const addBadge = (currentBadges = [], badgeType, awardedBy) => {
  // Convert badgeType to uppercase and replace hyphens
  const badgeKey = badgeType.toUpperCase().replace('-', '_');
  const config = BADGE_TYPES[badgeKey];
  
  if (!config) {
    console.warn(`Unknown badge type: ${badgeType}`);
    return currentBadges;
  }

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

/**
 * Remove a specific badge from student's collection
 * @param {Array} currentBadges - Current badges array
 * @param {string} badgeType - Type of badge to remove
 * @returns {Array} - Updated badges array
 */
export const removeBadge = (currentBadges = [], badgeType) => {
  return currentBadges.filter(b => b.type !== badgeType);
};

/**
 * Get only valid (non-expired) badges
 * @param {Array} badges - All badges array
 * @returns {Array} - Only valid badges
 */
export const getValidBadges = (badges = []) => {
  return badges.filter(isValidBadge);
};

/**
 * Get badge configuration by type
 * @param {string} badgeType - Badge type ID
 * @returns {Object|null} - Badge configuration or null
 */
export const getBadgeConfig = (badgeType) => {
  const badgeKey = badgeType.toUpperCase().replace('-', '_');
  return BADGE_TYPES[badgeKey] || null;
};

/**
 * Check if student has a specific badge
 * @param {Array} badges - Student's badges
 * @param {string} badgeType - Badge type to check
 * @returns {boolean} - True if student has the badge
 */
export const hasBadge = (badges = [], badgeType) => {
  const validBadges = getValidBadges(badges);
  return validBadges.some(b => b.type === badgeType);
};

/**
 * Get emoji for a badge type
 * @param {string} badgeType - Badge type
 * @returns {string} - Emoji or default trophy
 */
export const getBadgeEmoji = (badgeType) => {
  const config = getBadgeConfig(badgeType);
  return config ? config.emoji : '🏆';
};

/**
 * Format badge for display
 * @param {Object} badge - Badge object
 * @returns {Object} - Formatted badge with all display info
 */
export const formatBadge = (badge) => {
  const config = getBadgeConfig(badge.type);
  
  return {
    ...badge,
    emoji: config?.emoji || '🏆',
    color: config?.color || '#10B981',
    isValid: isValidBadge(badge),
    daysUntilExpiry: badge.expiresAt 
      ? Math.ceil((new Date(badge.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
      : null
  };
};

/**
 * Get all available badge types as array
 * @returns {Array} - Array of badge configurations
 */
export const getAllBadgeTypes = () => {
  return Object.values(BADGE_TYPES);
};

/**
 * Clean up expired badges from a collection
 * @param {Array} badges - All badges
 * @returns {Array} - Only valid badges
 */
export const cleanExpiredBadges = (badges = []) => {
  return getValidBadges(badges);
};
