import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const stickerCategories = {
  'Emotions': [
    '😀', '😂', '🤣', '😍', '🥰', '😎', '🤔', '😴',
    '😭', '😡', '🤯', '🥳', '😇', '🤓', '😋', '😱',
  ],
  'Hands': [
    '👍', '👏', '🙏', '💪', '✌️', '🤝', '👋', '✋',
    '👌', '🤙', '🤘', '🖐️', '✊', '👊', '🙌', '👐',
  ],
  'School': [
    '📚', '✏️', '📖', '📝', '🎓', '🏫', '📐', '📏',
    '✂️', '📌', '📍', '🖊️', '🖍️', '📔', '📕', '📗',
  ],
  'Celebrations': [
    '🎉', '🎊', '🎈', '🎁', '🎂', '🎆', '🎇', '✨',
    '🌟', '⭐', '💫', '🎯', '🏆', '🥇', '🥈', '🥉',
  ],
  'Hearts': [
    '❤️', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍',
    '💕', '💞', '💓', '💗', '💖', '💝', '💘', '💟',
  ],
  'Symbols': [
    '💯', '🔥', '⚡', '💡', '🌈', '☀️', '🌙', '⭐',
    '✅', '❌', '❗', '❓', '💬', '💭', '🔔', '🎵',
  ],
};

export default function StickerPicker({ onSelect, onClose }) {
  const [activeCategory, setActiveCategory] = useState('Emotions');

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute bottom-20 left-4 right-4 glass-effect p-4 rounded-lg z-50 max-w-lg mx-auto"
    >
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-white font-bold">Select Sticker</h4>
        <button
          onClick={onClose}
          className="text-white hover:text-red-500 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
        {Object.keys(stickerCategories).map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap transition-colors ${
              activeCategory === category
                ? 'bg-primary text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Stickers Grid */}
      <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
        <AnimatePresence mode="wait">
          {stickerCategories[activeCategory].map((sticker, index) => (
            <motion.button
              key={`${activeCategory}-${index}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ delay: index * 0.02 }}
              whileHover={{ scale: 1.3, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelect(sticker)}
              className="text-3xl hover:bg-white/10 rounded-lg p-2 transition-colors"
            >
              {sticker}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}