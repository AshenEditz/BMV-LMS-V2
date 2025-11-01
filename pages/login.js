import { useState } from 'react';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { FaUser, FaLock, FaSignInAlt, FaShieldAlt, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ADMIN LOGIN
      if (username === 'BMVADMIN' && password === 'BMV@2009') {
        const email = 'admin@buthpitiya.lk';
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (authError) {
          await createUserWithEmailAndPassword(auth, email, password);
          await setDoc(doc(db, 'users', 'BMVADMIN'), {
            username: 'BMVADMIN',
            email: email,
            role: 'admin',
            name: 'Administrator',
            createdAt: new Date().toISOString()
          });
        }
        toast.success('🎉 Welcome Administrator!', {
          style: { background: '#0a0e27', color: '#00ff88', border: '1px solid #00ff88' }
        });
        setTimeout(() => router.push('/admin'), 1500);
        return;
      }

      // MEDIA LOGIN
      if (username === 'BmvMedia' && password === 'Ashen@2009') {
        const email = 'media@buthpitiya.lk';
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (authError) {
          await createUserWithEmailAndPassword(auth, email, password);
          await setDoc(doc(db, 'users', 'BmvMedia'), {
            username: 'BmvMedia',
            email: email,
            role: 'media',
            name: 'Media Unit',
            createdAt: new Date().toISOString()
          });
        }
        toast.success('🎉 Welcome Media Unit!', {
          style: { background: '#0a0e27', color: '#00ff88', border: '1px solid #00ff88' }
        });
        setTimeout(() => router.push('/media'), 1500);
        return;
      }

      // REGULAR USER LOGIN
      const userDoc = await getDoc(doc(db, 'users', username));
      if (!userDoc.exists()) {
        toast.error('Invalid username or password', {
          style: { background: '#0a0e27', color: '#ff4444', border: '1px solid #ff4444' }
        });
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      try {
        await signInWithEmailAndPassword(auth, userData.email, password);
      } catch (authError) {
        if (authError.code === 'auth/user-not-found') {
          await createUserWithEmailAndPassword(auth, userData.email, password);
        } else {
          throw authError;
        }
      }
      
      toast.success(`🎉 Welcome ${userData.name}!`, {
        style: { background: '#0a0e27', color: '#00ff88', border: '1px solid #00ff88' }
      });
      
      setTimeout(() => {
        router.push(`/${userData.role}`);
      }, 1500);

    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed: ' + error.message, {
        style: { background: '#0a0e27', color: '#ff4444', border: '1px solid #ff4444' }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <Toaster position="top-center" />

      {/* Animated Background Circles with Logo Watermarks */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Animated Circles */}
        <motion.div
          className="circle-blur"
          style={{
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(0,255,136,0.2) 0%, transparent 70%)',
            top: '-10%',
            right: '-10%',
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="circle-blur"
          style={{
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)',
            bottom: '-10%',
            left: '-10%',
          }}
          animate={{
            x: [0, -80, 0],
            y: [0, -60, 0],
            scale: [1.1, 0.9, 1.1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="circle-blur"
          style={{
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(188,19,254,0.12) 0%, transparent 70%)',
            top: '40%',
            left: '40%',
          }}
          animate={{
            x: [-50, 50, -50],
            y: [-30, 30, -30],
            scale: [0.9, 1.1, 0.9],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Floating Logo Watermarks */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="floating-logo absolute"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 20}%`,
              width: '150px',
              height: '150px',
              opacity: 0.04,
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          >
            <img
              src="https://i.imgur.com/c7EilDV.png"
              alt="Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Login Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-effect p-8 md:p-10 neon-border card-shine">
          {/* Logo Section */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, type: "spring", delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              {/* Rotating Glow Ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, var(--neon-green), var(--neon-blue), var(--neon-purple))',
                  filter: 'blur(20px)',
                  opacity: 0.6,
                }}
                animate={{
                  rotate: 360,
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                }}
              />
              
              {/* Logo Container */}
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl bg-white">
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <img
                    src="https://i.imgur.com/c7EilDV.png"
                    alt="Buthpitiya M.V"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.outerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-blue-500">
                          <span class="text-white font-bold text-3xl">BMV</span>
                        </div>
                      `;
                    }}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold mb-2 gradient-text">
              Buthpitiya M.V
            </h1>
            <p className="text-gray-400 text-lg mb-3">Learning Management System</p>
            <div className="flex items-center justify-center gap-2 text-green-400">
              <FaShieldAlt className="animate-pulse" />
              <span className="text-sm">Secure Access Portal</span>
            </div>
          </motion.div>

          {/* Info Message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="alert-warning mb-6 text-center"
          >
            <p className="text-sm leading-relaxed">
              මෙය අපගේ නිල LMS පද්ධතියයි. පාසලේ ICT ගුරුභවතා දුන් තොරතුරු භාවිතා කරන්න.
            </p>
          </motion.div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Field */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <label className="block text-white mb-2 font-semibold flex items-center gap-2">
                <FaUser className="text-green-400" />
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="transition-all duration-300"
              />
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <label className="block text-white mb-2 font-semibold flex items-center gap-2">
                <FaLock className="text-blue-400" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="pr-12 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full btn-neon flex items-center justify-center gap-3 text-lg relative disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="loader" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <FaSignInAlt />
                  <span>Access System</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Test Credentials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/30"
          >
            <p className="text-blue-400 font-semibold text-sm mb-2 text-center">🔑 Demo Access</p>
            <div className="text-xs text-gray-300 space-y-1 text-center">
              <p><strong>Admin:</strong> BMVADMIN / BMV@2009</p>
              <p><strong>Media:</strong> BmvMedia / Ashen@2009</p>
            </div>
          </motion.div>

          {/* Footer Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-6 text-center"
          >
            <a
              href="https://buthpitiyamv.schweb.lk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300 text-sm underline transition-colors inline-flex items-center gap-2"
            >
              🌐 Visit Main Website
            </a>
          </motion.div>
        </div>

        {/* Version Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center text-gray-500 text-xs mt-4"
        >
          v1.0.0 | Secure LMS Platform
        </motion.p>
      </motion.div>
    </div>
  );
    }
