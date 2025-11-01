import { useState } from 'react';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';
import { FaUser, FaLock, FaSignInAlt, FaShieldAlt } from 'react-icons/fa';
import Footer from '../components/Footer';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (username === 'BMVADMIN' && password === 'BMV@2009') {
        const email = 'admin@buthpitiya.lk';
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('🎉 Welcome Administrator!');
        setTimeout(() => router.push('/admin'), 1500);
        return;
      }

      if (username === 'BmvMedia' && password === 'Ashen@2009') {
        const email = 'media@buthpitiya.lk';
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('🎉 Welcome Media Unit!');
        setTimeout(() => router.push('/media'), 1500);
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', username));
      
      if (!userDoc.exists()) {
        toast.error('Invalid username or password');
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      await signInWithEmailAndPassword(auth, userData.email, password);
      
      toast.success(`🎉 Welcome ${userData.name}!`);
      
      setTimeout(() => {
        switch(userData.role) {
          case 'principal':
            router.push('/principal');
            break;
          case 'teacher':
            router.push('/teacher');
            break;
          case 'student':
            router.push('/student');
            break;
          default:
            router.push('/');
        }
      }, 1500);

    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
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
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                <Image
                  src="https://i.imgur.com/c7EilDV.png"
                  alt="Buthpitiya M.V Logo"
                  width={128}
                  height={128}
                  className="object-cover animate-float"
                  priority
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
                className="w-full"
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
                className="w-full"
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
              className="w-full btn-primary flex items-center justify-center gap-3 text-lg"
            >
              {loading ? (
                <>
                  <div className="spinner" />
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
