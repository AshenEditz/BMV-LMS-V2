// pages/index.js - UPDATED VERSION
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaUsers, FaChalkboardTeacher, FaGraduationCap, FaNewspaper, FaArrowRight } from 'react-icons/fa';

export default function Home() {
  const router = useRouter();
  const [stats, setStats] = useState({ students: 0, teachers: 0, news: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const studentsSnap = await getDocs(collection(db, 'students'));
      const teachersSnap = await getDocs(collection(db, 'teachers'));
      const newsSnap = await getDocs(collection(db, 'news'));
      setStats({
        students: studentsSnap.size,
        teachers: teachersSnap.size,
        news: newsSnap.size
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const features = [
    {
      icon: <FaGraduationCap />,
      title: 'Student Portal',
      description: 'View student profiles, achievements, and badges',
      link: '/portal',
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: <FaUsers />,
      title: 'Interactive Quizzes',
      description: 'Teachers create quizzes, students earn badges',
      link: '/login',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: <FaChalkboardTeacher />,
      title: 'Group Chats',
      description: 'Communication between students, teachers, and principal',
      link: '/login',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      icon: <FaNewspaper />,
      title: 'News & Updates',
      description: 'Latest school news and announcements',
      link: '/portal',
      color: 'from-pink-500 to-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"
        />
      </div>

      {/* Navigation */}
      <nav className="glass-effect border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 md:gap-4">
              <Image
                src="https://i.imgur.com/c7EilDV.png"
                alt="Logo"
                width={50}
                height={50}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-primary"
              />
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-white gradient-text">
                  Buthpitiya M.V
                </h1>
                <p className="text-xs md:text-sm text-gray-400">LMS Portal</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
              <a
                href="/portal"
                className="text-white hover:text-primary transition-colors px-4 py-2"
              >
                Student Portal
              </a>
              <a
                href="/login"
                className="bg-primary hover:bg-green-600 text-black font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                Login
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white text-2xl"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="md:hidden py-4 border-t border-white/10"
            >
              <div className="flex flex-col gap-3">
                <a
                  href="/portal"
                  className="text-white hover:text-primary transition-colors px-4 py-3 rounded-lg hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Student Portal
                </a>
                <a
                  href="/login"
                  className="bg-primary hover:bg-green-600 text-black font-semibold px-4 py-3 rounded-lg text-center transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 md:mb-16"
        >
          {/* School Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 md:mb-8"
          >
            <Image
              src="https://i.imgur.com/c7EilDV.png"
              alt="School Logo"
              width={128}
              height={128}
              className="w-full h-full rounded-full border-4 border-primary shadow-2xl"
            />
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 md:mb-6">
            Buthpitiya M.V
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-3 md:mb-4">
            Learning Management System
          </p>
          <p className="text-base md:text-xl text-primary font-semibold mb-8 md:mb-12">
            නවීන තාක්ෂණික අධ්‍යාපන පද්ධතිය
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto px-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/portal')}
              className="w-full sm:w-auto bg-primary hover:bg-green-600 text-black font-bold px-8 py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-colors"
            >
              <FaGraduationCap /> Student Portal
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/login')}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl border-2 border-white/20 flex items-center justify-center gap-2 transition-colors"
            >
              Access Portal <FaArrowRight />
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16">
          {[
            { icon: '👨‍🎓', label: 'Students', value: stats.students, color: 'from-blue-500 to-cyan-500' },
            { icon: '👨‍🏫', label: 'Teachers', value: stats.teachers, color: 'from-green-500 to-emerald-500' },
            { icon: '📰', label: 'News', value: stats.news, color: 'from-purple-500 to-pink-500' },
            { icon: '💯', label: 'Digital', value: '100%', color: 'from-yellow-500 to-orange-500' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="glass-effect p-6 md:p-8 rounded-xl text-center hover:border-primary transition-all"
            >
              <div className="text-4xl md:text-5xl mb-3 md:mb-4">{stat.icon}</div>
              <div className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                {stat.value}
              </div>
              <p className="text-gray-400 text-sm md:text-base">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12 md:mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8 md:mb-12">
            Platform Features 🚀
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <motion.a
                key={index}
                href={feature.link}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="glass-effect p-6 md:p-8 rounded-xl hover:border-primary transition-all group cursor-pointer"
              >
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-2xl md:text-3xl text-white mb-4 md:mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm md:text-base text-gray-400 mb-3 md:mb-4">
                  {feature.description}
                </p>
                <span className="text-primary font-semibold group-hover:gap-3 flex items-center gap-2 transition-all text-sm md:text-base">
                  Learn More <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-effect p-6 md:p-8 rounded-xl text-center"
        >
          <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">
            Quick Access
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-2xl mx-auto">
            <a
              href="https://buthpitiyamv.schweb.lk"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20 text-sm md:text-base"
            >
              🌐 Main Website
            </a>
            <a
              href="/portal"
              className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20 text-sm md:text-base"
            >
              👨‍🎓 Student Profiles
            </a>
            <a
              href="/login"
              className="px-6 py-3 rounded-lg bg-primary hover:bg-green-600 text-black font-semibold transition-colors text-sm md:text-base"
            >
              🔐 Staff Login
            </a>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-12 md:mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* School Info */}
            <div>
              <h4 className="text-white font-bold text-lg mb-3">Buthpitiya M.V</h4>
              <p className="text-gray-400 text-sm">
                Excellence in Education<br />
                Empowering students through quality education
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold text-lg mb-3">Quick Links</h4>
              <div className="space-y-2">
                <a href="/portal" className="block text-gray-400 hover:text-primary transition-colors text-sm">
                  Student Portal
                </a>
                <a href="/login" className="block text-gray-400 hover:text-primary transition-colors text-sm">
                  Staff Login
                </a>
                <a href="https://buthpitiyamv.schweb.lk" target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-primary transition-colors text-sm">
                  Main Website
                </a>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold text-lg mb-3">Contact</h4>
              <p className="text-gray-400 text-sm">
                📍 Buthpitiya, Sri Lanka<br />
                📧 info@buthpitiyamv.lk<br />
                📱 +94 XX XXX XXXX
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Buthpitiya M.V. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Made with ❤️ for education
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
    }
