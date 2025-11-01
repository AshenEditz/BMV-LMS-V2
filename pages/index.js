import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaSignInAlt, FaUsers, FaTrophy, FaChartLine, FaArrowRight, FaGlobe } from 'react-icons/fa';
import Footer from '../components/Footer';

export default function Home() {
  const router = useRouter();
  const [news, setNews] = useState([]);
  const [stats, setStats] = useState({ students: 0, teachers: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const newsRef = collection(db, 'news');
      const newsQuery = query(newsRef, orderBy('timestamp', 'desc'), limit(6));
      const newsSnapshot = await getDocs(newsQuery);
      setNews(newsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const studentsSnapshot = await getDocs(collection(db, 'students'));
      const teachersSnapshot = await getDocs(collection(db, 'teachers'));
      setStats({
        students: studentsSnapshot.size,
        teachers: teachersSnapshot.size,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo & School Name */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => router.push('/')}
            >
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-primary/50 shadow-lg hover:border-primary transition-all hover:scale-110 duration-300">
                <Image
                  src="https://i.imgur.com/c7EilDV.png"
                  alt="Buthpitiya M.V Logo"
                  width={56}
                  height={56}
                  className="object-cover"
                  priority
                  unoptimized
                />
              </div>
              <div>
                <h1 className="text-white font-bold text-xl gradient-text">
                  Buthpitiya M.V
                </h1>
                <p className="text-gray-400 text-xs">Learning Management System</p>
              </div>
            </motion.div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <motion.a
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                href="#home"
                className="text-gray-300 hover:text-primary transition-colors"
              >
                Home
              </motion.a>
              <motion.a
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                href="#news"
                className="text-gray-300 hover:text-primary transition-colors"
              >
                News
              </motion.a>
              <motion.a
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                href="https://buthpitiyamv.schweb.lk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-primary transition-colors flex items-center gap-2"
              >
                <FaGlobe /> Main Website
              </motion.a>
            </div>

            {/* Login Button */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/login')}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg flex items-center gap-2"
            >
              <FaSignInAlt />
              <span className="hidden sm:inline">Login</span>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* ANIMATED BACKGROUND - FIXED VERSION */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated Orb 1 */}
          <motion.div
            className="absolute w-96 h-96 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, rgba(16,185,129,0) 70%)',
              filter: 'blur(60px)',
              top: '10%',
              right: '10%',
            }}
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Animated Orb 2 */}
          <motion.div
            className="absolute w-96 h-96 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0) 70%)',
              filter: 'blur(60px)',
              bottom: '10%',
              left: '10%',
            }}
            animate={{
              x: [0, -100, 0],
              y: [0, -50, 0],
              scale: [1.2, 1, 1.2],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Animated Orb 3 */}
          <motion.div
            className="absolute w-80 h-80 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, rgba(168,85,247,0) 70%)',
              filter: 'blur(50px)',
              top: '50%',
              left: '50%',
            }}
            animate={{
              x: [-100, 100, -100],
              y: [-50, 50, -50],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Floating Particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto w-full">
          {/* Logo with Animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 100, 
              damping: 15,
              duration: 1 
            }}
            className="mb-8"
          >
            <div className="relative inline-block">
              {/* Glowing Background */}
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 20, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="absolute inset-0 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 rounded-full blur-2xl opacity-50"
                style={{ width: '100%', height: '100%' }}
              />
              
              {/* Logo Container */}
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl mx-auto">
                <motion.div
                  animate={{ 
                    y: [0, -20, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Image
                    src="https://i.imgur.com/c7EilDV.png"
                    alt="Buthpitiya M.V Logo"
                    width={224}
                    height={224}
                    className="object-cover"
                    priority
                    unoptimized
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* School Name */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6"
          >
            <span className="gradient-text">Buthpitiya M.V</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl sm:text-2xl md:text-3xl text-gray-300 mb-4"
          >
            Learning Management System
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-base sm:text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto px-4"
          >
            Empowering education through innovative digital learning solutions
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(16,185,129,0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/login')}
              className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg text-lg flex items-center justify-center gap-3"
            >
              <FaSignInAlt />
              <span>Login to LMS</span>
              <FaArrowRight />
            </motion.button>

            <motion.a
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(75,85,99,0.5)" }}
              whileTap={{ scale: 0.95 }}
              href="https://buthpitiyamv.schweb.lk"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg text-lg flex items-center justify-center gap-3"
            >
              <FaGlobe />
              <span>Main Website</span>
            </motion.a>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mt-16 px-4"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-effect p-6 rounded-2xl text-center border border-white/10 hover:border-primary/50 transition-all"
            >
              <FaUsers className="text-4xl sm:text-5xl text-primary mx-auto mb-3" />
              <p className="text-3xl sm:text-4xl font-bold text-white mb-1">{stats.students}</p>
              <p className="text-gray-300 text-sm sm:text-base">Students</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-effect p-6 rounded-2xl text-center border border-white/10 hover:border-yellow-500/50 transition-all"
            >
              <FaTrophy className="text-4xl sm:text-5xl text-yellow-400 mx-auto mb-3" />
              <p className="text-3xl sm:text-4xl font-bold text-white mb-1">{stats.teachers}</p>
              <p className="text-gray-300 text-sm sm:text-base">Teachers</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-effect p-6 rounded-2xl text-center border border-white/10 hover:border-blue-500/50 transition-all sm:col-span-2 md:col-span-1"
            >
              <FaChartLine className="text-4xl sm:text-5xl text-blue-400 mx-auto mb-3" />
              <p className="text-3xl sm:text-4xl font-bold text-white mb-1">100%</p>
              <p className="text-gray-300 text-sm sm:text-base">Digital</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        >
          <div className="text-white text-3xl sm:text-4xl opacity-50">↓</div>
        </motion.div>
      </section>

      {/* News Section */}
      {news.length > 0 && (
        <section id="news" className="py-20 px-4 relative">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Latest <span className="gradient-text">News</span>
              </h2>
              <p className="text-gray-300 text-lg sm:text-xl">Stay updated with our latest announcements</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {news.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="glass-effect overflow-hidden rounded-2xl border border-white/10 hover:border-primary/50 transition-all group"
                >
                  {item.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <motion.img
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-white font-bold text-xl mb-3 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-300 mb-4 line-clamp-3 text-sm">
                      {item.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-400 text-xs">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </p>
                      <span className="text-primary text-sm font-semibold">Read more →</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
                              }
