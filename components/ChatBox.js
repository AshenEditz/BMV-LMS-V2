import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaSmile, FaImage, FaTimes, FaExpand, FaDownload } from 'react-icons/fa';
import StickerPicker from './StickerPicker';
import toast from 'react-hot-toast';
import { compressImage, validateImage } from '../lib/imageCompression';

export default function ChatBox({ chatId, title, user }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs.reverse());
    });

    // Simulate online count (in production, implement real presence detection)
    setOnlineCount(Math.floor(Math.random() * 20) + 5);

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Validate image
      const validation = validateImage(file, { 
        maxSizeMB: 5,
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      });

      if (!validation.valid) {
        toast.error(validation.errors[0]);
        return;
      }

      // Show compression progress
      const toastId = toast.loading('Compressing image...');

      // Compress image
      const compressedFile = await compressImage(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        quality: 0.8
      });

      toast.dismiss(toastId);
      toast.success(`Image compressed to ${(compressedFile.size / 1024).toFixed(0)} KB`);

      setSelectedImage(compressedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(compressedFile);

    } catch (error) {
      console.error('Image processing error:', error);
      toast.error('Failed to process image');
    }
  };

  const uploadImageToGitHub = async (file) => {
    try {
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64 = reader.result;
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(7);
            const filename = `chat_${timestamp}_${randomStr}.jpg`;

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
              throw new Error(data.error || data.message || 'Upload failed');
            }

            resolve(data.url);
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedImage) return;

    const messageText = newMessage.trim();
    const imageToUpload = selectedImage;

    // Clear input immediately for better UX
    setNewMessage('');
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    try {
      let imageUrl = null;

      if (imageToUpload) {
        setUploading(true);
        const toastId = toast.loading('Uploading image to GitHub...');
        
        try {
          imageUrl = await uploadImageToGitHub(imageToUpload);
          toast.dismiss(toastId);
          toast.success('Image uploaded successfully!');
        } catch (uploadError) {
          toast.dismiss(toastId);
          toast.error('Failed to upload image: ' + uploadError.message);
          // Restore message and image if upload failed
          setNewMessage(messageText);
          setSelectedImage(imageToUpload);
          const reader = new FileReader();
          reader.onloadend = () => setImagePreview(reader.result);
          reader.readAsDataURL(imageToUpload);
          setUploading(false);
          return;
        }
      }

      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: messageText || '',
        image: imageUrl,
        userId: user.id,
        userName: user.name,
        userBadges: user.badges || [],
        timestamp: new Date().toISOString(),
      });

      setUploading(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setUploading(false);
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

  const downloadImage = async (imageUrl, fileName = 'image.jpg') => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Image downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download image');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-lg overflow-hidden relative"
    >
      {/* Header */}
      <div className="bg-primary p-4 flex justify-between items-center">
        <div>
          <h3 className="text-white font-bold text-lg">{title}</h3>
          <p className="text-white/80 text-sm">🟢 {onlineCount} online</p>
        </div>
      </div>

      {/* Messages Container */}
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
              <div 
                className={`max-w-xs lg:max-w-md ${
                  msg.userId === user.id 
                    ? 'bg-primary' 
                    : 'bg-white/10'
                } rounded-lg p-3 shadow-lg`}
              >
                {/* User Info with Badges */}
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-white font-semibold text-sm">
                    {msg.userName}
                  </span>
                  {msg.userBadges?.slice(0, 3).map((badge, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="text-base"
                      title={badge.type}
                    >
                      {badge.type === '1st' && '🥇'}
                      {badge.type === '2nd' && '🥈'}
                      {badge.type === '3rd' && '🥉'}
                      {badge.type === 'prefect' && '⭐'}
                      {badge.type === 'media' && '📱'}
                      {badge.type === 'best-child' && '👑'}
                      {badge.type === 'form-master' && '📝'}
                    </motion.span>
                  ))}
                </div>

                {/* Message Content */}
                {msg.sticker ? (
                  // Sticker Message
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-6xl"
                  >
                    {msg.sticker}
                  </motion.div>
                ) : msg.image ? (
                  // Image Message
                  <div>
                    {msg.text && (
                      <p className="text-white mb-2 break-words">{msg.text}</p>
                    )}
                    <div className="relative group">
                      <motion.img
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        src={msg.image}
                        alt="Shared image"
                        className="rounded-lg max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setExpandedImage(msg.image)}
                        onError={(e) => {
                          console.error('Image load error:', msg.image);
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML += `
                            <div class="bg-red-500/20 border border-red-500 rounded p-2 text-center">
                              <p class="text-red-400 text-sm">❌ Image failed to load</p>
                              <p class="text-gray-400 text-xs mt-1">The image may have been removed</p>
                            </div>
                          `;
                        }}
                        loading="lazy"
                      />
                      
                      {/* Image Actions (visible on hover) */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button
                          onClick={() => setExpandedImage(msg.image)}
                          className="bg-black/70 hover:bg-black text-white p-2 rounded-full"
                          title="Expand"
                        >
                          <FaExpand size={12} />
                        </button>
                        <button
                          onClick={() => downloadImage(msg.image, `chat_image_${msg.id}.jpg`)}
                          className="bg-black/70 hover:bg-black text-white p-2 rounded-full"
                          title="Download"
                        >
                          <FaDownload size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Text Message
                  <p className="text-white break-words whitespace-pre-wrap">
                    {msg.text}
                  </p>
                )}

                {/* Timestamp */}
                <p className="text-white/60 text-xs mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Empty State */}
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">💬</p>
            <p className="text-gray-400 mt-2">No messages yet</p>
            <p className="text-gray-500 text-sm">Be the first to say something!</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-black/30 border-t border-white/10"
          >
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-24 rounded-lg"
              />
              <button
                onClick={cancelImageUpload}
                disabled={uploading}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center disabled:opacity-50"
              >
                <FaTimes size={12} />
              </button>
              {selectedImage && (
                <p className="text-gray-400 text-xs mt-1">
                  {(selectedImage.size / 1024).toFixed(0)} KB
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 bg-black/30 flex gap-2 items-end border-t border-white/10">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Image Upload Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-white hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-2"
          title="Attach image"
        >
          <FaImage size={24} />
        </motion.button>

        {/* Sticker Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={() => setShowStickers(!showStickers)}
          disabled={uploading}
          className="text-white hover:text-primary transition-colors disabled:opacity-50 p-2"
          title="Send sticker"
        >
          <FaSmile size={24} />
        </motion.button>

        {/* Message Input */}
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={uploading ? "Uploading image..." : "Type a message..."}
          disabled={uploading}
          className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          maxLength={1000}
        />

        {/* Send Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={uploading || (!newMessage.trim() && !selectedImage)}
          className="bg-primary hover:bg-green-600 text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Send message"
        >
          {uploading ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              ⏳
            </motion.span>
          ) : (
            <FaPaperPlane />
          )}
        </motion.button>
      </form>

      {/* Sticker Picker */}
      <AnimatePresence>
        {showStickers && (
          <StickerPicker 
            onSelect={sendSticker} 
            onClose={() => setShowStickers(false)} 
          />
        )}
      </AnimatePresence>

      {/* Expanded Image Modal */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setExpandedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-screen"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setExpandedImage(null)}
                className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full z-10 shadow-lg"
              >
                <FaTimes size={20} />
              </button>

              {/* Download Button */}
              <button
                onClick={() => {
                  downloadImage(expandedImage, 'chat_image.jpg');
                  setExpandedImage(null);
                }}
                className="absolute top-4 left-4 bg-primary hover:bg-green-600 text-white p-3 rounded-full z-10 shadow-lg"
              >
                <FaDownload size={20} />
              </button>

              {/* Expanded Image */}
              <img
                src={expandedImage}
                alt="Expanded view"
                className="max-w-full max-h-screen rounded-lg shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
            }
