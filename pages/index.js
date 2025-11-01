import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaSignInAlt, FaUsers, FaTrophy, FaChartLine, FaArrowRight } from 'react-icons/fa';
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
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, type: "spring" }}
            className="mb-8"
          >
            <div className="relative inline-block">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-2xl opacity-50"
              />
              <div className="relative w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl mx-auto">
                <Image
                  src="https://i.imgur.com/c7EilDV.png"
                  alt="Buthpitiya M.V Logo"
                  width={224}
                  height={224}
                  className="object-cover animate-float"
                  priority
                />
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6"
          >
            <span className="gradient-text">Buthpitiya M.V</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl md:text-3xl text-gray-300 mb-8"
          >
            Learning Management System
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
          >
            Empowering education through innovative digital learning solutions
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/login')}
              className="btn-primary text-xl flex items-center justify-center gap-3"
            >
              <FaSignInAlt />
              <span>Login to LMS</span>
              <FaArrowRight />
            </motion.button>

            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://buthpitiyamv.schweb.lk"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xl flex items-center justify-center gap-3"
            >
              🌐 Main Website
            </motion.a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-16"
          >
            <div className="glass-card p-6 text-center">
              <FaUsers className="text-5xl text-primary mx-auto mb-3" />
              <p className="text-4xl font-bold text-white mb-1">{stats.students}</p>
              <p className="text-gray-300">Students</p>
            </div>
            <div className="glass-card p-6 text-center">
              <FaTrophy className="text-5xl text-yellow-400 mx-auto mb-3" />
              <p className="text-4xl font-bold text-white mb-1">{stats.teachers}</p>
              <p className="text-gray-300">Teachers</p>
            </div>
            <div className="glass-card p-6 text-center col-span-2 md:col-span-1">
              <FaChartLine className="text-5xl text-blue-400 mx-auto mb-3" />
              <p className="text-4xl font-bold text-white mb-1">100%</p>
              <p className="text-gray-300">Digital</p>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="text-white text-4xl">↓</div>
        </motion.div>
      </section>

      {/* News Section */}
      {news.length > 0 && (
        <section className="py-20 px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-5xl font-bold text-white mb-4">
                Latest <span className="gradient-text">News</span>
              </h2>
              <p className="text-gray-300 text-xl">Stay updated with our latest announcements</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card overflow-hidden group"
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
                    <p className="text-gray-300 mb-4 line-clamp-3">{item.description}</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
    }
