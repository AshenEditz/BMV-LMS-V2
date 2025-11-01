import { useRouter } from 'next/router';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaSignOutAlt, FaCrown, FaHome, FaBullhorn } from 'react-icons/fa';
import { useState, useEffect } from 'react';

export default function PrincipalLayout({ children }) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await signOut(auth);
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-blue-900">
      {/* Navigation */}
      <nav className="glass-effect border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Image 
                  src="https://i.imgur.com/c7EilDV.png" 
                  alt="Logo" 
                  width={50} 
                  height={50}
                  className="cursor-pointer"
                  onClick={() => router.push('/principal')}
                />
              </motion.div>
              <div>
                <h1 className="text-white font-bold text-lg">Buthpitiya M.V</h1>
                <p className="text-yellow-400 text-sm flex items-center gap-2">
                  <FaCrown /> Principal Portal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:block text-white text-sm">
                🕐 {currentTime.toLocaleTimeString()}
              </div>
              <div className="text-white text-sm flex items-center gap-2 bg-yellow-500/20 px-3 py-2 rounded-lg border border-yellow-500/50">
                <FaCrown className="text-yellow-400" />
                <span className="hidden md:inline">Principal</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FaSignOutAlt /> <span className="hidden md:inline">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-64px-80px)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="glass-effect border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-gray-400 text-sm">
            <p>© 2024 Buthpitiya M.V. All rights reserved.</p>
            <p className="mt-2 text-yellow-400">Principal Management System</p>
          </div>
        </div>
      </footer>
    </div>
  );
                    }
