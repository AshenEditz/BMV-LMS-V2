import { motion } from 'framer-motion';
import { FaMedal, FaStar, FaTrophy } from 'react-icons/fa';

const badgeConfig = {
  '1st': { icon: '🥇', name: '1st Place', color: 'badge-gold' },
  '2nd': { icon: '🥈', name: '2nd Place', color: 'badge-silver' },
  '3rd': { icon: '🥉', name: '3rd Place', color: 'badge-bronze' },
  'prefect': { icon: '⭐', name: 'Prefect', color: 'bg-blue-500' },
  'media': { icon: '📱', name: 'Media Unit', color: 'bg-purple-500' },
  'best-child': { icon: '👑', name: 'Best Child', color: 'bg-pink-500' },
  'form-master': { icon: '📝', name: 'Form Master', color: 'bg-indigo-500' },
};

export default function BadgeDisplay({ badges = [] }) {
  const now = new Date();
  
  // Filter expired badges
  const validBadges = badges.filter(badge => {
    if (!badge.expiresAt) return true;
    return new Date(badge.expiresAt) > now;
  });

  if (validBadges.length === 0) {
    return (
      <div className="text-gray-400 text-center py-8">
        No badges earned yet. Keep working hard! 💪
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {validBadges.map((badge, index) => {
        const config = badgeConfig[badge.type] || { icon: '🏆', name: badge.type, color: 'bg-gray-500' };
        
        return (
          <motion.div
            key={index}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`${config.color} p-4 rounded-xl text-center cursor-pointer shadow-lg`}
          >
            <div className="text-4xl mb-2">{config.icon}</div>
            <div className="text-white font-bold text-sm">{config.name}</div>
            {badge.expiresAt && (
              <div className="text-xs text-white/70 mt-1">
                Expires: {new Date(badge.expiresAt).toLocaleDateString()}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}