import { motion } from 'framer-motion';
import { FaTimes, FaDownload } from 'react-icons/fa';

export default function ImagePreview({ imageUrl, onClose }) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="relative max-w-4xl max-h-screen"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleDownload}
            className="bg-primary hover:bg-green-600 text-white p-3 rounded-lg transition-colors"
          >
            <FaDownload />
          </button>
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Image */}
        <img
          src={imageUrl}
          alt="Preview"
          className="max-w-full max-h-screen rounded-lg shadow-2xl"
        />
      </motion.div>
    </motion.div>
  );
}