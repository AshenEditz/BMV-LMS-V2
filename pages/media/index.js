import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
// ❌ REMOVED: Firebase Storage imports
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
  const [imagePreview, setImagePreview] = useState(null);

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
      const file = e.target.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setFormData({ ...formData, image: file });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToGitHub = async (file) => {
    try {
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64 = reader.result;
            const filename = `news_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

            const response = await fetch('/api/upload-to-github', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                image: base64,
                filename: filename,
                path: 'news-images',
              }),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error || 'Upload failed');
            }

            resolve(data.url);
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const uploadNews = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = '';

      if (formData.image) {
        toast.loading('Uploading image to GitHub...');
        imageUrl = await uploadImageToGitHub(formData.image);
        toast.dismiss();
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
      setImagePreview(null);
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
              <p className="text-gray-300">Manage school news and updates (GitHub Storage)</p>
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
              <label className="block text-white mb-2">Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:cursor-pointer"
              />
              {imagePreview && (
                <div className="mt-3 relative inline-block">
                  <img src={imagePreview} alt="Preview" className="h-32 rounded-lg" />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, image: null });
                      setImagePreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={uploading}
              className="w-full bg-primary hover:bg-green-600 text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading to GitHub...' : '📤 Upload News'}
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
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
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
