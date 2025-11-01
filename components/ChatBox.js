import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaSmile, FaImage, FaTimes } from 'react-icons/fa';
import StickerPicker from './StickerPicker';
import toast from 'react-hot-toast';

export default function ChatBox({ chatId, title, user }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs.reverse());
    });

    setOnlineCount(Math.floor(Math.random() * 20) + 5);

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToGitHub = async (file) => {
    try {
      setUploading(true);

      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64 = reader.result;
            const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

            const response = await fetch('/api/upload-to-github', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                image: base64,
                filename: filename,
                path: 'chat-images',
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
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedImage) return;

    try {
      let imageUrl = null;

      if (selectedImage) {
        toast.loading('Uploading image to GitHub...');
        imageUrl = await uploadImageToGitHub(selectedImage);
        toast.dismiss();
        toast.success('Image uploaded!');
      }

      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: newMessage || '',
        image: imageUrl,
        userId: user.id,
        userName: user.name,
        userBadges: user.badges || [],
        timestamp: new Date().toISOString(),
      });

      setNewMessage('');
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const sendSticker = async (sticker) => {
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        sticker: sticker,
        userId: user.id,
        userName: user.name,
        userBadges: user.badges || [],
        timestamp: new Date().toISOString(),
      });

      setShowStickers(false);
    } catch (error) {
      console.error('Error sending sticker:', error);
      toast.error('Failed to send sticker');
    }
  };

  const cancelImageUpload = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-primary p-4 flex justify-between items-center">
        <div>
          <h3 className="text-white font-bold text-lg">{title}</h3>
          <p className="text-white/80 text-sm">🟢 {onlineCount} online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-3 bg-black/20">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${msg.userId === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs ${msg.userId === user.id ? 'bg-primary' : 'bg-white/10'} rounded-lg p-3`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-semibold text-sm">{msg.userName}</span>
                  {msg.userBadges?.slice(0, 3).map((badge, i) => (
                    <span key={i} className="text-xs" title={badge.type}>
                      {badge.type === '1st' && '🥇'}
                      {badge.type === '2nd' && '🥈'}
                      {badge.type === '3rd' && '🥉'}
                      {badge.type === 'prefect' && '⭐'}
                      {badge.type === 'media' && '📱'}
                      {badge.type === 'best-child' && '👑'}
                      {badge.type === 'form-master' && '📝'}
                    </span>
                  ))}
                </div>

                {msg.sticker ? (
                  <div className="text-5xl">{msg.sticker}</div>
                ) : msg.image ? (
                  <div>
                    {msg.text && <p className="text-white mb-2">{msg.text}</p>}
                    <img
                      src={msg.image}
                      alt="Shared image"
                      className="rounded-lg max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(msg.image, '_blank')}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML += '<p class="text-red-400 text-sm">Image failed to load</p>';
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-white">{msg.text}</p>
                )}

                <p className="text-white/60 text-xs mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="p-4 bg-black/30 border-t border-white/10">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-24 rounded-lg"
            />
            <button
              onClick={cancelImageUpload}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              <FaTimes size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 bg-black/30 flex gap-2 items-center">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-white hover:text-primary transition-colors disabled:opacity-50"
          title="Attach image"
        >
          <FaImage size={24} />
        </button>

        <button
          type="button"
          onClick={() => setShowStickers(!showStickers)}
          className="text-white hover:text-primary transition-colors"
          title="Send sticker"
        >
          <FaSmile size={24} />
        </button>

        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={uploading ? "Uploading image..." : "Type a message..."}
          disabled={uploading}
          className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={uploading || (!newMessage.trim() && !selectedImage)}
          className="bg-primary hover:bg-green-600 text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? '⏳' : <FaPaperPlane />}
        </motion.button>
      </form>

      {/* Sticker Picker */}
      {showStickers && (
        <StickerPicker onSelect={sendSticker} onClose={() => setShowStickers(false)} />
      )}
    </motion.div>
  );
}
