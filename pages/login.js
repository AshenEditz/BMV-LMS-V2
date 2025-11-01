import { useState } from 'react';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check for admin login
      if (username === 'BMVADMIN' && password === 'BMV@2009') {
        const email = 'admin@buthpitiya.lk';
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('ආයුබෝවන් Administrator!');
        setTimeout(() => router.push('/admin'), 1500);
        return;
      }

      // Check for media unit login
      if (username === 'BmvMedia' && password === 'Ashen@2009') {
        const email = 'media@buthpitiya.lk';
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('ආයුබෝවන් Media Unit!');
        setTimeout(() => router.push('/media'), 1500);
        return;
      }

      // Regular user login
      const userDoc = await getDoc(doc(db, 'users', username));
      
      if (!userDoc.exists()) {
        toast.error('Invalid username or password');
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      await signInWithEmailAndPassword(auth, userData.email, password);
      
      toast.success(`ආයුබෝවන් ${userData.name}!`);
      
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <Toaster position="top-center" />
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="glass-effect p-8 md:p-12 max-w-md w-full"
      >
        {/* Logo */}
        <motion.div
          className="flex justify-center mb-6"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <Image
            src="https://i.imgur.com/c7EilDV.png"
            alt="Buthpitiya M.V Logo"
            width={120}
            height={120}
            className="animate-float"
          />
        </motion.div>

        {/* School Name */}
        <h1 className="text-3xl font-bold text-center text-white mb-2">
          Buthpitiya M.V
        </h1>
        <h2 className="text-xl text-center text-primary mb-6">
          Learning Management System
        </h2>

        {/* Warning Message */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 mb-6"
        >
          <p className="text-white text-sm text-center">
            මෙය අපගේ නිල දත්ත අඩංගු Web අඩවියකි එම නිසා ඔබ අපගේ පාසලේ සිසුවෙකු/ගුරුවරයෙකු නම් ඔබට පාසලේ ICT ගුරුභවතා දුන් User Name සහ Password පමණක් භාවිතා කරන්න
          </p>
        </motion.div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-white mb-2 font-medium">
              User Name
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2 font-medium">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your password"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login To Our Base'}
          </motion.button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <a
            href="https://buthpitiyamv.schweb.lk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-green-400 text-sm underline"
          >
            Visit Main School Website
          </a>
        </div>
      </motion.div>
    </div>
  );
}