import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import { FaSignInAlt, FaUsers, FaTrophy, FaChartLine, FaGraduationCap } from 'react-icons/fa';

export default function Home() {
  const router = useRouter();
  const [stats, setStats] = useState({ students: 0, teachers: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const studentsSnap = await getDocs(collection(db, 'students'));
      const teachersSnap = await getDocs(collection(db, 'teachers'));
      setStats({
        students: studentsSnap.size,
        teachers: teachersSnap.size,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Modern Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => router.push('/')}
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-green-400/50 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500 animate-pulse opacity-50" />
                <img
                  src="https://i.imgur.com/c7EilDV.png"
                  alt="Logo"
                  className="relative w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg gradient-text">Buthpitiya M.V</h1>
                <p className="text-gray-400 text-xs">Digital Learning</p>
              </div>
            </motion.div>

            {/* Login Button */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/login')}
              className="btn-neon px-6 py-3 text-sm sm:text-base"
            >
              <FaSignInAlt className="inline mr-2" />
              Login
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="circle-blur"
            style={{
              width: `${400 + i * 100}px`,
              height: `${400 + i * 100}px`,
              background: `radial-gradient(circle, ${
                i === 0 ? 'rgba(0,255,136,0.15)' :
                i === 1 ? 'rgba(0,212,255,0.12)' :
                'rgba(188,19,254,0.1)'
              } 0%, transparent 70%)`,
              top: `${10 + i * 30}%`,
              left: `${10 + i * 30}%`,
            }}
            animate={{
              x: [0, 100 * (i + 1), 0],
              y: [0, 50 * (i + 1), 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 15 + i * 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Logo Watermarks */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`logo-${i}`}
            className="absolute opacity-5"
            style={{
              left: `${Math.random() * 80}%`,
              top: `${Math.random() * 80}%`,
              width: '120px',
              height: '120px',
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 20 + i * 3,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <img
              src="https://i.imgur.com/c7EilDV.png"
              alt=""
              className="w-full h-full object-contain"
            />
          </motion.div>
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Main Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, type: "spring" }}
            className="mb-8"
          >
            <div className="relative inline-block">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, var(--neon-green), var(--neon-blue), var(--neon-purple))',
                  filter: 'blur(30px)',
                  opacity: 0.6,
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: 360,
                }}
                transition={{
                  scale: { duration: 3, repeat: Infinity },
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                }}
              />
              <div className="relative w-40 h-40 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl bg-white">
                <img
                  src="https://i.imgur.com/c7EilDV.png"
                  alt="Buthpitiya M.V"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.outerHTML = `
                      <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
                        <FaGraduationCap class="text-white text-6xl" />
                      </div>
                    `;
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 gradient-text"
          >
            Buthpitiya M.V
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl sm:text-3xl text-gray-300 mb-4"
          >
            Learning Management System
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto"
          >
            නවීන තාක්ෂණික අධ්‍යාපන පද්ධතිය
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={() => router.push('/login')}
              className="btn-neon px-10 py-4 text-lg w-full sm:w-auto"
            >
              <FaSignInAlt className="inline mr-2" />
              Access Portal
            </button>
            <a
              href="https://buthpitiyamv.schweb.lk"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-effect px-10 py-4 text-lg rounded-xl text-white hover:bg-white/10 transition-all w-full sm:w-auto text-center border-2 border-white/20"
            >
              Main Website
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto"
          >
            <div className="glass-card p-6 neon-glow">
              <FaUsers className="text-5xl text-green-400 mx-auto mb-3" />
              <p className="text-4xl font-bold text-white mb-1">{stats.students}</p>
              <p className="text-gray-300">Students</p>
            </div>
            <div className="glass-card p-6 neon-glow">
              <FaTrophy className="text-5xl text-yellow-400 mx-auto mb-3" />
              <p className="text-4xl font-bold text-white mb-1">{stats.teachers}</p>
              <p className="text-gray-300">Teachers</p>
            </div>
            <div className="glass-card p-6 neon-glow">
              <FaChartLine className="text-5xl text-blue-400 mx-auto mb-3" />
              <p className="text-4xl font-bold text-white mb-1">100%</p>
              <p className="text-gray-300">Digital</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative glass-effect border-t border-white/10 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Buthpitiya M.V. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Powered by Modern Web Technologies
          </p>
        </div>
      </footer>
    </div>
  );
                       }
