import { useRouter } from 'next/router';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaHome, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { useState, useEffect } from 'react';

export default function StudentLayout({ student, children }) {
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
      {/* Navigation */}
      <nav className="glass-effect border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Image
                src="https://i.imgur.com/c7EilDV.png"
                alt="Logo"
                width={50}
                height={50}
                className="animate-float"
              />
              <div>
                <h1 className="text-white font-bold text-lg">Buthpitiya M.V</h1>
                <p className="text-gray-400 text-sm">Student Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-white text-sm hidden md:block">
                🕐 {currentTime.toLocaleTimeString()}
              </div>
              <div className="text-white text-sm">
                <FaUser className="inline mr-2" />
                {student?.name}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FaSignOutAlt /> Logout
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="glass-effect border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-gray-400 text-sm">
            <p>© 2024 Buthpitiya M.V. All rights reserved.</p>
            <p className="mt-2">
              Current Time: {currentTime.toLocaleString()} | Grade: {student?.grade}-{student?.class}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}