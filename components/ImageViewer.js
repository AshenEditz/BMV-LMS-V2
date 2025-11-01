import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaDownload, FaExpand, FaCompress } from 'react-icons/fa';
import { useState } from 'react';

export default function ImageViewer({ imageUrl, onClose }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const downloadImage = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image_${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className={`relative ${isFullscreen ? 'w-full h-full' : 'max-w-4xl max-h-screen'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Control Bar */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleFullscreen}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full shadow-lg"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <FaCompress size={20} /> : <FaExpand size={20} />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={downloadImage}
            className="bg-primary hover:bg-green-600 text-white p-3 rounded-full shadow-lg"
            title="Download"
          >
            <FaDownload size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg"
            title="Close"
          >
            <FaTimes size={20} />
          </motion.button>
        </div>

        {/* Image */}
        <img
          src={imageUrl}
          alt="Full view"
          className={`${
            isFullscreen ? 'w-full h-full object-contain' : 'max-w-full max-h-screen'
          } rounded-lg shadow-2xl`}
        />
      </motion.div>
    </motion.div>
  );
  }
