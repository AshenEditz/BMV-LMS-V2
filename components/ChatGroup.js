import { useState, useEffect, useRef } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';
import { getValidBadges } from '../lib/badges';

export default function ChatGroup({ chatId, title, user, allowImages = true }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs.reverse());
    });

    setOnlineCount(Math.floor(Math.random() * 15) + 3);
    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageSelect = (e) => {
    if (e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const uploadImage = async (file) => {
    const storageRef = ref(storage, `chat-images/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedImage) return;

    setUploading(true);
    try {
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      const validBadges = getValidBadges(user.badges || []);

      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: newMessage,
        image: imageUrl,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        userBadges: validBadges.slice(0, 3), // Top 3 badges
        timestamp: new Date().toISOString(),
      });

      setNewMessage('');
      setSelectedImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', height: '500px', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, var(--green), #00cc6a)', 
        padding: '16px',
        color: 'black'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>{title}</h3>
        <p style={{ fontSize: '12px', opacity: 0.8 }}>🟢 {onlineCount} online</p>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', background: '#0a0a0a' }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              marginBottom: '12px',
              display: 'flex',
              justifyContent: msg.userId === user.id ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              maxWidth: '80%',
              background: msg.userId === user.id ? 'var(--green)' : 'rgba(255,255,255,0.1)',
              color: msg.userId === user.id ? 'black' : 'white',
              padding: '10px 12px',
              borderRadius: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{msg.userName}</span>
                {msg.userBadges?.map((badge, i) => (
                  <span key={i} title={badge.name}>{badge.emoji}</span>
                ))}
              </div>
              {msg.image && (
                <img 
                  src={msg.image} 
                  alt="Shared" 
                  style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '8px' }}
                />
              )}
              {msg.text && <p style={{ fontSize: '14px', wordBreak: 'break-word' }}>{msg.text}</p>}
              <p style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        {selectedImage && (
          <div style={{ marginBottom: '8px', fontSize: '12px', color: 'var(--green)' }}>
            📷 Image selected: {selectedImage.name}
            <button 
              type="button"
              onClick={() => setSelectedImage(null)}
              style={{ marginLeft: '8px', color: 'red' }}
            >
              ✕
            </button>
          </div>
        )}
        <div style={{ display: 'flex', gap: '8px' }}>
          {allowImages && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '18px'
                }}
              >
                📷
              </button>
            </>
          )}
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={uploading}
            style={{ flex: 1, padding: '10px 12px', fontSize: '14px' }}
          />
          <button
            type="submit"
            disabled={uploading || (!newMessage.trim() && !selectedImage)}
            className="btn btn-primary"
            style={{ padding: '10px 16px' }}
          >
            {uploading ? '⏳' : '➤'}
          </button>
        </div>
      </form>
    </div>
  );
}
