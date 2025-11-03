// pages/index.js - STUNNING MODERN DESIGN
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import { 
  FaUser, FaLock, FaGraduationCap, FaChalkboardTeacher, 
  FaUsers, FaTrophy, FaBook, FaChartLine, FaArrowRight,
  FaBars, FaTimes, FaFacebook, FaTwitter, FaInstagram,
  FaYoutube, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaCheckCircle, FaStar, FaAward
} from 'react-icons/fa';

export default function Home() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({ students: 0, teachers: 0, quizzes: 0, success: 100 });
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchStats();
    // Auto-rotate hero slides
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const [studentsSnap, teachersSnap, quizzesSnap] = await Promise.all([
        getDocs(collection(db, 'students')),
        getDocs(collection(db, 'teachers')),
        getDocs(collection(db, 'quizzes'))
      ]);
      
      setStats({
        students: studentsSnap.size,
        teachers: teachersSnap.size,
        quizzes: quizzesSnap.size,
        success: 100
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ADMIN LOGIN
      if (username === 'BMVADMIN' && password === 'BMV@2009') {
        const email = 'admin@buthpitiya.lk';
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch {
          await createUserWithEmailAndPassword(auth, email, password);
        }
        toast.success('Welcome Administrator! 🎉');
        setTimeout(() => router.push('/admin'), 1000);
        return;
      }

      // MEDIA LOGIN
      if (username === 'BmvMedia' && password === 'Ashen@2009') {
        const email = 'media@buthpitiya.lk';
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch {
          await createUserWithEmailAndPassword(auth, email, password);
        }
        toast.success('Welcome Media Unit! 📱');
        setTimeout(() => router.push('/media'), 1000);
        return;
      }

      // STUDENT/TEACHER LOGIN
      let userData = null;
      let userEmail = null;

      // Check students
      const studentsQuery = query(collection(db, 'students'), where('studentId', '==', username));
      const studentsSnap = await getDocs(studentsQuery);
      
      if (!studentsSnap.empty) {
        userData = studentsSnap.docs[0].data();
        userEmail = userData.email;
        userData.role = 'student';
      }

      // Check teachers
      if (!userData) {
        const teachersQuery = query(collection(db, 'teachers'), where('teacherId', '==', username));
        const teachersSnap = await getDocs(teachersQuery);
        
        if (!teachersSnap.empty) {
          userData = teachersSnap.docs[0].data();
          userEmail = userData.email;
          userData.role = 'teacher';
        }
      }

      if (!userData) {
        toast.error('Invalid username or password ❌');
        setLoading(false);
        return;
      }

      // Firebase Auth
      try {
        await signInWithEmailAndPassword(auth, userEmail, password);
      } catch (authError) {
        if (authError.code === 'auth/user-not-found') {
          await createUserWithEmailAndPassword(auth, userEmail, password);
        } else if (authError.code === 'auth/wrong-password') {
          toast.error('Wrong password ❌');
          setLoading(false);
          return;
        } else {
          throw authError;
        }
      }
      
      toast.success(`Welcome ${userData.name}! 🎓`);
      setTimeout(() => router.push(`/${userData.role}`), 1000);

    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed ❌');
    } finally {
      setLoading(false);
    }
  };

  const heroSlides = [
    {
      title: "Welcome to Buthpitiya M.V",
      subtitle: "Excellence in Education",
      description: "නවීන තාක්ෂණික අධ්‍යාපන පද්ධතිය",
      gradient: "from-blue-600 via-purple-600 to-pink-600"
    },
    {
      title: "Interactive Learning",
      subtitle: "Quizzes & Achievements",
      description: "Earn badges, compete, and excel",
      gradient: "from-green-500 via-emerald-600 to-teal-600"
    },
    {
      title: "Student Portal",
      subtitle: "View Profiles & Achievements",
      description: "Celebrate success together",
      gradient: "from-orange-500 via-red-600 to-pink-600"
    }
  ];

  const features = [
    {
      icon: <FaGraduationCap className="text-5xl text-blue-400" />,
      title: "Student Portal",
      description: "View student profiles, achievements, and badges",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <FaChalkboardTeacher className="text-5xl text-green-400" />,
      title: "Interactive Classes",
      description: "Teachers create quizzes and award badges",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <FaTrophy className="text-5xl text-yellow-400" />,
      title: "Achievements",
      description: "Earn badges and track your progress",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <FaUsers className="text-5xl text-purple-400" />,
      title: "Community",
      description: "Group chats for students and teachers",
      color: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      <Toaster position="top-center" />
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [360, 180, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-40 glass-effect border-b border-white/10 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => router.push('/')}
            >
              <div className="relative w-12 h-12 md:w-14 md:h-14">
                <Image
                  src="https://i.imgur.com/c7EilDV.png"
                  alt="Logo"
                  fill
                  className="rounded-full border-2 border-primary shadow-lg"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl md:text-2xl font-bold text-white">
                  Buthpitiya M.V
                </h1>
                <p className="text-xs text-gray-400">Learning Management System</p>
              </div>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-300 hover:text-primary transition-colors">
                Features
              </a>
              <a href="#stats" className="text-gray-300 hover:text-primary transition-colors">
                Statistics
              </a>
              <a href="/portal" className="text-gray-300 hover:text-primary transition-colors">
                Student Portal
              </a>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLogin(true)}
                className="bg-gradient-to-r from-primary to-green-600 hover:from-green-600 hover:to-primary text-white font-bold px-6 py-2.5 rounded-full shadow-lg flex items-center gap-2"
              >
                <FaUser /> Login
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white text-2xl"
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden py-4 border-t border-white/10"
              >
                <div className="flex flex-col gap-3">
                  <a
                    href="#features"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-300 hover:text-primary transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
                  >
                    Features
                  </a>
                  <a
                    href="#stats"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-300 hover:text-primary transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
                  >
                    Statistics
                  </a>
                  <a
                    href="/portal"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-300 hover:text-primary transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
                  >
                    Student Portal
                  </a>
                  <button
                    onClick={() => {
                      setShowLogin(true);
                      setMobileMenuOpen(false);
                    }}
                    className="bg-gradient-to-r from-primary to-green-600 text-white font-bold px-4 py-3 rounded-lg flex items-center justify-center gap-2"
                  >
                    <FaUser /> Login to Portal
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Hero Section with Slider */}
      <section className="relative z-10 pt-10 md:pt-20 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <motion.div
                className={`inline-block px-6 py-2 rounded-full bg-gradient-to-r ${heroSlides[currentSlide].gradient} mb-6`}
              >
                <span className="text-white font-semibold text-sm">
                  🎓 {heroSlides[currentSlide].subtitle}
                </span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                {heroSlides[currentSlide].title}
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 mb-4">
                {heroSlides[currentSlide].description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowLogin(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-primary to-green-600 hover:from-green-600 hover:to-primary text-white font-bold px-8 py-4 rounded-full shadow-2xl flex items-center justify-center gap-3 text-lg"
                >
                  <FaUser /> Access Portal <FaArrowRight />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/portal')}
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold px-8 py-4 rounded-full border-2 border-white/30 flex items-center justify-center gap-3 text-lg"
                >
                  <FaGraduationCap /> View Students
                </motion.button>
              </div>

              {/* Slide Indicators */}
              <div className="flex justify-center gap-2 mt-10">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentSlide
                        ? 'bg-primary w-8'
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="relative z-10 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {[
              { icon: '👨‍🎓', label: 'Active Students', value: stats.students, color: 'from-blue-500 to-cyan-500' },
              { icon: '👨‍🏫', label: 'Expert Teachers', value: stats.teachers, color: 'from-green-500 to-emerald-500' },
              { icon: '📝', label: 'Total Quizzes', value: stats.quizzes, color: 'from-purple-500 to-pink-500' },
              { icon: '💯', label: 'Success Rate', value: `${stats.success}%`, color: 'from-yellow-500 to-orange-500' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="glass-effect p-6 md:p-8 rounded-2xl text-center border border-white/10 hover:border-primary/50 transition-all"
              >
                <div className="text-5xl md:text-6xl mb-4">{stat.icon}</div>
                <div className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                  {stat.value}
                </div>
                <p className="text-gray-400 text-sm md:text-base">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Platform Features 🚀
            </h2>
            <p className="text-gray-400 text-lg">
              Everything you need for modern digital education
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="glass-effect p-8 rounded-2xl border border-white/10 hover:border-primary/50 transition-all group"
              >
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="relative z-10 py-16 px-4 bg-gradient-to-r from-primary/10 to-blue-500/10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Why Choose Us? ⭐
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <FaCheckCircle />, title: 'Modern Technology', desc: 'Latest digital learning tools' },
              { icon: <FaStar />, title: 'Expert Teachers', desc: 'Qualified and experienced educators' },
              { icon: <FaAward />, title: 'Proven Results', desc: '100% student satisfaction' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-effect p-6 rounded-xl text-center"
              >
                <div className="text-4xl text-primary mb-4 flex justify-center">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-effect p-8 md:p-12 rounded-3xl text-center border-2 border-primary/30"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started? 🎓
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Join hundreds of students already learning on our platform
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLogin(true)}
              className="bg-gradient-to-r from-primary to-green-600 hover:from-green-600 hover:to-primary text-white font-bold px-10 py-4 rounded-full shadow-2xl text-lg"
            >
              Login Now <FaArrowRight className="inline ml-2" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-20 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* About */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="https://i.imgur.com/c7EilDV.png"
                  alt="Logo"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <h3 className="text-white font-bold text-lg">Buthpitiya M.V</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Excellence in Education. Empowering students through quality education and innovative learning.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <a href="/portal" className="block text-gray-400 hover:text-primary transition-colors text-sm">Student Portal</a>
                <a href="#features" className="block text-gray-400 hover:text-primary transition-colors text-sm">Features</a>
                <a href="#stats" className="block text-gray-400 hover:text-primary transition-colors text-sm">Statistics</a>
                <a href="https://buthpitiyamv.schweb.lk" target="_blank" className="block text-gray-400 hover:text-primary transition-colors text-sm">Main Website</a>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold mb-4">Contact</h4>
              <div className="space-y-3">
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  <FaMapMarkerAlt className="text-primary" /> Buthpitiya, Sri Lanka
                </p>
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  <FaPhone className="text-primary" /> +94 XX XXX XXXX
                </p>
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  <FaEnvelope className="text-primary" /> info@buthpitiyamv.lk
                </p>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="text-white font-bold mb-4">Follow Us</h4>
              <div className="flex gap-3">
                {[
                  { icon: <FaFacebook />, color: 'hover:bg-blue-600' },
                  { icon: <FaTwitter />, color: 'hover:bg-blue-400' },
                  { icon: <FaInstagram />, color: 'hover:bg-pink-600' },
                  { icon: <FaYoutube />, color: 'hover:bg-red-600' }
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    href="#"
                    className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white ${social.color} transition-all`}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Buthpitiya M.V. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Made with ❤️ for education
            </p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !loading && setShowLogin(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-effect p-8 max-w-md w-full rounded-3xl border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => !loading && setShowLogin(false)}
                disabled={loading}
                className="absolute top-4 right-4 text-white hover:text-red-500 text-2xl transition-colors disabled:opacity-50"
              >
                <FaTimes />
              </button>

              {/* Logo */}
              <div className="text-center mb-8">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 0.5 }}
                  className="w-20 h-20 mx-auto mb-4 relative"
                >
                  <Image
                    src="https://i.imgur.com/c7EilDV.png"
                    alt="Logo"
                    fill
                    className="rounded-full border-4 border-primary shadow-lg"
                  />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">Welcome Back! 👋</h2>
                <p className="text-gray-400 text-sm">Login to access your portal</p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-white font-semibold mb-2 text-sm">
                    <FaUser className="inline mr-2" /> Username / Student ID
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g., BMVS00000001"
                    disabled={loading}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-primary focus:bg-white/15 transition-all disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2 text-sm">
                    <FaLock className="inline mr-2" /> Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={loading}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-primary focus:bg-white/15 transition-all disabled:opacity-50"
                  />
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                  <p className="text-blue-400 text-xs text-center">
                    💡 Use your Student ID or Teacher ID as username
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-green-600 hover:from-green-600 hover:to-primary text-white font-bold py-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        ⏳
                      </motion.div>
                      Logging in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <FaUser /> Login to Portal
                    </span>
                  )}
                </motion.button>
              </form>

              {/* Help Text */}
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-xs">
                  Need help? Contact your administrator
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
