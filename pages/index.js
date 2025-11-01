import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaSignInAlt, FaNewspaper, FaTrophy, FaUsers } from 'react-icons/fa';

export default function Home() {
  const router = useRouter();
  const [news, setNews] = useState([]);
  const [stats, setStats] = useState({ students: 0, teachers: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch latest news
      const newsRef = collection(db, 'news');
      const newsQuery = query(newsRef, orderBy('timestamp', 'desc'), limit(6));
      const newsSnapshot = await getDocs(newsQuery);
      setNews(newsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch stats
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
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1 }}
          >
            <Image
              src="https://i.imgur.com/c7EilDV.png"
              alt="Buthpitiya M.V Logo"
              width={200}
              height={200}
              className="mx-auto mb-8 animate-float"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-6xl md:text-8xl font-bold text-white mb-4"
          >
            Buthpitiya M.V
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl md:text-3xl text-primary mb-8"
          >
            Learning Management System
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/login')}
              className="bg-primary hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-xl flex items-center justify-center gap-2"
            >
              <FaSignInAlt /> Login to LMS
            </motion.button>

            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://buthpitiyamv.schweb.lk"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 border-2 border-white text-white font-bold py-4 px-8 rounded-lg text-xl"
            >
              Main Website
            </motion.a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="grid grid-cols-2 gap-6 max-w-md mx-auto mt-12"
          >
            <div className="glass-effect p-6 rounded-lg">
              <FaUsers className="text-4xl text-primary mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{stats.students}</p>
              <p className="text-gray-300">Students</p>
            </div>
            <div className="glass-effect p-6 rounded-lg">
              <FaTrophy className="text-4xl text-primary mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{stats.teachers}</p>
              <p className="text-gray-300">Teachers</p>
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
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <FaNewspaper className="text-primary" />
              Latest News & Updates
            </h2>
            <p className="text-gray-300 text-xl">Stay informed with our latest announcements</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="glass-effect rounded-lg overflow-hidden"
              >
                {item.imageUrl && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-white font-bold text-xl mb-3">{item.title}</h3>
                  <p className="text-gray-300 mb-4 line-clamp-3">{item.description}</p>
                  <p className="text-gray-400 text-sm">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {news.length === 0 && (
            <p className="text-gray-400 text-center text-xl">No news available at the moment</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-effect border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Image
                src="https://i.imgur.com/c7EilDV.png"
                alt="Logo"
                width={60}
                height={60}
              />
            </div>
            <div className="text-center md:text-right">
              <p className="text-white font-bold text-xl mb-2">Buthpitiya M.V</p>
              <p className="text-gray-400">Excellence in Education Since 2009</p>
              <p className="text-gray-500 text-sm mt-4">© 2024 All rights reserved</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}