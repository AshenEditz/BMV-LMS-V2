import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaHome, FaUser, FaSignOutAlt, FaBell, FaClock } from 'react-icons/fa';

export default function Navbar({ user, onLogout, menuItems = [] }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar transition-all duration-300 ${scrolled ? 'shadow-2xl' : ''}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo & School Name */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div className="logo-container">
              <Image
                src="https://i.imgur.com/c7EilDV.png"
                alt="Buthpitiya M.V Logo"
                width={64}
                height={64}
                className="object-cover"
                priority
              />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl md:text-2xl gradient-text">
                Buthpitiya M.V
              </h1>
              <p className="text-gray-400 text-xs md:text-sm">
                Learning Management System
              </p>
            </div>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6">
            {menuItems.map((item, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => router.push(item.href)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  router.pathname === item.href
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Time */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-white bg-white/10 px-4 py-2 rounded-xl"
            >
              <FaClock className="text-primary" />
              <span className="text-sm font-medium">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </motion.div>

            {/* User Info */}
            {user && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl border border-white/20"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{user.name}</p>
                  <p className="text-gray-400 text-xs capitalize">{user.role}</p>
                </div>
              </motion.div>
            )}

            {/* Logout Button */}
            {onLogout && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="btn-danger flex items-center gap-2"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </motion.button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white text-2xl p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/10"
          >
            <div className="px-4 py-6 space-y-3">
              {menuItems.map((item, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    router.push(item.href);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    router.pathname === item.href
                      ? 'bg-primary text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </motion.button>
              ))}

              {user && (
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{user.name}</p>
                      <p className="text-gray-400 text-sm capitalize">{user.role}</p>
                    </div>
                  </div>

                  {onLogout && (
                    <button
                      onClick={() => {
                        onLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full btn-danger flex items-center justify-center gap-2"
                    >
                      <FaSignOutAlt />
                      <span>Logout</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
            }
