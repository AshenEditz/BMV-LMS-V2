import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db, storage } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';
import { FaImage, FaNewspaper, FaTrash, FaUpload } from 'react-icons/fa';

export default function MediaDashboard() {
  const router = useRouter();
  const [news, setNews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null,
  });

  useEffect(() => {
    checkAuth();
    fetchNews();
  }, []);

  const checkAuth = () => {
    const user = auth.currentUser;
    if (!user || user.email !== 'media@buthpitiya.lk') {
      router.push('/login');
    }
  };

  const fetchNews = async () => {
    try {
      const newsSnapshot = await getDocs(collection(db, 'news'));
      const newsData = newsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNews(newsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const uploadNews = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = '';

      if (formData.image) {
        const storageRef = ref(storage, `news/${Date.now()}_${formData.image.name}`);
        await uploadBytes(storageRef, formData.image);
        imageUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, 'news'), {
        title: formData.title,
        description: formData.description,
        imageUrl: imageUrl,
        timestamp: new Date().toISOString(),
        author: 'Media Unit',
      });

      toast.success('News uploaded successfully!');
      setFormData({ title: '', description: '', image: null });
      fetchNews();
    } catch (error) {
      console.error('Error uploading news:', error);
      toast.error('Failed to upload news');
    } finally {
      setUploading(false);
    }
  };

  const deleteNews = async (id) => {
    if (!confirm('Are you sure you want to delete this news?')) return;

    try {
      await deleteDoc(doc(db, 'news', id));
      toast.success('News deleted successfully!');
      fetchNews();
    } catch (error) {
      console.error('Error deleting news:', error);
      toast.error('Failed to delete news');
    }
  };

  return (
    <div className="min-h-screen p-6">
      <Toaster position="top-center" />

      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            rotate: [0, 180, 360],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Image
              src="https://i.imgur.com/c7EilDV.png"
              alt="Logo"
              width={80}
              height={80}
              className="animate-float"
            />
            <div>
              <h1 className="text-4xl font-bold text-white">
                📱 Media Unit Dashboard
              </h1>
              <p className="text-gray-300">Manage school news and updates</p>
            </div>
          </div>
        </motion.div>

        {/* Upload Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <FaUpload /> Upload News
          </h2>
          <form onSubmit={uploadNews} className="space-y-4">
            <div>
              <label className="block text-white mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter news title"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Enter news description"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:cursor-pointer"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={uploading}
              className="w-full bg-primary hover:bg-green-600 text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : '📤 Upload News'}
            </motion.button>
          </form>
        </motion.div>

        {/* News List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <FaNewspaper /> Published News
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white/5 rounded-lg overflow-hidden"
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-300 text-sm mb-3">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => deleteNews(item.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {news.length === 0 && (
            <p className="text-gray-400 text-center py-8">No news published yet</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
