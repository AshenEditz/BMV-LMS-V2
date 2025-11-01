import { useState } from 'react';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';
import { FaUser, FaLock, FaSignInAlt, FaShieldAlt, FaBug } from 'react-icons/fa';
import Footer from '../components/Footer';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [debugInfo, setDebugInfo] = useState([]);
  const router = useRouter();

  const addDebugInfo = (message, type = 'info') => {
    console.log(`[${type.toUpperCase()}]`, message);
    setDebugInfo(prev => [...prev, { message, type, timestamp: new Date().toISOString() }]);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setDebugInfo([]);
    addDebugInfo('🚀 Starting login process...');

    try {
      // Check Firebase connection
      addDebugInfo('✅ Firebase initialized');
      addDebugInfo(`Username entered: ${username}`);

      // ADMIN LOGIN
      if (username === 'BMVADMIN' && password === 'BMV@2009') {
        addDebugInfo('🔍 Admin login detected');
        const email = 'admin@buthpitiya.lk';
        
        try {
          addDebugInfo(`Attempting to sign in with email: ${email}`);
          await signInWithEmailAndPassword(auth, email, password);
          addDebugInfo('✅ Admin authentication successful!');
          toast.success('🎉 Welcome Administrator!');
          setTimeout(() => router.push('/admin'), 1500);
          return;
        } catch (authError) {
          addDebugInfo(`⚠️ Admin account doesn't exist. Creating...`, 'warning');
          
          try {
            // Create admin account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            addDebugInfo('✅ Admin account created in Auth');
            
            // Create admin user document
            await setDoc(doc(db, 'users', 'BMVADMIN'), {
              username: 'BMVADMIN',
              email: email,
              role: 'admin',
              name: 'Administrator',
              createdAt: new Date().toISOString()
            });
            addDebugInfo('✅ Admin user document created');
            
            toast.success('🎉 Admin account created! Welcome!');
            setTimeout(() => router.push('/admin'), 1500);
            return;
          } catch (createError) {
            addDebugInfo(`❌ Failed to create admin: ${createError.message}`, 'error');
            toast.error('Failed to create admin account: ' + createError.message);
            setLoading(false);
            return;
          }
        }
      }

      // MEDIA LOGIN
      if (username === 'BmvMedia' && password === 'Ashen@2009') {
        addDebugInfo('🔍 Media unit login detected');
        const email = 'media@buthpitiya.lk';
        
        try {
          await signInWithEmailAndPassword(auth, email, password);
          addDebugInfo('✅ Media authentication successful!');
          toast.success('🎉 Welcome Media Unit!');
          setTimeout(() => router.push('/media'), 1500);
          return;
        } catch (authError) {
          addDebugInfo(`⚠️ Media account doesn't exist. Creating...`, 'warning');
          
          try {
            await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, 'users', 'BmvMedia'), {
              username: 'BmvMedia',
              email: email,
              role: 'media',
              name: 'Media Unit',
              createdAt: new Date().toISOString()
            });
            
            toast.success('🎉 Media account created! Welcome!');
            setTimeout(() => router.push('/media'), 1500);
            return;
          } catch (createError) {
            addDebugInfo(`❌ Failed to create media account: ${createError.message}`, 'error');
            toast.error('Failed to create media account');
            setLoading(false);
            return;
          }
        }
      }

      // REGULAR USER LOGIN
      addDebugInfo('🔍 Checking for regular user account...');
      const userDocRef = doc(db, 'users', username);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        addDebugInfo(`❌ User document not found for: ${username}`, 'error');
        toast.error('Invalid username or password');
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      addDebugInfo(`✅ User document found. Role: ${userData.role}`);
      addDebugInfo(`Attempting authentication with email: ${userData.email}`);

      try {
        await signInWithEmailAndPassword(auth, userData.email, password);
        addDebugInfo('✅ Authentication successful!');
        toast.success(`🎉 Welcome ${userData.name}!`);
        
        setTimeout(() => {
          switch(userData.role) {
            case 'principal':
              addDebugInfo('Redirecting to principal dashboard');
              router.push('/principal');
              break;
            case 'teacher':
              addDebugInfo('Redirecting to teacher dashboard');
              router.push('/teacher');
              break;
            case 'student':
              addDebugInfo('Redirecting to student dashboard');
              router.push('/student');
              break;
            default:
              addDebugInfo('Redirecting to home');
              router.push('/');
          }
        }, 1500);
      } catch (authError) {
        addDebugInfo(`❌ Authentication failed: ${authError.message}`, 'error');
        
        if (authError.code === 'auth/user-not-found') {
          addDebugInfo('Creating user in Firebase Auth...', 'warning');
          try {
            await createUserWithEmailAndPassword(auth, userData.email, password);
            addDebugInfo('✅ User created and authenticated');
            toast.success(`🎉 Welcome ${userData.name}!`);
            setTimeout(() => router.push(`/${userData.role}`), 1500);
            return;
          } catch (createError) {
            addDebugInfo(`❌ Failed to create user: ${createError.message}`, 'error');
          }
        }
        
        toast.error('Invalid password');
        setLoading(false);
      }

    } catch (error) {
      addDebugInfo(`❌ Login error: ${error.message}`, 'error');
      console.error('Login error:', error);
      toast.error('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-center" />

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-green-500 to-blue-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity, delay: 10 }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full blur-3xl"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glass-effect p-8 md:p-12 max-w-md w-full"
        >
          {/* Logo */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-xl opacity-50"
              />
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl bg-white">
                <img
                  src="https://i.imgur.com/c7EilDV.png"
                  alt="Buthpitiya M.V Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = `data:image/svg+xml,${encodeURIComponent(`
                      <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
                        <rect width="128" height="128" fill="#10B981"/>
                        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="40" font-weight="bold">BMV</text>
                      </svg>
                    `)}`;
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2 gradient-text">
              Buthpitiya M.V
            </h1>
            <p className="text-xl text-gray-300 mb-4">Learning Management System</p>
            <div className="flex items-center justify-center gap-2 text-green-400">
              <FaShieldAlt />
              <span className="text-sm">Secure Login</span>
            </div>
          </motion.div>

          {/* Warning Message */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="alert-warning mb-6"
          >
            <p className="text-sm text-center leading-relaxed">
              මෙය අපගේ නිල දත්ත අඩංගු Web අඩවියකි. ඔබ අපගේ පාසලේ සිසුවෙකු/ගුරුවරයෙකු නම් පාසලේ ICT ගුරුභවතා දුන් User Name සහ Password භාවිතා කරන්න.
            </p>
          </motion.div>

          {/* Quick Test Credentials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-blue-500/20 border border-blue-500 rounded-lg p-4 mb-6"
          >
            <p className="text-white font-semibold mb-2 text-center">🔑 Test Login</p>
            <p className="text-sm text-gray-300 text-center">
              <strong>Admin:</strong> BMVADMIN / BMV@2009
            </p>
            <p className="text-sm text-gray-300 text-center">
              <strong>Media:</strong> BmvMedia / Ashen@2009
            </p>
          </motion.div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <label className="block text-white mb-2 font-semibold flex items-center gap-2">
                <FaUser className="text-primary" />
                User Name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <label className="block text-white mb-2 font-semibold flex items-center gap-2">
                <FaLock className="text-primary" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </motion.div>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <FaSignInAlt />
                  <span>Login To Our Base</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Debug Toggle */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setDebugMode(!debugMode)}
              className="text-gray-400 hover:text-white text-sm flex items-center gap-2 mx-auto"
            >
              <FaBug />
              {debugMode ? 'Hide Debug Info' : 'Show Debug Info'}
            </button>
          </div>

          {/* Debug Console */}
          {debugMode && debugInfo.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 bg-black/50 rounded-lg p-4 max-h-64 overflow-y-auto"
            >
              <h3 className="text-white font-bold mb-2">Debug Console:</h3>
              <div className="space-y-1 text-xs font-mono">
                {debugInfo.map((info, index) => (
                  <div
                    key={index}
                    className={`
                      ${info.type === 'error' ? 'text-red-400' : ''}
                      ${info.type === 'warning' ? 'text-yellow-400' : ''}
                      ${info.type === 'info' ? 'text-green-400' : ''}
                    `}
                  >
                    {info.message}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Footer Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 text-center"
          >
            <a
              href="https://buthpitiyamv.schweb.lk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-green-400 text-sm underline transition-colors"
            >
              🌐 Visit Main School Website
            </a>
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
                         }
