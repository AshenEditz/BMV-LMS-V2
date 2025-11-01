import { useRouter } from 'next/router';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaSignOutAlt, FaUser, FaHome, FaClipboardList, FaMedal, FaUsers } from 'react-icons/fa';
import { useState, useEffect } from 'react';

export default function TeacherLayout({ teacher, children }) {
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900">
      {/* Navigation */}
      <nav className="glass-effect border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Title */}
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
                  onClick={() => router.push('/teacher')}
                />
              </motion.div>
              <div>
                <h1 className="text-white font-bold text-lg">Buthpitiya M.V</h1>
                <p className="text-gray-400 text-sm">Teacher Portal 👨‍🏫</p>
              </div>
            </div>

            {/* Center Menu */}
            <div className="hidden md:flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/teacher')}
                className="text-white hover:text-primary flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <FaHome /> Dashboard
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/teacher/students')}
                className="text-white hover:text-primary flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <FaUsers /> Students
              </motion.button>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-white text-sm">
                🕐 {currentTime.toLocaleTimeString()}
              </div>
              <div className="text-white text-sm flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                <FaUser className="text-primary" />
                <span className="hidden md:inline">{teacher?.name}</span>
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
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2024 Buthpitiya M.V. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a
                href="https://buthpitiyamv.schweb.lk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-green-400 text-sm"
              >
                Main Website
              </a>
              <span className="text-gray-600">|</span>
              <p className="text-gray-500 text-sm">Teacher ID: {teacher?.teacherId}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
                    }
