// PrincipalLayout.js - Similar to TeacherLayout
import { useRouter } from 'next/router';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaSignOutAlt, FaCrown } from 'react-icons/fa';
import { useState, useEffect } from 'react';

export default function PrincipalLayout({ children }) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <div className="min-h-screen">
      <nav className="glass-effect border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Image src="https://i.imgur.com/c7EilDV.png" alt="Logo" width={50} height={50} />
              <div>
                <h1 className="text-white font-bold text-lg">Buthpitiya M.V</h1>
                <p className="text-gray-400 text-sm flex items-center gap-2"><FaCrown className="text-yellow-400" /> Principal Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-white text-sm">🕐 {currentTime.toLocaleTimeString()}</div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <FaSignOutAlt /> Logout
              </motion.button>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
      <footer className="glass-effect border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-400 text-sm">
          <p>© 2024 Buthpitiya M.V. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}